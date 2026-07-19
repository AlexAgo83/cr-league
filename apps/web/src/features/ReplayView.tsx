import { RACE_SEGMENTS, type RaceResult, type RaceSegment, type ReplayOrderChangeFact, type ReplayTracePoint, type TeamLivery, type Weather } from "@cr-league/shared";
import { type CSSProperties, type ReactNode, useEffect, useId, useRef, useState } from "react";
import type { TranslationKey } from "../i18n/index.js";
import type { CityCircuit } from "../app/circuits.js";
import { eventReplayText, teamNamesFromResult, type Translator } from "../app/helpers.js";
import type { RaceEvent } from "../app/helpers.js";
import { CircuitMap, MapTraitsPanel, circuitDisplayLength, circuitRouteAnalysis, type MapCar, type MapTraitImpacts, type MapTraitStats } from "./CircuitMap.js";
import { CountryBadge, VisualIcon, type VisualIconName } from "./VisualIcon.js";
const EMPTY_TRACE_POINT: ReplayTracePoint = { segment: "start", lap: 1, progress: 0, order: [], times: {}, gaps: {} };
const START_HOLD_SECONDS = 1;
const FINISH_HOLD_SECONDS = 1;
export const REPLAY_SPEED_KEY = "cr-league-replay-speed";
export const REPLAY_FOCUS_KEY = "cr-league-replay-focus";
export const DISMISSED_REPLAY_HELP_KEY = "cr-league-dismissed-replay-help";
const REPLAY_SPEEDS = [0.5, 1, 2, 4] as const;
const REFERENCE_REPLAY_DISTANCE_PIXELS = 9_000;
const POSITION_CHANGE_MARGIN_LAPS = 0.015;
const TRACE_ORDER_GAP_LAPS = 0.035;
const MIN_RANK_TRANSITION_PROGRESS = 0.08;
const MAX_VISUAL_PROGRESS_PER_SECOND = 0.36;
const MOMENT_NOTIFICATION_SECONDS = 3;
const GRID_START_PROGRESS = 0.1;
const HEX_COLOR = /^#[0-9a-f]{6}$/i;
type ReplayTowerEntry = { id?: string; teamId: string; teamName: string; value: string };
type ReplaySpeed = (typeof REPLAY_SPEEDS)[number];
export type ReplayDirectorBeat = {
  id: string;
  type: "grid_start" | "overtake" | "player" | "pack" | "weather" | "pit_stop" | "final" | "qualifying_start" | "qualifying_pace" | "qualifying_final";
  progress: number;
  lap: number;
  teamId?: string;
  relatedTeamId?: string;
  fromPosition?: number;
  toPosition?: number;
  weather?: Weather;
  gapSeconds?: number;
};
export type ReplayBeatPhase = "setup" | "close_gap" | "overlap" | "swap" | "settle";
export type ReplayOvertakeBeat = ReplayOrderChangeFact & {
  kind: "overtake";
  phases: Array<{ phase: ReplayBeatPhase; from: number; to: number }>;
};
export type ReplayPlan = {
  source: "facts" | "trace" | "fallback";
  overtakes: ReplayOvertakeBeat[];
};

function savedReplaySpeed(): ReplaySpeed {
  const saved = Number(localStorage.getItem(REPLAY_SPEED_KEY));
  return REPLAY_SPEEDS.includes(saved as ReplaySpeed) ? (saved as ReplaySpeed) : 1;
}

function safeHex(value: string | undefined, fallback: string) {
  return value && HEX_COLOR.test(value) ? value : fallback;
}

