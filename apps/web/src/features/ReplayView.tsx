import { RACE_SEGMENTS, type RaceDecision, type RaceResult, type RaceSegment, type ReplayOrderChangeFact, type ReplayTracePoint, type TeamLivery, type Weather } from "@cr-league/shared";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import type { TranslationKey } from "../i18n/index.js";
import type { CityCircuit } from "../app/circuits.js";
import { eventReplayText, teamNamesFromResult, type Translator } from "../app/helpers.js";
import type { RaceEvent } from "../app/helpers.js";
import { CircuitMap, circuitDisplayLength, circuitRouteAnalysis, type MapCar, type MapTraitImpacts } from "./CircuitMap.js";
import { PositionBadge } from "./PositionBadge.js";
import { type VisualIconName } from "./VisualIcon.js";
import { ReplayStageOverlay } from "./replay/ReplayStageOverlay.js";
import type { ReplayTimelineMarker } from "./replay/ReplayProgress.js";
import { useReplayClock } from "./replay/useReplayClock.js";
const EMPTY_TRACE_POINT: ReplayTracePoint = { segment: "start", lap: 1, progress: 0, order: [], times: {}, gaps: {} };
const START_HOLD_SECONDS = 1;
const FINISH_HOLD_SECONDS = 1;
export const REPLAY_SPEED_KEY = "cr-league-replay-speed";
export const REPLAY_FOCUS_KEY = "cr-league-replay-focus";
export const DISMISSED_REPLAY_HELP_KEY = "cr-league-dismissed-replay-help";
const REFERENCE_REPLAY_DISTANCE_PIXELS = 9_000;
const POSITION_CHANGE_MARGIN_LAPS = 0.015;
const TRACE_ORDER_GAP_LAPS = 0.035;
const MIN_RANK_TRANSITION_PROGRESS = 0.08;
const MAX_VISUAL_PROGRESS_PER_SECOND = 0.36;
const MOMENT_NOTIFICATION_SECONDS = 3;
type ReplayTowerEntry = { id?: string; teamId: string; teamName: string; value: string };
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

function tracePointAt(trace: ReplayTracePoint[], progress: number) {
  return [...trace].reverse().find((point) => point.progress <= progress) ?? trace[0] ?? EMPTY_TRACE_POINT;
}

export function replayOrderAtProgress(result: RaceResult, trace: ReplayTracePoint[], progress: number) {
  const order = tracePointAt(trace, progress).order;
  return order.length ? order : result.classification.map((entry) => entry.teamId);
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
      const fromCar = from.cars?.[teamId];
      const toCar = to.cars?.[teamId];
      const fromProgress = visualCarProgress(fromCar, toCar?.trackProgress ?? 0, laps);
      const toProgress = visualCarProgress(toCar, fromCar?.trackProgress ?? 0, laps);
      return [teamId, fromProgress + (toProgress - fromProgress) * ratio];
    })
  );
}

