import { CARD_DEFINITIONS, clampTrait, type CardId, type QualifyingRun, type RaceInput, type RaceTraits, type TeamLivery, type Weather } from "@cr-league/shared";
import { createHash, randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";
import {
  DEFAULT_LIVERY,
  LEAGUE_CADENCES,
  MAX_PRIMARY_LIVERY_CHANNEL,
  MIN_SECONDARY_LIVERY_CHANNEL,
  PRIMARY_LIVERY_COLORS,
  SECONDARY_LIVERY_COLORS
} from "./constants.js";
import { LeagueRuleError } from "./errors.js";
import type { Db, ProfileSession } from "./types.js";

export function strongestForecast(forecast: RaceInput["forecast"]): Weather {
  return (Object.entries(forecast).sort((left, right) => right[1] - left[1])[0]?.[0] ?? "dry") as Weather;
}

export function normalizeRaceTraits(value: unknown): RaceTraits | undefined {
  if (!value || typeof value !== "object") return undefined;
  const traits = value as Partial<Record<keyof RaceTraits, unknown>>;
  const { grip, overtaking, energy } = traits;
  if (typeof grip !== "number" || typeof overtaking !== "number" || typeof energy !== "number") return undefined;
  if (!Number.isFinite(grip) || !Number.isFinite(overtaking) || !Number.isFinite(energy)) return undefined;
  return {
    grip: clampTrait(grip),
    overtaking: clampTrait(overtaking),
    energy: clampTrait(energy)
  };
}

export function clampInteger(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(min, Math.min(max, Math.round(value))) : fallback;
}

export function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

export function createLeagueCode() {
  return randomBytes(4).toString("hex").slice(0, 6).toUpperCase();
}

export function createClaimCode() {
  return randomBytes(5).toString("hex").toUpperCase();
}

export function createRecoveryCode() {
  return randomBytes(4).toString("hex").toUpperCase();
}

export function hashRecoveryCode(code: string) {
  return createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}

export function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return "";
  const email = value.trim().toLowerCase();
  if (email.length > 254 || email.includes(" ")) return "";
  const at = email.indexOf("@");
  if (at <= 0 || at !== email.lastIndexOf("@")) return "";
  const domain = email.slice(at + 1);
  if (!domain.includes(".") || domain.startsWith(".") || domain.endsWith(".")) return "";
  return domain.split(".").some((part) => !part) ? "" : email;
}

export function normalizeDisplayName(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  const name = value.trim().replace(/\s+/g, " ");
  if (name.length < 3 || name.length > maxLength) return "";
  return /^[\p{L}\p{N}' -]+$/u.test(name) ? name : "";
}

export async function ensureProfileExists(db: Db, profileId: string | undefined) {
  if (!profileId) return;
  const profile = await db.profile.findUnique({ where: { id: profileId } });
  if (!profile) throw new LeagueRuleError("Profile not found.");
}

export async function profileSession(db: Db, profileId: string): Promise<ProfileSession | null> {
  const profile = await db.profile.findUnique({
    where: { id: profileId },
    include: {
      teams: {
        include: { league: true },
        orderBy: { updatedAt: "desc" }
      }
    }
  });
  if (!profile) return null;

  return {
    profile: {
      id: profile.id,
      email: profile.email
    },
    teams: profile.teams.map((team) => ({
      leagueId: team.leagueId,
      leagueName: team.league.name,
      leagueCode: team.league.code,
      teamId: team.id,
      teamName: team.name,
      claimCode: team.claimCode ?? ""
    }))
  };
}

export function isLeagueCadence(value: string): value is (typeof LEAGUE_CADENCES)[number] {
  return LEAGUE_CADENCES.includes(value as (typeof LEAGUE_CADENCES)[number]);
}

export function isCardId(value: string): value is CardId {
  return value in CARD_DEFINITIONS;
}

export function normalizeCards(value: Prisma.JsonValue): CardId[] {
  return Array.isArray(value) ? value.filter((cardId): cardId is CardId => typeof cardId === "string" && isCardId(cardId)) : [];
}

export function normalizeQualifyingRuns(value: unknown): QualifyingRun[] {
  return Array.isArray(value)
    ? value.flatMap((run) =>
        Boolean(run) &&
        typeof run === "object" &&
        typeof (run as QualifyingRun).teamId === "string" &&
        typeof (run as QualifyingRun).time === "number" &&
        Boolean((run as QualifyingRun).result)
          ? [{ ...(run as QualifyingRun), attempts: Math.max(1, Math.round((run as QualifyingRun).attempts ?? 1)) }]
          : []
      )
    : [];
}

export function normalizeLivery(value: unknown): TeamLivery {
  if (!value || typeof value !== "object") return DEFAULT_LIVERY;
  const livery = value as Partial<Record<keyof TeamLivery, unknown>>;
  return {
    primary: typeof livery.primary === "string" && isHexColor(livery.primary) ? darkenPrimaryLiveryColor(livery.primary) : DEFAULT_LIVERY.primary,
    secondary: typeof livery.secondary === "string" && isHexColor(livery.secondary) ? lightenSecondaryLiveryColor(livery.secondary) : DEFAULT_LIVERY.secondary
  };
}

function darkenPrimaryLiveryColor(color: string) {
  return `#${[1, 3, 5].map((index) => Math.min(Number.parseInt(color.slice(index, index + 2), 16), MAX_PRIMARY_LIVERY_CHANNEL).toString(16).padStart(2, "0")).join("")}`;
}

function lightenSecondaryLiveryColor(color: string) {
  return `#${[1, 3, 5].map((index) => Math.max(Number.parseInt(color.slice(index, index + 2), 16), MIN_SECONDARY_LIVERY_CHANNEL).toString(16).padStart(2, "0")).join("")}`;
}

export function randomLivery(): TeamLivery {
  const primary = PRIMARY_LIVERY_COLORS[Math.floor(Math.random() * PRIMARY_LIVERY_COLORS.length)] ?? DEFAULT_LIVERY.primary;
  const secondary = SECONDARY_LIVERY_COLORS[Math.floor(Math.random() * SECONDARY_LIVERY_COLORS.length)] ?? DEFAULT_LIVERY.secondary;
  return { primary, secondary };
}

export function uniqueBotLivery(startIndex: number, used: Set<string>): TeamLivery {
  const pairs = PRIMARY_LIVERY_COLORS.flatMap((primary) => SECONDARY_LIVERY_COLORS.map((secondary) => ({ primary, secondary })));
  for (let offset = 0; offset < pairs.length; offset += 1) {
    const livery = pairs[(startIndex + offset) % pairs.length];
    if (livery && !used.has(liveryKey(livery))) {
      used.add(liveryKey(livery));
      return livery;
    }
  }
  return randomLivery();
}

export function liveryKey(livery: TeamLivery) {
  return `${livery.primary}:${livery.secondary}`.toLowerCase();
}

function isHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}

export function appendCard(cards: CardId[], cardId: CardId): Prisma.InputJsonValue {
  return [...cards, cardId];
}

export function removeOneCard(cards: CardId[], cardId: CardId): Prisma.InputJsonValue {
  const nextCards = [...cards];
  const index = nextCards.indexOf(cardId);
  if (index >= 0) nextCards.splice(index, 1);
  return nextCards;
}
