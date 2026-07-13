import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App.js";

const baseState = {
  league: {
    id: "league_1",
    name: "Office League",
    code: "ABC123",
    status: "active",
    cadence: "manual",
    preparationDeadlineAt: null
  },
  currentGrandPrix: {
    id: "gp_1",
    name: "Silver Ridge GP",
    round: 1,
    status: "briefing",
    result: null
  },
  grandPrixHistory: [
    {
      id: "gp_1",
      name: "Silver Ridge GP",
      round: 1,
      status: "briefing",
      result: null
    }
  ],
  teams: [
    {
      id: "team_1",
      name: "Circle One",
      kind: "human",
      points: 0,
      credits: 0,
      ready: false
    },
    {
      id: "team_2",
      name: "Mika Blitz",
      kind: "bot",
      points: 0,
      credits: 0,
      ready: false
    }
  ],
  actionState: {
    submittedTeamIds: [],
    missingTeamIds: ["team_1", "team_2"],
    canResolve: false,
    canStartNextGrandPrix: false,
    nextAction: "wait_for_directives"
  },
  player: {
    teamId: "team_1",
    claimCode: "CLAIM123"
  },
  decisions: []
};

const decidedState = {
  ...baseState,
  actionState: {
    submittedTeamIds: ["team_1"],
    missingTeamIds: ["team_2"],
    canResolve: true,
    canStartNextGrandPrix: false,
    nextAction: "resolve_grand_prix"
  },
  decisions: [
    {
      teamId: "team_1",
      approach: "balanced",
      preparation: "weather",
      cardId: "rain_grip",
      rivalTeamId: null
    }
  ]
};

const resolvedState = {
  ...decidedState,
  actionState: {
    submittedTeamIds: ["team_1"],
    missingTeamIds: [],
    canResolve: false,
    canStartNextGrandPrix: true,
    nextAction: "start_next_grand_prix"
  },
  currentGrandPrix: {
    ...baseState.currentGrandPrix,
    status: "resolved",
    result: {
      grandPrixName: "Silver Ridge GP",
      seed: "silver-ridge-001",
      resolvedWeather: {
        start: "dry",
        early: "dry",
        mid: "light_rain",
        late: "light_rain",
        finish: "light_rain"
      },
      classification: [
        {
          position: 1,
          teamId: "team_1",
          teamName: "Circle One",
          points: 25,
          credits: 150,
          positionChange: 1,
          status: "finished",
          resultTags: ["weather_gamble"]
        }
      ],
      events: [
        {
          id: "evt_001",
          order: 0,
          segment: "mid",
          lap: 5,
          type: "weather_gamble_paid",
          teamId: "team_1",
          cardId: "rain_grip",
          severity: "major",
          positionDelta: 2,
          tags: ["card", "weather"],
          replayText: "Rain Grip triggers for Circle One",
          reportText: "Circle One called the rain correctly."
        }
      ],
      consumedCards: [{ teamId: "team_1", cardId: "rain_grip" }],
      report: {
        headline: "Silver Ridge GP: Circle One wins.",
        blocks: [{ title: "Key moments", body: "Circle One called the rain correctly." }]
      }
    }
  },
  teams: [
    {
      id: "team_1",
      name: "Circle One",
      kind: "human",
      points: 25,
      credits: 150,
      ready: true
    }
  ]
};

const nextGrandPrixState = {
  ...baseState,
  currentGrandPrix: {
    ...baseState.currentGrandPrix,
    id: "gp_2",
    round: 2
  },
  grandPrixHistory: [
    {
      id: "gp_2",
      name: "Silver Ridge GP",
      round: 2,
      status: "briefing",
      result: null
    },
    ...baseState.grandPrixHistory
  ]
};

const settingsState = {
  ...baseState,
  league: {
    ...baseState.league,
    cadence: "weekly",
    preparationDeadlineAt: "2026-07-15T10:00:00.000Z"
  }
};

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("App", () => {
  it("plays through the demo league flow", async () => {
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(response(baseState))
      .mockResolvedValueOnce(response(decidedState))
      .mockResolvedValueOnce(response(resolvedState))
      .mockResolvedValueOnce(response(nextGrandPrixState))
      .mockResolvedValueOnce(response(settingsState));

    render(<App />);

    expect(screen.getByRole("heading", { name: "CR League" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Create league" }));
    expect(await screen.findByText("Code ABC123 · Round 1 · briefing")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "My team" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Current GP" })).toBeTruthy();
    expect(screen.getByText("0 ready · 2 missing")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Submit directive" }));
    expect(await screen.findByText("Directive locked. You can launch the Grand Prix.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Launch GP" }));
    expect(await screen.findByText("Silver Ridge GP: Circle One wins.")).toBeTruthy();
    expect(screen.getByText("Lap 5")).toBeTruthy();
    expect(screen.getByText("Rain Grip triggers for Circle One")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Submit directive" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Launch GP" }).hasAttribute("disabled")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Next GP" }));
    expect(await screen.findByText("Code ABC123 · Round 2 · briefing")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Cadence"), { target: { value: "weekly" } });
    fireEvent.click(screen.getByRole("button", { name: "Update settings" }));
    expect(await screen.findByText("League settings updated.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Forget team" }));
    expect(screen.getByText("Team claim forgotten.")).toBeTruthy();
    expect(localStorage.getItem("cr-league-player-claim")).toBe(null);
    expect(fetch).toHaveBeenCalledTimes(5);
  });

  it("joins a league by code", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState));

    render(<App />);

    fireEvent.change(screen.getByLabelText("Join code"), { target: { value: "abc123" } });
    fireEvent.click(screen.getByRole("button", { name: "Join league" }));

    expect(await screen.findByText("Code ABC123 · Round 1 · briefing")).toBeTruthy();
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:4874/leagues/join",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          code: "ABC123",
          teamName: "Circle One"
        })
      })
    );
    expect(localStorage.getItem("cr-league-player-claim")).toBe(JSON.stringify(baseState.player));
  });

  it("rejoins a saved player claim", async () => {
    localStorage.setItem("cr-league-player-claim", JSON.stringify(baseState.player));
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState));

    render(<App />);

    expect(await screen.findByText("League rejoined.")).toBeTruthy();
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:4874/leagues/rejoin",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(baseState.player)
      })
    );
  });
});

function response(body: unknown) {
  return {
    ok: true,
    json: async () => body
  } as Response;
}
