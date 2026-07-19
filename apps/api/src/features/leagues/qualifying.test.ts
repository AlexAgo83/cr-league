import { describe, expect, it, vi } from "vitest";
import { RACE_REPLAY_BASE_SECONDS } from "@cr-league/shared";
import { createQualifyingRuns } from "./qualifying.js";

describe("createQualifyingRuns", () => {
  it("uses the race replay base pace for qualifying traces", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const [run] = createQualifyingRuns({
      seed: "qualifying",
      teamId: "team",
      teamName: "Team",
      decision: { approach: "balanced", preparation: "speed" },
      primaryTrait: "technical",
      secondaryTrait: "fast",
      forecast: { dry: 100, light_rain: 0, heavy_rain: 0 },
      laps: 3,
      raceLaps: 7
    });

    vi.restoreAllMocks();

    const finalTime = run!.result.replayTrace!.at(-1)!.times.team;
    expect(finalTime).toBeCloseTo(RACE_REPLAY_BASE_SECONDS / 7, 0);
  });
});
