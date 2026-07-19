import { CARD_DEFINITIONS } from "../cards/definitions.js";
import {
  COMEBACK_CREDIT_BONUS_CAP,
  COMEBACK_CREDIT_BONUS_PER_POSITION,
  ECONOMY_MODE_CREDIT_BONUS,
  FLEET_SPONSORSHIP_CREDIT_BONUS,
  RACE_CREDITS_BY_POSITION,
  RACE_POINTS_BY_POSITION
} from "../economy/constants.js";
import type {
  CardId,
  ClassificationEntry,
  PitStrategy,
  RaceEvent,
  RaceInput,
  RaceParticipant,
  RaceResult,
  RaceSegment,
  RaceReplayFacts,
  ReplayTracePoint,
  Weather
} from "../domain/race.js";
import { RACE_SEGMENTS, clampTrait } from "../domain/race.js";
import { createPrng } from "./prng.js";

const SEGMENT_BASE_TIME: Record<RaceSegment, number> = {
  start: 18,
  early: 34,
  mid: 36,
  late: 34,
  finish: 20
};
const REPLAY_TRACE_STEPS_PER_SEGMENT = 10;
const GRID_GAP_SECONDS = 0.25;
const PIT_TRACE_WINDOW = 0.38;
const PIT_TRACE_TEAM_STAGGER = 0.035;
const DEFAULT_TRACK_LENGTH_METERS = 3200;
const TRACE_ORDER_MARGIN = 0.006;

type TeamState = {
  participant: RaceParticipant;
  scores: InternalScores;
  elapsedTime: number;
  positionDelta: number;
  resultTags: Set<string>;
  mechanicSaveAvailable: boolean;
  consumedCard?: CardId;
};

function pitStrategy(decision: RaceParticipant["decision"]): PitStrategy {
  return decision.pitStrategy ?? "standard";
}

type InternalScores = {
  pace: number;
  control: number;
  reliability: number;
  weatherReadiness: number;
  aggression: number;
  score: number;
};

export function simulateRace(input: RaceInput): RaceResult {
  if (input.participants.length < 2) {
    throw new Error("A race needs at least two participants.");
  }

  const prng = createPrng(input.seed);
  const weather = resolveWeather(input.forecast, prng.pickWeighted);
  const states = input.participants.map(createTeamState);
  const events: RaceEvent[] = [];
  const trackLengthMeters = normalizeTrackLengthMeters(input.trackLengthMeters);
  const replayTrace: ReplayTracePoint[] = [createReplayTracePoint("start", 0, states, undefined, trackLengthMeters)];

  for (const [index, segment] of RACE_SEGMENTS.entries()) {
    if (segment !== "start" && weather[segment] !== weather[previousSegment(segment)]) {
      events.push(createWeatherEvent(events.length, segment, weather[segment], states[0]?.participant.teamId ?? ""));
    }

    const beforeTimes = new Map(states.map((state) => [state.participant.teamId, state.elapsedTime]));
    const pitCosts = new Map<string, number>();
    for (const state of states) {
      applySegment(state, segment, weather[segment], input, prng.next);
      const pitCost = maybeAddPitStopEvent(state, segment, events);
      if (pitCost) pitCosts.set(state.participant.teamId, pitCost);
      maybeAddCardEvent(state, segment, weather[segment], input, events, states);
      maybeAddRiskEvent(state, segment, events, prng.next);
    }

    maybeAddFlavorEvent(segment, weather[segment], input, states, events, prng.next);
    replayTrace.push(...createReplayTraceSteps(segment, index, states, beforeTimes, pitCosts, trackLengthMeters));
  }

  const classification = classify(states);
  addFinishEvents(events, classification);
  const annotatedReplayTrace = annotateReplayOvertakes(stabilizeReplayTraceOrders(replayTrace));

  return {
    grandPrixName: input.grandPrixName,
    seed: input.seed,
    resolvedWeather: weather,
    classification,
    events: events.map((event, order) => ({ ...event, id: `evt_${String(order + 1).padStart(3, "0")}`, order })),
    replayTrace: annotatedReplayTrace,
    replayFacts: buildReplayFacts(annotatedReplayTrace),
    consumedCards: states
      .filter((state): state is TeamState & { consumedCard: CardId } => Boolean(state.consumedCard))
      .map((state) => ({ teamId: state.participant.teamId, cardId: state.consumedCard })),
    report: buildReport(input.grandPrixName, classification, events)
  };
}

