import { RACE_SEGMENTS, type RaceResult, type RaceSegment, type ReplayOrderChangeFact, type ReplayTracePoint, type TrackSpeedProfile } from "@cr-league/shared";
import type { RaceEvent, Translator } from "../../app/helpers.js";
import type { CityCircuit } from "../../app/circuits.js";
export { displayLapAtProgress } from "../../app/lapDisplay.js";

const EMPTY_TRACE_POINT: ReplayTracePoint = { segment: "start", lap: 1, progress: 0, order: [], times: {}, gaps: {} };
export const START_HOLD_SECONDS = 1;
export const FINISH_HOLD_SECONDS = 1;
export const REPLAY_SPEED_KEY = "cr-league-replay-speed";
export const REPLAY_FOCUS_KEY = "cr-league-replay-focus";
export const DISMISSED_REPLAY_HELP_KEY = "cr-league-dismissed-replay-help";
const REFERENCE_REPLAY_DISTANCE_METERS = 9_000;
const POSITION_CHANGE_MARGIN_LAPS = 0.015;
const TRACE_ORDER_GAP_LAPS = 0.035;
const MIN_RANK_TRANSITION_PROGRESS = 0.08;
const MAX_VISUAL_PROGRESS_PER_SECOND = 0.36;
export const MOMENT_NOTIFICATION_SECONDS = 3;
export type ReplayBeatPhase = "setup" | "close_gap" | "overlap" | "swap" | "settle";
export type ReplayOvertakeBeat = ReplayOrderChangeFact & {
  kind: "overtake";
  phases: Array<{ phase: ReplayBeatPhase; from: number; to: number }>;
};
export type ReplayPlan = {
  source: "facts" | "trace" | "fallback";
  overtakes: ReplayOvertakeBeat[];
};

function tracePointAt(trace: ReplayTracePoint[], progress: number) {
  return [...trace].reverse().find((point) => point.progress <= progress) ?? trace[0] ?? EMPTY_TRACE_POINT;
}

export function replayOrderAtProgress(result: RaceResult, trace: ReplayTracePoint[], progress: number) {
  const order = tracePointAt(trace, progress).order;
  return order.length ? order : result.classification.map((entry) => entry.teamId);
}

export function traceGapsAt(trace: ReplayTracePoint[], progress: number) {
  const from = tracePointAt(trace, progress);
  const to = trace.find((point) => point.progress > progress) ?? from;
  const span = to.progress - from.progress || 1;
  const ratio = Math.min(1, Math.max(0, (progress - from.progress) / span));
  return Object.fromEntries(
    Object.keys({ ...from.gaps, ...to.gaps }).map((teamId) => [
      teamId,
      (from.gaps[teamId] ?? 0) + ((to.gaps[teamId] ?? 0) - (from.gaps[teamId] ?? 0)) * ratio
    ])
  );
}

export function traceTimesAt(trace: ReplayTracePoint[], progress: number) {
  const from = tracePointAt(trace, progress);
  const to = trace.find((point) => point.progress > progress) ?? from;
  const span = to.progress - from.progress || 1;
  const ratio = Math.min(1, Math.max(0, (progress - from.progress) / span));
  return Object.fromEntries(
    Object.keys({ ...from.times, ...to.times }).map((teamId) => [
      teamId,
      (from.times[teamId] ?? 0) + ((to.times[teamId] ?? 0) - (from.times[teamId] ?? 0)) * ratio
    ])
  );
}

function traceCarProgressAt(trace: ReplayTracePoint[], progress: number, laps: number, speedProfile?: TrackSpeedProfile) {
  const from = tracePointAt(trace, progress);
  const to = trace.find((point) => point.progress > progress) ?? from;
  if (!from.cars || !to.cars) return null;
  const span = to.progress - from.progress || 1;
  const ratio = Math.min(1, Math.max(0, (progress - from.progress) / span));
  return Object.fromEntries(
    Object.keys({ ...from.cars, ...to.cars }).map((teamId) => {
      const fromCar = from.cars?.[teamId];
      const toCar = to.cars?.[teamId];
      const fromProgress = visualCarProgress(fromCar, toCar?.trackProgress ?? 0, laps, speedProfile);
      const toProgress = visualCarProgress(toCar, fromCar?.trackProgress ?? 0, laps, speedProfile);
      return [teamId, fromProgress + (toProgress - fromProgress) * ratio];
    })
  );
}

