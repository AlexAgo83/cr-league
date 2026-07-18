import { describe, expect, it } from "vitest";
import { simulateRace } from "./simulateRace.js";
import {
  ECONOMY_MODE_CREDIT_BONUS,
  FLEET_SPONSORSHIP_CREDIT_BONUS,
  RACE_CREDITS_BY_POSITION,
  RACE_POINTS_BY_POSITION
} from "../economy/constants.js";
import type { RaceInput } from "../domain/race.js";

// Seed chosen so that, deterministically, the two economy_mode participants
// finish exactly P4 and P5 and the fleet_sponsorship participant finishes P2.
const rewardRace: RaceInput = {
  seed: "reward-006",
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
      "plain-b",
      "sponsor",
      "plain-a",
      "eco-four",
      "eco-five",
      "plain-c"
    ]);
    expect(entryFor("sponsor").position).toBe(2);
    expect(entryFor("eco-four").position).toBe(4);
    expect(entryFor("eco-five").position).toBe(5);
  });

  it("adds the fleet sponsorship credit bonus on top of position credits", () => {
    const sponsor = entryFor("sponsor");

    expect(sponsor.position).toBe(2);
    expect(sponsor.credits).toBe(RACE_CREDITS_BY_POSITION[1] + FLEET_SPONSORSHIP_CREDIT_BONUS);
    expect(sponsor.credits).toBe(180);
    expect(sponsor.points).toBe(RACE_POINTS_BY_POSITION[1]);
    expect(sponsor.points).toBe(18);
  });

  it("grants the economy mode bonus at position 4", () => {
    const ecoFour = entryFor("eco-four");

    expect(ecoFour.position).toBe(4);
    expect(ecoFour.credits).toBe(RACE_CREDITS_BY_POSITION[3] + ECONOMY_MODE_CREDIT_BONUS);
    expect(ecoFour.credits).toBe(150);
    expect(ecoFour.points).toBe(RACE_POINTS_BY_POSITION[3]);
    expect(ecoFour.points).toBe(12);
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
    const winner = entryFor("plain-b");
    const last = entryFor("plain-c");

    expect(winner.position).toBe(1);
    expect(winner.credits).toBe(150);
    expect(winner.points).toBe(25);
    expect(last.position).toBe(6);
    expect(last.credits).toBe(100);
    expect(last.points).toBe(8);
  });
});
