import { describe, expect, it } from "vitest";
import { clampNumber, completedSeasonSummaries, raceRecapCards, seasonStandings, seasonWinsByTeamId, startingGrid } from "./helpers.js";
import type { LeagueState } from "./types.js";
import { circuitIdentityForRound, circuitSeasonSeed, type RaceResult } from "@cr-league/shared";
import { t } from "../i18n/index.js";

function expectedNextCircuitName() {
  const circuit = circuitIdentityForRound(2, circuitSeasonSeed("league_1", 2));
  return `${circuit.city} ${t(circuit.layoutKey, "en")}`;
}

const result = (winnerId: string, runnerId = "team_2"): RaceResult => ({
  grandPrixName: "Test GP",
  seed: "test",
  resolvedWeather: {
    start: "dry",
    early: "dry",
    mid: "dry",
    late: "dry",
    finish: "dry"
  },
  classification: [
    { teamId: winnerId, teamName: winnerId, position: 1, points: 25, credits: 100, score: 90, positionChange: 0, status: "finished", resultTags: [] },
    { teamId: runnerId, teamName: runnerId, position: 2, points: 18, credits: 80, score: 80, positionChange: 0, status: "finished", resultTags: [] }
  ],
  events: [],
  consumedCards: [],
  report: {
    headline: "Test",
    blocks: []
  }
});

function stateWithHistory(grandPrixHistory: LeagueState["grandPrixHistory"]): LeagueState {
  return {
    league: {
      id: "league_1",
      name: "Test League",
      code: "TEST",
      status: "active",
      cadence: "manual",
      maxPlayers: 2,
      fillWithBots: true,
      qualifyingAttemptLimit: 3,
      maxGrandPrixPerSeason: 2,
      preparationDeadlineAt: null
    },
    currentGrandPrix: {
      id: "gp_current",
      name: "Current GP",
      season: 2,
      round: 1,
      status: "briefing",
      primaryTrait: "fast",
      secondaryTrait: "urban",
      forecast: { dry: 100 },
      qualifyingRuns: [],
      result: null
    },
    grandPrixHistory,
    teams: [],
    cardShop: [],
    actionState: {
      submittedTeamIds: [],
      missingTeamIds: [],
      canResolve: false,
      canStartNextGrandPrix: false,
      nextAction: "wait_for_directives"
    },
    decisions: []
  };
}

describe("seasonWinsByTeamId", () => {
  it("counts only completed season winners", () => {
    const wins = seasonWinsByTeamId(
      stateWithHistory([
        { id: "gp_1", name: "GP 1", season: 1, round: 1, status: "resolved", result: result("team_1") },
        { id: "gp_2", name: "GP 2", season: 1, round: 2, status: "resolved", result: result("team_1") },
        { id: "gp_3", name: "GP 3", season: 2, round: 1, status: "resolved", result: result("team_2", "team_1") }
      ])
    );

    expect(wins.get("team_1")).toBe(1);
    expect(wins.has("team_2")).toBe(false);
  });
});

describe("startingGrid", () => {
  it("orders best qualifying times first and falls back to team order", () => {
    const state = stateWithHistory([]);
    state.teams = [
      { id: "team_1", name: "One", kind: "human", points: 0, credits: 0, cards: [], livery: { primary: "#111111", secondary: "#eeeeee" }, ready: true },
      { id: "team_2", name: "Two", kind: "bot", points: 0, credits: 0, cards: [], livery: { primary: "#222222", secondary: "#eeeeee" }, ready: true },
      { id: "team_3", name: "Three", kind: "bot", points: 0, credits: 0, cards: [], livery: { primary: "#333333", secondary: "#eeeeee" }, ready: true }
    ];
    state.currentGrandPrix.qualifyingRuns = [
      {
        teamId: "team_1",
        attempts: 1,
        time: 80,
        decision: { approach: "balanced", preparation: "speed" },
        result: result("team_1"),
        createdAt: "2026-07-15T10:00:00.000Z"
      },
      {
        teamId: "team_2",
        attempts: 1,
        time: 79,
        decision: { approach: "balanced", preparation: "speed" },
        result: result("team_2"),
        createdAt: "2026-07-15T10:01:00.000Z"
      },
      {
        teamId: "team_1",
        attempts: 2,
        time: 78,
        decision: { approach: "balanced", preparation: "speed" },
        result: result("team_1"),
        createdAt: "2026-07-15T10:02:00.000Z"
      }
    ];

    expect(startingGrid(state).map((entry) => [entry.position, entry.team.id, entry.bestTime])).toEqual([
      [1, "team_1", 78],
      [2, "team_2", 79],
      [3, "team_3", undefined]
    ]);
  });
});

