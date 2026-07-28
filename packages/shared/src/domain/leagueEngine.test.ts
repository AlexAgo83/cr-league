import { describe, expect, it } from "vitest";
import {
  buyCard,
  resolveGrandPrix,
  runQualifying,
  sellCard,
  startNextGrandPrix,
  submitDecision,
  updateTeamLivery,
  updateTeamName,
  validateDecisionValues,
  type SharedLeagueRuleError
} from "./leagueEngine.js";
import type { LeagueState } from "./league.js";

const team = (id: string, name: string, cards: LeagueState["teams"][number]["cards"] = [], credits = 300, unlockedCarAssetIds: LeagueState["teams"][number]["unlockedCarAssetIds"] = []) => ({
  id,
  name,
  kind: "human",
  points: 0,
  credits,
  cards,
  livery: { primary: "#000000", secondary: "#ffffff" },
  unlockedCarAssetIds,
  ready: false
});

const state = (overrides: Partial<LeagueState> = {}): LeagueState =>
  ({
    league: {
      id: "league-1",
      name: "League",
      code: "ABC123",
      status: "active",
      cadence: "manual",
      maxPlayers: 6,
      fillWithBots: false,
      qualifyingAttemptLimit: 3,
      maxGrandPrixPerSeason: 8,
      variableShop: false,
      preparationDeadlineAt: null,
      reminderSentAt: null,
      reminderSentBy: null,
      reminderSeasonNumber: null,
      reminderSentCount: 0,
      reminderSkippedCount: 0
    },
    seasonSummaries: [],
    currentGrandPrix: {
      id: "gp-1",
      name: "GP",
      season: 1,
      round: 1,
      status: "briefing",
      primaryTrait: "fast",
      secondaryTrait: "urban",
      trackLengthMeters: 3200,
      forecast: { dry: 80, light_rain: 15, heavy_rain: 5 },
      qualifyingRuns: [],
      result: null
    },
    grandPrixHistory: [],
    teams: [team("a", "Alpha"), team("b", "Bravo")],
    cardShop: [],
    actionState: {
      submittedTeamIds: [],
      missingTeamIds: [],
      canResolve: false,
      canResolveWithDefaults: false,
      canStartNextGrandPrix: false,
      nextAction: "submit"
    },
    decisions: [],
    ...overrides
  }) as LeagueState;

