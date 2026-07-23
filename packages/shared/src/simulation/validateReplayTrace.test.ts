import { describe, expect, it } from "vitest";
import type { RaceResult, ReplayTracePoint } from "../domain/race.js";
import { validateReplayTrace } from "./validateReplayTrace.js";

const classification = [
  { position: 1, teamId: "alpha", teamName: "Alpha", points: 25, credits: 40, score: 100, positionChange: 0, status: "finished", resultTags: [] },
  { position: 2, teamId: "beta", teamName: "Beta", points: 18, credits: 30, score: 90, positionChange: 0, status: "finished", resultTags: [] }
] satisfies RaceResult["classification"];

function point(progress: number, order = ["alpha", "beta"]): ReplayTracePoint {
  return {
    segment: progress === 1 ? "finish" : "mid",
    lap: Math.max(1, Math.round(progress * 10)),
    progress,
    distanceMeters: progress * 5000,
    order,
    times: { alpha: progress * 60, beta: progress * 60 + 1 },
    gaps: { alpha: 0, beta: 1 },
    cars: {
      alpha: { trackProgress: progress, distanceMeters: progress * 5000, speed: 0.8, phase: progress === 1 ? "finished" : "racing" },
      beta: { trackProgress: progress - 0.01, distanceMeters: progress * 5000 - 50, speed: 0.78, phase: progress === 1 ? "finished" : "racing" }
    }
  };
}

function result(overrides: Partial<RaceResult> = {}): RaceResult {
  return {
    grandPrixName: "Test GP",
    seed: "validator-negative",
    resolvedWeather: { start: "dry", early: "dry", mid: "dry", late: "dry", finish: "dry" },
    classification,
    events: [],
    replayTrace: [point(0), point(0.02), point(1)],
    consumedCards: [],
    report: { headline: "Test", blocks: [] },
    ...overrides
  };
}

describe("validateReplayTrace", () => {
  it("reports backwards trace progress", () => {
    expect(validateReplayTrace(result({ replayTrace: [point(0), point(0.5), point(0.4), point(1)] }))).toContain("trace progress must increase at point 2");
  });

  it("reports oversized car progress jumps", () => {
    expect(validateReplayTrace(result({ replayTrace: [point(0), point(0.06), point(1)] }))).toContain("car progress jumps too far for alpha at point 1");
  });

  it("reports abrupt car speed changes", () => {
    const previous = point(0.01);
    previous.cars!.alpha!.speed = 0.1;
    const abrupt = point(0.02);
    abrupt.cars!.alpha!.speed = 1.2;

    expect(validateReplayTrace(result({ replayTrace: [point(0), previous, abrupt, point(1)] }))).toContain("car speed changes too abruptly for alpha at point 2");
  });

  it("reports backwards car progress separately from trace progress", () => {
    const previous = point(0.03);
    const backwards = point(0.04);
    backwards.cars!.alpha!.trackProgress = 0.02;
    backwards.cars!.alpha!.distanceMeters = 100;

    expect(validateReplayTrace(result({ replayTrace: [point(0), previous, backwards, point(1)] }))).toContain("car progress goes backwards for alpha at point 2");
  });

  it("reports missing pit phases for pit events", () => {
    const pitEvent: RaceResult["events"][number] = {
      id: "pit-1",
      order: 1,
      segment: "mid",
      lap: 5,
      traceProgress: 0.5,
      type: "pit_stop",
      teamId: "alpha",
      severity: "minor",
      positionDelta: 0,
      tags: [],
      replayText: "Pit stop",
      reportText: "Pit stop"
    };

    expect(validateReplayTrace(result({ events: [pitEvent] }))).toContain("pit phases missing or out of order for alpha");
  });

  it("reports wrong final order", () => {
    expect(validateReplayTrace(result({ replayTrace: [point(0), point(0.02), point(1, ["beta", "alpha"])] }))).toContain("final trace order must match classification");
  });

  it("reports out-of-range car distance", () => {
    const corrupted = point(0.02);
    corrupted.cars!.alpha!.distanceMeters = -1;

    expect(validateReplayTrace(result({ replayTrace: [point(0), corrupted, point(1)] }))).toContain("car distance out of bounds for alpha at point 1");
  });

  it("reports missing overtake phases for non-pit order changes", () => {
    expect(
      validateReplayTrace(
        result({
          replayFacts: {
            version: 1,
            orderChanges: [
              {
                type: "order_change",
                segment: "mid",
                lap: 1,
                progress: 0.02,
                overtakingTeamId: "beta",
                overtakenTeamId: "alpha",
                fromPosition: 2,
                toPosition: 1,
                gapSeconds: 0.1
              }
            ]
          }
        })
      )
    ).toContain("overtake phases missing near beta at 0.02");
  });

  it("reports order change facts that do not match adjacent trace order", () => {
    const mismatch = result({
      replayFacts: {
        version: 1,
        orderChanges: [
          {
            type: "order_change",
            segment: "mid",
            lap: 1,
            progress: 0.02,
            overtakingTeamId: "alpha",
            overtakenTeamId: "beta",
            fromPosition: 2,
            toPosition: 1,
            gapSeconds: 0.1
          }
        ]
      }
    });

    expect(validateReplayTrace(mismatch)).toContain("order change fact does not match trace order at 0.02");
  });

  it("reports defense markers without nearby traffic", () => {
    const defended = point(0.02);
    defended.cars!.alpha!.phase = "defending";
    defended.cars!.alpha!.trackProgress = 0.05;
    defended.cars!.beta!.trackProgress = 0;

    expect(validateReplayTrace(result({ replayTrace: [point(0), defended, point(1)] }))).toContain("defense marker lacks nearby traffic for alpha at point 1");
  });
});
