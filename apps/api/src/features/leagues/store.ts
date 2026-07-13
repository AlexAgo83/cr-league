import { DEMO_RACE_INPUT, simulateRace, type RaceDecision, type RaceInput, type RaceParticipant } from "@cr-league/shared";
import type { PrismaClient } from "@prisma/client";

type Db = Pick<PrismaClient, "league" | "grandPrix" | "team" | "raceDecision">;

export type CreateLeagueInput = {
  name?: string;
  teamName?: string;
};

export type LeagueState = {
  league: {
    id: string;
    name: string;
    code: string;
    status: string;
  };
  currentGrandPrix: {
    id: string;
    name: string;
    round: number;
    status: string;
    result: unknown;
  };
  teams: Array<{
    id: string;
    name: string;
    kind: string;
    points: number;
    credits: number;
  }>;
  decisions: Array<{
    teamId: string;
    approach: string;
    preparation: string;
    cardId: string | null;
    rivalTeamId: string | null;
  }>;
};

export type SubmitDecisionInput = RaceDecision & {
  teamId: string;
};

export async function createDemoLeague(db: Db, input: CreateLeagueInput = {}) {
  const code = createLeagueCode();
  const league = await db.league.create({
    data: {
      name: input.name?.trim() || "CR League Demo",
      code
    }
  });

  await db.team.createMany({
    data: DEMO_RACE_INPUT.participants.map((participant, index) => ({
      leagueId: league.id,
      name: index === 0 ? input.teamName?.trim() || participant.teamName : participant.teamName,
      kind: participant.kind,
      points: 0,
      credits: 0
    }))
  });

  await db.grandPrix.create({
    data: {
      leagueId: league.id,
      name: DEMO_RACE_INPUT.grandPrixName,
      round: 1,
      seed: `${DEMO_RACE_INPUT.seed}-${league.id}`,
      primaryTrait: DEMO_RACE_INPUT.primaryTrait,
      secondaryTrait: DEMO_RACE_INPUT.secondaryTrait,
      forecast: DEMO_RACE_INPUT.forecast
    }
  });

  return getLeagueState(db, league.id);
}

export async function getLeagueState(db: Db, leagueId: string): Promise<LeagueState | null> {
  const league = await db.league.findUnique({
    where: { id: leagueId },
    include: {
      teams: { orderBy: [{ points: "desc" }, { name: "asc" }] },
      grandPrixes: {
        orderBy: { round: "desc" },
        take: 1,
        include: {
          decisions: true
        }
      }
    }
  });

  if (!league || !league.grandPrixes[0]) return null;

  const grandPrix = league.grandPrixes[0];
  return {
    league: {
      id: league.id,
      name: league.name,
      code: league.code,
      status: league.status
    },
    currentGrandPrix: {
      id: grandPrix.id,
      name: grandPrix.name,
      round: grandPrix.round,
      status: grandPrix.status,
      result: grandPrix.result
    },
    teams: league.teams.map((team) => ({
      id: team.id,
      name: team.name,
      kind: team.kind,
      points: team.points,
      credits: team.credits
    })),
    decisions: grandPrix.decisions.map((decision) => ({
      teamId: decision.teamId,
      approach: decision.approach,
      preparation: decision.preparation,
      cardId: decision.cardId,
      rivalTeamId: decision.rivalTeamId
    }))
  };
}

export async function submitDecision(db: Db, leagueId: string, input: SubmitDecisionInput) {
  const grandPrix = await getCurrentGrandPrix(db, leagueId);
  if (!grandPrix) return null;

  await db.raceDecision.upsert({
    where: {
      grandPrixId_teamId: {
        grandPrixId: grandPrix.id,
        teamId: input.teamId
      }
    },
    update: {
      approach: input.approach,
      preparation: input.preparation,
      cardId: input.cardId,
      rivalTeamId: input.rivalTeamId,
      defaulted: input.defaulted ?? false
    },
    create: {
      grandPrixId: grandPrix.id,
      teamId: input.teamId,
      approach: input.approach,
      preparation: input.preparation,
      cardId: input.cardId,
      rivalTeamId: input.rivalTeamId,
      defaulted: input.defaulted ?? false
    }
  });

  return getLeagueState(db, leagueId);
}

export async function resolveCurrentGrandPrix(db: Db, leagueId: string) {
  const state = await getLeagueState(db, leagueId);
  const grandPrix = await getCurrentGrandPrix(db, leagueId);
  if (!state || !grandPrix) return null;

  const participants = buildParticipants(state);
  const result = simulateRace({
    seed: grandPrix.seed,
    grandPrixName: grandPrix.name,
    primaryTrait: grandPrix.primaryTrait as RaceInput["primaryTrait"],
    secondaryTrait: grandPrix.secondaryTrait as RaceInput["secondaryTrait"],
    forecast: grandPrix.forecast as RaceInput["forecast"],
    participants
  });

  await db.grandPrix.update({
    where: { id: grandPrix.id },
    data: {
      status: "resolved",
      result
    }
  });

  for (const entry of result.classification) {
    await db.team.update({
      where: { id: entry.teamId },
      data: {
        points: { increment: entry.points },
        credits: { increment: entry.credits }
      }
    });
  }

  return getLeagueState(db, leagueId);
}

function buildParticipants(state: LeagueState): RaceParticipant[] {
  return state.teams.map((team, index) => {
    const demo = DEMO_RACE_INPUT.participants[index];
    if (!demo) {
      throw new Error("Demo race participant template is missing.");
    }
    const decision = state.decisions.find((candidate) => candidate.teamId === team.id);

    return {
      teamId: team.id,
      teamName: team.name,
      kind: team.kind === "bot" ? "bot" : "human",
      standingsRank: index + 1,
      botArchetype: demo.botArchetype,
      decision: decision
        ? {
            approach: decision.approach as RaceDecision["approach"],
            preparation: decision.preparation as RaceDecision["preparation"],
            cardId: (decision.cardId ?? undefined) as RaceDecision["cardId"],
            rivalTeamId: decision.rivalTeamId ?? undefined
          }
        : { ...demo.decision, defaulted: true }
    };
  });
}

async function getCurrentGrandPrix(db: Db, leagueId: string) {
  return db.grandPrix.findFirst({
    where: { leagueId },
    orderBy: { round: "desc" }
  });
}

function createLeagueCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
