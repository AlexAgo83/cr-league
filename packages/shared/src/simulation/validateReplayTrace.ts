import type { RaceResult } from "../domain/race.js";

export function validateReplayTrace(result: RaceResult, trace = result.replayTrace ?? []) {
  const errors: string[] = [];
  if (trace.length < 2) return ["trace must contain at least two points"];
  if (trace[0]?.progress !== 0) errors.push("trace must start at progress 0");
  if (trace.at(-1)?.progress !== 1) errors.push("trace must end at progress 1");
  if (trace.at(-1)?.order.join("|") !== result.classification.map((entry) => entry.teamId).join("|")) errors.push("final trace order must match classification");

  const teamIds = result.classification.map((entry) => entry.teamId);
  const final = trace.at(-1);
  if (final) {
    const finalTimes = result.classification.map((entry) => final.times[entry.teamId] ?? Number.NaN);
    const leaderTime = finalTimes[0] ?? Number.NaN;
    for (const [index, time] of finalTimes.entries()) {
      const entry = result.classification[index];
      if (!entry || !Number.isFinite(time) || time <= 0) errors.push(`final time missing for ${entry?.teamId ?? index}`);
      if (index > 0 && time + 0.0001 < (finalTimes[index - 1] ?? 0)) errors.push(`final times must follow classification order for ${entry?.teamId ?? index}`);
      const gap = final.gaps[entry?.teamId ?? ""];
      if (Number.isFinite(leaderTime) && (gap === undefined || Math.abs(gap - Math.max(0, time - leaderTime)) > 0.11)) errors.push(`final gap does not match finish time for ${entry?.teamId ?? index}`);
    }
  }
  const pitPhases = new Map<string, string[]>();
  const carPhases = new Map<string, Array<{ progress: number; phase: string }>>();
  const overtakePhases = new Map<string, Array<{ progress: number; phase: string }>>();

  for (let index = 1; index < trace.length; index += 1) {
    const previous = trace[index - 1]!;
    const point = trace[index]!;
    if (point.progress <= previous.progress) errors.push(`trace progress must increase at point ${index}`);
    if (point.distanceMeters !== undefined && previous.distanceMeters !== undefined && point.distanceMeters + 0.0001 < previous.distanceMeters) errors.push(`trace distance must increase at point ${index}`);

    for (const teamId of teamIds) {
      const previousCar = previous.cars?.[teamId];
      const car = point.cars?.[teamId];
      if (!car) {
        errors.push(`missing car trace for ${teamId} at point ${index}`);
        continue;
      }

      const minCarProgress = car.phase === "grid" ? -0.25 : 0;
      if (car.trackProgress < minCarProgress || car.trackProgress > 1) errors.push(`car progress out of bounds for ${teamId} at point ${index}`);
      if (car.distanceMeters !== undefined && car.distanceMeters < minCarProgress * 8000) errors.push(`car distance out of bounds for ${teamId} at point ${index}`);
      if (car.speed < 0 || car.speed > 1.2) errors.push(`car speed out of bounds for ${teamId} at point ${index}`);
      const boundaryMove = previousCar?.phase === "grid" || car.phase === "finished";
      if (previousCar && !boundaryMove && car.trackProgress + 0.0001 < previousCar.trackProgress) errors.push(`car progress goes backwards for ${teamId} at point ${index}`);
      if (previousCar && !boundaryMove && car.trackProgress - previousCar.trackProgress > 0.035) errors.push(`car progress jumps too far for ${teamId} at point ${index}`);
      if (previousCar && previousCar.phase !== "grid" && car.phase !== "finished" && Math.abs(car.speed - previousCar.speed) > 0.8) errors.push(`car speed changes too abruptly for ${teamId} at point ${index}`);
      if (car.phase === "defending") {
        const orderIndex = point.order.indexOf(teamId);
        const behind = orderIndex >= 0 ? point.cars?.[point.order[orderIndex + 1] ?? ""] : undefined;
        if (!behind || behind.phase.startsWith("pit") || car.trackProgress < behind.trackProgress || car.trackProgress - behind.trackProgress > 0.02) {
          errors.push(`defense marker lacks nearby traffic for ${teamId} at point ${index}`);
        }
        if (car.speed > 1) errors.push(`defense marker speed too high for ${teamId} at point ${index}`);
      }

      carPhases.set(teamId, [...(carPhases.get(teamId) ?? []), { progress: point.progress, phase: car.phase }]);
      if (car.phase.startsWith("pit")) pitPhases.set(teamId, [...(pitPhases.get(teamId) ?? []), car.phase]);
      if (car.phase.startsWith("overtake")) overtakePhases.set(teamId, [...(overtakePhases.get(teamId) ?? []), { progress: point.progress, phase: car.phase }]);
    }
  }

  for (const event of result.events) {
    if (typeof event.traceProgress !== "number" || event.traceProgress < 0 || event.traceProgress > 1) errors.push(`event trace progress missing for ${event.id || event.order}`);
  }

  for (const event of result.events.filter((candidate) => candidate.type === "pit_stop")) {
    const phases = pitPhases.get(event.teamId) ?? [];
    const entry = phases.indexOf("pit_entry");
    const stop = phases.indexOf("pit_stop");
    const exit = phases.indexOf("pit_exit");
    if (entry < 0 || stop < entry || exit < stop) errors.push(`pit phases missing or out of order for ${event.teamId}`);
    if (typeof event.traceProgress !== "number" || event.traceProgress < 0 || event.traceProgress > 1) {
      errors.push(`pit event trace progress missing for ${event.teamId}`);
    } else if (!(carPhases.get(event.teamId) ?? []).some((phase) => phase.phase === "pit_stop" && Math.abs(phase.progress - event.traceProgress!) <= 0.04)) {
      errors.push(`pit event trace progress does not match stop phase for ${event.teamId}`);
    }
  }

  for (const change of result.replayFacts?.orderChanges ?? []) {
    if (!hasNearbyOrderTransition(trace, change.progress, change.overtakingTeamId, change.overtakenTeamId)) {
      errors.push(`order change fact does not match trace order at ${change.progress.toFixed(2)}`);
    }
    const pitRelated = [change.overtakingTeamId, change.overtakenTeamId].some((teamId) =>
      (carPhases.get(teamId) ?? []).some((phase) => phase.phase.startsWith("pit") && Math.abs(phase.progress - change.progress) <= 0.06)
    );
    if (pitRelated) continue;
    const phases = overtakePhases.get(change.overtakingTeamId) ?? [];
    const nearby = phases.filter((phase) => Math.abs(phase.progress - change.progress) <= 0.06).map((phase) => phase.phase);
    if (!nearby.some((phase) => phase === "overtake_overlap" || phase === "overtake_pass")) errors.push(`overtake phases missing near ${change.overtakingTeamId} at ${change.progress.toFixed(2)}`);
  }

  return errors;
}

function hasNearbyOrderTransition(trace: RaceResult["replayTrace"], progress: number, overtakingTeamId: string, overtakenTeamId: string) {
  if (!trace?.length) return false;
  const pointIndex = trace.findIndex((point) => Math.abs(point.progress - progress) <= 0.005);
  const center = pointIndex >= 0 ? pointIndex : trace.findIndex((point) => point.progress >= progress);
  if (center < 0) return false;
  for (let before = Math.max(0, center - 4); before < center; before += 1) {
    for (let after = center; after <= Math.min(trace.length - 1, center + 1); after += 1) {
      const previousOrder = trace[before]!.order;
      const order = trace[after]!.order;
      if (
        previousOrder.indexOf(overtakingTeamId) > previousOrder.indexOf(overtakenTeamId) &&
        order.indexOf(overtakingTeamId) < order.indexOf(overtakenTeamId)
      ) return true;
    }
  }
  return false;
}
