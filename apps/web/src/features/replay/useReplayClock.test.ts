import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { REPLAY_SPEED_KEY } from "./replayMath.js";
import { REPLAY_STATE_UPDATE_SECONDS, replayFrameCarProgress, shouldPublishReplayState, useReplayClock, type ReplayClockSnapshot } from "./useReplayClock.js";

const initialSnapshot: ReplayClockSnapshot = {
  carProgress: { team: 0 },
  tower: [{ position: 1, teamId: "team", teamName: "Team", points: 0, credits: 0, score: 1, positionChange: 0, status: "finished", resultTags: [] }]
};

function renderClock(preferencesResetSignal = 0, createTargetSnapshot = () => initialSnapshot) {
  return renderHook(() => useReplayClock({
    initialSnapshot,
    initialOrder: ["team"],
    replayEnd: 10,
    raceDuration: 8,
    laps: 1,
    resultSeed: "seed",
    titleKey: "result_replay_title",
    preferencesResetSignal,
    startHoldSeconds: 1,
    getActiveMomentId: () => null,
    getOrderAtProgress: () => ["team"],
    createTargetSnapshot,
    createTower: () => initialSnapshot.tower,
    smoothCarProgress: () => initialSnapshot.carProgress,
    displayLapAtProgress: () => 1,
    segmentAtProgress: () => "start"
  }));
}

describe("useReplayClock replay speed preferences", () => {
  beforeEach(() => localStorage.clear());

  it("loads and saves the shared replay speed preference", () => {
    localStorage.setItem(REPLAY_SPEED_KEY, "8");
    const { result } = renderClock();

    expect(result.current.speed).toBe(8);

    act(() => result.current.setSpeed(2));

    expect(result.current.speed).toBe(2);
    expect(localStorage.getItem(REPLAY_SPEED_KEY)).toBe("2");
  });

  it("falls back to x1 for removed or invalid saved speeds", () => {
    localStorage.setItem(REPLAY_SPEED_KEY, "0.5");

    expect(renderClock().result.current.speed).toBe(1);
  });

  it("publishes non-positional replay state at a reduced cadence", () => {
    expect(shouldPublishReplayState(1, 1 + REPLAY_STATE_UPDATE_SECONDS / 2)).toBe(false);
    expect(shouldPublishReplayState(1, 1 + REPLAY_STATE_UPDATE_SECONDS)).toBe(true);
  });

  it("keeps cars on the grid during the replay start hold", () => {
    const targetSnapshot: ReplayClockSnapshot = {
      carProgress: { team: 3 },
      tower: initialSnapshot.tower
    };
    const { result } = renderClock(0, () => targetSnapshot);

    act(() => result.current.seek(0.5));

    expect(result.current.snapshot.carProgress.team).toBe(0);
  });

  it("eases cars away from the grid after the replay start hold", () => {
    const smooth = () => ({ team: 0.5 });

    expect(replayFrameCarProgress(0.5, 1, { team: 0 }, { team: 0 }, { team: 3 }, true, 0.5, smooth).team).toBe(0);
    expect(replayFrameCarProgress(1.5, 1, { team: 0 }, { team: 0 }, { team: 3 }, true, 0.5, smooth).team).toBe(0.5);
    expect(replayFrameCarProgress(1.5, 1, { team: 0 }, { team: 0 }, { team: 3 }, false, 0.5, smooth).team).toBe(3);
  });
});
