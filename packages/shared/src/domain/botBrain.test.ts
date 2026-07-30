import { describe, expect, it } from "vitest";
import { botApproach, botCard, botCardPurchase, botDecision, botPreparation, botQualifyingDecision, wetRisk } from "./botBrain.js";
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

describe("bot cards", () => {
  const hand = ["fleet_sponsorship", "rain_grip", "launch_boost"] as const;

  it("plays the card the weekend calls for, not the first one bought", () => {
    const storm = state({ forecast: { dry: 5, light_rain: 25, heavy_rain: 45 } });

    expect(botCard(storm, team({ cards: [...hand] }))).toBe("rain_grip");
  });

  it("keeps rain cover in the bag when the sky is clear", () => {
    expect(botCard(state(), team({ cards: [...hand] }))).not.toBe("rain_grip");
  });

  it("has nothing to play with an empty hand", () => {
    expect(botCard(state(), team({ cards: [] }))).toBeUndefined();
  });

  it("buys for the season it is having", () => {
    const field = [team({ id: "leader", points: 100 }), team({ id: "chaser", points: 0 })];
    const affordable = ["fleet_sponsorship", "rain_grip", "final_surge"] as const;
    const wet = state({ forecast: { dry: 20, light_rain: 40, heavy_rain: 20 }, teams: field });
    const dry = state({ teams: field });

    expect(botCardPurchase(wet, field[1]!, [...affordable])).toBe("rain_grip");
    expect(botCardPurchase(dry, field[0]!, [...affordable])).not.toBe("rain_grip");
  });
});

describe("bot chrono attempts", () => {
  const template = { approach: "prudent" as const, preparation: "reliability" as const };

  it("tries something else on the second run, then goes back to the quicker one", () => {
    const bot = team();
    const runs: Array<{ teamId: string; time: number; decision: typeof template }> = [];
    const plans: string[] = [];
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const decision = botQualifyingDecision(state(), bot, attempt, runs, template);
      plans.push(`${decision.approach}/${decision.preparation}`);
      // The opening plan was the quick one.
      runs.push({ teamId: bot.id, time: attempt === 1 ? 71.2 : 73.4, decision: decision as typeof template });
    }

    expect(plans[0]).toBe("prudent/reliability");
    expect(plans[1]).not.toBe(plans[0]);
    expect(plans[2]).toBe(plans[0]);
  });
});