function buildReplayFacts(trace: ReplayTracePoint[]): RaceReplayFacts {
  const orderChanges = trace.slice(1).flatMap((point, index) => {
    const previous = trace[index]!;
    if (point.progress >= 1) return [];
    return point.order.flatMap((teamId, toIndex) => {
      const fromIndex = previous.order.indexOf(teamId);
      if (fromIndex === -1 || fromIndex <= toIndex) return [];
      return previous.order.slice(toIndex, fromIndex).flatMap((overtakenTeamId) =>
        pitRelatedOrderChange(previous, point, teamId, overtakenTeamId)
          ? []
          : [{
              type: "order_change" as const,
              segment: point.segment,
              lap: point.lap,
              progress: point.progress,
              overtakingTeamId: teamId,
              overtakenTeamId,
              fromPosition: fromIndex + 1,
              toPosition: toIndex + 1,
              gapSeconds: Number((point.gaps[teamId] ?? 0).toFixed(1))
            }]
      );
    });
  });

  return { version: 1, orderChanges };
}

function createReplayTraceSteps(segment: RaceSegment, segmentIndex: number, states: TeamState[], beforeTimes: Map<string, number>, pitCosts = new Map<string, number>(), trackLengthMeters: number): ReplayTracePoint[] {
  const points = Array.from({ length: REPLAY_TRACE_STEPS_PER_SEGMENT }, (_, index) => {
    const ratio = (index + 1) / REPLAY_TRACE_STEPS_PER_SEGMENT;
    const progress = (segmentIndex + ratio) / RACE_SEGMENTS.length;
    const times = new Map(
      states.map((state) => {
        const before = beforeTimes.get(state.participant.teamId) ?? state.elapsedTime;
        const pitCost = pitCosts.get(state.participant.teamId) ?? 0;
        const movingDelta = state.elapsedTime - before - pitCost;
        return [state.participant.teamId, before + movingDelta * ratio + pitCost * pitTraceRatio(segment, ratio, pitTraceOffset(state.participant.teamId, pitCosts))];
      })
    );
    const point = createReplayTracePoint(segment, progress, states, times, trackLengthMeters);
    return {
      ...point,
      cars: Object.fromEntries(
        states.map((state) => {
          const teamId = state.participant.teamId;
          const offset = pitTraceOffset(teamId, pitCosts);
          const phase = progress >= 1 ? "finished" : pitTracePhase(segment, ratio, offset, pitCosts.has(teamId));
          const trackProgress = replayCarTrackProgress(progress, phase, point.gaps[teamId] ?? 0, pitLaneProgress(segmentIndex, segment, offset));
          return [teamId, { trackProgress, distanceMeters: Number((trackProgress * trackLengthMeters).toFixed(1)), speed: replayCarSpeed(phase), phase }];
        })
      )
    };
  });

  for (const state of states) {
    const teamId = state.participant.teamId;
    let lastProgress = segmentIndex / RACE_SEGMENTS.length;
    for (const point of points) {
      const car = point.cars?.[teamId];
      if (!car) continue;
      car.trackProgress = Math.max(lastProgress, car.trackProgress);
      lastProgress = car.trackProgress;
    }
  }

  return points.map((point) => ({ ...point, order: orderFromTraceCars(point, states) }));
}

function pitTraceRatio(segment: RaceSegment, ratio: number, offset = 0) {
  const center: Partial<Record<RaceSegment, number>> = { early: 0.38, mid: 0.5, late: 0.62 };
  const pitCenter = center[segment];
  if (pitCenter === undefined) return ratio;
  return Math.max(0, Math.min(1, (ratio - (pitCenter + offset - PIT_TRACE_WINDOW / 2)) / PIT_TRACE_WINDOW));
}

function pitTraceOffset(teamId: string, pitCosts: Map<string, number>) {
  const pitTeamIds = [...pitCosts.keys()].sort();
  const index = pitTeamIds.indexOf(teamId);
  return index < 0 ? 0 : (index - (pitTeamIds.length - 1) / 2) * PIT_TRACE_TEAM_STAGGER;
}

function pitTracePhase(segment: RaceSegment, ratio: number, offset: number, stopped: boolean): NonNullable<ReplayTracePoint["cars"]>[string]["phase"] {
  if (!stopped) return "racing";
  const center: Partial<Record<RaceSegment, number>> = { early: 0.38, mid: 0.5, late: 0.62 };
  const pitCenter = center[segment];
  if (pitCenter === undefined) return "racing";
  const start = pitCenter + offset - PIT_TRACE_WINDOW / 2;
  const end = pitCenter + offset + PIT_TRACE_WINDOW / 2;
  if (ratio < start || ratio > end) return "racing";
  const local = (ratio - start) / (end - start || 1);
  if (local < 0.34) return "pit_entry";
  if (local < 0.67) return "pit_stop";
  return "pit_exit";
}

