import { CARD_DEFINITIONS } from "../cards/definitions.js";
import type {
  CardId,
  ClassificationEntry,
  InternalScores,
  RaceEvent,
  RaceInput,
  RaceParticipant,
  RaceResult,
  RaceSegment,
  ReplayTracePoint,
  Weather
} from "../domain/race.js";
import { RACE_SEGMENTS } from "../domain/race.js";
import { createPrng } from "./prng.js";

const POINTS_BY_POSITION = [25, 18, 15, 12, 10, 8] as const;
const CREDITS_BY_POSITION = [150, 130, 115, 105, 100, 100] as const;
const SEGMENT_BASE_TIME: Record<RaceSegment, number> = {
  start: 18,
  early: 34,
  mid: 36,
  late: 34,
  finish: 20
};

type TeamState = {
  participant: RaceParticipant;
  scores: InternalScores;
  elapsedTime: number;
  positionDelta: number;
  resultTags: Set<string>;
  mechanicSaveAvailable: boolean;
  consumedCard?: CardId;
};

export function simulateRace(input: RaceInput): RaceResult {
  if (input.participants.length < 2) {
    throw new Error("A race needs at least two participants.");
  }

  const prng = createPrng(input.seed);
  const weather = resolveWeather(input.forecast, prng.pickWeighted);
  const states = input.participants.map(createTeamState);
  const events: RaceEvent[] = [];
  const replayTrace: ReplayTracePoint[] = [createReplayTracePoint("start", 0, states, "grid")];

  for (const [index, segment] of RACE_SEGMENTS.entries()) {
    if (segment !== "start" && weather[segment] !== weather[previousSegment(segment)]) {
      events.push(createWeatherEvent(events.length, segment, weather[segment], states[0]?.participant.teamId ?? ""));
    }

    for (const state of states) {
      applySegment(state, segment, weather[segment], input, prng.next);
      maybeAddCardEvent(state, segment, weather[segment], events, states);
      maybeAddRiskEvent(state, segment, events, prng.next);
    }

    maybeAddFlavorEvent(segment, weather[segment], input, states, events, prng.next);
    replayTrace.push(createReplayTracePoint(segment, (index + 1) / RACE_SEGMENTS.length, states, "time"));
  }

  const classification = classify(states);
  addFinishEvents(events, classification);

  return {
    grandPrixName: input.grandPrixName,
    seed: input.seed,
    resolvedWeather: weather,
    classification,
    events: events.map((event, order) => ({ ...event, id: `evt_${String(order + 1).padStart(3, "0")}`, order })),
    replayTrace,
    consumedCards: states
      .filter((state): state is TeamState & { consumedCard: CardId } => Boolean(state.consumedCard))
      .map((state) => ({ teamId: state.participant.teamId, cardId: state.consumedCard })),
    report: buildReport(input.grandPrixName, classification, events)
  };
}

function createReplayTracePoint(segment: RaceSegment, progress: number, states: TeamState[], mode: "grid" | "time"): ReplayTracePoint {
  const sorted =
    mode === "grid"
      ? [...states].sort((left, right) => left.participant.standingsRank - right.participant.standingsRank)
      : [...states].sort((left, right) => left.elapsedTime - right.elapsedTime || right.scores.score - left.scores.score);
  const leaderTime = sorted[0]?.elapsedTime ?? 0;

  return {
    segment,
    lap: lapForSegment(segment),
    progress,
    order: sorted.map((state) => state.participant.teamId),
    times: Object.fromEntries(
      sorted.map((state) => [
        state.participant.teamId,
        mode === "grid" ? 0 : Number(state.elapsedTime.toFixed(1))
      ])
    ),
    gaps: Object.fromEntries(
      sorted.map((state) => [
        state.participant.teamId,
        mode === "grid" ? 0 : Math.max(0, Number((state.elapsedTime - leaderTime).toFixed(1)))
      ])
    )
  };
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
    elapsedTime: 0,
    positionDelta: 0,
    resultTags: new Set(),
    mechanicSaveAvailable: participant.decision.cardId === "fleet_maintenance",
    consumedCard: participant.decision.cardId
  };
}

