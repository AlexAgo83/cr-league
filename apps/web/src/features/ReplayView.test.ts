import { describe, expect, it } from "vitest";
import type { RaceResult } from "@cr-league/shared";
import { carProgressAtRaceTime, displayLapAtProgress, finishTimes } from "./ReplayView.js";

const result: RaceResult = {
  grandPrixName: "Test GP",
  seed: "seed",
  resolvedWeather: { start: "dry", early: "dry", mid: "dry", late: "dry", finish: "dry" },
  classification: [
    { position: 1, teamId: "leader", teamName: "Leader", points: 25, credits: 150, positionChange: 0, status: "finished", resultTags: [] },
    { position: 2, teamId: "last", teamName: "Last", points: 18, credits: 100, positionChange: 0, status: "finished", resultTags: [] }
  ],
  events: [],
  consumedCards: [],
  report: { headline: "Test", blocks: [] }
};

describe("ReplayView timing", () => {
  it("maps internal replay progress to the displayed circuit lap count", () => {
    expect([0, 0.2, 0.5, 0.8, 1].map((progress) => displayLapAtProgress(progress, 4))).toEqual([1, 2, 3, 3, 4]);
    expect([0, 0.2, 0.5, 0.8, 1].map((progress) => displayLapAtProgress(progress, 5))).toEqual([1, 2, 3, 4, 5]);
    expect([0, 0.2, 0.5, 0.8, 1].map((progress) => displayLapAtProgress(progress, 6))).toEqual([1, 2, 4, 5, 6]);
  });

  it("keeps replay running until the last finisher reaches the line", () => {
    const times = finishTimes(result, [
      { segment: "start", lap: 1, progress: 0, order: ["leader", "last"], times: { leader: 0, last: 0 }, gaps: { leader: 0, last: 0 } },
      { segment: "finish", lap: 5, progress: 1, order: ["leader", "last"], times: { leader: 100, last: 104 }, gaps: { leader: 0, last: 4 } }
    ]);

    expect(times).toEqual({ leader: 100, last: 104, times: { leader: 100, last: 104 } });
    expect(carProgressAtRaceTime(result, times.times, 100, 5)).toEqual({ leader: 5, last: 100 / 104 * 5 });
    expect(carProgressAtRaceTime(result, times.times, 104, 5)).toEqual({ leader: 5, last: 5 });
  });
});