function replayCarTrackProgress(progress: number, phase: NonNullable<ReplayTracePoint["cars"]>[string]["phase"], gapSeconds: number, pitProgress: number) {
  if (phase === "pit_stop") return Number(Math.max(0, Math.min(1, pitProgress)).toFixed(4));
  const lag = Math.min(0.12, gapSeconds / 180);
  const pitLag = phase === "pit_entry" || phase === "pit_exit" ? 0.02 : 0;
  return Number(Math.max(0, Math.min(1, progress - lag - pitLag)).toFixed(4));
}

function replayCarSpeed(phase: NonNullable<ReplayTracePoint["cars"]>[string]["phase"]) {
  if (phase === "pit_stop" || phase === "grid" || phase === "finished") return 0;
  if (phase === "pit_entry" || phase === "pit_exit") return 0.35;
  if (phase === "overtake_approach" || phase === "overtake_overlap" || phase === "overtake_pass") return 1.08;
  if (phase === "overtake_settle") return 1;
  return 1;
}

function pitLaneProgress(segmentIndex: number, segment: RaceSegment, offset: number) {
  const center: Partial<Record<RaceSegment, number>> = { early: 0.38, mid: 0.5, late: 0.62 };
  return (segmentIndex + (center[segment] ?? 0.5) + offset) / RACE_SEGMENTS.length;
}

function normalizeTrackLengthMeters(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(1200, Math.min(8000, Math.round(value))) : DEFAULT_TRACK_LENGTH_METERS;
}

function createReplayTracePoint(segment: RaceSegment, progress: number, states: TeamState[], elapsedTimes?: Map<string, number>, trackLengthMeters = DEFAULT_TRACK_LENGTH_METERS): ReplayTracePoint {
  const isGrid = !elapsedTimes;
  const timesByTeam = elapsedTimes ?? new Map<string, number>();
  const sorted =
    isGrid
      ? [...states].sort((left, right) => left.participant.standingsRank - right.participant.standingsRank)
      : [...states].sort((left, right) => (timesByTeam.get(left.participant.teamId) ?? left.elapsedTime) - (timesByTeam.get(right.participant.teamId) ?? right.elapsedTime) || right.scores.score - left.scores.score);
  const leaderTime = sorted[0] ? (timesByTeam.get(sorted[0].participant.teamId) ?? sorted[0].elapsedTime) : 0;

  return {
    segment,
    lap: lapForSegment(segment),
    progress,
    distanceMeters: Number((progress * trackLengthMeters).toFixed(1)),
    order: sorted.map((state) => state.participant.teamId),
    times: Object.fromEntries(
      sorted.map((state) => [
        state.participant.teamId,
        isGrid ? 0 : Number((timesByTeam.get(state.participant.teamId) ?? state.elapsedTime).toFixed(1))
      ])
    ),
    gaps: Object.fromEntries(
      sorted.map((state) => [
        state.participant.teamId,
        isGrid ? 0 : Math.max(0, Number(((timesByTeam.get(state.participant.teamId) ?? state.elapsedTime) - leaderTime).toFixed(1)))
      ])
    ),
    cars: isGrid
      ? Object.fromEntries(sorted.map((state) => [state.participant.teamId, { trackProgress: 0, distanceMeters: 0, speed: 0, phase: "grid" as const }]))
      : undefined
  };
}

function orderFromTraceCars(point: ReplayTracePoint, states: TeamState[]) {
  if (!point.cars || point.progress >= 1) return point.order;
  return [...states]
    .sort(
      (left, right) =>
        (point.cars?.[right.participant.teamId]?.trackProgress ?? 0) - (point.cars?.[left.participant.teamId]?.trackProgress ?? 0) ||
        (point.times[left.participant.teamId] ?? 999) - (point.times[right.participant.teamId] ?? 999) ||
        right.scores.score - left.scores.score
    )
    .map((state) => state.participant.teamId);
}

