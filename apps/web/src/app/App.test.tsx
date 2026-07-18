import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App.js";

const baseState = {
  league: {
    id: "league_1",
    name: "Office League",
    code: "ABC123",
    status: "active",
    cadence: "manual",
    maxPlayers: 8,
    fillWithBots: true,
    qualifyingAttemptLimit: 3,
    maxGrandPrixPerSeason: 6,
    preparationDeadlineAt: null
  },
  currentGrandPrix: {
    id: "gp_1",
    name: "Silver Ridge GP",
    season: 1,
    round: 1,
    status: "briefing",
    primaryTrait: "fast",
    secondaryTrait: "weather_sensitive",
    forecast: {
      dry: 60,
      light_rain: 30,
      heavy_rain: 10
    },
    qualifyingRuns: [],
    result: null
  },
  grandPrixHistory: [
    {
      id: "gp_1",
      name: "Silver Ridge GP",
      season: 1,
      round: 1,
      status: "briefing",
      result: null
    }
  ],
  teams: [
    {
      id: "team_1",
      name: "Volt Union",
      kind: "human",
      points: 0,
      credits: 0,
      cards: ["rain_grip"],
      livery: { primary: "#16c784", secondary: "#38bdf8" },
      ready: false
    },
    {
      id: "team_2",
      name: "Mika Blitz",
      kind: "bot",
      points: 0,
      credits: 0,
      cards: [],
      livery: { primary: "#38bdf8", secondary: "#16c784" },
      ready: false
    }
  ],
  cardShop: [
    { cardId: "rain_grip", price: 100 },
    { cardId: "launch_boost", price: 100 },
    { cardId: "soft_tires", price: 100 },
    { cardId: "qualifying_focus", price: 100 },
    { cardId: "defensive_order", price: 100 }
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
  currentGrandPrix: {
    ...baseState.currentGrandPrix,
    qualifyingRuns: []
  },
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
          teamName: "Volt Union",
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
          replayText: "Rain Grip triggers for Volt Union",
          reportText: "Volt Union called the rain correctly."
        }
      ],
      consumedCards: [{ teamId: "team_1", cardId: "rain_grip" }],
      report: {
        headline: "Silver Ridge GP: Volt Union wins.",
        blocks: [{ title: "Key moments", body: "Volt Union called the rain correctly." }]
      }
    }
  },
  teams: [
    {
      id: "team_1",
      name: "Volt Union",
      kind: "human",
      points: 25,
      credits: 150,
      cards: [],
      livery: { primary: "#16c784", secondary: "#38bdf8" },
      ready: true
    }
  ]
};

const nextGrandPrixState = {
  ...baseState,
  currentGrandPrix: {
    ...baseState.currentGrandPrix,
    id: "gp_2",
    season: 1,
    round: 2
  },
  grandPrixHistory: [
    {
      ...baseState.grandPrixHistory[0],
      status: "resolved",
      result: resolvedState.currentGrandPrix.result
    },
    {
      id: "gp_2",
      name: "Silver Ridge GP",
      season: 1,
      round: 2,
      status: "briefing",
      result: null
    }
  ]
};

const seasonTwoState = {
  ...baseState,
  league: {
    ...baseState.league,
    maxGrandPrixPerSeason: 1
  },
  currentGrandPrix: {
    ...baseState.currentGrandPrix,
    id: "gp_2",
    season: 2,
    round: 1
  },
  grandPrixHistory: [
    {
      ...baseState.grandPrixHistory[0],
      status: "resolved",
      result: resolvedState.currentGrandPrix.result
    },
    {
      id: "gp_2",
      name: "Silver Ridge GP",
      season: 2,
      round: 1,
      status: "briefing",
      result: null
    }
  ]
};

const qualifyingRun = {
  teamId: "team_1",
  time: 72.42,
  lap: 2,
  attempts: 1,
  result: resolvedState.currentGrandPrix.result
};

const slowerQualifyingRun = {
  ...qualifyingRun,
  time: 75.18,
  lap: 1,
  attempts: 1
};

const rivalQualifyingRun = {
  ...qualifyingRun,
  teamId: "team_2",
  time: 68.33,
  lap: 1,
  attempts: 1
};

const qualifiedState = {
  ...baseState,
  currentGrandPrix: {
    ...baseState.currentGrandPrix,
    qualifyingRuns: [rivalQualifyingRun, slowerQualifyingRun, qualifyingRun]
  }
};

const decidedStateWithQualifying = {
  ...decidedState,
  currentGrandPrix: {
    ...decidedState.currentGrandPrix,
    qualifyingRuns: [rivalQualifyingRun, slowerQualifyingRun, qualifyingRun]
  }
};

const settingsState = {
  ...baseState,
  league: {
    ...baseState.league,
    cadence: "weekly",
    preparationDeadlineAt: "2026-07-15T10:00:00.000Z"
  }
};