function visualCarProgress(car: NonNullable<ReplayTracePoint["cars"]>[string] | undefined, fallback: number, laps: number, speedProfile?: TrackSpeedProfile) {
  const progress = car?.trackProgress ?? fallback;
  const raceProgress = car?.phase === "grid" && progress < 0 ? progress : progress * laps;
  return car?.phase?.startsWith("pit") ? raceProgress : applyTrackSpeedProfile(raceProgress, speedProfile);
}

export function buildReplayPlan(result: RaceResult, _trace: ReplayTracePoint[]): ReplayPlan {
  const factChanges = result.replayFacts?.orderChanges ?? [];
  return {
    source: factChanges.length ? "facts" : "fallback",
    overtakes: factChanges.map((change) => ({
      ...change,
      kind: "overtake",
      phases: replayBeatPhases(change.progress)
    }))
  };
}

export function replayPlanDebugLines(plan: ReplayPlan) {
  return plan.overtakes.map(
    (beat) =>
      `${beat.progress.toFixed(3)} L${beat.lap} ${beat.overtakingTeamId}->${beat.overtakenTeamId} P${beat.fromPosition}->P${beat.toPosition}${beat.zoneLabel ? ` @ ${trackZoneDisplayLabel(beat.zoneLabel)}` : ""} ${beat.phases.map((phase) => phase.phase).join("/")}`
  );
}

export function trackZoneDisplayLabel(label?: string) {
  return label ? label.replace(/^sector_/, "").replaceAll("_", " ") : "";
}

function replayBeatPhases(progress: number) {
  const start = Math.max(0, progress - MIN_RANK_TRANSITION_PROGRESS * 0.45);
  const end = Math.min(1, start + MIN_RANK_TRANSITION_PROGRESS);
  const span = end - start || MIN_RANK_TRANSITION_PROGRESS;
  const at = (from: number, to: number) => ({ from: start + span * from, to: start + span * to });
  return [
    { phase: "setup" as const, ...at(0, 0.18) },
    { phase: "close_gap" as const, ...at(0.18, 0.42) },
    { phase: "overlap" as const, ...at(0.42, 0.62) },
    { phase: "swap" as const, ...at(0.62, 0.76) },
    { phase: "settle" as const, ...at(0.76, 1) }
  ];
}

function traceRankTargetsAt(trace: ReplayTracePoint[], progress: number, plan?: ReplayPlan) {
  const transition = trace.slice(1).map((point, index) => ({ from: trace[index]!, to: point })).find(({ from, to }) => {
    const span = Math.max(to.progress - from.progress, MIN_RANK_TRANSITION_PROGRESS);
    return !sameOrder(from.order, to.order) && progress >= from.progress && progress < Math.min(1, from.progress + span);
  });
  const staged = plan?.overtakes.find((beat) => progress >= beat.phases[0]!.from && progress < beat.phases.at(-1)!.to);
  const from = transition?.from ?? tracePointAt(trace, progress);
  const to = transition?.to ?? from;
  const fromProgress = staged?.phases[0]?.from ?? from.progress;
  const toProgress = staged?.phases.at(-1)?.to ?? (transition ? Math.max(to.progress, from.progress + MIN_RANK_TRANSITION_PROGRESS) : from.progress + 1);
  const ratio = Math.min(1, Math.max(0, (progress - fromProgress) / (toProgress - fromProgress || 1)));
  const eased = ratio * ratio * (3 - 2 * ratio);
  return Object.fromEntries(
    Array.from(new Set([...from.order, ...to.order])).map((teamId) => {
      const fromRank = Math.max(0, from.order.indexOf(teamId));
      const toRank = Math.max(0, to.order.indexOf(teamId));
      return [teamId, fromRank + (toRank - fromRank) * eased];
    })
  );
}

