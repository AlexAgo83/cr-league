import { safeStorage } from "./appStorage.js";
import type { TeamLivery } from "@cr-league/shared";
import type { LeagueState } from "./types.js";

/** Single-slot key kept only so an existing game can be migrated once. */
export const LEGACY_SOLO_SAVE_KEY = "cr-league-solo-save-v1";
export const SOLO_SLOT_KEY_PREFIX = "cr-league-solo-slot-v1-";
export const SOLO_SLOT_INDEX_KEY = "cr-league-solo-slots-v1";
export const SOLO_SAVE_SCHEMA_VERSION = 1;
export const SOLO_SLOT_COUNT = 3;
export const SOLO_SLOTS = [0, 1, 2] as const;

/**
 * Replay traces dominate a solo save: a measured 4 Grand Prix game weighed 557 KB, of which
 * 344 KB were traces of races already resolved. Each resolved Grand Prix adds about 86 KB, so
 * without a bound three slots would reach the browser storage quota — which `safeStorage.set`
 * swallows silently, losing progress without telling the player.
 *
 * Only the most recent resolved races keep their trace. `RaceResult.replayTrace` is already
 * optional and `ReplayView` reads `result.replayTrace ?? []`, so an older race still opens its
 * replay, just without trace-driven positions. A result loses 100 KB to 14 KB this way.
 */
export const SOLO_TRACE_HISTORY_LIMIT = 2;

export type SoloSlot = (typeof SOLO_SLOTS)[number];

export type SoloSave = {
  schemaVersion: typeof SOLO_SAVE_SCHEMA_VERSION;
  createdAt: string;
  updatedAt: string;
  state: LeagueState;
};

/** What the picker shows. Held apart from the state so listing slots stays cheap. */
export type SoloSlotSummary = {
  slot: SoloSlot;
  teamName: string;
  livery?: TeamLivery;
  season: number;
  round: number;
  maxRounds: number;
  points: number;
  resolvedGrandPrix: number;
  createdAt: string;
  updatedAt: string;
};

type SoloSlotIndex = Partial<Record<`${SoloSlot}`, SoloSlotSummary>>;

function slotKey(slot: SoloSlot) {
  return `${SOLO_SLOT_KEY_PREFIX}${slot}`;
}

function parseSave(raw: string | null): SoloSave | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SoloSave>;
    return isSoloSave(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function readIndex(): SoloSlotIndex {
  const raw = safeStorage.get(SOLO_SLOT_INDEX_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as SoloSlotIndex) : {};
  } catch {
    return {};
  }
}

function writeIndex(index: SoloSlotIndex) {
  safeStorage.set(SOLO_SLOT_INDEX_KEY, JSON.stringify(index));
}

export function summarizeSoloSave(slot: SoloSlot, save: SoloSave): SoloSlotSummary {
  const state = save.state;
  const player = state.teams.find((team) => team.id === state.player?.teamId) ?? state.teams[0];
  return {
    slot,
    teamName: player?.name ?? "",
    livery: player?.livery,
    season: state.currentGrandPrix.season,
    round: state.currentGrandPrix.round,
    maxRounds: state.league.maxGrandPrixPerSeason,
    points: player?.points ?? 0,
    resolvedGrandPrix: state.grandPrixHistory.filter((grandPrix) => grandPrix.result).length,
    createdAt: save.createdAt,
    updatedAt: save.updatedAt
  };
}

/** Drops traces from all but the most recent resolved races. */
export function trimSoloState(state: LeagueState, limit = SOLO_TRACE_HISTORY_LIMIT): LeagueState {
  const resolved = state.grandPrixHistory.filter((grandPrix) => grandPrix.result);
  const keep = new Set(resolved.slice(-limit).map((grandPrix) => grandPrix.id));
  let trimmed = false;
  const grandPrixHistory = state.grandPrixHistory.map((grandPrix) => {
    if (!grandPrix.result?.replayTrace || keep.has(grandPrix.id)) return grandPrix;
    trimmed = true;
    const result = { ...grandPrix.result };
    delete result.replayTrace;
    return { ...grandPrix, result };
  });
  return trimmed ? { ...state, grandPrixHistory } : state;
}

export function loadSoloSlot(slot: SoloSlot): SoloSave | null {
  return parseSave(safeStorage.get(slotKey(slot)));
}

export function saveSoloSlot(slot: SoloSlot, state: LeagueState, now = new Date()): SoloSave {
  const timestamp = now.toISOString();
  const save: SoloSave = {
    schemaVersion: SOLO_SAVE_SCHEMA_VERSION,
    createdAt: loadSoloSlot(slot)?.createdAt ?? timestamp,
    updatedAt: timestamp,
    state: trimSoloState(state)
  };
  safeStorage.set(slotKey(slot), JSON.stringify(save));
  // Written in the same call as the state so the index cannot drift from it.
  writeIndex({ ...readIndex(), [slot]: summarizeSoloSave(slot, save) });
  return save;
}

export function clearSoloSlot(slot: SoloSlot) {
  safeStorage.remove(slotKey(slot));
  const index = readIndex();
  delete index[`${slot}`];
  writeIndex(index);
}

/**
 * Summaries for every slot, cheap by design: the picker reads one small key instead of parsing
 * three full games. Falls back to the slot itself when the index entry is missing or was written
 * by an older build, which repairs both a lost index and one that predates a displayed field.
 */
export function listSoloSlots(): Array<SoloSlotSummary | null> {
  migrateLegacySoloSave();
  const index = readIndex();
  let repaired: SoloSlotIndex | null = null;

  const summaries = SOLO_SLOTS.map((slot) => {
    const known = index[`${slot}`];
    if (known && isCurrentSummary(known)) return known;
    const save = loadSoloSlot(slot);
    if (!save) return null;
    const summary = summarizeSoloSave(slot, save);
    repaired = { ...(repaired ?? index), [slot]: summary };
    return summary;
  });

  if (repaired) writeIndex(repaired);
  return summaries;
}

/**
 * An index entry written before a field was displayed has no value for it, and would otherwise
 * be trusted forever: the picker would keep showing an old build's version of an existing save.
 * Anything added to the summary later belongs in this check.
 */
function isCurrentSummary(summary: SoloSlotSummary) {
  return summary.livery !== undefined;
}

export function hasAnySoloSave() {
  return listSoloSlots().some(Boolean);
}

export function firstFreeSoloSlot(): SoloSlot | null {
  const slots = listSoloSlots();
  const index = slots.findIndex((slot) => !slot);
  return index === -1 ? null : SOLO_SLOTS[index]!;
}

/** Moves a pre-slots game into the first free slot, once. */
export function migrateLegacySoloSave(): SoloSlot | null {
  const legacy = parseSave(safeStorage.get(LEGACY_SOLO_SAVE_KEY));
  if (!legacy) return null;

  const target = SOLO_SLOTS.find((slot) => !loadSoloSlot(slot));
  if (target === undefined) {
    // Nothing free to move it into; keep the legacy key rather than destroy the game.
    return null;
  }

  const save: SoloSave = { ...legacy, state: trimSoloState(legacy.state) };
  safeStorage.set(slotKey(target), JSON.stringify(save));
  writeIndex({ ...readIndex(), [target]: summarizeSoloSave(target, save) });
  safeStorage.remove(LEGACY_SOLO_SAVE_KEY);
  return target;
}

function isSoloSave(save: Partial<SoloSave>): save is SoloSave {
  return save.schemaVersion === SOLO_SAVE_SCHEMA_VERSION && typeof save.createdAt === "string" && typeof save.updatedAt === "string" && typeof save.state === "object" && save.state !== null;
}