function annotateReplayOvertakes(trace: ReplayTracePoint[]) {
  const points = trace.map((point) => ({ ...point, cars: point.cars ? { ...point.cars } : undefined }));
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1]!;
    const point = points[index]!;
    for (const teamId of point.order) {
      const from = previous.order.indexOf(teamId);
      const to = point.order.indexOf(teamId);
      if (from < 0 || from <= to) continue;
      const overtakenTeamIds = previous.order.slice(to, from).filter((overtakenTeamId) => !pitRelatedOrderChange(previous, point, teamId, overtakenTeamId));
      if (!overtakenTeamIds.length) continue;
      setReplayCarPhase(points[index - 2], teamId, "overtake_approach");
      setReplayCarPhase(previous, teamId, "overtake_overlap");
      setReplayCarPhase(point, teamId, "overtake_pass");
      setReplayCarPhase(points[index + 1], teamId, "overtake_settle");
      for (const overtakenTeamId of overtakenTeamIds) {
        setReplayCarPhase(previous, overtakenTeamId, "overtake_overlap");
        setReplayCarPhase(point, overtakenTeamId, "overtake_pass");
      }
    }
  }
  return points;
}

function stabilizeReplayTraceOrders(trace: ReplayTracePoint[]) {
  let previousOrder = trace[0]?.order ?? [];
  return trace.map((point) => {
    if (!point.cars || point.progress >= 1) {
      previousOrder = point.order;
      return point;
    }
    const previousRank = new Map(previousOrder.map((teamId, index) => [teamId, index]));
    const order = [...point.order].sort((left, right) => {
      const delta = (point.cars?.[right]?.trackProgress ?? 0) - (point.cars?.[left]?.trackProgress ?? 0);
      return Math.abs(delta) >= TRACE_ORDER_MARGIN ? delta : (previousRank.get(left) ?? 999) - (previousRank.get(right) ?? 999);
    });
    previousOrder = order;
    return { ...point, order };
  });
}

function pitRelatedOrderChange(previous: ReplayTracePoint, point: ReplayTracePoint, teamId: string, overtakenTeamId: string) {
  return [teamId, overtakenTeamId].some((id) => [previous.cars?.[id]?.phase, point.cars?.[id]?.phase].some((phase) => phase?.startsWith("pit")));
}

function setReplayCarPhase(point: ReplayTracePoint | undefined, teamId: string, phase: NonNullable<ReplayTracePoint["cars"]>[string]["phase"]) {
  const car = point?.cars?.[teamId];
  if (!car || car.phase.startsWith("pit") || car.phase === "grid" || car.phase === "finished") return;
  point!.cars![teamId] = { ...car, phase, speed: replayCarSpeed(phase) };
}

function createTeamState(participant: RaceParticipant): TeamState {
  const scores: InternalScores = {
    pace: 50,
    control: 50,
    reliability: 50,
    weatherReadiness: 50,
    aggression: 50,
    score: 0
  };

  applyDecision(scores, participant);

  return {
    participant,
    scores,
    elapsedTime: Math.max(0, participant.standingsRank - 1) * GRID_GAP_SECONDS,
    positionDelta: 0,
    resultTags: new Set(),
    mechanicSaveAvailable: participant.decision.cardId === "fleet_maintenance",
    consumedCard: participant.decision.cardId
  };
}

function applyDecision(scores: InternalScores, participant: RaceParticipant) {
  const { approach, preparation } = participant.decision;

  if (approach === "prudent") {
    scores.pace -= 8;
    scores.control += 12;
    scores.reliability += 12;
    scores.aggression -= 12;
  } else if (approach === "balanced") {
    scores.control += 4;
    scores.reliability += 4;
    scores.weatherReadiness += 4;
  } else if (approach === "aggressive") {
    scores.pace += 14;
    scores.control -= 8;
    scores.reliability -= 8;
    scores.aggression += 16;
  }

  if (preparation === "speed") {
    scores.pace += 9;
    scores.reliability -= 4;
  } else if (preparation === "reliability") {
    scores.reliability += 16;
    scores.control += 8;
    scores.pace -= 2;
  } else {
    scores.weatherReadiness += 20;
    scores.control += 3;
    scores.pace -= 2;
  }

  if (pitStrategy(participant.decision) === "heavy_pack") {
    scores.pace -= 8;
    scores.reliability += 10;
    scores.control += 4;
  } else if (pitStrategy(participant.decision) === "mini_pack") {
    scores.pace += 9;
    scores.aggression += 4;
    scores.reliability -= 5;
  }

  if (participant.botArchetype === "rain_specialist") {
    scores.weatherReadiness += 6;
  } else if (participant.botArchetype === "sprinter") {
    scores.pace += 4;
    scores.aggression += 4;
  } else if (participant.botArchetype === "mechanic") {
    scores.reliability += 6;
  }

  if (participant.decision.cardId === "soft_tires") {
    scores.pace += 8;
    scores.aggression += 6;
    scores.reliability -= 10;
  } else if (participant.decision.cardId === "defensive_order") {
    scores.control += 7;
    scores.reliability += 5;
    scores.aggression -= 12;
    scores.pace -= 8;
  } else if (participant.decision.cardId === "adjustable_wing") {
    scores.pace += 4;
    scores.aggression += 5;
    scores.reliability -= 6;
  } else if (participant.decision.cardId === "economy_mode") {
    scores.pace -= 5;
    scores.control += 5;
  } else if (participant.decision.cardId === "hard_tires") {
    scores.pace -= 6;
    scores.reliability += 10;
    scores.control += 4;
  } else if (participant.decision.cardId === "calculated_attack") {
    scores.aggression += 7;
  }
}

