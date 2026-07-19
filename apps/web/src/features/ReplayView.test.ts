import { describe, expect, it } from "vitest";
import type { RaceEvent, RaceResult, ReplayTracePoint } from "@cr-league/shared";
import {
  carProgressAtRaceTime,
  carProgressAtTrace,
  applyGridStart,
  buildReplayPlan,
  buildRaceDirectorBeats,
  displayLapAtProgress,
  finishTimes,
  gridStartCarProgress,
  liveClassificationByCarProgress,
  playerReplayContext,
  pitStopRaceProgress,
  pitStopReplayProgress,
  pitStopTimeOffset,
  pitStopVisualProgress,
  positionDeltas,
  replayPlanDebugLines,
  replayDistanceScale,
  scaleFinishTimes,
  segmentAtProgress,
  smoothCarProgress
} from "./ReplayView.js";

const result: RaceResult = {
  grandPrixName: "Test GP",
  seed: "seed",
  resolvedWeather: { start: "dry", early: "dry", mid: "dry", late: "dry", finish: "dry" },
  classification: [
    { position: 1, teamId: "leader", teamName: "Leader", points: 25, credits: 150, score: 280, positionChange: 0, status: "finished", resultTags: [] },
    { position: 2, teamId: "last", teamName: "Last", points: 18, credits: 100, score: 260, positionChange: 0, status: "finished", resultTags: [] }
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

  it("uses the same segment timing for live weather and replay weather markers", () => {
    expect([0, 0.19, 0.2, 0.39, 0.4, 0.59, 0.6, 0.79, 0.8, 1].map(segmentAtProgress)).toEqual([
      "start",
      "start",
      "early",
      "early",
      "mid",
      "mid",
      "late",
      "late",
      "finish",
      "finish"
    ]);
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

  it("scales visual replay time with race distance", () => {
    const shortCircuit = testCircuit(1, [{ lat: 0, lng: 0 }, { lat: 0, lng: 0.001 }]);
    const longCircuit = testCircuit(1, [{ lat: 0, lng: 0 }, { lat: 0, lng: 0.002 }]);
    const times = { leader: 10, last: 12, times: { leader: 10, last: 12 } };

    expect(replayDistanceScale(longCircuit) / replayDistanceScale(shortCircuit)).toBeCloseTo(2);
    expect(scaleFinishTimes(times, 2)).toEqual({ leader: 20, last: 24, times: { leader: 20, last: 24 } });
  });

  it("reports position gains as positive deltas", () => {
    expect(positionDeltas(["leader", "last"], ["last", "leader"])).toEqual({ last: 1, leader: -1 });
  });

  it("keeps close visual positions in stable order before swapping", () => {
    const trace: ReplayTracePoint[] = [{ segment: "start", lap: 1, progress: 0, order: ["leader", "last"], times: {}, gaps: {} }];

    expect(liveClassificationByCarProgress(result, trace, 0.5, { leader: 1, last: 1.01 }, ["leader", "last"]).map((entry) => entry.teamId)).toEqual([
      "leader",
      "last"
    ]);
    expect(liveClassificationByCarProgress(result, trace, 0.5, { leader: 1, last: 1.03 }, ["leader", "last"]).map((entry) => entry.teamId)).toEqual([
      "last",
      "leader"
    ]);
  });

  it("uses replay trace gaps before finish instead of final pace", () => {
    const trace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0, order: ["last", "leader"], times: { leader: 0, last: 0 }, gaps: { leader: 0, last: 0 } },
      { segment: "mid", lap: 3, progress: 0.5, order: ["last", "leader"], times: { leader: 50, last: 40 }, gaps: { leader: 10, last: 0 } },
      { segment: "finish", lap: 5, progress: 1, order: ["leader", "last"], times: { leader: 100, last: 104 }, gaps: { leader: 0, last: 4 } }
    ];
    const progress = carProgressAtTrace(result, trace, 0.5, 5);

    expect(progress.last ?? 0).toBeGreaterThan(progress.leader ?? 0);
    expect(liveClassificationByCarProgress(result, trace, 0.5, progress, ["last", "leader"]).map((entry) => entry.teamId)).toEqual(["last", "leader"]);
  });

  it("uses trace order as a visual spacing target", () => {
    const trace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0, order: ["leader", "last"], times: { leader: 0, last: 0 }, gaps: { leader: 0, last: 0 } },
      { segment: "start", lap: 1, progress: 0.2, order: ["leader", "last"], times: { leader: 10, last: 10 }, gaps: { leader: 0, last: 0 } }
    ];
    const progress = carProgressAtTrace(result, trace, 0.2, 5);

    expect(progress.leader ?? 0).toBeGreaterThan(progress.last ?? 0);
    expect(liveClassificationByCarProgress(result, trace, 0.2, progress, ["leader", "last"]).map((entry) => entry.teamId)).toEqual(["leader", "last"]);
  });

  it("eases visual positions toward upcoming trace order changes", () => {
    const trace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0, order: ["leader", "last"], times: { leader: 0, last: 0 }, gaps: { leader: 0, last: 0 } },
      { segment: "early", lap: 2, progress: 0.2, order: ["last", "leader"], times: { leader: 10, last: 10 }, gaps: { leader: 0, last: 0 } }
    ];
    const before = carProgressAtTrace(result, trace, 0.05, 5);
    const after = carProgressAtTrace(result, trace, 0.15, 5);

    expect(before.leader ?? 0).toBeGreaterThan(before.last ?? 0);
    expect(after.last ?? 0).toBeGreaterThan(after.leader ?? 0);
  });

  it("builds an inspectable staged replay plan from trace order changes", () => {
    const trace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0, order: ["leader", "last"], times: { leader: 0, last: 0 }, gaps: { leader: 0, last: 0 } },
      { segment: "early", lap: 2, progress: 0.2, order: ["last", "leader"], times: { leader: 10, last: 10 }, gaps: { leader: 0, last: 0 } }
    ];
    const plan = buildReplayPlan(result, trace);

    expect(plan.source).toBe("trace");
    expect(plan.overtakes[0]?.phases.map((phase) => phase.phase)).toEqual(["setup", "close_gap", "overlap", "swap", "settle"]);
    expect(replayPlanDebugLines(plan)[0]).toContain("last->leader");
  });

  it("applies a deterministic readable grid start without changing final order", () => {
    const trace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0, order: ["leader", "last"], times: { leader: 0, last: 0 }, gaps: { leader: 0, last: 0 } },
      { segment: "finish", lap: 5, progress: 1, order: ["leader", "last"], times: { leader: 100, last: 104 }, gaps: { leader: 0, last: 4 } }
    ];

    expect(gridStartCarProgress(result, trace, 0).leader ?? 0).toBeGreaterThan(gridStartCarProgress(result, trace, 0).last ?? 0);
    expect(applyGridStart(result, trace, { leader: 0, last: 0 }, 0).leader ?? 0).toBeLessThan(0);
    expect(applyGridStart(result, trace, { leader: 0, last: 0 }, 0).last ?? 0).toBeLessThan(applyGridStart(result, trace, { leader: 0, last: 0 }, 0).leader ?? 0);
    expect(applyGridStart(result, trace, { leader: 5, last: 5 }, 1)).toEqual({ leader: 5, last: 5 });
  });

  it("generates deterministic race-director beats from replay facts and quiet trace", () => {
    const trace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0, order: ["leader", "last"], times: { leader: 0, last: 0 }, gaps: { leader: 0, last: 0 } },
      { segment: "mid", lap: 3, progress: 0.5, order: ["last", "leader"], times: { leader: 50, last: 49 }, gaps: { leader: 1, last: 0 } },
      { segment: "finish", lap: 5, progress: 1, order: ["leader", "last"], times: { leader: 100, last: 104 }, gaps: { leader: 0, last: 4 } }
    ];
    const plan = buildReplayPlan(result, trace);
    const beats = buildRaceDirectorBeats(result, trace, plan, 5, "last");

    expect(beats.map((beat) => beat.type)).toContain("grid_start");
    expect(beats.map((beat) => beat.type)).toContain("player");
    expect(beats.map((beat) => beat.type)).toContain("pack");
    expect(beats.at(-1)?.type).toBe("final");
  });

  it("shows pit stops as race-director beats", () => {
    const trace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0, order: ["leader", "last"], times: { leader: 0, last: 0 }, gaps: { leader: 0, last: 0 } },
      { segment: "finish", lap: 10, progress: 1, order: ["leader", "last"], times: { leader: 100, last: 104 }, gaps: { leader: 0, last: 4 } }
    ];
    const resultWithPit: RaceResult = {
      ...result,
      events: [
        {
          id: "pit",
          order: 1,
          segment: "mid",
          lap: 5,
          type: "pit_stop",
          teamId: "leader",
          severity: "minor",
          positionDelta: 0,
          tags: ["pit_stop", "standard"],
          replayText: "Leader swaps battery pack in the pit",
          reportText: "Leader lost time on a battery swap."
        },
        {
          id: "finish",
          order: 2,
          segment: "finish",
          lap: 10,
          type: "finish",
          teamId: "leader",
          severity: "minor",
          positionDelta: 0,
          tags: ["finish"],
          replayText: "Leader finishes the race",
          reportText: "Leader finishes the race."
        }
      ]
    };
    const beats = buildRaceDirectorBeats(
      resultWithPit,
      trace,
      buildReplayPlan(result, trace),
      10,
      "leader"
    );

    expect(beats.find((beat) => beat.type === "pit_stop")?.progress).toBeCloseTo(0.45);
    expect(pitStopRaceProgress(resultWithPit.events[0]!, 10, 5, 0.25)).toBeCloseTo(0.45);
  });

  it("eases pit stop entry, hold, and exit without teleporting", () => {
    expect(pitStopVisualProgress(2.1, 9.4, 10, 2.25)).toBeCloseTo(2.1);
    expect(pitStopVisualProgress(2.16, 9.7, 10, 2.25)).toBeGreaterThan(2.16);
    expect(pitStopVisualProgress(2.4, 10.6, 10, 2.25)).toBe(2.25);
    expect(pitStopVisualProgress(2.6, 11.6, 10, 2.25)).toBeGreaterThan(2.25);
    expect(pitStopVisualProgress(2.7, 12.1, 10, 2.25)).toBe(2.7);
    expect(pitStopVisualProgress(3.2, 11.6, 10, 2.25, 0, 0.4)).toBeLessThan(2.8);
    expect(pitStopVisualProgress(3.2, 12.1, 10, 2.25, 0, 0.4)).toBeCloseTo(2.8);
    expect(pitStopVisualProgress(2.5, 10.2, 10, 2.25, 2)).toBeLessThan(2.5);
    expect(pitStopVisualProgress(2.5, 12.1, 10, 2.25, 2)).toBe(2.25);
  });

  it("stagger pit stops by race order instead of stacking cars", () => {
    const trace: ReplayTracePoint[] = [{ segment: "mid", lap: 5, progress: 0.45, order: ["leader", "last"], times: { leader: 45, last: 46 }, gaps: { leader: 0, last: 1 } }];
    const leader: RaceEvent = { id: "pit-a", order: 1, segment: "mid", lap: 5, type: "pit_stop", teamId: "leader", severity: "minor", positionDelta: 0, tags: [], replayText: "", reportText: "" };
    const last: RaceEvent = { ...leader, id: "pit-b", order: 2, teamId: "last" };

    expect(pitStopTimeOffset(last, trace, 0.45)).toBeGreaterThan(pitStopTimeOffset(leader, trace, 0.45));
    expect(pitStopReplayProgress(last, 10, 5, 0.25, trace, 100)).toBeGreaterThan(pitStopReplayProgress(leader, 10, 5, 0.25, trace, 100));
  });

  it("uses chrono-specific director beats for qualifying replays", () => {
    const trace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0, order: ["leader"], times: { leader: 0 }, gaps: { leader: 0 } },
      { segment: "finish", lap: 3, progress: 1, order: ["leader"], times: { leader: 30 }, gaps: { leader: 0 } }
    ];
    const beats = buildRaceDirectorBeats(result, trace, buildReplayPlan(result, trace), 3, "leader", "qualifying");

    expect(beats.map((beat) => beat.type)).toEqual(["qualifying_start", "qualifying_pace", "qualifying_final"]);
  });

  it("exposes player replay context with position trend and nearby gaps", () => {
    const trace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0, order: ["leader", "last"], times: { leader: 0, last: 0 }, gaps: { leader: 0, last: 0 } },
      { segment: "mid", lap: 3, progress: 0.5, order: ["last", "leader"], times: { leader: 50, last: 49 }, gaps: { leader: 1, last: 0 } }
    ];

    expect(playerReplayContext(result, trace, 0.5, "last")).toMatchObject({ position: 1, delta: 1, gapBehind: 1 });
    expect(playerReplayContext(result, trace, 0.5, undefined)).toBe(null);
  });

  it("keeps dense trace overtakes on a minimum visual transition", () => {
    const trace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0, order: ["leader", "last"], times: { leader: 0, last: 0 }, gaps: { leader: 0, last: 0 } },
      { segment: "start", lap: 1, progress: 0.02, order: ["last", "leader"], times: { leader: 1, last: 1 }, gaps: { leader: 0, last: 0 } },
      { segment: "early", lap: 2, progress: 0.2, order: ["last", "leader"], times: { leader: 10, last: 10 }, gaps: { leader: 0, last: 0 } }
    ];
    const early = carProgressAtTrace(result, trace, 0.02, 5);
    const later = carProgressAtTrace(result, trace, 0.08, 5);

    expect(early.leader ?? 0).toBeGreaterThan(early.last ?? 0);
    expect(later.last ?? 0).toBeGreaterThan(later.leader ?? 0);
  });

  it("limits visual progress jumps between frames", () => {
    expect(smoothCarProgress({ leader: 1 }, { leader: 1.5 }).leader).toBeCloseTo(1.006);
    expect(smoothCarProgress({ leader: 1 }, { leader: 1.5 }, 1).leader).toBeCloseTo(1.03);
    expect(smoothCarProgress({ leader: 1 }, { leader: 1.006 }).leader).toBeCloseTo(1.006);
  });
});

function testCircuit(laps: number, route: Array<{ lat: number; lng: number }>) {
  return {
    city: "Test",
    country: "TT",
    layoutKey: "city_circuit_map",
    laps,
    traits: { grip: 1, overtaking: 1, energy: 1 },
    likelyWeather: "dry",
    route
  } as const;
}
