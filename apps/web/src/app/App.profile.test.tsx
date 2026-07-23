import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { APP_VERSION } from "@cr-league/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App.js";
import { baseState, otherLeagueState, resolvedState } from "./App.testFixtures.js";
import { createLeagueFromSetup, expectGarageCode, response, saveProfile, withoutPlayer } from "./App.testHelpers.js";

beforeEach(() => {
  window.history.replaceState(null, "", "/drive");
});

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
  window.history.replaceState(null, "", "/");
});

describe("App profile and admin", () => {
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
    expect(await screen.findByText("Profile code copied.")).toBeTruthy();
    expect(screen.queryByText("Profile code copied: ABCD1234")).toBe(null);
  });

  it("hides profile code copy when the code is not stored locally", () => {
    saveProfile({ recoveryCode: undefined });
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Profile menu" }));

    expect(screen.queryByRole("button", { name: "Copy profile code" })).toBe(null);
  });

  it("requests a recovery code without exposing profile creation state", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response({ ok: true, message: "If a profile exists for this email, a fresh recovery code will be sent." }));

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Create profile/ }));
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "pilot@example.test" } });
    fireEvent.submit(screen.getByLabelText("Email").closest("form")!);

    expect(await screen.findByText("If a profile exists for this email, a fresh recovery code will be sent.")).toBeTruthy();
    expect(screen.getByLabelText("Recovery code")).toBeTruthy();
  });

  it("prefills the profile email field from the last local profile email", () => {
    localStorage.setItem("cr-league-profile-email", "pilot@example.test");

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Create profile/ }));
    expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe("pilot@example.test");
  });

  it("requests a fresh recovery code by email from the recover form", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response({ ok: true, message: "If a profile exists for this email, a fresh recovery code will be sent." }));

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Recover profile/ }));
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "pilot@example.test" } });
    fireEvent.click(screen.getByRole("button", { name: "Email me a fresh code" }));

    expect(await screen.findByText("If a profile exists for this email, a fresh recovery code will be sent.")).toBeTruthy();
    expect(fetch).toHaveBeenCalledWith("http://localhost:4874/profiles/recovery-code", expect.objectContaining({ method: "POST", body: JSON.stringify({ email: "pilot@example.test" }) }));
  });

  it("shows profile recovery misses inline without opening the technical error modal", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: "Profile not found." })
    } as Response);

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Recover profile/ }));
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "missing@example.test" } });
    fireEvent.change(screen.getByLabelText("Recovery code"), { target: { value: "BADCODE" } });
    fireEvent.submit(screen.getByLabelText("Recovery code").closest("form")!);

    expect(await screen.findAllByText("No profile matches this email and recovery code. Check both fields and try again.")).not.toHaveLength(0);
    expect(screen.queryByRole("dialog", { name: "Action blocked" })).toBe(null);
  });

  it("opens release notes from the centered profile version", async () => {
    saveProfile();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState));
    render(<App />);
    createLeagueFromSetup();

    expect(await screen.findByRole("heading", { name: "1. Read the circuit" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Profile menu" }));
    fireEvent.click(screen.getByRole("button", { name: `v${APP_VERSION}` }));

    expect(screen.getByRole("heading", { name: "What's new" })).toBeTruthy();
    expect(screen.getByText(`Current local version: v${APP_VERSION}.`)).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Navigation, admin operations, and circuit polish for CR League." })).toBeTruthy();
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

    expect(await screen.findByRole("heading", { name: "4. Grand Prix finished" })).toBeTruthy();
    await openRaceReplayFromFinalClassification();
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
    localStorage.setItem("cr-league-garage-panel", "team");
    localStorage.setItem("cr-league-championship-record-tab", "calendar");
    localStorage.setItem("cr-league-help-race", "1");
    localStorage.setItem("cr-league-help-plan", "1");
    localStorage.setItem("cr-league-help-garage", "1");
    localStorage.setItem("cr-league-help-profile-code", "1");
    localStorage.setItem("cr-league-card-consumption-help", "1");
    localStorage.setItem("cr-league-card-consumption-help-v2", "1");
    localStorage.setItem("cr-league-season-recap:league_1:1", "1");

    render(<App />);
    createLeagueFromSetup();

    expect(await screen.findByRole("heading", { name: "4. Grand Prix finished" })).toBeTruthy();
    await openRaceReplayFromFinalClassification();
    expect(await screen.findByRole("heading", { name: "Race replay" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Speed ×4" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Focus driver" }).className).not.toContain("active");
    fireEvent.click(screen.getByLabelText("Close Race replay"));
    expect(screen.queryByRole("heading", { name: "Race replay" })).toBe(null);
    expect(localStorage.getItem("cr-league-dismissed-replay-help")).toBe("1");

    fireEvent.click(screen.getByRole("button", { name: "Profile menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset UI preferences" }));
    expect(screen.getByRole("dialog", { name: "Reset UI preferences?" })).toBeTruthy();
    expect(localStorage.getItem("cr-league-dismissed-replay-help")).toBe("1");
    fireEvent.click(screen.getAllByRole("button", { name: "Reset UI preferences" }).at(-1)!);

    expect(await screen.findByText("UI preferences reset. Help panels and replay preferences are back to default.")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Race replay" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Speed ×1" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Focus driver" }).className).toContain("active");
    fireEvent.click(screen.getByRole("button", { name: "Stand" }));
    expect(screen.getByRole("heading", { name: "4. Grand Prix finished" })).toBeTruthy();
    expect(localStorage.getItem("cr-league-dismissed-replay-help")).toBe(null);
    expect(localStorage.getItem("cr-league-replay-speed")).toBe(null);
    expect(localStorage.getItem("cr-league-replay-focus")).toBe(null);
    expect(localStorage.getItem("cr-league-garage-panel")).toBe(null);
    expect(localStorage.getItem("cr-league-championship-record-tab")).toBe(null);
    expect(localStorage.getItem("cr-league-help-race")).toBe(null);
    expect(localStorage.getItem("cr-league-help-plan")).toBe(null);
    expect(localStorage.getItem("cr-league-help-garage")).toBe(null);
    expect(localStorage.getItem("cr-league-help-profile-code")).toBe(null);
    expect(localStorage.getItem("cr-league-card-consumption-help")).toBe(null);
    expect(localStorage.getItem("cr-league-card-consumption-help-v2")).toBe(null);
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
    fireEvent.submit(screen.getByLabelText("Join code").closest("form")!);

    await expectGarageCode("ABC123");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:4874/leagues/join",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          code: "ABC123",
          teamName: "Volt Union",
          profileId: "profile_1",
          recoveryCode: "ABCD1234"
        })
      })
    );
    expect(localStorage.getItem("cr-league-player-claims")).toContain("Office League");
    expect(localStorage.getItem("cr-league-active-player-claim")).toBe("team_1");
  });

  it("keeps incomplete join league validation inline", () => {
    saveProfile();
    const fetch = vi.spyOn(globalThis, "fetch");

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Join league/ }));
    fireEvent.submit(screen.getByLabelText("Join code").closest("form")!);

    expect(screen.getByText("Enter a league code and team name.")).toBeTruthy();
    expect(screen.queryByRole("dialog", { name: "Action blocked" })).toBe(null);
    expect(fetch).not.toHaveBeenCalled();
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

    expect(await screen.findByRole("button", { name: "Stand" })).toBeTruthy();
    expect(document.querySelector(".notification-stack")).toBe(null);
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
    let resolveSwitch!: (value: Response) => void;
    const pendingSwitch = new Promise<Response>((resolve) => {
      resolveSwitch = resolve;
    });
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState)).mockReturnValueOnce(pendingSwitch);

    render(<App />);

    expect(await screen.findByRole("button", { name: "Stand" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Profile menu" }));
    fireEvent.change(screen.getByLabelText("Active league"), { target: { value: "team_3" } });
    expect(document.querySelector(".profile-menu-panel .pending-feedback")?.textContent).toContain("Rejoining league...");
    resolveSwitch(response(otherLeagueState));

    await expectGarageCode("NIGHT1");
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

    expect(await screen.findByRole("button", { name: "Stand" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Profile menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Manage league" }));

    expect(screen.getByRole("button", { name: /Create league/ })).toBeTruthy();
    expect(screen.getByText("Saved leagues")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Profile menu" }));
    expect(screen.getByRole("button", { name: "Copy profile code" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Office League/ }));

    await expectGarageCode("ABC123");
  });

  it("returns to the home setup screen when clicking the brand", async () => {
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
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response(baseState));

    render(<App />);

    expect(await screen.findByRole("button", { name: "Stand" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Office League" }));

    expect(screen.getByRole("heading", { name: "Stand" })).toBeTruthy();
    expect(screen.getByText("Saved leagues")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Office League/ })).toBeTruthy();
  });

  it("keeps setup league chrome focused when no league is active", () => {
    saveProfile();

    render(<App />);

    expect(screen.getByText("Saved leagues")).toBeTruthy();
    expect(screen.getByText("No saved leagues yet.")).toBeTruthy();
    expect(document.querySelector(".saved-leagues-empty img")).toBe(null);
    expect(screen.queryByLabelText("Language")).toBe(null);

    fireEvent.click(screen.getByRole("button", { name: "Profile menu" }));
    expect(screen.getByLabelText("Language")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Manage league" })).toBe(null);
    expect(screen.queryByRole("button", { name: "Admin" })).toBe(null);
    expect(screen.getByRole("button", { name: "Copy profile code" })).toBeTruthy();
  });

  it("keeps stored admin eligibility without a public admin-status refresh", () => {
    saveProfile({ admin: true });
    const fetch = vi.spyOn(globalThis, "fetch");

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Profile menu" }));

    expect(screen.getByRole("button", { name: "Admin" })).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem("cr-league-profile-session") ?? "{}").admin).toBe(true);
  });

  it("opens the admin console from the profile menu and performs primary admin actions", async () => {
    saveProfile({ admin: true });
    const pagination = { page: 1, limit: 100, total: 1, totalPages: 1, hasPrevious: false, hasNext: false };
    const users = {
      pagination,
      users: [
        {
          id: "profile_1",
          email: "pilot@example.test",
          createdAt: "2026-07-19T00:00:00.000Z",
          teamCount: 1,
          leagueCount: 1
        }
      ]
    };
    const emptyUsers = { pagination: { ...pagination, total: 0 }, users: [] };
    const leagues = {
      pagination,
      leagues: [
        {
          id: "league_1",
          code: "ABC123",
          name: "Office League",
          status: "active",
          currentSeason: 1,
          currentRound: 1,
          playerCount: 1,
          teamCount: 2,
          createdAt: "2026-07-19T00:00:00.000Z"
        }
      ]
    };
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(response(users))
      .mockResolvedValueOnce(response(leagues))
      .mockResolvedValueOnce(response(users))
      .mockResolvedValueOnce(response({ ok: true, deleted: { profiles: 1, leagues: 0, teams: 0, grandPrixes: 0, decisions: 0 } }))
      .mockResolvedValueOnce(response(users))
      .mockResolvedValueOnce(response(leagues))
      .mockResolvedValueOnce(response({ recoveryCode: "FACE1234" }))
      .mockResolvedValueOnce(response(users))
      .mockResolvedValueOnce(response({ ok: true }))
      .mockResolvedValueOnce(response(emptyUsers))
      .mockResolvedValueOnce(response(withoutPlayer(baseState)));

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Profile menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Admin" }));
    expect(screen.getByRole("heading", { name: "Admin console" })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Admin token"), { target: { value: "secret-admin-token" } });
    fireEvent.click(screen.getByRole("button", { name: "Connect" }));

    await screen.findByText("pilot@example.test");
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "http://localhost:4874/admin/users?page=1&limit=100",
      expect.objectContaining({ headers: expect.objectContaining({ authorization: "Bearer secret-admin-token" }) })
    );
    expect(screen.getByText("Page 1/1 · 1 total")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Filter users"), { target: { value: "pilot" } });
    fireEvent.click(screen.getByRole("button", { name: "Filter" }));
    await waitFor(() =>
      expect(fetch).toHaveBeenNthCalledWith(
        3,
        "http://localhost:4874/admin/users?page=1&limit=100&q=pilot",
        expect.objectContaining({ headers: expect.objectContaining({ authorization: "Bearer secret-admin-token" }) })
      )
    );
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const cleanupButton = screen.getAllByRole("button", { name: "Clean test data" }).at(0)! as HTMLButtonElement;
    await waitFor(() => expect(cleanupButton.disabled).toBe(false));
    fireEvent.click(cleanupButton);
    await waitFor(() =>
      expect(fetch).toHaveBeenNthCalledWith(
        4,
        "http://localhost:4874/admin/test-data-cleanup",
        expect.objectContaining({
          body: JSON.stringify({ profileIds: ["profile_1"], confirmation: "DELETE TEST DATA" }),
          headers: expect.objectContaining({ authorization: "Bearer secret-admin-token" })
        })
      )
    );
    expect(screen.getByText("1 teams · 1 leagues")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Reset recovery" }));
    expect(await screen.findByDisplayValue("FACE1234")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Delete user" }));
    expect(screen.getByRole("dialog", { name: "Delete user?" })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Type the email to confirm"), { target: { value: "pilot@example.test" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Delete user" }).at(-1)!);
    await screen.findByText("No profiles found.");

    fireEvent.click(screen.getByRole("tab", { name: "Leagues" }));
    expect(screen.getByText("Office League")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Inspect" }));

    expect(await screen.findByText("Admin inspection mode: read-only league context, no player claim loaded.")).toBeTruthy();
    expect(fetch).toHaveBeenLastCalledWith(
      "http://localhost:4874/admin/leagues/league_1",
      expect.objectContaining({ headers: expect.objectContaining({ authorization: "Bearer secret-admin-token" }) })
    );
    expect(screen.queryByRole("button", { name: "Submit directive" })).toBe(null);
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
    expect(screen.getByRole("heading", { name: "Start your championship" })).toBeTruthy();
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
    fireEvent.submit(screen.getByLabelText("Recovery code").closest("form")!);

    await screen.findByRole("dialog", { name: "Action blocked" });
    expect(document.querySelector(".setup-main-panel")?.textContent).toContain("Something went wrong. Try again in a moment.");
    expect(document.querySelector(".setup-main-panel")?.textContent).not.toContain("db.profile.findUnique");
    expect(screen.getByRole("dialog", { name: "Action blocked" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Copy error detail" }));

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("ownerTeamId"));
  });
});
