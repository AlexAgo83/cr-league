// @vitest-environment node

import { describe, expect, it } from "vitest";
import { CITY_CIRCUIT_IDENTITIES, circuitIdentityForRound, circuitSeasonSeed, raceInputFromCircuit, seasonCircuitIdentities } from "./circuits.js";

describe("circuit identities", () => {
  it("rotates deterministically by round", () => {
    expect(circuitIdentityForRound(1)).toBe(CITY_CIRCUIT_IDENTITIES[0]);
    expect(circuitIdentityForRound(CITY_CIRCUIT_IDENTITIES.length + 1)).toBe(CITY_CIRCUIT_IDENTITIES[0]);
  });

  it("shuffles circuit order per season seed", () => {
    const seasonOne = seasonCircuitIdentities(circuitSeasonSeed("league_1", 1)).map((circuit) => circuit.layoutKey);
    const seasonTwo = seasonCircuitIdentities(circuitSeasonSeed("league_1", 2)).map((circuit) => circuit.layoutKey);
    expect(seasonCircuitIdentities(circuitSeasonSeed("league_1", 1)).map((circuit) => circuit.layoutKey)).toEqual(seasonOne);
    expect(seasonTwo).not.toEqual(seasonOne);
    expect(circuitIdentityForRound(1, circuitSeasonSeed("league_1", 1)).layoutKey).toBe(seasonOne[0]);
  });

  it("maps circuit identity to race input traits and forecast", () => {
    expect(raceInputFromCircuit(CITY_CIRCUIT_IDENTITIES[0])).toEqual({
      primaryTrait: "weather_sensitive",
      secondaryTrait: "fast",
      trackLengthMeters: 2800,
      forecast: { dry: 35, light_rain: 50, heavy_rain: 15 }
    });
    expect(raceInputFromCircuit(CITY_CIRCUIT_IDENTITIES[1])).toEqual({
      primaryTrait: "technical",
      secondaryTrait: "urban",
      trackLengthMeters: 2300,
      forecast: { dry: 70, light_rain: 20, heavy_rain: 10 }
    });
  });

  it("includes two Monaco layouts", () => {
    expect(CITY_CIRCUIT_IDENTITIES.filter((circuit) => circuit.city === "Monaco").map((circuit) => circuit.layoutKey)).toEqual([
      "circuit_monaco_harbor_loop",
      "circuit_monaco_casino_sprint"
    ]);
  });

  it("adds global city circuits outside the European catalog", () => {
    expect(CITY_CIRCUIT_IDENTITIES.slice(-6).map((circuit) => circuit.city)).toEqual(["Tokyo", "Rio de Janeiro", "Cape Town", "Seoul", "Montreal", "Istanbul"]);
  });

  it("keeps generated global route lengths in circuit metadata", () => {
    expect(Object.fromEntries(CITY_CIRCUIT_IDENTITIES.slice(-6).map((circuit) => [circuit.city, circuit.trackLengthMeters]))).toEqual({
      "Cape Town": 5373,
      Istanbul: 5341,
      Montreal: 4185,
      "Rio de Janeiro": 3287,
      Seoul: 3976,
      Tokyo: 5720
    });
  });
});
