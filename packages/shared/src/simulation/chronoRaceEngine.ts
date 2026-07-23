import type { CardId, ClassificationEntry, PitStrategy, RaceInput, RaceParticipant, RaceSegment, ReplayTracePoint, Weather } from "../domain/race.js";
import { RACE_SEGMENTS } from "../domain/race.js";
import { APPROACH_DELTAS, CARD_DELTAS, PIT_STRATEGY_DELTAS, PREPARATION_DELTAS, type DecisionDeltas } from "../domain/decisionDeltas.js";

export type ChronoScores = {
  pace: number;
  control: number;
  reliability: number;
  weatherReadiness: number;
  aggression: number;
  score: number;
};

export type ChronoMotionParameters = {
  topSpeed: number;
  acceleration: number;
  braking: number;
  cornering: number;
  wetGrip: number;
  consistency: number;
  attack: number;
  defense: number;
  reliability: number;
  pitEfficiency: number;
};

export type ChronoTimingParticipant = {
  participant: RaceParticipant;
  scores: ChronoScores;
  elapsedTime: number;
  positionDelta: number;
  resultTags: ReadonlySet<string>;
};

export type ChronoSegmentSnapshot = {
  segment: RaceSegment;
  pitCosts: ReadonlyMap<string, number>;
};

export type ChronoFinalTimeOptions = {
  trackLengthMeters: number;
  laps: number;
  speedProfile: NonNullable<RaceInput["speedProfile"]>;
  weather: Record<RaceSegment, Weather>;
  input: RaceInput;
  next: () => number;
  baseReplaySeconds: number;
  defaultTrackLengthMeters: number;
  gridGapSeconds: number;
};

export type ChronoReplayTraceOptions = {
  classification: ClassificationEntry[];
  snapshots: ChronoSegmentSnapshot[];
  trackLengthMeters: number;
  laps: number;
  pitLaneProgress: number;
  speedProfile: NonNullable<RaceInput["speedProfile"]>;
  weather: Record<RaceSegment, Weather>;
  energy: number;
  replayStepsPerSegment: number;
  gridGapSeconds: number;
};

const CHRONO_PROFILE_SAMPLES = 120;
const MIN_CHRONO_SPEED_FACTOR = 0.42;
const PIT_ENTRY_SECONDS = 1.2;
const PIT_EXIT_SECONDS = 1.2;
const LAUNCH_PHASE_PROGRESS = 0.06;
const MIN_VISIBLE_GAP_PROGRESS = 0.004;
const MAX_VISIBLE_GAP_PROGRESS = 0.12;

const CARD_MOTION_EFFECTS: Record<CardId, Partial<ChronoMotionParameters>> = {
  rain_grip: { wetGrip: 0.09, cornering: 0.015 },
  fleet_maintenance: { reliability: 0.08, consistency: 0.025 },
  launch_boost: { acceleration: 0.12, attack: 0.025, reliability: -0.025 },
  urban_draft: { attack: 0.055, topSpeed: 0.015 },
  final_surge: { topSpeed: 0.05, attack: 0.045, reliability: -0.035 },
  fleet_sponsorship: { topSpeed: -0.012, consistency: 0.012 },
  soft_tires: { acceleration: 0.04, cornering: 0.07, reliability: -0.045 },
  qualifying_focus: { acceleration: 0.035, consistency: 0.015 },
  defensive_order: { defense: 0.12, consistency: 0.05, attack: -0.02 },
  adjustable_wing: { topSpeed: 0.025, cornering: 0.025, braking: -0.02 },
  rain_mapping: { wetGrip: 0.075, consistency: 0.025 },
  economy_mode: { topSpeed: -0.01, reliability: 0.04, pitEfficiency: 0.025 },
  pit_relay: { pitEfficiency: 0.09, reliability: 0.045, defense: 0.02 },
  hard_tires: { reliability: 0.065, braking: 0.03, cornering: -0.018 },
  calculated_attack: { attack: 0.08, braking: 0.02 }
};