function sameOrder(left: string[], right: string[]) {
  return left.length === right.length && left.every((teamId, index) => teamId === right[index]);
}

export function pitLapProgress(circuit: CityCircuit) {
  return circuit.pitLaneProgress;
}

export function pitStopRaceProgress(event: RaceEvent, maxLap: number, laps: number, lapProgress: number) {
  const baseProgress = event.lap / Math.max(1, maxLap);
  const lapIndex = Math.min(Math.max(1, laps) - 1, Math.max(0, Math.ceil(baseProgress * Math.max(1, laps)) - 1));
  return (lapIndex + lapProgress) / Math.max(1, laps);
}

export function segmentAtProgress(progress: number): RaceSegment {
  const index = Math.min(RACE_SEGMENTS.length - 1, Math.floor(Math.max(0, Math.min(1, progress)) * RACE_SEGMENTS.length));
  return RACE_SEGMENTS[index] ?? "start";
}

export function finishTimes(result: RaceResult, trace: ReplayTracePoint[]) {
  const final = trace.at(-1);
  const leaderTime = Math.min(...result.classification.map((entry) => final?.times[entry.teamId] ?? Number.POSITIVE_INFINITY));
  const hasTraceTimes = Number.isFinite(leaderTime) && leaderTime > 0;
  const fallbackLeader = hasTraceTimes ? leaderTime : 14;
  const times = Object.fromEntries(
    result.classification.map((entry) => {
      const finalTime = final?.times[entry.teamId];
      return [entry.teamId, hasTraceTimes && finalTime && finalTime > 0 ? finalTime : fallbackLeader + (final?.gaps[entry.teamId] ?? entry.position - 1)];
    })
  );
  return {
    leader: Math.min(...Object.values(times)),
    last: Math.max(...Object.values(times)),
    times
  };
}

export function replayDistanceScale(circuit: CityCircuit) {
  return (circuit.routeLengthMeters * circuit.laps) / REFERENCE_REPLAY_DISTANCE_METERS;
}

export function circuitLengthMeters(circuit: Pick<CityCircuit, "route">) {
  return circuit.route.slice(0, -1).reduce((sum, point, index) => {
    const next = circuit.route[index + 1]!;
    const metersPerLng = 111_320 * Math.cos((((point.lat + next.lat) / 2) * Math.PI) / 180);
    return sum + Math.hypot((point.lng - next.lng) * metersPerLng, (point.lat - next.lat) * 111_320);
  }, 0);
}

export function scaleFinishTimes(times: ReturnType<typeof finishTimes>, scale: number) {
  return {
    leader: times.leader * scale,
    last: times.last * scale,
    times: Object.fromEntries(Object.entries(times.times).map(([teamId, time]) => [teamId, time * scale]))
  };
}

export function liveClassificationByCarProgress(
  result: RaceResult,
  trace: ReplayTracePoint[],
  progress: number,
  carProgress: Record<string, number>,
  currentOrder: string[] = []
): RaceResult["classification"] {
  if (progress >= 1) return result.classification;
  const traceOrder = tracePointAt(trace, progress).order;
  const stableOrder = new Map((currentOrder.length ? currentOrder : traceOrder).map((teamId, index) => [teamId, index]));
  const positionChangeMargin = shouldSmoothReplayTrace(trace) ? POSITION_CHANGE_MARGIN_LAPS : 0;
  return [...result.classification].sort((left, right) => {
    const progressDiff = (carProgress[right.teamId] ?? 0) - (carProgress[left.teamId] ?? 0);
    return Math.abs(progressDiff) > positionChangeMargin
      ? progressDiff
      : (stableOrder.get(left.teamId) ?? 999) - (stableOrder.get(right.teamId) ?? 999) || left.position - right.position;
  });
}

