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
  RaceEvent,
  RaceInput,
  RaceParticipant,
  RaceResult,
  RaceSegment,
  ReplayTracePoint,
  Weather
} from "../domain/race.js";
import { zoneForRaceSegment, type TrackZone } from "../domain/circuits.js";
import { RACE_SEGMENTS, clampTrait } from "../domain/race.js";
import { createChronoFinalTimes, createChronoReplayTrace, createChronoScores, pitStrategy, replayCarSpeed, type ChronoScores } from "./chronoRaceEngine.js";
import { createPrng } from "./prng.js";
import { buildReplayFacts, withTraceEventProgress } from "./replayTrace.js";

export { motionParametersForDecision } from "./chronoRaceEngine.js";

const SEGMENT_BASE_TIME: Record<RaceSegment, number> = {
  start: 18,
  early: 34,
  mid: 36,
  late: 34,
  finish: 20
};
export const RACE_REPLAY_BASE_SECONDS = Object.values(SEGMENT_BASE_TIME).reduce((sum, seconds) => sum + seconds, 0);
const REPLAY_TRACE_STEPS_PER_SEGMENT = 20;
const GRID_GAP_SECONDS = 0.25;
const DEFAULT_TRACK_LENGTH_METERS = 3200;
const TRACE_ORDER_MARGIN = 0.006;
const DEFENSE_GAP_PROGRESS = 0.012;
const REPLAY_SPEED_ACCELERATION_PER_POINT = 0.18;
const REPLAY_SPEED_BRAKING_PER_POINT = 0.24;

type TeamState = {
  participant: RaceParticipant;
  scores: InternalScores;
  elapsedTime: number;
  positionDelta: number;
  resultTags: Set<string>;
  mechanicSaveAvailable: boolean;
  consumedCard?: CardId;
};

type InternalScores = ChronoScores;

type TraceSegmentSnapshot = {
  segment: RaceSegment;
  pitCosts: Map<string, number>;
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
  const laps = normalizeLaps(input.laps);
  const pitLaneProgress = normalizePitLaneProgress(input.pitLaneProgress);
  const trackZones = normalizeTrackZones(input.trackZones);
  const speedProfile = input.speedProfile ?? [];
  const traceSegments: TraceSegmentSnapshot[] = [];

  for (const segment of RACE_SEGMENTS) {
    if (segment !== "start" && weather[segment] !== weather[previousSegment(segment)]) {
      events.push(createWeatherEvent(events.length, segment, weather[segment], states[0]?.participant.teamId ?? ""));
    }

    const pitCosts = new Map<string, number>();
    const elapsedTimes = new Map(states.map((state) => [state.participant.teamId, state.elapsedTime]));
    for (const state of states) {
      applySegment(state, segment, weather[segment], input, prng.next);
      const pitCost = maybeAddPitStopEvent(state, segment, events);
      if (pitCost) pitCosts.set(state.participant.teamId, pitCost);
      maybeAddCardEvent(state, segment, weather[segment], input, events, states, elapsedTimes);
      maybeAddRiskEvent(state, segment, events, prng.next);
    }

    maybeAddFlavorEvent(segment, weather[segment], input, states, events, prng.next);
    maybeAddMiniInfoEvents(segment, weather[segment], states, events);
    traceSegments.push({ segment, pitCosts });
  }

  const chronoFinalTimes = createChronoFinalTimes(states, traceSegments, {
    trackLengthMeters,
    laps,
    speedProfile,
    weather,
    input,
    next: prng.next,
    baseReplaySeconds: RACE_REPLAY_BASE_SECONDS,
    defaultTrackLengthMeters: DEFAULT_TRACK_LENGTH_METERS,
    gridGapSeconds: GRID_GAP_SECONDS
  });
  for (const state of states) state.elapsedTime = chronoFinalTimes.get(state.participant.teamId) ?? state.elapsedTime;

  const classification = classify(states);
  addFinishEvents(events, classification);
  const distanceReplayTrace = createChronoReplayTrace(states, {
    classification,
    snapshots: traceSegments,
    trackLengthMeters,
    laps,
    pitLaneProgress,
    speedProfile,
    weather,
    energy: input.traits?.energy ?? 62,
    replayStepsPerSegment: REPLAY_TRACE_STEPS_PER_SEGMENT,
    gridGapSeconds: GRID_GAP_SECONDS
  });
  const stableReplayTrace = stabilizeReplayTraceOrders(stabilizeReplayCarProgress(distanceReplayTrace, trackLengthMeters));
  const trafficReplayTrace = stableReplayTrace.map((point) => point.cars ? { ...point, cars: annotateTrafficDefense(point.cars, states, point.order) } : point);
  const annotatedReplayTrace = smoothReplayTraceSpeeds(annotateReplayOvertakes(trafficReplayTrace));
  const replayEvents = withTraceEventProgress(events, annotatedReplayTrace, laps, trackZones);

  return {
    grandPrixName: input.grandPrixName,
    seed: input.seed,
    resolvedWeather: weather,
    classification,
    events: replayEvents.map((event, order) => ({ ...event, id: `evt_${String(order + 1).padStart(3, "0")}`, order })),
    replayTrace: annotatedReplayTrace,
    replayFacts: buildReplayFacts(annotatedReplayTrace, replayEvents, classification, weather, laps, trackZones),
    consumedCards: states
      .filter((state): state is TeamState & { consumedCard: CardId } => Boolean(state.consumedCard))
      .map((state) => ({ teamId: state.participant.teamId, cardId: state.consumedCard })),
    report: buildReport(input.grandPrixName, classification, replayEvents)
  };
}

