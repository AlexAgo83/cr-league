import {
  RACE_SEGMENTS,
  type QualifyingRun,
  type RaceDecision,
  type RaceEvent,
  type RaceInput,
  type RaceResult,
  type RaceSegment,
  type RaceTraits,
  type Weather
} from "../domain/race.js";
import type { TrackSpeedProfile } from "../domain/circuits.js";
import { createPrng } from "./prng.js";
import { RACE_REPLAY_BASE_SECONDS, resolveRaceWeather } from "./simulateRace.js";
import { integratedSpeedProfile, speedFactorAt } from "./speedProfile.js";

const QUALIFYING_REFERENCE_LAP_SECONDS = 90;
const QUALIFYING_CREATED_AT_EPOCH_MS = 1704067200000;

export function bestQualifyingRuns(runs: QualifyingRun[]) {
  const best = new Map<string, QualifyingRun>();
  for (const run of runs) {
    const current = best.get(run.teamId);
    if (!current || run.time < current.time) best.set(run.teamId, run);
  }
  return [...best.values()];
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
  speedProfile?: TrackSpeedProfile;
  forecast: RaceInput["forecast"];
  laps: number;
  weatherSeed?: string;
}): QualifyingRun[] {
  const weather = resolveRaceWeather(input.forecast, input.weatherSeed ?? input.seed);
  const traits = input.traits ?? { grip: 62, overtaking: 62, energy: 62 };
  const traitBonus = (traits.grip + traits.overtaking + traits.energy - 180) / 18;
  const approachDelta = input.decision.approach === "aggressive" ? -1.1 : input.decision.approach === "prudent" ? 0.7 : 0;
  const prng = createPrng(`${input.seed}:qualifying:${input.teamId}`);
  const lapTimes = Array.from({ length: input.laps }, (_, index) => {
    const lapWeather = qualifyingWeatherAt(index, input.laps, weather);
    const weatherPenalty = lapWeather === "heavy_rain" ? 2.8 : lapWeather === "light_rain" ? 1.2 : 0;
    const prepDelta =
      input.decision.preparation === "speed"
        ? -1.2
        : input.decision.preparation === "weather" && lapWeather !== "dry"
          ? -1.4
          : input.decision.preparation === "reliability"
            ? 0.4
            : 0;
    const cardDelta =
      input.decision.cardId === "qualifying_focus"
        ? -0.3
        : input.decision.cardId === "launch_boost"
          ? -0.6
          : input.decision.cardId === "rain_grip" && lapWeather !== "dry"
            ? -0.7
            : 0;
    const warmupPenalty = index === 0 && input.laps > 1 ? 1.1 : 0;
    const tyreDelta = index > 1 ? (index - 1) * 0.16 : 0;
    const variance = (prng.next() - 0.5) * 2.4;
    return Number(Math.max(72, 91 - traitBonus + weatherPenalty + approachDelta + prepDelta + cardDelta + warmupPenalty + tyreDelta + variance).toFixed(2));
  });
  const result = createQualifyingResult(input.teamId, input.teamName, input.seed, input.decision, lapTimes, weather, input.trackLengthMeters ?? 3200, input.speedProfile ?? []);

  return lapTimes.map((time, index) => ({
    teamId: input.teamId,
    time,
    lap: index + 1,
    attempts: 1,
    decision: input.decision,
    result,
    createdAt: new Date(QUALIFYING_CREATED_AT_EPOCH_MS + index * 1000).toISOString()
  }));
}

function qualifyingWeatherAt(index: number, count: number, weather: Record<RaceSegment, Weather>) {
  const progress = count <= 1 ? 1 : index / (count - 1);
  const segment = RACE_SEGMENTS[Math.round((RACE_SEGMENTS.length - 1) * progress)] ?? "finish";
  return weather[segment] ?? "dry";
}