export function positionDeltas(currentOrder: string[], nextOrder: string[]) {
  return Object.fromEntries(
    nextOrder.flatMap((teamId, nextIndex) => {
      const currentIndex = currentOrder.indexOf(teamId);
      const delta = currentIndex - nextIndex;
      return currentIndex >= 0 && delta ? [[teamId, delta]] : [];
    })
  );
}

export function carProgressAtTrace(result: RaceResult, trace: ReplayTracePoint[], progress: number, laps: number, plan?: ReplayPlan, speedProfile?: TrackSpeedProfile) {
  const carProgress = traceCarProgressAt(trace, progress, laps, speedProfile);
  if (carProgress) return carProgress;

  const gaps = traceGapsAt(trace, progress);
  const times = traceTimesAt(trace, progress);
  const rankTargets = traceRankTargetsAt(trace, progress, plan);
  const final = trace.at(-1);
  const finalTimes = final?.times ?? {};
  const hasFinalTimes = (final?.progress ?? 0) >= 1;
  const totalTime = Math.max(1, ...Object.values(finalTimes));
  return Object.fromEntries(
    result.classification.map((entry) => {
      const absoluteDelay = hasFinalTimes ? Math.max(0, (times[entry.teamId] ?? 0) - (finalTimes[entry.teamId] ?? totalTime) * progress) : 0;
      const timeGap = (Math.max(gaps[entry.teamId] ?? 0, absoluteDelay) / totalTime) * laps;
      const orderGap = (rankTargets[entry.teamId] ?? 0) * TRACE_ORDER_GAP_LAPS;
      const raceLaps = progress * laps - Math.max(timeGap, orderGap);
      return [entry.teamId, applyTrackSpeedProfile(Math.max(0, raceLaps), speedProfile)];
    })
  );
}

export function applyTrackSpeedProfile(progressLaps: number, speedProfile: TrackSpeedProfile = []) {
  if (!speedProfile.length || progressLaps <= 0) return progressLaps;
  const completedLaps = Math.floor(progressLaps);
  const lapProgress = progressLaps - completedLaps;
  if (lapProgress <= 0) return progressLaps;
  return completedLaps + mappedLapProgress(lapProgress, speedProfile);
}

export function pitStopTraceProgress(_result: RaceResult, _trace: ReplayTracePoint[], event: RaceEvent, maxLap: number, laps: number, lapProgress: number, _plan?: ReplayPlan) {
  return typeof event.traceProgress === "number" ? event.traceProgress : pitStopRaceProgress(event, maxLap, laps, lapProgress);
}

export function eventTraceProgress(event: RaceEvent, maxLap: number) {
  return typeof event.traceProgress === "number" ? event.traceProgress : event.lap / maxLap;
}

export function shouldSmoothReplayTrace(trace: ReplayTracePoint[]) {
  return !trace.length || !trace.every((point) => point.cars);
}

export function playerReplayContext(result: RaceResult, trace: ReplayTracePoint[], progress: number, playerTeamId?: string) {
  if (!playerTeamId) return null;
  const order = tracePointAt(trace, progress).order.length ? tracePointAt(trace, progress).order : result.classification.map((entry) => entry.teamId);
  const startOrder = trace[0]?.order.length ? trace[0].order : order;
  const gaps = traceGapsAt(trace, progress);
  const index = order.indexOf(playerTeamId);
  if (index < 0) return null;
  const startIndex = Math.max(0, startOrder.indexOf(playerTeamId));
  const aheadId = order[index - 1];
  const behindId = order[index + 1];
  return {
    position: index + 1,
    delta: startIndex - index,
    gapAhead: aheadId ? Math.max(0, (gaps[playerTeamId] ?? 0) - (gaps[aheadId] ?? 0)) : undefined,
    gapBehind: behindId ? Math.max(0, (gaps[behindId] ?? 0) - (gaps[playerTeamId] ?? 0)) : undefined,
    aheadId,
    behindId
  };
}

