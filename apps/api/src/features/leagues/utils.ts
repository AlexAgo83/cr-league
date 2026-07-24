import { CARD_DEFINITIONS, CAR_ASSET_PRICES, isCarAssetId, type CardId, type CarAssetId, type QualifyingRun, type RaceInput, type TeamLivery, type Weather } from "@cr-league/shared";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { Prisma } from "@prisma/client";
import {
  DEFAULT_LIVERY,
  LEAGUE_CADENCES,
  PRIMARY_LIVERY_COLORS,
  SECONDARY_LIVERY_COLORS
} from "./constants.js";
import { LeagueRuleError } from "./errors.js";
import type { Db, ProfileSession } from "./types.js";

export function strongestForecast(forecast: RaceInput["forecast"]): Weather {
  return (Object.entries(forecast).sort((left, right) => right[1] - left[1])[0]?.[0] ?? "dry") as Weather;
}

export function clampInteger(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(min, Math.min(max, Math.round(value))) : fallback;
}

export function createLeagueCode() {
  return randomBytes(4).toString("hex").slice(0, 6).toUpperCase();
}

export function createClaimCode() {
  return randomBytes(5).toString("hex").toUpperCase();
}

export function createRecoveryCode() {
  return randomBytes(6).toString("hex").toUpperCase();
}

export function hashRecoveryCode(code: string) {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(normalizeRecoveryCode(code), salt, 32).toString("hex");
  return `scrypt$${salt}$${key}`;
}

export function hashLegacyRecoveryCode(code: string) {
  return createHash("sha256").update(normalizeRecoveryCode(code)).digest("hex");
}

export function verifyRecoveryCode(code: string, hash: string): "current" | "legacy" | false {
  const normalizedCode = normalizeRecoveryCode(code);
  if (hash.startsWith("scrypt$")) {
    const [, salt, key] = hash.split("$");
    if (!salt || !key) return false;
    const expected = Buffer.from(key, "hex");
    const actual = scryptSync(normalizedCode, salt, expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual) ? "current" : false;
  }
  const expected = Buffer.from(hashLegacyRecoveryCode(normalizedCode), "hex");
  const actual = Buffer.from(hash, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual) ? "legacy" : false;
}

function normalizeRecoveryCode(code: string) {
  return code.trim().toUpperCase();
}

export function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return "";
  const email = value.trim().toLowerCase();
  if (email.length > 254 || hasWhitespaceOrControl(email)) return "";
  const at = email.indexOf("@");
  if (at <= 0 || at !== email.lastIndexOf("@")) return "";
  const domain = email.slice(at + 1);
  if (!domain.includes(".") || domain.startsWith(".") || domain.endsWith(".")) return "";
  return domain.split(".").some((part) => !part) ? "" : email;
}

function hasWhitespaceOrControl(value: string) {
  return [...value].some((character) => character.charCodeAt(0) <= 32);
}

export function normalizeDisplayName(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  const name = value.trim().replace(/\s+/g, " ");
  if (name.length < 3 || name.length > maxLength) return "";
  return /^[\p{L}\p{N}' -]+$/u.test(name) ? name : "";
}

export async function ensureProfileOwnership(db: Db, profileId: string | undefined, recoveryCode: string | undefined) {
  if (!profileId) return;
  if (!recoveryCode) throw new LeagueRuleError("A valid profile proof is required.", 403);
  const profile = await db.profile.findUnique({ where: { id: profileId } });
  if (!profile || !verifyRecoveryCode(recoveryCode, profile.recoveryCodeHash)) {
    throw new LeagueRuleError("A valid profile proof is required.", 403);
  }
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
    primary: typeof livery.primary === "string" && isHexColor(livery.primary) ? livery.primary : DEFAULT_LIVERY.primary,
    secondary: typeof livery.secondary === "string" && isHexColor(livery.secondary) ? livery.secondary : DEFAULT_LIVERY.secondary,
    ...(typeof livery.carAssetId === "string" && isCarAssetId(livery.carAssetId) ? { carAssetId: livery.carAssetId } : {})
  };
}

export function normalizeUnlockedCarAssetIds(value: unknown): CarAssetId[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((id): id is CarAssetId => typeof id === "string" && isCarAssetId(id)))]
    : [];
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
      return { ...livery, carAssetId: carAssetIdForIndex(startIndex) };
    }
  }
  return { ...randomLivery(), carAssetId: carAssetIdForIndex(startIndex) };
}

export function liveryKey(livery: TeamLivery) {
  return `${livery.primary}:${livery.secondary}`.toLowerCase();
}

function isHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}

function carAssetIdForIndex(index: number) {
  const freeCarAssetIds = (Object.keys(CAR_ASSET_PRICES) as CarAssetId[]).filter((carAssetId) => CAR_ASSET_PRICES[carAssetId] === 0);
  return freeCarAssetIds[index % freeCarAssetIds.length];
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
