import type { PrismaClient } from "@prisma/client";

export function createMemoryDb(): PrismaClient {
  type LeagueRow = {
    id: string;
    name: string;
    code: string;
    status: string;
    cadence: string;
    maxPlayers: number;
    fillWithBots: boolean;
    qualifyingAttemptLimit: number;
    maxGrandPrixPerSeason: number;
    ownerTeamId: string | null;
    preparationDeadlineAt: Date | null;
    createdAt: Date;
  };
  type ProfileRow = {
    id: string;
    email: string;
    recoveryCodeHash: string;
    recoveryEmailSentAt: Date | null;
    createdAt: Date;
  };
  type TeamRow = {
    id: string;
    leagueId: string;
    profileId: string | null;
    name: string;
    kind: string;
    claimCode: string | null;
    points: number;
    credits: number;
    cards: string[];
    livery: { primary: string; secondary: string };
    createdAt: Date;
  };
  type GrandPrixRow = {
    id: string;
    leagueId: string;
    name: string;
    season: number;
    round: number;
    seed: string;
    primaryTrait: string;
    secondaryTrait: string;
    forecast: unknown;
    qualifyingRuns: unknown;
    status: string;
    result: unknown;
  };
  type DecisionRow = {
    id: string;
    grandPrixId: string;
    teamId: string;
    approach: string;
    preparation: string;
    pitStrategy: string;
    cardId: string | null;
    rivalTeamId: string | null;
  };

  const leagues: LeagueRow[] = [];
  const profiles: ProfileRow[] = [];
  const teams: TeamRow[] = [];
  const grandPrixes: GrandPrixRow[] = [];
  const decisions: DecisionRow[] = [];
  let nextId = 1;
  const id = (prefix: string) => `${prefix}_${nextId++}`;

  return {
    league: {
      create: async ({
        data
      }: {
        data: Pick<LeagueRow, "name" | "code"> &
          Partial<
            Pick<LeagueRow, "cadence" | "maxPlayers" | "fillWithBots" | "qualifyingAttemptLimit" | "maxGrandPrixPerSeason" | "preparationDeadlineAt">
          >;
      }) => {
        const league = {
          id: id("league"),
          status: "active",
          cadence: "manual",
          maxPlayers: 8,
          fillWithBots: true,
          qualifyingAttemptLimit: 3,
          maxGrandPrixPerSeason: 6,
          ownerTeamId: null,
          preparationDeadlineAt: null,
          createdAt: new Date(),
          ...data
        };
        leagues.push(league);
        return league;
      },
      findUnique: async ({
        where,
        include
      }: {
        where: { id?: string; code?: string };
        include?: { teams?: { orderBy?: { createdAt?: string } | Array<{ points?: string; name?: string }> } };
      }) => {
        const league = leagues.find((candidate) => candidate.id === where.id || candidate.code === where.code);
        if (!league) return null;
        const leagueTeams = teams.filter((team) => team.leagueId === league.id);
        if (Array.isArray(include?.teams?.orderBy)) {
          leagueTeams.sort((left, right) => right.points - left.points || left.name.localeCompare(right.name));
        } else {
          leagueTeams.sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());
        }
        const leagueGrandPrixes = grandPrixes
          .filter((grandPrix) => grandPrix.leagueId === league.id)
          .sort((left, right) => right.season - left.season || right.round - left.round)
          .map((grandPrix) => ({
            ...grandPrix,
            decisions: decisions.filter((decision) => decision.grandPrixId === grandPrix.id)
          }));

        return {
          ...league,
          teams: leagueTeams,
          grandPrixes: leagueGrandPrixes
        };
      },
      findMany: async ({
        include
      }: {
        orderBy?: { createdAt?: string };
        include?: {
          teams?: boolean;
          grandPrixes?: { orderBy?: Array<{ season?: string; round?: string }>; take?: number };
        };
      }) =>
        [...leagues]
          .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
          .map((league) => ({
            ...league,
            teams: include?.teams ? teams.filter((team) => team.leagueId === league.id) : undefined,
            grandPrixes: include?.grandPrixes
              ? grandPrixes
                  .filter((grandPrix) => grandPrix.leagueId === league.id)
                  .sort((left, right) => right.season - left.season || right.round - left.round)
                  .slice(0, include.grandPrixes.take)
              : undefined
          })),
      update: async ({
        where,
        data
      }: {
        where: { id: string };
        data: { cadence?: string; ownerTeamId?: string | null; preparationDeadlineAt?: Date | null };
      }) => {
        const league = leagues.find((candidate) => candidate.id === where.id);
        if (!league) throw new Error("League not found");
        Object.assign(league, data);
        return league;
      }
    },
    profile: {
      create: async ({ data }: { data: Omit<ProfileRow, "id" | "createdAt"> }) => {
        const profile = { id: id("profile"), createdAt: new Date(), ...data };
        profiles.push(profile);
        return profile;
      },
      findUnique: async ({
        where,
        include
      }: {
        where: { id?: string; email?: string };
        include?: { teams?: { include?: { league?: boolean }; orderBy?: { updatedAt: string } } };
      }) => {
        const profile = profiles.find((candidate) => candidate.id === where.id || candidate.email === where.email);
        if (!profile) return null;
        if (!include?.teams) return profile;
        return {
          ...profile,
          teams: teams
            .filter((team) => team.profileId === profile.id)
            .map((team) => ({
              ...team,
              league: leagues.find((league) => league.id === team.leagueId) ?? null
            }))
        };
      },
      findMany: async ({
        include
      }: {
        orderBy?: { createdAt?: string };
        include?: { teams?: { include?: { league?: boolean } } };
      }) =>
        [...profiles]
          .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
          .map((profile) => ({
            ...profile,
            teams: include?.teams
              ? teams
                  .filter((team) => team.profileId === profile.id)
                  .map((team) => ({
                    ...team,
                    league: include.teams?.include?.league ? (leagues.find((league) => league.id === team.leagueId) ?? null) : undefined
                  }))
              : undefined
          })),
      update: async ({ where, data }: { where: { id: string }; data: Partial<Pick<ProfileRow, "recoveryCodeHash" | "recoveryEmailSentAt">> }) => {
        const profile = profiles.find((candidate) => candidate.id === where.id);
        if (!profile) {
          const error = new Error("Profile not found") as Error & { code?: string };
          error.code = "P2025";
          throw error;
        }
        Object.assign(profile, data);
        return profile;
      },
      delete: async ({ where }: { where: { id: string } }) => {
        const index = profiles.findIndex((candidate) => candidate.id === where.id);
        if (index === -1) {
          const error = new Error("Profile not found") as Error & { code?: string };
          error.code = "P2025";
          throw error;
        }
        const [profile] = profiles.splice(index, 1);
        for (const team of teams) {
          if (team.profileId === where.id) team.profileId = null;
        }
        return profile;
      }
    },
    team: {
      create: async ({
        data
      }: {
        data: Omit<TeamRow, "id" | "livery" | "profileId" | "createdAt"> & Partial<Pick<TeamRow, "livery" | "profileId">>;
      }) => {
        const team = { id: id("team"), livery: { primary: "#16c784", secondary: "#38bdf8" }, createdAt: new Date(), ...data, profileId: data.profileId ?? null };
        teams.push(team);
        return team;
      },
      createMany: async ({
        data
      }: {
        data: Array<Omit<TeamRow, "id" | "livery" | "profileId" | "createdAt"> & Partial<Pick<TeamRow, "livery" | "profileId">>>;
      }) => {
        for (const team of data) {
          teams.push({ id: id("team"), livery: { primary: "#16c784", secondary: "#38bdf8" }, createdAt: new Date(), ...team, profileId: team.profileId ?? null });
        }
        return { count: data.length };
      },
      findUnique: async ({ where }: { where: { id: string } }) => {
        const team = teams.find((candidate) => candidate.id === where.id);
        if (!team) return null;
        return {
          ...team,
          league: leagues.find((league) => league.id === team.leagueId) ?? null
        };
      },
      update: async ({
        where,
        data
      }: {
        where: { id: string };
        data: {
          points?: number | { increment: number };
          credits?: number | { increment?: number; decrement?: number };
          cards?: string[];
          livery?: { primary: string; secondary: string };
          name?: string;
        };
      }) => {
        const team = teams.find((candidate) => candidate.id === where.id);
        if (!team) throw new Error("Team not found");
        if (typeof data.points === "number") {
          team.points = data.points;
        } else {
          team.points += data.points?.increment ?? 0;
        }
        if (typeof data.credits === "number") {
          team.credits = data.credits;
        } else {
          team.credits += data.credits?.increment ?? 0;
          team.credits -= data.credits?.decrement ?? 0;
        }
        if (data.cards) team.cards = data.cards;
        if (data.livery) team.livery = data.livery;
        if (data.name) team.name = data.name;
        return team;
      },
      updateMany: async ({
        where,
        data
      }: {
        where: { id: string; credits?: { gte: number } };
        data: {
          credits?: { decrement: number };
          cards?: string[];
        };
      }) => {
        const team = teams.find((candidate) => candidate.id === where.id && candidate.credits >= (where.credits?.gte ?? Number.NEGATIVE_INFINITY));
        if (!team) return { count: 0 };
        team.credits -= data.credits?.decrement ?? 0;
        if (data.cards) team.cards = data.cards;
        return { count: 1 };
      }
    },
    grandPrix: {
      create: async ({ data }: { data: Omit<GrandPrixRow, "id" | "qualifyingRuns" | "status" | "result"> }) => {
        const grandPrix = { id: id("gp"), qualifyingRuns: [], status: "briefing", result: null, ...data };
        grandPrixes.push(grandPrix);
        return grandPrix;
      },
      findFirst: async ({ where }: { where: { leagueId: string } }) =>
        grandPrixes
          .filter((grandPrix) => grandPrix.leagueId === where.leagueId)
          .sort((left, right) => right.season - left.season || right.round - left.round)[0] ?? null,
      update: async ({ where, data }: { where: { id: string }; data: Partial<Pick<GrandPrixRow, "qualifyingRuns" | "status" | "result">> }) => {
        const grandPrix = grandPrixes.find((candidate) => candidate.id === where.id);
        if (!grandPrix) throw new Error("Grand Prix not found");
        Object.assign(grandPrix, data);
        return grandPrix;
      },
      updateMany: async ({
        where,
        data
      }: {
        where: { id: string; status?: string };
        data: Partial<Pick<GrandPrixRow, "qualifyingRuns" | "status" | "result">>;
      }) => {
        const grandPrix = grandPrixes.find((candidate) => candidate.id === where.id && (!where.status || candidate.status === where.status));
        if (!grandPrix) return { count: 0 };
        Object.assign(grandPrix, data);
        return { count: 1 };
      },
      deleteMany: async ({ where }: { where: { leagueId: string } }) => {
        for (let index = grandPrixes.length - 1; index >= 0; index -= 1) {
          const grandPrix = grandPrixes[index];
          if (grandPrix?.leagueId === where.leagueId) {
            const grandPrixId = grandPrix.id;
            for (let decisionIndex = decisions.length - 1; decisionIndex >= 0; decisionIndex -= 1) {
              if (decisions[decisionIndex]?.grandPrixId === grandPrixId) decisions.splice(decisionIndex, 1);
            }
            grandPrixes.splice(index, 1);
          }
        }
        return { count: 0 };
      }
    },
    raceDecision: {
      upsert: async ({
        where,
        update,
        create
      }: {
        where: { grandPrixId_teamId: { grandPrixId: string; teamId: string } };
        update: Omit<DecisionRow, "id" | "grandPrixId" | "teamId" | "pitStrategy"> & { pitStrategy?: string };
        create: Omit<DecisionRow, "id" | "pitStrategy"> & { pitStrategy?: string };
      }) => {
        const existing = decisions.find(
          (decision) =>
            decision.grandPrixId === where.grandPrixId_teamId.grandPrixId &&
            decision.teamId === where.grandPrixId_teamId.teamId
        );
        if (existing) {
          Object.assign(existing, update);
          return existing;
        }

        const decision: DecisionRow = {
          id: id("decision"),
          ...create,
          pitStrategy: create.pitStrategy ?? "standard",
          cardId: create.cardId ?? null,
          rivalTeamId: create.rivalTeamId ?? null,
        };
        decisions.push(decision);
        return decision;
      },
      deleteMany: async ({ where }: { where: { grandPrix: { leagueId: string } } }) => {
        const grandPrixIds = new Set(grandPrixes.filter((grandPrix) => grandPrix.leagueId === where.grandPrix.leagueId).map((grandPrix) => grandPrix.id));
        for (let index = decisions.length - 1; index >= 0; index -= 1) {
          if (grandPrixIds.has(decisions[index]?.grandPrixId ?? "")) decisions.splice(index, 1);
        }
        return { count: 0 };
      }
    },
    $queryRaw: async () => []
  } as unknown as PrismaClient;
}
