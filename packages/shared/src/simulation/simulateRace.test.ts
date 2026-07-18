// @vitest-environment node

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
    expect(result.replayTrace).toHaveLength(51);
    expect(result.replayTrace?.[0]?.progress).toBe(0);
    expect(result.replayTrace?.[1]?.progress).toBe(0.02);
    expect(result.replayTrace?.[10]?.progress).toBe(0.2);
    expect(new Set(Object.values(result.replayTrace?.[0]?.gaps ?? {}))).toEqual(new Set([0]));
    expect(result.replayTrace?.[1]?.times.atlas).toBeLessThan(result.replayTrace?.[1]?.times.redpeak ?? 0);
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

  it("applies the new race cards", () => {
    const result = simulateRace({
      ...baseRace,
      participants: [
        {
          ...baseRace.participants[0]!,
          teamId: "soft",
          standingsRank: 1,
          decision: { approach: "aggressive", preparation: "speed", cardId: "soft_tires" }
        },
        {
          ...baseRace.participants[1]!,
          teamId: "defense",
          standingsRank: 2,
          decision: { approach: "prudent", preparation: "reliability", cardId: "defensive_order" }
        }
      ]
    });

    expect(result.consumedCards).toEqual(
      expect.arrayContaining([
        { teamId: "soft", cardId: "soft_tires" },
        { teamId: "defense", cardId: "defensive_order" }
      ])
    );
    expect(result.events.some((event) => event.cardId === "soft_tires" && event.positionDelta > 0)).toBe(true);
    expect(result.events.some((event) => event.cardId === "defensive_order" && event.type === "held_position")).toBe(true);
  });

  it("applies the extended race cards", () => {
    const participants = [
      { teamId: "wing", teamName: "Wing GP", cardId: "adjustable_wing" },
      { teamId: "mapping", teamName: "Mapping GP", cardId: "rain_mapping" },
      { teamId: "economy", teamName: "Economy GP", cardId: "economy_mode" },
      { teamId: "relay", teamName: "Relay GP", cardId: "pit_relay" },
      { teamId: "hard", teamName: "Hard GP", cardId: "hard_tires" },
      { teamId: "attack", teamName: "Attack GP", cardId: "calculated_attack" }
    ] as const;
    const result = simulateRace({
      ...baseRace,
      seed: "extended-cards",
      primaryTrait: "fast",
      secondaryTrait: "urban",
      forecast: { dry: 0, light_rain: 100, heavy_rain: 0 },
      participants: participants.map((participant, index) => ({
        teamId: participant.teamId,
        teamName: participant.teamName,
        kind: "human",
        standingsRank: index + 1,
        decision: { approach: "balanced", preparation: "speed", cardId: participant.cardId }
      }))
    });

    for (const participant of participants) {
      expect(result.consumedCards).toContainEqual({ teamId: participant.teamId, cardId: participant.cardId });
      expect(result.events.some((event) => event.cardId === participant.cardId)).toBe(true);
    }
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

  it("keeps positionChange as the pure grid-to-finish delta", () => {
    const result = simulateRace(baseRace);

    for (const entry of result.classification) {
      const gridRank = baseRace.participants.find((participant) => participant.teamId === entry.teamId)?.standingsRank;
      expect(entry.positionChange).toBe((gridRank ?? entry.position) - entry.position);
    }
    expect(result.classification.map((entry) => entry.position + entry.positionChange).sort((left, right) => left - right)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("covers forced risk scare and mechanic save branches", () => {
    const risky: RaceInput = {
      ...baseRace,
      participants: [
        {
          ...baseRace.participants[0]!,
          teamId: "scare",
          teamName: "Scare GP",
          standingsRank: 1,
          decision: { approach: "aggressive", preparation: "speed" }
        },
        {
          ...baseRace.participants[1]!,
          teamId: "save",
          teamName: "Save GP",
          standingsRank: 2,
          decision: { approach: "aggressive", preparation: "speed", cardId: "fleet_maintenance" }
        }
      ]
    };
    const result = simulateRace({ ...risky, seed: "risk-106" });

    expect(result.events.some((event) => event.teamId === "scare" && event.type === "mechanical_scare")).toBe(true);
    expect(result.events.some((event) => event.teamId === "save" && event.type === "mechanic_save")).toBe(true);
  });
});
