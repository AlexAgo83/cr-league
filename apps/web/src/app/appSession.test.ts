// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, LANGUAGE_KEY, safeStorage, storePlayerClaims } from "./appStorage.js";
import { initialLocale, isStaleLeagueError, persistLocale } from "./appSession.js";

afterEach(() => {
  safeStorage.remove(LANGUAGE_KEY);
  safeStorage.remove("cr-league-active-player-claim");
  vi.unstubAllGlobals();
});

describe("appSession", () => {
  it("persists and restores a supported locale", () => {
    persistLocale("fr");

    expect(initialLocale()).toBe("fr");
  });

  it("falls back to the browser locale when storage is empty", () => {
    vi.stubGlobal("navigator", { language: "fr-BE" });

    expect(initialLocale()).toBe("fr");
  });

  it("detects stale league errors only when a player claim is active", () => {
    expect(isStaleLeagueError(new ApiError(404, "not found"))).toBe(false);

    storePlayerClaims([{ leagueId: "league-1", leagueName: "League", leagueCode: "ABC123", teamId: "team-1", teamName: "Team", claimCode: "claim" }], "team-1");

    expect(isStaleLeagueError(new ApiError(404, "not found"))).toBe(true);
    expect(isStaleLeagueError(new ApiError(500, "broken"))).toBe(false);
  });
});
