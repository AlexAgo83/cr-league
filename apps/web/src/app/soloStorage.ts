import { safeStorage } from "./appStorage.js";
import type { LeagueState } from "./types.js";

export const SOLO_SAVE_KEY = "cr-league-solo-save-v1";
export const SOLO_SAVE_SCHEMA_VERSION = 1;

export type SoloSave = {
  schemaVersion: typeof SOLO_SAVE_SCHEMA_VERSION;
  createdAt: string;
  updatedAt: string;
  state: LeagueState;
};

export function loadSoloSave(): SoloSave | null {
  const raw = safeStorage.get(SOLO_SAVE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<SoloSave>;
    return isSoloSave(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSoloState(state: LeagueState, now = new Date()): SoloSave {
  const timestamp = now.toISOString();
  const save: SoloSave = {
    schemaVersion: SOLO_SAVE_SCHEMA_VERSION,
    createdAt: loadSoloSave()?.createdAt ?? timestamp,
    updatedAt: timestamp,
    state
  };
  safeStorage.set(SOLO_SAVE_KEY, JSON.stringify(save));
  return save;
}

export function clearSoloSave() {
  safeStorage.remove(SOLO_SAVE_KEY);
}

function isSoloSave(save: Partial<SoloSave>): save is SoloSave {
  return save.schemaVersion === SOLO_SAVE_SCHEMA_VERSION && typeof save.createdAt === "string" && typeof save.updatedAt === "string" && typeof save.state === "object" && save.state !== null;
}