/**
 * Chrono contract: RaceInput decisions/cards/traits/weather are converted into
 * bounded motion parameters, then each car's finish time is derived by sampling
 * its effective speed over the circuit speed profile. simulateRace remains the
 * public boundary and owns rewards/events around this engine.
 */
export function createChronoScores(participant: RaceParticipant): ChronoScores {
  const scores: ChronoScores = {
    pace: 50,
    control: 50,
    reliability: 50,
    weatherReadiness: 50,
    aggression: 50,
    score: 0
  };
  applyDecisionToScores(scores, participant);
  return scores;
}

export function applyDecisionToScores(scores: ChronoScores, participant: RaceParticipant) {
  applyChronoDeltas(scores, APPROACH_DELTAS[participant.decision.approach]);
  applyChronoDeltas(scores, PREPARATION_DELTAS[participant.decision.preparation]);
  applyChronoDeltas(scores, PIT_STRATEGY_DELTAS[pitStrategy(participant.decision)]);

  if (participant.botArchetype === "rain_specialist") {
    scores.weatherReadiness += 6;
  } else if (participant.botArchetype === "sprinter") {
    scores.pace += 4;
    scores.aggression += 4;
  } else if (participant.botArchetype === "mechanic") {
    scores.reliability += 6;
  }

  if (participant.decision.cardId) applyChronoDeltas(scores, CARD_DELTAS[participant.decision.cardId]);
}

export function applyChronoDeltas(scores: ChronoScores, deltas: DecisionDeltas = {}) {
  for (const [key, value] of Object.entries(deltas) as Array<[keyof ChronoScores, number]>) {
    scores[key] += value;
  }
}

export function pitStrategy(decision: RaceParticipant["decision"]): PitStrategy {
  return decision.pitStrategy ?? "standard";
}

export function motionParametersForParticipant(participant: RaceParticipant, scores: ChronoScores): ChronoMotionParameters {
  const parameters: ChronoMotionParameters = {
    topSpeed: 1 + (scores.pace - 50) / 260,
    acceleration: 1 + (scores.pace + scores.aggression - 100) / 360,
    braking: 1 + (scores.control + scores.reliability - 100) / 420,
    cornering: 1 + (scores.control - 50) / 260,
    wetGrip: 1 + (scores.weatherReadiness - 50) / 230,
    consistency: 1 + (scores.control + scores.reliability - 100) / 360,
    attack: 1 + (scores.aggression - 50) / 220,
    defense: 1 + (scores.control + scores.reliability - 100) / 420,
    reliability: 1 + (scores.reliability - 50) / 240,
    pitEfficiency: 1 + (scores.control + scores.reliability - 100) / 520
  };

  const cardEffect = participant.decision.cardId ? CARD_MOTION_EFFECTS[participant.decision.cardId] : undefined;
  if (cardEffect) {
    for (const [key, value] of Object.entries(cardEffect) as Array<[keyof ChronoMotionParameters, number]>) {
      parameters[key] += value;
    }
  }

  return clampMotionParameters(parameters);
}

export function motionParametersForDecision(participant: RaceParticipant): ChronoMotionParameters {
  return motionParametersForParticipant(participant, createChronoScores(participant));
}

