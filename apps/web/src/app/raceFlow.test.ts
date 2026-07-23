import { describe, expect, it } from "vitest";
import { t } from "../i18n/index.js";
import { buildChronoReport, buildPlanRecommendation, buildPlanRiskRead, traitImpacts } from "./raceFlow.js";
import type { FormState } from "./types.js";

const total = (values: Array<{ value: number }> = []) => values.reduce((sum, entry) => sum + entry.value, 0);
const baseForm: FormState = {
  approach: "balanced",
  preparation: "weather",
  pitStrategy: "standard",
  cardId: "",
  leagueName: "",
  joinCode: "",
  teamName: "",
  maxPlayers: 4,
  fillWithBots: true,
  maxGrandPrixPerSeason: 3,
  qualifyingAttemptLimit: 3,
  cadence: "",
  preparationDeadlineAt: ""
};

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
    const impacts = traitImpacts({ ...baseForm, approach: "aggressive", preparation: "speed", pitStrategy: "heavy_pack", cardId: "rain_grip" }, "rain_grip", (key) => t(key, "en"));

    expect(total(impacts.pace)).toBe(11);
    expect(total(impacts.control)).toBe(-4);
    expect(total(impacts.reliability)).toBe(-5);
    expect(total(impacts.weatherReadiness)).toBe(0);
    expect(total(impacts.aggression)).toBe(16);
  });

  it.each([
    [{ ...baseForm, approach: "balanced", preparation: "weather", pitStrategy: "standard" }, "light_rain", 1, 0, 6, "safe"],
    [{ ...baseForm, approach: "aggressive", preparation: "speed", pitStrategy: "mini_pack" }, "heavy_rain", 0, 2, 0, "risky"],
    [{ ...baseForm, approach: "aggressive", preparation: "speed", pitStrategy: "standard" }, "dry", 2, 0, 2, "high_upside"]
  ] as const)("derives %s plan risk reads", (form, forecastPick, qualifyingAttemptsUsed, qualifyingAttemptsLeft, gridPosition, level) => {
    const read = buildPlanRiskRead({
      form,
      selectedCardId: "",
      forecastPick,
      circuitTraits: { grip: 50, overtaking: 72, energy: 50 },
      qualifyingAttemptsUsed,
      qualifyingAttemptsLeft,
      gridPosition,
      tt: (key, params) => t(key, "en", params)
    });

    expect(read.level).toBe(level);
  });

  it("ignores pit strategy changes in chrono advice", () => {
    const report = buildChronoReport({
      runs: [
        {
          teamId: "team",
          time: 72,
          lap: 1,
          attempts: 1,
          decision: { approach: "balanced", preparation: "weather", pitStrategy: "heavy_pack" },
          result: {} as never,
          createdAt: "now"
        }
      ],
      gridPosition: 1,
      attemptsLeft: 1,
      attemptLimit: 3,
      forecastPick: "dry",
      form: { ...baseForm, approach: "balanced", preparation: "weather", pitStrategy: "mini_pack" },
      selectedCardId: "",
      tt: (key, params) => t(key, "en", params)
    });

    expect(report.suggestion).not.toBe(t("chrono_report_suggestion_compare_current", "en", { left: 1, limit: 3 }));
  });
});
