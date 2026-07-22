import type { LeagueState, ProfileSession } from "./types.js";

const API_BASE_URL = apiBaseUrl(import.meta.env.VITE_API_BASE_URL, import.meta.env.DEV);

export const PLAYER_CLAIMS_KEY = "cr-league-player-claims";
export const ACTIVE_PLAYER_CLAIM_KEY = "cr-league-active-player-claim";
export const PROFILE_SESSION_KEY = "cr-league-profile-session";
export const PROFILE_EMAIL_KEY = "cr-league-profile-email";
export const LANGUAGE_KEY = "cr-league-language";
export const SEASON_RECAP_KEY_PREFIX = "cr-league-season-recap";

export type StoredPlayerClaim = NonNullable<LeagueState["player"]> & {
  leagueId: string;
  leagueName: string;
  leagueCode: string;
  teamName: string;
};

export async function api<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: init.body ? { "content-type": "application/json", ...init.headers } : init.headers
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new ApiError(response.status, errorBody?.message ?? `API request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

export class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    message: string
  ) {
    super(message);
  }
}

function apiBaseUrl(value: string | undefined, dev: boolean) {
  const base = value ?? (dev ? "http://localhost:4874" : "");
  if (!base) throw new Error("VITE_API_BASE_URL is required outside development.");
  const url = new URL(base);
  if (!dev && url.protocol !== "https:") throw new Error("VITE_API_BASE_URL must use https outside development.");
  return url.toString().replace(/\/$/, "");
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard?.writeText(text);
  } catch {
    const input = document.createElement("input");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.left = "-9999px";
    input.style.position = "fixed";
    document.body.append(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
}

export function claimFromState(state: LeagueState): StoredPlayerClaim | null {
  const team = state.teams.find((candidate) => candidate.id === state.player?.teamId);
  return state.player && team
    ? {
        ...state.player,
        leagueId: state.league.id,
        leagueName: state.league.name,
        leagueCode: state.league.code ?? "",
        teamName: team.name
      }
    : null;
}

export function loadPlayerClaims(): StoredPlayerClaim[] {
  return parsePlayerClaims(localStorage.getItem(PLAYER_CLAIMS_KEY));
}

export function loadProfileSession(): ProfileSession | null {
  const raw = localStorage.getItem(PROFILE_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ProfileSession;
    return parsed?.profile?.id && parsed.profile.email ? parsed : null;
  } catch {
    return null;
  }
}

export function loadProfileEmail() {
  return localStorage.getItem(PROFILE_EMAIL_KEY) ?? "";
}

export function seasonRecapStorageKey(leagueId: string, season: number) {
  return `${SEASON_RECAP_KEY_PREFIX}:${leagueId}:${season}`;
}

export function storeProfileSession(session: ProfileSession) {
  localStorage.setItem(PROFILE_SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(PROFILE_EMAIL_KEY, session.profile.email);
}

export function storeProfileEmail(email: string) {
  localStorage.setItem(PROFILE_EMAIL_KEY, email);
}

export function claimsFromProfile(session: ProfileSession): StoredPlayerClaim[] {
  return session.teams.map((team) => ({
    teamId: team.teamId,
    claimCode: team.claimCode,
    leagueId: team.leagueId,
    leagueName: team.leagueName,
    leagueCode: team.leagueCode,
    teamName: team.teamName
  }));
}

function parsePlayerClaims(raw: string | null): StoredPlayerClaim[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StoredPlayerClaim[];
    return Array.isArray(parsed) ? parsed.filter(isStoredPlayerClaim) : [];
  } catch {
    return [];
  }
}

function isStoredPlayerClaim(claim: Partial<StoredPlayerClaim>): claim is StoredPlayerClaim {
  return (
    typeof claim.teamId === "string" &&
    typeof claim.claimCode === "string" &&
    typeof claim.leagueId === "string" &&
    typeof claim.leagueName === "string" &&
    typeof claim.leagueCode === "string" &&
    typeof claim.teamName === "string"
  );
}

export function upsertPlayerClaim(claims: StoredPlayerClaim[], claim: StoredPlayerClaim) {
  return [claim, ...claims.filter((candidate) => candidate.teamId !== claim.teamId)];
}

export function storePlayerClaims(claims: StoredPlayerClaim[], activeTeamId?: string) {
  localStorage.setItem(PLAYER_CLAIMS_KEY, JSON.stringify(claims));
  if (activeTeamId) {
    localStorage.setItem(ACTIVE_PLAYER_CLAIM_KEY, activeTeamId);
  } else {
    localStorage.removeItem(ACTIVE_PLAYER_CLAIM_KEY);
  }
}

export function getActiveClaim(claims: StoredPlayerClaim[]) {
  const activeTeamId = localStorage.getItem(ACTIVE_PLAYER_CLAIM_KEY);
  return claims.find((claim) => claim.teamId === activeTeamId) ?? claims[0];
}
