import { RACE_SEGMENTS, type RaceSegment } from "../domain/race.js";

const SEGMENT_LAPS: Record<RaceSegment, number> = {
  start: 1,
  early: 2,
  mid: 5,
  late: 8,
  finish: 10
};

export function lapForSegment(segment: RaceSegment) {
  return SEGMENT_LAPS[segment];
}

/**
 * Which lap the field is on. Every lap owns an equal slice of the race, so the counter turns over
 * exactly when a car completes one. Rounding instead of flooring gave the first and last laps half a
 * slice each: on a seven-lap race the board called lap two while the cars were 58% through lap one,
 * and sat on lap seven for the last 8%.
 */
export function lapForProgress(progress: number, laps: number) {
  const clamped = Math.max(0, Math.min(1, progress));
  return Math.max(1, Math.min(laps, Math.floor(clamped * laps) + 1));
}

export function segmentOrderLap(segment: RaceSegment) {
  const index = RACE_SEGMENTS.indexOf(segment);
  return index < 0 ? 1 : index + 1;
}

export function classificationScore(state: { scores: { score: number }; positionDelta: number }) {
  return state.scores.score + state.positionDelta;
}