export function createChronoFinalTimes(
  states: ChronoTimingParticipant[],
  snapshots: ChronoSegmentSnapshot[],
  options: ChronoFinalTimeOptions
) {
  const totalDistanceFactor = (options.trackLengthMeters * options.laps) / (options.defaultTrackLengthMeters * 10);
  const baseSeconds = options.baseReplaySeconds * Math.max(0.45, totalDistanceFactor);
  return new Map(
    states.map((state) => {
      const parameters = motionParametersForParticipant(state.participant, state.scores);
      const profileFactor = chronoProfileFactor(options.speedProfile, options.weather, parameters, options.input);
      const circuitFactor = chronoCircuitFactor(options.input, parameters);
      const racecraftFactor = 1 + (parameters.attack - 1) * 0.06 + (parameters.defense - 1) * 0.08 + (parameters.consistency - 1) * 0.05;
      const scoreFactor = 1 + Math.max(-0.11, Math.min(0.16, classificationScore(state) / 620));
      const consistencyNoise = (options.next() - 0.5) * 2.6 * (2 - parameters.consistency);
      const pitLoss = chronoPitLoss(state, snapshots, parameters);
      const riskLoss = state.resultTags.has("mechanical_scare") ? 3.2 / parameters.reliability : 0;
      const startDelay = Math.max(0, state.participant.standingsRank - 1) * options.gridGapSeconds;
      const movingTime = (baseSeconds * profileFactor) / Math.max(0.55, scoreFactor * circuitFactor * racecraftFactor);
      return [
        state.participant.teamId,
        Number(Math.max(1, startDelay + movingTime + pitLoss + riskLoss + consistencyNoise).toFixed(1))
      ];
    })
  );
}

export function createChronoReplayTrace(
  states: ChronoTimingParticipant[],
  options: ChronoReplayTraceOptions
): ReplayTracePoint[] {
  const finalTimes = replayFinalTimes(states, options.classification);
  const plans = new Map(
    states.map((state) => [
      state.participant.teamId,
      teamTracePlan(state, options.snapshots, options.laps, options.pitLaneProgress, options.gridGapSeconds, finalTimes.get(state.participant.teamId) ?? state.elapsedTime)
    ])
  );
  const raceDuration = Math.max(...states.map((state) => state.elapsedTime));
  const motionStates = new Map<string, ChronoCarMotionState>();
  const points: ReplayTracePoint[] = [createChronoGridTracePoint("start", 0, states, options.trackLengthMeters)];

  for (const delay of [...new Set([...plans.values()].map((plan) => plan.startDelay).filter((delay) => delay > 0))].sort((left, right) => left - right)) {
    points.push(createChronoReplayTracePoint(states, plans, motionStates, delay, delay / raceDuration, "start", options, raceDuration, options.speedProfile, "dry", 1));
  }

  for (const [segmentIndex, segment] of RACE_SEGMENTS.entries()) {
    for (let step = 1; step <= options.replayStepsPerSegment; step += 1) {
      const ratio = step / options.replayStepsPerSegment;
      const progress = (segmentIndex + ratio) / RACE_SEGMENTS.length;
      const raceTime = raceDuration * progress;
      points.push(createChronoReplayTracePoint(
        states,
        plans,
        motionStates,
        raceTime,
        progress,
        segment,
        options,
        raceDuration,
        weatherAdjustedSpeedProfile(options.speedProfile, options.weather[segment]),
        options.weather[segment],
        lateRacePaceFactor(segment, options.energy)
      ));
    }
  }

  return dedupeReplayTraceProgress(points.sort((left, right) => left.progress - right.progress));
}

type PitStopTracePlan = {
  targetProgress: number;
  cost: number;
};

type TeamTracePlan = {
  teamId: string;
  finalTime: number;
  startDelay: number;
  movingTime: number;
  pitStops: PitStopTracePlan[];
};

type ChronoCarMotionState = {
  raceTime: number;
  trackProgress: number;
  speed: number;
};

