import {
  createPrng,
  RACE_SEGMENTS,
  type QualifyingRun,
  RACE_REPLAY_BASE_SECONDS,
  type RaceDecision,
  type RaceEvent,
  type RaceInput,
  type RaceResult,
  type RaceSegment,
  type RaceTraits,
  type TrackSpeedProfile,
  type Weather
} from "@cr-league/shared";
import { strongestForecast } from "./utils.js";

const QUALIFYING_REFERENCE_LAP_SECONDS = 90;
const WEATHER_STEPS: Weather[] = ["dry", "light_rain", "heavy_rain"];
// Fixed reference epoch (2024-01-01T00:00:00Z) keeps generated chronos reproducible without using the wall clock.
const QUALIFYING_CREATED_AT_EPOCH_MS = 1704067200000;

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
  speedProfile?: TrackSpeedProfile;
  forecast: RaceInput["forecast"];
  laps: number;
}): QualifyingRun[] {
  const finishWeather = strongestForecast(input.forecast);
  const traits = input.traits ?? { grip: 62, overtaking: 62, energy: 62 };
  const traitBonus = (traits.grip + traits.overtaking + traits.energy - 180) / 18;
  const approachDelta = input.decision.approach === "aggressive" ? -1.1 : input.decision.approach === "prudent" ? 0.7 : 0;
  // Seed the per-lap variance so the same setup and seed always produce the same chrono (reproducible learning loop; ADR-004).
  const prng = createPrng(`${input.seed}:qualifying:${input.teamId}`);
  const lapTimes = Array.from({ length: input.laps }, (_, index) => {
    const weather = qualifyingWeatherAt(index, input.laps, finishWeather);
    const weatherPenalty = weather === "heavy_rain" ? 2.8 : weather === "light_rain" ? 1.2 : 0;
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
    const warmupPenalty = index === 0 && input.laps > 1 ? 1.1 : 0;
    const tyreDelta = index > 1 ? (index - 1) * 0.16 : 0;
    const variance = (prng.next() - 0.5) * 2.4;
    return Number(Math.max(72, 91 - traitBonus + weatherPenalty + approachDelta + prepDelta + cardDelta + warmupPenalty + tyreDelta + variance).toFixed(2));
  });
  const result = createQualifyingResult(input.teamId, input.teamName, input.seed, input.decision, lapTimes, finishWeather, input.trackLengthMeters ?? 3200, input.speedProfile ?? []);

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

function qualifyingWeatherAt(index: number, count: number, finishWeather: Weather) {
  const progress = count <= 1 ? 1 : index / (count - 1);
  const finishIndex = WEATHER_STEPS.indexOf(finishWeather);
  return WEATHER_STEPS[Math.round(finishIndex * progress)] ?? "dry";
}

function createQualifyingResult(teamId: string, teamName: string, seed: string, decision: RaceDecision, lapTimes: number[], finishWeather: Weather, trackLengthMeters: number, speedProfile: TrackSpeedProfile): RaceResult {
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
    resolvedWeather: Object.fromEntries(RACE_SEGMENTS.map((segment, index) => [segment, qualifyingWeatherAt(index, RACE_SEGMENTS.length, finishWeather)])) as Record<RaceSegment, Weather>,
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
    replayTrace: createQualifyingReplayTrace(teamId, lapTimes.length, visualTime, trackLengthMeters, speedProfile, finishWeather),
    consumedCards: [],
    report: {
      headline: `${teamName} ${bestTime.toFixed(2)}s`,
      blocks: []
    }
  };
}

function createQualifyingReplayTrace(teamId: string, laps: number, visualTime: number, trackLengthMeters: number, speedProfile: TrackSpeedProfile, finishWeather: Weather) {
  const stepsPerLap = 12;
  return Array.from({ length: laps * stepsPerLap + 1 }, (_, index) => {
    const progress = index / (laps * stepsPerLap);
    const phase = progress >= 1 ? "finished" as const : index === 0 ? "grid" as const : progress <= 0.1 ? "launch" as const : "racing" as const;
    const segmentIndex = Math.min(RACE_SEGMENTS.length - 1, Math.floor(progress * RACE_SEGMENTS.length));
    const segment = RACE_SEGMENTS[segmentIndex] ?? "start";
    const weather = qualifyingWeatherAt(segmentIndex, RACE_SEGMENTS.length, finishWeather);
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

function integratedSpeedProfile(to: number, speedProfile: TrackSpeedProfile) {
  const end = Math.min(1, Math.max(0, to));
  const cuts = [...new Set([0, end, ...speedProfile.flatMap((span) => expandedSpeedSpan(span).flatMap((range) => [Math.min(end, range.start), Math.min(end, range.end)]))])]
    .filter((point) => point >= 0 && point <= end)
    .sort((left, right) => left - right);
  return cuts.slice(0, -1).reduce((sum, start, index) => {
    const finish = cuts[index + 1]!;
    return sum + (finish - start) * speedFactorAt((start + finish) / 2, speedProfile);
  }, 0);
}

function speedFactorAt(progress: number, speedProfile: TrackSpeedProfile) {
  const matches = speedProfile.filter((span) => progressInSpeedSpan(progress, span)).map((span) => span.factor);
  return matches.length ? Math.min(...matches) : 1;
}

function expandedSpeedSpan(span: TrackSpeedProfile[number]) {
  return span.startProgress <= span.endProgress
    ? [{ start: span.startProgress, end: span.endProgress }]
    : [
        { start: span.startProgress, end: 1 },
        { start: 0, end: span.endProgress }
      ];
}

function progressInSpeedSpan(progress: number, span: TrackSpeedProfile[number]) {
  return expandedSpeedSpan(span).some((range) => progress >= range.start && progress <= range.end);
}
