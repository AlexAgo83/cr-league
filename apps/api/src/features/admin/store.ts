import type { PrismaClient } from "@prisma/client";
import { getLeagueState } from "../leagues/store.js";
import { createRecoveryCode, hashRecoveryCode } from "../leagues/utils.js";

type Db = Pick<PrismaClient, "profile" | "team" | "league">;

export async function listAdminUsers(db: Db) {
  const profiles = await db.profile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      teams: {
        include: { league: true }
      }
    }
  });

  return {
    users: profiles.map((profile) => {
      const leagueIds = new Set(profile.teams.map((team) => team.leagueId));
      return {
        id: profile.id,
        email: profile.email,
        createdAt: profile.createdAt.toISOString(),
        teamCount: profile.teams.length,
        leagueCount: leagueIds.size
      };
    })
  };
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

export async function listAdminLeagues(db: Db) {
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

  return {
    leagues: leagues.map((league) => {
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
  };
}

export async function inspectAdminLeague(db: Db, leagueId: string) {
  return getLeagueState(db as Parameters<typeof getLeagueState>[0], leagueId);
}