function createChronoReplayTracePoint(
  states: ChronoTimingParticipant[],
  plans: Map<string, TeamTracePlan>,
  motionStates: Map<string, ChronoCarMotionState>,
  raceTime: number,
  progress: number,
  segment: RaceSegment,
  options: ChronoReplayTraceOptions,
  raceDuration: number,
  speedProfile: NonNullable<RaceInput["speedProfile"]>,
  weather: Weather,
  paceFactor: number
): ReplayTracePoint {
  const pitFloors = new Map<string, number>();
  const rawCars = Object.fromEntries(
    states.map((state) => {
      const plan = plans.get(state.participant.teamId)!;
      const car = carAtRaceTime(plan, raceTime);
      const phase = progress >= 1 ? "finished" : car.phase;
      const profileProgress = replayTrackProgress(car.progress, options.laps, speedProfile);
      const pitFloor = lastPassedPitProgress(plan, car.progress);
      const trackProgress = phase.startsWith("pit") ? car.progress : Math.max(profileProgress, pitFloor);
      if (pitFloor > 0) pitFloors.set(state.participant.teamId, pitFloor);
      const sampled = sampleChronoCarMotion(
        motionStates.get(state.participant.teamId),
        raceTime,
        progress >= 1 ? 1 : trackProgress,
        phase,
        options.trackLengthMeters,
        weather,
        paceFactor
      );
      motionStates.set(state.participant.teamId, sampled);
      return [
        state.participant.teamId,
        {
          trackProgress: Number(sampled.trackProgress.toFixed(4)),
          distanceMeters: Number((sampled.trackProgress * options.trackLengthMeters).toFixed(1)),
          speed: sampled.speed,
          phase
        }
      ];
    })
  );
  const cars = applyPitProgressFloors(applyVisualChronoGaps(rawCars, options.trackLengthMeters, raceDuration), pitFloors, options.trackLengthMeters);
  const order = progress >= 1
    ? states.slice().sort((left, right) => left.elapsedTime - right.elapsedTime || classificationScore(right) - classificationScore(left)).map((state) => state.participant.teamId)
    : orderFromCars(cars, states);
  const leaderProgress = Math.max(...Object.values(cars).map((car) => car.trackProgress));
  const leaderTime = Math.min(...states.map((state) => progress >= 1 ? (plans.get(state.participant.teamId)?.finalTime ?? state.elapsedTime) : raceTime));
  return {
    segment,
    lap: lapForProgress(progress, options.laps),
    progress,
    distanceMeters: Number((progress * options.trackLengthMeters).toFixed(1)),
    order,
    times: Object.fromEntries(states.map((state) => [state.participant.teamId, progress >= 1 ? Number((plans.get(state.participant.teamId)?.finalTime ?? state.elapsedTime).toFixed(1)) : Number(Math.min(raceTime, plans.get(state.participant.teamId)?.finalTime ?? raceTime).toFixed(1))])),
    gaps: Object.fromEntries(states.map((state) => {
      const finalTime = plans.get(state.participant.teamId)?.finalTime ?? state.elapsedTime;
      return [
        state.participant.teamId,
        progress >= 1
          ? Number(Math.max(0, finalTime - leaderTime).toFixed(1))
          : Number(Math.max(0, (leaderProgress - (cars[state.participant.teamId]?.trackProgress ?? 0)) * raceDuration).toFixed(1))
      ];
    })),
    cars
  };
}

function sampleChronoCarMotion(
  previous: ChronoCarMotionState | undefined,
  raceTime: number,
  targetProgress: number,
  phase: NonNullable<ReplayTracePoint["cars"]>[string]["phase"],
  trackLengthMeters: number,
  weather: Weather,
  paceFactor: number
): ChronoCarMotionState {
  if (!previous || phase === "grid") {
    return { raceTime, trackProgress: targetProgress, speed: replayCarSpeed(phase, weather) };
  }
  const elapsed = Math.max(0.1, raceTime - previous.raceTime);
  const trackProgress = Math.max(previous.trackProgress, targetProgress);
  const metersPerSecond = ((trackProgress - previous.trackProgress) * trackLengthMeters) / elapsed;
  const weatherSurface = weather === "heavy_rain" ? 0.75 : weather === "light_rain" ? 0.88 : 1;
  const phaseSpeed = replayCarSpeed(phase, weather) * weatherSurface;
  const normalizedSpeed = Math.max(phaseSpeed * 0.45, Math.min(phaseSpeed, metersPerSecond / 29));
  const speed = phase === "pit_stop" || phase === "finished" ? 0 : Number((normalizedSpeed * paceFactor).toFixed(3));
  return { raceTime, trackProgress, speed };
}

