import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
    primaryTrait: "fast",
    secondaryTrait: "weather_sensitive",
    forecast: {
      dry: 60,
      light_rain: 30,
      heavy_rain: 10
    },
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
      cards: ["rain_grip"],
      ready: false
    },
    {
      id: "team_2",
      name: "Mika Blitz",
      kind: "bot",
      points: 0,
      credits: 0,
      cards: [],
      ready: false
    }
  ],
  cardShop: [
    { cardId: "rain_grip", price: 100 },
    { cardId: "launch_boost", price: 100 }
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
        },
        {
          position: 2,
          teamId: "team_2",
          teamName: "Mika Blitz",
          points: 18,
          credits: 100,
          positionChange: -1,
          status: "finished",
          resultTags: []
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
      cards: [],
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
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("App", () => {
  it("switches the interface language", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Language"), { target: { value: "fr" } });

    expect(screen.getByRole("button", { name: "Rejoindre" })).toBeTruthy();
    expect(screen.getByText("Stand de course")).toBeTruthy();
    expect(localStorage.getItem("cr-league-language")).toBe("fr");
  });

  it("plays through the demo league flow", async () => {
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(response(baseState))
      .mockResolvedValueOnce(response(decidedState))
      .mockResolvedValueOnce(response(resolvedState))
      .mockResolvedValueOnce(response(nextGrandPrixState))
      .mockResolvedValueOnce(response(settingsState))
      .mockResolvedValueOnce(response(baseState));
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<App />);

    expect(screen.getByRole("heading", { name: "CR League" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Create league" }));
    expect(await screen.findByText("ABC123")).toBeTruthy();
    expect(screen.getAllByText("Round 1").length).toBeGreaterThan(0);
    expect(screen.getByText("Pit wall")).toBeTruthy();
    expect(screen.getByText("Prepare")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "My team" })).toBeTruthy();
    expect(screen.getByText("Current GP")).toBeTruthy();
    expect(screen.getAllByText("Fast").length).toBeGreaterThan(0);
    expect(screen.getByText("Weather sensitive")).toBeTruthy();
    expect(screen.getByText("Stronger if rain arrives, weaker if it stays dry.")).toBeTruthy();
    expect(screen.getAllByText("Rain Grip").length).toBeGreaterThan(0);
    expect(screen.getByText("0/2")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Submit directive" }));
    expect(await screen.findByText("Directive locked. You can launch the Grand Prix.")).toBeTruthy();
    expect(screen.getByText("Ready to launch")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Launch GP" }));
    expect(await screen.findByText("Silver Ridge GP: Circle One wins.")).toBeTruthy();
    expect(screen.getByText("Race resolved")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Race recap" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Race replay" })).toBeTruthy();
    expect(screen.getByText("Winner")).toBeTruthy();
    expect(screen.getAllByText("Docklands Sprint").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Speed x2" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "What made the difference" })).toBeTruthy();
    expect(screen.getByText("Balanced · Weather · Rain Grip")).toBeTruthy();
    expect(screen.getByText("Your card shaped the race. Keep one for moments where the track or forecast clearly matches it.")).toBeTruthy();
    expect(document.querySelector(".replay-timeline")?.textContent).toContain("Lap 5");
    expect(screen.getByText("Key event")).toBeTruthy();
    expect(document.querySelector(".replay-timeline")?.textContent).toContain("Rain Grip triggers for Circle One");
    expect(screen.getByText("Last GP")).toBeTruthy();
    expect(screen.getByText("+150 credits · +25 pts")).toBeTruthy();
    expect(screen.getByText("Consumed Rain Grip")).toBeTruthy();
    expect(screen.getByText("No cards in inventory.")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Recommended offers" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Submit directive" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Launch GP" }).hasAttribute("disabled")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Next GP" }));
    expect((await screen.findAllByText("Round 2")).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Restart session" })).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Cadence"), { target: { value: "weekly" } });
    fireEvent.click(screen.getByRole("button", { name: "Update settings" }));
    expect(await screen.findByText("League settings updated.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Restart session" }));
    expect(await screen.findByText("Playtest session restarted.")).toBeTruthy();
    expect(screen.getAllByText("Round 1").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Forget team" }));
    expect(screen.getByText("Team claim forgotten.")).toBeTruthy();
    expect(localStorage.getItem("cr-league-player-claim")).toBe(null);
    expect(fetch).toHaveBeenCalledTimes(6);
  });

  it("shows a replay empty state when a resolved race has no events", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      response({
        ...resolvedState,
        currentGrandPrix: {
          ...resolvedState.currentGrandPrix,
          result: {
            ...resolvedState.currentGrandPrix.result,
            events: []
          }
        }
      })
    );

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Create league" }));

    expect(await screen.findByRole("heading", { name: "Race replay" })).toBeTruthy();
    expect(screen.getByText("No replay events were recorded for this GP.")).toBeTruthy();
  });

  it("joins a league by code", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState));

    render(<App />);

    fireEvent.change(screen.getByLabelText("Join code"), { target: { value: "abc123" } });
    fireEvent.click(screen.getByRole("button", { name: "Join league" }));

    expect(await screen.findByText("ABC123")).toBeTruthy();
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

  it("clears a stale saved player claim", async () => {
    localStorage.setItem("cr-league-player-claim", JSON.stringify(baseState.player));
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Team claim not found." }), {
        status: 404,
        headers: { "content-type": "application/json" }
      })
    );

    render(<App />);

    expect(await screen.findByText("Saved league no longer exists. Join the playtest again.")).toBeTruthy();
    expect(localStorage.getItem("cr-league-player-claim")).toBe(null);
    expect(screen.getByRole("button", { name: "Join league" })).toBeTruthy();
  });
});

function response(body: unknown) {
  return {
    ok: true,
    json: async () => body
  } as Response;
}