describe("seasonStandings", () => {
  it("sums resolved GP points by season and ignores missing results", () => {
    const state = stateWithHistory([
      { id: "s1_gp1", name: "Season 1 GP 1", season: 1, round: 1, status: "resolved", result: result("team_1") },
      { id: "s1_gp2", name: "Season 1 GP 2", season: 1, round: 2, status: "resolved", result: result("team_2", "team_1") },
      { id: "s2_gp1", name: "Season 2 GP 1", season: 2, round: 1, status: "resolved", result: result("team_2", "team_1") },
      { id: "s2_gp2", name: "Season 2 GP 2", season: 2, round: 2, status: "briefing", result: null }
    ]);
    state.currentGrandPrix.season = 3;
    state.teams = [
      { id: "team_1", name: "One", kind: "human", points: 0, credits: 0, cards: [], livery: { primary: "#111111", secondary: "#eeeeee" }, ready: true },
      { id: "team_2", name: "Two", kind: "bot", points: 0, credits: 0, cards: [], livery: { primary: "#222222", secondary: "#eeeeee" }, ready: true },
      { id: "team_3", name: "Three", kind: "bot", points: 0, credits: 0, cards: [], livery: { primary: "#333333", secondary: "#eeeeee" }, ready: true }
    ];

    expect(seasonStandings(state, 1).map((entry) => [entry.position, entry.teamId, entry.points])).toEqual([
      [1, "team_1", 43],
      [2, "team_2", 43],
      [3, "team_3", 0]
    ]);
    expect(seasonStandings(state, 2).map((entry) => [entry.position, entry.teamId, entry.points])).toEqual([
      [1, "team_2", 25],
      [2, "team_1", 18],
      [3, "team_3", 0]
    ]);
    expect(completedSeasonSummaries(state).map((summary) => [summary.season, summary.champion.teamId, summary.gpCount])).toEqual([
      [2, "team_2", 1],
      [1, "team_1", 2]
    ]);
  });
});

describe("raceRecapCards", () => {
  it("uses the player's most impactful card event and next circuit identity", () => {
    const state = stateWithHistory([]);
    state.league.maxGrandPrixPerSeason = 3;
    state.currentGrandPrix.round = 1;
    const race = result("team_1");
    race.seed = "card-rain";
    race.events = [
      {
        id: "evt_card",
        order: 1,
        segment: "mid",
        lap: 3,
        type: "card_triggered",
        teamId: "team_1",
        cardId: "rain_grip",
        severity: "major",
        positionDelta: 2,
        tags: ["card"],
        replayText: "",
        reportText: ""
      }
    ];

    const recap = raceRecapCards(race, state, "team_1", { teamId: "team_1", approach: "aggressive", preparation: "weather", cardId: "rain_grip" }, "Test GP", (key, params) =>
      t(key, "en", params)
    );

    expect(recap.difference).toContain("Rain Grip");
    expect(recap.difference).toContain("+2");
    expect(recap.directive).toContain("Rain Grip");
    expect(recap.lesson).toContain(expectedNextCircuitName());
  });

  it("falls back gracefully for a quiet race", () => {
    const state = stateWithHistory([]);
    const recap = raceRecapCards(result("team_1"), state, "team_1", { teamId: "team_1", approach: "balanced", preparation: "speed", cardId: null }, "Test GP", (key, params) =>
      t(key, "en", params)
    );

    expect(recap.difference).toContain("Test GP");
    expect(recap.directive).toContain("kept you level");
    expect(recap.lesson).toContain(expectedNextCircuitName());
  });

  it("does not count a rival card as the player's card lesson", () => {
    const state = stateWithHistory([]);
    const race = result("team_1");
    race.events = [
      {
        id: "evt_rival",
        order: 1,
        segment: "late",
        lap: 4,
        type: "card_triggered",
        teamId: "team_2",
        relatedTeamId: "team_1",
        cardId: "rain_grip",
        severity: "major",
        positionDelta: 1,
        tags: ["card"],
        replayText: "",
        reportText: ""
      }
    ];

    const recap = raceRecapCards(race, state, "team_1", { teamId: "team_1", approach: "balanced", preparation: "weather", cardId: "rain_grip" }, "Test GP", (key, params) =>
      t(key, "en", params)
    );

    expect(recap.lesson).not.toContain("Rain Grip");
  });
});

describe("clampNumber", () => {
  it("keeps in-range values unchanged", () => {
    expect(clampNumber(8, 2, 16)).toBe(8);
  });

  it("clamps values below and above the bounds", () => {
    expect(clampNumber(0, 2, 16)).toBe(2);
    expect(clampNumber(99, 2, 16)).toBe(16);
  });

  it("falls back to the minimum for non-finite values", () => {
    expect(clampNumber(Number.NaN, 2, 16)).toBe(2);
    expect(clampNumber(Number.POSITIVE_INFINITY, 1, 18)).toBe(1);
  });
});
