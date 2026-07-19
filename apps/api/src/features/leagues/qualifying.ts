import {
  type QualifyingRun,
  type RaceDecision,
  type RaceEvent,
  type RaceInput,
  type RaceResult,
  type RaceSegment,
  type RaceTraits,
  type Weather
} from "@cr-league/shared";
import { QUALIFYING_REPLAY_SECONDS_PER_LAP } from "./constants.js";
import { strongestForecast } from "./utils.js";

export function bestQualifyingRuns(runs: QualifyingRun[]) {
  return [...runs]
    .sort((left, right) => left.time - right.time)
    .filter((run, index, sorted) => sorted.findIndex((candidate) => candidate.teamId === run.teamId) === index);
}

export function qualifyingCardForTeam(runs: QualifyingRun[], teamId: string) {
  return runs.find((run) => run.teamId === teamId && run.decision?.cardId === "qualifying_focus")?.decision?.cardId;
}

export function createQualifyingRuns(input: {
  seed: string;
  teamId: string;
  teamName: string;
  decision: RaceDecision;
  primaryTrait: RaceInput["primaryTrait"];
  secondaryTrait: RaceInput["secondaryTrait"];
  traits?: RaceTraits;
  forecast: RaceInput["forecast"];
  laps: number;
}): QualifyingRun[] {
  const weather = strongestForecast(input.forecast);
  const traits = input.traits ?? { grip: 62, overtaking: 62, energy: 62 };
  const traitBonus = (traits.grip + traits.overtaking + traits.energy - 180) / 18;
  const weatherPenalty = weather === "heavy_rain" ? 2.8 : weather === "light_rain" ? 1.2 : 0;
  const approachDelta = input.decision.approach === "aggressive" ? -1.1 : input.decision.approach === "prudent" ? 0.7 : 0;
  const prepDelta =
    input.decision.preparation === "speed"
      ? -1.2
      : input.decision.preparation === "weather" && weather !== "dry"
        ? -1.4
        : input.decision.preparation === "reliability"
          ? 0.4
          : 0;
  const cardDelta =
    input.decision.cardId === "qualifying_focus"
      ? -0.3
      : input.decision.cardId === "launch_boost"
        ? -0.6
        : input.decision.cardId === "rain_grip" && weather !== "dry"
          ? -0.7
          : 0;
  const pitDelta = input.decision.pitStrategy === "heavy_pack" ? 0.6 : input.decision.pitStrategy === "mini_pack" ? -0.35 : 0;
  const lapTimes = Array.from({ length: input.laps }, (_, index) => {
    const warmupPenalty = index === 0 && input.laps > 1 ? 1.1 : 0;
    const tyreDelta = index > 1 ? (index - 1) * 0.16 : 0;
    const variance = (Math.random() - 0.5) * 2.4;
    return Number(Math.max(72, 91 - traitBonus + weatherPenalty + approachDelta + prepDelta + pitDelta + cardDelta + warmupPenalty + tyreDelta + variance).toFixed(2));
  });
  const result = createQualifyingResult(input.teamId, input.teamName, input.seed, input.decision, lapTimes, weather);
  const createdAt = new Date().toISOString();

  return lapTimes.map((time, index) => ({
    teamId: input.teamId,
    time,
    lap: index + 1,
    attempts: 1,
    decision: input.decision,
    result,
    createdAt
  }));
}

function createQualifyingResult(teamId: string, teamName: string, seed: string, decision: RaceDecision, lapTimes: number[], weather: Weather): RaceResult {
  const segments: RaceSegment[] = ["start", "early", "mid", "late", "finish"];
  const bestTime = Math.min(...lapTimes);
  const visualTime = lapTimes.length * QUALIFYING_REPLAY_SECONDS_PER_LAP;
  const events: RaceEvent[] = lapTimes.map((time, index) => ({
    id: `qualifying_lap_${index + 1}`,
    order: index,
    segment: segments[Math.min(segments.length - 1, Math.floor((index / lapTimes.length) * segments.length))] ?? "finish",
    lap: index + 1,
    type: "finish",
    teamId,
    severity: "minor",
    positionDelta: 0,
    tags: ["qualifying"],
    replayText: `${teamName} boucle le tour ${index + 1} en ${time.toFixed(2)}s`,
    reportText: `${teamName} signe ${time.toFixed(2)}s au tour ${index + 1}.`
  }));

  return {
    grandPrixName: "Chrono",
    seed,
    resolvedWeather: Object.fromEntries(segments.map((segment) => [segment, weather])) as Record<RaceSegment, Weather>,
    classification: [
      {
        position: 1,
        teamId,
        teamName,
        points: 0,
        credits: 0,
        score: Number((300 - bestTime).toFixed(2)),
        positionChange: 0,
        status: "finished",
        resultTags: [decision.approach, decision.preparation]
      }
    ],
    events,
    replayTrace: Array.from({ length: lapTimes.length * 4 + 1 }, (_, index) => {
      const progress = index / (lapTimes.length * 4);
      return {
        segment: segments[Math.min(segments.length - 1, Math.floor(progress * segments.length))] ?? "start",
        lap: Math.min(lapTimes.length, Math.floor(index / 4) + 1),
        progress,
        order: [teamId],
        times: { [teamId]: Number((visualTime * progress).toFixed(1)) },
        gaps: { [teamId]: 0 }
      };
    }),
    consumedCards: [],
    report: {
      headline: `${teamName} ${bestTime.toFixed(2)}s`,
      blocks: []
    }
  };
}