describe("leagueEngine", () => {
  it("buys cards without mutating the original state", () => {
    const initial = state({ teams: [team("a", "Alpha", [], 300)] });
    const next = buyCard(initial, { teamId: "a", cardId: "rain_grip", quantity: 2 });

    expect(next.teams[0]?.credits).toBe(60);
    expect(next.teams[0]?.cards).toEqual(["rain_grip", "rain_grip"]);
    expect(initial.teams[0]?.cards).toEqual([]);
  });

  it("sells one unlocked card for half price", () => {
    const next = sellCard(state({ teams: [team("a", "Alpha", ["rain_grip", "rain_grip"], 0)] }), { teamId: "a", cardId: "rain_grip" });

    expect(next.teams[0]?.credits).toBe(60);
    expect(next.teams[0]?.cards).toEqual(["rain_grip"]);
  });

  it("does not sell cards used by the current plan or qualifying focus lock", () => {
    const planned = state({
      teams: [team("a", "Alpha", ["rain_grip", "qualifying_focus"])],
      decisions: [{ teamId: "a", approach: "balanced", preparation: "speed", cardId: "rain_grip", pitStrategy: "standard", rivalTeamId: null }],
      currentGrandPrix: {
        ...state().currentGrandPrix,
        qualifyingRuns: [{ teamId: "a", time: 90, attempts: 1, createdAt: "now", decision: { approach: "balanced", preparation: "speed", cardId: "qualifying_focus" }, result: emptyResult() }]
      }
    });

    expect(() => sellCard(planned, { teamId: "a", cardId: "rain_grip" })).toThrow("This card is already used in your current plan.");
    expect(() => sellCard(planned, { teamId: "a", cardId: "qualifying_focus" })).toThrow("This card is already locked by your qualifying run.");
  });

  it("updates team names with duplicate protection", () => {
    const next = updateTeamName(state(), { teamId: "a", name: "  Alpha   Racing " });

    expect(next.teams[0]?.name).toBe("Alpha Racing");
    expect(() => updateTeamName(next, { teamId: "a", name: "bravo" })).toThrow("This team name is already taken.");
  });

  it("updates livery only when paid car assets are unlocked", () => {
    const next = updateTeamLivery(state({ teams: [team("a", "Alpha", [], 0, ["car-008"])] }), {
      teamId: "a",
      livery: { primary: "#123abc", secondary: "#abcdef", carAssetId: "car-008" }
    });

    expect(next.teams[0]?.livery).toEqual({ primary: "#123abc", secondary: "#abcdef", carAssetId: "car-008" });
    expect(() => updateTeamLivery(state(), { teamId: "a", livery: { primary: "#123abc", secondary: "#abcdef", carAssetId: "car-008" } })).toThrow("This car is locked.");
  });

  it("validates and upserts a race decision", () => {
    const next = submitDecision(state({ teams: [team("a", "Alpha", ["rain_grip"]), team("b", "Bravo")] }), {
      teamId: "a",
      approach: "balanced",
      preparation: "weather",
      cardId: "rain_grip",
      rivalTeamId: "b"
    });

    expect(next.decisions).toEqual([{ teamId: "a", approach: "balanced", preparation: "weather", pitStrategy: "standard", cardId: "rain_grip", rivalTeamId: "b" }]);
    expect(() => validateDecisionValues(state(), { teamId: "a", approach: "full-send", preparation: "speed" })).toThrow("Unsupported race approach.");
  });

  it("locks qualifying focus into the submitted decision", () => {
    const initial = state({
      teams: [team("a", "Alpha", ["qualifying_focus", "rain_grip"])],
      currentGrandPrix: {
        ...state().currentGrandPrix,
        qualifyingRuns: [{ teamId: "a", time: 90, attempts: 1, createdAt: "now", decision: { approach: "balanced", preparation: "speed", cardId: "qualifying_focus" }, result: emptyResult() }]
      }
    });

    expect(() => submitDecision(initial, { teamId: "a", approach: "balanced", preparation: "speed", cardId: "rain_grip" })).toThrow("This Grand Prix card is already locked by your qualifying run.");
    expect(submitDecision(initial, { teamId: "a", approach: "balanced", preparation: "speed" }).decisions[0]?.cardId).toBe("qualifying_focus");
  });

  it("runs local qualifying attempts and bot companion runs", () => {
    const initial = state({
      teams: [team("a", "Alpha", ["qualifying_focus"]), { ...team("bot", "Bot"), kind: "bot" }]
    });

    const result = runQualifying(initial, {
      teamId: "a",
      approach: "balanced",
      preparation: "speed",
      cardId: "qualifying_focus",
      laps: 3
    });

    expect(result.run.teamId).toBe("a");
    expect(result.isBest).toBe(true);
    expect(result.state.currentGrandPrix.qualifyingRuns.filter((run) => run.teamId === "a")).toHaveLength(3);
    expect(result.state.currentGrandPrix.qualifyingRuns.filter((run) => run.teamId === "bot")).toHaveLength(1);
    expect(initial.currentGrandPrix.qualifyingRuns).toEqual([]);
  });

  it("resolves a grand prix and applies rewards", () => {
    const initial = submitDecision(state({ teams: [team("a", "Alpha", ["rain_grip"]), { ...team("bot", "Bot"), kind: "bot" }] }), {
      teamId: "a",
      approach: "balanced",
      preparation: "weather",
      cardId: "rain_grip"
    });
    const resolved = resolveGrandPrix(initial);

    expect(resolved.currentGrandPrix.status).toBe("resolved");
    expect(resolved.currentGrandPrix.result?.classification).toHaveLength(2);
    expect(resolved.teams.reduce((sum, candidate) => sum + candidate.points, 0)).toBeGreaterThan(0);
    expect(resolved.actionState.canStartNextGrandPrix).toBe(true);
    expect(resolved.grandPrixHistory[0]?.result).toBeTruthy();
  });

  it("starts the next grand prix from a resolved state", () => {
    const initial = submitDecision(state({ teams: [team("a", "Alpha"), { ...team("bot", "Bot"), kind: "bot" }] }), {
      teamId: "a",
      approach: "balanced",
      preparation: "weather"
    });
    const next = startNextGrandPrix(resolveGrandPrix(initial));

    expect(next.currentGrandPrix.round).toBe(2);
    expect(next.currentGrandPrix.status).toBe("briefing");
    expect(next.currentGrandPrix.result).toBe(null);
    expect(next.decisions).toEqual([]);
    expect(next.actionState.canStartNextGrandPrix).toBe(false);
    expect(next.grandPrixHistory[0]?.status).toBe("resolved");
  });
});

function emptyResult(): LeagueState["currentGrandPrix"]["qualifyingRuns"][number]["result"] {
  return {
    grandPrixName: "Qualifying",
    seed: "seed",
    resolvedWeather: { start: "dry", early: "dry", mid: "dry", late: "dry", finish: "dry" },
    classification: [],
    events: [],
    consumedCards: [],
    report: { headline: "", blocks: [] }
  };
}
