import { describe, expect, it } from "vitest";
import { expandedSpeedSpan, integratedSpeedProfile, progressInSpeedSpan, speedFactorAt, type SpeedProfile } from "./speedProfile.js";

describe("speedProfile", () => {
  const wrapped: SpeedProfile[number] = { kind: "corner", startProgress: 0.8, endProgress: 0.2, factor: 0.7 };

  it("handles speed spans that wrap over the lap boundary", () => {
    expect(expandedSpeedSpan(wrapped)).toEqual([
      { start: 0, end: 0.2 },
      { start: 0.8, end: 1 }
    ]);
    expect(progressInSpeedSpan(0.1, wrapped)).toBe(true);
    expect(progressInSpeedSpan(0.5, wrapped)).toBe(false);
  });

  it("keeps chrono minimum factors and visual boost factors explicit", () => {
    const profile: SpeedProfile = [
      { kind: "straight", startProgress: 0, endProgress: 1, factor: 1.05 },
      { kind: "exit", startProgress: 0.2, endProgress: 0.4, factor: 1.12 }
    ];

    expect(speedFactorAt(0.3, profile)).toBe(1.05);
    expect(speedFactorAt(0.3, profile, "visual")).toBe(1.12);
    expect(integratedSpeedProfile(1, profile, "visual")).toBeGreaterThan(integratedSpeedProfile(1, profile));
  });
});