function createChronoGridTracePoint(segment: RaceSegment, progress: number, states: ChronoTimingParticipant[], trackLengthMeters: number): ReplayTracePoint {
  const sorted = [...states].sort((left, right) => left.participant.standingsRank - right.participant.standingsRank);
  return {
    segment,
    lap: lapForSegment(segment),
    progress,
    distanceMeters: Number((progress * trackLengthMeters).toFixed(1)),
    order: sorted.map((state) => state.participant.teamId),
    times: Object.fromEntries(sorted.map((state) => [state.participant.teamId, 0])),
    gaps: Object.fromEntries(sorted.map((state) => [state.participant.teamId, 0])),
    cars: Object.fromEntries(sorted.map((state) => [state.participant.teamId, { trackProgress: 0, distanceMeters: 0, speed: 0, phase: "grid" as const }]))
  };
}

function dedupeReplayTraceProgress(points: ReplayTracePoint[]) {
  return points.filter((point, index) => index === 0 || point.progress - points[index - 1]!.progress > 0.0001);
}

function replayFinalTimes(states: ChronoTimingParticipant[], classification: ClassificationEntry[]) {
  const sortedTimes = states.map((state) => state.elapsedTime).sort((left, right) => left - right);
  return new Map(classification.map((entry, index) => [entry.teamId, sortedTimes[index] ?? sortedTimes.at(-1) ?? 1]));
}

function teamTracePlan(state: ChronoTimingParticipant, snapshots: ChronoSegmentSnapshot[], laps: number, pitLaneProgress: number, gridGapSeconds: number, finalTime = state.elapsedTime): TeamTracePlan {
  const pitStops = snapshots.flatMap((snapshot, segmentIndex) => {
    const cost = snapshot.pitCosts.get(state.participant.teamId);
    return cost
      ? [{ cost, targetProgress: pitLaneTrackProgress(segmentIndex, snapshot.segment, laps, pitLaneProgress) }]
      : [];
  }).sort((left, right) => left.targetProgress - right.targetProgress);
  const startDelay = Math.max(0, state.participant.standingsRank - 1) * gridGapSeconds;
  const movingTime = Math.max(1, finalTime - startDelay - pitStops.reduce((sum, stop) => sum + stop.cost, 0));
  return { teamId: state.participant.teamId, finalTime, startDelay, movingTime, pitStops };
}

function lastPassedPitProgress(plan: TeamTracePlan, progress: number) {
  return plan.pitStops.filter((stop) => stop.targetProgress <= progress + 0.002).at(-1)?.targetProgress ?? 0;
}

function carAtRaceTime(plan: TeamTracePlan, raceTime: number): { progress: number; phase: NonNullable<ReplayTracePoint["cars"]>[string]["phase"] } {
  if (raceTime <= plan.startDelay) return { progress: 0, phase: "grid" };
  let time = plan.startDelay;
  let progress = 0;
  for (const stop of plan.pitStops) {
    const travelTime = Math.max(0, stop.targetProgress - progress) * plan.movingTime;
    const arrival = time + travelTime;
    if (raceTime < arrival) {
      const nextProgress = progress + Math.max(0, raceTime - time) / plan.movingTime;
      return {
        progress: nextProgress,
        phase: arrival - raceTime <= PIT_ENTRY_SECONDS ? "pit_entry" : nextProgress <= LAUNCH_PHASE_PROGRESS ? "launch" : "racing"
      };
    }
    const departure = arrival + stop.cost;
    if (raceTime <= departure) {
      const phase = raceTime < arrival + PIT_ENTRY_SECONDS ? "pit_entry" : departure - raceTime <= PIT_EXIT_SECONDS ? "pit_exit" : "pit_stop";
      return { progress: stop.targetProgress, phase };
    }
    if (raceTime <= departure + PIT_EXIT_SECONDS) {
      return { progress: stop.targetProgress, phase: "pit_exit" };
    }
    time = departure;
    progress = stop.targetProgress;
  }
  if (raceTime >= plan.finalTime) return { progress: 1, phase: "finished" };
  const nextProgress = Math.min(1, progress + Math.max(0, raceTime - time) / plan.movingTime);
  return { progress: nextProgress, phase: nextProgress <= LAUNCH_PHASE_PROGRESS ? "launch" : "racing" };
}

