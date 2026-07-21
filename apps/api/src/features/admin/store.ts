import type { PrismaClient } from "@prisma/client";
import { getLeagueState } from "../leagues/store.js";
import { createRecoveryCode, hashRecoveryCode } from "../leagues/utils.js";

type Db = Pick<PrismaClient, "profile" | "team" | "league">;
export const ADMIN_TEST_DATA_CLEANUP_CONFIRMATION = "DELETE TEST DATA";

export type AdminListInput = {
  q?: string;
  page?: number;
  limit?: number;
};

export async function listAdminUsers(db: Db, input: AdminListInput = {}) {
  const profiles = await db.profile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      teams: {
        include: { league: true }
      }
    }
  });

  const users = profiles
    .map((profile) => {
      const leagueIds = new Set(profile.teams.map((team) => team.leagueId));
      return {
        id: profile.id,
        email: profile.email,
        createdAt: profile.createdAt.toISOString(),
        teamCount: profile.teams.length,
        leagueCount: leagueIds.size
      };
    })
    .filter((profile) => matchesAdminQuery(input.q, profile.id, profile.email));
  const page = paginate(users, input);

  return { users: page.items, pagination: page.pagination };
}

export async function resetAdminUserRecoveryCode(db: Db, profileId: string) {
  const recoveryCode = createRecoveryCode();
  const profile = await db.profile.update({
    where: { id: profileId },
    data: { recoveryCodeHash: hashRecoveryCode(recoveryCode) }
  });

  return {
    user: {
      id: profile.id,
      email: profile.email,
      createdAt: profile.createdAt.toISOString()
    },
    recoveryCode
  };
}

export async function deleteAdminUser(db: Db, profileId: string, input: { confirmation?: string } = {}) {
  const profile = await db.profile.findUnique({ where: { id: profileId } });
  if (!profile) {
    await db.profile.delete({ where: { id: profileId } });
    return { ok: true };
  }
  if (!isTestProfile(profile.email) && input.confirmation !== profile.email) throw new AdminCleanupError("Type the profile email to confirm deletion.");
  await db.profile.delete({ where: { id: profileId } });
  return { ok: true };
}

export async function cleanupAdminTestData(db: Db, input: { profileIds?: string[]; leagueIds?: string[]; confirmation?: string }) {
  const profileIds = uniqueIds(input.profileIds);
  const leagueIds = uniqueIds(input.leagueIds);
  if (input.confirmation !== ADMIN_TEST_DATA_CLEANUP_CONFIRMATION) throw new AdminCleanupError("Confirmation is required.");
  if (!profileIds.length && !leagueIds.length) throw new AdminCleanupError("Select at least one test data set.");

  const profiles = await Promise.all(profileIds.map((profileId) => db.profile.findUnique({ where: { id: profileId } })));
  const leagues = await Promise.all(leagueIds.map((leagueId) => db.league.findUnique({ where: { id: leagueId }, include: { teams: true, grandPrixes: { include: { decisions: true } } } })));
  const missing = [...profileIds.filter((_, index) => !profiles[index]), ...leagueIds.filter((_, index) => !leagues[index])];
  if (missing.length) throw new AdminCleanupError(`Missing selected data: ${missing.join(", ")}`);

  const unsafeProfiles = profiles.filter((profile): profile is NonNullable<typeof profile> => Boolean(profile)).filter((profile) => !isTestProfile(profile.email));
  const unsafeLeagues = leagues.filter((league): league is NonNullable<typeof league> => Boolean(league)).filter((league) => !isTestLeague(league.name, league.code));
  if (unsafeProfiles.length || unsafeLeagues.length) throw new AdminCleanupError("Only clearly marked test profiles or leagues can be cleaned up.");

  const leagueRows = leagues.filter((league): league is NonNullable<typeof league> => Boolean(league));
  const counts = {
    profiles: 0,
    leagues: 0,
    teams: leagueRows.reduce((total, league) => total + league.teams.length, 0),
    grandPrixes: leagueRows.reduce((total, league) => total + league.grandPrixes.length, 0),
    decisions: leagueRows.reduce((total, league) => total + league.grandPrixes.reduce((sum, grandPrix) => sum + grandPrix.decisions.length, 0), 0)
  };

  for (const leagueId of leagueIds) {
    await db.league.delete({ where: { id: leagueId } });
    counts.leagues += 1;
  }
  for (const profileId of profileIds) {
    await db.profile.delete({ where: { id: profileId } });
    counts.profiles += 1;
  }

  return { ok: true, deleted: counts };
}

export async function listAdminLeagues(db: Db, input: AdminListInput = {}) {
  const leagues = await db.league.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      teams: true,
      grandPrixes: {
        orderBy: [{ season: "desc" }, { round: "desc" }],
        take: 1
      }
    }
  });

  const adminLeagues = leagues
    .map((league) => {
      const currentGrandPrix = league.grandPrixes[0] ?? null;
      return {
        id: league.id,
        code: league.code,
        name: league.name,
        status: league.status,
        currentSeason: currentGrandPrix?.season ?? null,
        currentRound: currentGrandPrix?.round ?? null,
        playerCount: league.teams.filter((team) => team.kind === "human").length,
        teamCount: league.teams.length,
        createdAt: league.createdAt.toISOString()
      };
    })
    .filter((league) => matchesAdminQuery(input.q, league.id, league.code, league.name, league.status));
  const page = paginate(adminLeagues, input);

  return { leagues: page.items, pagination: page.pagination };
}

export async function inspectAdminLeague(db: Db, leagueId: string) {
  return getLeagueState(db as Parameters<typeof getLeagueState>[0], leagueId, { includeInviteCode: true });
}

export class AdminCleanupError extends Error {}

function uniqueIds(ids: string[] | undefined) {
  return Array.from(new Set((ids ?? []).map((id) => id.trim()).filter(Boolean)));
}

function isTestProfile(email: string) {
  const normalized = email.toLowerCase();
  return normalized.endsWith(".test") || normalized.includes("+test@") || normalized.startsWith("test@");
}

function isTestLeague(name: string, code: string) {
  return /\b(test|demo|qa|staging)\b/i.test(name) || code.toUpperCase().startsWith("TEST");
}

function matchesAdminQuery(query: string | undefined, ...values: Array<string | null | undefined>) {
  const needle = query?.trim().toLowerCase();
  if (!needle) return true;
  return values.some((value) => value?.toLowerCase().includes(needle));
}

function paginate<T>(items: T[], input: AdminListInput) {
  const limit = Math.min(100, Math.max(1, input.limit ?? 100));
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(totalPages, Math.max(1, input.page ?? 1));
  const start = (page - 1) * limit;

  return {
    items: items.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasPrevious: page > 1,
      hasNext: page < totalPages
    }
  };
}
