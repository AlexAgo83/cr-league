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

  it("is deterministic: identical inputs produce identical times and createdAt", () => {
    const input = {
      seed: "gp-7-team-42-qualifying-2",
      teamId: "team-42",
      teamName: "Team",
      decision: { approach: "aggressive" as const, preparation: "speed" as const },
      primaryTrait: "fast" as const,
      secondaryTrait: "technical" as const,
      forecast: { dry: 50, light_rain: 35, heavy_rain: 15 },
      laps: 3
    };

    const first = createQualifyingRuns(input);
    const second = createQualifyingRuns(input);

    expect(first.map((run) => run.time)).toEqual(second.map((run) => run.time));
    expect(first.map((run) => run.createdAt)).toEqual(second.map((run) => run.createdAt));
  });

  it("varies across teams and across attempts (seed changes)", () => {
    const base = {
      teamName: "Team",
      decision: { approach: "balanced" as const, preparation: "reliability" as const },
      primaryTrait: "urban" as const,
      secondaryTrait: "fast" as const,
      forecast: { dry: 100, light_rain: 0, heavy_rain: 0 },
      laps: 3
    };

    const teamA = createQualifyingRuns({ ...base, seed: "gp-1-team-a-qualifying-1", teamId: "team-a" });
    const teamB = createQualifyingRuns({ ...base, seed: "gp-1-team-b-qualifying-1", teamId: "team-b" });
    const teamAAttempt2 = createQualifyingRuns({ ...base, seed: "gp-1-team-a-qualifying-2", teamId: "team-a" });

    expect(teamA.map((run) => run.time)).not.toEqual(teamB.map((run) => run.time));
    expect(teamA.map((run) => run.time)).not.toEqual(teamAAttempt2.map((run) => run.time));
  });
});
