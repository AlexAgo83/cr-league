// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { claimFromState, copyText, loadPlayerClaims, loadProfileSession, PLAYER_CLAIMS_KEY, PROFILE_SESSION_KEY, safeStorage, storeProfileEmail, storeProfileSession } from "./appStorage.js";
import { baseState } from "./App.testFixtures.js";
import type { LeagueState } from "./types.js";

const realStorage = window.localStorage;

afterEach(() => {
  vi.unstubAllGlobals();
  Object.defineProperty(window, "localStorage", { value: realStorage, configurable: true });
});

describe("safeStorage", () => {
  it("falls back when browser storage throws", () => {
    const throwingStorage = {
      getItem: vi.fn(() => {
        throw new DOMException("blocked", "SecurityError");
      }),
      setItem: vi.fn(() => {
        throw new DOMException("full", "QuotaExceededError");
      }),
      removeItem: vi.fn(() => {
        throw new DOMException("blocked", "SecurityError");
      }),
      key: vi.fn(() => {
        throw new DOMException("blocked", "SecurityError");
      }),
      length: 1
    };
    Object.defineProperty(window, "localStorage", { value: throwingStorage, configurable: true });
    vi.stubGlobal("localStorage", throwingStorage);

    expect(loadPlayerClaims()).toEqual([]);
    expect(() => storeProfileEmail("pilot@example.test")).not.toThrow();
    expect(() => safeStorage.remove("cr-league-profile-email")).not.toThrow();
    expect(safeStorage.keys()).toEqual([]);
  });
});

describe("profile session storage", () => {
  it("strips recovery codes before writing or reading profile sessions", () => {
    storeProfileSession({
      profile: { id: "profile-1", email: "pilot@example.test" },
      recoveryCode: "ABCD1234",
      sessionCredential: "session-token",
      teams: []
    });

    expect(localStorage.getItem(PROFILE_SESSION_KEY)).not.toContain("ABCD1234");
    expect(loadProfileSession()).toMatchObject({ profile: { id: "profile-1" }, sessionCredential: "session-token" });

    localStorage.setItem(PROFILE_SESSION_KEY, JSON.stringify({ profile: { id: "profile-1", email: "pilot@example.test" }, recoveryCode: "LEGACY", sessionCredential: "legacy-session", teams: [] }));

    expect(loadProfileSession()).toMatchObject({ profile: { id: "profile-1" }, sessionCredential: "legacy-session" });
    expect(localStorage.getItem(PROFILE_SESSION_KEY)).not.toContain("LEGACY");
  });
});

describe("copyText", () => {
  it("falls back to a temporary input when clipboard access fails", async () => {
    const execCommand = vi.fn();
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("blocked")) } });
    document.execCommand = execCommand;

    await copyText("ABCD1234");

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(document.querySelector("input[value='ABCD1234']")).toBe(null);
  });
});

describe("saved league claims", () => {
  it("captures the progress the saved-league card shows", () => {
    const state = baseState as unknown as LeagueState;

    const claim = claimFromState(state, new Date("2026-07-20T18:00:00.000Z"));

    expect(claim?.season).toBe(state.currentGrandPrix.season);
    expect(claim?.round).toBe(state.currentGrandPrix.round);
    expect(claim?.maxRounds).toBe(state.league.maxGrandPrixPerSeason);
    expect(claim?.updatedAt).toBe("2026-07-20T18:00:00.000Z");
  });

  it("still loads a claim stored before the card carried progress", () => {
    // The card falls back to name and code for these rather than dropping the league.
    localStorage.setItem(
      PLAYER_CLAIMS_KEY,
      JSON.stringify([{ teamId: "t1", claimCode: "c1", leagueId: "l1", leagueName: "Harbour Series", leagueCode: "HRB07", teamName: "Nord Kinetics" }])
    );

    const claims = loadPlayerClaims();

    expect(claims).toHaveLength(1);
    expect(claims[0]?.updatedAt).toBeUndefined();
  });
});
