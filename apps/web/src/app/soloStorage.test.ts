// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import { ACTIVE_PLAYER_CLAIM_KEY, PLAYER_CLAIMS_KEY } from "./appStorage.js";
import { baseState } from "./App.testFixtures.js";
import {
  clearSoloSlot,
  firstFreeSoloSlot,
  hasAnySoloSave,
  LEGACY_SOLO_SAVE_KEY,
  listSoloSlots,
  loadSoloSlot,
  migrateLegacySoloSave,
  saveSoloSlot,
  SOLO_SAVE_SCHEMA_VERSION,
  SOLO_SLOT_INDEX_KEY,
  SOLO_SLOT_KEY_PREFIX,
  SOLO_TRACE_HISTORY_LIMIT,
  trimSoloState
} from "./soloStorage.js";
import type { LeagueState } from "./types.js";

const state = baseState as unknown as LeagueState;

function stateWithTraces(count: number): LeagueState {
  const trace = Array.from({ length: 400 }, (_, index) => ({ t: index, cars: [{ id: "team_1", progress: index / 400 }] }));
  return {
    ...state,
    grandPrixHistory: Array.from({ length: count }, (_, index) => ({
      id: `gp-${index + 1}`,
      name: `GP ${index + 1}`,
      season: 1,
      round: index + 1,
      status: "resolved",
      result: { ...(state.currentGrandPrix.result ?? { classification: [], events: [] }), replayTrace: trace }
    }))
  } as unknown as LeagueState;
}

beforeEach(() => {
  localStorage.clear();
});

describe("soloStorage slots", () => {
  it("keeps three slots independent", () => {
    saveSoloSlot(0, state, new Date("2026-01-02T03:04:05.000Z"));
    const before = localStorage.getItem(`${SOLO_SLOT_KEY_PREFIX}0`);

    saveSoloSlot(1, state, new Date("2026-02-02T03:04:05.000Z"));

    expect(localStorage.getItem(`${SOLO_SLOT_KEY_PREFIX}0`)).toBe(before);
    expect(loadSoloSlot(1)?.updatedAt).toBe("2026-02-02T03:04:05.000Z");
    expect(loadSoloSlot(2)).toBeNull();
  });

  it("summarises the team colours the picker paints the slot with", () => {
    saveSoloSlot(0, state);

    const summary = listSoloSlots()[0];

    expect(summary?.livery).toEqual(state.teams.find((team) => team.id === state.player?.teamId)?.livery);
  });

  it("keeps createdAt across writes to the same slot", () => {
    saveSoloSlot(0, state, new Date("2026-01-02T03:04:05.000Z"));
    const save = saveSoloSlot(0, { ...state, league: { ...state.league, name: "Solo League" } }, new Date("2026-03-04T05:06:07.000Z"));

    expect(save.createdAt).toBe("2026-01-02T03:04:05.000Z");
    expect(save.updatedAt).toBe("2026-03-04T05:06:07.000Z");
    expect(save.schemaVersion).toBe(SOLO_SAVE_SCHEMA_VERSION);
  });

  it("lists slots without reading their state", () => {
    saveSoloSlot(1, state, new Date("2026-01-02T03:04:05.000Z"));
    // Removing the state proves the summary came from the index, not from parsing the game.
    localStorage.removeItem(`${SOLO_SLOT_KEY_PREFIX}1`);

    const slots = listSoloSlots();

    expect(slots[0]).toBeNull();
    expect(slots[1]?.teamName).toBeTruthy();
    expect(slots[1]?.updatedAt).toBe("2026-01-02T03:04:05.000Z");
  });

  it("refreshes an index entry written before a displayed field existed", () => {
    saveSoloSlot(0, state);
    // Exactly what the previous build wrote: a full summary, minus the field it did not know.
    const stale = JSON.parse(localStorage.getItem(SOLO_SLOT_INDEX_KEY)!) as Record<string, Record<string, unknown>>;
    delete stale["0"]!.livery;
    localStorage.setItem(SOLO_SLOT_INDEX_KEY, JSON.stringify(stale));

    expect(listSoloSlots()[0]?.livery).toBeDefined();
    expect(localStorage.getItem(SOLO_SLOT_INDEX_KEY)).toContain("livery");
  });

  it("rebuilds a lost index from the slots themselves", () => {
    saveSoloSlot(2, state, new Date("2026-01-02T03:04:05.000Z"));
    localStorage.removeItem(SOLO_SLOT_INDEX_KEY);

    expect(listSoloSlots()[2]?.slot).toBe(2);
    expect(localStorage.getItem(SOLO_SLOT_INDEX_KEY)).toContain("\"2\"");
  });

  it("clears one slot and its index entry only", () => {
    saveSoloSlot(0, state);
    saveSoloSlot(1, state);

    clearSoloSlot(0);

    expect(loadSoloSlot(0)).toBeNull();
    expect(loadSoloSlot(1)).not.toBeNull();
    expect(listSoloSlots()[1]).not.toBeNull();
  });

  it("reports the first free slot and whether anything is saved", () => {
    expect(hasAnySoloSave()).toBe(false);
    expect(firstFreeSoloSlot()).toBe(0);

    saveSoloSlot(0, state);

    expect(hasAnySoloSave()).toBe(true);
    expect(firstFreeSoloSlot()).toBe(1);
  });
});

