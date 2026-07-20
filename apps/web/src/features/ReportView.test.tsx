import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { RaceResult } from "@cr-league/shared";
import { circuitForRound } from "../app/circuits.js";
import { baseState } from "../app/App.testFixtures.js";
import type { LeagueState } from "../app/types.js";
import { t } from "../i18n/index.js";
import { ReportView } from "./ReportView.js";

describe("ReportView", () => {
  it("renders the race verdict above report phases", () => {
    const typedBaseState = baseState as unknown as LeagueState;
    const state = {
      ...typedBaseState,
      currentGrandPrix: { ...typedBaseState.currentGrandPrix, trackLengthMeters: 3200 },
      decisions: [{ teamId: "team_1", approach: "aggressive", preparation: "weather", cardId: "rain_grip" }]
    } satisfies LeagueState;
    const result: RaceResult = {
      grandPrixName: "Test GP",
      seed: "a",
      resolvedWeather: { start: "dry", early: "dry", mid: "light_rain", late: "light_rain", finish: "dry" },
      classification: [
        { teamId: "team_1", teamName: "Volt Union", position: 1, points: 25, credits: 100, score: 90, positionChange: 2, status: "finished", resultTags: [] },
        { teamId: "team_2", teamName: "Mika Blitz", position: 2, points: 18, credits: 80, score: 80, positionChange: -1, status: "finished", resultTags: [] }
      ],
      events: [
        {
          id: "card",
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
      ],
      consumedCards: [],
      report: { headline: "Test", blocks: [] }
    };
    const { container } = render(
      <ReportView
        state={state}
        result={result}
        circuit={circuitForRound(1)}
        playerTeamId="team_1"
        playerDecision={state.decisions[0]}
        tt={(key, params) => t(key, "en", params)}
      />
    );

    expect(screen.getByLabelText("Race verdict").textContent).toContain("Verdict:");
    expect(screen.getByLabelText("Race verdict").textContent).toContain("Rain Grip");
    expect(container.querySelector(".report-verdict")!.compareDocumentPosition(container.querySelector(".report-phases")!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