function visualCarProgress(car: NonNullable<ReplayTracePoint["cars"]>[string] | undefined, fallback: number, laps: number) {
  const progress = car?.trackProgress ?? fallback;
  return car?.phase === "grid" && progress < 0 ? progress : progress * laps;
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
  return !trace.length || !trace.every((point) => point.cars);
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

export function replayPlayerGapItems(context: { gapAhead?: number; gapBehind?: number } | null, tt: Translator) {
  if (!context) return [];
  return [
    context.gapAhead === undefined ? null : { label: tt("replay_player_ahead"), value: `${context.gapAhead.toFixed(1)}s` },
    context.gapBehind === undefined ? null : { label: tt("replay_player_behind"), value: `${context.gapBehind.toFixed(1)}s` }
  ].filter((item): item is { label: string; value: string } => Boolean(item));
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

function momentCard(event: RaceEvent, names: Map<string, string>, tt: Translator) {
  const team = names.get(event.teamId) ?? "";
  const isMiniInfo = event.tags.includes("mini_info") || event.type === "race_note";
  const qualifyingTag = event.tags.find((tag) => tag === "qualifying_start" || tag === "qualifying_pace" || tag === "qualifying_final");
  const context = qualifyingTag
    ? tt(`event_${qualifyingTag}` as TranslationKey)
    : event.cardId
      ? tt(`card_${event.cardId}` as TranslationKey)
    : event.type === "weather_change"
      ? tt("event_weather_change")
    : event.type === "pit_stop"
      ? tt("event_pit_stop")
    : isMiniInfo
      ? tt(`event_${event.type}` as TranslationKey)
    : team;
  const impact = event.positionDelta
    ? `${event.positionDelta > 0 ? "+" : ""}${event.positionDelta} ${event.cardId ? tt("replay_moment_boost") : tt("replay_moment_position")}`
    : event.type === "pit_stop"
      ? tt("replay_director_pit_stop")
    : qualifyingTag
      ? tt("event_qualifying_split")
    : event.severity === "major"
      ? tt("event_major")
      : tt("event_ambience");
  const icon: VisualIconName = event.tags.includes("weather") || event.type === "weather_change" ? "light_rain" : event.type === "pit_stop" ? "energy" : event.cardId ? "card" : event.positionDelta > 0 ? "position" : "dot";
  return {
    icon,
    context,
    team: isMiniInfo && !qualifyingTag ? "" : team,
    text: eventReplayText(event, names, tt),
    impact
  };
}

export function buildQualifyingMomentEvents(beats: ReplayDirectorBeat[], result: RaceResult): RaceEvent[] {
  return beats
    .filter((beat) => beat.type === "qualifying_start" || beat.type === "qualifying_pace" || beat.type === "qualifying_final")
    .map((beat, index) => ({
      id: `chrono-${beat.id}`,
      order: index,
      segment: segmentAtProgress(beat.progress),
      lap: beat.lap,
      traceProgress: beat.progress,
      type: "race_note",
      teamId: beat.teamId ?? result.classification[0]?.teamId ?? "",
      severity: "minor",
      positionDelta: 0,
      tags: ["mini_info", beat.type],
      replayText: "",
      reportText: ""
    }));
}

export function directorBeatCopy(beat: ReplayDirectorBeat, names: Map<string, string>, tt: Translator) {
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

function renderPositionBadges(text: string): ReactNode {
  return text.split(/(P\d+)/g).map((part, index) => {
    const match = /^P(\d+)$/.exec(part);
    return match ? <PositionBadge key={`${part}-${index}`} position={Number(match[1])} /> : part;
  });
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
  towerReplacement,
  planDecision,
  afterMapContent,
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
  towerReplacement?: ReactNode;
  planDecision?: RaceDecision;
  afterMapContent?: ReactNode;
  tt: Translator;
}) {
  const [driverFocus, setDriverFocus] = useState(() => localStorage.getItem(REPLAY_FOCUS_KEY) !== "0");
  const [copyDismissed, setCopyDismissed] = useState(() => localStorage.getItem(DISMISSED_REPLAY_HELP_KEY) === "1");
  const replayTrace = useMemo(() => result.replayTrace ?? [], [result.replayTrace]);
  const replayPlan = useMemo(() => buildReplayPlan(result, replayTrace), [replayTrace, result]);
  const replayMode = titleKey === "qualifying_replay_title" ? "qualifying" : "race";
  const pitProgress = pitLapProgress(circuit);
  const replayTimes = useMemo(() => scaleFinishTimes(finishTimes(result, replayTrace), replayDistanceScale(circuit)), [circuit, replayTrace, result]);
  const directorBeats = useMemo(
    () => buildRaceDirectorBeats(result, replayTrace, replayPlan, circuit.laps, playerTeamId, replayMode, pitProgress),
    [circuit.laps, pitProgress, playerTeamId, replayMode, replayPlan, replayTrace, result]
  );
  const initialSnapshot = useMemo(() => replaySnapshot(result, replayTrace, replayTimes, 0, 0, circuit.laps, replayPlan), [circuit.laps, replayPlan, replayTimes, replayTrace, result]);
  const names = teamNamesFromResult(result);
  const field = result.classification;
  const smoothTracePositions = shouldSmoothReplayTrace(replayTrace);
  const raceDuration = smoothTracePositions ? replayTimes.leader : replayTimes.last;
  const maxLap = Math.max(1, ...result.events.map((event) => event.lap));
  const raceTimeAtProgress = useCallback((progress: number) => START_HOLD_SECONDS + progress * raceDuration, [raceDuration]);
  const circuitDistance = `${(circuitLengthMeters(circuit) / 1000).toFixed(1)} km`;
  const lastFinishTime = replayTimes.last;
  const replayEnd = START_HOLD_SECONDS + lastFinishTime + FINISH_HOLD_SECONDS;
  const replayPercentAtRaceProgress = (progress: number) => (raceTimeAtProgress(progress) / replayEnd) * 100;

  useEffect(() => {
    if (driverFocus) localStorage.removeItem(REPLAY_FOCUS_KEY);
    else localStorage.setItem(REPLAY_FOCUS_KEY, "0");
  }, [driverFocus]);

  useEffect(() => {
    setDriverFocus(localStorage.getItem(REPLAY_FOCUS_KEY) !== "0");
    setCopyDismissed(localStorage.getItem(DISMISSED_REPLAY_HELP_KEY) === "1");
  }, [preferencesResetSignal]);

  const qualifyingMomentEvents = useMemo(() => replayMode === "qualifying" ? buildQualifyingMomentEvents(directorBeats, result) : [], [directorBeats, replayMode, result]);
  // Majors and player moments first pick, race notes as filler — then strict race order.
  const keyMoments = useMemo(() => (
    replayMode === "qualifying" ? qualifyingMomentEvents : [
      ...result.events.filter((event) => event.severity === "major"),
      ...result.events.filter((event) => event.type === "pit_stop"),
      ...result.events.filter((event) => event.teamId === playerTeamId || event.relatedTeamId === playerTeamId),
      ...(overlayActions ? [] : result.events.filter((event) => event.severity === "minor" && (event.type === "race_note" || event.tags.includes("mini_info"))))
    ]
  )
    .filter((event, index, events) => events.findIndex((candidate) => candidate.id === event.id) === index)
    .sort((left, right) => left.order - right.order), [overlayActions, playerTeamId, qualifyingMomentEvents, replayMode, result.events]);

  const eventTime = useCallback((event: RaceEvent) => raceTimeAtProgress(eventTraceProgress(event, maxLap)), [maxLap, raceTimeAtProgress]);
  const activeMomentIdAt = useCallback((time: number) => keyMoments.find((event) => Math.abs(eventTime(event) - time) <= MOMENT_NOTIFICATION_SECONDS)?.id ?? null, [eventTime, keyMoments]);
  const createTargetSnapshot = useCallback(
    (raceTime: number, progress: number, currentOrder: string[]) => replaySnapshot(result, replayTrace, replayTimes, raceTime, progress, circuit.laps, replayPlan, currentOrder),
    [circuit.laps, replayPlan, replayTimes, replayTrace, result]
  );
  const createTower = useCallback(
    (progress: number, carProgress: Record<string, number>, currentOrder: string[]) => liveClassificationByCarProgress(result, replayTrace, progress, carProgress, currentOrder),
    [replayTrace, result]
  );
  const getOrderAtProgress = useCallback((progress: number) => replayOrderAtProgress(result, replayTrace, progress), [replayTrace, result]);
  const {
    svgRef,
    progressRef,
    rangeRef,
    clock,
    scrubbingRef,
    playing,
    setPlaying,
    speed,
    setSpeed,
    live,
    snapshot,
    activeMomentId,
    positionPops,
    currentRaceProgress,
    seek,
    restart
  } = useReplayClock({
    initialSnapshot,
    initialOrder: initialSnapshot.tower.map((entry) => entry.teamId),
    replayEnd,
    raceDuration,
    laps: circuit.laps,
    smoothTracePositions,
    resultSeed: result.seed,
    titleKey,
    initialLap,
    startHoldSeconds: START_HOLD_SECONDS,
    getActiveMomentId: activeMomentIdAt,
    getOrderAtProgress,
    createTargetSnapshot,
    createTower,
    smoothCarProgress,
    displayLapAtProgress,
    segmentAtProgress
  });

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
    id: String(lap),
    className: marker.player ? "replay-marker player" : "replay-marker",
    left: `${Math.min(96, Math.max(3, (marker.time / replayEnd) * 100))}%`,
    time: marker.time,
    title: marker.texts.join("\n")
  })) satisfies ReplayTimelineMarker[];
  const directorMarkers = directorBeats.slice(1, -1).map((beat) => {
    const copy = directorBeatCopy(beat, names, tt);
    return {
      id: beat.id,
      className: `replay-marker director ${beat.type}`,
      left: `${Math.min(96, Math.max(3, replayPercentAtRaceProgress(beat.progress)))}%`,
      title: copy.detail,
      time: raceTimeAtProgress(beat.progress)
    };
  }) satisfies ReplayTimelineMarker[];
  const liveWeather = result.resolvedWeather[live.segment];
  const activeMoment = keyMoments.find((event) => event.id === activeMomentId);
  const activeMomentCard = activeMoment ? momentCard(activeMoment, names, tt) : null;
  const activeMomentLap = activeMoment
    ? typeof activeMoment.traceProgress === "number"
      ? displayLapAtProgress(activeMoment.traceProgress, circuit.laps)
      : displayLapAtProgress(activeMoment.lap / maxLap, circuit.laps)
    : 1;
  const activeMomentNotice = activeMoment && activeMomentCard
    ? {
        player: activeMoment.teamId === playerTeamId,
        lap: activeMomentLap,
        icon: activeMomentCard.icon,
        context: activeMomentCard.context,
        detail: activeMomentCard.team || activeMomentCard.text,
        impact: activeMomentCard.impact
      }
    : undefined;
  const activeDirectorBeat = [...directorBeats].reverse().find((beat) => beat.progress <= currentRaceProgress) ?? directorBeats[0];
  const activeDirectorCopy = activeDirectorBeat ? directorBeatCopy(activeDirectorBeat, names, tt) : null;
  const activeDirector = activeDirectorBeat && activeDirectorCopy
    ? {
        type: activeDirectorBeat.type,
        lap: activeDirectorBeat.lap,
        title: activeDirectorCopy.title,
        detail: renderPositionBadges(activeDirectorCopy.detail)
      }
    : undefined;
  const playerContext = playerReplayContext(result, replayTrace, currentRaceProgress, playerTeamId);
  const playerGapItems = replayPlayerGapItems(playerContext, tt);
  const latestPlayerBeat = [...directorBeats].reverse().find((beat) => beat.teamId === playerTeamId || beat.relatedTeamId === playerTeamId);
  const playerFocus = playerContext
    ? {
        position: playerContext.position,
        delta: playerContext.delta,
        gapItems: playerGapItems,
        latestDetail: latestPlayerBeat ? renderPositionBadges(directorBeatCopy(latestPlayerBeat, names, tt).detail) : undefined
      }
    : undefined;

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
              <ReplayStageOverlay
                circuit={circuit}
                liveLap={live.lap}
                liveWeather={liveWeather}
                circuitDistance={circuitDistance}
                planDecision={planDecision}
                traitImpacts={traitImpacts}
                resolvedWeather={result.resolvedWeather}
                activeMoment={activeMomentNotice}
                activeDirector={activeDirector}
                playerFocus={playerFocus}
                overlayActions={overlayActions}
                playing={playing}
                speed={speed}
                driverFocus={driverFocus}
                replayEnd={replayEnd}
                clockSeconds={clock.current}
                progressRef={progressRef}
                rangeRef={rangeRef}
                scrubbingRef={scrubbingRef}
                towerReplacement={towerReplacement}
                tower={tower}
                playerTeamId={playerTeamId}
                positionPops={positionPops}
                teamLiveries={teamLiveries}
                markers={markers}
                directorMarkers={directorMarkers}
                replayPercentAtRaceProgress={replayPercentAtRaceProgress}
                tt={tt}
                setPlaying={setPlaying}
                setSpeed={setSpeed}
                setDriverFocus={setDriverFocus}
                restart={restart}
                seek={seek}
                onOpenReport={onOpenReport}
                onClose={onClose}
                closeLabel={closeLabel}
              />
            }
          />
          {afterMapContent}
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
