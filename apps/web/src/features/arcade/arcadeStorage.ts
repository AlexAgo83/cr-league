import { safeStorage } from "../../app/appStorage.js";

/** Its own key: the arcade holds no league, so it must never touch a campaign save slot. */
export const WHEEL_PARTICIPANTS_KEY = "cr-league-arcade-wheel-v1";

/** The grid ceiling the domain already states (MAX_PLAYERS_LIMIT), reused rather than reinvented. */
export const WHEEL_MAX_PARTICIPANTS = 16;
export const WHEEL_MIN_PARTICIPANTS = 2;

export type WheelParticipant = {
  id: string;
  name: string;
  /** Absent until the entry is recoloured; the palette default stands in until then. */
  primary?: string;
  secondary?: string;
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
