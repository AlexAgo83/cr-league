// @vitest-environment node

import { describe, expect, it } from "vitest";
import { simulateRace } from "./simulateRace.js";
import {
  COMEBACK_CREDIT_BONUS_CAP,
  COMEBACK_CREDIT_BONUS_PER_POSITION,
  ECONOMY_MODE_CREDIT_BONUS,
  FLEET_SPONSORSHIP_CREDIT_BONUS,
  RACE_CREDITS_BY_POSITION,
  RACE_POINTS_BY_POSITION
} from "../economy/constants.js";
import type { RaceInput } from "../domain/race.js";

// Seed chosen so that, deterministically, one economy_mode participant lands in the top four,
// one misses the top four, and fleet_sponsorship keeps its credit bonus.
const rewardRace: RaceInput = {
  seed: "reward-000",
  grandPrixName: "Reward Test GP",
  primaryTrait: "fast",
  secondaryTrait: "technical",
  forecast: { dry: 100, light_rain: 0, heavy_rain: 0 },
  participants: [
    {
      teamId: "sponsor",
      teamName: "Sponsor GP",
      kind: "human",
      standingsRank: 1,
      decision: { approach: "balanced", preparation: "speed", cardId: "fleet_sponsorship" }
    },
    {
      teamId: "plain-a",
      teamName: "Plain A",
      kind: "human",
      standingsRank: 2,
      decision: { approach: "balanced", preparation: "speed" }
    },
    {
      teamId: "plain-b",
      teamName: "Plain B",
      kind: "human",
      standingsRank: 3,
      decision: { approach: "balanced", preparation: "speed" }
    },
    {
      teamId: "eco-four",
      teamName: "Eco Four",
      kind: "human",
      standingsRank: 4,
      decision: { approach: "balanced", preparation: "speed", cardId: "economy_mode" }
    },
    {
      teamId: "eco-five",
      teamName: "Eco Five",
      kind: "human",
      standingsRank: 5,
      decision: { approach: "balanced", preparation: "speed", cardId: "economy_mode" }
    },
    {
      teamId: "plain-c",
      teamName: "Plain C",
      kind: "human",
      standingsRank: 6,
      decision: { approach: "balanced", preparation: "speed" }
    }
  ]
};

function entryFor(teamId: string) {
  const result = simulateRace(rewardRace);
  const entry = result.classification.find((candidate) => candidate.teamId === teamId);
  if (!entry) {
    throw new Error(`Missing classification entry for ${teamId}`);
  }
  return entry;
}

describe("simulateRace rewards", () => {
  it("pins the fixture finishing order so reward assertions stay meaningful", () => {
    const result = simulateRace(rewardRace);

    expect(result.classification.map((entry) => entry.teamId)).toEqual([
      "plain-a",
      "plain-b",
      "eco-four",
      "sponsor",
      "eco-five",
      "plain-c"
    ]);
    expect(entryFor("sponsor").position).toBe(4);
    expect(entryFor("eco-four").position).toBe(3);
    expect(entryFor("eco-five").position).toBe(5);
  });

  it("adds the fleet sponsorship credit bonus on top of position credits", () => {
    const sponsor = entryFor("sponsor");

    expect(sponsor.position).toBe(4);
    expect(sponsor.credits).toBe(RACE_CREDITS_BY_POSITION[3] + FLEET_SPONSORSHIP_CREDIT_BONUS);
    expect(sponsor.credits).toBe(155);
    expect(sponsor.points).toBe(RACE_POINTS_BY_POSITION[3]);
    expect(sponsor.points).toBe(12);
  });

  it("grants the economy mode bonus inside the top four", () => {
    const ecoFour = entryFor("eco-four");

    expect(ecoFour.position).toBe(3);
    expect(ecoFour.credits).toBe(RACE_CREDITS_BY_POSITION[2] + ECONOMY_MODE_CREDIT_BONUS);
    expect(ecoFour.credits).toBe(160);
    expect(ecoFour.points).toBe(RACE_POINTS_BY_POSITION[2]);
    expect(ecoFour.points).toBe(15);
  });

  it("does not grant the economy mode bonus at position 5", () => {
    const ecoFive = entryFor("eco-five");

    expect(ecoFive.position).toBe(5);
    expect(ecoFive.credits).toBe(RACE_CREDITS_BY_POSITION[4]);
    expect(ecoFive.credits).toBe(100);
    expect(ecoFive.points).toBe(RACE_POINTS_BY_POSITION[4]);
    expect(ecoFive.points).toBe(10);
  });

  it("leaves participants without reward cards on base position payouts", () => {
    const plainPodium = entryFor("plain-b");
    const last = entryFor("plain-c");

    expect(plainPodium.position).toBe(2);
    expect(plainPodium.credits).toBe(130);
    expect(plainPodium.points).toBe(18);
    expect(last.position).toBe(6);
    expect(last.credits).toBe(100);
    expect(last.points).toBe(8);
  });

  it("adds a capped comeback credit bonus outside points-paying positions", () => {
    const participants: RaceInput["participants"] = Array.from({ length: 12 }, (_, index) => ({
      teamId: `team-${index}`,
      teamName: `Team ${index}`,
      kind: "human",
      standingsRank: index + 1,
      decision: { approach: "balanced", preparation: "speed" }
    }));
    const result = simulateRace({ ...rewardRace, participants });

    expect(result.classification.find((entry) => entry.position === 6)?.credits).toBe(100);
    expect(result.classification.find((entry) => entry.position === 7)?.credits).toBe(100 + COMEBACK_CREDIT_BONUS_PER_POSITION);
    expect(result.classification.find((entry) => entry.position === 12)?.credits).toBe(100 + COMEBACK_CREDIT_BONUS_CAP);
  });
});