function stabilizeReplayCarProgress(trace: ReplayTracePoint[], trackLengthMeters: number) {
  const previousProgress = new Map<string, number>();
  return trace.map((point) => {
    if (!point.cars) return point;
    const cars = Object.fromEntries(
      Object.entries(point.cars).map(([teamId, car]) => {
        const previous = previousProgress.get(teamId) ?? car.trackProgress;
        const trackProgress = car.phase === "grid" ? car.trackProgress : Math.max(previous, car.trackProgress);
        previousProgress.set(teamId, trackProgress);
        return [teamId, { ...car, trackProgress: Number(trackProgress.toFixed(4)), distanceMeters: Number((trackProgress * trackLengthMeters).toFixed(1)) }];
      })
    );
    return { ...point, cars };
  });
}

function annotateTrafficDefense(cars: NonNullable<ReplayTracePoint["cars"]>, states: TeamState[], order = orderFromCars(cars, states)) {
  const updates = new Map<string, NonNullable<ReplayTracePoint["cars"]>[string]>();
  for (let index = 0; index < order.length - 1; index += 1) {
    const aheadId = order[index]!;
    const behindId = order[index + 1]!;
    const ahead = cars[aheadId];
    const behind = cars[behindId];
    if (!ahead || !behind || ahead.phase !== "racing" || behind.phase !== "racing") continue;
    const gap = ahead.trackProgress - behind.trackProgress;
    const close = gap >= 0 && gap <= DEFENSE_GAP_PROGRESS;
    if (close) updates.set(aheadId, { ...ahead, phase: "defending", speed: Number(Math.min(ahead.speed, 0.96).toFixed(3)) });
  }
  return updates.size ? { ...cars, ...Object.fromEntries(updates) } : cars;
}

function orderFromCars(cars: ReplayTracePoint["cars"], states: TeamState[]) {
  return [...states]
    .sort(
      (left, right) =>
        (cars?.[right.participant.teamId]?.trackProgress ?? 0) - (cars?.[left.participant.teamId]?.trackProgress ?? 0) ||
        (cars?.[right.participant.teamId]?.speed ?? 0) - (cars?.[left.participant.teamId]?.speed ?? 0) ||
        classificationScore(right) - classificationScore(left)
    )
    .map((state) => state.participant.teamId);
}

