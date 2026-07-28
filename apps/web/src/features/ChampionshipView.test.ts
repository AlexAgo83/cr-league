import { renderWithT } from "../testRender.js";
// @vitest-environment jsdom

import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { CITY_CIRCUITS } from "../app/circuits.js";
import { baseState } from "../app/App.testFixtures.js";
import type { LeagueState } from "../app/types.js";
import { ChampionshipView, COUNTRY_REGION } from "./ChampionshipView.js";

afterEach(() => {
  cleanup();
});

describe("ChampionshipView circuit regions", () => {
  it("maps every catalog country to a world region", () => {
    const missing = [...new Set(CITY_CIRCUITS.map((circuit) => circuit.country))].filter((country) => !COUNTRY_REGION[country]);

    expect(missing).toEqual([]);
  });

  it("places new Iceland and Morocco circuits in the expected regions", () => {
    expect(COUNTRY_REGION.IS).toBe("europe");
    expect(COUNTRY_REGION.MA).toBe("africa");
  });
});

describe("ChampionshipView standings order", () => {
  it("ranks teams by points instead of trusting the array order", () => {
    const state = {
      ...(baseState as unknown as LeagueState),
      teams: [
        { ...(baseState.teams[0] as LeagueState["teams"][number]), id: "team_1", name: "Volt Union", points: 12 },
        { ...(baseState.teams[1] as LeagueState["teams"][number]), id: "team_2", name: "Mika Blitz", points: 40 }
      ]
    } satisfies LeagueState;

    renderWithT(createElement(ChampionshipView, {
      state,
      playerTeamId: "team_1",
      recordTab: "standings",
      onReplayGrandPrix: () => undefined,
      onOpenSeasonRecap: () => undefined,
      onSelectRecordTab: () => undefined
    }));

    const rows = screen.getAllByRole("listitem");
    expect(within(rows[0]!).getByText("Mika Blitz")).toBeTruthy();
    expect(within(rows[1]!).getByText("Volt Union")).toBeTruthy();
  });
});

describe("ChampionshipView rival marker", () => {
  it("marks the player's derived rival in standings", () => {
    const state = {
      ...(baseState as unknown as LeagueState),
      teams: [
        { ...(baseState.teams[0] as LeagueState["teams"][number]), id: "team_1", name: "Volt Union", points: 18 },
        { ...(baseState.teams[1] as LeagueState["teams"][number]), id: "team_2", name: "Mika Blitz", points: 15 }
      ]
    } satisfies LeagueState;

    renderWithT(createElement(ChampionshipView, {
      state,
      playerTeamId: "team_1",
      recordTab: "standings",
      onReplayGrandPrix: () => undefined,
      onOpenSeasonRecap: () => undefined,
      onSelectRecordTab: () => undefined
    }));

    expect(screen.getByText("Rival · 3 pts")).toBeTruthy();
  });

  it("opens an in-league team profile from standings", () => {
    const state = {
      ...(baseState as unknown as LeagueState),
      teams: [
        { ...(baseState.teams[0] as LeagueState["teams"][number]), id: "team_1", name: "Volt Union", points: 18, credits: 140 },
        { ...(baseState.teams[1] as LeagueState["teams"][number]), id: "team_2", name: "Mika Blitz", points: 15, credits: 120 }
      ],
      decisions: [{ teamId: "team_1", approach: "aggressive", preparation: "speed", pitStrategy: "standard", cardId: null, rivalTeamId: null }],
      grandPrixHistory: [
        {
          id: "gp_done",
          name: "Done GP",
          season: 1,
          round: 1,
          status: "resolved",
          result: {
            grandPrixName: "Done GP",
            seed: "done",
            resolvedWeather: { start: "dry", early: "dry", mid: "dry", late: "dry", finish: "dry" },
            classification: [
              { teamId: "team_1", teamName: "Volt Union", position: 2, points: 18, credits: 80, score: 80, positionChange: 0, status: "finished", resultTags: [] },
              { teamId: "team_2", teamName: "Mika Blitz", position: 3, points: 15, credits: 70, score: 70, positionChange: 0, status: "finished", resultTags: [] }
            ],
            events: [],
            consumedCards: [],
            report: { headline: "Done", blocks: [] }
          }
        }
      ]
    } satisfies LeagueState;

    renderWithT(createElement(ChampionshipView, {
      state,
      playerTeamId: "team_1",
      recordTab: "standings",
      onReplayGrandPrix: () => undefined,
      onOpenSeasonRecap: () => undefined,
      onSelectRecordTab: () => undefined
    }));

    fireEvent.click(screen.getByRole("button", { name: "View profile: Volt Union" }));

    const dialog = screen.getByRole("dialog", { name: "Volt Union profile" });
    expect(dialog).toBeTruthy();
    expect(within(dialog).getByText("Attack-leaning setup from recent directives.")).toBeTruthy();
    expect(within(dialog).getByText("Mika Blitz, 3 points away.")).toBeTruthy();
    expect(within(dialog).getByText("P2")).toBeTruthy();
  });

  it("renders unsafe team profile names as text", () => {
    const unsafeName = "<img src=x onerror=alert(1)>";
    const state = {
      ...(baseState as unknown as LeagueState),
      teams: [{ ...(baseState.teams[0] as LeagueState["teams"][number]), id: "team_1", name: unsafeName, points: 1 }]
    } satisfies LeagueState;
    const { container } = renderWithT(createElement(ChampionshipView, {
      state,
      playerTeamId: "team_1",
      recordTab: "standings",
      onReplayGrandPrix: () => undefined,
      onOpenSeasonRecap: () => undefined,
      onSelectRecordTab: () => undefined
    }));

    fireEvent.click(screen.getByRole("button", { name: `View profile: ${unsafeName}` }));

    expect(within(screen.getByRole("dialog", { name: `${unsafeName} profile` })).getByText(unsafeName)).toBeTruthy();
    expect(container.querySelector("img[src='x']")).toBe(null);
  });
});
