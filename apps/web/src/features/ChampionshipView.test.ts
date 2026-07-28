// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { CITY_CIRCUITS } from "../app/circuits.js";
import { baseState } from "../app/App.testFixtures.js";
import type { LeagueState } from "../app/types.js";
import { t } from "../i18n/index.js";
import { ChampionshipView, COUNTRY_REGION } from "./ChampionshipView.js";

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

describe("ChampionshipView rival marker", () => {
  it("marks the player's derived rival in standings", () => {
    const state = {
      ...(baseState as unknown as LeagueState),
      teams: [
        { ...(baseState.teams[0] as LeagueState["teams"][number]), id: "team_1", name: "Volt Union", points: 18 },
        { ...(baseState.teams[1] as LeagueState["teams"][number]), id: "team_2", name: "Mika Blitz", points: 15 }
      ]
    } satisfies LeagueState;

    render(createElement(ChampionshipView, {
      state,
      playerTeamId: "team_1",
      recordTab: "standings",
      onReplayGrandPrix: () => undefined,
      onOpenSeasonRecap: () => undefined,
      onSelectRecordTab: () => undefined,
      tt: (key, params) => t(key, "en", params)
    }));

    expect(screen.getByText("Rival · 3 pts")).toBeTruthy();
  });
});
