import { describe, expect, it } from "vitest";
import { t } from "../i18n/index.js";
import { buildPlanRecommendation, traitImpacts } from "./raceFlow.js";

const total = (values: Array<{ value: number }> = []) => values.reduce((sum, entry) => sum + entry.value, 0);

describe("buildPlanRecommendation", () => {
  it.each([
    [{ grip: 91, overtaking: 40, energy: 50 }, "dry", "Grip", "Dry", "Keep the car stable"],
    [{ grip: 30, overtaking: 88, energy: 70 }, "light_rain", "Attack", "Light rain", "attacking setup"],
    [{ grip: 50, overtaking: 60, energy: 92 }, "heavy_rain", "Endurance", "Heavy rain", "late-race endurance"]
  ])("combines dominant trait and forecast", (circuitTraits, forecastPick, trait, weather, advice) => {
    const recommendation = buildPlanRecommendation({ circuitTraits, forecastPick, tt: (key, params) => t(key, "en", params) });

    expect(recommendation).toContain(trait);
    expect(recommendation).toContain(weather);
    expect(recommendation).toContain(advice);
  });

  it("falls back to dry copy for an unknown forecast", () => {
    expect(buildPlanRecommendation({ circuitTraits: { grip: 1, overtaking: 1, energy: 1 }, forecastPick: "fog", tt: (key, params) => t(key, "en", params) })).toContain("Dry");
  });

  it("uses localized recommendation copy", () => {
    const recommendation = buildPlanRecommendation({ circuitTraits: { grip: 30, overtaking: 40, energy: 90 }, forecastPick: "heavy_rain", tt: (key, params) => t(key, "fr", params) });

    expect(recommendation).toContain("Lecture du plan");
    expect(recommendation).toContain("Endurance");
    expect(recommendation).toContain("Forte pluie");
  });

  it("returns signed trait impact values", () => {
    const impacts = traitImpacts({ approach: "aggressive", preparation: "speed", pitStrategy: "heavy_pack", cardId: "rain_grip", leagueName: "", joinCode: "", teamName: "", maxPlayers: 4, fillWithBots: true, maxGrandPrixPerSeason: 3, qualifyingAttemptLimit: 3, cadence: "", preparationDeadlineAt: "" }, "rain_grip", (key) => t(key, "en"));

    expect(total(impacts.grip)).toBe(-1);
    expect(total(impacts.overtaking)).toBe(1);
    expect(total(impacts.energy)).toBe(-3);
  });
});
