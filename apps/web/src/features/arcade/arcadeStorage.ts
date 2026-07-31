import { safeStorage } from "../../app/appStorage.js";
import { REGION_ORDER } from "../../app/circuits.js";
import type { WheelRegion } from "./destinyWheel.js";

/** Its own key: the arcade holds no league, so it must never touch a campaign save slot. */
export const WHEEL_PARTICIPANTS_KEY = "cr-league-arcade-wheel-v1";
export const WHEEL_REGION_KEY = "cr-league-arcade-wheel-region";
export const DUEL_LIVERY_KEY = "cr-league-arcade-duel-livery";
export const DUEL_REGION_KEY = "cr-league-arcade-duel-region";

/** The grid ceiling the domain already states (MAX_PLAYERS_LIMIT), reused rather than reinvented. */
export const WHEEL_MAX_PARTICIPANTS = 16;
export const WHEEL_MIN_PARTICIPANTS = 2;

export type WheelParticipant = {
  id: string;
  name: string;
  /** Absent until the entry is recoloured; the palette default stands in until then. */
  primary?: string;
  secondary?: string;
  /** Absent until the list is shuffled; the car follows the entry's position until then. */
  carAssetId?: string;
};

export function loadWheelParticipants(): WheelParticipant[] {
  const raw = safeStorage.get(WHEEL_PARTICIPANTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is WheelParticipant => isParticipant(entry))
      .slice(0, WHEEL_MAX_PARTICIPANTS);
  } catch {
    return [];
  }
}

export function saveWheelParticipants(participants: WheelParticipant[]) {
  safeStorage.set(WHEEL_PARTICIPANTS_KEY, JSON.stringify(participants.slice(0, WHEEL_MAX_PARTICIPANTS)));
}

/** Remembered like the participants: the same group usually wants the same corner of the world. */
export function loadWheelRegion(): WheelRegion {
  return readRegion(WHEEL_REGION_KEY);
}

export function loadDuelRegion(): WheelRegion {
  return readRegion(DUEL_REGION_KEY);
}

export function saveDuelRegion(region: WheelRegion) {
  safeStorage.set(DUEL_REGION_KEY, region);
}

/** Same default as the circuit catalogue: the starter pack, until the player picks otherwise. */
function readRegion(key: string): WheelRegion {
  const saved = safeStorage.get(key);
  return saved === "all" || REGION_ORDER.some((region) => region === saved) ? (saved as WheelRegion) : "starter";
}

export function saveWheelRegion(region: WheelRegion) {
  safeStorage.set(WHEEL_REGION_KEY, region);
}

/** Ids are only needed to key a row and a car, so a counter beats crypto here. */
export function addWheelParticipant(participants: WheelParticipant[], name: string): WheelParticipant[] {
  const trimmed = name.trim();
  if (!trimmed || participants.length >= WHEEL_MAX_PARTICIPANTS) return participants;
  return [...participants, { id: `wheel-${Date.now().toString(36)}-${participants.length}`, name: trimmed }];
}

export function removeWheelParticipant(participants: WheelParticipant[], id: string): WheelParticipant[] {
  return participants.filter((participant) => participant.id !== id);
}

export function recolourWheelParticipant(participants: WheelParticipant[], id: string, colours: Partial<Pick<WheelParticipant, "primary" | "secondary">>): WheelParticipant[] {
  return participants.map((participant) => (participant.id === id ? { ...participant, ...colours } : participant));
}

function isParticipant(entry: unknown): entry is WheelParticipant {
  const candidate = entry as Partial<WheelParticipant> | null;
  return Boolean(candidate && typeof candidate.id === "string" && typeof candidate.name === "string" && candidate.name.trim());
}

/** The colours and car the player takes into a duel. Remembered, like the wheel's entries. */
export type DuelLivery = { primary: string; secondary: string; carAssetId?: string };
export const DEFAULT_DUEL_LIVERY: DuelLivery = { primary: "#16c784", secondary: "#38bdf8" };

export function loadDuelLivery(): DuelLivery {
  const raw = safeStorage.get(DUEL_LIVERY_KEY);
  if (!raw) return DEFAULT_DUEL_LIVERY;
  try {
    const parsed = JSON.parse(raw) as Partial<DuelLivery> | null;
    if (typeof parsed?.primary !== "string" || typeof parsed.secondary !== "string") return DEFAULT_DUEL_LIVERY;
    return { primary: parsed.primary, secondary: parsed.secondary, ...(typeof parsed.carAssetId === "string" ? { carAssetId: parsed.carAssetId } : {}) };
  } catch {
    return DEFAULT_DUEL_LIVERY;
  }
}

export function saveDuelLivery(livery: DuelLivery) {
  safeStorage.set(DUEL_LIVERY_KEY, JSON.stringify(livery));
}