function createQualifyingResult(teamId: string, teamName: string, seed: string, decision: RaceDecision, lapTimes: number[], weather: Record<RaceSegment, Weather>, trackLengthMeters: number, speedProfile: TrackSpeedProfile): RaceResult {
  const bestTime = Math.min(...lapTimes);
  const averageLapTime = lapTimes.reduce((sum, time) => sum + time, 0) / Math.max(1, lapTimes.length);
  const visualTime = RACE_REPLAY_BASE_SECONDS * (averageLapTime / QUALIFYING_REFERENCE_LAP_SECONDS);
  const events: RaceEvent[] = lapTimes.map((time, index) => ({
    id: `qualifying_lap_${index + 1}`,
    order: index,
    segment: RACE_SEGMENTS[Math.min(RACE_SEGMENTS.length - 1, Math.floor((index / lapTimes.length) * RACE_SEGMENTS.length))] ?? "finish",
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
    resolvedWeather: weather,
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
    replayTrace: createQualifyingReplayTrace(teamId, lapTimes.length, visualTime, trackLengthMeters, speedProfile, weather),
    consumedCards: [],
    report: {
      headline: `${teamName} ${bestTime.toFixed(2)}s`,
      blocks: []
    }
  };
}

function createQualifyingReplayTrace(teamId: string, laps: number, visualTime: number, trackLengthMeters: number, speedProfile: TrackSpeedProfile, weatherTimeline: Record<RaceSegment, Weather>) {
  const stepsPerLap = 12;
  return Array.from({ length: laps * stepsPerLap + 1 }, (_, index) => {
    const progress = index / (laps * stepsPerLap);
    const phase = progress >= 1 ? "finished" as const : index === 0 ? "grid" as const : progress <= 0.1 ? "launch" as const : "racing" as const;
    const segmentIndex = Math.min(RACE_SEGMENTS.length - 1, Math.floor(progress * RACE_SEGMENTS.length));
    const segment = RACE_SEGMENTS[segmentIndex] ?? "start";
    const weather = weatherTimeline[segment] ?? "dry";
    const adjustedProfile = weatherAdjustedSpeedProfile(speedProfile, weather);
    const trackProgress = replayTrackProgress(progress, laps, adjustedProfile);
    const distanceMeters = Number((trackProgress * trackLengthMeters).toFixed(1));
    return {
      segment,
      lap: Math.min(laps, Math.floor(index / stepsPerLap) + 1),
      progress,
      distanceMeters: Number((progress * trackLengthMeters).toFixed(1)),
      order: [teamId],
      times: { [teamId]: Number((visualTime * progress).toFixed(1)) },
      gaps: { [teamId]: 0 },
      cars: {
        [teamId]: {
          trackProgress: progress >= 1 ? 1 : Number(trackProgress.toFixed(4)),
          distanceMeters,
          speed: qualifyingReplaySpeed(phase, progress, laps, adjustedProfile, weather),
          phase
        }
      }
    };
  });
}

function qualifyingReplaySpeed(phase: NonNullable<NonNullable<RaceResult["replayTrace"]>[number]["cars"]>[string]["phase"], progress: number, laps: number, speedProfile: TrackSpeedProfile, weather: Weather) {
  if (phase === "grid" || phase === "finished") return 0;
  if (phase === "launch") return 0.7;
  const lapProgress = (progress * Math.max(1, laps)) % 1;
  const weatherSpeed = weather === "heavy_rain" ? 0.86 : weather === "light_rain" ? 0.94 : 1;
  return Number((weatherSpeed * speedFactorAt(lapProgress, speedProfile)).toFixed(3));
}

function replayTrackProgress(progress: number, laps: number, speedProfile: TrackSpeedProfile) {
  if (!speedProfile.length || progress <= 0 || progress >= 1) return progress;
  const progressLaps = progress * Math.max(1, laps);
  const completedLaps = Math.floor(progressLaps);
  const lapProgress = progressLaps - completedLaps;
  const total = integratedSpeedProfile(1, speedProfile);
  return total <= 0 ? progress : (completedLaps + integratedSpeedProfile(lapProgress, speedProfile) / total) / Math.max(1, laps);
}

function weatherAdjustedSpeedProfile(speedProfile: TrackSpeedProfile, weather: Weather) {
  if (weather === "dry") return speedProfile;
  const multiplier = weather === "heavy_rain" ? 0.85 : 0.93;
  return speedProfile.map((span) => (
    span.kind === "straight" ? span : { ...span, factor: Number(Math.max(0.35, span.factor * multiplier).toFixed(3)) }
  ));
}
