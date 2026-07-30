import { describe, expect, it } from "vitest";
import { botApproach, botDecision, botPreparation, wetRisk } from "./botBrain.js";
import type { LeagueState } from "./league.js";
import type { RaceDecision } from "./race.js";

const team = (overrides: Partial<LeagueState["teams"][number]> = {}): LeagueState["teams"][number] => ({
  id: "bot-1",
  name: "Bot",
  kind: "bot",
  points: 0,
  credits: 0,
  cards: [],
  livery: { primary: "#fff", secondary: "#000" },
  unlockedCarAssetIds: [],
  circuitRecords: {},
  ready: false,
  ...overrides
});

const state = (overrides: { forecast?: LeagueState["currentGrandPrix"]["forecast"]; round?: number; maxRounds?: number; teams?: LeagueState["teams"] } = {}): LeagueState => ({
  league: {
    id: "league-1",
    name: "L",
    code: null,
    status: "active",
    cadence: "manual",
    maxPlayers: 6,
    fillWithBots: true,
    qualifyingAttemptLimit: 3,
    maxGrandPrixPerSeason: overrides.maxRounds ?? 10,
    variableShop: false,
    preparationDeadlineAt: null,
    reminderSentAt: null,
    reminderSentBy: null,
    reminderSeasonNumber: null,
    reminderSentCount: 0,
    reminderSkippedCount: 0
  },
  currentGrandPrix: {
    id: "gp-1",
    name: "GP",
    season: 1,
    round: overrides.round ?? 1,
    status: "briefing",
    primaryTrait: "fast",
    secondaryTrait: "weather_sensitive",
    trackLengthMeters: 5000,
    forecast: overrides.forecast ?? { dry: 90, light_rain: 10, heavy_rain: 0 },
    qualifyingRuns: [],
    result: null
  },
  grandPrixHistory: [],
  seasonSummaries: [],
  teams: overrides.teams ?? [team()],
  cardShop: [],
  actionState: { submittedTeamIds: [], missingTeamIds: [], canResolve: false, canResolveWithDefaults: false, canStartNextGrandPrix: false, nextAction: "wait_for_directives" },
  decisions: []
});

describe("bot tyres", () => {
  it("goes to weather rubber once rain is likely, whatever its habit says", () => {
    const wet = state({ forecast: { dry: 10, light_rain: 30, heavy_rain: 40 } });

    expect(wetRisk(wet.currentGrandPrix.forecast)).toBeGreaterThanOrEqual(70);
    expect(botPreparation(wet, { approach: "aggressive", preparation: "speed" })).toBe("weather");
  });

  it("keeps its habit under a clear sky", () => {
    expect(botPreparation(state(), { approach: "balanced", preparation: "speed" })).toBe("speed");
  });
});

describe("bot approach", () => {
  const rivals: LeagueState["teams"] = [team({ id: "leader", points: 100 }), team({ id: "bot-1", points: 10 })];
  const template: RaceDecision = { approach: "prudent", preparation: "speed" };

  it("throws caution away when the season is running out and it is losing", () => {
    const late = state({ round: 9, maxRounds: 10, teams: rivals });

    expect(botApproach(late, rivals[1]!, template)).toBe("aggressive");
  });

  it("protects a championship lead instead of chasing one more win", () => {
    const leading: LeagueState["teams"] = [team({ id: "bot-1", points: 100 }), team({ id: "other", points: 40 })];
    const late = state({ round: 9, maxRounds: 10, teams: leading });

    expect(botApproach(late, leading[0]!, { approach: "aggressive", preparation: "speed" })).toBe("balanced");
  });

  it("stops attacking in a downpour", () => {
    const storm = state({ forecast: { dry: 0, light_rain: 20, heavy_rain: 50 }, teams: rivals });

    expect(botApproach(storm, rivals[1]!, { approach: "aggressive", preparation: "speed" })).toBe("balanced");
  });

  it("still sounds like itself on an ordinary weekend", () => {
    expect(botApproach(state(), team(), template)).toBe("prudent");
  });
});

describe("one brain", () => {
  it("answers a submitted decision rather than inventing one", () => {
    const submitted = { ...state(), decisions: [{ teamId: "bot-1", approach: "aggressive" as const, preparation: "weather" as const, pitStrategy: "mini_pack" as const, cardId: null, rivalTeamId: null }] } as LeagueState;

    expect(botDecision(submitted, team())).toMatchObject({ approach: "aggressive", preparation: "weather", pitStrategy: "mini_pack" });
  });
});
