import { describe, expect, it } from "vitest";
import { trackZonesForCircuit, type RaceEvent, type RaceResult, type ReplayTracePoint } from "@cr-league/shared";
import {
  carProgressAtRaceTime,
  carProgressAtTrace,
  applyTrackSpeedProfile,
  buildReplayPlan,
  buildQualifyingMomentEvents,
  buildRaceDirectorBeats,
  directorBeatCopy,
  displayLapAtProgress,
  eventTraceProgress,
  finishTimes,
  isCanonicalReplayTrace,
  liveClassificationByCarProgress,
  playerReplayContext,
  replayPlayerGapItems,
  pitStopRaceProgress,
  pitStopTraceProgress,
  positionDeltas,
  replayOrderAtProgress,
  replayDistanceScale,
  replayPlanDebugLines,
  replayProgressForVisualTrackProgress,
  scaleFinishTimes,
  segmentAtProgress,
  shouldSmoothReplayTrace,
  smoothCarProgress,
  traceGapsAt,
  traceTimesAt
} from "./ReplayView.js";
import { t } from "../i18n/index.js";

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
const tt = ((key, params) => t(key, "en", params)) as import("../app/helpers.js").Translator;

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

  it("interpolates live tower gaps so rows can compare to the car ahead", () => {
    const trace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0, order: ["leader", "mid", "last"], times: { leader: 0, mid: 0, last: 0 }, gaps: { leader: 0, mid: 0, last: 0 } },
      { segment: "mid", lap: 3, progress: 0.5, order: ["leader", "mid", "last"], times: { leader: 50, mid: 52, last: 55 }, gaps: { leader: 0, mid: 2, last: 5 } }
    ];
    const times = traceTimesAt(trace, 0.25);
    const gaps = traceGapsAt(trace, 0.25);

    expect(times.leader).toBe(25);
    expect((gaps.last ?? 0) - (gaps.mid ?? 0)).toBe(1.5);
  });

  it("scales visual replay time with race distance", () => {
    const shortCircuit = { ...testCircuit(1, [{ lat: 0, lng: 0 }, { lat: 0, lng: 0.001 }]), routeLengthMeters: 1_000 };
    const longCircuit = { ...testCircuit(1, [{ lat: 0, lng: 0 }, { lat: 0, lng: 0.002 }]), routeLengthMeters: 2_000 };
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

  it("sorts generated car traces directly from track position", () => {
    const trace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0, order: ["leader", "last"], times: {}, gaps: {}, cars: { leader: { trackProgress: 0, speed: 0, phase: "grid" }, last: { trackProgress: 0, speed: 0, phase: "grid" } } },
      { segment: "early", lap: 2, progress: 0.2, order: ["leader", "last"], times: {}, gaps: {}, cars: { leader: { trackProgress: 0.2, speed: 1, phase: "racing" }, last: { trackProgress: 0.202, speed: 1, phase: "racing" } } }
    ];

    expect(liveClassificationByCarProgress(result, trace, 0.2, { leader: 1, last: 1.002 }, ["leader", "last"]).map((entry) => entry.teamId)).toEqual([
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

  it("resets replay order from the trace when seeking or restarting", () => {
    const trace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0, order: ["leader", "last"], times: {}, gaps: {} },
      { segment: "mid", lap: 3, progress: 0.5, order: ["last", "leader"], times: {}, gaps: {} }
    ];

    expect(replayOrderAtProgress(result, trace, 0)).toEqual(["leader", "last"]);
    expect(replayOrderAtProgress(result, trace, 0.75)).toEqual(["last", "leader"]);
  });

  it("uses generated car trace positions when available", () => {
    const trace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0, order: ["leader", "last"], times: {}, gaps: {}, cars: { leader: { trackProgress: 0, speed: 0, phase: "grid" }, last: { trackProgress: 0, speed: 0, phase: "grid" } } },
      {
        segment: "mid",
        lap: 3,
        progress: 0.5,
        order: ["leader", "last"],
        times: {},
        gaps: { leader: 0, last: 99 },
        cars: { leader: { trackProgress: 0.5, speed: 1, phase: "racing" }, last: { trackProgress: 0.42, speed: 0, phase: "pit_stop" } }
      }
    ];

    expect(carProgressAtTrace(result, trace, 0.5, 5)).toMatchObject({ leader: 2.5, last: 2.1 });
    expect(carProgressAtTrace(result, trace, 0, 5)).toMatchObject({ leader: 0, last: 0 });
  });

  it("uses generated queue positions during the start segment", () => {
    const trace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0, order: ["leader", "last"], times: {}, gaps: {}, cars: { leader: { trackProgress: 0, speed: 0, phase: "grid" }, last: { trackProgress: -0.02, speed: 0, phase: "grid" } } },
      { segment: "start", lap: 1, progress: 0.05, order: ["leader", "last"], times: {}, gaps: {}, cars: { leader: { trackProgress: 0.08, speed: 1, phase: "launch" }, last: { trackProgress: -0.01, speed: 0, phase: "grid" } } },
      { segment: "early", lap: 2, progress: 0.2, order: ["leader", "last"], times: {}, gaps: {}, cars: { leader: { trackProgress: 0.2, speed: 1, phase: "racing" }, last: { trackProgress: 0.18, speed: 1, phase: "racing" } } }
    ];

    expect(carProgressAtTrace(result, trace, 0, 5)).toMatchObject({ leader: 0, last: -0.02 });
    expect(carProgressAtTrace(result, trace, 0.05, 5)).toMatchObject({ leader: 0.4, last: -0.01 });
  });

  it("skips launch samples that copied a future position", () => {
    const car = (trackProgress: number) => ({ trackProgress, speed: 0.7, phase: "launch" as const });
    const trace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0.009, order: ["leader", "last"], times: {}, gaps: {}, cars: { leader: car(0.01), last: car(0.005) } },
      { segment: "start", lap: 1, progress: 0.01, order: ["leader", "last"], times: {}, gaps: {}, cars: { leader: car(0.02), last: car(0.01) } },
      { segment: "start", lap: 1, progress: 0.011, order: ["leader", "last"], times: {}, gaps: {}, cars: { leader: car(0.02), last: car(0.015) } },
      { segment: "start", lap: 1, progress: 0.012, order: ["leader", "last"], times: {}, gaps: {}, cars: { leader: car(0.03), last: car(0.02) } }
    ];

    expect(carProgressAtTrace(result, trace, 0.01, 5).leader).toBeCloseTo(0.0833, 3);
  });

  it("applies corner speed profiles as visual-only lap progress", () => {
    const speedProfile = [
      { kind: "braking" as const, startProgress: 0.2, endProgress: 0.3, factor: 0.7 },
      { kind: "corner" as const, startProgress: 0.3, endProgress: 0.4, factor: 0.6 },
      { kind: "straight" as const, startProgress: 0.7, endProgress: 0.9, factor: 1.1 }
    ];

    expect(applyTrackSpeedProfile(0.25, speedProfile)).toBeLessThan(0.25);
    expect(applyTrackSpeedProfile(0.8, speedProfile)).toBeLessThan(0.8);
    expect(applyTrackSpeedProfile(1, speedProfile)).toBe(1);
    expect(applyTrackSpeedProfile(1.25, speedProfile)).toBeCloseTo(1 + applyTrackSpeedProfile(0.25, speedProfile));
  });

  it("maps timeline track progress through the inverse corner speed profile", () => {
    const speedProfile = [{ kind: "corner" as const, startProgress: 0.2, endProgress: 0.6, factor: 0.5 }];
    const timelineProgress = replayProgressForVisualTrackProgress(0.08, 5, speedProfile);

    expect(timelineProgress).toBeGreaterThan(0.08);
    expect(applyTrackSpeedProfile(timelineProgress * 5, speedProfile) / 5).toBeCloseTo(0.08, 5);
  });

  it("does not double-apply corner speed profiles to generated car traces", () => {
    const speedProfile = [{ kind: "corner" as const, startProgress: 0.3, endProgress: 0.5, factor: 0.6 }];
    const trace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0, order: ["leader", "last"], times: {}, gaps: {}, cars: { leader: { trackProgress: 0, speed: 0, phase: "grid" }, last: { trackProgress: 0, speed: 0, phase: "grid" } } },
      {
        segment: "mid",
        lap: 3,
        progress: 0.5,
        order: ["leader", "last"],
        times: {},
        gaps: {},
        cars: { leader: { trackProgress: 0.38, speed: 1, phase: "racing" }, last: { trackProgress: 0.4, speed: 0, phase: "pit_stop" } }
      }
    ];

    const progress = carProgressAtTrace(result, trace, 0.5, 5, undefined, speedProfile);

    expect(progress.leader).toBe(1.9);
    expect(progress.last).toBe(2);
  });

  it("skips runtime smoothing for generated car traces", () => {
    expect(shouldSmoothReplayTrace([
      { segment: "start", lap: 1, progress: 0, order: ["leader"], times: {}, gaps: {}, cars: { leader: { trackProgress: 0, speed: 0, phase: "grid" } } },
      { segment: "finish", lap: 5, progress: 1, order: ["leader"], times: {}, gaps: {}, cars: { leader: { trackProgress: 1, speed: 0, phase: "finished" } } }
    ])).toBe(false);
    expect(shouldSmoothReplayTrace([{ segment: "start", lap: 1, progress: 0, order: ["leader"], times: {}, gaps: {} }])).toBe(true);
  });

  it("shows absolute pit slowdown even when every car stops together", () => {
    const trace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0, order: ["leader", "last"], times: { leader: 0, last: 0 }, gaps: { leader: 0, last: 0 } },
      { segment: "mid", lap: 5, progress: 0.48, order: ["leader", "last"], times: { leader: 48, last: 48 }, gaps: { leader: 0, last: 0 } },
      { segment: "mid", lap: 5, progress: 0.52, order: ["leader", "last"], times: { leader: 60, last: 60 }, gaps: { leader: 0, last: 0 } },
      { segment: "finish", lap: 10, progress: 1, order: ["leader", "last"], times: { leader: 100, last: 100 }, gaps: { leader: 0, last: 0 } }
    ];

    expect(carProgressAtTrace(result, trace, 0.52, 5).leader ?? 0).toBeLessThan(2.6);
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

  it("builds an inspectable staged replay plan from replay facts", () => {
    const resultWithFacts: RaceResult = {
      ...result,
      replayFacts: {
        version: 1,
        directorBeats: [],
        orderChanges: [
          { type: "order_change", segment: "early", lap: 2, progress: 0.2, trackProgress: 0.4, zoneKind: "overtake", zoneLabel: "main_straight", overtakingTeamId: "last", overtakenTeamId: "leader", fromPosition: 2, toPosition: 1, gapSeconds: 0 }
        ]
      }
    };
    const plan = buildReplayPlan(resultWithFacts, []);

    expect(plan.source).toBe("facts");
    expect(plan.overtakes[0]?.phases.map((phase) => phase.phase)).toEqual(["setup", "close_gap", "overlap", "swap", "settle"]);
    expect(replayPlanDebugLines(plan)[0]).toContain("@ main straight");
  });

  it("marks generated car traces separately from legacy replay fallbacks", () => {
    const generatedTrace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0, order: ["leader", "last"], times: {}, gaps: {}, cars: { leader: { trackProgress: 0, speed: 0, phase: "grid" }, last: { trackProgress: 0, speed: 0, phase: "grid" } } },
      { segment: "finish", lap: 5, progress: 1, order: ["leader", "last"], times: {}, gaps: {}, cars: { leader: { trackProgress: 1, speed: 0, phase: "finished" }, last: { trackProgress: 1, speed: 0, phase: "finished" } } }
    ];

    expect(isCanonicalReplayTrace(generatedTrace)).toBe(true);
    expect(buildReplayPlan(result, generatedTrace).source).toBe("trace");
    expect(buildReplayPlan(result, []).source).toBe("fallback");
  });

  it("reconstructs overtakes for canonical traces without replay facts", () => {
    const trace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0, order: ["leader", "last"], times: {}, gaps: { leader: 0, last: 0.8 }, cars: { leader: { trackProgress: 0.1, speed: 1, phase: "racing" }, last: { trackProgress: 0.09, speed: 1, phase: "racing" } } },
      { segment: "early", lap: 2, progress: 0.3, order: ["last", "leader"], times: {}, gaps: { leader: 0.4, last: 0 }, cars: { leader: { trackProgress: 0.29, speed: 1, phase: "racing" }, last: { trackProgress: 0.3, speed: 1, phase: "racing" } } }
    ];
    const plan = buildReplayPlan(result, trace);
    const beats = buildRaceDirectorBeats(result, trace, plan, 5, "last");

    expect(plan.overtakes).toHaveLength(1);
    expect(beats.map((beat) => beat.type)).toEqual(["grid_start", "player", "final"]);
  });

  it("falls back to only grid and final director beats when replay facts are missing", () => {
    const beats = buildRaceDirectorBeats(result, [], buildReplayPlan(result, []), 5, "last");

    expect(beats.map((beat) => beat.type)).toEqual(["grid_start", "final"]);
  });

  it("uses generated race-director beats when replay facts provide them", () => {
    const resultWithFacts: RaceResult = {
      ...result,
      replayFacts: {
        version: 1,
        orderChanges: [],
        directorBeats: [
          { id: "grid-start", type: "grid_start", progress: 0, lap: 1 },
          { id: "overtake-last-leader-0.333", type: "overtake", progress: 0.333, lap: 2, teamId: "last", relatedTeamId: "leader", fromPosition: 2, toPosition: 1 },
          { id: "final-pressure", type: "final", progress: 1, lap: 5, teamId: "last" }
        ]
      }
    };
    const beats = buildRaceDirectorBeats(resultWithFacts, [], buildReplayPlan(resultWithFacts, []), 3, "last");

    expect(beats.map((beat) => beat.id)).toEqual(["grid-start", "overtake-last-leader-0.333", "final-pressure"]);
    expect(beats.map((beat) => beat.lap)).toEqual([1, 2, 3]);
    expect(beats[1]?.type).toBe("player");
  });

  it("explains the strategic meaning of race-director beats", () => {
    const copy = directorBeatCopy(
      { id: "move", type: "player", progress: 0.4, lap: 3, teamId: "last", relatedTeamId: "leader", fromPosition: 2, toPosition: 1 },
      new Map([["last", "Last"], ["leader", "Leader"]]),
      (key, params) => t(key, "en", params)
    );

    expect(copy.detail).toContain("payoff window");
    expect(copy.detail).toContain("risky approach");
  });

  it("adds canonical zone labels to race-director copy when available", () => {
    const copy = directorBeatCopy(
      { id: "pit", type: "pit_stop", progress: 0.4, lap: 3, teamId: "leader", zoneLabel: "pit_lane" },
      new Map([["leader", "Leader"]]),
      (key, params) => t(key, "en", params)
    );

    expect(copy.zone).toContain("pit lane");
  });

  it("explains main straight overtakes as a separate race-director zone line", () => {
    const copy = directorBeatCopy(
      { id: "move", type: "overtake", progress: 0.4, lap: 3, teamId: "last", relatedTeamId: "leader", fromPosition: 2, toPosition: 1, zoneLabel: "main_straight" },
      new Map([["last", "Last"], ["leader", "Leader"]]),
      (key, params) => t(key, "en", params)
    );

    expect(copy.detail).toContain("Last attacks Leader");
    expect(copy.zone).toContain("main straight");
    expect(copy.zone).toContain("slipstream");
  });

  it("shows pit stops as race-director beats", () => {
    const resultWithPit: RaceResult = {
      ...result,
      replayFacts: {
        version: 1,
        orderChanges: [],
        directorBeats: [{ id: "pit-leader-1", type: "pit_stop", progress: 0.45, lap: 5, teamId: "leader" }]
      },
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
      [],
      buildReplayPlan(resultWithPit, []),
      10,
      "leader"
    );

    expect(beats.find((beat) => beat.type === "pit_stop")?.progress).toBeCloseTo(0.45);
    expect(pitStopRaceProgress(resultWithPit.events[0]!, 10, 5, 0.25)).toBeCloseTo(0.45);
  });

  it("uses event trace progress before the lap/pit fallback for pit stops", () => {
    const trace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0, order: ["leader", "last"], times: { leader: 0, last: 0 }, gaps: { leader: 0, last: 0 } },
      { segment: "mid", lap: 5, progress: 0.45, order: ["leader", "last"], times: { leader: 45, last: 46 }, gaps: { leader: 0, last: 1 } },
      { segment: "finish", lap: 10, progress: 1, order: ["leader", "last"], times: { leader: 100, last: 104 }, gaps: { leader: 0, last: 4 } }
    ];
    const leader = resultWithEvent("leader", 1);
    const last = resultWithEvent("last", 2);

    expect(pitStopTraceProgress(result, trace, { ...leader, traceProgress: 0.37 }, 10, 5, 0.25)).toBe(0.37);
    expect(pitStopTraceProgress(result, trace, leader, 10, 5, 0.25)).toBeCloseTo(0.45);
    expect(pitStopTraceProgress(result, trace, last, 10, 5, 0.25)).toBeCloseTo(0.45);
  });

  it("uses event trace progress before lap fallback", () => {
    expect(eventTraceProgress({ ...resultWithEvent("leader", 1), traceProgress: 0.37 }, 10)).toBe(0.37);
    expect(eventTraceProgress(resultWithEvent("leader", 1), 10)).toBe(0.5);
  });

  it("uses chrono-specific director beats for qualifying replays", () => {
    const trace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0, order: ["leader"], times: { leader: 0 }, gaps: { leader: 0 } },
      { segment: "finish", lap: 3, progress: 1, order: ["leader"], times: { leader: 30 }, gaps: { leader: 0 } }
    ];
    const beats = buildRaceDirectorBeats(result, trace, buildReplayPlan(result, trace), 3, "leader", "qualifying");

    expect(beats.map((beat) => beat.type)).toEqual(["qualifying_start", "qualifying_pace", "qualifying_final"]);
  });

  it("turns qualifying director beats into replay moment toasts", () => {
    const beats = buildRaceDirectorBeats(result, [], buildReplayPlan(result, []), 3, "leader", "qualifying");
    const moments = buildQualifyingMomentEvents(beats, result);

    expect(moments.map((moment) => moment.tags[1])).toEqual(["qualifying_start", "qualifying_pace", "qualifying_final"]);
    expect(moments.map((moment) => moment.traceProgress)).toEqual([0, 0.5, 1]);
    expect(moments.every((moment) => moment.type === "race_note" && moment.tags.includes("mini_info"))).toBe(true);
  });

  it("exposes player replay context with position trend and nearby gaps", () => {
    const trace: ReplayTracePoint[] = [
      { segment: "start", lap: 1, progress: 0, order: ["leader", "last"], times: { leader: 0, last: 0 }, gaps: { leader: 0, last: 0 } },
      { segment: "mid", lap: 3, progress: 0.5, order: ["last", "leader"], times: { leader: 50, last: 49 }, gaps: { leader: 1, last: 0 } }
    ];

    expect(playerReplayContext(result, trace, 0.5, "last")).toMatchObject({ position: 1, delta: 1, gapBehind: 1 });
    expect(playerReplayContext(result, trace, 0.5, undefined)).toBe(null);
  });

  it("calculates adjacent gaps from the visible replay order", () => {
    const trace: ReplayTracePoint[] = [
      { segment: "mid", lap: 3, progress: 0.5, order: ["leader", "mid", "last"], times: {}, gaps: { leader: 0, mid: 2, last: 3 } }
    ];

    expect(playerReplayContext(result, trace, 0.5, "last", ["leader", "last", "mid"])).toMatchObject({
      gapAhead: 3,
      gapBehind: 1,
      aheadId: "leader",
      behindId: "mid"
    });
  });

  it("formats only available player replay gaps", () => {
    expect(replayPlayerGapItems({ gapBehind: 0.9 }, tt)).toEqual([{ label: "Behind", value: "0.9s" }]);
    expect(replayPlayerGapItems({ gapAhead: 1.2, gapBehind: 0.9 }, tt)).toEqual([
      { label: "Ahead", value: "1.2s" },
      { label: "Behind", value: "0.9s" }
    ]);
    expect(replayPlayerGapItems(null, tt)).toEqual([]);
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
    expect(smoothCarProgress({ leader: 1 }, { leader: 0.99 }, 1).leader).toBeCloseTo(0.99);
  });
});

function testCircuit(laps: number, route: Array<{ lat: number; lng: number }>) {
  const circuit = {
    city: "Test",
    country: "TT",
    layoutKey: "city_circuit_map",
    laps,
    trackLengthMeters: 3200,
    routeLengthMeters: Math.round((route.at(-1)?.lng ?? 0) * 111_320),
    mainStraightStartProgress: 0,
    mainStraightEndProgress: 1,
    startProgress: 0,
    pitLaneProgress: 0.5,
    traits: { grip: 1, overtaking: 1, energy: 1 },
    likelyWeather: "dry",
    route
  } as const;
  return { ...circuit, speedProfile: [], trackZones: trackZonesForCircuit(circuit) };
}

function resultWithEvent(teamId: string, order: number): RaceEvent {
  return {
    id: `pit-${teamId}`,
    order,
    segment: "mid",
    lap: 5,
    type: "pit_stop",
    teamId,
    severity: "minor",
    positionDelta: 0,
    tags: ["pit_stop", "standard"],
    replayText: "",
    reportText: ""
  };
}
