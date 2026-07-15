import { describe, expect, it } from "vitest";
import { CITY_CIRCUIT_IDENTITIES, circuitIdentityForRound, raceInputFromCircuit } from "./circuits.js";

describe("circuit identities", () => {
  it("rotates deterministically by round", () => {
    expect(circuitIdentityForRound(1)).toBe(CITY_CIRCUIT_IDENTITIES[0]);
    expect(circuitIdentityForRound(CITY_CIRCUIT_IDENTITIES.length + 1)).toBe(CITY_CIRCUIT_IDENTITIES[0]);
  });

  it("maps circuit identity to race input traits and forecast", () => {
    expect(raceInputFromCircuit(CITY_CIRCUIT_IDENTITIES[0])).toEqual({
      primaryTrait: "weather_sensitive",
      secondaryTrait: "fast",
      forecast: { dry: 35, light_rain: 50, heavy_rain: 15 }
    });
    expect(raceInputFromCircuit(CITY_CIRCUIT_IDENTITIES[1])).toEqual({
      primaryTrait: "technical",
      secondaryTrait: "urban",
      forecast: { dry: 70, light_rain: 20, heavy_rain: 10 }
    });
  });
});