function maybeAddPitStopEvent(state: TeamState, segment: RaceSegment, events: RaceEvent[]) {
  const strategy = pitStrategy(state.participant.decision);
  if (strategy === "heavy_pack") return;
  if (strategy === "standard" && segment !== "mid") return;
  if (strategy === "mini_pack" && segment !== "early" && segment !== "late") return;

  const stopCost = strategy === "mini_pack" ? 4 : 6;
  state.elapsedTime += stopCost;
  state.scores.score += strategy === "mini_pack" ? 4 : 0;
  state.resultTags.add(strategy);
  events.push({
    id: "",
    order: events.length,
    segment,
    lap: lapForSegment(segment),
    type: "pit_stop",
    teamId: state.participant.teamId,
    severity: "minor",
    positionDelta: 0,
    tags: ["pit_stop", strategy],
    replayText: `${state.participant.teamName} swaps battery pack in the pit`,
    reportText: `${state.participant.teamName} lost ${stopCost.toFixed(1)}s on a battery swap.`
  });
  return stopCost;
}

function resolveWeather(
  forecast: RaceInput["forecast"],
  pickWeighted: <T extends string>(weights: Record<T, number>) => T
): Record<RaceSegment, Weather> {
  const mid = pickWeighted(forecast);
  const late = mid === "dry" ? pickWeighted({ dry: 70, light_rain: 25, heavy_rain: 5 }) : mid;

  return {
    start: "dry",
    early: pickWeighted({ dry: 80, light_rain: 18, heavy_rain: 2 }),
    mid,
    late,
    finish: late === "heavy_rain" ? "light_rain" : late
  };
}

function applySegment(
  state: TeamState,
  segment: RaceSegment,
  weather: Weather,
  input: RaceInput,
  next: () => number
) {
  const { scores } = state;
  const traits = raceTraits(input, weather, segment);
  const weatherPenalty =
    weather === "dry" ? 0 : Math.max(0, 56 - scores.weatherReadiness) * (weather === "heavy_rain" ? 0.18 : 0.1) * (1 + (60 - traits.grip) / 120);
  const circuitBonus = circuitFit(state, input);
  const variance = (next() - 0.5) * 8;
  let delta =
    circuitBonus +
    variance -
    weatherPenalty +
    ((traits.grip - 60) * scores.control + (traits.overtaking - 60) * scores.aggression + (traits.energy - 60) * scores.reliability) / 650;

  if (segment === "start") {
    delta += scores.pace * 0.35 + scores.aggression * 0.35 + scores.control * 0.3;
  } else if (segment === "early") {
    delta += scores.pace * 0.45 + scores.control * 0.35;
  } else if (segment === "mid") {
    delta += scores.pace * 0.3 + scores.control * 0.25 + scores.weatherReadiness * 0.3;
  } else if (segment === "late") {
    delta += scores.reliability * 0.4 + scores.control * 0.25 + scores.pace * 0.25 - scores.aggression * 0.1;
  } else {
    delta += scores.score * 0.05 + scores.pace * 0.2 + scores.control * 0.2;
  }

  if (state.participant.decision.cardId === "fleet_sponsorship") {
    delta -= 0.9;
  }

  scores.score += delta;
  state.elapsedTime += segmentTime(segment, delta);
}

function segmentTime(segment: RaceSegment, delta: number) {
  const base = SEGMENT_BASE_TIME[segment];
  return Math.max(base * 0.72, Math.min(base * 1.28, base - delta * 0.16));
}

function raceTraits(input: RaceInput, weather: Weather, segment: RaceSegment) {
  const traits = input.traits ?? traitsFromTags(input);
  const rainGrip = weather === "heavy_rain" ? -12 : weather === "light_rain" ? -5 : 0;
  const lateRace = Math.max(0, lapForSegment(segment) - 1);

  return {
    grip: clampTrait(traits.grip + rainGrip),
    overtaking: clampTrait(traits.overtaking + (weather === "dry" ? 0 : 3)),
    energy: clampTrait(traits.energy - lateRace * 2 - (weather === "heavy_rain" ? 5 : 0))
  };
}

