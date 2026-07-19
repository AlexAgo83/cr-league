import {
  type QualifyingRun,
  RACE_REPLAY_BASE_SECONDS,
  type RaceDecision,
  type RaceEvent,
  type RaceInput,
  type RaceResult,
  type RaceSegment,
  type RaceTraits,
  type Weather
} from "@cr-league/shared";
import { strongestForecast } from "./utils.js";

const QUALIFYING_REFERENCE_LAP_SECONDS = 90;

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
  trackLengthMeters?: number;
  forecast: RaceInput["forecast"];
  laps: number;
  raceLaps?: number;
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
  const result = createQualifyingResult(input.teamId, input.teamName, input.seed, input.decision, lapTimes, weather, input.trackLengthMeters ?? 3200, input.raceLaps ?? input.laps);
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

function createQualifyingResult(teamId: string, teamName: string, seed: string, decision: RaceDecision, lapTimes: number[], weather: Weather, trackLengthMeters: number, raceLaps: number): RaceResult {
  const segments: RaceSegment[] = ["start", "early", "mid", "late", "finish"];
  const bestTime = Math.min(...lapTimes);
  const averageLapTime = lapTimes.reduce((sum, time) => sum + time, 0) / Math.max(1, lapTimes.length);
  const visualTime = (RACE_REPLAY_BASE_SECONDS / Math.max(1, raceLaps)) * (averageLapTime / QUALIFYING_REFERENCE_LAP_SECONDS);
  const events: RaceEvent[] = lapTimes.map((time, index) => ({
    id: `qualifying_lap_${index + 1}`,
    order: index,
    segment: segments[Math.min(segments.length - 1, Math.floor((index / lapTimes.length) * segments.length))] ?? "finish",
    lap: index + 1,
    type: "finish",
    traceProgress: (index + 1) / lapTimes.length,
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
    replayTrace: createQualifyingReplayTrace(teamId, lapTimes.length, visualTime, trackLengthMeters, segments),
    consumedCards: [],
    report: {
      headline: `${teamName} ${bestTime.toFixed(2)}s`,
      blocks: []
    }
  };
}

function createQualifyingReplayTrace(teamId: string, laps: number, visualTime: number, trackLengthMeters: number, segments: RaceSegment[]) {
  const stepsPerLap = 12;
  return Array.from({ length: laps * stepsPerLap + 1 }, (_, index) => {
    const progress = index / (laps * stepsPerLap);
    const phase = progress >= 1 ? "finished" as const : index === 0 ? "grid" as const : "racing" as const;
    const distanceMeters = Number((progress * trackLengthMeters).toFixed(1));
    return {
      segment: segments[Math.min(segments.length - 1, Math.floor(progress * segments.length))] ?? "start",
      lap: Math.min(laps, Math.floor(index / stepsPerLap) + 1),
      progress,
      distanceMeters,
      order: [teamId],
      times: { [teamId]: Number((visualTime * progress).toFixed(1)) },
      gaps: { [teamId]: 0 },
      cars: {
        [teamId]: {
          trackProgress: Number(progress.toFixed(4)),
          distanceMeters,
          speed: phase === "racing" ? 1 : 0,
          phase
        }
      }
    };
  });
}
