import { beforeAll, describe, expect, it } from "vitest";
import { DEMO_RACE_INPUT } from "./demoRace.js";
import { simulateRace } from "./simulateRace.js";
import type { RaceInput, TechnicalPreparation } from "../domain/race.js";

// The figures are stable from 80 seeds up (0.10 / 0.83 / -0.37 either way), so this is sample size
// to spare rather than sample size that matters.
const SEEDS = 100;
const PLAYER = DEMO_RACE_INPUT.participants[0]!.teamId;

const FORECASTS = {
  dry: { dry: 100, light_rain: 0, heavy_rain: 0 },
  downpour: { dry: 0, light_rain: 0, heavy_rain: 100 }
} as const;

/**
 * Where the player finishes on each seed, per preparation. Five hundred races, built once in
 * `beforeAll` — this is the fixture, not the assertion, and billed to a per-test budget it kept
 * tipping a suite under coverage over the 5s limit. The tests themselves are then arithmetic.
 */
const places = new Map<string, number[]>();
function simulatePlaces(forecast: RaceInput["forecast"], preparation: TechnicalPreparation, label: string) {
  const finishes = Array.from({ length: SEEDS }, (_, index) => {
    const input: RaceInput = {
      ...DEMO_RACE_INPUT,
      seed: `tyres-${index}`,
      forecast,
      participants: DEMO_RACE_INPUT.participants.map((participant, position) =>
        position === 0 ? { ...participant, decision: { ...participant.decision, preparation, cardId: undefined } } : participant
      )
    };
    return simulateRace(input).classification.findIndex((entry) => entry.teamId === PLAYER) + 1;
  });
  places.set(`${label}:${preparation}`, finishes);
}

/** Places the player gains by picking `preparation` over `rival`, averaged over the seeds. */
function placesGained(label: "dry" | "downpour", preparation: TechnicalPreparation, rival: TechnicalPreparation) {
  const mine = places.get(`${label}:${preparation}`)!;
  const theirs = places.get(`${label}:${rival}`)!;
  return theirs.reduce((total, place, index) => total + place - mine[index]!, 0) / SEEDS;
}

describe("what the tyre choice is worth", () => {
  beforeAll(() => {
    for (const label of ["dry", "downpour"] as const) {
      for (const preparation of ["weather", "speed", "reliability"] as const) simulatePlaces(FORECASTS[label], preparation, label);
    }
  });

  it("pays in a downpour and costs in the dry, against both rivals", () => {
    // The forecast has to change the right answer. It used to not: weather rubber lost to speed
    // rubber even in a downpour, because the wet-grip window was wider than any setup could reach.
    expect(placesGained("downpour", "weather", "speed")).toBeGreaterThan(0);
    expect(placesGained("downpour", "weather", "reliability")).toBeGreaterThan(0.4);
    expect(placesGained("dry", "weather", "speed")).toBeLessThan(-0.2);
  });

  it("stays a judgement call rather than a free win", () => {
    // A downpour edge worth more than a place would make the forecast the whole game.
    expect(placesGained("downpour", "weather", "speed")).toBeLessThan(1);
  });
});
