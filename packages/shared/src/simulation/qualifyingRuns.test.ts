import { describe, expect, it } from "vitest";
import { emoteCandidates } from "../domain/raceEmotes.js";
import { createQualifyingRuns, qualifyingLapEvent } from "./qualifyingRuns.js";

describe("chrono lap events", () => {
  it("calls a lap that beats every earlier one a personal record", () => {
    expect(qualifyingLapEvent([92.4, 91.1], 1)).toBe("personal_record");
    expect(qualifyingLapEvent([92.4, 92.5], 1)).toBe("finish");
  });

  it("calls a lap thrown away a mistake, and lets tyres go off quietly", () => {
    expect(qualifyingLapEvent([90, 92.1], 1)).toBe("minor_error");
    expect(qualifyingLapEvent([90, 91.2], 1)).toBe("finish");
  });

  it("has nothing to say about the first lap, which beat nothing", () => {
    expect(qualifyingLapEvent([90], 0)).toBe("finish");
  });
});

describe("a chrono run", () => {
  it("gives the car something to react to, where the lap happened", () => {
    const runs = createQualifyingRuns({
      seed: "chrono-emotes",
      teamId: "team_1",
      teamName: "Volt Union",
      decision: { approach: "aggressive", preparation: "speed" },
      primaryTrait: "fast",
      secondaryTrait: "technical",
      forecast: { dry: 100, light_rain: 0, heavy_rain: 0 },
      laps: 8
    });
    const emotes = emoteCandidates(runs[0]!.result.events);

    expect(emotes.length).toBeGreaterThan(0);
    for (const emote of emotes) {
      expect(["fire", "dizzy"]).toContain(emote.emote);
      expect(emote.progress).toBeGreaterThan(0);
      expect(emote.progress).toBeLessThanOrEqual(1);
    }
  });
});
