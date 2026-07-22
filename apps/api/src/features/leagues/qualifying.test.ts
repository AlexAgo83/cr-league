import { describe, expect, it, vi } from "vitest";
import { RACE_REPLAY_BASE_SECONDS, type TrackSpeedProfile } from "@cr-league/shared";
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

  it("responds to numeric circuit traits for the same seed and decision", () => {
    const base = {
      seed: "same-seed",
      teamId: "team",
      teamName: "Team",
      decision: { approach: "balanced" as const, preparation: "speed" as const },
      primaryTrait: "fast" as const,
      secondaryTrait: "technical" as const,
      forecast: { dry: 100, light_rain: 0, heavy_rain: 0 },
      laps: 3
    };

    const lowGrip = createQualifyingRuns({ ...base, traits: { grip: 52, overtaking: 54, energy: 55 } });
    const highGrip = createQualifyingRuns({ ...base, traits: { grip: 82, overtaking: 78, energy: 74 } });

    expect(lowGrip.map((run) => run.time)).not.toEqual(highGrip.map((run) => run.time));
  });

  it("ramps chrono weather from start to finish forecast", () => {
    const runs = createQualifyingRuns({
      seed: "qualifying-weather-ramp",
      teamId: "team",
      teamName: "Team",
      decision: { approach: "balanced", preparation: "weather" },
      primaryTrait: "technical",
      secondaryTrait: "weather_sensitive",
      forecast: { dry: 0, light_rain: 0, heavy_rain: 100 },
      laps: 3
    });

    expect(runs[0]!.result.resolvedWeather).toMatchObject({
      start: "dry",
      mid: "light_rain",
      finish: "heavy_rain"
    });
  });

  it("applies speed profiles to chrono trace car progress without changing final time", () => {
    const speedProfile: TrackSpeedProfile = [{ kind: "corner", startProgress: 0.2, endProgress: 0.4, factor: 0.5 }];
    const base = {
      seed: "qualifying-speed-profile",
      teamId: "team",
      teamName: "Team",
      decision: { approach: "balanced" as const, preparation: "speed" as const },
      primaryTrait: "technical" as const,
      secondaryTrait: "fast" as const,
      forecast: { dry: 100, light_rain: 0, heavy_rain: 0 },
      laps: 1
    };

    const [linear] = createQualifyingRuns(base);
    const [profiled] = createQualifyingRuns({ ...base, speedProfile });
    const profiledPoint = profiled!.result.replayTrace!.find((point) => point.progress > 0.3 && point.progress < 0.4)!;

    expect(profiledPoint.cars!.team!.trackProgress).not.toBe(profiledPoint.progress);
    expect(profiled!.result.replayTrace!.at(-1)!.cars!.team!.trackProgress).toBe(1);
    expect(profiled!.result.replayTrace!.at(-1)!.times.team).toBe(linear!.result.replayTrace!.at(-1)!.times.team);
    expect(profiled!.time).toBe(linear!.time);
  });

  it("exposes only solo chrono replay phases", () => {
    const [run] = createQualifyingRuns({
      seed: "qualifying-phases",
      teamId: "team",
      teamName: "Team",
      decision: { approach: "balanced", preparation: "speed" },
      primaryTrait: "technical",
      secondaryTrait: "fast",
      forecast: { dry: 100, light_rain: 0, heavy_rain: 0 },
      laps: 1
    });

    const phases = new Set(run!.result.replayTrace!.map((point) => point.cars!.team!.phase));

    expect([...phases]).toEqual(["grid", "launch", "racing", "finished"]);
  });

  it("makes chrono weather visible in trace speed metadata", () => {
    const speedProfile: TrackSpeedProfile = [{ kind: "corner", startProgress: 0.2, endProgress: 0.4, factor: 0.5 }];
    const base = {
      seed: "qualifying-weather-speed",
      teamId: "team",
      teamName: "Team",
      decision: { approach: "balanced" as const, preparation: "speed" as const },
      primaryTrait: "technical" as const,
      secondaryTrait: "fast" as const,
      speedProfile,
      laps: 1
    };

    const [dry] = createQualifyingRuns({ ...base, forecast: { dry: 100, light_rain: 0, heavy_rain: 0 } });
    const [wet] = createQualifyingRuns({ ...base, forecast: { dry: 0, light_rain: 0, heavy_rain: 100 } });

    expect(wet!.result.replayTrace!.find((point) => point.progress > 0.3 && point.progress < 0.4)!.cars!.team!.speed)
      .toBeLessThan(dry!.result.replayTrace!.find((point) => point.progress > 0.3 && point.progress < 0.4)!.cars!.team!.speed);
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
