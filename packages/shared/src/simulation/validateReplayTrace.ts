import type { RaceResult, ReplayTracePoint } from "../domain/race.js";

export function validateReplayTrace(result: RaceResult, trace = result.replayTrace ?? []) {
  const errors: string[] = [];
  if (trace.length < 2) return ["trace must contain at least two points"];
  if (trace[0]?.progress !== 0) errors.push("trace must start at progress 0");
  if (trace.at(-1)?.progress !== 1) errors.push("trace must end at progress 1");
  if (trace.at(-1)?.order.join("|") !== result.classification.map((entry) => entry.teamId).join("|")) errors.push("final trace order must match classification");

  const teamIds = result.classification.map((entry) => entry.teamId);
  const pitPhases = new Map<string, string[]>();

  for (let index = 1; index < trace.length; index += 1) {
    const previous = trace[index - 1]!;
    const point = trace[index]!;
    if (point.progress <= previous.progress) errors.push(`trace progress must increase at point ${index}`);

    for (const teamId of teamIds) {
      const previousCar = previous.cars?.[teamId];
      const car = point.cars?.[teamId];
      if (!car) {
        errors.push(`missing car trace for ${teamId} at point ${index}`);
        continue;
      }

      if (car.trackProgress < 0 || car.trackProgress > 1) errors.push(`car progress out of bounds for ${teamId} at point ${index}`);
      if (car.speed < 0 || car.speed > 1.2) errors.push(`car speed out of bounds for ${teamId} at point ${index}`);
      if (previousCar && car.trackProgress + 0.0001 < previousCar.trackProgress) errors.push(`car progress goes backwards for ${teamId} at point ${index}`);
      if (previousCar && car.trackProgress - previousCar.trackProgress > 0.09) errors.push(`car progress jumps too far for ${teamId} at point ${index}`);

      if (car.phase.startsWith("pit")) pitPhases.set(teamId, [...(pitPhases.get(teamId) ?? []), car.phase]);
    }
  }

  for (const event of result.events.filter((candidate) => candidate.type === "pit_stop")) {
    const phases = pitPhases.get(event.teamId) ?? [];
    const entry = phases.indexOf("pit_entry");
    const stop = phases.indexOf("pit_stop");
    const exit = phases.indexOf("pit_exit");
    if (entry < 0 || stop < entry || exit < stop) errors.push(`pit phases missing or out of order for ${event.teamId}`);
  }

  return errors;
}