function orderFromCars(cars: ReplayTracePoint["cars"], states: ChronoTimingParticipant[]) {
  return [...states]
    .sort(
      (left, right) =>
        (cars?.[right.participant.teamId]?.trackProgress ?? 0) - (cars?.[left.participant.teamId]?.trackProgress ?? 0) ||
        (cars?.[right.participant.teamId]?.speed ?? 0) - (cars?.[left.participant.teamId]?.speed ?? 0) ||
        classificationScore(right) - classificationScore(left)
    )
    .map((state) => state.participant.teamId);
}

export function replayCarSpeed(phase: NonNullable<ReplayTracePoint["cars"]>[string]["phase"], weather: Weather = "dry") {
  if (phase === "pit_stop" || phase === "grid" || phase === "finished") return 0;
  if (phase === "launch") return 0.7;
  if (phase === "defending") return 0.96;
  if (phase === "pit_entry" || phase === "pit_exit") return 0.35;
  if (phase === "overtake_approach" || phase === "overtake_overlap" || phase === "overtake_pass") return 1.08;
  if (phase === "overtake_settle") return 1;
  return weather === "heavy_rain" ? 0.86 : weather === "light_rain" ? 0.94 : 1;
}

function lateRacePaceFactor(segment: RaceSegment, energy: number) {
  if (segment !== "late" && segment !== "finish") return 1;
  if (energy >= 75) return 1;
  if (energy >= 55) return 0.96;
  return 0.92;
}

function replayTrackProgress(progress: number, laps: number, speedProfile: NonNullable<RaceInput["speedProfile"]>) {
  if (!speedProfile.length || progress <= 0 || progress >= 1) return progress;
  const progressLaps = progress * Math.max(1, laps);
  const completedLaps = Math.floor(progressLaps);
  const lapProgress = progressLaps - completedLaps;
  const total = integratedSpeedProfile(1, speedProfile);
  return total <= 0 ? progress : (completedLaps + integratedSpeedProfile(lapProgress, speedProfile) / total) / Math.max(1, laps);
}

function weatherAdjustedSpeedProfile(speedProfile: NonNullable<RaceInput["speedProfile"]>, weather: Weather) {
  if (weather === "dry") return speedProfile;
  const multiplier = weather === "heavy_rain" ? 0.85 : 0.93;
  return speedProfile.map((span) => (
    span.kind === "straight" ? span : { ...span, factor: Number(Math.max(0.35, span.factor * multiplier).toFixed(3)) }
  ));
}

function integratedSpeedProfile(to: number, speedProfile: NonNullable<RaceInput["speedProfile"]>) {
  const end = Math.min(1, Math.max(0, to));
  const cuts = [...new Set([0, end, ...speedProfile.flatMap((span) => expandedSpeedSpan(span).flatMap((range) => [Math.min(end, range.start), Math.min(end, range.end)]))])]
    .filter((point) => point >= 0 && point <= end)
    .sort((left, right) => left - right);
  return cuts.slice(0, -1).reduce((sum, start, index) => {
    const finish = cuts[index + 1]!;
    const factor = speedProfile.filter((span) => progressInSpeedSpan((start + finish) / 2, span)).map((span) => span.factor);
    return sum + (finish - start) * (factor.length ? Math.min(...factor) : 1);
  }, 0);
}