function normalizeTrackLengthMeters(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(1200, Math.min(8000, Math.round(value))) : DEFAULT_TRACK_LENGTH_METERS;
}

function normalizeLaps(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(1, Math.min(99, Math.round(value))) : 10;
}

function normalizePitLaneProgress(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(0.999, value)) : 0.5;
}

function normalizeTrackZones(zones: RaceInput["trackZones"]): TrackZone[] {
  return zones?.length ? zones.filter(validTrackZone) : RACE_SEGMENTS.map(zoneForRaceSegment);
}

function validTrackZone(zone: TrackZone) {
  return ["sector", "overtake", "technical", "pit"].includes(zone.kind) &&
    zone.label.length > 0 &&
    validProgress(zone.startProgress) &&
    validProgress(zone.endProgress);
}

function validProgress(progress: number) {
  return Number.isFinite(progress) && progress >= 0 && progress < 1;
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

function smoothReplayTraceSpeeds(trace: ReplayTracePoint[]) {
  const lastSpeeds = new Map<string, number>();
  return trace.map((point) => {
    if (!point.cars) return point;
    const cars = Object.fromEntries(
      Object.entries(point.cars).map(([teamId, car]) => {
        if (car.phase === "grid" || car.phase === "finished") {
          lastSpeeds.set(teamId, 0);
          return [teamId, { ...car, speed: 0 }];
        }

        const previous = lastSpeeds.get(teamId) ?? car.speed;
        const maxDelta = car.speed >= previous ? REPLAY_SPEED_ACCELERATION_PER_POINT : REPLAY_SPEED_BRAKING_PER_POINT;
        const speed = previous + Math.max(-maxDelta, Math.min(maxDelta, car.speed - previous));
        const roundedSpeed = Number(speed.toFixed(3));
        lastSpeeds.set(teamId, roundedSpeed);
        return [teamId, { ...car, speed: roundedSpeed }];
      })
    );
    return { ...point, cars };
  });
}

function createTeamState(participant: RaceParticipant): TeamState {
  return {
    participant,
    scores: createChronoScores(participant),
    elapsedTime: Math.max(0, participant.standingsRank - 1) * GRID_GAP_SECONDS,
    positionDelta: 0,
    resultTags: new Set(),
    mechanicSaveAvailable: participant.decision.cardId === "fleet_maintenance",
    consumedCard: participant.decision.cardId
  };
}

function maybeAddPitStopEvent(state: TeamState, segment: RaceSegment, events: RaceEvent[]) {
  const strategy = pitStrategy(state.participant.decision);
  if (strategy === "heavy_pack") {
    if (segment === "mid") {
      state.elapsedTime += 4;
      state.resultTags.add("heavy_pack");
      events.push(createMiniInfoEvent(events.length, state, segment, "battery_critical", `${state.participant.teamName} carries heavy battery mass through the middle sector`, ["pit_stop", strategy]));
    }
    return;
  }
  if (strategy === "standard" && segment !== "mid") return;
  if (strategy === "mini_pack" && segment !== "early" && segment !== "late") return;

  const stopCost = strategy === "mini_pack" ? 4 : 6;
  events.push(createMiniInfoEvent(events.length, state, segment, "pit_imminent", `${state.participant.teamName} approaches the pit window`, ["pit_stop", strategy]));
  state.elapsedTime += stopCost;
  state.scores.score += strategy === "mini_pack" ? 6 : 0;
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
  events.push(createMiniInfoEvent(events.length, state, segment, "pit_exit", `${state.participant.teamName} exits the pit into traffic`, ["pit_stop", strategy]));
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
    ((traits.grip - 60) * scores.control + (traits.overtaking - 60) * scores.aggression + (traits.energy - 60) * scores.reliability) / 360;

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
    delta -= 0.65;
  }
  if (state.participant.decision.preparation === "weather" && weather !== "dry" && input.forecast.dry < 100) {
    delta += weather === "heavy_rain" ? 8 : 4;
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
    if (trait === "high_wear") bonus += state.scores.reliability * 0.1;
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
  states: TeamState[],
  elapsedTimes: Map<string, number>
) {
  const cardId = state.participant.decision.cardId;
  if (!cardId) return;

  if (cardId === "qualifying_focus" && segment === "start") {
    state.scores.score += 4;
    state.resultTags.add("qualifying_focus");
    events.push(createCardEvent(events.length, state, segment, "card_triggered", 0));
  } else if (cardId === "rain_grip" && segment === "mid") {
    const rained = weather !== "dry";
    state.scores.score += rained ? 26 : -4;
    state.positionDelta += rained ? 18 : -2;
    state.resultTags.add(rained ? "weather_gamble" : "wrong_weather_bet");
    events.push(createCardEvent(events.length, state, segment, rained ? "weather_gamble_paid" : "wrong_weather_bet", rained ? 18 : -2));
  } else if (cardId === "launch_boost" && segment === "start") {
    state.scores.score += 26;
    state.scores.reliability -= 5;
    state.positionDelta += 8;
    state.resultTags.add("launch_boost");
    events.push(createCardEvent(events.length, state, segment, "card_triggered", 8));
  } else if (cardId === "urban_draft" && segment === "mid" && state.participant.decision.rivalTeamId) {
    const rival = states.find((candidate) => candidate.participant.teamId === state.participant.decision.rivalTeamId);
    if (rival) {
      state.scores.score += 18;
      rival.scores.score -= 6;
      state.positionDelta += 7;
      state.resultTags.add("rival_pressure");
      events.push(createCardEvent(events.length, state, segment, "rival_overtake", 7, rival.participant.teamId));
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
    state.scores.score += 2;
    state.resultTags.add("sponsor_bonus");
    events.push(createCardEvent(events.length, state, segment, "sponsor_payout", 0));
  } else if (cardId === "soft_tires" && segment === "early") {
    state.scores.score += 10;
    state.scores.reliability -= 7;
    state.positionDelta += 8;
    state.resultTags.add("soft_tires");
    events.push(createCardEvent(events.length, state, segment, "card_triggered", 8));
  } else if (cardId === "defensive_order" && segment === "late") {
    state.scores.score += 8;
    state.positionDelta += 4;
    state.resultTags.add("defensive_order");
    events.push(createCardEvent(events.length, state, segment, "held_position", 4));
  } else if (cardId === "adjustable_wing" && segment === "early") {
    const suitedCircuit = input.primaryTrait === "fast" || input.secondaryTrait === "fast" || input.primaryTrait === "urban" || input.secondaryTrait === "urban";
    state.scores.score += suitedCircuit ? 10 : 4;
    state.scores.reliability -= 4;
    state.positionDelta += suitedCircuit ? 5 : 0;
    state.resultTags.add("adjustable_wing");
    events.push(createCardEvent(events.length, state, segment, "card_triggered", suitedCircuit ? 5 : 0));
  } else if (cardId === "rain_mapping" && segment === "mid") {
    const rained = weather !== "dry";
    state.scores.score += rained ? 18 : 10;
    state.positionDelta += rained ? 6 : 2;
    state.resultTags.add(rained ? "rain_mapping" : "rain_mapping_baseline");
    events.push(createCardEvent(events.length, state, segment, rained ? "weather_gamble_paid" : "card_triggered", rained ? 6 : 2));
  } else if (cardId === "economy_mode" && segment === "finish") {
    state.scores.score += 4;
    state.positionDelta += state.participant.standingsRank <= 4 ? 2 : 0;
    state.resultTags.add("economy_mode");
    events.push(createCardEvent(events.length, state, segment, "sponsor_payout", 0));
  } else if (cardId === "pit_relay" && segment === "late") {
    state.scores.score += 15;
    state.scores.reliability += 6;
    state.positionDelta += 8;
    state.resultTags.add("pit_relay");
    events.push(createCardEvent(events.length, state, segment, "held_position", 8));
  } else if (cardId === "hard_tires" && segment === "late") {
    state.scores.score += 10;
    state.positionDelta += 5;
    state.resultTags.add("hard_tires");
    events.push(createCardEvent(events.length, state, segment, "late_push_gain", 5));
  } else if (cardId === "calculated_attack" && segment === "mid") {
    const target = carAhead(state, states, elapsedTimes);
    const closeEnough = target && state.elapsedTime - target.elapsedTime <= 3;
    if (closeEnough) {
      state.scores.score += 24;
      state.positionDelta += 10;
      state.resultTags.add("calculated_attack");
      events.push(createCardEvent(events.length, state, segment, "rival_overtake", 10, target.participant.teamId));
    } else {
      state.scores.score += 6;
      state.resultTags.add("calculated_attack_missed");
      events.push(createCardEvent(events.length, state, segment, "card_triggered", 0));
    }
  }
}

function carAhead(state: TeamState, states: TeamState[], elapsedTimes: Map<string, number>) {
  const sorted = [...states].sort((left, right) => (elapsedTimes.get(left.participant.teamId) ?? left.elapsedTime) - (elapsedTimes.get(right.participant.teamId) ?? right.elapsedTime));
  return sorted[sorted.findIndex((candidate) => candidate.participant.teamId === state.participant.teamId) - 1];
}

function maybeAddRiskEvent(state: TeamState, segment: RaceSegment, events: RaceEvent[], next: () => number) {
  if (segment !== "late") return;

  const risk = Math.max(0, 58 - state.scores.reliability) + Math.max(0, state.scores.aggression - 56);
  if (risk >= 18) {
    events.push(createMiniInfoEvent(events.length, state, segment, "penalty_risk", `${state.participant.teamName} flirts with the penalty line`, ["risk"]));
  }
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

function maybeAddMiniInfoEvents(segment: RaceSegment, weather: Weather, states: TeamState[], events: RaceEvent[]) {
  if (!states.length) return;
  const byTime = [...states].sort((left, right) => left.elapsedTime - right.elapsedTime);
  const byPace = [...states].sort((left, right) => right.scores.pace - left.scores.pace);
  const byScore = [...states].sort((left, right) => right.scores.score - left.scores.score);
  const byEnergy = [...states].sort((left, right) => left.scores.reliability + left.scores.weatherReadiness - (right.scores.reliability + right.scores.weatherReadiness));
  const byControl = [...states].sort((left, right) => right.scores.control - left.scores.control);
  const byAggression = [...states].sort((left, right) => right.scores.aggression - left.scores.aggression);
  const closePair = byTime.slice(1).find((state, index) => state.elapsedTime - byTime[index]!.elapsedTime <= 1.4);
  const weatherTeam = states.find((state) => state.participant.decision.preparation === "weather" || state.participant.botArchetype === "rain_specialist") ?? byControl[0];

  if (segment === "early") {
    events.push(createMiniInfoEvent(events.length, byPace[0]!, segment, "best_sector", `${byPace[0]!.participant.teamName} signs the best sector`, ["pace"]));
    events.push(createMiniInfoEvent(events.length, byAggression[0]!, segment, "overtake_setup", `${byAggression[0]!.participant.teamName} prepares a move in the slipstream`, ["overtake"]));
  } else if (segment === "mid") {
    events.push(createMiniInfoEvent(events.length, byScore[0]!, segment, "pace_gain", `${byScore[0]!.participant.teamName} lifts the race rhythm`, ["pace"]));
    if (closePair) events.push(createMiniInfoEvent(events.length, closePair, segment, "under_pressure", `${closePair.participant.teamName} runs under pressure`, ["pressure"]));
    events.push(createMiniInfoEvent(events.length, byTime[Math.min(2, byTime.length - 1)]!, segment, "dense_traffic", "Traffic compresses the field", ["traffic"]));
    if (weather !== "dry" && weatherTeam) events.push(createMiniInfoEvent(events.length, weatherTeam, segment, "favorable_weather", `${weatherTeam.participant.teamName} finds the right weather window`, ["weather"]));
  } else if (segment === "late") {
    events.push(createMiniInfoEvent(events.length, byEnergy[0]!, segment, "battery_critical", `${byEnergy[0]!.participant.teamName} manages a critical battery window`, ["energy"]));
    events.push(createMiniInfoEvent(events.length, byControl[0]!, segment, "defense_success", `${byControl[0]!.participant.teamName} closes the door cleanly`, ["defense"]));
    events.push(createMiniInfoEvent(events.length, byControl.at(-1) ?? byControl[0]!, segment, "minor_error", `${(byControl.at(-1) ?? byControl[0]!).participant.teamName} loses a fraction on corner exit`, ["error"]));
  } else if (segment === "finish") {
    events.push(createMiniInfoEvent(events.length, byScore[0]!, segment, "personal_record", `${byScore[0]!.participant.teamName} records a personal best rhythm`, ["pace"]));
  }
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
  const sorted = [...states].sort((left, right) => left.elapsedTime - right.elapsedTime || classificationScore(right) - classificationScore(left));
  const positionCredits: number[] = [];
  for (let index = 0; index < sorted.length; index += 1) {
    const baseCredits = RACE_CREDITS_BY_POSITION[index] ?? RACE_CREDITS_BY_POSITION.at(-1) ?? 0;
    const comebackBonus = Math.min(COMEBACK_CREDIT_BONUS_CAP, Math.max(0, index + 1 - RACE_POINTS_BY_POSITION.length) * COMEBACK_CREDIT_BONUS_PER_POSITION);
    const previous = index > 0 ? positionCredits[index - 1] : undefined;
    positionCredits.push(previous === undefined ? baseCredits + comebackBonus : Math.min(previous, baseCredits + comebackBonus));
  }

  return sorted.map((state, index) => {
    const position = index + 1;
    const sponsorBonus = state.participant.decision.cardId === "fleet_sponsorship" ? FLEET_SPONSORSHIP_CREDIT_BONUS : 0;
    const economyBonus = state.participant.decision.cardId === "economy_mode" && position <= 4 ? ECONOMY_MODE_CREDIT_BONUS : 0;

    return {
      position,
      teamId: state.participant.teamId,
      teamName: state.participant.teamName,
      points: RACE_POINTS_BY_POSITION[index] ?? 0,
      credits: (positionCredits[index] ?? 0) + sponsorBonus + economyBonus,
      score: Number(classificationScore(state).toFixed(2)),
      positionChange: state.participant.standingsRank - position,
      status: "finished",
      resultTags: [...state.resultTags]
    };
  });
}

export function classificationScore(state: { scores: { score: number }; positionDelta: number }) {
  // positionDelta is a deliberate card-effect perturbation on the final score scale.
  return state.scores.score + state.positionDelta;
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

function createMiniInfoEvent(order: number, state: TeamState, segment: RaceSegment, type: RaceEvent["type"], replayText: string, tags: string[]): RaceEvent {
  return {
    id: "",
    order,
    segment,
    lap: lapForSegment(segment),
    type,
    teamId: state.participant.teamId,
    severity: "minor",
    positionDelta: 0,
    tags: ["mini_info", ...tags],
    replayText,
    reportText: `${replayText}.`
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

export function lapForProgress(progress: number, laps: number) {
  return Math.max(1, Math.min(laps, Math.round(1 + Math.max(0, Math.min(1, progress)) * (laps - 1))));
}

function weatherLabel(weather: Weather) {
  return weather.replace("_", " ");
}

function traitLabel(trait: RaceInput["primaryTrait"]) {
  return trait.replace("_", " ");
}