describe("legacy migration", () => {
  it("moves a pre-slots save into the first free slot once", () => {
    localStorage.setItem(
      LEGACY_SOLO_SAVE_KEY,
      JSON.stringify({ schemaVersion: SOLO_SAVE_SCHEMA_VERSION, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-05T00:00:00.000Z", state })
    );

    expect(migrateLegacySoloSave()).toBe(0);
    expect(loadSoloSlot(0)?.createdAt).toBe("2026-01-01T00:00:00.000Z");
    expect(localStorage.getItem(LEGACY_SOLO_SAVE_KEY)).toBeNull();
    expect(migrateLegacySoloSave()).toBeNull();
  });

  it("keeps the legacy save when no slot is free", () => {
    for (const slot of [0, 1, 2] as const) saveSoloSlot(slot, state);
    localStorage.setItem(
      LEGACY_SOLO_SAVE_KEY,
      JSON.stringify({ schemaVersion: SOLO_SAVE_SCHEMA_VERSION, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-05T00:00:00.000Z", state })
    );

    expect(migrateLegacySoloSave()).toBeNull();
    // Losing a player's game is worse than leaving an orphan key behind.
    expect(localStorage.getItem(LEGACY_SOLO_SAVE_KEY)).not.toBeNull();
  });
});

describe("save size bound", () => {
  it("keeps traces only for the most recent resolved races", () => {
    const trimmed = trimSoloState(stateWithTraces(6));
    const withTrace = trimmed.grandPrixHistory.filter((grandPrix) => grandPrix.result?.replayTrace);

    expect(withTrace).toHaveLength(SOLO_TRACE_HISTORY_LIMIT);
    expect(withTrace.map((grandPrix) => grandPrix.id)).toEqual(["gp-5", "gp-6"]);
  });

  it("keeps the classification of a race whose trace was dropped", () => {
    const trimmed = trimSoloState(stateWithTraces(4));
    const oldest = trimmed.grandPrixHistory[0]!;

    expect(oldest.result?.replayTrace).toBeUndefined();
    expect(oldest.result?.classification).toBeDefined();
  });

  it("stops growing once the trace budget is reached", () => {
    const short = JSON.stringify(saveSoloSlot(0, stateWithTraces(4))).length;
    const long = JSON.stringify(saveSoloSlot(0, stateWithTraces(24))).length;

    // Four seasons of history must not cost four seasons of traces.
    expect(long - short).toBeLessThan(short);
  });

  it("leaves room for three full slots inside a 5 MB budget", () => {
    for (const slot of [0, 1, 2] as const) saveSoloSlot(slot, stateWithTraces(24));
    const total = ([0, 1, 2] as const).reduce<number>((sum, slot) => sum + (localStorage.getItem(`${SOLO_SLOT_KEY_PREFIX}${slot}`)?.length ?? 0), 0);

    expect(total).toBeLessThan(2_500_000);
  });
});

describe("solo storage isolation", () => {
  it("does not touch multiplayer keys", () => {
    localStorage.setItem(PLAYER_CLAIMS_KEY, "[]");
    localStorage.setItem(ACTIVE_PLAYER_CLAIM_KEY, "team_1");

    saveSoloSlot(0, state);
    clearSoloSlot(0);

    expect(localStorage.getItem(PLAYER_CLAIMS_KEY)).toBe("[]");
    expect(localStorage.getItem(ACTIVE_PLAYER_CLAIM_KEY)).toBe("team_1");
  });
});