function applyDecision(scores: InternalScores, participant: RaceParticipant) {
  const { approach, preparation } = participant.decision;

  if (approach === "prudent") {
    scores.pace -= 4;
    scores.control += 8;
    scores.reliability += 8;
    scores.aggression -= 8;
  } else if (approach === "aggressive") {
    scores.pace += 8;
    scores.control -= 6;
    scores.reliability -= 6;
    scores.aggression += 10;
  }

  if (preparation === "speed") {
    scores.pace += 8;
    scores.reliability -= 2;
  } else if (preparation === "reliability") {
    scores.reliability += 10;
    scores.control += 4;
    scores.pace -= 2;
  } else {
    scores.weatherReadiness += 12;
    scores.pace -= 2;
  }

  if (participant.botArchetype === "rain_specialist") {
    scores.weatherReadiness += 6;
  } else if (participant.botArchetype === "sprinter") {
    scores.pace += 4;
    scores.aggression += 4;
  } else if (participant.botArchetype === "mechanic") {
    scores.reliability += 6;
  }
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
    delta -= 4;
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

function clampTrait(value: number) {
  return Math.max(1, Math.min(99, Math.round(value)));
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
  events: RaceEvent[],
  states: TeamState[]
) {
  const cardId = state.participant.decision.cardId;
  if (!cardId) return;

  if (cardId === "rain_grip" && segment === "mid") {
    const rained = weather !== "dry";
    state.scores.score += rained ? 16 : -8;
    state.positionDelta += rained ? 2 : -1;
    state.resultTags.add(rained ? "weather_gamble" : "wrong_weather_bet");
    events.push(createCardEvent(events.length, state, segment, rained ? "weather_gamble_paid" : "wrong_weather_bet", rained ? 2 : -1));
  } else if (cardId === "launch_boost" && segment === "start") {
    state.scores.score += 12;
    state.scores.reliability -= 6;
    state.positionDelta += 1;
    state.resultTags.add("launch_boost");
    events.push(createCardEvent(events.length, state, segment, "card_triggered", 1));
  } else if (cardId === "urban_draft" && segment === "mid" && state.participant.decision.rivalTeamId) {
    const rival = states.find((candidate) => candidate.participant.teamId === state.participant.decision.rivalTeamId);
    if (rival) {
      state.scores.score += 10;
      rival.scores.score -= 4;
      state.positionDelta += 1;
      state.resultTags.add("rival_pressure");
      events.push(createCardEvent(events.length, state, segment, "rival_overtake", 1, rival.participant.teamId));
    }
  } else if (cardId === "final_surge" && segment === "finish") {
    const outsidePodium = state.participant.standingsRank > 3;
    state.scores.score += outsidePodium ? 14 : 5;
    state.scores.reliability -= 5;
    state.positionDelta += outsidePodium ? 1 : 0;
    state.resultTags.add("final_surge");
    events.push(createCardEvent(events.length, state, segment, "late_push_gain", outsidePodium ? 1 : 0));
  } else if (cardId === "fleet_maintenance" && segment === "late" && !state.resultTags.has("mechanic_save")) {
    state.resultTags.add("maintenance_ready");
    events.push(createCardEvent(events.length, state, segment, "card_triggered", 0));
  } else if (cardId === "fleet_sponsorship" && segment === "finish") {
    state.resultTags.add("sponsor_bonus");
    events.push(createCardEvent(events.length, state, segment, "sponsor_payout", 0));
  }
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
    const baseCredits = CREDITS_BY_POSITION[index] ?? 100;
    const sponsorBonus = state.participant.decision.cardId === "fleet_sponsorship" ? 50 : 0;

    return {
      position,
      teamId: state.participant.teamId,
      teamName: state.participant.teamName,
      points: POINTS_BY_POSITION[index] ?? 0,
      credits: baseCredits + sponsorBonus,
      positionChange: state.participant.standingsRank - position + state.positionDelta,
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
