import type { CardId, PitStrategy, RaceInput, RaceParticipant, RaceSegment, Weather } from "../domain/race.js";
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

const CHRONO_PROFILE_SAMPLES = 120;
const MIN_CHRONO_SPEED_FACTOR = 0.42;

const CARD_MOTION_EFFECTS: Record<CardId, Partial<ChronoMotionParameters>> = {
  rain_grip: { wetGrip: 0.09, cornering: 0.015 },
  fleet_maintenance: { reliability: 0.08, consistency: 0.025 },
  launch_boost: { acceleration: 0.12, attack: 0.025, reliability: -0.025 },
  urban_draft: { attack: 0.08, topSpeed: 0.02 },
  final_surge: { topSpeed: 0.05, attack: 0.045, reliability: -0.035 },
  fleet_sponsorship: { topSpeed: -0.012, consistency: 0.012 },
  soft_tires: { acceleration: 0.04, cornering: 0.07, reliability: -0.045 },
  qualifying_focus: { acceleration: 0.035, consistency: 0.015 },
  defensive_order: { defense: 0.09, consistency: 0.035, attack: -0.045 },
  adjustable_wing: { topSpeed: 0.035, cornering: 0.03, braking: -0.015 },
  rain_mapping: { wetGrip: 0.075, consistency: 0.025 },
  economy_mode: { topSpeed: -0.018, reliability: 0.03, pitEfficiency: 0.015 },
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
      const racecraftFactor = 1 + (parameters.attack - 1) * 0.08 + (parameters.defense - 1) * 0.06 + (parameters.consistency - 1) * 0.05;
      const scoreFactor = 1 + Math.max(-0.16, Math.min(0.22, classificationScore(state) / 520));
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
  const heavyPackTimeTradeoff = pitStrategy(state.participant.decision) === "heavy_pack" ? 2.4 : 0;
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
