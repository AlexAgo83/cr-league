import type { PrismaClient } from "@prisma/client";
import { getLeagueState } from "../leagues/store.js";
import { createRecoveryCode, hashRecoveryCode } from "../leagues/utils.js";

type Db = Pick<PrismaClient, "profile" | "team" | "league">;

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

export async function deleteAdminUser(db: Db, profileId: string) {
  await db.profile.delete({ where: { id: profileId } });
  return { ok: true };
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