function traitsFromTags(input: RaceInput) {
  const profile = { grip: 62, overtaking: 62, energy: 62 };

  for (const trait of [input.primaryTrait, input.secondaryTrait]) {
    if (trait === "fast") profile.energy += 5;
    if (trait === "technical") profile.grip += 8;
    if (trait === "urban") profile.overtaking += 10;
    if (trait === "high_wear") profile.energy -= 10;
    if (trait === "weather_sensitive") profile.grip += 6;
  }

  return profile;
}

function circuitFit(state: TeamState, input: RaceInput) {
  const traits = [input.primaryTrait, input.secondaryTrait];
  let bonus = 0;

  for (const trait of traits) {
    if (trait === "fast") bonus += state.scores.pace * 0.08;
    if (trait === "technical" || trait === "urban") bonus += state.scores.control * 0.08;
    if (trait === "high_wear") bonus += state.scores.reliability * 0.08;
    if (trait === "weather_sensitive") bonus += state.scores.weatherReadiness * 0.08;
  }

  return bonus;
}

function maybeAddCardEvent(
  state: TeamState,
  segment: RaceSegment,
  weather: Weather,
  input: RaceInput,
  events: RaceEvent[],
  states: TeamState[]
) {
  const cardId = state.participant.decision.cardId;
  if (!cardId) return;

  if (cardId === "rain_grip" && segment === "mid") {
    const rained = weather !== "dry";
    state.scores.score += rained ? 22 : -12;
    state.positionDelta += rained ? 15 : -8;
    state.resultTags.add(rained ? "weather_gamble" : "wrong_weather_bet");
    events.push(createCardEvent(events.length, state, segment, rained ? "weather_gamble_paid" : "wrong_weather_bet", rained ? 15 : -8));
  } else if (cardId === "launch_boost" && segment === "start") {
    state.scores.score += 26;
    state.scores.reliability -= 5;
    state.positionDelta += 8;
    state.resultTags.add("launch_boost");
    events.push(createCardEvent(events.length, state, segment, "card_triggered", 8));
  } else if (cardId === "urban_draft" && segment === "mid" && state.participant.decision.rivalTeamId) {
    const rival = states.find((candidate) => candidate.participant.teamId === state.participant.decision.rivalTeamId);
    if (rival) {
      state.scores.score += 15;
      rival.scores.score -= 6;
      state.positionDelta += 8;
      state.resultTags.add("rival_pressure");
      events.push(createCardEvent(events.length, state, segment, "rival_overtake", 8, rival.participant.teamId));
    }
  } else if (cardId === "final_surge" && segment === "finish") {
    const outsidePodium = state.participant.standingsRank > 3;
    state.scores.score += outsidePodium ? 22 : 8;
    state.scores.reliability -= 8;
    state.positionDelta += outsidePodium ? 15 : 8;
    state.resultTags.add("final_surge");
    events.push(createCardEvent(events.length, state, segment, "late_push_gain", outsidePodium ? 15 : 8));
  } else if (cardId === "fleet_maintenance" && segment === "late" && !state.resultTags.has("mechanic_save")) {
    state.resultTags.add("maintenance_ready");
    events.push(createCardEvent(events.length, state, segment, "card_triggered", 0));
  } else if (cardId === "fleet_sponsorship" && segment === "finish") {
    state.resultTags.add("sponsor_bonus");
    events.push(createCardEvent(events.length, state, segment, "sponsor_payout", 0));
  } else if (cardId === "soft_tires" && segment === "early") {
    state.scores.score += 10;
    state.scores.reliability -= 7;
    state.positionDelta += 8;
    state.resultTags.add("soft_tires");
    events.push(createCardEvent(events.length, state, segment, "card_triggered", 8));
  } else if (cardId === "defensive_order" && segment === "late") {
    state.resultTags.add("defensive_order");
    events.push(createCardEvent(events.length, state, segment, "held_position", 0));
  } else if (cardId === "adjustable_wing" && segment === "early") {
    const suitedCircuit = input.primaryTrait === "fast" || input.secondaryTrait === "fast" || input.primaryTrait === "urban" || input.secondaryTrait === "urban";
    state.scores.score += suitedCircuit ? 14 : 5;
    state.scores.reliability -= 4;
    state.positionDelta += suitedCircuit ? 8 : 0;
    state.resultTags.add("adjustable_wing");
    events.push(createCardEvent(events.length, state, segment, "card_triggered", suitedCircuit ? 8 : 0));
  } else if (cardId === "rain_mapping" && segment === "mid") {
    const rained = weather !== "dry";
    state.scores.score += rained ? 18 : -5;
    state.positionDelta += rained ? 8 : 0;
    state.resultTags.add(rained ? "rain_mapping" : "wrong_weather_bet");
    events.push(createCardEvent(events.length, state, segment, rained ? "weather_gamble_paid" : "wrong_weather_bet", rained ? 8 : 0));
  } else if (cardId === "economy_mode" && segment === "finish") {
    state.resultTags.add("economy_mode");
    events.push(createCardEvent(events.length, state, segment, "sponsor_payout", 0));
  } else if (cardId === "pit_relay" && segment === "late") {
    state.scores.score += 15;
    state.scores.reliability += 6;
    state.positionDelta += 8;
    state.resultTags.add("pit_relay");
    events.push(createCardEvent(events.length, state, segment, "held_position", 8));
  } else if (cardId === "hard_tires" && segment === "late") {
    state.scores.score += 14;
    state.positionDelta += 8;
    state.resultTags.add("hard_tires");
    events.push(createCardEvent(events.length, state, segment, "late_push_gain", 8));
  } else if (cardId === "calculated_attack" && segment === "mid") {
    const target = carAhead(state, states);
    const closeEnough = target && state.elapsedTime - target.elapsedTime <= 2;
    if (closeEnough) {
      state.scores.score += 20;
      state.positionDelta += 8;
      state.resultTags.add("calculated_attack");
      events.push(createCardEvent(events.length, state, segment, "rival_overtake", 8, target.participant.teamId));
    } else {
      state.resultTags.add("calculated_attack_missed");
      events.push(createCardEvent(events.length, state, segment, "card_triggered", 0));
    }
  }
}

