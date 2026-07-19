import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App.js";
import { CITY_CIRCUITS } from "./circuits.js";
import { testCircuit, baseState, decidedState, resolvedState, nextGrandPrixState, seasonTwoState, qualifyingRun, qualifiedState, decidedStateWithQualifying, settingsState } from "./App.testFixtures.js";
import { closeLeagueIntro, createLeagueFromSetup, expectGarageCode, response, saveProfile, withoutPlayer } from "./App.testHelpers.js";
import { t } from "../i18n/index.js";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
});

describe("App", () => {
  it("switches the interface language", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Français/ }));

    expect(screen.getByRole("button", { name: /Créer profil/ })).toBeTruthy();
    expect(screen.getByText("Lancer ton championnat")).toBeTruthy();
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
    expect(screen.queryByText("Creating league...")).toBe(null);
    act(() => vi.advanceTimersByTime(4_000));
    expect(screen.queryByText("League created. Submit your race directive.")).toBe(null);
  });

  it("keeps one-shot help reusable unless the player opts out", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response({ profile: { id: "profile_1", email: "pilot@example.test" }, recoveryCode: "ABCD1234", teams: [] }));

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Create profile/ }));
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "pilot@example.test" } });
    fireEvent.click(screen.getByRole("button", { name: "Create profile" }));

    const checkbox = await screen.findByLabelText("I saved this code");
    expect((checkbox as HTMLInputElement).checked).toBe(false);
    expect(localStorage.getItem("cr-league-help-profile-code")).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Got it" }));
    expect(localStorage.getItem("cr-league-help-profile-code")).toBe(null);
  });

  it("dismisses one-shot help only when the player checks the opt-out", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response({ profile: { id: "profile_1", email: "pilot@example.test" }, recoveryCode: "ABCD1234", teams: [] }));

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Create profile/ }));
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "pilot@example.test" } });
    fireEvent.click(screen.getByRole("button", { name: "Create profile" }));

    fireEvent.click(await screen.findByLabelText("I saved this code"));
    fireEvent.click(screen.getByRole("button", { name: "Got it" }));

    expect(localStorage.getItem("cr-league-help-profile-code")).toBe("1");
  });

  it("shows onboarding help again after returning when opt-out is unchecked", async () => {
    saveProfile();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(resolvedState));

    render(<App />);
    createLeagueFromSetup();

    expect(await screen.findByRole("heading", { name: "Race replay" })).toBeTruthy();
    await closeLeagueIntro();
    fireEvent.click(screen.getByLabelText("Close Race replay"));
    fireEvent.click(screen.getByRole("button", { name: "Garage" }));
    expect(await screen.findByRole("dialog", { name: "Use the garage for the next GP" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Got it" }));
    expect(screen.queryByRole("dialog", { name: "Use the garage for the next GP" })).toBe(null);

    fireEvent.click(screen.getByRole("button", { name: "Championship" }));
    fireEvent.click(screen.getByRole("button", { name: "Garage" }));

    expect(await screen.findByRole("dialog", { name: "Use the garage for the next GP" })).toBeTruthy();
  });

  it("summarizes the player payoff after a resolved grand prix", async () => {
    saveProfile();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(resolvedState));

    render(<App />);
    createLeagueFromSetup();

    expect(await screen.findByRole("heading", { name: "Race replay" })).toBeTruthy();
    await closeLeagueIntro();

    const payoff = screen.getByLabelText("What you gained");
    expect(payoff.textContent).toContain("P1");
    expect(payoff.textContent).toContain("+25 pts");
    expect(payoff.textContent).toContain("+150 credits");
    expect(payoff.textContent).toContain("Rain Grip");
    expect(payoff.textContent).toContain("P1 (Held position)");
  });

  it("shows an explicit no-card payoff when no race card was consumed", async () => {
    saveProfile();
    const noCardState = {
      ...resolvedState,
      currentGrandPrix: {
        ...resolvedState.currentGrandPrix,
        result: {
          ...resolvedState.currentGrandPrix.result,
          consumedCards: []
        }
      }
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(noCardState));

    render(<App />);
    createLeagueFromSetup();

    expect(await screen.findByRole("heading", { name: "Race replay" })).toBeTruthy();
    await closeLeagueIntro();

    expect(screen.getByLabelText("What you gained").textContent).toContain("No card spent");
  });

  it("opens garage onboarding before the current GP is resolved", async () => {
    saveProfile();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState));

    render(<App />);
    createLeagueFromSetup();

    expect(await screen.findByRole("heading", { name: "1. Read the circuit" })).toBeTruthy();
    await closeLeagueIntro();
    const raceIntro = await screen.findByRole("dialog", { name: "Read the race desk" });
    fireEvent.click(within(raceIntro).getByRole("button", { name: "Got it" }));
    fireEvent.click(screen.getByRole("button", { name: "Garage" }));

    expect(await screen.findByRole("dialog", { name: "Use the garage for the next GP" })).toBeTruthy();
  });

  it("reset UI preferences reopens onboarding help on the current screen", async () => {
    saveProfile();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(resolvedState));
    localStorage.setItem("cr-league-help-garage", "1");

    render(<App />);
    createLeagueFromSetup();

    expect(await screen.findByRole("heading", { name: "Race replay" })).toBeTruthy();
    await closeLeagueIntro();
    fireEvent.click(screen.getByLabelText("Close Race replay"));
    fireEvent.click(screen.getByRole("button", { name: "Garage" }));
    expect(screen.queryByRole("dialog", { name: "Use the garage for the next GP" })).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Profile menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset UI preferences" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Reset UI preferences" }).at(-1)!);

    await closeLeagueIntro();
    expect(await screen.findByRole("dialog", { name: "Use the garage for the next GP" })).toBeTruthy();
  });

  it("sells owned garage cards while preserving shop purchase controls", async () => {
    saveProfile();
    const soldState = {
      ...baseState,
      teams: [{ ...baseState.teams[0], credits: 60, cards: [] }, baseState.teams[1]]
    };
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState)).mockResolvedValueOnce(response(soldState));

    render(<App />);
    createLeagueFromSetup();
    await screen.findByRole("button", { name: "Garage" });

    fireEvent.click(screen.getByRole("button", { name: "Garage" }));
    expect(screen.getByRole("tab", { name: "Inventory" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: /Rain Grip/ }));
    expect(screen.getByRole("dialog", { name: "Rain Grip" })).toBeTruthy();
    expect(screen.getByText("Pays off if rain appears around mid-race.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Buy card" })).toBe(null);
    expect(screen.queryByText("This card will join your garage and can shape your next directive.")).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Sell for 60 credits" }));
    await act(async () => {});
    expect(fetch).toHaveBeenLastCalledWith(
      "http://localhost:4874/leagues/league_1/cards/sell",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ teamId: "team_1", claimCode: "CLAIM123", cardId: "rain_grip" }) })
    );
    expect(screen.getByText("Card sold.")).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: "Shop" }));
    fireEvent.click(screen.getByRole("button", { name: /Soft Tires/ }));
    expect(screen.getByRole("dialog", { name: "Confirm card purchase" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Buy card" })).toBeTruthy();
    expect(screen.getByText("You do not have enough credits to buy this card yet.")).toBeTruthy();
    expect(localStorage.getItem("cr-league-garage-panel")).toBe("shop");
  });

  it("sorts owned garage cards by next-GP fit and marks sellable cards", async () => {
    saveProfile();
    const inventoryState = {
      ...baseState,
      teams: [{ ...baseState.teams[0], cards: ["defensive_order", "soft_tires", "rain_grip", "qualifying_focus"] }, baseState.teams[1]]
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(inventoryState));

    render(<App />);
    createLeagueFromSetup();
    await screen.findByRole("button", { name: "Garage" });

    fireEvent.click(screen.getByRole("button", { name: "Garage" }));
    const cards = [...document.querySelectorAll(".card-inventory-button")].map((button) => button.textContent ?? "");
    expect(cards.map((text) => text.match(/Rain Grip|Soft Tires|Qualifying Lap|Defensive Order/)?.[0])).toEqual(["Rain Grip", "Soft Tires", "Qualifying Lap", "Defensive Order"]);
    expect(cards.every((text) => text.includes("Sell for 60 credits"))).toBe(true);
  });

  it("does not auto-select a card after buying one", async () => {
    saveProfile();
    const emptyGarageState = {
      ...baseState,
      teams: [{ ...baseState.teams[0], credits: 200, cards: [] }, baseState.teams[1]]
    };
    const boughtState = {
      ...emptyGarageState,
      teams: [{ ...emptyGarageState.teams[0], credits: 80, cards: ["rain_grip"] }, baseState.teams[1]]
    };
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(emptyGarageState)).mockResolvedValueOnce(response(boughtState));

    render(<App />);
    createLeagueFromSetup();
    await screen.findByRole("button", { name: "Garage" });

    fireEvent.click(screen.getByRole("button", { name: "Garage" }));
    fireEvent.click(screen.getByRole("tab", { name: "Shop" }));
    fireEvent.click(screen.getByRole("button", { name: /Rain Grip/ }));
    fireEvent.click(screen.getByRole("button", { name: "Buy card" }));
    await act(async () => {});
    expect(fetch).toHaveBeenLastCalledWith(
      "http://localhost:4874/leagues/league_1/cards/buy",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ teamId: "team_1", claimCode: "CLAIM123", cardId: "rain_grip" }) })
    );

    fireEvent.click(screen.getByRole("button", { name: "Plan" }));
    expect(screen.getByRole("tab", { name: "Card: No card" })).toBeTruthy();
  });

  it("keeps the selected garage tab in local preferences", async () => {
    saveProfile();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState));

    render(<App />);
    createLeagueFromSetup();
    await screen.findByRole("button", { name: "Garage" });

    fireEvent.click(screen.getByRole("button", { name: "Garage" }));
    expect(window.location.pathname).toBe("/garage/inventory");
    expect(screen.getByRole("tab", { name: "Inventory" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.click(screen.getByRole("tab", { name: "My team" }));
    expect(window.location.pathname).toBe("/garage/team");
    fireEvent.change(screen.getByLabelText("Primary"), { target: { value: "#ffffff" } });
    fireEvent.change(screen.getByLabelText("Secondary"), { target: { value: "#000000" } });
    expect((screen.getByLabelText("Primary") as HTMLInputElement).value).toBe("#787878");
    expect((screen.getByLabelText("Secondary") as HTMLInputElement).value).toBe("#969696");
    expect(localStorage.getItem("cr-league-garage-panel")).toBe("team");

    cleanup();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState));
    render(<App />);
    createLeagueFromSetup();
    await screen.findByRole("button", { name: "Garage" });
    fireEvent.click(screen.getByRole("button", { name: "Garage" }));

    expect(screen.getByRole("tab", { name: "My team" }).getAttribute("aria-selected")).toBe("true");
    expect(window.location.pathname).toBe("/garage/team");
  });

  it("restores the last unlocked race plan draft", async () => {
    localStorage.setItem("cr-league-plan-form", JSON.stringify({ approach: "aggressive", preparation: "reliability", pitStrategy: "mini_pack" }));
    saveProfile();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState));

    render(<App />);
    createLeagueFromSetup();
    await screen.findByRole("button", { name: "Plan" });
    fireEvent.click(screen.getByRole("button", { name: "Plan" }));

    expect(screen.getByRole("button", { name: "Approach: Aggressive" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("tab", { name: "Tire prep: Reliability" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Pit strategy: Mini pack" })).toBeTruthy();
  });

  it("opens Grand Prix history replays in the regular replay screen without explainer copy", async () => {
    saveProfile();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(nextGrandPrixState));

    render(<App />);
    createLeagueFromSetup();
    await screen.findByRole("button", { name: "Championship" });

    fireEvent.click(screen.getByRole("button", { name: "Championship" }));
    fireEvent.click(screen.getByRole("tab", { name: "Grand Prix history" }));
    fireEvent.click(screen.getByRole("button", { name: /S1 R1/ }));

    expect(document.querySelector("#result-replay-panel")).toBeTruthy();
    expect(window.location.pathname).toBe("/replay/gp_1");
    expect(screen.getByRole("button", { name: "Race" }).className).toContain("active");
    expect(screen.queryByRole("dialog", { name: "Race replay" })).toBe(null);
    expect(screen.getByRole("button", { name: "Back to circuit" })).toBeTruthy();
    expect(screen.queryByText("Relive the GP lap by lap: weather, pace, and key moments move the standings.")).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Back to circuit" }));
    expect(window.location.pathname).toBe("/drive");
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
    await expectGarageCode("ABC123");
    fireEvent.click(screen.getByRole("button", { name: "Race" }));
    expect(document.querySelector(".command-bar")).toBe(null);
    expect(screen.getByRole("heading", { name: "1. Read the circuit" })).toBeTruthy();
    expect(document.querySelector(".map-workflow-panel")?.textContent).toContain("1. Read the circuit");
    expect(screen.getByText("Check the track and forecast, then run a chrono with your current directive to improve the grid.")).toBeTruthy();
    const roundOneCircuit = testCircuit(1);
    expect(screen.getAllByText(t(roundOneCircuit.layoutKey, "en")).length).toBeGreaterThan(0);
    expect(screen.queryByRole("heading", { name: "Tune the race plan" })).toBe(null);
    expect(screen.getByRole("button", { name: "Plan" })).toBeTruthy();
    expect(document.querySelector(".race-phase-actions")?.textContent).toContain("Edit planNew lap time");
    expect(screen.getByRole("button", { name: "Edit plan" }).className).toContain("highlight-command");
    fireEvent.click(screen.getByRole("button", { name: "Edit plan" }));
    expect(window.location.pathname).toBe("/plan/approach");
    expect(screen.getByRole("heading", { name: "Tune the race plan" })).toBeTruthy();
    expect(document.querySelector(".directive-briefing-panel")).toBeTruthy();
    expect(document.querySelector(".directive-selection-panel")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Plan" }).className).toContain("active");
    // The switcher doubles as the plan summary: each tab shows the current pick.
    expect(screen.getByRole("tab", { name: "Approach: Balanced" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Tire prep: Weather" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Pit strategy: Standard swap" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Card: No card" })).toBeTruthy();
    expect(screen.getByText("High overtaking rewards attack and launch cards.")).toBeTruthy();
    expect([...document.querySelectorAll(".directive-trait-modifier")].map((element) => element.textContent)).toEqual(["+7", "±0", "+3"]);
    // Approach sub-screen is shown first.
    expect(document.querySelector(".choice-grid")?.className).toContain("directive-choice-grid");
    expect(screen.getByRole("button", { name: "Approach: Balanced" }).getAttribute("aria-pressed")).toBe("true");
    // Preparation choices only appear on their sub-screen.
    fireEvent.click(screen.getByRole("tab", { name: "Tire prep: Weather" }));
    expect(window.location.pathname).toBe("/plan/preparation");
    expect(localStorage.getItem("cr-league-directive-step")).toBe("preparation");
    expect(document.querySelector(".choice-grid")?.className).toContain("directive-choice-grid");
    expect(screen.getByRole("button", { name: "Tire prep: Weather" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Stronger if rain arrives, weaker if it stays dry.")).toBeTruthy();
    fireEvent.click(screen.getByRole("tab", { name: "Card: No card" }));
    expect(window.location.pathname).toBe("/plan/card");
    expect(localStorage.getItem("cr-league-directive-step")).toBe("card");
    fireEvent.click(screen.getByRole("button", { name: /Rain Grip/ }));
    expect(screen.getByRole("tab", { name: "Card: Rain Grip" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Race" }));
    expect(screen.getByRole("heading", { name: "1. Read the circuit" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Edit plan" }).className).not.toContain("highlight-command");
    expect(screen.queryByRole("button", { name: "Result" })).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Race" }));
    expect(screen.getAllByText("Lap times", { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getByText("0/3")).toBeTruthy();
    expect(screen.getByText("No lap times")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Review lap time" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Review lap time" }).className).toContain("primary-command");
    expect(document.querySelector(".race-phase-actions")?.textContent).toContain("New lap time");
    expect(screen.getByRole("button", { name: "New lap time" }).className).toContain("highlight-command");

    // Qualifying modal from the race phase panel
    expect(screen.queryByText("Wait for directives")).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "New lap time" }));
    expect([...document.querySelectorAll(".race-phase-actions button.highlight-command")].map((button) => button.textContent)).not.toContain("New lap time");
    expect(screen.getByRole("dialog", { name: "Run a lap time?" })).toBeTruthy();
    expect(screen.getByText("This attempt uses your current directive and the forecast conditions. Attempts left 3/3")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "New lap time" }).at(-1)!);
    expect(await screen.findByText("New best qualifying time saved.")).toBeTruthy();
    expect(JSON.parse((fetch.mock.calls[1]?.[1] as RequestInit).body as string)).toMatchObject({ teamId: "team_1", claimCode: "CLAIM123" });
    expect(screen.getByRole("heading", { name: "Lap time replay" })).toBeTruthy();
    expect(screen.getByText("Relive this run lap by lap:", { exact: false })).toBeTruthy();
    expect(document.querySelector(".replay-overlay-actions")?.textContent).toContain("72.42s · Attempts left 2/3");
    expect(screen.queryByRole("heading", { name: "Run a lap time" })).toBe(null);
    expect(screen.queryByText("Your best time sets your grid slot.", { exact: false })).toBe(null);
    expect(screen.queryByRole("button", { name: "Run lap time" })).toBe(null);
    expect(screen.queryByText("Track note")).toBe(null);
    expect(screen.queryByText("Race pace settles")).toBe(null);
    expect(document.querySelector(".replay-tower")?.textContent).toContain("Attempt 1 · lap 1");
    expect(document.querySelector(".replay-tower")?.textContent).toContain("75.18s");
    expect(document.querySelector(".replay-tower")?.textContent).toContain("Attempt 1 · lap 2");
    expect(document.querySelector(".replay-tower")?.textContent).toContain("72.42s");
    expect(document.querySelector(".replay-tower")?.textContent).not.toContain("Mika Blitz");
    expect(screen.getByRole("button", { name: "Back to circuit" }).className).toContain("replay-close-button");
    fireEvent.click(screen.getByRole("button", { name: "Back to circuit" }));
    expect(screen.queryByRole("heading", { name: "Lap time replay" })).toBe(null);
    expect(screen.getByText("72.42s")).toBeTruthy();
    expect(screen.getByText("75.18s")).toBeTruthy();
    expect(document.querySelector(".map-qualifying-times")?.textContent).toContain("Attempt 1 · lap 2");
    expect(screen.getByRole("button", { name: "Review lap time" }).hasAttribute("disabled")).toBe(false);
    expect(screen.getByRole("button", { name: "Review lap time" }).className).toContain("primary-command");
    expect(screen.getByRole("heading", { name: "2. Chrono / plan" })).toBeTruthy();
    expect(screen.getByText("Chrono 1/3 is logged. Adjust the directive or lock the plan before the GP.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Plan" }));
    expect(screen.getByRole("heading", { name: "Tune the race plan" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Understand the lap time" })).toBe(null);
    fireEvent.click(screen.getByRole("tab", { name: "Chrono report" }));
    expect(screen.getByRole("heading", { name: "Understand the lap time" })).toBeTruthy();
    expect(screen.getByLabelText("Understand the lap time").textContent).toContain("72.42s");
    expect(screen.getByLabelText("Understand the lap time").textContent).toContain("75.18s");
    expect(screen.getByLabelText("Understand the lap time").textContent).toContain("P2");
    expect(screen.getByLabelText("Understand the lap time").textContent).toContain("Best run");
    expect(document.querySelectorAll(".chrono-session-choice b").length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("button", { name: "Review lap time" }).at(0)!);
    expect(screen.getByRole("heading", { name: "Lap time replay" })).toBeTruthy();
    await waitFor(() => expect(screen.getByLabelText("Replay position").getAttribute("aria-valuetext")).toContain(`Lap 2/${roundOneCircuit.laps}`));
    expect(screen.getByRole("button", { name: "Chrono report" }).className).toContain("highlight-command");
    fireEvent.click(screen.getByRole("button", { name: "Chrono report" }));
    expect(screen.getByRole("heading", { name: "Understand the lap time" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Race" }));
    expect(screen.getByRole("heading", { name: "Lap time replay" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Chrono report" }).className).not.toContain("highlight-command");
    fireEvent.click(screen.getByRole("button", { name: "Back to circuit" }));
    fireEvent.click(screen.getByRole("button", { name: "Review lap time" }));
    expect(screen.getByRole("heading", { name: "Lap time replay" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Back to circuit" }));

    // Championship view
    fireEvent.click(screen.getByRole("button", { name: "Championship" }));
    expect(screen.getByText("Season 1 · Round 1/6")).toBeTruthy();
    expect(screen.getAllByText("Current GP").length).toBe(1);
    expect(document.querySelector(".current-gp-panel")).toBe(null);
    expect(screen.getByText("0/2")).toBeTruthy();
    expect(screen.queryByRole("tab", { name: "Palmares" })).toBe(null);
    fireEvent.click(screen.getByRole("tab", { name: "Circuits" }));
    expect(screen.getByText(t(roundOneCircuit.layoutKey, "en"))).toBeTruthy();
    expect(document.querySelector(".circuit-calendar-list")?.textContent).toContain("1");
    expect(document.querySelector(".current-round-badge")?.textContent).toBe("1");
    expect(document.querySelector(".mini-circuit-start-line")).toBeTruthy();
    const displayedCircuitNames = [...document.querySelectorAll(".circuit-calendar-button strong")].map((node) => node.textContent);
    expect(displayedCircuitNames).toEqual([...CITY_CIRCUITS].map((circuit) => t(circuit.layoutKey, "en")).sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" })));
    fireEvent.click(screen.getByRole("button", { name: /Brussels Grand Place Clash/ }));
    expect(screen.getByLabelText("City circuit map")).toBeTruthy();
    expect(document.querySelector(".circuit-detail-screen .circuit-start-line")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Focus driver" })).toBe(null);
    expect(screen.queryByRole("dialog", { name: "Brussels Grand Place Clash" })).toBe(null);
    fireEvent.click(document.querySelector(".circuit-detail-close")!);
    fireEvent.click(screen.getByRole("button", { name: "Garage" }));
    fireEvent.click(screen.getByRole("button", { name: "Championship" }));
    expect(screen.getByRole("tab", { name: "Circuits" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.click(screen.getByRole("tab", { name: "Standings" }));
    fireEvent.click(screen.getByRole("button", { name: "Garage" }));
    expect(document.querySelector(".garage-overview")?.textContent).toContain("ABC123");
    fireEvent.click(screen.getByRole("button", { name: "Championship" }));
    expect(document.querySelector(".standings-table")?.textContent).toContain("Volt Union");
    fireEvent.click(screen.getByRole("tab", { name: "Grand Prix history" }));
    expect(document.querySelector(".round-timeline")?.textContent).toContain("R1");
    fireEvent.click(screen.getByRole("tab", { name: "Standings" }));

    fireEvent.click(screen.getByRole("button", { name: "Race" }));
    expect(screen.getByRole("button", { name: "Send plan" }).className).toContain("highlight-command");
    fireEvent.click(screen.getByRole("button", { name: "Send plan" }));
    expect(document.querySelector(".race-phase-actions button.highlight-command")).toBe(null);
    expect(screen.getByRole("dialog", { name: "Send race plan" })).toBeTruthy();
    expect(screen.getByText("You still have chrono attempts left. Send the plan now? 2/3")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "Send plan" }).at(-1)!);
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
    expect(screen.getByRole("button", { name: "Launch GP" }).className).toContain("highlight-command");

    // Launch: Course becomes the race replay.
    fireEvent.click(screen.getByRole("button", { name: "Launch GP" }));
    expect(document.querySelector(".race-phase-actions .primary-command")?.className).not.toContain("highlight-command");
    const launchDialog = screen.getByRole("dialog", { name: "Launch Grand Prix?" });
    expect(launchDialog.textContent).toContain("Starting grid");
    expect(launchDialog.textContent).toContain("P1");
    expect(launchDialog.textContent).toContain(roundOneCircuit.city);
    expect(launchDialog.textContent).toContain(`Grip ${roundOneCircuit.traits.grip}`);
    fireEvent.click(screen.getAllByRole("button", { name: "Launch GP" }).at(-1)!);
    expect(await screen.findByRole("heading", { name: "Race replay" })).toBeTruthy();
    expect(window.location.pathname).toBe("/replay/gp_1");
    expect(screen.getByRole("button", { name: "Race" }).className).toContain("active");
    expect(screen.queryByRole("button", { name: "Race info" })).toBe(null);
    expect(screen.getByRole("button", { name: "Report" }).className).toContain("replay-report-button");
    expect(await screen.findByRole("heading", { name: "Race replay" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "4. Grand Prix finished" })).toBe(null);
    expect(screen.getByText("Relive the GP lap by lap: weather, pace, and key moments move the standings.")).toBeTruthy();
    expect(document.querySelector(".replay-moments-panel")).toBe(null);
    expect(document.querySelector(".replay-tower li")?.textContent).toContain("1Volt Union");

    // Timeline markers carry the key moments and seek on click
    expect(document.querySelectorAll(".replay-tick").length).toBe(7);
    expect(document.querySelectorAll(".replay-weather").length).toBe(5);
    expect(document.querySelector(".replay-marker")?.getAttribute("title")).toContain("Rain Grip");
    fireEvent.click(document.querySelector(".replay-marker")!);
    expect(document.querySelector(".replay-moment-notification")?.textContent).toContain("Rain Grip");
    expect(document.querySelector(".replay-moment-notification")?.textContent).toContain("+2 boost");
    expect(document.querySelector(".replay-map-panel")?.className).toContain("circuit-weather-light_rain");
    expect(document.querySelector(".map-car-event")).toBe(null);
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
    expect(window.location.pathname).toBe("/drive");
    expect(screen.getByRole("heading", { name: "4. Grand Prix finished" })).toBeTruthy();
    expect(document.querySelectorAll(".map-final-classification li").length).toBe(resolvedState.currentGrandPrix.result.classification.length);
    expect(document.querySelector(".map-final-classification")?.textContent).toContain("Volt Union");
    expect(document.querySelector(".map-final-classification")?.textContent).toContain("25 pts");
    expect(screen.getByRole("button", { name: "Replay" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Report" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Report" }).className).toContain("highlight-command");
    expect(screen.getByRole("button", { name: "Next GP" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Replay" }));
    expect(await screen.findByRole("heading", { name: "Race replay" })).toBeTruthy();
    expect(window.location.pathname).toBe("/replay/gp_1");
    expect(Array.from(document.querySelector(".result-view")!.children).map((child) => child.id || child.className)).toEqual([
      "result-replay-panel",
      "panel race-payoff-recap"
    ]);
    expect(document.querySelector('image[href="/assets/cars/idle.png"]')).toBeTruthy();
    const replayReportButton = document.querySelector(".replay-report-button") as HTMLButtonElement;
    expect(replayReportButton).toBeTruthy();
    fireEvent.click(replayReportButton);
    expect(screen.getByText(`${roundOneCircuit.title}: Volt Union wins.`)).toBeTruthy();
    expect(window.location.pathname).toBe("/drive");
    expect(screen.queryByText("Movement")).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Back to circuit" }));

    // Report view
    fireEvent.click(screen.getByRole("button", { name: "Report" }));
    expect(screen.getByText(`${roundOneCircuit.title}: Volt Union wins.`)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Replay" }).className).toContain("report-replay-button");
    expect(screen.getByRole("button", { name: "Back to circuit" }).className).toContain("report-close-button");
    fireEvent.click(screen.getByRole("button", { name: "Replay" }));
    expect(await screen.findByRole("heading", { name: "Race replay" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Report" }));
    expect(screen.getByRole("heading", { name: "Race phases" })).toBeTruthy();
    expect(screen.getByLabelText("Race phases")).toBeTruthy();
    expect(screen.getByText("Phase 1")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Race recap" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "What made the difference" })).toBeTruthy();
    expect(screen.getByText(/Weather prep fit the race weather/)).toBeTruthy();
    expect(screen.getByText(/Rain Grip produced/)).toBeTruthy();
    const nextCircuit = testCircuit(2);
    expect(screen.getByText(new RegExp(nextCircuit.title))).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "4. Grand Prix finished" })).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Back to circuit" }));
    expect(screen.getByRole("heading", { name: "4. Grand Prix finished" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Report" }).className).not.toContain("highlight-command");

    // Garage view
    fireEvent.click(screen.getByRole("button", { name: "Garage" }));
    expect(screen.getByRole("heading", { name: "Inventory" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Inventory" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.click(screen.getByRole("tab", { name: "My team" }));
    expect(screen.getByText("Last GP")).toBeTruthy();
    expect(screen.getByText("+150 credits")).toBeTruthy();
    expect(screen.getByText("+25 pts")).toBeTruthy();
    expect(screen.getByText("Consumed Rain Grip")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "My team" })).toBeTruthy();
    fireEvent.click(screen.getByRole("tab", { name: "Inventory" }));
    expect(screen.getByText("No cards in inventory.")).toBeTruthy();
    expect(document.querySelector(".garage-empty-inventory img")).toBe(null);
    fireEvent.click(screen.getByRole("tab", { name: "Shop" }));
    expect(screen.getByRole("button", { name: /Soft Tires/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Qualifying Lap/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Defensive Order/ })).toBeTruthy();

    // One command at a time
    expect(screen.queryByRole("button", { name: "Send plan" })).toBe(null);
    expect(screen.queryByRole("button", { name: "Launch GP" })).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Race" }));
    expect(screen.getByRole("button", { name: "Replay" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Next GP" }).hasAttribute("disabled")).toBe(false);
    expect(screen.getByRole("button", { name: "Next GP" }).className).toContain("highlight-command");

    fireEvent.click(screen.getByRole("button", { name: "Next GP" }));
    expect(document.querySelector(".race-phase-actions .primary-command")?.className).not.toContain("highlight-command");
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
    expect(document.querySelector("#result-replay-panel")).toBeTruthy();
    expect(screen.queryByRole("dialog", { name: "Race replay" })).toBe(null);
    expect(screen.queryByText("Relive the GP lap by lap: weather, pace, and key moments move the standings.")).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Back to circuit" }));
    fireEvent.click(screen.getByRole("button", { name: "Championship" }));
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
    await expectGarageCode("ABC123");
    fireEvent.click(screen.getByRole("button", { name: "Race" }));
    expect(document.querySelector(".profile-menu-button")?.textContent).toBe("VO");

    fireEvent.click(screen.getByRole("button", { name: "Send plan" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Send plan" }).at(-1)!);
    expect(await screen.findByText("Directive locked. You can launch the Grand Prix.")).toBeTruthy();
    expect(document.querySelector(".profile-menu-button")?.textContent).toBe("VO");

    fireEvent.click(screen.getByRole("button", { name: "Launch GP" }));
    expect(screen.getByRole("dialog", { name: "Launch Grand Prix?" }).textContent).toContain("Starting grid");
    fireEvent.click(screen.getAllByRole("button", { name: "Launch GP" }).at(-1)!);
    expect(await screen.findByRole("heading", { name: "Race replay" })).toBeTruthy();
    expect(document.querySelector(".profile-menu-button")?.textContent).toBe("VO");
  });

  it("collapses the launch modal starting grid after the top four", async () => {
    saveProfile();
    localStorage.setItem("cr-league-help-race", "1");
    const teams = [
      ...baseState.teams,
      ...["Apex Four", "Blue Five", "Crimson Six", "Delta Seven"].map((name, index) => ({
        ...baseState.teams[1],
        id: `team_extra_${index}`,
        name
      }))
    ];
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response({ ...decidedState, teams }));

    render(<App />);
    createLeagueFromSetup();

    fireEvent.click(await screen.findByRole("button", { name: "Launch GP" }));
    const launchDialog = screen.getByRole("dialog", { name: "Launch Grand Prix?" });
    expect(launchDialog.textContent).toContain("P4");
    expect(launchDialog.textContent).not.toContain("P5");
    fireEvent.click(within(launchDialog).getByRole("button", { name: "Show full grid (2)" }));
    expect(launchDialog.textContent).toContain("P5");
    expect(launchDialog.textContent).toContain("P6");
  });

  it("celebrates a season rollover once and reopens the recap from palmares", async () => {
    saveProfile();
    const finalRoundResolvedState = {
      ...resolvedState,
      league: {
        ...resolvedState.league,
        maxGrandPrixPerSeason: 1
      }
    };
    const fetch = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(response(finalRoundResolvedState))
      .mockResolvedValueOnce(response(seasonTwoState));

    render(<App />);

    createLeagueFromSetup();
    expect(await screen.findByRole("heading", { name: "Race replay" })).toBeTruthy();
    expect(screen.queryByRole("dialog", { name: "Season recap" })).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Back to circuit" }));
    fireEvent.click(screen.getByRole("button", { name: "Finish season" }));
    expect(screen.getByRole("dialog", { name: "Finish the season?" })).toBeTruthy();
    expect(screen.getByText("This closes the current season, prepares the next one, and shows the season recap.")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "Finish season" }).at(-1)!);
    const recap = await screen.findByRole("dialog", { name: "Season recap" });
    expect(recap.textContent).toContain("Season 1");
    expect(recap.textContent).toContain("Champion");
    expect(recap.textContent).toContain("Volt Union");
    expect(recap.textContent).toContain("Final standings");
    expect(localStorage.getItem("cr-league-season-recap:league_1:1")).toBe("seen");

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(screen.getByRole("button", { name: "Championship" }));
    expect(screen.getByRole("heading", { name: "Circuits" })).toBeTruthy();
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

  it("shows command feedback while a qualifying request is pending", async () => {
    saveProfile();
    let finishQualifying!: (value: Response) => void;
    const pendingQualifying = new Promise<Response>((resolve) => {
      finishQualifying = resolve;
    });
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(response(baseState))
      .mockReturnValueOnce(pendingQualifying);

    render(<App />);
    createLeagueFromSetup();

    await screen.findByRole("button", { name: "Race" });
    fireEvent.click(screen.getByRole("button", { name: "New lap time" }));
    fireEvent.click(screen.getAllByRole("button", { name: "New lap time" }).at(-1)!);

    expect((await screen.findByRole("status")).textContent).toContain("Running qualifying lap...");
    expect(document.querySelector(".pending-feedback")?.textContent).toContain("Running qualifying lap...");

    finishQualifying(response({ state: qualifiedState, run: qualifyingRun, isBest: true }));
    expect(await screen.findByText("New best qualifying time saved.")).toBeTruthy();
  });

  it("closes an open replay when an API action starts", async () => {
    saveProfile();
    let finishQualifying!: (value: Response) => void;
    const pendingQualifying = new Promise<Response>((resolve) => {
      finishQualifying = resolve;
    });
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(response(baseState))
      .mockResolvedValueOnce(response({ state: qualifiedState, run: qualifyingRun, isBest: true }))
      .mockReturnValueOnce(pendingQualifying);

    render(<App />);
    createLeagueFromSetup();

    await screen.findByRole("button", { name: "Race" });
    fireEvent.click(screen.getByRole("button", { name: "New lap time" }));
    fireEvent.click(screen.getAllByRole("button", { name: "New lap time" }).at(-1)!);
    expect(await screen.findByRole("heading", { name: "Lap time replay" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "New lap time" }));
    fireEvent.click(screen.getAllByRole("button", { name: "New lap time" }).at(-1)!);

    expect(screen.queryByRole("heading", { name: "Lap time replay" })).toBe(null);
    expect((await screen.findByRole("status")).textContent).toContain("Running qualifying lap...");

    finishQualifying(response({ state: qualifiedState, run: qualifyingRun, isBest: true }));
    expect(await screen.findByText("New best qualifying time saved.")).toBeTruthy();
  });

  it("shows pending feedback while starting the next Grand Prix", async () => {
    saveProfile();
    window.history.replaceState(null, "", "/replay/gp_1");
    let finishNextGrandPrix!: (value: Response) => void;
    const pendingNextGrandPrix = new Promise<Response>((resolve) => {
      finishNextGrandPrix = resolve;
    });
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(response(resolvedState))
      .mockReturnValueOnce(pendingNextGrandPrix);

    render(<App />);
    createLeagueFromSetup();

    expect(await screen.findByRole("heading", { name: "Race replay" })).toBeTruthy();
    await closeLeagueIntro();
    fireEvent.click(screen.getByRole("button", { name: "Back to circuit" }));
    fireEvent.click(screen.getByRole("button", { name: "Next GP" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Next GP" }).at(-1)!);

    expect(screen.queryByRole("heading", { name: "Race replay" })).toBe(null);
    expect((await screen.findByRole("status")).textContent).toContain("Starting next Grand Prix...");

    finishNextGrandPrix(response(nextGrandPrixState));
    expect(await screen.findByText("Next Grand Prix started.")).toBeTruthy();
    expect(window.location.pathname).toBe("/drive");
    expect(screen.queryByRole("heading", { name: "Race replay" })).toBe(null);
  });

  it("does not auto-open an old season recap when loading an existing later season", async () => {
    saveProfile();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(seasonTwoState));

    render(<App />);

    createLeagueFromSetup();
    await screen.findByRole("button", { name: "Race" });
    expect(screen.queryByRole("dialog", { name: "Season recap" })).toBe(null);
    expect(localStorage.getItem("cr-league-season-recap:league_1:1")).toBe(null);
  });
});
