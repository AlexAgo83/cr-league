import { describe, expect, it } from "vitest";
import { seasonWinsByTeamId, startingGrid } from "./helpers.js";
import type { LeagueState } from "./types.js";
import type { RaceResult } from "@cr-league/shared";

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