function carAhead(state: TeamState, states: TeamState[]) {
  const sorted = [...states].sort((left, right) => left.elapsedTime - right.elapsedTime);
  return sorted[sorted.findIndex((candidate) => candidate.participant.teamId === state.participant.teamId) - 1];
}

function maybeAddRiskEvent(state: TeamState, segment: RaceSegment, events: RaceEvent[], next: () => number) {
  if (segment !== "late") return;

  const risk = Math.max(0, 58 - state.scores.reliability) + Math.max(0, state.scores.aggression - 56);
  if (next() * 100 >= risk) return;

  if (state.mechanicSaveAvailable) {
    state.mechanicSaveAvailable = false;
    state.resultTags.add("mechanic_save");
    events.push(createCardEvent(events.length, state, segment, "mechanic_save", 0));
    return;
  }

  state.scores.score -= 12;
  state.positionDelta -= 1;
  state.resultTags.add("mechanical_scare");
  events.push({
    id: "",
    order: events.length,
    segment,
    lap: lapForSegment(segment),
    type: "mechanical_scare",
    teamId: state.participant.teamId,
    severity: "major",
    positionDelta: -1,
    tags: ["reliability"],
    replayText: `${state.participant.teamName} hits a late mechanical scare`,
    reportText: `${state.participant.teamName} lost time to a late reliability scare.`
  });
}

function maybeAddFlavorEvent(
  segment: RaceSegment,
  weather: Weather,
  input: RaceInput,
  states: TeamState[],
  events: RaceEvent[],
  next: () => number
) {
  if (segment === "start") return;

  const state = states[Math.floor(next() * states.length)] ?? states[0];
  if (!state) return;

  const replayTextBySegment: Record<RaceSegment, string> = {
    start: "",
    early: `${state.participant.teamName} settles into the ${traitLabel(input.primaryTrait)} sector`,
    mid:
      weather === "dry"
        ? `${state.participant.teamName} keeps the pace stable on a dry middle stint`
        : `${state.participant.teamName} searches for grip as ${weatherLabel(weather)} arrives`,
    late: `${state.participant.teamName} manages energy into the closing laps`,
    finish: `Pit walls call final targets as ${state.participant.teamName} pushes to the line`
  };

  events.push({
    id: "",
    order: events.length,
    segment,
    lap: lapForSegment(segment),
    type: "race_note",
    teamId: state.participant.teamId,
    severity: "minor",
    positionDelta: 0,
    tags: ["flavor"],
    replayText: replayTextBySegment[segment],
    reportText: replayTextBySegment[segment] + "."
  });
}

