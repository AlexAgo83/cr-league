import { describe, expect, it } from "vitest";
import { simulateRace } from "./simulateRace.js";
import type { RaceInput } from "../domain/race.js";

const baseRace: RaceInput = {
  seed: "silver-ridge-001",
  grandPrixName: "Silver Ridge GP",
  primaryTrait: "fast",
  secondaryTrait: "weather_sensitive",
  forecast: {
    dry: 60,
    light_rain: 30,
    heavy_rain: 10
  },
  participants: [
    {
      teamId: "alice",
      teamName: "Alice Racing",
      kind: "human",
      standingsRank: 5,
      decision: {
        approach: "aggressive",
        preparation: "weather",
        cardId: "rain_grip",
        rivalTeamId: "hugo"
      }
    },
    {
      teamId: "hugo",
      teamName: "Hugo GP",
      kind: "human",
      standingsRank: 4,
      decision: {
        approach: "balanced",
        preparation: "speed"
      }
    },
    {
      teamId: "atlas",
      teamName: "Atlas Works",
      kind: "bot",
      standingsRank: 1,
      botArchetype: "prudent",
      decision: {
        approach: "prudent",
        preparation: "reliability"
      }
    },
    {
      teamId: "mika",
      teamName: "Mika Blitz",
      kind: "bot",
      standingsRank: 6,
      botArchetype: "gambler",
      decision: {
        approach: "aggressive",
        preparation: "speed",
        cardId: "launch_boost"
      }
    },
    {
      teamId: "northline",
      teamName: "Northline",
      kind: "bot",
      standingsRank: 3,
      botArchetype: "rain_specialist",
      decision: {
        approach: "balanced",
        preparation: "weather",
        cardId: "fleet_maintenance"
      }
    },
    {
      teamId: "redpeak",
      teamName: "Red Peak",
      kind: "bot",
      standingsRank: 2,
      botArchetype: "sprinter",
      decision: {
        approach: "aggressive",
        preparation: "speed",
        cardId: "fleet_sponsorship"
      }
    }
  ]
};

describe("simulateRace", () => {
  it("is deterministic for the same seed and inputs", () => {
    expect(simulateRace(baseRace)).toEqual(simulateRace(baseRace));
  });

  it("produces classification, events, cards, and report blocks", () => {
    const result = simulateRace(baseRace);

    expect(result.classification).toHaveLength(6);
    expect(result.events.length).toBeGreaterThan(6);
    expect(result.replayTrace).toHaveLength(6);
    expect(result.replayTrace?.[0]?.progress).toBe(0);
    expect(new Set(Object.values(result.replayTrace?.[0]?.gaps ?? {}))).toEqual(new Set([0]));
    expect(result.replayTrace?.at(-1)?.progress).toBe(1);
    expect(result.replayTrace?.at(-1)?.order).toEqual(result.classification.map((entry) => entry.teamId));
    expect(result.replayTrace?.at(-1)?.times[result.classification[0]!.teamId]).toBeGreaterThan(0);
    expect(result.replayTrace?.at(-1)?.gaps[result.classification[0]!.teamId]).toBe(0);
    expect(result.consumedCards).toEqual(
      expect.arrayContaining([
        { teamId: "alice", cardId: "rain_grip" },
        { teamId: "mika", cardId: "launch_boost" },
        { teamId: "northline", cardId: "fleet_maintenance" },
        { teamId: "redpeak", cardId: "fleet_sponsorship" }
      ])
    );
    expect(result.report.blocks).toHaveLength(2);
  });

  it("emits card events for played cards", () => {
    const result = simulateRace(baseRace);

    expect(result.events.some((event) => event.cardId === "rain_grip")).toBe(true);
    expect(result.events.some((event) => event.cardId === "fleet_maintenance")).toBe(true);
    expect(result.events.some((event) => event.cardId === "launch_boost")).toBe(true);
    expect(result.events.some((event) => event.cardId === "fleet_sponsorship")).toBe(true);
  });

  it("adds minor race notes to make replay less repetitive", () => {
    const result = simulateRace(baseRace);

    expect(result.events.filter((event) => event.type === "race_note")).toHaveLength(4);
    expect(result.events.some((event) => event.severity === "minor" && event.tags.includes("flavor"))).toBe(true);
  });

  it("uses circuit trait values in race timing", () => {
    const stable = simulateRace({ ...baseRace, traits: { grip: 78, overtaking: 50, energy: 72 } });
    const attack = simulateRace({ ...baseRace, traits: { grip: 50, overtaking: 82, energy: 48 } });

    expect(stable.replayTrace?.at(-1)?.times).not.toEqual(attack.replayTrace?.at(-1)?.times);
  });
});
