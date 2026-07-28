// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import { ACTIVE_PLAYER_CLAIM_KEY, PLAYER_CLAIMS_KEY } from "./appStorage.js";
import { baseState } from "./App.testFixtures.js";
import { clearSoloSave, loadSoloSave, saveSoloState, SOLO_SAVE_KEY, SOLO_SAVE_SCHEMA_VERSION } from "./soloStorage.js";
import type { LeagueState } from "./types.js";

const state = baseState as unknown as LeagueState;

beforeEach(() => {
  localStorage.clear();
});

describe("soloStorage", () => {
  it("saves and loads one versioned local solo slot", () => {
    const save = saveSoloState(state, new Date("2026-01-02T03:04:05.000Z"));

    expect(save).toEqual({
      schemaVersion: SOLO_SAVE_SCHEMA_VERSION,
      createdAt: "2026-01-02T03:04:05.000Z",
      updatedAt: "2026-01-02T03:04:05.000Z",
      state
    });
    expect(loadSoloSave()).toEqual(save);
  });

  it("preserves createdAt when updating the solo slot", () => {
    saveSoloState(state, new Date("2026-01-02T03:04:05.000Z"));

    const save = saveSoloState({ ...state, league: { ...state.league, name: "Solo League" } }, new Date("2026-01-03T03:04:05.000Z"));

    expect(save.createdAt).toBe("2026-01-02T03:04:05.000Z");
    expect(save.updatedAt).toBe("2026-01-03T03:04:05.000Z");
    expect(save.state.league.name).toBe("Solo League");
  });

  it("clears only the solo slot", () => {
    localStorage.setItem(PLAYER_CLAIMS_KEY, "[]");
    localStorage.setItem(ACTIVE_PLAYER_CLAIM_KEY, "team_1");
    saveSoloState(state);

    clearSoloSave();

    expect(loadSoloSave()).toBe(null);
    expect(localStorage.getItem(SOLO_SAVE_KEY)).toBe(null);
    expect(localStorage.getItem(PLAYER_CLAIMS_KEY)).toBe("[]");
    expect(localStorage.getItem(ACTIVE_PLAYER_CLAIM_KEY)).toBe("team_1");
  });

  it("ignores malformed solo saves", () => {
    localStorage.setItem(SOLO_SAVE_KEY, "{nope");

    expect(loadSoloSave()).toBe(null);
  });

  it("ignores incompatible solo save shapes", () => {
    localStorage.setItem(SOLO_SAVE_KEY, JSON.stringify({ schemaVersion: 999, state }));

    expect(loadSoloSave()).toBe(null);
  });
});
