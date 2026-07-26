import { describe, expect, it } from "vitest";
import { DEMO_RACE_INPUT } from "./demoRace.js";
import { simulateRace } from "./simulateRace.js";
import type { RaceResult, ReplayTracePoint } from "../domain/race.js";
import { positionDeltas, replayOrderAtProgress, traceGapsAt, traceTimesAt } from "./replayState.js";

const result: RaceResult = {
  grandPrixName: "Replay State GP",
  seed: "replay-state",
  resolvedWeather: { start: "dry", early: "dry", mid: "dry", late: "dry", finish: "dry" },
  classification: [
    { position: 1, teamId: "leader", teamName: "Leader", points: 25, credits: 100, score: 100, positionChange: 0, status: "finished", resultTags: [] },
    { position: 2, teamId: "mid", teamName: "Mid", points: 18, credits: 80, score: 90, positionChange: 0, status: "finished", resultTags: [] },
    { position: 3, teamId: "last", teamName: "Last", points: 15, credits: 60, score: 80, positionChange: 0, status: "finished", resultTags: [] }
  ],
  events: [],
  consumedCards: [],
  report: { headline: "Replay State", blocks: [] }
};

describe("replayState", () => {
  it("interpolates trace times and gaps from the same sampled point lookup", () => {
    const trace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0, order: ["leader", "mid", "last"], times: { leader: 0, mid: 0, last: 0 }, gaps: { leader: 0, mid: 0, last: 0 } },
      { segment: "mid", lap: 3, progress: 0.5, order: ["leader", "mid", "last"], times: { leader: 50, mid: 52, last: 55 }, gaps: { leader: 0, mid: 2, last: 5 } }
    ];

    expect(replayOrderAtProgress(result, trace, 0.25)).toEqual(["leader", "mid", "last"]);
    expect(traceTimesAt(trace, 0.25).leader).toBe(25);
    expect((traceGapsAt(trace, 0.25).last ?? 0) - (traceGapsAt(trace, 0.25).mid ?? 0)).toBe(1.5);
  });

  it("falls back to final classification order when a trace has no order", () => {
    expect(replayOrderAtProgress(result, [], 0.4)).toEqual(["leader", "mid", "last"]);
  });

  it("reports position gains as positive deltas", () => {
    expect(positionDeltas(["leader", "last"], ["last", "leader"])).toEqual({ last: 1, leader: -1 });
  });

  it("pins a fixed-seed generated trace through the shared replay derivation", () => {
    const generated = simulateRace(DEMO_RACE_INPUT);
    const trace = generated.replayTrace ?? [];

    expect(replayOrderAtProgress(generated, trace, 0.5)).toEqual(["redpeak", "mika", "volt", "hugo", "northline", "atlas"]);
    expect(traceTimesAt(trace, 0.5)).toEqual({
      atlas: 66.3,
      hugo: 66.3,
      mika: 66.3,
      northline: 66.3,
      redpeak: 66.3,
      volt: 66.3
    });
    expect(traceGapsAt(trace, 0.5)).toEqual({
      atlas: 12.6,
      hugo: 7.6,
      mika: 1,
      northline: 8.5,
      redpeak: 0,
      volt: 2.6
    });
  });
});