function expandedSpeedSpan(span: NonNullable<RaceInput["speedProfile"]>[number]) {
  return span.startProgress <= span.endProgress
    ? [{ start: span.startProgress, end: span.endProgress }]
    : [
        { start: 0, end: span.endProgress },
        { start: span.startProgress, end: 1 }
      ];
}

function pitLaneTrackProgress(segmentIndex: number, segment: RaceSegment, laps: number, pitLaneProgress: number) {
  const center: Partial<Record<RaceSegment, number>> = { early: 0.38, mid: 0.5, late: 0.62 };
  const raceProgress = (segmentIndex + (center[segment] ?? 0.5)) / RACE_SEGMENTS.length;
  const lapIndex = Math.min(laps - 1, Math.max(0, Math.ceil(raceProgress * laps) - 1));
  return (lapIndex + pitLaneProgress) / laps;
}

function lapForSegment(segment: RaceSegment) {
  return RACE_SEGMENTS.indexOf(segment) + 1;
}

function lapForProgress(progress: number, laps: number) {
  if (progress >= 1) return laps;
  return Math.min(laps, Math.max(1, Math.floor(progress * laps) + 1));
}

function applyPitProgressFloors(cars: NonNullable<ReplayTracePoint["cars"]>, pitFloors: Map<string, number>, trackLengthMeters: number) {
  if (!pitFloors.size) return cars;
  return Object.fromEntries(
    Object.entries(cars).map(([teamId, car]) => {
      const floor = pitFloors.get(teamId) ?? 0;
      if (car.trackProgress >= floor) return [teamId, car];
      return [teamId, { ...car, trackProgress: Number(floor.toFixed(4)), distanceMeters: Number((floor * trackLengthMeters).toFixed(1)) }];
    })
  );
}

function applyVisualChronoGaps(cars: NonNullable<ReplayTracePoint["cars"]>, trackLengthMeters: number, raceDuration: number) {
  const racing = Object.entries(cars).filter(([, car]) => car.phase === "racing" || car.phase === "launch" || car.phase.startsWith("overtake"));
  if (racing.length < 2) return cars;
  const leaderProgress = Math.max(...racing.map(([, car]) => car.trackProgress));
  const leaderId = racing.find(([, car]) => car.trackProgress === leaderProgress)?.[0];
  return Object.fromEntries(
    Object.entries(cars).map(([teamId, car]) => {
      if (!racing.some(([id]) => id === teamId) || teamId === leaderId) return [teamId, car];
      const rawGapSeconds = Math.max(0, (leaderProgress - car.trackProgress) * raceDuration);
      const visualGap = Math.min(MAX_VISIBLE_GAP_PROGRESS, Math.max(MIN_VISIBLE_GAP_PROGRESS, rawGapSeconds / Math.max(1, raceDuration)));
      const trackProgress = Math.max(0, Math.min(car.trackProgress, leaderProgress - visualGap));
      return [teamId, { ...car, trackProgress: Number(trackProgress.toFixed(4)), distanceMeters: Number((trackProgress * trackLengthMeters).toFixed(1)) }];
    })
  );
}

function classificationScore(state: { scores: { score: number }; positionDelta: number }) {
  return state.scores.score + state.positionDelta;
}

function chronoCircuitFactor(input: RaceInput, parameters: ChronoMotionParameters) {
  const traits = input.traits ?? traitsFromTags(input);
  const traitFactor = 1 + (traits.grip + traits.overtaking + traits.energy - 186) / 720;
  const fit = [input.primaryTrait, input.secondaryTrait].reduce((sum, trait) => {
    if (trait === "fast") return sum + (parameters.topSpeed + parameters.acceleration - 2) * 0.22;
    if (trait === "technical") return sum + (parameters.cornering + parameters.braking - 2) * 0.28;
    if (trait === "urban") return sum + (parameters.attack + parameters.acceleration - 2) * 0.26;
    if (trait === "high_wear") return sum + (parameters.reliability + parameters.consistency - 2) * 0.38;
    return sum + (parameters.wetGrip + parameters.cornering - 2) * 0.22;
  }, 0);
  return Math.max(0.82, Math.min(1.22, traitFactor + fit));
}

