// @vitest-environment node

import { describe, expect, it } from "vitest";
import { simulateRace } from "./simulateRace.js";
import {
  ECONOMY_MODE_CREDIT_BONUS,
  FLEET_SPONSORSHIP_CREDIT_BONUS,
  RACE_CREDITS_BY_POSITION,
  RACE_POINTS_BY_POSITION
} from "../economy/constants.js";
import type { RaceInput } from "../domain/race.js";

// Seed and grid chosen so that the chrono engine keeps one economy_mode
// participant in the top four, one outside it, and fleet_sponsorship paid.
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
      standingsRank: 2,
      decision: { approach: "balanced", preparation: "speed", cardId: "fleet_sponsorship" }
    },
    {
      teamId: "plain-a",
      teamName: "Plain A",
      kind: "human",
      standingsRank: 3,
      decision: { approach: "balanced", preparation: "speed" }
    },
    {
      teamId: "plain-b",
      teamName: "Plain B",
      kind: "human",
      standingsRank: 4,
      decision: { approach: "balanced", preparation: "speed" }
    },
    {
      teamId: "eco-four",
      teamName: "Eco Four",
      kind: "human",
      standingsRank: 1,
      decision: { approach: "aggressive", preparation: "speed", cardId: "economy_mode" }
    },
    {
      teamId: "eco-five",
      teamName: "Eco Five",
      kind: "human",
      standingsRank: 5,
      decision: { approach: "prudent", preparation: "reliability", cardId: "economy_mode" }
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
      "eco-four",
      "plain-a",
      "plain-c",
      "sponsor",
      "plain-b",
      "eco-five"
    ]);
    expect(entryFor("sponsor").position).toBe(4);
    expect(entryFor("eco-four").position).toBe(1);
    expect(entryFor("eco-five").position).toBe(6);
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

    expect(ecoFour.position).toBe(1);
    expect(ecoFour.credits).toBe(RACE_CREDITS_BY_POSITION[0] + ECONOMY_MODE_CREDIT_BONUS);
    expect(ecoFour.credits).toBe(195);
    expect(ecoFour.points).toBe(RACE_POINTS_BY_POSITION[0]);
    expect(ecoFour.points).toBe(25);
  });

  it("does not grant the economy mode bonus outside the top four", () => {
    const ecoFive = entryFor("eco-five");

    expect(ecoFive.position).toBe(6);
    expect(ecoFive.credits).toBe(RACE_CREDITS_BY_POSITION[5]);
    expect(ecoFive.credits).toBe(100);
    expect(ecoFive.points).toBe(RACE_POINTS_BY_POSITION[5]);
    expect(ecoFive.points).toBe(8);
  });

  it("leaves participants without reward cards on base position payouts", () => {
    const plainPodium = entryFor("plain-a");
    const plainLowerPoints = entryFor("plain-b");

    expect(plainPodium.position).toBe(2);
    expect(plainPodium.credits).toBe(130);
    expect(plainPodium.points).toBe(18);
    expect(plainLowerPoints.position).toBe(5);
    expect(plainLowerPoints.credits).toBe(100);
    expect(plainLowerPoints.points).toBe(10);
  });

  it("keeps base position credits non-increasing outside points-paying positions", () => {
    const participants: RaceInput["participants"] = Array.from({ length: 12 }, (_, index) => ({
      teamId: `team-${index}`,
      teamName: `Team ${index}`,
      kind: "human",
      standingsRank: index + 1,
      decision: { approach: "balanced", preparation: "speed" }
    }));
    const result = simulateRace({ ...rewardRace, participants });

    expect(result.classification.find((entry) => entry.position === 6)?.credits).toBe(100);
    expect(result.classification.find((entry) => entry.position === 7)?.credits).toBe(100);
    expect(result.classification.find((entry) => entry.position === 12)?.credits).toBe(100);
  });
});
