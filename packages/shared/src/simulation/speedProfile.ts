import type { RaceInput } from "../domain/race.js";

export type SpeedProfileFactorMode = "min" | "visual";
export type SpeedProfile = NonNullable<RaceInput["speedProfile"]>;

export function progressInSpeedSpan(progress: number, span: SpeedProfile[number]) {
  return span.startProgress <= span.endProgress
    ? progress >= span.startProgress && progress <= span.endProgress
    : progress >= span.startProgress || progress <= span.endProgress;
}

export function expandedSpeedSpan(span: SpeedProfile[number]) {
  return span.startProgress <= span.endProgress
    ? [{ start: span.startProgress, end: span.endProgress }]
    : [
        { start: 0, end: span.endProgress },
        { start: span.startProgress, end: 1 }
      ];
}

export function speedFactorAt(progress: number, speedProfile: SpeedProfile, mode: SpeedProfileFactorMode = "min") {
  const factors = speedProfile.filter((span) => progressInSpeedSpan(progress, span)).map((span) => span.factor);
  if (!factors.length) return 1;
  return mode === "visual" && factors.every((factor) => factor >= 1) ? Math.max(...factors) : Math.min(...factors);
}

export function integratedSpeedProfile(to: number, speedProfile: SpeedProfile, mode: SpeedProfileFactorMode = "min") {
  const end = Math.min(1, Math.max(0, to));
  const cuts = [...new Set([0, end, ...speedProfile.flatMap((span) => expandedSpeedSpan(span).flatMap((range) => [Math.min(end, range.start), Math.min(end, range.end)]))])]
    .filter((point) => point >= 0 && point <= end)
    .sort((left, right) => left - right);
  return cuts.slice(0, -1).reduce((sum, start, index) => {
    const finish = cuts[index + 1]!;
    return sum + (finish - start) * speedFactorAt((start + finish) / 2, speedProfile, mode);
  }, 0);
}
