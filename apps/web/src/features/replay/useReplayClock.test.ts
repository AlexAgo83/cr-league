import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { REPLAY_SPEED_KEY } from "./replayMath.js";
import { useReplayClock, type ReplayClockSnapshot } from "./useReplayClock.js";

const initialSnapshot: ReplayClockSnapshot = {
  carProgress: { team: 0 },
  tower: [{ position: 1, teamId: "team", teamName: "Team", points: 0, credits: 0, score: 1, positionChange: 0, status: "finished", resultTags: [] }]
};

function renderClock(preferencesResetSignal = 0) {
  return renderHook(() => useReplayClock({
    initialSnapshot,
    initialOrder: ["team"],
    replayEnd: 10,
    raceDuration: 8,
    laps: 1,
    smoothTracePositions: false,
    resultSeed: "seed",
    titleKey: "result_replay_title",
    preferencesResetSignal,
    startHoldSeconds: 1,
    getActiveMomentId: () => null,
    getOrderAtProgress: () => ["team"],
    createTargetSnapshot: () => initialSnapshot,
    createTower: () => initialSnapshot.tower,
    smoothCarProgress: () => initialSnapshot.carProgress,
    displayLapAtProgress: () => 1,
    segmentAtProgress: () => "start"
  }));
}

describe("useReplayClock replay speed preferences", () => {
  beforeEach(() => localStorage.clear());

  it("loads and saves the shared replay speed preference", () => {
    localStorage.setItem(REPLAY_SPEED_KEY, "4");
    const { result } = renderClock();

    expect(result.current.speed).toBe(4);

    act(() => result.current.setSpeed(2));

    expect(result.current.speed).toBe(2);
    expect(localStorage.getItem(REPLAY_SPEED_KEY)).toBe("2");
  });

  it("falls back to x1 for removed or invalid saved speeds", () => {
    localStorage.setItem(REPLAY_SPEED_KEY, "0.5");

    expect(renderClock().result.current.speed).toBe(1);
  });
});