function chronoPitLoss(state: ChronoTimingParticipant, snapshots: ChronoSegmentSnapshot[], parameters: ChronoMotionParameters) {
  const stopLoss = snapshots.reduce((sum, snapshot) => sum + (snapshot.pitCosts.get(state.participant.teamId) ?? 0), 0);
  const heavyPackTimeTradeoff = pitStrategy(state.participant.decision) === "heavy_pack" ? 1.9 : 0;
  return Math.max(0, (stopLoss + heavyPackTimeTradeoff) / parameters.pitEfficiency);
}

function chronoProfileFactor(
  speedProfile: NonNullable<RaceInput["speedProfile"]>,
  weather: Record<RaceSegment, Weather>,
  parameters: ChronoMotionParameters,
  input: RaceInput
) {
  let inverseSpeed = 0;
  for (let sample = 0; sample < CHRONO_PROFILE_SAMPLES; sample += 1) {
    const raceProgress = (sample + 0.5) / CHRONO_PROFILE_SAMPLES;
    const segment = RACE_SEGMENTS[Math.min(RACE_SEGMENTS.length - 1, Math.floor(raceProgress * RACE_SEGMENTS.length))] ?? "start";
    const lapProgress = (raceProgress * Math.max(1, normalizeLaps(input.laps))) % 1;
    const speedKind = speedKindAtProgress(lapProgress, speedProfile);
    const profileSpeed = localSpeedFactor(lapProgress, speedProfile);
    const weatherGrip = weather[segment] === "heavy_rain" ? 0.86 : weather[segment] === "light_rain" ? 0.94 : 1;
    inverseSpeed += 1 / Math.max(MIN_CHRONO_SPEED_FACTOR, profileSpeed * parameterSpeedFactor(speedKind, parameters) * wetGripFactor(weatherGrip, parameters));
  }
  return inverseSpeed / CHRONO_PROFILE_SAMPLES;
}

function speedKindAtProgress(progress: number, speedProfile: NonNullable<RaceInput["speedProfile"]>): NonNullable<RaceInput["speedProfile"]>[number]["kind"] {
  return speedProfile.find((span) => progressInSpeedSpan(progress, span))?.kind ?? "straight";
}

function localSpeedFactor(progress: number, speedProfile: NonNullable<RaceInput["speedProfile"]>) {
  const factors = speedProfile.filter((span) => progressInSpeedSpan(progress, span)).map((span) => span.factor);
  return factors.length ? Math.min(...factors) : 1;
}

function parameterSpeedFactor(kind: NonNullable<RaceInput["speedProfile"]>[number]["kind"], parameters: ChronoMotionParameters) {
  if (kind === "straight") return parameters.topSpeed;
  if (kind === "braking") return parameters.braking;
  if (kind === "corner") return parameters.cornering;
  return parameters.acceleration;
}

function wetGripFactor(weatherGrip: number, parameters: ChronoMotionParameters) {
  if (weatherGrip >= 1) return 1;
  return weatherGrip + (1 - weatherGrip) * Math.max(0, Math.min(1, (parameters.wetGrip - 0.82) / 0.36));
}

function clampMotionParameters(parameters: ChronoMotionParameters): ChronoMotionParameters {
  return Object.fromEntries(
    Object.entries(parameters).map(([key, value]) => [key, Number(Math.max(0.72, Math.min(1.28, value)).toFixed(4))])
  ) as ChronoMotionParameters;
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

function normalizeLaps(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(1, Math.min(99, Math.round(value))) : 10;
}

function progressInSpeedSpan(progress: number, span: NonNullable<RaceInput["speedProfile"]>[number]) {
  return span.startProgress <= span.endProgress
    ? progress >= span.startProgress && progress <= span.endProgress
    : progress >= span.startProgress || progress <= span.endProgress;
}