function ReplaySpeedMenu({ speed, setSpeed, tt }: { speed: ReplaySpeed; setSpeed: (speed: ReplaySpeed) => void; tt: Translator }) {
  const [open, setOpen] = useState(false);
  const listId = useId();

  return (
    <div className="replay-speed-menu" onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setOpen(false)}>
      <button
        type="button"
        className={open ? "replay-speed-trigger active" : "replay-speed-trigger"}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${tt("replay_speed")} ×${speed}`}
        onClick={() => setOpen((current) => !current)}
      >
        ×{speed}
      </button>
      {open ? (
        <div id={listId} className="replay-speed-options" role="listbox" aria-label={tt("replay_speed")}>
          {REPLAY_SPEEDS.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={option === speed}
              className={option === speed ? "selected" : undefined}
              onClick={() => {
                setSpeed(option);
                setOpen(false);
              }}
            >
              ×{option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function clampStat(value: number) {
  return Math.max(1, Math.min(99, Math.round(value)));
}

function liveTraits(base: MapTraitStats, weather: Weather, lap: number): MapTraitStats {
  const rainGrip = weather === "heavy_rain" ? -12 : weather === "light_rain" ? -5 : 0;
  const lateRace = Math.max(0, lap - 1);
  return {
    grip: clampStat(base.grip + rainGrip),
    overtaking: clampStat(base.overtaking + (weather === "dry" ? 0 : 3)),
    energy: clampStat(base.energy - lateRace * 2 - (weather === "heavy_rain" ? 5 : 0))
  };
}

function fallbackReplayTrace(result: RaceResult): ReplayTracePoint[] {
  return [
    {
      segment: "start",
      lap: 1,
      progress: 0,
      order: [...result.classification].sort((left, right) => left.position + left.positionChange - (right.position + right.positionChange)).map((entry) => entry.teamId),
      times: Object.fromEntries(result.classification.map((entry) => [entry.teamId, Math.max(0, entry.position + entry.positionChange - 1)])),
      gaps: Object.fromEntries(result.classification.map((entry) => [entry.teamId, Math.max(0, entry.position + entry.positionChange - 1)]))
    },
    {
      segment: "finish",
      lap: 5,
      progress: 1,
      order: result.classification.map((entry) => entry.teamId),
      times: Object.fromEntries(result.classification.map((entry, index) => [entry.teamId, index])),
      gaps: Object.fromEntries(result.classification.map((entry, index) => [entry.teamId, index]))
    }
  ];
}

function tracePointAt(trace: ReplayTracePoint[], progress: number) {
  return [...trace].reverse().find((point) => point.progress <= progress) ?? trace[0] ?? EMPTY_TRACE_POINT;
}

function traceGapsAt(trace: ReplayTracePoint[], progress: number) {
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

function traceTimesAt(trace: ReplayTracePoint[], progress: number) {
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

function traceCarProgressAt(trace: ReplayTracePoint[], progress: number, laps: number) {
  const from = tracePointAt(trace, progress);
  const to = trace.find((point) => point.progress > progress) ?? from;
  if (!from.cars || !to.cars) return null;
  const span = to.progress - from.progress || 1;
  const ratio = Math.min(1, Math.max(0, (progress - from.progress) / span));
  return Object.fromEntries(
    Object.keys({ ...from.cars, ...to.cars }).map((teamId) => {
      const fromProgress = from.cars?.[teamId]?.trackProgress ?? to.cars?.[teamId]?.trackProgress ?? 0;
      const toProgress = to.cars?.[teamId]?.trackProgress ?? fromProgress;
      return [teamId, (fromProgress + (toProgress - fromProgress) * ratio) * laps];
    })
  );
}

export function buildReplayPlan(result: RaceResult, trace: ReplayTracePoint[]): ReplayPlan {
  const factChanges = result.replayFacts?.orderChanges ?? [];
  const orderChanges = factChanges.length ? factChanges : orderChangesFromTrace(trace);
  return {
    source: factChanges.length ? "facts" : orderChanges.length ? "trace" : "fallback",
    overtakes: orderChanges.map((change) => ({
      ...change,
      kind: "overtake",
      phases: replayBeatPhases(change.progress)
    }))
  };
}

export function replayPlanDebugLines(plan: ReplayPlan) {
  return plan.overtakes.map(
    (beat) =>
      `${beat.progress.toFixed(3)} L${beat.lap} ${beat.overtakingTeamId}->${beat.overtakenTeamId} P${beat.fromPosition}->P${beat.toPosition} ${beat.phases.map((phase) => phase.phase).join("/")}`
  );
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

function orderChangesFromTrace(trace: ReplayTracePoint[]): ReplayOrderChangeFact[] {
  return trace.slice(1).flatMap((point, index) => {
    const previous = trace[index]!;
    return point.order.flatMap((teamId, toIndex) => {
      const fromIndex = previous.order.indexOf(teamId);
      if (fromIndex === -1 || fromIndex <= toIndex) return [];
      return previous.order.slice(toIndex, fromIndex).map((overtakenTeamId) => ({
        type: "order_change" as const,
        segment: point.segment,
        lap: point.lap,
        progress: point.progress,
        overtakingTeamId: teamId,
        overtakenTeamId,
        fromPosition: fromIndex + 1,
        toPosition: toIndex + 1,
        gapSeconds: point.gaps[teamId] ?? 0
      }));
    });
  });
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

function raceProgressAt(time: number, raceDuration: number) {
  return raceDuration > 0 ? Math.min(1, Math.max(0, (time - START_HOLD_SECONDS) / raceDuration)) : 1;
}

export function displayLapAtProgress(progress: number, laps: number) {
  return Math.max(1, Math.min(laps, Math.round(1 + Math.max(0, Math.min(1, progress)) * (laps - 1))));
}

function pitLapProgress(circuit: CityCircuit) {
  const analysis = circuitRouteAnalysis(circuit);
  return (((analysis.pitProgress - analysis.startProgress) % 1) + 1) % 1;
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
  return (circuitDisplayLength(circuit) * circuit.laps) / REFERENCE_REPLAY_DISTANCE_PIXELS;
}

function circuitLengthMeters(circuit: Pick<CityCircuit, "route">) {
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
  return [...result.classification].sort((left, right) => {
    const progressDiff = (carProgress[right.teamId] ?? 0) - (carProgress[left.teamId] ?? 0);
    return Math.abs(progressDiff) > POSITION_CHANGE_MARGIN_LAPS
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

export function carProgressAtTrace(result: RaceResult, trace: ReplayTracePoint[], progress: number, laps: number, plan?: ReplayPlan) {
  const carProgress = traceCarProgressAt(trace, progress, laps);
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
      return [entry.teamId, Math.max(0, raceLaps)];
    })
  );
}

export function pitStopTraceProgress(result: RaceResult, trace: ReplayTracePoint[], event: RaceEvent, maxLap: number, laps: number, lapProgress: number, plan?: ReplayPlan) {
  if (typeof event.traceProgress === "number") return event.traceProgress;
  const fallback = pitStopRaceProgress(event, maxLap, laps, lapProgress);
  const target = fallback * laps;
  let low = Math.max(0, fallback - 0.18);
  let high = Math.min(1, fallback + 0.24);
  const at = (progress: number) => carProgressAtTrace(result, trace, progress, laps, plan)[event.teamId] ?? 0;

  while (low > 0 && at(low) > target) low = Math.max(0, low - 0.12);
  while (high < 1 && at(high) < target) high = Math.min(1, high + 0.12);
  if (at(low) > target || at(high) < target) return fallback;

  for (let index = 0; index < 18; index += 1) {
    const mid = (low + high) / 2;
    if (at(mid) < target) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

export function eventTraceProgress(event: RaceEvent, maxLap: number) {
  return typeof event.traceProgress === "number" ? event.traceProgress : event.lap / maxLap;
}

export function shouldSmoothReplayTrace(trace: ReplayTracePoint[]) {
  return !trace.every((point) => point.cars);
}

export function gridStartCarProgress(result: RaceResult, trace: ReplayTracePoint[], progress: number) {
  const startOrder = trace[0]?.order.length ? trace[0].order : [...result.classification].sort((left, right) => left.position + left.positionChange - (right.position + right.positionChange)).map((entry) => entry.teamId);
  const spacing = 0.018;
  const base = 0.012;
  const fade = Math.max(0, 1 - progress / GRID_START_PROGRESS);
  return Object.fromEntries(startOrder.map((teamId, index) => [teamId, -(base + index * spacing) * fade]));
}

export function applyGridStart(
  result: RaceResult,
  trace: ReplayTracePoint[],
  carProgress: Record<string, number>,
  progress: number
) {
  if (progress >= GRID_START_PROGRESS) return carProgress;
  const grid = gridStartCarProgress(result, trace, progress);
  return Object.fromEntries(result.classification.map((entry) => [entry.teamId, (carProgress[entry.teamId] ?? 0) + (grid[entry.teamId] ?? 0)]));
}

export function buildRaceDirectorBeats(result: RaceResult, trace: ReplayTracePoint[], plan: ReplayPlan, laps: number, playerTeamId?: string, mode: "race" | "qualifying" = "race", pitProgress = 0.5): ReplayDirectorBeat[] {
  if (mode === "qualifying") {
    const beats: ReplayDirectorBeat[] = [
      { id: "qualifying-start", type: "qualifying_start", progress: 0, lap: 1 },
      { id: "qualifying-pace", type: "qualifying_pace", progress: 0.5, lap: displayLapAtProgress(0.5, laps), teamId: playerTeamId ?? result.classification[0]?.teamId },
      { id: "qualifying-final", type: "qualifying_final", progress: 1, lap: displayLapAtProgress(1, laps), teamId: playerTeamId ?? result.classification[0]?.teamId }
    ];
    const weatherChange = RACE_SEGMENTS.find((segment, index) => index > 0 && result.resolvedWeather[segment] !== result.resolvedWeather[RACE_SEGMENTS[index - 1]!]);
    if (weatherChange) {
      const progress = Math.max(0.2, RACE_SEGMENTS.indexOf(weatherChange) / RACE_SEGMENTS.length);
      beats.splice(-1, 0, { id: `weather-${weatherChange}`, type: "weather", progress, lap: displayLapAtProgress(progress, laps), weather: result.resolvedWeather[weatherChange] });
    }
    return beats.sort((left, right) => left.progress - right.progress);
  }

  if (result.replayFacts?.directorBeats?.length) {
    return result.replayFacts.directorBeats
      .map((beat) => ({
        ...beat,
        type: beat.type === "overtake" && (beat.teamId === playerTeamId || beat.relatedTeamId === playerTeamId) ? "player" as const : beat.type
      }))
      .sort((left, right) => left.progress - right.progress);
  }

  const beats: ReplayDirectorBeat[] = [
    { id: "grid-start", type: "grid_start", progress: 0, lap: 1 }
  ];
  for (const change of plan.overtakes.slice(0, 8)) {
    beats.push({
      id: `overtake-${change.overtakingTeamId}-${change.overtakenTeamId}-${change.progress.toFixed(3)}`,
      type: change.overtakingTeamId === playerTeamId || change.overtakenTeamId === playerTeamId ? "player" : "overtake",
      progress: change.progress,
      lap: displayLapAtProgress(change.progress, laps),
      teamId: change.overtakingTeamId,
      relatedTeamId: change.overtakenTeamId,
      fromPosition: change.fromPosition,
      toPosition: change.toPosition,
      gapSeconds: change.gapSeconds
    });
  }
  const weatherChange = RACE_SEGMENTS.find((segment, index) => index > 0 && result.resolvedWeather[segment] !== result.resolvedWeather[RACE_SEGMENTS[index - 1]!]);
  if (weatherChange) {
    const progress = Math.max(0.2, RACE_SEGMENTS.indexOf(weatherChange) / RACE_SEGMENTS.length);
    beats.push({ id: `weather-${weatherChange}`, type: "weather", progress, lap: displayLapAtProgress(progress, laps), weather: result.resolvedWeather[weatherChange] });
  }
  const quietTrace = trace.find((point, index) => index > 0 && point.progress > 0.35 && point.progress < 0.75 && Math.abs((point.gaps[point.order[1] ?? ""] ?? 99) - (point.gaps[point.order[0] ?? ""] ?? 0)) <= 1.5);
  if (quietTrace) beats.push({ id: `pack-${quietTrace.progress.toFixed(3)}`, type: "pack", progress: quietTrace.progress, lap: displayLapAtProgress(quietTrace.progress, laps), gapSeconds: quietTrace.gaps[quietTrace.order[1] ?? ""] });
  const maxLap = Math.max(1, ...result.events.map((candidate) => candidate.lap));
  for (const event of result.events.filter((event) => event.type === "pit_stop").slice(0, 8)) {
    const progress = pitStopTraceProgress(result, trace, event, maxLap, laps, pitProgress, plan);
    beats.push({ id: `pit-${event.teamId}-${event.order}`, type: "pit_stop", progress, lap: displayLapAtProgress(progress, laps), teamId: event.teamId });
  }
  beats.push({ id: "final-pressure", type: "final", progress: 1, lap: displayLapAtProgress(1, laps), teamId: result.classification[0]?.teamId });
  return beats
    .filter((beat, index, all) => all.findIndex((candidate) => candidate.id === beat.id) === index)
    .sort((left, right) => left.progress - right.progress);
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

function replaySnapshot(
  result: RaceResult,
  trace: ReplayTracePoint[],
  replayTimes: ReturnType<typeof scaleFinishTimes>,
  raceTime: number,
  progress: number,
  laps: number,
  plan?: ReplayPlan,
  currentOrder: string[] = []
) {
  const baseProgress = progress >= 1 ? carProgressAtRaceTime(result, replayTimes.times, raceTime, laps) : carProgressAtTrace(result, trace, progress, laps, plan);
  const carProgress = shouldSmoothReplayTrace(trace) ? applyGridStart(result, trace, baseProgress, progress) : baseProgress;
  const tower = liveClassificationByCarProgress(result, trace, progress, carProgress, currentOrder);
  return { carProgress, tower };
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

function momentCard(event: RaceEvent, names: Map<string, string>, tt: Translator) {
  const team = names.get(event.teamId) ?? "";
  const context = event.cardId ? tt(`card_${event.cardId}` as TranslationKey) : event.type === "weather_change" ? tt("event_weather_change") : event.type === "pit_stop" ? tt("event_pit_stop") : team;
  const impact = event.positionDelta
    ? `${event.positionDelta > 0 ? "+" : ""}${event.positionDelta} ${event.cardId ? "boost" : "pos"}`
    : event.type === "pit_stop"
      ? tt("replay_director_pit_stop")
    : event.severity === "major"
      ? tt("event_major")
      : tt("event_ambience");
  const icon: VisualIconName = event.tags.includes("weather") || event.type === "weather_change" ? "light_rain" : event.type === "pit_stop" ? "energy" : event.cardId ? "card" : event.positionDelta > 0 ? "position" : "dot";
  return {
    icon,
    context,
    team,
    text: eventReplayText(event, names, tt),
    impact
  };
}

function directorBeatCopy(beat: ReplayDirectorBeat, names: Map<string, string>, tt: Translator) {
  const team = beat.teamId ? names.get(beat.teamId) ?? beat.teamId : "";
  const related = beat.relatedTeamId ? names.get(beat.relatedTeamId) ?? beat.relatedTeamId : "";
  if (beat.type === "qualifying_start") return { title: tt("replay_director_qualifying_start"), detail: tt("replay_director_qualifying_start_detail") };
  if (beat.type === "qualifying_pace") return { title: tt("replay_director_qualifying_pace"), detail: tt("replay_director_qualifying_pace_detail", { team }) };
  if (beat.type === "qualifying_final") return { title: tt("replay_director_qualifying_final"), detail: tt("replay_director_qualifying_final_detail", { team }) };
  if (beat.type === "grid_start") return { title: tt("replay_director_grid_start"), detail: tt("replay_director_grid_detail") };
  if (beat.type === "player") return { title: tt("replay_director_player"), detail: tt("replay_director_overtake_detail", { team, related, from: beat.fromPosition ?? "-", to: beat.toPosition ?? "-" }) };
  if (beat.type === "overtake") return { title: tt("replay_director_overtake"), detail: tt("replay_director_overtake_detail", { team, related, from: beat.fromPosition ?? "-", to: beat.toPosition ?? "-" }) };
  if (beat.type === "pack") return { title: tt("replay_director_pack"), detail: tt("replay_director_pack_detail", { gap: (beat.gapSeconds ?? 0).toFixed(1) }) };
  if (beat.type === "weather") return { title: tt("replay_director_weather"), detail: tt("replay_director_weather_detail", { weather: tt(`weather_${beat.weather ?? "dry"}` as TranslationKey) }) };
  if (beat.type === "pit_stop") return { title: tt("replay_director_pit_stop"), detail: tt("replay_director_pit_stop_detail", { team }) };
  return { title: tt("replay_director_final"), detail: tt("replay_director_final_detail", { team }) };
}

export function ReplayView({
  result,
  circuit,
  playerTeamId,
  teamLiveries = {},
  traitImpacts = {},
  titleKey = "result_replay_title",
  explainerKey = "result_replay_explainer",
  showIntro = true,
  towerEntries,
  initialLap,
  preferencesResetSignal = 0,
  onOpenReport,
  onClose,
  closeLabel,
  overlayActions,
  tt
}: {
  result: RaceResult;
  circuit: CityCircuit;
  playerTeamId: string | undefined;
  teamLiveries?: Record<string, TeamLivery>;
  traitImpacts?: MapTraitImpacts;
  titleKey?: TranslationKey;
  explainerKey?: TranslationKey;
  showIntro?: boolean;
  towerEntries?: ReplayTowerEntry[];
  initialLap?: number;
  preferencesResetSignal?: number;
  onOpenReport?: () => void;
  onClose?: () => void;
  closeLabel?: string;
  overlayActions?: ReactNode;
  tt: Translator;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const clock = useRef(0);
  const scrubbingRef = useRef(false);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<ReplaySpeed>(savedReplaySpeed);
  const [driverFocus, setDriverFocus] = useState(() => localStorage.getItem(REPLAY_FOCUS_KEY) !== "0");
  const [copyDismissed, setCopyDismissed] = useState(() => localStorage.getItem(DISMISSED_REPLAY_HELP_KEY) === "1");
  const replayTrace = result.replayTrace?.length ? result.replayTrace : fallbackReplayTrace(result);
  const replayPlan = buildReplayPlan(result, replayTrace);
  const replayMode = titleKey === "qualifying_replay_title" ? "qualifying" : "race";
  const pitProgress = pitLapProgress(circuit);
  const replayTimes = scaleFinishTimes(finishTimes(result, replayTrace), replayDistanceScale(circuit));
  const directorBeats = buildRaceDirectorBeats(result, replayTrace, replayPlan, circuit.laps, playerTeamId, replayMode, pitProgress);
  const initialSnapshot = replaySnapshot(result, replayTrace, replayTimes, 0, 0, circuit.laps, replayPlan);
  const [live, setLive] = useState<{ lap: number; segment: RaceSegment }>({ lap: 1, segment: RACE_SEGMENTS[0] });
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [activeMomentId, setActiveMomentId] = useState<string | null>(null);
  const snapshotRef = useRef(initialSnapshot);
  const [positionPops, setPositionPops] = useState<Record<string, { delta: number; key: number }>>({});
  const orderRef = useRef(initialSnapshot.tower.map((entry) => entry.teamId));
  const positionPopTimers = useRef<number[]>([]);
  const names = teamNamesFromResult(result);
  const field = result.classification;
  const activeMoment = result.events.find((event) => event.id === activeMomentId);
  const activeMomentCard = activeMoment ? momentCard(activeMoment, names, tt) : null;
  const raceDuration = replayTimes.leader;
  const smoothTracePositions = shouldSmoothReplayTrace(replayTrace);
  const currentRaceProgress = raceProgressAt(clock.current, raceDuration);
  const maxLap = Math.max(1, ...result.events.map((event) => event.lap));
  const raceTimeAtProgress = (progress: number) => START_HOLD_SECONDS + progress * raceDuration;
  const cars: MapCar[] = field.map((entry, index) => ({
      id: entry.teamId,
      label: String(Math.max(1, snapshot.tower.findIndex((team) => team.teamId === entry.teamId) + 1)),
      player: entry.teamId === playerTeamId,
      delay: 0,
      duration: replayTimes.times[entry.teamId] ?? replayTimes.leader + index,
      progress: snapshot.carProgress[entry.teamId] ?? 0,
      livery: teamLiveries[entry.teamId],
      positionDelta: positionPops[entry.teamId]?.delta,
      positionDeltaKey: positionPops[entry.teamId]?.key
  }));
  const playerCar = cars.find((car) => car.player) ?? cars[0];
  const tower: ReplayTowerEntry[] = towerEntries ?? snapshot.tower.map((entry) => ({ teamId: entry.teamId, teamName: entry.teamName, value: "" }));
  const circuitDistance = `${(circuitLengthMeters(circuit) / 1000).toFixed(1)} km`;
  const lastFinishTime = replayTimes.last;
  const replayEnd = START_HOLD_SECONDS + lastFinishTime + FINISH_HOLD_SECONDS;
  const replayPercentAtRaceProgress = (progress: number) => (raceTimeAtProgress(progress) / replayEnd) * 100;
  snapshotRef.current = snapshot;

  // SMIL has no playback-rate API, so the SVG clock is driven by hand:
  // animations stay paused and a rAF loop advances setCurrentTime at `speed`.
  // jsdom implements none of this, hence the guards.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg?.pauseAnimations) return;
    svg.pauseAnimations();
    if (!playing) return;
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now: number) {
      const replayDeltaSeconds = ((now - last) / 1000) * speed;
      clock.current = Math.min(clock.current + replayDeltaSeconds, replayEnd);
      last = now;
      svg.setCurrentTime(clock.current);
      if (progressRef.current) progressRef.current.style.width = `${(clock.current / replayEnd) * 100}%`;
      if (rangeRef.current && !scrubbingRef.current) rangeRef.current.value = String(clock.current);
      updateLive(clock.current, true, replayDeltaSeconds);
      if (clock.current >= replayEnd) {
        setPlaying(false);
        return;
      }
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, replayEnd]);

  useEffect(() => {
    if (speed === 1) localStorage.removeItem(REPLAY_SPEED_KEY);
    else localStorage.setItem(REPLAY_SPEED_KEY, String(speed));
  }, [speed]);

  useEffect(() => {
    if (driverFocus) localStorage.removeItem(REPLAY_FOCUS_KEY);
    else localStorage.setItem(REPLAY_FOCUS_KEY, "0");
  }, [driverFocus]);

  useEffect(() => {
    setSpeed(savedReplaySpeed());
    setDriverFocus(localStorage.getItem(REPLAY_FOCUS_KEY) !== "0");
    setCopyDismissed(localStorage.getItem(DISMISSED_REPLAY_HELP_KEY) === "1");
  }, [preferencesResetSignal]);

  useEffect(() => () => positionPopTimers.current.forEach(window.clearTimeout), []);

  function seek(time: number) {
    clock.current = Math.max(0, Math.min(time, replayEnd));
    svgRef.current?.setCurrentTime?.(clock.current);
    if (progressRef.current) progressRef.current.style.width = `${(clock.current / replayEnd) * 100}%`;
    if (rangeRef.current) rangeRef.current.value = String(clock.current);
    positionPopTimers.current.forEach(window.clearTimeout);
    positionPopTimers.current = [];
    setPositionPops({});
    updateLive(clock.current, false);
  }

  useEffect(() => {
    if (!initialLap) return;
    seek(raceTimeAtProgress(Math.max(0, Math.min(circuit.laps - 1, initialLap - 1)) / circuit.laps));
  }, [initialLap, circuit.laps, replayEnd]);

  function restart() {
    setPositionPops({});
    seek(0);
    setPlaying(true);
  }

  function updateLive(time: number, animatePositions = true, elapsedSeconds = 1 / 60) {
    setActiveMomentId(activeMomentIdAt(time));
    const progress = raceProgressAt(time, raceDuration);
    const raceTime = Math.max(0, time - START_HOLD_SECONDS);
    const displayLap = displayLapAtProgress(progress, circuit.laps);
    const segment = segmentAtProgress(progress);
    setLive((current) => (current.lap === displayLap && current.segment === segment ? current : { lap: displayLap, segment }));
    const targetSnapshot = replaySnapshot(result, replayTrace, replayTimes, raceTime, progress, circuit.laps, replayPlan, orderRef.current);
    const carProgress = animatePositions && smoothTracePositions ? smoothCarProgress(snapshotRef.current.carProgress, targetSnapshot.carProgress, elapsedSeconds) : targetSnapshot.carProgress;
    const nextTower = liveClassificationByCarProgress(result, replayTrace, progress, carProgress, orderRef.current);
    const nextSnapshot = { carProgress, tower: nextTower };
    const nextOrder = nextTower.map((entry) => entry.teamId);
    if (orderRef.current.join("|") !== nextOrder.join("|")) {
      if (animatePositions) {
        const deltas = positionDeltas(orderRef.current, nextOrder);
        const key = Math.round(time * 1000);
        const pops = Object.fromEntries(Object.entries(deltas).map(([teamId, delta]) => [teamId, { delta, key }]));
        setPositionPops((current) => ({ ...current, ...pops }));
        for (const teamId of Object.keys(pops)) {
          positionPopTimers.current.push(
            window.setTimeout(() => {
              setPositionPops((current) => (current[teamId]?.key === key ? Object.fromEntries(Object.entries(current).filter(([id]) => id !== teamId)) : current));
            }, 1100)
          );
        }
      }
      orderRef.current = nextOrder;
    }
    snapshotRef.current = nextSnapshot;
    setSnapshot(nextSnapshot);
  }

  // Majors and player moments first pick, race notes as filler — then strict race order.
  const keyMoments = [
    ...result.events.filter((event) => event.severity === "major"),
    ...result.events.filter((event) => event.type === "pit_stop"),
    ...result.events.filter((event) => event.teamId === playerTeamId || event.relatedTeamId === playerTeamId),
    ...(overlayActions ? [] : result.events.filter((event) => event.severity === "minor" && event.type === "race_note"))
  ]
    .filter((event, index, events) => events.findIndex((candidate) => candidate.id === event.id) === index)
    .sort((left, right) => left.order - right.order);

  // Timeline markers: one dot per lap that has a key/player moment, positioned by lap.
  const markerByLap = new Map<number, { texts: string[]; player: boolean; time: number }>();
  for (const event of keyMoments.filter((event) => event.severity === "major" || event.type === "pit_stop" || event.teamId === playerTeamId)) {
    const progress = event.type === "pit_stop" ? pitStopTraceProgress(result, replayTrace, event, maxLap, circuit.laps, pitProgress, replayPlan) : eventTraceProgress(event, maxLap);
    const displayLap = displayLapAtProgress(progress, circuit.laps);
    const marker = markerByLap.get(displayLap) ?? { texts: [], player: false, time: raceTimeAtProgress(progress) };
    marker.texts.push(`${tt("unit_lap")} ${displayLap} · ${eventReplayText(event, names, tt)}`);
    marker.player ||= event.teamId === playerTeamId;
    marker.time = Math.min(marker.time, raceTimeAtProgress(progress));
    markerByLap.set(displayLap, marker);
  }
  const markers = [...markerByLap.entries()].map(([lap, marker]) => ({
    lap,
    left: `${Math.min(96, Math.max(3, (marker.time / replayEnd) * 100))}%`,
    time: marker.time,
    title: marker.texts.join("\n"),
    player: marker.player
  }));
  const liveWeather = result.resolvedWeather[live.segment];
  const activeDirectorBeat = [...directorBeats].reverse().find((beat) => beat.progress <= currentRaceProgress) ?? directorBeats[0];
  const activeDirectorCopy = activeDirectorBeat ? directorBeatCopy(activeDirectorBeat, names, tt) : null;
  const playerContext = playerReplayContext(result, replayTrace, currentRaceProgress, playerTeamId);
  const latestPlayerBeat = [...directorBeats].reverse().find((beat) => beat.teamId === playerTeamId || beat.relatedTeamId === playerTeamId);
  const seekValueText = `${tt("unit_lap")} ${live.lap}/${circuit.laps}, ${Math.round(clock.current)}s`;

  function eventTime(event: RaceEvent) {
    return raceTimeAtProgress(eventTraceProgress(event, maxLap));
  }

  function activeMomentIdAt(time: number) {
    return keyMoments.find((event) => Math.abs(eventTime(event) - time) <= MOMENT_NOTIFICATION_SECONDS)?.id ?? null;
  }

  return (
    <div className="view-stack">
      <div className="replay-main-grid">
        <div className="replay-content-column">
          <CircuitMap
            className="replay-map-panel"
            circuit={circuit}
            tt={tt}
            cars={cars}
            weather={liveWeather}
            svgRef={svgRef}
            showHeading={false}
            framed={false}
            showTraits={false}
            camera={{ enabled: driverFocus, car: playerCar, timeRef: clock }}
            overlay={
              <>
                <div className="map-info-stack">
                  <div className="map-status">
                    <span className="circuit-city">
                      <CountryBadge country={circuit.country} /> {circuit.city}
                    </span>
                    <strong>{tt(circuit.layoutKey)}</strong>
                    <small>
                      {tt("unit_lap")} {live.lap}/{circuit.laps}
                    </small>
                    <small className="map-weather-readout">
                      <VisualIcon name={liveWeather} />
                      <span>{tt(`weather_${liveWeather}` as TranslationKey)}</span>
                    </small>
                    <small>{circuitDistance}</small>
                  </div>
                  <MapTraitsPanel traits={liveTraits(circuit.traits, liveWeather, live.lap)} impacts={traitImpacts} tt={tt} />
                </div>
                {activeMoment && activeMomentCard ? (
                  <div className={activeMoment.teamId === playerTeamId ? "replay-moment-notification player" : "replay-moment-notification"} role="status" aria-live="polite">
                    <span className="lap-marker">L{displayLapAtProgress(activeMoment.lap / maxLap, circuit.laps)}</span>
                    <span className="moment-main">
                      <strong>
                        <VisualIcon name={activeMomentCard.icon} /> {activeMomentCard.context}
                      </strong>
                      <small>{activeMomentCard.team || activeMomentCard.text}</small>
                    </span>
                    <span className="moment-impact">{activeMomentCard.impact}</span>
                  </div>
                ) : null}
                {!overlayActions ? (
                  <div className="replay-info-stack">
                    {activeDirectorBeat && activeDirectorCopy ? (
                    <div className={`replay-director-panel ${activeDirectorBeat.type}`}>
                      <span>{tt("replay_director_title")} · L{activeDirectorBeat.lap}</span>
                      <strong>{activeDirectorCopy.title}</strong>
                      <small>{activeDirectorCopy.detail}</small>
                    </div>
                    ) : null}
                    {playerContext ? (
                    <div className="replay-player-focus-panel">
                      <span>{tt("replay_player_focus")}</span>
                      <strong>
                        P{playerContext.position} {playerContext.delta ? `(${playerContext.delta > 0 ? "+" : ""}${playerContext.delta})` : ""}
                      </strong>
                      <small>
                        {tt("replay_player_gaps", {
                          ahead: playerContext.gapAhead === undefined ? "-" : `${playerContext.gapAhead.toFixed(1)}s`,
                          behind: playerContext.gapBehind === undefined ? "-" : `${playerContext.gapBehind.toFixed(1)}s`
                        })}
                      </small>
                      {latestPlayerBeat ? <small>{directorBeatCopy(latestPlayerBeat, names, tt).detail}</small> : null}
                    </div>
                    ) : null}
                  </div>
                ) : null}
                <div className="replay-map-controls">
                  <button
                    type="button"
                    className={playing ? "replay-playback-button playing" : "replay-playback-button paused"}
                    aria-label={playing ? tt("action_pause") : tt("action_play")}
                    title={playing ? tt("action_pause") : tt("action_play")}
                    onClick={() => (!playing && clock.current >= replayEnd ? restart() : setPlaying(!playing))}
                  >
                    {playing ? "⏸" : "▶"}
                  </button>
                  <button type="button" aria-label={tt("action_replay_restart")} title={tt("action_replay_restart")} onClick={restart}>
                    ↻
                  </button>
                  <button
                    type="button"
                    aria-label="Focus driver"
                    title="Focus driver"
                    className={driverFocus ? "replay-focus-button active" : "replay-focus-button"}
                    onClick={() => setDriverFocus(!driverFocus)}
                  >
                    <svg className="replay-focus-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M8 4H6a2 2 0 0 0-2 2v2" />
                      <path d="M16 4h2a2 2 0 0 1 2 2v2" />
                      <path d="M20 16v2a2 2 0 0 1-2 2h-2" />
                      <path d="M8 20H6a2 2 0 0 1-2-2v-2" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <ReplaySpeedMenu speed={speed} setSpeed={setSpeed} tt={tt} />
                  {onOpenReport ? (
                    <button type="button" className="replay-report-button" aria-label={tt("result_tab_report")} title={tt("result_tab_report")} onClick={onOpenReport}>
                      <svg className="replay-report-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M6 3h9l3 3v15H6z" />
                        <path d="M14 3v4h4" />
                        <path d="M9 12h6" />
                        <path d="M9 16h4" />
                      </svg>
                    </button>
                  ) : null}
                  {onClose ? (
                    <button type="button" className="replay-close-button" aria-label={closeLabel ?? tt("action_close")} title={closeLabel ?? tt("action_close")} onClick={onClose}>
                      ×
                    </button>
                  ) : null}
                </div>
                {overlayActions ? (
                  <div className="replay-overlay-stack">
                    {activeDirectorBeat && activeDirectorCopy ? (
                      <div className={`replay-director-panel ${activeDirectorBeat.type}`}>
                        <span>{tt("replay_director_title")} · L{activeDirectorBeat.lap}</span>
                        <strong>{activeDirectorCopy.title}</strong>
                        <small>{activeDirectorCopy.detail}</small>
                      </div>
                    ) : null}
                    <div className="replay-overlay-actions">{overlayActions}</div>
                  </div>
                ) : null}
                <ol className="replay-tower">
                  {tower.map((entry, index) => (
                    <li
                      key={entry.id ?? entry.teamId}
                      className={[
                        entry.teamId === playerTeamId ? "player" : "",
                        positionPops[entry.teamId]?.delta ? "position-change" : "",
                        (positionPops[entry.teamId]?.delta ?? 0) > 0 ? "gain" : (positionPops[entry.teamId]?.delta ?? 0) < 0 ? "loss" : ""
                      ].filter(Boolean).join(" ") || undefined}
                    >
                      <span
                        className="replay-tower-livery"
                        aria-label={`P${index + 1}`}
                        style={
                          {
                            "--livery-primary": safeHex(teamLiveries[entry.teamId]?.primary, "#38bdf8"),
                            "--livery-secondary": safeHex(teamLiveries[entry.teamId]?.secondary, "#16c784")
                          } as CSSProperties & Record<string, string>
                        }
                      >
                        {index + 1}
                      </span>
                      <span className="replay-tower-team">{entry.teamName}</span>
                      {entry.value ? <span className="replay-tower-value">{entry.value}</span> : null}
                      {positionPops[entry.teamId]?.delta ? <span className="replay-tower-delta">{positionPops[entry.teamId]!.delta > 0 ? `+${positionPops[entry.teamId]!.delta}` : positionPops[entry.teamId]!.delta}</span> : null}
                    </li>
                  ))}
                </ol>
                <div className="replay-progress">
                  <div ref={progressRef} className="replay-progress-fill" />
                  <input
                    ref={rangeRef}
                    type="range"
                    className="replay-progress-input"
                    aria-label={tt("replay_seek")}
                    aria-valuetext={seekValueText}
                    min={0}
                    max={replayEnd}
                    step={replayEnd / 100}
                    defaultValue={0}
                    onPointerDown={() => {
                      scrubbingRef.current = true;
                    }}
                    onPointerUp={(event) => {
                      scrubbingRef.current = false;
                      seek(Number(event.currentTarget.value));
                    }}
                    onPointerCancel={() => {
                      scrubbingRef.current = false;
                    }}
                    onChange={(event) => seek(Number(event.target.value))}
                  />
                  {RACE_SEGMENTS.slice(1).map((segment, index) => (
                    <span key={segment} className="replay-tick" style={{ left: `${replayPercentAtRaceProgress((index + 1) / RACE_SEGMENTS.length)}%` }} />
                  ))}
                  {RACE_SEGMENTS.map((segment, index) => (
                    <span
                      key={segment}
                      className="replay-weather"
                      style={{ left: `${replayPercentAtRaceProgress((index + 0.5) / RACE_SEGMENTS.length)}%` }}
                      title={tt(`weather_${result.resolvedWeather[segment]}` as TranslationKey)}
                    >
                      <VisualIcon name={result.resolvedWeather[segment]} />
                    </span>
                  ))}
                  {markers.map((marker) => (
                    <button
                      key={marker.lap}
                      type="button"
                      className={marker.player ? "replay-marker player" : "replay-marker"}
                      style={{ left: marker.left }}
                      title={marker.title}
                      aria-label={marker.title}
                      onClick={() => seek(marker.time)}
                    />
                  ))}
                  {directorBeats.slice(1, -1).map((beat) => (
                    <button
                      key={beat.id}
                      type="button"
                      className={`replay-marker director ${beat.type}`}
                      style={{ left: `${Math.min(96, Math.max(3, replayPercentAtRaceProgress(beat.progress)))}%` }}
                      title={directorBeatCopy(beat, names, tt).detail}
                      aria-label={directorBeatCopy(beat, names, tt).detail}
                      onClick={() => seek(raceTimeAtProgress(beat.progress))}
                    />
                  ))}
                </div>
              </>
            }
          />
          {showIntro && !copyDismissed ? (
            <section className="panel race-context-panel replay-copy-panel">
              <h2>{tt(titleKey)}</h2>
              <p>{tt(explainerKey)}</p>
              <button
                type="button"
                className="context-panel-close"
                aria-label={`${tt("action_close")} ${tt(titleKey)}`}
                onClick={() => {
                  localStorage.setItem(DISMISSED_REPLAY_HELP_KEY, "1");
                  setCopyDismissed(true);
                }}
              >
                ×
              </button>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
