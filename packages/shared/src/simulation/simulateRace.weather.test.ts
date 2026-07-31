import { describe, expect, it } from "vitest";
import { DEMO_RACE_INPUT } from "./demoRace.js";
import { simulateRace } from "./simulateRace.js";
import type { RaceInput, TechnicalPreparation } from "../domain/race.js";

// 100, not 200: the figures are stable from 80 seeds up (0.10 / 0.83 / -0.37 either way) and the
// larger run took 5.1s under full-suite coverage, against a 5s per-test limit.
const SEEDS = 100;
const PLAYER = DEMO_RACE_INPUT.participants[0]!.teamId;

const FORECASTS = {
  dry: { dry: 100, light_rain: 0, heavy_rain: 0 },
  downpour: { dry: 0, light_rain: 0, heavy_rain: 100 }
} as const;

/**
 * Where the player finishes on each seed, per preparation. Simulated once per (forecast,
 * preparation) and reused across every comparison: running it per comparison meant 2400 races and a
 * timeout under coverage.
 */
const places = new Map<string, number[]>();
function placesFor(forecast: RaceInput["forecast"], preparation: TechnicalPreparation, label: string) {
  const key = `${label}:${preparation}`;
  const cached = places.get(key);
  if (cached) return cached;
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
  places.set(key, finishes);
  return finishes;
}

/** Places the player gains by picking `preparation` over `rival`, averaged over the seeds. */
function placesGained(label: "dry" | "downpour", preparation: TechnicalPreparation, rival: TechnicalPreparation) {
  const mine = placesFor(FORECASTS[label], preparation, label);
  const theirs = placesFor(FORECASTS[label], rival, label);
  return theirs.reduce((total, place, index) => total + place - mine[index]!, 0) / SEEDS;
}

describe("what the tyre choice is worth", () => {
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
