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

export function lapForProgress(progress: number, laps: number) {
  return Math.max(1, Math.min(laps, Math.round(1 + Math.max(0, Math.min(1, progress)) * (laps - 1))));
}

export function segmentOrderLap(segment: RaceSegment) {
  const index = RACE_SEGMENTS.indexOf(segment);
  return index < 0 ? 1 : index + 1;
}

export function classificationScore(state: { scores: { score: number }; positionDelta: number }) {
  return state.scores.score + state.positionDelta;
}
