import { describe, expect, it } from "vitest";
import { circuitStatsForTeam, layoutKeyForRound, normalizeCircuitRecords, withCircuitRecord } from "./circuitStats.js";
import type { LeagueState } from "./league.js";

const LEAGUE_ID = "league_stats";

function classification(winnerId: string, playerPosition: number) {
  return [
    { teamId: winnerId, teamName: "Winner", position: 1, points: 25, credits: 100, score: 90, positionChange: 0, status: "finished" as const, resultTags: [] },
    { teamId: "team_1", teamName: "Volt Union", position: playerPosition, points: 10, credits: 60, score: 70, positionChange: 0, status: "finished" as const, resultTags: [] }
  ].filter((entry, index, all) => index === 0 || entry.teamId !== all[0]!.teamId);
}

function stateWith(
  history: Array<{ season: number; round: number; winnerId: string; playerPosition: number }>,
  records: Record<string, number> = {},
  liveRuns: Array<{ teamId: string; time: number }> = []
) {
  return {
    league: { id: LEAGUE_ID },
    currentGrandPrix: { season: 1, round: 1, qualifyingRuns: liveRuns },
    teams: [{ id: "team_1", circuitRecords: records }],
    grandPrixHistory: history.map((entry) => ({
      id: `gp-${entry.season}-${entry.round}`,
      name: "GP",
      season: entry.season,
      round: entry.round,
      status: "resolved",
      result: { classification: classification(entry.winnerId, entry.playerPosition) }
    }))
  } as unknown as LeagueState;
}

describe("circuitStatsForTeam", () => {
  it("counts races, wins and the best finish per layout", () => {
    const roundOne = layoutKeyForRound(LEAGUE_ID, 1, 1);
    const state = stateWith([
      { season: 1, round: 1, winnerId: "team_1", playerPosition: 1 },
      { season: 2, round: 1, winnerId: "team_2", playerPosition: 4 }
    ]);

    const stats = circuitStatsForTeam(state, "team_1").get(roundOne)!;

    // Season 2 round 1 lands on a different layout: the seed changes with the season.
    expect(stats.races).toBe(1);
    expect(stats.wins).toBe(1);
    expect(stats.bestFinish).toBe(1);
  });

  it("keeps the best finish across several visits to the same layout", () => {
    const layout = layoutKeyForRound(LEAGUE_ID, 1, 2);
    const state = stateWith([
      { season: 1, round: 2, winnerId: "team_2", playerPosition: 5 },
      { season: 1, round: 2, winnerId: "team_1", playerPosition: 1 }
    ]);

    const stats = circuitStatsForTeam(state, "team_1").get(layout)!;

    expect(stats.races).toBe(2);
    expect(stats.wins).toBe(1);
    expect(stats.bestFinish).toBe(1);
  });

  it("surfaces a stored time on a layout with no finished race", () => {
    const state = stateWith([], { circuit_battery: 88.5 });

    const stats = circuitStatsForTeam(state, "team_1").get("circuit_battery")!;

    expect(stats.bestTime).toBe(88.5);
    expect(stats.races).toBe(0);
  });

  it("returns nothing for an unknown team", () => {
    expect(circuitStatsForTeam(stateWith([]), undefined).size).toBe(0);
  });
});

describe("live qualifying runs", () => {
  it("reads the current Grand Prix runs when no record is stored yet", () => {
    // A league created before the record column: history still yields the wins, and the runs
    // sitting on the current Grand Prix still yield its time.
    const state = stateWith([{ season: 1, round: 1, winnerId: "team_1", playerPosition: 1 }], {}, [
      { teamId: "team_1", time: 91.4 },
      { teamId: "team_1", time: 90.2 },
      { teamId: "team_2", time: 80.1 }
    ]);

    const stats = circuitStatsForTeam(state, "team_1").get(layoutKeyForRound(LEAGUE_ID, 1, 1))!;

    expect(stats.wins).toBe(1);
    expect(stats.bestTime).toBe(90.2);
  });

  it("keeps the faster of the stored record and the live runs", () => {
    const layout = layoutKeyForRound(LEAGUE_ID, 1, 1);
    const state = stateWith([], { [layout]: 88 }, [{ teamId: "team_1", time: 92 }]);

    expect(circuitStatsForTeam(state, "team_1").get(layout)!.bestTime).toBe(88);
  });
});

describe("withCircuitRecord", () => {
  it("keeps the faster time and leaves the map untouched otherwise", () => {
    const records = { circuit_battery: 90 };

    expect(withCircuitRecord(records, "circuit_battery", 88).circuit_battery).toBe(88);
    expect(withCircuitRecord(records, "circuit_battery", 92)).toBe(records);
    expect(withCircuitRecord(records, "circuit_bund", 95).circuit_bund).toBe(95);
  });
});

describe("normalizeCircuitRecords", () => {
  it("drops anything that is not a usable time", () => {
    expect(normalizeCircuitRecords({ a: 12, b: "nope", c: -1, d: Number.NaN })).toEqual({ a: 12 });
    expect(normalizeCircuitRecords(null)).toEqual({});
    expect(normalizeCircuitRecords([1, 2])).toEqual({});
  });
});
