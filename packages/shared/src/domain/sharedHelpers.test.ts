import { describe, expect, it } from "vitest";
import { bestQualifyingRuns, lapForProgress, lapForSegment, safeHex, strongestForecast, type QualifyingRun } from "../index.js";

function qualifyingRun(teamId: string, time: number, attempts: number): QualifyingRun {
  return {
    teamId,
    time,
    lap: attempts,
    attempts,
    createdAt: String(attempts),
    decision: { approach: "balanced", preparation: "speed", pitStrategy: "standard" },
    result: {
      grandPrixName: "Qualifying",
      seed: "seed",
      resolvedWeather: { start: "dry", early: "dry", mid: "dry", late: "dry", finish: "dry" },
      classification: [],
      events: [],
      consumedCards: [],
      report: { headline: "", blocks: [] }
    }
  };
}

describe("shared helpers", () => {
  it("uses the rounded lap mapping shared by race displays", () => {
    expect(lapForSegment("mid")).toBe(5);
    expect(lapForProgress(0, 10)).toBe(1);
    expect(lapForProgress(0.5, 10)).toBe(6);
    expect(lapForProgress(1, 10)).toBe(10);
    // Every lap owns the same slice, so the counter turns over where a car completes one.
    expect(lapForProgress(0.09, 7)).toBe(1);
    expect(lapForProgress(0.15, 7)).toBe(2);
    expect(lapForProgress(6 / 7, 7)).toBe(7);
    expect(lapForProgress(0.99, 7)).toBe(7);
  });

  it("keeps dry as the forecast tie fallback", () => {
    expect(strongestForecast({ dry: 40, light_rain: 40, heavy_rain: 10 })).toBe("dry");
    expect(strongestForecast({ dry: 20, light_rain: 30, heavy_rain: 55 })).toBe("heavy_rain");
  });

  it("keeps the fastest qualifying run per team", () => {
    expect(
      bestQualifyingRuns([
        qualifyingRun("a", 91, 1),
        qualifyingRun("b", 93, 1),
        qualifyingRun("a", 89, 2)
      ]).map((run) => `${run.teamId}:${run.time}`)
    ).toEqual(["a:89", "b:93"]);
  });

  it("sanitizes hex colors", () => {
    expect(safeHex("#abcdef", "#000000")).toBe("#abcdef");
    expect(safeHex("red", "#000000")).toBe("#000000");
    expect(safeHex(undefined, "#000000")).toBe("#000000");
  });
});
