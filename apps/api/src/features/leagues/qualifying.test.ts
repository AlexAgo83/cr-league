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
      decision: { approach: "balanced" as const, preparation: "speed" as const },
      primaryTrait: "technical",
      secondaryTrait: "fast",
      forecast: { dry: 100, light_rain: 0, heavy_rain: 0 },
      laps: 3
    });

    vi.restoreAllMocks();

    const finalTime = run!.result.replayTrace!.at(-1)!.times.team;
    expect(finalTime).toBeCloseTo(RACE_REPLAY_BASE_SECONDS, 0);
  });

  it("ignores pit strategy for qualifying time", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const baseInput = {
      seed: "qualifying",
      teamId: "team",
      teamName: "Team",
      decision: { approach: "balanced", preparation: "speed" },
      primaryTrait: "technical" as const,
      secondaryTrait: "fast" as const,
      forecast: { dry: 100, light_rain: 0, heavy_rain: 0 },
      laps: 3
    } as const;

    const standard = createQualifyingRuns({ ...baseInput, decision: { ...baseInput.decision, pitStrategy: "standard" } });
    const heavy = createQualifyingRuns({ ...baseInput, decision: { ...baseInput.decision, pitStrategy: "heavy_pack" } });
    const mini = createQualifyingRuns({ ...baseInput, decision: { ...baseInput.decision, pitStrategy: "mini_pack" } });

    vi.restoreAllMocks();

    expect(heavy.map((run) => run.time)).toEqual(standard.map((run) => run.time));
    expect(mini.map((run) => run.time)).toEqual(standard.map((run) => run.time));
  });
});
