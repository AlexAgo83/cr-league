import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App.js";
import { CITY_CIRCUITS } from "./circuits.js";
import { testCircuit, baseState, decidedState, resolvedState, nextGrandPrixState, seasonTwoState, qualifyingRun, qualifiedState, decidedStateWithQualifying, settingsState } from "./App.testFixtures.js";
import { closeLeagueIntro, createLeagueFromSetup, expectGarageCode, response, saveProfile, withoutPlayer } from "./App.testHelpers.js";
import { t } from "../i18n/index.js";

beforeEach(() => {
  window.history.replaceState(null, "", "/drive");
});

function setDocumentVisibility(visibilityState: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", { configurable: true, value: visibilityState });
}

function saveActiveClaim() {
  const claim = {
    teamId: "team_1",
    claimCode: "CLAIM123",
    leagueId: "league_1",
    leagueName: "Office League",
    leagueCode: "ABC123",
    teamName: "Volt Union"
  };
  localStorage.setItem("cr-league-player-claims", JSON.stringify([claim]));
  localStorage.setItem("cr-league-active-player-claim", "team_1");
  localStorage.setItem("cr-league-help-league-intro:league_1", "1");
  localStorage.setItem("cr-league-help-race:league_1", "1");
  localStorage.setItem("cr-league-help-garage:league_1", "1");
}

function staleResponse() {
  return {
    ok: false,
    status: 404,
    json: async () => ({ message: "Claim expired" })
  } as Response;
}

async function openRaceReplayFromFinalClassification() {
  const reportButton = screen
    .getAllByRole("button", { name: "View" })
    .find((button) => button.getAttribute("title") === "Final classification");
  expect(reportButton).toBeTruthy();
  fireEvent.click(reportButton!);
  fireEvent.click(await screen.findByRole("button", { name: "Review race" }));
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  localStorage.clear();
  setDocumentVisibility("visible");
  window.history.replaceState(null, "", "/");
});

