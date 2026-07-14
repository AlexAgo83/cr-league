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

  it("plays through the demo league flow", async () => {
    saveProfile();
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

    expect(screen.getByRole("heading", { name: "Race desk" })).toBeTruthy();

    createLeagueFromSetup();

    // Drive view: map + directive panel side by side
    expect(await screen.findByText("ABC123")).toBeTruthy();
    expect(screen.getByText("Prepare")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Race prep" })).toBeTruthy();
    expect(screen.getByText("Read the circuit, set the directive, pick a card, then lock the plan.")).toBeTruthy();
    expect(screen.getAllByText("Docklands Sprint").length).toBeGreaterThan(0);
    expect(screen.getByText("Stronger if rain arrives, weaker if it stays dry.")).toBeTruthy();
    expect(screen.getAllByText("Rain Grip").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Result" }).hasAttribute("disabled")).toBe(true);

    // Briefing modal from the info button
    expect(screen.queryByText("Wait for directives")).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Race info" }));
    expect(screen.getByText("Wait for directives")).toBeTruthy();
    expect(screen.getByText("Fast")).toBeTruthy();
    expect(screen.getByText("Weather sensitive")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByText("Wait for directives")).toBe(null);

    // Championship view
    fireEvent.click(screen.getByRole("button", { name: "Championship" }));
    expect(screen.getAllByText("Round 1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Current GP").length).toBeGreaterThan(1);
    expect(screen.getByText("0/2")).toBeTruthy();
    expect(document.querySelector(".standings-table")?.textContent).toContain("Volt Union");
    expect(document.querySelector(".round-timeline")?.textContent).toContain("R1");

    fireEvent.click(screen.getByRole("button", { name: "Race" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit directive" }));
    expect(await screen.findByText("Directive locked. You can launch the Grand Prix.")).toBeTruthy();
    expect(screen.getByText("Ready to launch")).toBeTruthy();

    // Launch: auto-switches to the result view
    fireEvent.click(screen.getByRole("button", { name: "Launch GP" }));
    expect(await screen.findByRole("heading", { name: "Race replay" })).toBeTruthy();
    expect(screen.getByText("Race resolved")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Result" }).className).toContain("active");
    expect(screen.queryByRole("button", { name: "Race info" })).toBe(null);
    expect(screen.getByRole("button", { name: "Report" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Race replay" })).toBeTruthy();
    expect(screen.getByText("Relive the GP lap by lap: weather, pace, and key moments move the standings.")).toBeTruthy();
    expect(document.querySelector(".replay-timeline")?.textContent).toContain("L5");
    expect(document.querySelector(".replay-timeline")?.textContent).toContain("Rain Grip");
    expect(document.querySelector(".replay-timeline")?.textContent).toContain("+2 pos");
    expect(document.querySelector(".replay-tower li")?.textContent).toContain("P1Mika Blitz");

    // Timeline markers carry the key moments and seek on click
    expect(document.querySelectorAll(".replay-tick").length).toBe(4);
    expect(document.querySelectorAll(".replay-weather").length).toBe(5);
    expect(document.querySelector(".replay-marker")?.getAttribute("title")).toContain("Rain Grip");
    fireEvent.click(document.querySelector(".replay-marker")!);
    expect(document.querySelector(".replay-tower li")?.textContent).toContain("P1Volt Union");
    fireEvent.click(screen.getByRole("button", { name: /Restart/ }));
    expect((document.querySelector(".replay-progress-fill") as HTMLElement).style.width).toBe("0%");
    fireEvent.click(screen.getByRole("button", { name: /L5.*Rain Grip/ }));
    expect(Number.parseFloat((document.querySelector(".replay-progress-fill") as HTMLElement).style.width)).toBeLessThan(100);

    // Replay playback controls
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByRole("button", { name: "Play" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Focus driver" }));
    expect(localStorage.getItem("cr-league-replay-focus")).toBe("1");
    fireEvent.change(screen.getByLabelText("Speed"), { target: { value: "2" } });
    expect((screen.getByLabelText("Speed") as HTMLSelectElement).value).toBe("2");
    expect(localStorage.getItem("cr-league-replay-speed")).toBe("2");

    // Report view
    fireEvent.click(screen.getByRole("button", { name: "Report" }));
    expect(screen.getByText("Paris Docklands Sprint: Volt Union wins.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Replay" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Race phases" })).toBeTruthy();
    expect(screen.getByLabelText("Race phases")).toBeTruthy();
    expect(screen.getByText("Phase 1")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Race recap" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "What made the difference" })).toBeTruthy();
    expect(screen.getByText("Balanced · Weather · Rain Grip")).toBeTruthy();
    expect(screen.getByText("Your card shaped the race. Keep one for moments where the track or forecast clearly matches it.")).toBeTruthy();

    // Garage view
    fireEvent.click(screen.getByRole("button", { name: "Garage" }));
    expect(screen.getByText("Last GP")).toBeTruthy();
    expect(screen.getByText("+150 credits · +25 pts")).toBeTruthy();
    expect(screen.getByText("Consumed Rain Grip")).toBeTruthy();
    expect(screen.getByText("No cards in inventory.")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Recommended offers" })).toBeTruthy();

    // One command at a time
    expect(screen.queryByRole("button", { name: "Submit directive" })).toBe(null);
    expect(screen.queryByRole("button", { name: "Launch GP" })).toBe(null);
    expect(screen.getByRole("button", { name: "Next GP" }).hasAttribute("disabled")).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Next GP" }));
    fireEvent.click(await screen.findByRole("button", { name: "Championship" }));
    expect((await screen.findAllByText("Round 2")).length).toBeGreaterThan(0);
    expect(document.querySelector(".championship-settings-panel")).toBe(null);

    // League controls live in the profile menu modal
    fireEvent.click(screen.getByRole("button", { name: "Profile menu" }));
    expect(screen.getByLabelText("Language")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "League controls" }));
    expect(screen.getByRole("dialog", { name: "League controls" })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Cadence"), { target: { value: "weekly" } });
    fireEvent.click(screen.getByRole("button", { name: "Update settings" }));
    expect(await screen.findByText("League settings updated.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Restart session" }));
    expect(await screen.findByText("Playtest session restarted.")).toBeTruthy();
    expect(screen.getAllByText("Round 1").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Forget team" }));
    expect(screen.getByText("Team claim forgotten.")).toBeTruthy();
    expect(localStorage.getItem("cr-league-player-claims")).toBe("[]");
    expect(localStorage.getItem("cr-league-active-player-claim")).toBe(null);
    expect(fetch).toHaveBeenCalledTimes(6);
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

    fireEvent.click(await screen.findByRole("button", { name: "Result" }));
    expect(screen.getByRole("heading", { name: "Race replay" })).toBeTruthy();
    expect(screen.getByText("No replay events were recorded for this GP.")).toBeTruthy();
  });

  it("joins a league by code", async () => {
    saveProfile();
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState));

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Join league/ }));
    fireEvent.change(screen.getByLabelText("Join code"), { target: { value: "abc123" } });
    fireEvent.change(screen.getByLabelText("Team"), { target: { value: "Volt Union" } });
    fireEvent.click(screen.getByRole("button", { name: "Join league" }));

    expect(await screen.findByText("ABC123")).toBeTruthy();
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

  it("rejoins and migrates a saved player claim", async () => {
    saveProfile();
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
    expect(localStorage.getItem("cr-league-player-claim")).toBe(null);
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

    expect(await screen.findByText("NIGHT1")).toBeTruthy();
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

    expect(await screen.findByText("ABC123")).toBeTruthy();
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
});

function saveProfile() {
  localStorage.setItem(
    "cr-league-profile-session",
    JSON.stringify({
      profile: { id: "profile_1", email: "pilot@example.test" },
      recoveryCode: "ABCD1234",
      teams: []
    })
  );
}

function createLeagueFromSetup() {
  fireEvent.click(screen.getByRole("button", { name: /Create league/ }));
  fireEvent.click(screen.getByRole("button", { name: "Start league" }));
}

function response(body: unknown) {
  return {
    ok: true,
    json: async () => body
  } as Response;
}
