// @vitest-environment node

import { describe, expect, it } from "vitest";
import { CARD_DEFINITIONS, CARD_DESCRIPTORS, type CardStrengthBand } from "./definitions.js";
import { simulateRace } from "../simulation/simulateRace.js";
import type { CardId, RaceInput } from "../domain/race.js";

const eventBandByDelta = (delta: number): CardStrengthBand => (delta >= 10 ? "strong" : delta >= 8 ? "medium" : "weak");

const baseInput = (cardId: CardId): RaceInput => ({
  seed: cardId === "calculated_attack" ? "calc-0" : `card-descriptor-${cardId}`,
  grandPrixName: "Descriptor GP",
  primaryTrait: "fast",
  secondaryTrait: "urban",
  forecast: { dry: 0, light_rain: 100, heavy_rain: 0 },
  participants: [
    {
      teamId: "player",
      teamName: "Player",
      kind: "human",
      standingsRank: 5,
      decision: { approach: cardId === "calculated_attack" ? "aggressive" : "balanced", preparation: "speed", cardId, rivalTeamId: "rival" }
    },
    {
      teamId: "rival",
      teamName: "Rival",
      kind: "human",
      standingsRank: 4,
      decision: { approach: cardId === "calculated_attack" ? "aggressive" : "balanced", preparation: "speed" }
    }
  ]
});

describe("CARD_DESCRIPTORS", () => {
  it("covers every card definition", () => {
    expect(Object.keys(CARD_DESCRIPTORS).sort()).toEqual(Object.keys(CARD_DEFINITIONS).sort());
  });

  it("keeps position-event strength bands aligned with simulated card events", () => {
    const cardsWithPositionEvents: CardId[] = [
      "rain_grip",
      "launch_boost",
      "urban_draft",
      "final_surge",
      "soft_tires",
      "defensive_order",
      "adjustable_wing",
      "rain_mapping",
      "pit_relay",
      "hard_tires",
      "calculated_attack"
    ];

    for (const cardId of cardsWithPositionEvents) {
      const input = baseInput(cardId);
      if (cardId === "calculated_attack") input.participants = [input.participants[1]!, input.participants[0]!];
      const event = simulateRace(input).events.find((candidate) => candidate.teamId === "player" && candidate.cardId === cardId);
      expect(event, cardId).toBeDefined();
      expect(CARD_DESCRIPTORS[cardId].strength, cardId).toBe(eventBandByDelta(event?.positionDelta ?? 0));
    }
  });
});