function classify(states: TeamState[]): ClassificationEntry[] {
  const sorted = [...states].sort((left, right) => left.elapsedTime - right.elapsedTime || right.scores.score - left.scores.score);

  return sorted.map((state, index) => {
    const position = index + 1;
    const baseCredits = RACE_CREDITS_BY_POSITION[index] ?? 100;
    const comebackBonus = Math.min(COMEBACK_CREDIT_BONUS_CAP, Math.max(0, position - RACE_POINTS_BY_POSITION.length) * COMEBACK_CREDIT_BONUS_PER_POSITION);
    const sponsorBonus = state.participant.decision.cardId === "fleet_sponsorship" ? FLEET_SPONSORSHIP_CREDIT_BONUS : 0;
    const economyBonus = state.participant.decision.cardId === "economy_mode" && position <= 4 ? ECONOMY_MODE_CREDIT_BONUS : 0;

    return {
      position,
      teamId: state.participant.teamId,
      teamName: state.participant.teamName,
      points: RACE_POINTS_BY_POSITION[index] ?? 0,
      credits: baseCredits + comebackBonus + sponsorBonus + economyBonus,
      score: Number(state.scores.score.toFixed(2)),
      positionChange: state.participant.standingsRank - position,
      status: "finished",
      resultTags: [...state.resultTags]
    };
  });
}

function addFinishEvents(events: RaceEvent[], classification: ClassificationEntry[]) {
  for (const entry of classification.slice(0, 3)) {
    events.push({
      id: "",
      order: events.length,
      segment: "finish",
      lap: lapForSegment("finish"),
      type: "finish",
      teamId: entry.teamId,
      severity: entry.position === 1 ? "major" : "minor",
      positionDelta: entry.positionChange,
      tags: ["classification"],
      replayText: `${entry.teamName} finishes P${entry.position}`,
      reportText: `${entry.teamName} finished P${entry.position}.`
    });
  }
}

function buildReport(grandPrixName: string, classification: ClassificationEntry[], events: RaceEvent[]): RaceResult["report"] {
  const winner = classification[0];
  if (!winner) {
    throw new Error("Race classification cannot be empty.");
  }

  const keyEvents = events.filter((event) => event.severity === "major").slice(0, 4);

  return {
    headline: `${grandPrixName}: ${winner.teamName} wins from P${winner.position}.`,
    blocks: [
      {
        title: "Key moments",
        body: keyEvents.length > 0 ? keyEvents.map((event) => event.reportText).join(" ") : "The race stayed clean and was decided by overall pace."
      },
      {
        title: "Rewards",
        body: classification.map((entry) => `${entry.teamName}: ${entry.points} pts, ${entry.credits} credits`).join(" · ")
      }
    ]
  };
}

function createWeatherEvent(order: number, segment: RaceSegment, weather: Weather, teamId: string): RaceEvent {
  return {
    id: "",
    order,
    segment,
    lap: lapForSegment(segment),
    type: "weather_change",
    teamId,
    severity: "major",
    positionDelta: 0,
    tags: ["weather"],
    replayText: `Weather shifts to ${weatherLabel(weather)}`,
    reportText: `The weather shifted to ${weatherLabel(weather)} during ${segment}.`
  };
}

function createCardEvent(
  order: number,
  state: TeamState,
  segment: RaceSegment,
  type: RaceEvent["type"],
  positionDelta: number,
  relatedTeamId?: string
): RaceEvent {
  const cardId = state.participant.decision.cardId;
  if (!cardId) {
    throw new Error("Cannot create a card event without a card.");
  }
  const card = CARD_DEFINITIONS[cardId];

  return {
    id: "",
    order,
    segment,
    lap: lapForSegment(segment),
    type,
    teamId: state.participant.teamId,
    relatedTeamId,
    cardId,
    severity: Math.abs(positionDelta) > 0 || type === "mechanic_save" ? "major" : "minor",
    positionDelta,
    tags: ["card", card.family],
    replayText: `${card.name} triggers for ${state.participant.teamName}`,
    reportText: `${state.participant.teamName}: ${card.playerPromise}`
  };
}

function previousSegment(segment: RaceSegment): RaceSegment {
  const index = RACE_SEGMENTS.indexOf(segment);
  return RACE_SEGMENTS[Math.max(0, index - 1)] ?? "start";
}

function lapForSegment(segment: RaceSegment) {
  const laps: Record<RaceSegment, number> = {
    start: 1,
    early: 2,
    mid: 5,
    late: 8,
    finish: 10
  };

  return laps[segment];
}

function weatherLabel(weather: Weather) {
  return weather.replace("_", " ");
}

function traitLabel(trait: RaceInput["primaryTrait"]) {
  return trait.replace("_", " ");
}
