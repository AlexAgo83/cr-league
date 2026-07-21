import { LeagueRuleError } from "./errors.js";
import type { Db } from "./types.js";

export function runWrite<T>(db: Db, fn: (tx: Db) => Promise<T>) {
  return db.$transaction ? db.$transaction(fn) : fn(db);
}

export async function lockGrandPrixRow(db: Db, grandPrixId: string) {
  if (!db.$queryRaw) return;
  await db.$queryRaw`SELECT id FROM "grand_prixes" WHERE id = ${grandPrixId} FOR UPDATE`;
}

export async function lockLeagueRow(db: Db, leagueId: string) {
  if (!db.$queryRaw) return;
  await db.$queryRaw`SELECT id FROM "leagues" WHERE id = ${leagueId} FOR UPDATE`;
}

export async function lockTeamRow(db: Db, teamId: string) {
  if (!db.$queryRaw) return;
  await db.$queryRaw`SELECT id FROM "teams" WHERE id = ${teamId} FOR UPDATE`;
}

export async function retryUnique<T>(fn: () => Promise<T>) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      if (!isUniqueConstraintError(error) || attempt === 4) throw error;
    }
  }
  throw new LeagueRuleError("Could not allocate a unique code. Try again.");
}

export function isUniqueConstraintError(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "P2002");
}

export async function getCurrentGrandPrix(db: Db, leagueId: string) {
  return db.grandPrix.findFirst({
    where: { leagueId },
    orderBy: [{ season: "desc" }, { round: "desc" }]
  });
}