export function replayPlayerGapItems(context: { gapAhead?: number; gapBehind?: number } | null, tt: Translator) {
  if (!context) return [];
  return [
    context.gapAhead === undefined ? null : { label: tt("replay_player_ahead"), value: `${context.gapAhead.toFixed(1)}s` },
    context.gapBehind === undefined ? null : { label: tt("replay_player_behind"), value: `${context.gapBehind.toFixed(1)}s` }
  ].filter((item): item is { label: string; value: string } => Boolean(item));
}

export function replaySnapshot(
  result: RaceResult,
  trace: ReplayTracePoint[],
  replayTimes: ReturnType<typeof scaleFinishTimes>,
  raceTime: number,
  progress: number,
  laps: number,
  plan?: ReplayPlan,
  currentOrder: string[] = [],
  speedProfile?: TrackSpeedProfile
) {
  const baseProgress = progress >= 1 ? carProgressAtRaceTime(result, replayTimes.times, raceTime, laps) : carProgressAtTrace(result, trace, progress, laps, plan, speedProfile);
  const tower = liveClassificationByCarProgress(result, trace, progress, baseProgress, currentOrder);
  return { carProgress: baseProgress, tower };
}

export function smoothCarProgress(current: Record<string, number>, target: Record<string, number>, elapsedSeconds = 1 / 60) {
  const maxStep = Math.max(0.001, Math.min(0.03, elapsedSeconds * MAX_VISUAL_PROGRESS_PER_SECOND));
  return Object.fromEntries(
    Object.keys({ ...current, ...target }).map((teamId) => {
      const to = target[teamId] ?? 0;
      const from = current[teamId] ?? to;
      if (to < from) return [teamId, from];
      const delta = to - from;
      if (Math.abs(delta) <= maxStep) return [teamId, to];
      return [teamId, from + Math.sign(delta) * maxStep];
    })
  );
}

export function carProgressAtRaceTime(result: RaceResult, times: Record<string, number>, raceTime: number, laps: number) {
  return Object.fromEntries(
    result.classification.map((entry) => {
      const finishTime = Math.max(1, times[entry.teamId] ?? 1);
      return [entry.teamId, Math.min(laps, Math.max(0, (raceTime / finishTime) * laps))];
    })
  );
}

function mappedLapProgress(progress: number, speedProfile: TrackSpeedProfile) {
  const total = integratedSpeed(1, speedProfile);
  if (total <= 0) return progress;
  return Math.min(1, Math.max(0, integratedSpeed(progress, speedProfile) / total));
}

function integratedSpeed(to: number, speedProfile: TrackSpeedProfile) {
  const end = Math.min(1, Math.max(0, to));
  const cuts = [...new Set([0, end, ...speedProfile.flatMap((span) => expandedSpan(span).flatMap((range) => [Math.min(end, range.start), Math.min(end, range.end)]))])]
    .filter((point) => point >= 0 && point <= end)
    .sort((left, right) => left - right);
  return cuts.slice(0, -1).reduce((sum, start, index) => {
    const finish = cuts[index + 1]!;
    const midpoint = (start + finish) / 2;
    return sum + (finish - start) * speedFactorAt(midpoint, speedProfile);
  }, 0);
}

function speedFactorAt(progress: number, speedProfile: TrackSpeedProfile) {
  const matches = speedProfile.filter((span) => progressInSpan(progress, span));
  if (!matches.length) return 1;
  return matches.some((span) => span.factor < 1) ? Math.min(...matches.map((span) => span.factor)) : Math.max(...matches.map((span) => span.factor));
}

function progressInSpan(progress: number, span: TrackSpeedProfile[number]) {
  return span.startProgress <= span.endProgress
    ? progress >= span.startProgress && progress <= span.endProgress
    : progress >= span.startProgress || progress <= span.endProgress;
}

function expandedSpan(span: TrackSpeedProfile[number]) {
  return span.startProgress <= span.endProgress
    ? [{ start: span.startProgress, end: span.endProgress }]
    : [
        { start: 0, end: span.endProgress },
        { start: span.startProgress, end: 1 }
      ];
}
