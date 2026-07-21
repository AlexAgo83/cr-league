import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { RaceResult } from "@cr-league/shared";
import { circuitForRound } from "../app/circuits.js";
import { baseState } from "../app/App.testFixtures.js";
import type { LeagueState } from "../app/types.js";
import { t } from "../i18n/index.js";
import { ReportView } from "./ReportView.js";

describe("ReportView", () => {
  it("integrates the race verdict into the race recap", () => {
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

    const recap = screen.getByRole("heading", { name: "Race recap" }).closest("section")!;
    expect(container.querySelector(".report-verdict")).toBe(null);
    expect(recap.textContent).toContain("Verdict:");
    expect(recap.textContent).toContain("Rain Grip");
  });

  it("maps GP event laps to the circuit lap count without using the chrono scale", () => {
    const typedBaseState = baseState as unknown as LeagueState;
    const state = {
      ...typedBaseState,
      currentGrandPrix: { ...typedBaseState.currentGrandPrix, trackLengthMeters: 6100, round: 15 },
      decisions: [{ teamId: "team_1", approach: "balanced", preparation: "weather", cardId: null }]
    } satisfies LeagueState;
    const circuit = { ...circuitForRound(1), laps: 3 };
    const result: RaceResult = {
      grandPrixName: "Short GP",
      seed: "short",
      resolvedWeather: { start: "dry", early: "dry", mid: "heavy_rain", late: "heavy_rain", finish: "heavy_rain" },
      classification: [
        { teamId: "team_1", teamName: "Volt Union", position: 1, points: 25, credits: 100, score: 90, positionChange: 0, status: "finished", resultTags: [] },
        { teamId: "team_2", teamName: "Mika Blitz", position: 2, points: 18, credits: 80, score: 80, positionChange: 0, status: "finished", resultTags: [] }
      ],
      events: [
        { id: "weather", order: 1, segment: "mid", lap: 5, traceProgress: 0.5, type: "weather_change", teamId: "team_2", severity: "major", positionDelta: 0, tags: ["weather"], replayText: "", reportText: "" },
        { id: "finish", order: 2, segment: "finish", lap: 10, traceProgress: 1, type: "held_position", teamId: "team_1", severity: "major", positionDelta: 0, tags: ["finish"], replayText: "", reportText: "" }
      ],
      consumedCards: [],
      report: { headline: "Test", blocks: [] }
    };

    const { container } = render(<ReportView state={state} result={result} circuit={circuit} playerTeamId="team_1" playerDecision={state.decisions[0]} tt={(key, params) => t(key, "en", params)} />);

    expect(screen.queryByText("Lap 5")).toBe(null);
    expect(screen.queryByText("Lap 10")).toBe(null);
    expect(screen.getAllByText("Lap 3").length).toBeGreaterThan(0);
    expect(container.textContent?.toLowerCase()).toContain("lap 3");
    expect(container.textContent?.toLowerCase()).not.toContain("lap 5");
    expect(container.textContent?.toLowerCase()).not.toContain("lap 10");
  });

  it("deduplicates same-lap key moment types and prefers event variety", () => {
    const typedBaseState = baseState as unknown as LeagueState;
    const state = {
      ...typedBaseState,
      decisions: [{ teamId: "team_1", approach: "balanced", preparation: "weather", cardId: null }]
    } satisfies LeagueState;
    const event = (id: string, order: number, type: RaceResult["events"][number]["type"], teamId: string, lap: number): RaceResult["events"][number] => ({
      id,
      order,
      segment: "mid",
      lap,
      traceProgress: lap / 10,
      type,
      teamId,
      severity: "major",
      positionDelta: type === "held_position" ? 0 : -1,
      tags: [],
      replayText: "",
      reportText: ""
    });
    const result: RaceResult = {
      grandPrixName: "Variety GP",
      seed: "variety",
      resolvedWeather: { start: "dry", early: "dry", mid: "dry", late: "dry", finish: "dry" },
      classification: [
        { teamId: "team_1", teamName: "Volt Union", position: 1, points: 25, credits: 100, score: 90, positionChange: 0, status: "finished", resultTags: [] },
        { teamId: "team_2", teamName: "Mika Blitz", position: 2, points: 18, credits: 80, score: 80, positionChange: 0, status: "finished", resultTags: [] },
        { teamId: "team_3", teamName: "Apex Lab", position: 3, points: 15, credits: 70, score: 70, positionChange: 0, status: "finished", resultTags: [] }
      ],
      events: [
        event("scare-1", 1, "mechanical_scare", "team_1", 5),
        event("scare-2", 2, "mechanical_scare", "team_2", 5),
        event("scare-3", 3, "mechanical_scare", "team_3", 5),
        event("weather", 4, "weather_change", "team_2", 6),
        event("hold", 5, "held_position", "team_1", 7),
        event("overtake", 6, "rival_overtake", "team_3", 8)
      ],
      consumedCards: [],
      report: { headline: "Test", blocks: [] }
    };

    const { container } = render(<ReportView state={state} result={result} circuit={circuitForRound(1)} playerTeamId="team_1" playerDecision={state.decisions[0]} tt={(key, params) => t(key, "en", params)} />);
    const moments = container.querySelectorAll(".report-key-moments li");
    const keyMomentText = container.querySelector(".report-key-moments")?.textContent ?? "";

    expect(moments).toHaveLength(4);
    expect(keyMomentText.match(/mechanical scare/g)?.length).toBe(1);
    expect(keyMomentText).toContain("The weather changes during the race");
    expect(keyMomentText).toContain("holds position");
    expect(keyMomentText).toContain("makes a key overtake");
  });

  it("surfaces honest non-winning feedback", () => {
    const typedBaseState = baseState as unknown as LeagueState;
    const state = {
      ...typedBaseState,
      decisions: [{ teamId: "team_1", approach: "prudent", preparation: "reliability", cardId: null }]
    } satisfies LeagueState;
    const result: RaceResult = {
      grandPrixName: "Hold GP",
      seed: "hold",
      resolvedWeather: { start: "dry", early: "dry", mid: "dry", late: "dry", finish: "dry" },
      classification: [
        { teamId: "team_2", teamName: "Mika Blitz", position: 1, points: 25, credits: 100, score: 90, positionChange: 1, status: "finished", resultTags: [] },
        { teamId: "team_1", teamName: "Volt Union", position: 5, points: 10, credits: 60, score: 70, positionChange: 0, status: "finished", resultTags: [] }
      ],
      events: [],
      consumedCards: [],
      report: { headline: "Test", blocks: [] }
    };

    const { container } = render(<ReportView state={state} result={result} circuit={circuitForRound(1)} playerTeamId="team_1" playerDecision={state.decisions[0]} tt={(key, params) => t(key, "en", params)} />);

    const recap = container.querySelector(".report-side-recap") as HTMLElement;
    expect(recap.textContent).toContain("Useful result");
    expect(recap.textContent).toContain("protected track position");
  });
});
