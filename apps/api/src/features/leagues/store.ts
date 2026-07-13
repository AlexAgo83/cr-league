import { DEMO_RACE_INPUT, simulateRace, type RaceDecision, type RaceInput, type RaceParticipant } from "@cr-league/shared";
import type { PrismaClient } from "@prisma/client";

type Db = Pick<PrismaClient, "league" | "grandPrix" | "team" | "raceDecision">;

const LEAGUE_CADENCES = ["manual", "fast", "weekly"] as const;

export class LeagueRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeagueRuleError";
  }
}

export type CreateLeagueInput = {
  name?: string;
  teamName?: string;
};

export type JoinLeagueInput = {
  code?: string;
  teamName?: string;
};

export type RejoinLeagueInput = {
  teamId?: string;
  claimCode?: string;
};

export type UpdateLeagueSettingsInput = {
  cadence?: string;
  preparationDeadlineAt?: string | null;
};

export type LeagueState = {
  league: {
    id: string;
    name: string;
    code: string;
    status: string;
    cadence: string;
    preparationDeadlineAt: string | null;
  };
  currentGrandPrix: {
    id: string;
    name: string;
    round: number;
    status: string;
    primaryTrait: RaceInput["primaryTrait"];
    secondaryTrait: RaceInput["secondaryTrait"];
    forecast: RaceInput["forecast"];
    result: unknown;
  };
  grandPrixHistory: Array<{
    id: string;
    name: string;
    round: number;
    status: string;
    result: unknown;
  }>;
  teams: Array<{
    id: string;
    name: string;
    kind: string;
    points: number;
    credits: number;
    ready: boolean;
  }>;
  actionState: {
    submittedTeamIds: string[];
    missingTeamIds: string[];
    canResolve: boolean;
    canStartNextGrandPrix: boolean;
    nextAction: string;
  };
  player?: {
    teamId: string;
    claimCode: string;
  };
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

export type ResolveGrandPrixInput = {
  allowDefaults?: boolean;
};

export async function createDemoLeague(db: Db, input: CreateLeagueInput = {}) {
  const code = createLeagueCode();
  const playerClaimCode = createClaimCode();
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
      claimCode: index === 0 ? playerClaimCode : createClaimCode(),
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

  const state = await getLeagueState(db, league.id);
  const playerTeam = state?.teams.find((team) => team.kind === "human");
  return state && playerTeam ? withPlayer(state, playerTeam.id, playerClaimCode) : state;
}

export async function joinLeagueByCode(db: Db, input: JoinLeagueInput = {}) {
  const code = input.code?.trim().toUpperCase();
  const teamName = input.teamName?.trim();
  if (!code || !teamName) {
    throw new LeagueRuleError("League code and team name are required.");
  }

  const league = await db.league.findUnique({ where: { code } });
  if (!league) return null;

  const state = await getLeagueState(db, league.id);
  if (!state) return null;
  if (state.currentGrandPrix.status === "resolved") {
    throw new LeagueRuleError("This league is not accepting new teams after the Grand Prix is resolved.");
  }
  if (state.teams.some((team) => team.name.toLowerCase() === teamName.toLowerCase())) {
    throw new LeagueRuleError("This team name is already taken.");
  }

  const team = await db.team.create({
    data: {
      leagueId: league.id,
      name: teamName,
      kind: "human",
      claimCode: createClaimCode(),
      points: 0,
      credits: 0
    }
  });

  const nextState = await getLeagueState(db, league.id);
  return nextState ? withPlayer(nextState, team.id, team.claimCode ?? "") : nextState;
}

export async function rejoinLeague(db: Db, input: RejoinLeagueInput = {}) {
  if (!input.teamId || !input.claimCode) {
    throw new LeagueRuleError("Team id and claim code are required.");
  }

  const team = await db.team.findUnique({
    where: { id: input.teamId },
    include: { league: true }
  });
  if (!team || team.claimCode !== input.claimCode) return null;

  const state = await getLeagueState(db, team.leagueId);
  return state ? withPlayer(state, team.id, team.claimCode) : null;
}

export async function getLeagueState(db: Db, leagueId: string): Promise<LeagueState | null> {
    const league = await db.league.findUnique({
    where: { id: leagueId },
    include: {
      teams: { orderBy: [{ points: "desc" }, { name: "asc" }] },
      grandPrixes: {
        orderBy: { round: "desc" },
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
      status: league.status,
      cadence: league.cadence,
      preparationDeadlineAt: league.preparationDeadlineAt?.toISOString() ?? null
    },
    currentGrandPrix: {
      id: grandPrix.id,
      name: grandPrix.name,
      round: grandPrix.round,
      status: grandPrix.status,
      primaryTrait: grandPrix.primaryTrait as RaceInput["primaryTrait"],
      secondaryTrait: grandPrix.secondaryTrait as RaceInput["secondaryTrait"],
      forecast: grandPrix.forecast as RaceInput["forecast"],
      result: grandPrix.result
    },
    grandPrixHistory: league.grandPrixes.map((entry) => ({
      id: entry.id,
      name: entry.name,
      round: entry.round,
      status: entry.status,
      result: entry.result
    })),
    teams: league.teams.map((team) => ({
      id: team.id,
      name: team.name,
      kind: team.kind,
      points: team.points,
      credits: team.credits,
      ready: grandPrix.decisions.some((decision) => decision.teamId === team.id)
    })),
    actionState: buildActionState(
      league.teams.map((team) => team.id),
      grandPrix.status,
      grandPrix.decisions.map((decision) => decision.teamId),
      league.preparationDeadlineAt
    ),
    decisions: grandPrix.decisions.map((decision) => ({
      teamId: decision.teamId,
      approach: decision.approach,
      preparation: decision.preparation,
      cardId: decision.cardId,
      rivalTeamId: decision.rivalTeamId
    }))
  };
}

export async function updateLeagueSettings(db: Db, leagueId: string, input: UpdateLeagueSettingsInput = {}) {
  const data: { cadence?: string; preparationDeadlineAt?: Date | null } = {};

  if (input.cadence !== undefined) {
    if (!isLeagueCadence(input.cadence)) {
      throw new LeagueRuleError("Unsupported league cadence.");
    }
    data.cadence = input.cadence;
  }

  if (input.preparationDeadlineAt !== undefined) {
    data.preparationDeadlineAt = input.preparationDeadlineAt ? new Date(input.preparationDeadlineAt) : null;
    if (data.preparationDeadlineAt && Number.isNaN(data.preparationDeadlineAt.getTime())) {
      throw new LeagueRuleError("Invalid preparation deadline.");
    }
  }

  const league = await db.league.findUnique({ where: { id: leagueId } });
  if (!league) return null;

  await db.league.update({
    where: { id: leagueId },
    data
  });

  return getLeagueState(db, leagueId);
}

export async function submitDecision(db: Db, leagueId: string, input: SubmitDecisionInput) {
  const grandPrix = await getCurrentGrandPrix(db, leagueId);
  if (!grandPrix) return null;
  if (grandPrix.status === "resolved") {
    throw new LeagueRuleError("This Grand Prix is already resolved.");
  }

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

export async function resolveCurrentGrandPrix(db: Db, leagueId: string, input: ResolveGrandPrixInput = {}) {
  const state = await getLeagueState(db, leagueId);
  const grandPrix = await getCurrentGrandPrix(db, leagueId);
  if (!state || !grandPrix) return null;
  if (grandPrix.status === "resolved") {
    throw new LeagueRuleError("This Grand Prix is already resolved.");
  }
  if (!hasHumanDecision(state) && !input.allowDefaults) {
    throw new LeagueRuleError("Submit your race directive before launching the Grand Prix.");
  }

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

export async function startNextGrandPrix(db: Db, leagueId: string) {
  const grandPrix = await getCurrentGrandPrix(db, leagueId);
  if (!grandPrix) return null;
  if (grandPrix.status !== "resolved") {
    throw new LeagueRuleError("Resolve the current Grand Prix before starting the next one.");
  }

  await db.grandPrix.create({
    data: {
      leagueId,
      name: DEMO_RACE_INPUT.grandPrixName,
      round: grandPrix.round + 1,
      seed: `${DEMO_RACE_INPUT.seed}-${leagueId}-${grandPrix.round + 1}`,
      primaryTrait: DEMO_RACE_INPUT.primaryTrait,
      secondaryTrait: DEMO_RACE_INPUT.secondaryTrait,
      forecast: DEMO_RACE_INPUT.forecast
    }
  });

  return getLeagueState(db, leagueId);
}

function hasHumanDecision(state: LeagueState) {
  const humanTeamIds = new Set(state.teams.filter((team) => team.kind === "human").map((team) => team.id));
  return state.decisions.some((decision) => humanTeamIds.has(decision.teamId));
}

function buildParticipants(state: LeagueState): RaceParticipant[] {
  return state.teams.map((team, index) => {
    const demo = DEMO_RACE_INPUT.participants[index % DEMO_RACE_INPUT.participants.length];
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

function buildActionState(teamIds: string[], grandPrixStatus: string, submittedTeamIds: string[], deadline: Date | null) {
  const submitted = new Set(submittedTeamIds);
  const missingTeamIds = grandPrixStatus === "resolved" ? [] : teamIds.filter((teamId) => !submitted.has(teamId));
  const deadlinePassed = deadline ? Date.now() >= deadline.getTime() : false;
  const canStartNextGrandPrix = grandPrixStatus === "resolved";
  const canResolve = grandPrixStatus !== "resolved" && (submittedTeamIds.length > 0 || deadlinePassed);

  return {
    submittedTeamIds,
    missingTeamIds,
    canResolve,
    canStartNextGrandPrix,
    nextAction: canStartNextGrandPrix ? "start_next_grand_prix" : canResolve ? "resolve_grand_prix" : "wait_for_directives"
  };
}

function withPlayer(state: LeagueState, teamId: string, claimCode: string): LeagueState {
  return {
    ...state,
    player: {
      teamId,
      claimCode
    }
  };
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

function createClaimCode() {
  return Math.random().toString(36).slice(2, 12).toUpperCase();
}

function isLeagueCadence(value: string): value is (typeof LEAGUE_CADENCES)[number] {
  return LEAGUE_CADENCES.includes(value as (typeof LEAGUE_CADENCES)[number]);
}