const otherLeagueState = {
  ...baseState,
  league: {
    ...baseState.league,
    id: "league_2",
    name: "Night League",
    code: "NIGHT1"
  },
  teams: [
    {
      ...baseState.teams[0],
      id: "team_3",
      name: "Late Apex"
    }
  ],
  player: {
    teamId: "team_3",
    claimCode: "CLAIM456"
  }
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  localStorage.clear();
});

describe("App", () => {
  it("switches the interface language", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Language"), { target: { value: "fr" } });

    expect(screen.getByRole("button", { name: /Créer profil/ })).toBeTruthy();
    expect(screen.getByText("Sauvegarder ton accès")).toBeTruthy();
    expect(localStorage.getItem("cr-league-language")).toBe("fr");
  });

  it("auto-dismisses floating notifications after 5 seconds", async () => {
    vi.useFakeTimers();
    saveProfile();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState));

    render(<App />);
    createLeagueFromSetup();

    await act(async () => {});
    expect(screen.getByText("League created. Submit your race directive.")).toBeTruthy();
    act(() => vi.advanceTimersByTime(5_000));
    expect(screen.queryByText("League created. Submit your race directive.")).toBe(null);
  });

  it("opens owned garage cards read-only while preserving shop purchase controls", async () => {
    saveProfile();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState));

    render(<App />);
    createLeagueFromSetup();
    await screen.findByRole("button", { name: "Garage" });

    fireEvent.click(screen.getByRole("button", { name: "Garage" }));
    expect(screen.getByRole("tab", { name: "Shop" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.click(screen.getByRole("tab", { name: "Inventory" }));
    fireEvent.click(screen.getByRole("button", { name: /Rain Grip/ }));
    expect(screen.getByRole("dialog", { name: "Rain Grip" })).toBeTruthy();
    expect(screen.getByText("Pays off if rain appears around mid-race.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Buy card" })).toBe(null);
    expect(screen.queryByText("This card will join your garage and can shape your next directive.")).toBe(null);
    fireEvent.click(screen.getByRole("dialog", { name: "Rain Grip" }).querySelector(".modal-actions button")!);

    fireEvent.click(screen.getByRole("tab", { name: "Shop" }));
    fireEvent.click(screen.getByRole("button", { name: /Soft Tires/ }));
    expect(screen.getByRole("dialog", { name: "Confirm card purchase" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Buy card" })).toBeTruthy();
    expect(screen.getByText("You do not have enough credits to buy this card yet.")).toBeTruthy();
  });

  it("plays through the demo league flow", async () => {
    saveProfile();
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(response(baseState))
      .mockResolvedValueOnce(response({ state: qualifiedState, run: qualifyingRun, isBest: true }))
      .mockResolvedValueOnce(response(decidedStateWithQualifying))
      .mockResolvedValueOnce(response(resolvedState))
      .mockResolvedValueOnce(response(nextGrandPrixState))
      .mockResolvedValueOnce(response(settingsState))
      .mockResolvedValueOnce(response(baseState));
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<App />);

    expect(screen.getByRole("heading", { name: "Race desk" })).toBeTruthy();

    createLeagueFromSetup();

    // Drive view: map first, plan tuning lives in its own cockpit section.
    await expectChampionshipCode("ABC123");
    fireEvent.click(screen.getByRole("button", { name: "Race" }));
    expect(document.querySelector(".command-bar")).toBe(null);
    expect(screen.getByRole("heading", { name: "1. Read the circuit" })).toBeTruthy();
    expect(document.querySelector(".map-workflow-panel")?.textContent).toContain("1. Read the circuit");
    expect(screen.getByText("Check the track and forecast, then run a chrono with your current directive to improve the grid.")).toBeTruthy();
    expect(screen.getAllByText("Docklands Sprint").length).toBeGreaterThan(0);
    expect(screen.queryByRole("heading", { name: "Tune the race plan" })).toBe(null);
    expect(screen.getByRole("button", { name: "Plan" })).toBeTruthy();
    expect(document.querySelector(".race-phase-actions")?.textContent).toContain("Edit planNew lap time");
    fireEvent.click(screen.getByRole("button", { name: "Edit plan" }));
    expect(screen.getByRole("heading", { name: "Tune the race plan" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Plan" }).className).toContain("active");
    // The switcher doubles as the plan summary: each tab shows the current pick.
    expect(screen.getByRole("tab", { name: "Approach: Balanced" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Preparation: Weather" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Card: Rain Grip" })).toBeTruthy();
    expect(screen.getByText("High overtaking rewards attack and launch cards.")).toBeTruthy();
    expect([...document.querySelectorAll(".directive-trait-modifier")].map((element) => element.textContent)).toEqual(["+3", "-1", "+1"]);
    // Approach sub-screen is shown first.
    expect(screen.getByRole("button", { name: "Approach: Balanced" }).getAttribute("aria-pressed")).toBe("true");
    // Preparation choices only appear on their sub-screen.
    fireEvent.click(screen.getByRole("tab", { name: "Preparation: Weather" }));
    expect(screen.getByRole("button", { name: "Preparation: Weather" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Stronger if rain arrives, weaker if it stays dry.")).toBeTruthy();
    fireEvent.click(screen.getByRole("tab", { name: "Card: Rain Grip" }));
    expect(screen.getByRole("button", { name: "Card: Rain Grip" }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Race" }));
    expect(screen.getByRole("heading", { name: "1. Read the circuit" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Result" })).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Race" }));
    expect(screen.getAllByText("Lap times", { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getByText("0/3")).toBeTruthy();
    expect(screen.getByText("No lap times")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Review lap time" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Review lap time" }).className).toContain("primary-command");
    expect(document.querySelector(".race-phase-actions")?.textContent).toContain("New lap time");

    // Qualifying modal from the race phase panel
    expect(screen.queryByText("Wait for directives")).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "New lap time" }));
    expect(screen.getByRole("dialog", { name: "Run a lap time?" })).toBeTruthy();
    expect(screen.getByText("This attempt uses your current directive and the forecast conditions. Attempts left 3/3")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "New lap time" }).at(-1)!);
    expect(await screen.findByText("New best qualifying time saved.")).toBeTruthy();
    expect(JSON.parse((fetch.mock.calls[1]?.[1] as RequestInit).body as string)).toMatchObject({ teamId: "team_1", claimCode: "CLAIM123" });
    expect(screen.getByRole("heading", { name: "Lap time replay" })).toBeTruthy();
    expect(screen.getByText("Relive this run lap by lap:", { exact: false })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Run a lap time" })).toBe(null);
    expect(screen.queryByText("Your best time sets your grid slot.", { exact: false })).toBe(null);
    expect(screen.queryByRole("button", { name: "Run lap time" })).toBe(null);
    expect(document.querySelector(".replay-tower")?.textContent).toContain("Lap 1");
    expect(document.querySelector(".replay-tower")?.textContent).toContain("75.18s");
    expect(document.querySelector(".replay-tower")?.textContent).toContain("Lap 2");
    expect(document.querySelector(".replay-tower")?.textContent).toContain("72.42s");
    expect(document.querySelector(".replay-tower")?.textContent).not.toContain("Mika Blitz");
    expect(screen.getByRole("button", { name: "Back to circuit" }).className).toContain("replay-close-button");
    fireEvent.click(screen.getByRole("button", { name: "Back to circuit" }));
    expect(screen.queryByRole("heading", { name: "Lap time replay" })).toBe(null);
    expect(screen.getByText("72.42s")).toBeTruthy();
    expect(screen.getByText("75.18s")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Review lap time" }).hasAttribute("disabled")).toBe(false);
    expect(screen.getByRole("button", { name: "Review lap time" }).className).toContain("primary-command");
    expect(screen.getByRole("heading", { name: "2. Chrono / plan" })).toBeTruthy();
    expect(screen.getByText("Chrono 1/3 is logged. Adjust the directive or lock the plan before the GP.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Review lap time" }));
    expect(screen.getByRole("heading", { name: "Lap time replay" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Back to circuit" }));

    // Championship view
    fireEvent.click(screen.getByRole("button", { name: "Championship" }));
    expect(screen.getByText("Season 1 · Round 1/6")).toBeTruthy();
    expect(screen.getAllByText("Current GP").length).toBe(1);
    expect(document.querySelector(".current-gp-panel")).toBe(null);
    expect(screen.getByText("0/2")).toBeTruthy();
    expect(document.querySelector(".championship-overview")?.textContent).toContain("ABC123");
    expect(document.querySelector(".standings-table")?.textContent).toContain("Volt Union");
    fireEvent.click(screen.getByRole("tab", { name: "Grand Prix history" }));
    expect(document.querySelector(".round-timeline")?.textContent).toContain("R1");
    fireEvent.click(screen.getByRole("tab", { name: "Standings" }));

    fireEvent.click(screen.getByRole("button", { name: "Race" }));
    fireEvent.click(screen.getByRole("button", { name: "Lock plan" }));
    expect(screen.getByRole("dialog", { name: "Lock race plan" })).toBeTruthy();
    expect(screen.getByText("You still have chrono attempts left. Lock the plan now? 2/3")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "Lock plan" }).at(-1)!);
    expect(await screen.findByText("Directive locked. You can launch the Grand Prix.")).toBeTruthy();
    expect(JSON.parse((fetch.mock.calls[2]?.[1] as RequestInit).body as string)).toMatchObject({ teamId: "team_1", claimCode: "CLAIM123" });
    fireEvent.click(screen.getByText("Directive locked. You can launch the Grand Prix.").closest(".floating-notification")!.querySelector("button")!);
    expect(screen.queryByText("Directive locked. You can launch the Grand Prix.")).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Race" }));
    expect(screen.getByRole("heading", { name: "3. Plan locked" })).toBeTruthy();
    expect(document.querySelector(".map-workflow-panel")?.textContent).toContain("3. Plan locked");
    expect(document.querySelector(".map-qualifying-times")?.textContent).toContain("Mika Blitz");
    expect(document.querySelector(".map-qualifying-times")?.textContent).toContain("72.42s");
    expect(document.querySelector(".map-qualifying-times")?.textContent).not.toContain("75.18s");
    expect(document.querySelector(".race-phase-actions")?.textContent).toContain("View planLaunch GP");
    fireEvent.click(screen.getByRole("button", { name: "View plan" }));
    expect(screen.getByRole("heading", { name: "Tune the race plan" })).toBeTruthy();
    for (const button of document.querySelectorAll(".directive-panel .choice-card")) {
      expect(button.hasAttribute("disabled")).toBe(true);
    }
    fireEvent.click(screen.getByRole("button", { name: "Race" }));
    expect(screen.queryByRole("button", { name: "Lap time" })).toBe(null);
    expect(screen.getByRole("button", { name: "Launch GP" })).toBeTruthy();

    // Launch: Course becomes the race replay.
    fireEvent.click(screen.getByRole("button", { name: "Launch GP" }));
    const launchDialog = screen.getByRole("dialog", { name: "Launch Grand Prix?" });
    expect(launchDialog.textContent).toContain("Starting grid");
    expect(launchDialog.textContent).toContain("P1");
    expect(launchDialog.textContent).toContain("Paris");
    expect(launchDialog.textContent).toContain("Grip 64");
    fireEvent.click(screen.getAllByRole("button", { name: "Launch GP" }).at(-1)!);
    expect(await screen.findByRole("heading", { name: "Race replay" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Race" }).className).toContain("active");
    expect(screen.queryByRole("button", { name: "Race info" })).toBe(null);
    expect(screen.queryByRole("button", { name: "Report" })).toBe(null);
    expect(await screen.findByRole("heading", { name: "Race replay" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "4. Grand Prix finished" })).toBe(null);
    expect(screen.getByText("Relive the GP lap by lap: weather, pace, and key moments move the standings.")).toBeTruthy();
    expect(document.querySelector(".replay-moments-panel")).toBe(null);
    expect(document.querySelector(".replay-tower li")?.textContent).toContain("1Mika Blitz");

    // Timeline markers carry the key moments and seek on click
    expect(document.querySelectorAll(".replay-tick").length).toBe(4);
    expect(document.querySelectorAll(".replay-weather").length).toBe(5);
    expect(document.querySelector(".replay-marker")?.getAttribute("title")).toContain("Rain Grip");
    fireEvent.click(document.querySelector(".replay-marker")!);
    expect(document.querySelector(".replay-moment-notification")?.textContent).toContain("Rain Grip");
    expect(document.querySelector(".replay-moment-notification")?.textContent).toContain("+2 pos");
    expect(document.querySelector(".replay-tower li")?.textContent).toContain("1Volt Union");
    fireEvent.click(screen.getByRole("button", { name: /Restart/ }));
    expect((document.querySelector(".replay-progress-fill") as HTMLElement).style.width).toBe("0%");

    // Replay playback controls
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByRole("button", { name: "Play" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy();
    // Focus is on by default; clicking turns it off and persists that.
    fireEvent.click(screen.getByRole("button", { name: "Focus driver" }));
    expect(localStorage.getItem("cr-league-replay-focus")).toBe("0");
    fireEvent.click(screen.getByRole("button", { name: "Speed ×1" }));
    fireEvent.click(screen.getByRole("option", { name: "×2" }));
    expect(screen.getByRole("button", { name: "Speed ×2" })).toBeTruthy();
    expect(localStorage.getItem("cr-league-replay-speed")).toBe("2");
    expect(screen.getByRole("button", { name: "Back to circuit" }).className).toContain("replay-close-button");
    fireEvent.click(screen.getByRole("button", { name: "Back to circuit" }));
    expect(screen.queryByRole("heading", { name: "Race replay" })).toBe(null);
    expect(screen.getByRole("heading", { name: "4. Grand Prix finished" })).toBeTruthy();
    expect(document.querySelectorAll(".map-final-classification li").length).toBe(resolvedState.currentGrandPrix.result.classification.length);
    expect(document.querySelector(".map-final-classification")?.textContent).toContain("Volt Union");
    expect(document.querySelector(".map-final-classification")?.textContent).toContain("25 pts");
    expect(screen.getByRole("button", { name: "Replay" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Report" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Next GP" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Replay" }));
    expect(await screen.findByRole("heading", { name: "Race replay" })).toBeTruthy();
    expect(document.querySelector('image[href="/assets/cars/idle.png"]')).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Back to circuit" }));

    // Report view
    fireEvent.click(screen.getByRole("button", { name: "Report" }));
    expect(screen.getByText("Paris Docklands Sprint: Volt Union wins.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Replay" })).toBe(null);
    expect(screen.getByRole("heading", { name: "Race phases" })).toBeTruthy();
    expect(screen.getByLabelText("Race phases")).toBeTruthy();
    expect(screen.getByText("Phase 1")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Race recap" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "What made the difference" })).toBeTruthy();
    expect(screen.getByText(/Weather prep fit the race weather/)).toBeTruthy();
    expect(screen.getByText(/Rain Grip produced/)).toBeTruthy();
    expect(screen.getByText(/Paris Left Bank Loop/)).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "4. Grand Prix finished" })).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Back to circuit" }));
    expect(screen.getByRole("heading", { name: "4. Grand Prix finished" })).toBeTruthy();

    // Garage view
    fireEvent.click(screen.getByRole("button", { name: "Garage" }));
    expect(screen.getByRole("heading", { name: "Shop" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Shop" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.click(screen.getByRole("tab", { name: "My team" }));
    expect(screen.getByText("Last GP")).toBeTruthy();
    expect(screen.getByText("+150 credits · +25 pts")).toBeTruthy();
    expect(screen.getByText("Consumed Rain Grip")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "My team" })).toBeTruthy();
    fireEvent.click(screen.getByRole("tab", { name: "Inventory" }));
    expect(screen.getByText("No cards in inventory.")).toBeTruthy();
    fireEvent.click(screen.getByRole("tab", { name: "Shop" }));
    expect(screen.getByRole("button", { name: /Soft Tires/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Qualifying Lap/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Defensive Order/ })).toBeTruthy();

    // One command at a time
    expect(screen.queryByRole("button", { name: "Lock plan" })).toBe(null);
    expect(screen.queryByRole("button", { name: "Launch GP" })).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Race" }));
    expect(screen.getByRole("button", { name: "Replay" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Next GP" }).hasAttribute("disabled")).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Next GP" }));
    expect(screen.getByRole("dialog", { name: "Start the next race day?" })).toBeTruthy();
    expect(screen.getByText("This opens the next Grand Prix and moves every player back into preparation.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.getByRole("heading", { name: "4. Grand Prix finished" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next GP" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Next GP" }).at(-1)!);
    fireEvent.click(await screen.findByRole("button", { name: "Championship" }));
    expect(await screen.findByText("Season 1 · Round 2/6")).toBeTruthy();
    fireEvent.click(screen.getByRole("tab", { name: "Grand Prix history" }));
    expect(document.querySelector(".round-timeline")?.textContent).toContain("P1");
    fireEvent.click(screen.getByRole("button", { name: "S1 R1" }));
    expect(screen.getByRole("heading", { name: "Race replay" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(document.querySelector(".championship-settings-panel")).toBe(null);

    // League controls live in the profile menu.
    fireEvent.click(screen.getByRole("button", { name: "Profile menu" }));
    expect(screen.getByLabelText("Language")).toBeTruthy();
    expect(document.querySelector(".profile-menu-panel")?.textContent).toContain("League controls");
    expect(document.querySelector(".championship-overview")?.textContent).not.toContain("League controls");
    fireEvent.click(screen.getByRole("button", { name: "League controls" }));
    expect(screen.getByRole("dialog", { name: "League controls" })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Cadence"), { target: { value: "weekly" } });
    fireEvent.click(screen.getByRole("button", { name: "Update settings" }));
    expect(await screen.findByText("League settings updated.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Restart session" }));
    expect(await screen.findByText("Playtest session restarted.")).toBeTruthy();
    expect(screen.getByText("Season 1 · Round 1/6")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Forget team" }));
    expect(screen.getAllByText("Team claim forgotten.").length).toBeGreaterThan(0);
    expect(localStorage.getItem("cr-league-player-claims")).toBe("[]");
    expect(localStorage.getItem("cr-league-active-player-claim")).toBe(null);
    expect(fetch).toHaveBeenCalledTimes(7);
  });

  it("keeps the current player attached when action responses omit player", async () => {
    saveProfile();
    const rivalFirstState = {
      ...baseState,
      teams: [
        {
          ...baseState.teams[0],
          id: "team_9",
          name: "Rival Human"
        },
        baseState.teams[0],
        baseState.teams[1]
      ]
    };
    const rivalFirstDecided = {
      ...decidedState,
      teams: rivalFirstState.teams
    };
    const rivalFirstResolved = {
      ...resolvedState,
      teams: rivalFirstState.teams
    };
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(response(rivalFirstState))
      .mockResolvedValueOnce(response(withoutPlayer(rivalFirstDecided)))
      .mockResolvedValueOnce(response(withoutPlayer(rivalFirstResolved)));

    render(<App />);

    createLeagueFromSetup();
    await expectChampionshipCode("ABC123");
    fireEvent.click(screen.getByRole("button", { name: "Race" }));
    expect(document.querySelector(".profile-menu-button")?.textContent).toBe("VO");

    fireEvent.click(screen.getByRole("button", { name: "Lock plan" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Lock plan" }).at(-1)!);
    expect(await screen.findByText("Directive locked. You can launch the Grand Prix.")).toBeTruthy();
    expect(document.querySelector(".profile-menu-button")?.textContent).toBe("VO");

    fireEvent.click(screen.getByRole("button", { name: "Launch GP" }));
    expect(screen.getByRole("dialog", { name: "Launch Grand Prix?" }).textContent).toContain("Starting grid");
    fireEvent.click(screen.getAllByRole("button", { name: "Launch GP" }).at(-1)!);
    expect(await screen.findByRole("heading", { name: "Race replay" })).toBeTruthy();
    expect(document.querySelector(".profile-menu-button")?.textContent).toBe("VO");
  });

  it("celebrates a season rollover once and reopens the recap from palmares", async () => {
    saveProfile();
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(seasonTwoState));

    render(<App />);

    createLeagueFromSetup();
    const recap = await screen.findByRole("dialog", { name: "Season recap" });
    expect(recap.textContent).toContain("Season 1");
    expect(recap.textContent).toContain("Champion");
    expect(recap.textContent).toContain("Volt Union");
    expect(recap.textContent).toContain("Final standings");
    expect(localStorage.getItem("cr-league-season-recap:league_1:1")).toBe("seen");

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(screen.getByRole("button", { name: "Championship" }));
    expect(screen.getByRole("heading", { name: "Standings" })).toBeTruthy();
    fireEvent.click(screen.getByRole("tab", { name: "Palmares" }));
    expect(screen.getByRole("heading", { name: "Palmares" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Season 1/ }).textContent).toContain("Volt Union");
    fireEvent.click(screen.getByRole("tab", { name: "Grand Prix history" }));
    expect(document.querySelectorAll(".season-history-group").length).toBe(2);
    fireEvent.click(screen.getByRole("tab", { name: "Palmares" }));
    fireEvent.click(screen.getByRole("button", { name: /Season 1/ }));
    expect(screen.getByRole("dialog", { name: "Season recap" })).toBeTruthy();

    cleanup();
    fetch.mockResolvedValueOnce(response(seasonTwoState));
    render(<App />);
    createLeagueFromSetup();
    await screen.findByRole("button", { name: "Race" });
    expect(screen.queryByRole("dialog", { name: "Season recap" })).toBe(null);
  });

  it("shows and copies the saved profile code from the profile menu", async () => {
    saveProfile();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Profile menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy profile code" }));

    expect(screen.getByRole("dialog", { name: "Profile code" })).toBeTruthy();
    expect(screen.getByDisplayValue("ABCD1234")).toBeTruthy();

    fireEvent.click(screen.getByLabelText("Copy profile code"));
    expect(writeText).toHaveBeenCalledWith("ABCD1234");
    expect(await screen.findByText("Profile code copied: ABCD1234")).toBeTruthy();
  });

  it("hides profile code copy when the code is not stored locally", () => {
    saveProfile({ recoveryCode: undefined });
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Profile menu" }));

    expect(screen.queryByRole("button", { name: "Copy profile code" })).toBe(null);
  });

  it("opens release notes from the centered profile version", async () => {
    saveProfile();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState));
    render(<App />);
    createLeagueFromSetup();

    expect(await screen.findByRole("heading", { name: "1. Read the circuit" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Profile menu" }));
    fireEvent.click(screen.getByRole("button", { name: "v0.3.6" }));

    expect(screen.getByRole("heading", { name: "What's new" })).toBeTruthy();
    expect(screen.getByText("Current local version: v0.3.6.")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Visual identity and mobile polish" })).toBeTruthy();
  });

  it("closes the profile menu when focus leaves it", async () => {
    saveProfile();
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Profile menu" }));
    expect(screen.getByRole("button", { name: "Copy profile code" })).toBeTruthy();

    fireEvent.blur(document.querySelector(".profile-menu")!, { relatedTarget: null });
    expect(screen.queryByRole("button", { name: "Copy profile code" })).toBe(null);
  });

  it("shows a replay empty state when a resolved race has no events", async () => {
    saveProfile();
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

    createLeagueFromSetup();

    expect(await screen.findByRole("heading", { name: "Race replay" })).toBeTruthy();
    expect(document.querySelector(".replay-moments-panel")).toBe(null);
    expect(document.querySelector(".replay-progress")).toBeTruthy();
  });

  it("resets only UI preferences from the profile menu", async () => {
    saveProfile();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(resolvedState));
    localStorage.setItem("cr-league-language", "en");
    localStorage.setItem("cr-league-replay-speed", "4");
    localStorage.setItem("cr-league-replay-focus", "0");
    localStorage.setItem("cr-league-season-recap:league_1:1", "1");

    render(<App />);
    createLeagueFromSetup();

    expect(await screen.findByRole("heading", { name: "Race replay" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Speed ×4" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Focus driver" }).className).not.toContain("active");
    fireEvent.click(screen.getByLabelText("Close Race replay"));
    expect(screen.queryByRole("heading", { name: "Race replay" })).toBe(null);
    expect(localStorage.getItem("cr-league-dismissed-replay-help")).toBe("1");

    fireEvent.click(screen.getByRole("button", { name: "Profile menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset UI preferences" }));

    expect(await screen.findByText("UI preferences reset. Help panels and replay preferences are back to default.")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Race replay" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Speed ×1" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Focus driver" }).className).toContain("active");
    fireEvent.click(screen.getByRole("button", { name: "Race" }));
    expect(screen.getByRole("heading", { name: "4. Grand Prix finished" })).toBeTruthy();
    expect(localStorage.getItem("cr-league-dismissed-replay-help")).toBe(null);
    expect(localStorage.getItem("cr-league-replay-speed")).toBe(null);
    expect(localStorage.getItem("cr-league-replay-focus")).toBe(null);
    expect(localStorage.getItem("cr-league-season-recap:league_1:1")).toBe(null);
    expect(localStorage.getItem("cr-league-language")).toBe("en");
    expect(localStorage.getItem("cr-league-profile-session")).toContain("profile_1");
    expect(localStorage.getItem("cr-league-player-claims")).toContain("team_1");
    expect(localStorage.getItem("cr-league-active-player-claim")).toBe("team_1");
  });

  it("joins a league by code", async () => {
    saveProfile();
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState));

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Join league/ }));
    fireEvent.change(screen.getByLabelText("Join code"), { target: { value: "abc123" } });
    fireEvent.change(screen.getByLabelText("Team"), { target: { value: "Volt Union" } });
    fireEvent.click(screen.getByRole("button", { name: "Join league" }));

    await expectChampionshipCode("ABC123");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:4874/leagues/join",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          code: "ABC123",
          teamName: "Volt Union",
          profileId: "profile_1"
        })
      })
    );
    expect(localStorage.getItem("cr-league-player-claims")).toContain("Office League");
    expect(localStorage.getItem("cr-league-active-player-claim")).toBe("team_1");
  });

  it("rejoins a saved player claim", async () => {
    saveProfile();
    localStorage.setItem(
      "cr-league-player-claims",
      JSON.stringify([
        {
          ...baseState.player,
          leagueId: baseState.league.id,
          leagueName: baseState.league.name,
          leagueCode: baseState.league.code,
          teamName: "Volt Union"
        }
      ])
    );
    localStorage.setItem("cr-league-active-player-claim", baseState.player.teamId);
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
    expect(localStorage.getItem("cr-league-player-claims")).toContain("Office League");
  });

  it("switches between saved league claims", async () => {
    saveProfile();
    localStorage.setItem(
      "cr-league-player-claims",
      JSON.stringify([
        {
          teamId: "team_1",
          claimCode: "CLAIM123",
          leagueId: "league_1",
          leagueName: "Office League",
          leagueCode: "ABC123",
          teamName: "Volt Union"
        },
        {
          teamId: "team_3",
          claimCode: "CLAIM456",
          leagueId: "league_2",
          leagueName: "Night League",
          leagueCode: "NIGHT1",
          teamName: "Late Apex"
        }
      ])
    );
    localStorage.setItem("cr-league-active-player-claim", "team_1");
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState)).mockResolvedValueOnce(response(otherLeagueState));

    render(<App />);

    expect(await screen.findByText("League rejoined.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Profile menu" }));
    fireEvent.change(screen.getByLabelText("Active league"), { target: { value: "team_3" } });

    await expectChampionshipCode("NIGHT1");
    expect(localStorage.getItem("cr-league-active-player-claim")).toBe("team_3");
    expect(fetch).toHaveBeenLastCalledWith(
      "http://localhost:4874/leagues/rejoin",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ teamId: "team_3", claimCode: "CLAIM456" })
      })
    );
  });

  it("opens league adding without dropping saved claims", async () => {
    saveProfile();
    localStorage.setItem(
      "cr-league-player-claims",
      JSON.stringify([
        {
          teamId: "team_1",
          claimCode: "CLAIM123",
          leagueId: "league_1",
          leagueName: "Office League",
          leagueCode: "ABC123",
          teamName: "Volt Union"
        }
      ])
    );
    localStorage.setItem("cr-league-active-player-claim", "team_1");
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState)).mockResolvedValueOnce(response(baseState));

    render(<App />);

    expect(await screen.findByText("League rejoined.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Profile menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Manage league" }));

    expect(screen.getByRole("button", { name: /Create league/ })).toBeTruthy();
    expect(screen.getByText("Saved leagues")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Profile menu" }));
    expect(screen.getByRole("button", { name: "Copy profile code" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Office League/ }));

    await expectChampionshipCode("ABC123");
  });

  it("keeps setup league chrome focused when no league is active", () => {
    saveProfile();

    render(<App />);

    expect(screen.getByText("Saved leagues")).toBeTruthy();
    expect(screen.getByText("No saved leagues yet.")).toBeTruthy();
    expect(screen.queryByLabelText("Language")).toBe(null);

    fireEvent.click(screen.getByRole("button", { name: "Profile menu" }));
    expect(screen.getByLabelText("Language")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Manage league" })).toBe(null);
    expect(screen.getByRole("button", { name: "Copy profile code" })).toBeTruthy();
  });

  it("opens sign out confirmation from the league setup screen", () => {
    saveProfile();
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Profile menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    expect(screen.getByRole("dialog", { name: "Sign out" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "Sign out" }).at(-1)!);
    expect(screen.queryByRole("dialog", { name: "Sign out" })).toBe(null);
    expect(screen.getByRole("heading", { name: "Save your access" })).toBeTruthy();
  });

  it("clears a stale saved player claim", async () => {
    saveProfile();
    localStorage.setItem(
      "cr-league-player-claims",
      JSON.stringify([
        {
          teamId: "team_1",
          claimCode: "CLAIM123",
          leagueId: "league_1",
          leagueName: "Office League",
          leagueCode: "ABC123",
          teamName: "Volt Union"
        }
      ])
    );
    localStorage.setItem("cr-league-active-player-claim", "team_1");
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Team claim not found." }), {
        status: 404,
        headers: { "content-type": "application/json" }
      })
    );

    render(<App />);

    expect(await screen.findByText("Saved league no longer exists. Join the playtest again.")).toBeTruthy();
    expect(localStorage.getItem("cr-league-player-claims")).toBe("[]");
    expect(localStorage.getItem("cr-league-active-player-claim")).toBe(null);
    expect(screen.getByRole("button", { name: /Join league/ })).toBeTruthy();
  });

  it("hides technical API errors from setup panels and keeps them copyable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          message:
            "Invalid `db.profile.findUnique()` invocation in apps/api/src/features/leagues/store.ts. The column `leagues.ownerTeamId` does not exist in the current database."
        }),
        {
          status: 500,
          headers: { "content-type": "application/json" }
        }
      )
    );

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Recover profile/ }));
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "pilot@example.test" } });
    fireEvent.change(screen.getByLabelText("Recovery code"), { target: { value: "ABCD1234" } });
    fireEvent.click(screen.getByRole("button", { name: "Recover profile" }));

    await screen.findByRole("dialog", { name: "Action blocked" });
    expect(document.querySelector(".setup-main-panel")?.textContent).toContain("Something went wrong. Try again in a moment.");
    expect(document.querySelector(".setup-main-panel")?.textContent).not.toContain("db.profile.findUnique");
    expect(screen.getByRole("dialog", { name: "Action blocked" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Copy error detail" }));

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("ownerTeamId"));
  });
});

function saveProfile(overrides: Partial<{ recoveryCode: string | undefined }> = {}) {
  localStorage.setItem(
    "cr-league-profile-session",
    JSON.stringify({
      profile: { id: "profile_1", email: "pilot@example.test" },
      recoveryCode: "ABCD1234",
      ...overrides,
      teams: []
    })
  );
}

function createLeagueFromSetup() {
  fireEvent.click(screen.getByRole("button", { name: /Create league/ }));
  fireEvent.click(screen.getByRole("button", { name: "Start league" }));
}

async function expectChampionshipCode(code: string) {
  fireEvent.click(await screen.findByRole("button", { name: "Championship" }));
  expect(document.querySelector(".championship-overview")?.textContent).toContain(code);
}

function response(body: unknown) {
  return {
    ok: true,
    json: async () => body
  } as Response;
}

function withoutPlayer<T extends { player?: unknown }>(state: T): Omit<T, "player"> {
  const rest = { ...state };
  delete rest.player;
  return rest;
}