describe("App", () => {
  it("shows the animated home splash at the root and enters the app on press start", () => {
    window.history.replaceState(null, "", "/");

    render(<App />);

    expect(screen.getByRole("main", { name: "CR League home" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "PRESS START" })).toBeTruthy();
    expect(document.querySelector(".home-splash-title-cr")).toBeTruthy();
    expect(document.querySelector(".home-splash-title-league")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Create profile/ })).toBe(null);

    fireEvent.click(screen.getByRole("button", { name: "PRESS START" }));

    expect(screen.queryByRole("main", { name: "CR League home" })).toBe(null);
    expect(screen.getByRole("button", { name: /Create profile/ })).toBeTruthy();
  });

  it("bypasses the splash for deep initial routes", () => {
    window.history.replaceState(null, "", "/garage");

    render(<App />);

    expect(screen.queryByRole("main", { name: "CR League home" })).toBe(null);
    expect(screen.getByRole("button", { name: /Create profile/ })).toBeTruthy();
  });

  it("carries the splash language choice into the app", () => {
    window.history.replaceState(null, "", "/");

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Français/ }));

    expect(screen.getByRole("main", { name: "Accueil CR League" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "APPUYER START" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "APPUYER START" }));

    expect(screen.getByRole("button", { name: /Créer profil/ })).toBeTruthy();
    expect(localStorage.getItem("cr-league-language")).toBe("fr");
  });

  it("switches the interface language", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Français/ }));

    expect(screen.getByRole("button", { name: /Créer profil/ })).toBeTruthy();
    expect(screen.getByText("Lancer ton championnat")).toBeTruthy();
    expect(localStorage.getItem("cr-league-language")).toBe("fr");
  });

  it("auto-dismisses floating notifications after 2 seconds", async () => {
    vi.useFakeTimers();
    saveProfile();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState));

    render(<App />);
    createLeagueFromSetup();

    await act(async () => {});
    expect(screen.getByText("League created. Submit your race directive.")).toBeTruthy();
    expect(screen.queryByText("Creating league...")).toBe(null);
    act(() => vi.advanceTimersByTime(2_000));
    expect(screen.queryByText("League created. Submit your race directive.")).toBe(null);
  });

  it("keeps one-shot help reusable unless the player opts out", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response({ profile: { id: "profile_1", email: "pilot@example.test" }, recoveryCode: "ABCD1234", teams: [] }));

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Recover profile/ }));
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "pilot@example.test" } });
    fireEvent.change(screen.getByLabelText("Recovery code"), { target: { value: "ABCD1234" } });
    fireEvent.submit(screen.getByLabelText("Recovery code").closest("form")!);

    const checkbox = await screen.findByLabelText("I saved this code");
    expect((checkbox as HTMLInputElement).checked).toBe(false);
    expect(localStorage.getItem("cr-league-help-profile-code")).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Got it" }));
    expect(localStorage.getItem("cr-league-help-profile-code")).toBe(null);
  });

  it("dismisses one-shot help only when the player checks the opt-out", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response({ profile: { id: "profile_1", email: "pilot@example.test" }, recoveryCode: "ABCD1234", teams: [] }));

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Recover profile/ }));
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "pilot@example.test" } });
    fireEvent.change(screen.getByLabelText("Recovery code"), { target: { value: "ABCD1234" } });
    fireEvent.submit(screen.getByLabelText("Recovery code").closest("form")!);

    fireEvent.click(await screen.findByLabelText("I saved this code"));
    fireEvent.click(screen.getByRole("button", { name: "Got it" }));

    expect(localStorage.getItem("cr-league-help-profile-code")).toBe("1");
  });

  it("keeps league onboarding dismissed after a plain close", async () => {
    saveProfile();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(resolvedState));

    render(<App />);
    createLeagueFromSetup();

    expect(await screen.findByRole("heading", { name: "4. Grand Prix finished" })).toBeTruthy();
    await closeLeagueIntro();
    fireEvent.click(screen.getByRole("button", { name: "Garage" }));
    expect(await screen.findByRole("dialog", { name: "Use the garage for the next GP" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Got it" }));
    expect(screen.queryByRole("dialog", { name: "Use the garage for the next GP" })).toBe(null);

    fireEvent.click(screen.getByRole("button", { name: "Championship" }));
    fireEvent.click(screen.getByRole("button", { name: "Garage" }));

    expect(screen.queryByRole("dialog", { name: "Use the garage for the next GP" })).toBe(null);
  });

  it("summarizes the player payoff after a resolved grand prix", async () => {
    saveProfile();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(resolvedState));

    render(<App />);
    createLeagueFromSetup();

    expect(await screen.findByRole("heading", { name: "4. Grand Prix finished" })).toBeTruthy();
    await closeLeagueIntro();
    await openRaceReplayFromFinalClassification();
    fireEvent.click(await screen.findByRole("button", { name: "Skip to result" }));

    const payoff = screen.getByLabelText("What you gained");
    expect(payoff.textContent).toContain("P1");
    expect(payoff.textContent).toContain("+25 pts");
    expect(payoff.textContent).toContain("+150 credits");
    expect(payoff.textContent).toContain("Rain Grip");
    expect(payoff.textContent).toContain("P1 (Held position)");
  });

  it("creates a league through form submit", async () => {
    saveProfile();
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState));

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Create league/ }));
    fireEvent.submit(screen.getByLabelText("League").closest("form")!);

    expect(await screen.findByRole("heading", { name: "1. Read the circuit" })).toBeTruthy();
    expect(fetch).toHaveBeenCalledWith("http://localhost:4874/leagues", expect.objectContaining({ method: "POST" }));
  });

  it("refreshes the active league once when returning to a visible tab", async () => {
    saveProfile();
    saveActiveClaim();
    const refreshedState = { ...baseState, league: { ...baseState.league, name: "Office League Fresh" } };
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState)).mockResolvedValueOnce(response(refreshedState));

    render(<App />);

    await screen.findByRole("button", { name: "Stand" });
    fireEvent.click(screen.getByRole("button", { name: "Garage" }));
    await waitFor(() => expect(document.querySelector(".garage-grid")).toBeTruthy());

    setDocumentVisibility("visible");
    document.dispatchEvent(new Event("visibilitychange"));

    await screen.findByText("Office League Fresh");
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenLastCalledWith(
      "http://localhost:4874/leagues/rejoin",
      expect.objectContaining({ body: JSON.stringify({ teamId: "team_1", claimCode: "CLAIM123" }) })
    );
    expect(document.querySelector(".garage-grid")).toBeTruthy();
    expect(screen.queryByText("League rejoined.")).toBe(null);
  });

  it("previews garage car skins before saving the selected skin", async () => {
    saveProfile();
    saveActiveClaim();
    const stateWithSavedSkin = { ...baseState, teams: [{ ...baseState.teams[0]!, unlockedCarAssetIds: ["car-008", "car-009"], livery: { ...baseState.teams[0]!.livery, carAssetId: "car-008" } }, baseState.teams[1]!] };
    const updatedState = { ...baseState, teams: [{ ...baseState.teams[0]!, unlockedCarAssetIds: ["car-008", "car-009"], livery: { ...baseState.teams[0]!.livery, carAssetId: "car-009" } }, baseState.teams[1]!] };
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(stateWithSavedSkin)).mockResolvedValueOnce(response(updatedState)).mockResolvedValueOnce(response(updatedState));

    render(<App />);

    await screen.findByRole("button", { name: "Stand" });
    fireEvent.click(screen.getByRole("button", { name: "Garage" }));
    await waitFor(() => expect(document.querySelector(".garage-grid")).toBeTruthy());

    fireEvent.click(screen.getByRole("button", { name: "Next car skin" }));
    expect(fetch).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Select" }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(JSON.parse((fetch.mock.calls[1]?.[1] as RequestInit).body as string).livery.carAssetId).toBe("car-009");
    expect(screen.queryByText("Car colors updated.")).toBe(null);

    fireEvent.click(screen.getByRole("button", { name: "Next car skin" }));
    fireEvent.click(screen.getByRole("tab", { name: "My team" }));
    fireEvent.change(screen.getByLabelText("Primary"), { target: { value: "#111111" } });
    fireEvent.click(screen.getByRole("button", { name: "Save colors" }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    expect(JSON.parse((fetch.mock.calls[2]?.[1] as RequestInit).body as string).livery.carAssetId).toBe("car-009");
  });

  it("unlocks and equips paid garage cars", async () => {
    saveProfile();
    saveActiveClaim();
    const garageState = { ...baseState, teams: [{ ...baseState.teams[0]!, credits: 3_000, unlockedCarAssetIds: [] }, baseState.teams[1]!] };
    const purchasedState = {
      ...garageState,
      teams: [{ ...garageState.teams[0]!, credits: 2_000, unlockedCarAssetIds: ["car-008"], livery: { ...garageState.teams[0]!.livery, carAssetId: "car-008" } }, garageState.teams[1]!]
    };
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(garageState)).mockResolvedValueOnce(response(purchasedState));

    render(<App />);
    await screen.findByRole("button", { name: "Stand" });
    fireEvent.click(screen.getByRole("button", { name: "Garage" }));
    await waitFor(() => expect(document.querySelector(".garage-grid")).toBeTruthy());

    for (let index = 0; index < 7; index += 1) fireEvent.click(screen.getByRole("button", { name: "Next car skin" }));
    expect(document.querySelectorAll(".garage-car-preview-frame.locked")).toHaveLength(2);
    expect(document.querySelectorAll(".garage-car-lock")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "Unlock · 1000" }));
    const dialog = screen.getByRole("dialog", { name: "Unlock this car?" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Unlock for 1000" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(fetch).toHaveBeenLastCalledWith(
      "http://localhost:4874/leagues/league_1/cars/buy",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ teamId: "team_1", claimCode: "CLAIM123", carAssetId: "car-008" }) })
    );
    expect(await screen.findByRole("button", { name: "Selected" })).toBeTruthy();
    expect(document.querySelector(".garage-car-lock")).toBe(null);
  });

  it("skips tab-return refresh while hidden, without a claim, or already loading", async () => {
    saveProfile();
    let finishQualifying!: (value: Response) => void;
    const pendingQualifying = new Promise<Response>((resolve) => {
      finishQualifying = resolve;
    });
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState)).mockReturnValueOnce(pendingQualifying);

    render(<App />);
    createLeagueFromSetup();

    await screen.findByRole("button", { name: "Stand" });
    setDocumentVisibility("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(fetch).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Plan" }));
    fireEvent.click(screen.getByRole("tab", { name: "Chrono" }));
    fireEvent.click(screen.getByRole("button", { name: "New chrono" }));
    fireEvent.click(screen.getAllByRole("button", { name: "New chrono" }).at(-1)!);
    await screen.findByRole("status");

    setDocumentVisibility("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(fetch).toHaveBeenCalledTimes(2);

    finishQualifying(response({ state: qualifiedState, run: qualifyingRun, isBest: true }));
    await screen.findByText("New best qualifying time saved.");
    cleanup();
    localStorage.clear();
    fetch.mockClear();

    render(<App />);
    document.dispatchEvent(new Event("visibilitychange"));

    expect(fetch).toHaveBeenCalledTimes(0);
  });

  it("clears a stale active claim on tab-return refresh", async () => {
    saveProfile();
    saveActiveClaim();
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState)).mockResolvedValueOnce(staleResponse());

    render(<App />);

    await screen.findByRole("button", { name: "Stand" });
    document.dispatchEvent(new Event("visibilitychange"));

    await waitFor(() => expect(localStorage.getItem("cr-league-player-claims")).toBe("[]"));
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(localStorage.getItem("cr-league-active-player-claim")).toBe(null);
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

    expect(await screen.findByRole("heading", { name: "4. Grand Prix finished" })).toBeTruthy();
    await closeLeagueIntro();
    await openRaceReplayFromFinalClassification();
    fireEvent.click(await screen.findByRole("button", { name: "Skip to result" }));

    expect(screen.getByLabelText("What you gained").textContent).toContain("No card spent");
  });

  it("opens garage onboarding before the current GP is resolved", async () => {
    saveProfile();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState));

    render(<App />);
    createLeagueFromSetup();

    expect(await screen.findByRole("heading", { name: "1. Read the circuit" })).toBeTruthy();
    await closeLeagueIntro();
    const raceIntro = await screen.findByRole("dialog", { name: "Read the stand" });
    fireEvent.click(within(raceIntro).getByRole("button", { name: "Got it" }));
    fireEvent.click(screen.getByRole("button", { name: "Garage" }));

    expect(await screen.findByRole("dialog", { name: "Use the garage for the next GP" })).toBeTruthy();
  });

  it("reset UI preferences reopens onboarding help on the current screen", async () => {
    saveProfile();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(resolvedState));
    localStorage.setItem("cr-league-help-garage:league_1", "1");

    render(<App />);
    createLeagueFromSetup();

    expect(await screen.findByRole("heading", { name: "4. Grand Prix finished" })).toBeTruthy();
    await closeLeagueIntro();
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
    const sellDialog = screen.getByRole("dialog", { name: "Rain Grip" });
    expect(sellDialog).toBeTruthy();
    expect(within(sellDialog).queryByRole("heading", { name: "Stats" })).toBe(null);
    expect(sellDialog.querySelector(".garage-buy-card .card-stat-badges")).toBeTruthy();
    expect(sellDialog.querySelector(".garage-buy-card .card-stat-details")).toBe(null);
    expect(sellDialog.querySelector(".garage-buy-modal > .card-stat-details")).toBe(null);
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
    const buyDialog = screen.getByRole("dialog", { name: "Confirm card purchase" });
    expect(buyDialog).toBeTruthy();
    expect(within(buyDialog).queryByRole("heading", { name: "Stats" })).toBe(null);
    expect(buyDialog.querySelector(".garage-buy-card .card-stat-badges")).toBeTruthy();
    expect(buyDialog.querySelector(".garage-buy-card .card-stat-details")).toBe(null);
    expect(buyDialog.querySelector(".garage-buy-modal > .card-stat-details")).toBe(null);
    expect(screen.getByRole("button", { name: "Buy card" })).toBeTruthy();
    expect(screen.getByText("You do not have enough credits to buy this card yet.")).toBeTruthy();
    expect(localStorage.getItem("cr-league-garage-panel")).toBe("shop");
  });

  it("sorts owned garage cards by name and marks sellable cards", async () => {
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
    expect(cards.map((text) => text.match(/Rain Grip|Soft Tires|Qualifying Lap|Defensive Order/)?.[0])).toEqual(["Defensive Order", "Qualifying Lap", "Rain Grip", "Soft Tires"]);
    expect(cards.every((text) => !text.includes("Sell for"))).toBe(true);
  });

  it("does not auto-select a card after buying one", async () => {
    saveProfile();
    const emptyGarageState = {
      ...baseState,
      teams: [{ ...baseState.teams[0], credits: 2000, cards: [] }, baseState.teams[1]]
    };
    const boughtState = {
      ...emptyGarageState,
      teams: [{ ...emptyGarageState.teams[0], credits: 1760, cards: ["rain_grip", "rain_grip"] }, baseState.teams[1]]
    };
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(emptyGarageState)).mockResolvedValueOnce(response(boughtState));

    render(<App />);
    createLeagueFromSetup();
    await screen.findByRole("button", { name: "Garage" });

    fireEvent.click(screen.getByRole("button", { name: "Garage" }));
    fireEvent.click(screen.getByRole("tab", { name: "Shop" }));
    fireEvent.click(screen.getByRole("button", { name: /Rain Grip/ }));
    const quantitySelect = screen.getByRole("combobox", { name: "Quantity" });
    expect(within(screen.getByRole("dialog", { name: "Confirm card purchase" })).queryByText("Quantity")).toBe(null);
    expect(within(quantitySelect).getAllByRole("option")).toHaveLength(10);
    fireEvent.change(screen.getByRole("combobox", { name: "Quantity" }), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Buy card" }));
    await act(async () => {});
    expect(fetch).toHaveBeenLastCalledWith(
      "http://localhost:4874/leagues/league_1/cards/buy",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ teamId: "team_1", claimCode: "CLAIM123", cardId: "rain_grip", quantity: 2 }) })
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
    expect((screen.getByLabelText("Primary") as HTMLInputElement).value).toBe("#ffffff");
    expect((screen.getByLabelText("Secondary") as HTMLInputElement).value).toBe("#000000");
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
    expect(screen.getByRole("button", { name: "Stand" }).className).toContain("active");
    expect(screen.queryByRole("dialog", { name: "Race replay" })).toBe(null);
    expect(await screen.findByRole("button", { name: "Back to stand" })).toBeTruthy();
    expect(screen.queryByText("Relive the GP lap by lap: weather, pace, and key moments move the standings.")).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Back to stand" }));
    expect(window.location.pathname).toBe("/drive");
  });

  it("plays through the demo league flow", async () => {
    saveProfile();
    const resolvedStateWithQualifying = {
      ...resolvedState,
      currentGrandPrix: {
        ...resolvedState.currentGrandPrix,
        qualifyingRuns: decidedStateWithQualifying.currentGrandPrix.qualifyingRuns
      }
    };
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(response(baseState))
      .mockResolvedValueOnce(response({ state: qualifiedState, run: qualifyingRun, isBest: true }))
      .mockResolvedValueOnce(response(decidedStateWithQualifying))
      .mockResolvedValueOnce(response(resolvedStateWithQualifying))
      .mockResolvedValueOnce(response(nextGrandPrixState))
      .mockResolvedValueOnce(response(settingsState))
      .mockResolvedValueOnce(response(baseState));
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<App />);

    expect(screen.getByRole("heading", { name: "Stand" })).toBeTruthy();

    createLeagueFromSetup();

    // Drive view: map first, plan tuning lives in its own cockpit section.
    await expectGarageCode("ABC123");
    fireEvent.click(screen.getByRole("button", { name: "Stand" }));
    expect(document.querySelector(".command-bar")).toBe(null);
    expect(screen.getByRole("heading", { name: "1. Read the circuit" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Race weather" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Race weather" }));
    expect(screen.getByRole("dialog", { name: "Grand Prix info" }).textContent).toContain("Before launch");
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(document.querySelector(".map-workflow-panel")?.textContent).toContain("1. Read the circuit");
    expect(document.querySelector(".map-plan-panel")?.textContent).toContain("Current planApproachBal.Tire prepWeatherPit strategyStd.Card-");
    expect(screen.getByText("Check the track and forecast, then run a chrono with your current directive to improve the grid.")).toBeTruthy();
    const roundOneCircuit = testCircuit(1);
    expect(screen.getAllByText(t(roundOneCircuit.layoutKey, "en")).length).toBeGreaterThan(0);
    expect(screen.queryByRole("heading", { name: "Tune the race plan" })).toBe(null);
    expect(screen.getByRole("button", { name: "Plan" })).toBeTruthy();
    expect([...document.querySelectorAll(".race-phase-actions button")].map((button) => button.textContent)).toEqual(["New chrono", "Send plan"]);
    expect(document.querySelector(".race-phase-actions")?.textContent).not.toContain("Edit plan");
    expect(within(document.querySelector(".map-plan-panel") as HTMLElement).getByRole("button", { name: "Edit" }).className).toContain("map-plan-edit-button");
    expect(document.querySelectorAll(".race-phase-actions button.highlight-command")).toHaveLength(1);
    fireEvent.click(within(document.querySelector(".map-plan-panel") as HTMLElement).getByRole("button", { name: "Edit" }));
    expect(window.location.pathname).toBe("/plan/approach");
    expect(screen.getByRole("heading", { name: "Tune the race plan" })).toBeTruthy();
    expect(document.querySelector(".plan-recommendation")).toBeTruthy();
    expect(screen.getByText("Your plan")).toBeTruthy();
    const mainTrait = Object.entries(roundOneCircuit.traits).sort((left, right) => right[1] - left[1])[0]![0];
    expect(screen.getByText(t(`plan_recommendation_circuit_${mainTrait}` as Parameters<typeof t>[0], "en"))).toBeTruthy();
    expect(screen.getByText("High-upside plan")).toBeTruthy();
    expect(document.querySelector(".directive-briefing-panel")).toBeTruthy();
    expect(document.querySelector(".directive-selection-panel")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Plan" }).className).toContain("active");
    fireEvent.click(screen.getByRole("tab", { name: "GP" }));
    expect(window.location.pathname).toBe("/plan/report");
    expect(screen.getByRole("heading", { name: `${roundOneCircuit.city} ${t(roundOneCircuit.layoutKey, "en")}` })).toBeTruthy();
    expect(screen.getByText("Race report")).toBeTruthy();
    expect(screen.getByText("Send your plan to unlock the GP and fill this report.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Send" }).className).toContain("primary-command");
    expect(screen.getByRole("heading", { name: "Race phases" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Rewards" })).toBe(null);
    expect(screen.getAllByText("Coming after the GP").length).toBeGreaterThan(1);
    fireEvent.click(screen.getByRole("tab", { name: "Plan" }));
    // The switcher doubles as the plan summary: each tab shows the current pick.
    expect(screen.getByRole("tab", { name: "Approach: Balanced" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Tire prep: Weather" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Pit strategy: Standard swap" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Card: No card" })).toBeTruthy();
    expect(screen.getByText("Keeps the car clean through corners, traffic, and difficult sections.")).toBeTruthy();
    expect([...document.querySelectorAll(".directive-trait-modifier")].map((element) => element.textContent)).toEqual(["±0", "+8", "+4", "+18", "±0"]);
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
    fireEvent.click(screen.getByRole("button", { name: "Stand" }));
    expect(screen.getByRole("heading", { name: "1. Read the circuit" })).toBeTruthy();
    expect(within(document.querySelector(".map-plan-panel") as HTMLElement).getByRole("button", { name: "Edit" }).className).toContain("map-plan-edit-button");
    expect(screen.queryByRole("button", { name: "Result" })).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Stand" }));
    expect(screen.getAllByText("Chronos", { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getByText("0/3")).toBeTruthy();
    expect(screen.getByText("No chronos")).toBeTruthy();
    expect(within(document.querySelector(".map-qualifying-times") as HTMLElement).getByRole("button", { name: "View" })).toBeTruthy();
    const mapActions = document.querySelector(".race-phase-actions") as HTMLElement;
    expect(mapActions.textContent).not.toContain("Review chrono");
    expect([...mapActions.querySelectorAll("button")].map((button) => button.textContent)).toEqual(["New chrono", "Send plan"]);

    // First chrono is launched from the chrono plan screen.
    expect(screen.queryByText("Wait for directives")).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Plan" }));
    fireEvent.click(screen.getByRole("tab", { name: "Chrono" }));
    expect(screen.getByRole("button", { name: "New chrono" }).className).toContain("highlight-command");
    fireEvent.click(screen.getByRole("button", { name: "New chrono" }));
    expect(screen.getByRole("dialog", { name: "Run chrono?" })).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "New chrono" }).at(-1)!);
    expect(await screen.findByText("New best qualifying time saved.")).toBeTruthy();
    expect(JSON.parse((fetch.mock.calls[1]?.[1] as RequestInit).body as string)).toMatchObject({ teamId: "team_1", claimCode: "CLAIM123", laps: 3 });
    expect(await screen.findByRole("heading", { name: "Chrono replay" })).toBeTruthy();
    expect(screen.getByLabelText("Replay position").getAttribute("aria-valuetext")).toContain("Lap 1/3");
    expect(screen.getByText("Relive this run lap by lap:", { exact: false })).toBeTruthy();
    expect(document.querySelector(".replay-overlay-actions")).toBe(null);
    expect(screen.queryByRole("button", { name: "Send plan" })).toBe(null);
    expect(screen.queryByRole("heading", { name: "Run chrono" })).toBe(null);
    expect(screen.queryByText("Your best time sets your grid slot.", { exact: false })).toBe(null);
    expect(screen.queryByRole("button", { name: "Run chrono" })).toBe(null);
    expect(screen.queryByText("Track note")).toBe(null);
    expect(screen.queryByText("Race pace settles")).toBe(null);
    expect(document.querySelector(".replay-tower")).toBe(null);
    expect(within(document.querySelector(".map-qualifying-times") as HTMLElement).getByRole("button", { name: "Review" })).toBeTruthy();
    expect(document.querySelector(".map-qualifying-times")?.textContent).toContain("Chronos");
    expect(document.querySelector(".map-qualifying-times")?.textContent).toContain("Mika Blitz");
    expect(document.querySelector(".map-qualifying-times .position-badge")).toBe(null);
    expect(document.querySelector(".map-qualifying-times")?.textContent).toContain("#1");
    expect(document.querySelector(".map-qualifying-times")?.textContent).toContain("E1T2");
    expect(document.querySelector(".map-qualifying-times")?.textContent).toContain("72.42s");
    expect(document.querySelector(".map-qualifying-times")?.textContent).not.toContain("75.18s");
    const chronoCloseButton = await screen.findByRole("button", { name: "Back to stand" });
    expect(chronoCloseButton.className).toContain("replay-close-button");
    expect(chronoCloseButton.querySelector(".replay-close-label")?.textContent).toBe("Back to stand");
    expect(chronoCloseButton.querySelector(".replay-close-mark")?.textContent).toBe("×");
    fireEvent.click(chronoCloseButton);
    expect(screen.queryByRole("heading", { name: "Chrono replay" })).toBe(null);
    expect(screen.getByText("72.42s")).toBeTruthy();
    expect(document.querySelector(".map-qualifying-times")?.textContent).toContain("E1T2");
    expect(document.querySelector(".map-qualifying-times")?.textContent).not.toContain("75.18s");
    expect(screen.getByRole("button", { name: "Send plan" }).className).toContain("highlight-command");
    expect(document.querySelector(".race-phase-actions")?.textContent).not.toContain("Review chrono");
    expect(screen.getByRole("heading", { name: "2. Chrono / plan" })).toBeTruthy();
    expect(screen.getByText("Chrono 1/3 is logged. Adjust the directive or lock the plan before the GP.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Plan" }));
    expect(screen.getByRole("heading", { name: "Tune the race plan" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Understand the chrono" })).toBe(null);
    fireEvent.click(screen.getByRole("tab", { name: "Chrono" }));
    expect(screen.getByRole("heading", { name: "Understand the chrono" })).toBeTruthy();
    expect(screen.getByLabelText("Understand the chrono").textContent).toContain("72.42s");
    expect(screen.getByLabelText("Understand the chrono").textContent).toContain("P2");
    expect(screen.getByLabelText("Understand the chrono").textContent).toContain("Best run");
    expect(screen.getByLabelText("Session history").textContent).toContain("75.18s");
    expect(document.querySelector(".chrono-report-history li.best-session")?.textContent).toContain("72.42s");
    expect(document.querySelector(".chrono-report-history .type-approach")).toBeTruthy();
    expect(document.querySelector(".chrono-report-history .type-preparation")).toBeTruthy();
    expect(document.querySelector(".chrono-report-history .type-pit.is-faded")).toBeTruthy();
    expect(document.querySelector(".chrono-report-history .type-card")).toBeTruthy();
    expect(document.querySelector(".chrono-report-history .type-card.is-faded")).toBeTruthy();
    expect(document.querySelectorAll(".chrono-session-choice b").length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("button", { name: "Review chrono" }).at(0)!);
    expect(await screen.findByRole("heading", { name: "Chrono replay" })).toBeTruthy();
    expect(screen.getByLabelText("Replay position").getAttribute("aria-valuetext")).toContain("Lap 2/3");
    expect(screen.queryByRole("button", { name: "Report" })).toBe(null);
    expect(screen.queryByRole("button", { name: "New chrono" })).toBe(null);
    fireEvent.click(within(document.querySelector(".map-qualifying-times") as HTMLElement).getByRole("button", { name: "Review" }));
    expect(screen.getByRole("heading", { name: "Understand the chrono" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Stand" }));
    expect(await screen.findByRole("heading", { name: "Chrono replay" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Report" })).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Back to stand" }));
    fireEvent.click(within(document.querySelector(".map-qualifying-times") as HTMLElement).getByRole("button", { name: "Review" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Review chrono" }).at(0)!);
    expect(await screen.findByRole("heading", { name: "Chrono replay" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Back to stand" }));

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
    expect(document.querySelector(".circuit-detail-screen .map-car")).toBeTruthy();
    expect(document.querySelectorAll(".circuit-detail-screen .map-car-trail[data-segment]")).toHaveLength(36);
    expect(within(document.querySelector(".circuit-detail-actions") as HTMLElement).getByRole("button", { name: "Focus driver" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.queryByRole("dialog", { name: "Brussels Grand Place Clash" })).toBe(null);
    fireEvent.click(document.querySelector(".circuit-detail-close")!);
    fireEvent.click(screen.getByRole("button", { name: "Garage" }));
    fireEvent.click(screen.getByRole("button", { name: "Championship" }));
    expect(screen.getByRole("tab", { name: "Circuits" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.click(screen.getByRole("tab", { name: "Standings" }));
    fireEvent.click(screen.getByRole("button", { name: "Garage" }));
    expect(document.querySelector(".garage-overview")?.textContent).not.toContain("ABC123");
    fireEvent.click(screen.getByRole("button", { name: "Championship" }));
    expect(document.querySelector(".championship-overview")?.textContent).toContain("ABC123");
    expect(document.querySelector(".standings-table")?.textContent).toContain("Volt Union");
    fireEvent.click(screen.getByRole("tab", { name: "Grand Prix history" }));
    expect(document.querySelector(".round-timeline")?.textContent).toContain("R1");
    fireEvent.click(screen.getByRole("tab", { name: "Standings" }));

    fireEvent.click(screen.getByRole("button", { name: "Stand" }));
    fireEvent.click(screen.getByRole("button", { name: "Plan" }));
    fireEvent.click(screen.getByRole("tab", { name: "GP" }));
    expect(screen.getByRole("button", { name: "Send" }).className).toContain("primary-command");
    expect(screen.getByRole("button", { name: "Send" }).className).toContain("highlight-command");
    fireEvent.click(screen.getByRole("button", { name: "Stand" }));
    expect(screen.getByRole("button", { name: "Send plan" }).className).toContain("highlight-command");
    fireEvent.click(screen.getByRole("button", { name: "Send plan" }));
    expect(document.querySelector(".race-phase-actions button.highlight-command")).toBe(null);
    const directiveDialog = screen.getByRole("dialog", { name: "Send race plan" });
    expect(directiveDialog.textContent).toContain("You still have chrono attempts left. Send the plan now? 2/3");
    expect(directiveDialog.textContent).toContain("Current planApproachBal.Tire prepWeatherPit strategyStd.CardRain Grip");
    expect(directiveDialog.textContent).toContain("High-upside plan");
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText("Directive locked. You can launch the Grand Prix.")).toBeTruthy();
    expect(JSON.parse((fetch.mock.calls[2]?.[1] as RequestInit).body as string)).toMatchObject({ teamId: "team_1", claimCode: "CLAIM123" });
    fireEvent.click(screen.getByText("Directive locked. You can launch the Grand Prix.").closest(".floating-notification")!.querySelector("button")!);
    expect(screen.queryByText("Directive locked. You can launch the Grand Prix.")).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Stand" }));
    expect(screen.getByRole("heading", { name: "3. Plan locked" })).toBeTruthy();
    expect(document.querySelector(".map-workflow-panel")?.textContent).toContain("3. Plan locked");
    expect(document.querySelector(".map-qualifying-times")?.textContent).toContain("Mika Blitz");
    expect(document.querySelector(".map-qualifying-times")?.textContent).toContain("72.42s");
    expect(document.querySelector(".map-qualifying-times")?.textContent).not.toContain("75.18s");
    expect(document.querySelector(".race-phase-actions")?.textContent).toContain("Launch GP");
    fireEvent.click(within(document.querySelector(".map-plan-performance") as HTMLElement).getByRole("button", { name: "View" }));
    expect(screen.getByRole("heading", { name: "Tune the race plan" })).toBeTruthy();
    expect(document.querySelector(".plan-risk-lock-badge")?.textContent).toBe("Locked");
    expect(document.querySelector(".plan-risk-lock-badge")?.getAttribute("title")).toContain("Plan locked.");
    for (const button of document.querySelectorAll(".directive-panel .choice-card")) {
      expect(button.hasAttribute("disabled")).toBe(true);
    }
    fireEvent.click(screen.getByRole("button", { name: "Stand" }));
    expect(screen.queryByRole("button", { name: "Chrono" })).toBe(null);
    expect(screen.getByRole("button", { name: "Launch GP" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Launch GP" }).className).toContain("highlight-command");
    fireEvent.click(screen.getByRole("button", { name: "Plan" }));
    fireEvent.click(screen.getByRole("tab", { name: "GP" }));
    expect(screen.getByRole("button", { name: "Launch GP" }).className).toContain("primary-command");
    fireEvent.click(screen.getByRole("button", { name: "Stand" }));

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
    await waitFor(() => expect(window.location.pathname).toBe("/replay/gp_1"));
    expect(JSON.parse(localStorage.getItem("cr-league-plan-form") ?? "{}").cardId).toBe("rain_grip");
    expect(screen.getByRole("button", { name: "Stand" }).className).toContain("active");
    expect(screen.queryByRole("button", { name: "Race info" })).toBe(null);
    expect(screen.queryByRole("button", { name: "Report" })).toBe(null);
    expect(await screen.findByRole("heading", { name: "Race replay" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "4. Grand Prix finished" })).toBe(null);
    expect(screen.getByText("Relive the GP lap by lap: weather, pace, and key moments move the standings.")).toBeTruthy();
    expect(document.querySelector(".replay-director-panel .replay-player-gaps")).toBeTruthy();
    expect(document.querySelector(".replay-director-panel .replay-player-gaps .position-badge")).toBe(null);
    expect(document.querySelector(".replay-player-focus-panel")).toBe(null);
    fireEvent.click(within(document.querySelector(".replay-map-panel") as HTMLElement).getByRole("button", { name: "Hide stats" }));
    expect(localStorage.getItem("cr-league-map-stats-expanded")).toBe("0");
    expect(document.querySelector(".replay-map-panel .map-traits-panel")).toBe(null);
    expect(screen.getByRole("button", { name: "Actual race weather" })).toBeTruthy();
    expect(document.querySelector(".replay-moments-panel")).toBe(null);
    expect(document.querySelector(".replay-tower li")?.textContent).toContain("1Volt Union");
    expect(document.querySelector(".replay-map-panel .map-plan-panel")?.textContent).toContain("Current plan");

    // Timeline markers carry the key moments and seek on click
    expect(document.querySelectorAll(".replay-tick").length).toBe(roundOneCircuit.laps);
    expect(document.querySelectorAll(".replay-weather").length).toBe(5);
    expect(screen.queryByText("dot markers are pace and race moments.")).toBe(null);
    expect(screen.queryByText("cloud icons map to the five race phases.")).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Actual race weather" }));
    expect(within(screen.getByRole("dialog", { name: "Grand Prix info" })).getByRole("tab", { name: "Actual race weather" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("dialog", { name: "Grand Prix info" }).textContent).toContain("startDry");
    fireEvent.click(within(screen.getByRole("dialog", { name: "Grand Prix info" })).getByRole("tab", { name: "Stats" }));
    expect(screen.getByRole("dialog", { name: "Grand Prix info" }).textContent).toContain("Gains time when the car can run fast without being held up.");
    fireEvent.click(within(screen.getByRole("dialog", { name: "Grand Prix info" })).getByRole("tab", { name: "Legends" }));
    expect(screen.getByRole("dialog", { name: "Grand Prix info" }).textContent).toContain("dot markers are pace and race moments.");
    expect(screen.getByRole("dialog", { name: "Grand Prix info" }).textContent).toContain("orange dots mark your important moments.");
    expect(screen.getByRole("dialog", { name: "Grand Prix info" }).textContent).toContain("small white dots mark race director moments.");
    expect(screen.getByRole("dialog", { name: "Grand Prix info" }).textContent).toContain("yellow dots mark pit stops.");
    expect(screen.getByRole("dialog", { name: "Grand Prix info" }).textContent).toContain("cloud icons map to the five race phases.");
    expect(screen.getByRole("dialog", { name: "Grand Prix info" }).textContent).toContain("the finish line marks the end of the replay.");
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(document.querySelector(".replay-marker")?.getAttribute("title")).toContain("Rain Grip");
    fireEvent.click(document.querySelector(".replay-marker")!);
    expect(document.querySelector(".replay-moment-notification")?.textContent).toContain("Rain Grip");
    expect(document.querySelector(".replay-moment-notification")?.textContent).toContain("+2 boost");
    expect(document.querySelector(".replay-map-panel")?.className).toContain("circuit-weather-light_rain");
    expect(document.querySelector(".map-car-event")).toBe(null);
    expect(document.querySelector(".replay-tower li")?.textContent).toContain("1Volt Union");
    fireEvent.click(screen.getByRole("button", { name: /Restart/ }));
    expect((document.querySelector(".replay-progress-fill") as HTMLElement).style.width).toBe("0%");
    fireEvent.click(screen.getByRole("button", { name: "Plan" }));
    fireEvent.click(screen.getByRole("tab", { name: "Chrono" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Review chrono" }).at(0)!);
    expect(await screen.findByRole("heading", { name: "Chrono replay" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Race replay" })).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Back to stand" }));
    expect(screen.getByRole("heading", { name: "Race replay" })).toBeTruthy();

    // Replay playback controls
    const pauseButton = screen.getByRole("button", { name: "Pause" });
    expect(pauseButton.querySelector("svg.replay-playback-icon")).toBeTruthy();
    expect(pauseButton.textContent).toBe("");
    fireEvent.click(pauseButton);
    const playButton = screen.getByRole("button", { name: "Play" });
    expect(playButton.querySelector("svg.replay-playback-icon")).toBeTruthy();
    expect(playButton.textContent).toBe("");
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy();
    // Focus is on by default; clicking turns it off and persists that.
    fireEvent.click(screen.getByRole("button", { name: "Focus driver" }));
    expect(localStorage.getItem("cr-league-replay-focus")).toBe("0");
    fireEvent.click(screen.getByRole("button", { name: "Speed ×1" }));
    fireEvent.click(screen.getByRole("button", { name: "×2" }));
    expect(screen.getByRole("button", { name: "Speed ×2" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Back to stand" }).className).toContain("replay-close-button");
    fireEvent.click(screen.getByRole("button", { name: "Back to stand" }));
    expect(screen.queryByRole("heading", { name: "Race replay" })).toBe(null);
    expect(window.location.pathname).toBe("/drive");
    expect(within(document.querySelector(".drive-map-panel") as HTMLElement).getByRole("button", { name: "Show stats" })).toBeTruthy();
    expect(document.querySelector(".drive-map-panel .map-traits-panel")).toBe(null);
    expect(screen.getByRole("heading", { name: "4. Grand Prix finished" })).toBeTruthy();
    expect(document.querySelectorAll(".replay-tower li").length).toBe(resolvedState.currentGrandPrix.result.classification.length);
    expect(document.querySelector(".replay-tower")?.textContent).toContain("Volt Union");
    expect(document.querySelector(".replay-tower")?.textContent).not.toContain("25 pts");
    expect(document.querySelector(".replay-report-button")).toBe(null);
    expect(screen.queryByRole("button", { name: "Replay" })).toBe(null);
    expect(screen.queryByRole("button", { name: "Report" })).toBe(null);
    expect(screen.getByRole("button", { name: "Next GP" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Actual race weather" }));
    expect(screen.getByRole("dialog", { name: "Grand Prix info" }).textContent).toContain("startDry");
    expect(screen.getByRole("dialog", { name: "Grand Prix info" }).textContent).toContain("mid-raceLight rain");
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    const finalReportButton = document.querySelector(".replay-tower .map-plan-edit-button") as HTMLButtonElement;
    expect(finalReportButton).toBeTruthy();
    expect(finalReportButton.textContent).toBe("View");
    fireEvent.click(finalReportButton);

    // Report view
    expect(window.location.pathname).toBe("/plan/report");
    expect(screen.getByRole("tab", { name: "GP" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.queryByText("Volt Union wins.")).toBe(null);
    expect(document.querySelector(".report-replay-button")).toBe(null);
    expect(document.querySelector(".report-close-button")).toBe(null);
    expect(screen.getByRole("heading", { name: "Race phases" })).toBeTruthy();
    expect(screen.getByLabelText("Race phases")).toBeTruthy();
    expect(screen.getByText("Phase 1")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Race recap" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Result" })).toBeTruthy();
    expect(screen.getByText(/Weather prep fit the race weather/)).toBeTruthy();
    expect(screen.getByText(/Rain Grip had a visible effect/)).toBeTruthy();
    const nextCircuit = testCircuit(2);
    expect(screen.getAllByText(new RegExp(nextCircuit.title)).length).toBeGreaterThan(0);
    expect(screen.queryByRole("heading", { name: "4. Grand Prix finished" })).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Stand" }));
    expect(screen.getByRole("heading", { name: "4. Grand Prix finished" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Report" })).toBe(null);

    // Garage view
    fireEvent.click(screen.getByRole("button", { name: "Garage" }));
    expect(screen.getByRole("heading", { name: "Inventory" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Inventory" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.click(screen.getByRole("tab", { name: "My team" }));
    expect(screen.getByText("Last GP")).toBeTruthy();
    expect(document.querySelector(".garage-summary")?.textContent).toContain("+150 credits");
    expect(document.querySelector(".garage-summary")?.textContent).toContain("+25 pts");
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
    fireEvent.click(screen.getByRole("button", { name: "Stand" }));
    expect(screen.queryByRole("button", { name: "Replay" })).toBe(null);
    expect(screen.getByRole("button", { name: "Next GP" }).hasAttribute("disabled")).toBe(false);
    expect(screen.getByRole("button", { name: "Next GP" }).className).toContain("highlight-command");

    fireEvent.click(screen.getByRole("button", { name: "Next GP" }));
    expect(document.querySelector(".race-phase-actions .primary-command")?.className).not.toContain("highlight-command");
    expect(screen.getByRole("dialog", { name: "Start the next race day?" })).toBeTruthy();
    expect(screen.getByText("This opens the next Grand Prix and moves every player back into preparation.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Report" }));
    expect(window.location.pathname).toBe("/plan/report");
    expect(screen.getByRole("tab", { name: "GP" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Stand" }));
    expect(screen.getByRole("heading", { name: "4. Grand Prix finished" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next GP" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.getByRole("heading", { name: "4. Grand Prix finished" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next GP" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Next GP" }).at(-1)!);
    await waitFor(() => expect(JSON.parse(localStorage.getItem("cr-league-plan-form") ?? "{}").cardId).toBe(""));
    expect(document.querySelector(".map-plan-panel")?.textContent).not.toContain("Rain Grip");
    fireEvent.click(await screen.findByRole("button", { name: "Championship" }));
    expect(await screen.findByText("Season 1 · Round 2/6")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Plan" }));
    expect(screen.queryByText("Carried over from the previous Grand Prix.")).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Championship" }));
    fireEvent.click(screen.getByRole("button", { name: "Plan" }));
    expect(screen.queryByText("Carried over from the previous Grand Prix.")).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Championship" }));
    fireEvent.click(screen.getByRole("tab", { name: "Grand Prix history" }));
    expect(document.querySelector(".round-timeline")?.textContent).toContain("P1");
    fireEvent.click(screen.getByRole("button", { name: "S1 R1" }));
    expect(document.querySelector("#result-replay-panel")).toBeTruthy();
    expect(screen.queryByRole("dialog", { name: "Race replay" })).toBe(null);
    expect(screen.queryByText("Relive the GP lap by lap: weather, pace, and key moments move the standings.")).toBe(null);
    fireEvent.click(screen.getByRole("button", { name: "Back to stand" }));
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
    fireEvent.click(within(screen.getByRole("dialog", { name: "Restart session" })).getByRole("button", { name: "Restart session" }));
    expect(await screen.findByText("Playtest session restarted.")).toBeTruthy();
    expect(screen.getByText("Season 1 · Round 1/6")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Forget team" }));
    expect(screen.getAllByText("Team claim forgotten.").length).toBeGreaterThan(0);
    expect(localStorage.getItem("cr-league-player-claims")).toBe("[]");
    expect(localStorage.getItem("cr-league-active-player-claim")).toBe(null);
    expect(fetch).toHaveBeenCalledTimes(7);
  }, 10_000);

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
    fireEvent.click(screen.getByRole("button", { name: "Stand" }));
    expect(document.querySelector(".profile-menu-button")?.textContent).toBe("VO");

    fireEvent.click(screen.getByRole("button", { name: "Send plan" }));
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
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
    expect(await screen.findByRole("heading", { name: "4. Grand Prix finished" })).toBeTruthy();
    expect(screen.queryByRole("dialog", { name: "Season recap" })).toBe(null);
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
    await screen.findByRole("button", { name: "Stand" });
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

    await screen.findByRole("button", { name: "Stand" });
    fireEvent.click(screen.getByRole("button", { name: "Plan" }));
    fireEvent.click(screen.getByRole("tab", { name: "Chrono" }));
    fireEvent.click(screen.getByRole("button", { name: "New chrono" }));
    expect(screen.getByRole("dialog", { name: "Run chrono?" })).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "New chrono" }).at(-1)!);

    expect((await screen.findByRole("status")).textContent).toContain("Running qualifying lap...");
    expect(document.querySelector(".brand-loading-spinner")?.textContent).toContain("Running qualifying lap...");

    finishQualifying(response({ state: qualifiedState, run: qualifyingRun, isBest: true }));
    expect(await screen.findByText("New best qualifying time saved.")).toBeTruthy();
  });

  it("keeps the chrono confirmation for the last attempt", async () => {
    saveProfile();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response({
      ...baseState,
      currentGrandPrix: {
        ...baseState.currentGrandPrix,
        qualifyingRuns: [
          { ...qualifyingRun, attempts: 1, lap: 1 },
          { ...qualifyingRun, attempts: 2, lap: 2, createdAt: "2026-07-18T12:02:00.000Z" }
        ]
      }
    }));

    render(<App />);
    createLeagueFromSetup();

    await screen.findByRole("button", { name: "Stand" });
    fireEvent.click(screen.getByRole("button", { name: "Plan" }));
    fireEvent.click(screen.getByRole("tab", { name: "Chrono" }));
    fireEvent.click(screen.getByRole("button", { name: "New chrono" }));

    expect(screen.getByRole("dialog", { name: "Run chrono?" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Modify" })).toBeTruthy();
    expect(screen.getByText("This attempt uses your current directive and the forecast conditions. Attempts left 1/3")).toBeTruthy();
    expect(screen.getByRole("dialog", { name: "Run chrono?" }).textContent).toContain("Current planApproachBal.Tire prepWeatherPit strategyStd.Card-");
    expect(screen.getByLabelText("Plan risk read")).toBeTruthy();
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

    await screen.findByRole("button", { name: "Stand" });
    fireEvent.click(screen.getByRole("button", { name: "Plan" }));
    fireEvent.click(screen.getByRole("tab", { name: "Chrono" }));
    fireEvent.click(screen.getByRole("button", { name: "New chrono" }));
    fireEvent.click(screen.getAllByRole("button", { name: "New chrono" }).at(-1)!);
    expect(await screen.findByRole("heading", { name: "Chrono replay" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Back to stand" }));
    fireEvent.click(screen.getByRole("button", { name: "Plan" }));
    fireEvent.click(screen.getByRole("tab", { name: "Chrono" }));
    fireEvent.click(screen.getByRole("button", { name: "New chrono" }));
    fireEvent.click(screen.getAllByRole("button", { name: "New chrono" }).at(-1)!);

    expect(screen.queryByRole("heading", { name: "Chrono replay" })).toBe(null);
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

    expect(await screen.findByRole("heading", { name: "4. Grand Prix finished" })).toBeTruthy();
    await closeLeagueIntro();
    fireEvent.click(screen.getByRole("button", { name: "Back to stand" }));
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
    await screen.findByRole("button", { name: "Stand" });
    expect(screen.queryByRole("dialog", { name: "Season recap" })).toBe(null);
    expect(localStorage.getItem("cr-league-season-recap:league_1:1")).toBe(null);
  });
});
