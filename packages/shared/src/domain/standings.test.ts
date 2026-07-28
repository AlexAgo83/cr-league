import { describe, expect, it } from "vitest";
import type { LeagueState } from "./league.js";
import { seasonStandings, standingsRival } from "./standings.js";

const team = (id: string, name: string, points: number) => ({
  id,
  name,
  kind: "human",
  points,
  credits: 0,
  cards: [],
  livery: { primary: "#000000", secondary: "#ffffff" },
  unlockedCarAssetIds: [],
  ready: false
});

const state = (teams: ReturnType<typeof team>[], history: LeagueState["grandPrixHistory"] = []) =>
  ({ teams, grandPrixHistory: history } as unknown as LeagueState);

const finished = (season: number, classification: Array<{ teamId: string; teamName: string; points: number }>) =>
  ({ id: `gp_${season}`, name: "GP", season, round: 1, status: "resolved", result: { classification } }) as unknown as LeagueState["grandPrixHistory"][number];

describe("seasonStandings", () => {
  it("counts only the requested season and prefers the classification's team name", () => {
    const standings = seasonStandings(
      state([team("a", "Alpha", 0), team("b", "Bravo", 0)], [finished(1, [{ teamId: "a", teamName: "Alpha Renamed", points: 25 }]), finished(2, [{ teamId: "b", teamName: "Bravo", points: 18 }])]),
      1
    );

    expect(standings.map((entry) => [entry.position, entry.teamId, entry.teamName, entry.points])).toEqual([
      [1, "a", "Alpha Renamed", 25],
      [2, "b", "Bravo", 0]
    ]);
  });

  it("breaks a points tie on the league's team order, then on team name", () => {
    const tied = seasonStandings(state([team("b", "Bravo", 0), team("a", "Alpha", 0)]), 1);

    expect(tied.map((entry) => entry.teamId)).toEqual(["b", "a"]);
  });

  it("keeps a scorer that is no longer in the league's team list, without a livery", () => {
    const standings = seasonStandings(state([], [finished(1, [{ teamId: "ghost", teamName: "Ghost", points: 10 }])]), 1);

    expect(standings[0]).toMatchObject({ teamId: "ghost", teamName: "Ghost", points: 10, livery: undefined });
  });
});

describe("standingsRival", () => {
  it("returns nothing without a team, or while every team is still on zero points", () => {
    expect(standingsRival(state([team("a", "Alpha", 5)]), undefined)).toBe(null);
    expect(standingsRival(state([team("a", "Alpha", 0), team("b", "Bravo", 0)]), "a")).toBe(null);
  });

  it("returns nothing for an unknown team or when nobody else is in the league", () => {
    expect(standingsRival(state([team("a", "Alpha", 5)]), "ghost")).toBe(null);
    expect(standingsRival(state([team("a", "Alpha", 5)]), "a")).toBe(null);
  });

  it("picks the closest team by standings position, then by points, then by id", () => {
    const rival = standingsRival(state([team("a", "Alpha", 10), team("b", "Bravo", 9), team("c", "Charlie", 1)]), "a");

    expect(rival).toMatchObject({ teamId: "b", position: 2, points: 9, pointsGap: 1 });
  });

  it("prefers the smaller points gap when two rivals are equally distant in position", () => {
    const rival = standingsRival(state([team("a", "Alpha", 20), team("b", "Bravo", 12), team("c", "Charlie", 11)]), "b");

    expect(rival?.teamId).toBe("c");
  });
});
