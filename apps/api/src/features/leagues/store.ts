import {
  CARD_DEFINITIONS,
  DEMO_RACE_INPUT,
  simulateRace,
  type CardId,
  type QualifyingRun,
  type RaceDecision,
  type RaceEvent,
  type RaceInput,
  type RaceParticipant,
  type RaceResult,
  type RaceSegment,
  type RaceTraits,
  type TeamLivery,
  type Weather
} from "@cr-league/shared";
import { createHash, randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

type Db = Pick<PrismaClient, "league" | "grandPrix" | "team" | "raceDecision" | "profile">;

const LEAGUE_CADENCES = ["manual", "fast", "weekly"] as const;
const STARTER_CARDS: CardId[] = ["rain_grip"];
const CARD_PRICE = 100;
const CARD_SHOP = Object.keys(CARD_DEFINITIONS).map((cardId) => ({ cardId: cardId as CardId, price: CARD_PRICE }));
const DEFAULT_LIVERY: TeamLivery = { primary: "#16c784", secondary: "#38bdf8" };
const BOT_LIVERY_COLORS = ["#38bdf8", "#f97316", "#a78bfa", "#f43f5e", "#facc15", "#22c55e", "#e879f9", "#fb7185"] as const;
const DEFAULT_MAX_PLAYERS = 8;
const MAX_PLAYERS_LIMIT = 16;
const DEFAULT_QUALIFYING_ATTEMPTS = 3;
const MAX_QUALIFYING_ATTEMPTS = 5;
const DEFAULT_GRAND_PRIX_PER_SEASON = 3;
const MAX_GRAND_PRIX_PER_SEASON = 12;
const TEAM_NAME_LIMIT = 32;
const LEAGUE_NAME_LIMIT = 40;

export class LeagueRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeagueRuleError";
  }
}

export type CreateLeagueInput = {
  name?: string;
  teamName?: string;
  profileId?: string;
  maxPlayers?: number;
  fillWithBots?: boolean;
  qualifyingAttemptLimit?: number;
  maxGrandPrixPerSeason?: number;
};

export type JoinLeagueInput = {
  code?: string;
  teamName?: string;
  profileId?: string;
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
    maxPlayers: number;
    fillWithBots: boolean;
    qualifyingAttemptLimit: number;
    maxGrandPrixPerSeason: number;
    preparationDeadlineAt: string | null;
  };
  currentGrandPrix: {
    id: string;
    name: string;
    season: number;
    round: number;
    status: string;
    primaryTrait: RaceInput["primaryTrait"];
    secondaryTrait: RaceInput["secondaryTrait"];
    forecast: RaceInput["forecast"];
    qualifyingRuns: QualifyingRun[];
    result: unknown;
  };
  grandPrixHistory: Array<{
    id: string;
    name: string;
    season: number;
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
    cards: CardId[];
    livery: TeamLivery;
    ready: boolean;
  }>;
  cardShop: Array<{
    cardId: CardId;
    price: number;
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

export type SubmitQualifyingInput = SubmitDecisionInput & {
  traits?: unknown;
};

export type ResolveGrandPrixInput = {
  allowDefaults?: boolean;
  traits?: unknown;
};

export type UpdateTeamLiveryInput = {
  teamId?: string;
  livery?: unknown;
};

export type UpdateTeamNameInput = {
  teamId?: string;
  name?: string;
};

export type CreateProfileInput = {
  email?: string;
};

export type RecoverProfileInput = {
  email?: string;
  recoveryCode?: string;
};

export type ProfileSession = {
  profile: {
    id: string;
    email: string;
  };
  recoveryCode?: string;
  teams: Array<{
    leagueId: string;
    leagueName: string;
    leagueCode: string;
    teamId: string;
    teamName: string;
    claimCode: string;
  }>;
};

export async function createProfile(db: Db, input: CreateProfileInput = {}): Promise<ProfileSession> {
  const email = normalizeEmail(input.email);
  if (!email) throw new LeagueRuleError("A valid email is required.");

  const existing = await db.profile.findUnique({ where: { email } });
  if (existing) throw new LeagueRuleError("This email already has a profile. Recover it with your code.");

  const recoveryCode = createRecoveryCode();
  const profile = await db.profile.create({
    data: {
      email,
      recoveryCodeHash: hashRecoveryCode(recoveryCode)
    }
  });

  return { profile: { id: profile.id, email: profile.email }, recoveryCode, teams: [] };
}

export async function recoverProfile(db: Db, input: RecoverProfileInput = {}): Promise<ProfileSession | null> {
  const email = normalizeEmail(input.email);
  const recoveryCode = input.recoveryCode?.trim().toUpperCase();
  if (!email || !recoveryCode) throw new LeagueRuleError("Email and recovery code are required.");

  const profile = await db.profile.findUnique({ where: { email } });
  if (!profile || profile.recoveryCodeHash !== hashRecoveryCode(recoveryCode)) return null;

  return profileSession(db, profile.id);
}

export async function createDemoLeague(db: Db, input: CreateLeagueInput = {}) {
  const code = createLeagueCode();
  const playerClaimCode = createClaimCode();
  const leagueName = normalizeDisplayName(input.name, LEAGUE_NAME_LIMIT);
  const playerTeamName = normalizeDisplayName(input.teamName, TEAM_NAME_LIMIT);
  if (input.name !== undefined && !leagueName) {
    throw new LeagueRuleError("League name must be 3 to 40 readable characters.");
  }
  if (input.teamName !== undefined && !playerTeamName) {
    throw new LeagueRuleError("Team name must be 3 to 32 readable characters.");
  }
  await ensureProfileExists(db, input.profileId);
  const maxPlayers = clampInteger(input.maxPlayers, DEFAULT_MAX_PLAYERS, 2, MAX_PLAYERS_LIMIT);
  const qualifyingAttemptLimit = clampInteger(input.qualifyingAttemptLimit, DEFAULT_QUALIFYING_ATTEMPTS, 1, MAX_QUALIFYING_ATTEMPTS);
  const maxGrandPrixPerSeason = clampInteger(input.maxGrandPrixPerSeason, DEFAULT_GRAND_PRIX_PER_SEASON, 1, MAX_GRAND_PRIX_PER_SEASON);

  const league = await db.league.create({
    data: {
      name: leagueName || "CR League Demo",
      code,
      maxPlayers,
      fillWithBots: input.fillWithBots ?? true,
      qualifyingAttemptLimit,
      maxGrandPrixPerSeason
    }
  });

  await db.team.create({
    data: {
      leagueId: league.id,
      profileId: input.profileId,
      name: playerTeamName || DEMO_RACE_INPUT.participants[0]?.teamName || "Player Team",
      kind: "human",
      claimCode: playerClaimCode,
      points: 0,
      credits: 0,
      cards: STARTER_CARDS,
      livery: DEFAULT_LIVERY
    }
  });

  await db.grandPrix.create({
    data: {
      leagueId: league.id,
      name: DEMO_RACE_INPUT.grandPrixName,
      season: 1,
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
  const teamName = normalizeDisplayName(input.teamName, TEAM_NAME_LIMIT);
  if (!code || !teamName) {
    throw new LeagueRuleError("League code and team name are required.");
  }
  await ensureProfileExists(db, input.profileId);

  const league = await db.league.findUnique({ where: { code } });
  if (!league) return null;

  const state = await getLeagueState(db, league.id);
  if (!state) return null;
  if (state.currentGrandPrix.status === "resolved") {
    throw new LeagueRuleError("This league is not accepting new teams after the Grand Prix is resolved.");
  }
  if (state.teams.length >= state.league.maxPlayers) {
    throw new LeagueRuleError("This league is full.");
  }
  if (state.teams.some((team) => team.name.toLowerCase() === teamName.toLowerCase())) {
    throw new LeagueRuleError("This team name is already taken.");
  }

  const team = await db.team.create({
    data: {
      leagueId: league.id,
      profileId: input.profileId,
      name: teamName,
      kind: "human",
      claimCode: createClaimCode(),
      points: 0,
      credits: 0,
      cards: STARTER_CARDS
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
      maxPlayers: league.maxPlayers,
      fillWithBots: league.fillWithBots,
      qualifyingAttemptLimit: league.qualifyingAttemptLimit,
      maxGrandPrixPerSeason: league.maxGrandPrixPerSeason,
      preparationDeadlineAt: league.preparationDeadlineAt?.toISOString() ?? null
    },
    currentGrandPrix: {
      id: grandPrix.id,
      name: grandPrix.name,
      season: grandPrix.season,
      round: grandPrix.round,
      status: grandPrix.status,
      primaryTrait: grandPrix.primaryTrait as RaceInput["primaryTrait"],
      secondaryTrait: grandPrix.secondaryTrait as RaceInput["secondaryTrait"],
      forecast: grandPrix.forecast as RaceInput["forecast"],
      qualifyingRuns: normalizeQualifyingRuns(grandPrix.qualifyingRuns),
      result: grandPrix.result
    },
    grandPrixHistory: league.grandPrixes.map((entry) => ({
      id: entry.id,
      name: entry.name,
      season: entry.season,
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
      cards: normalizeCards(team.cards),
      livery: normalizeLivery(team.livery),
      ready: grandPrix.decisions.some((decision) => decision.teamId === team.id)
    })),
    cardShop: CARD_SHOP,
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

export async function buyCard(db: Db, leagueId: string, input: { teamId?: string; cardId?: string } = {}) {
  if (!input.teamId || !input.cardId || !isCardId(input.cardId)) {
    throw new LeagueRuleError("Expected a team and a valid card.");
  }

  const state = await getLeagueState(db, leagueId);
  if (!state) return null;

  const team = state.teams.find((candidate) => candidate.id === input.teamId);
  if (!team) {
    throw new LeagueRuleError("Team does not belong to this league.");
  }
  if (team.credits < CARD_PRICE) {
    throw new LeagueRuleError("Not enough credits to buy this card.");
  }

  await db.team.update({
    where: { id: team.id },
    data: {
      credits: { decrement: CARD_PRICE },
      cards: appendCard(team.cards, input.cardId)
    }
  });

  return getLeagueState(db, leagueId);
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

export async function updateTeamLivery(db: Db, leagueId: string, input: UpdateTeamLiveryInput = {}) {
  if (!input.teamId) {
    throw new LeagueRuleError("Expected a team.");
  }
  const livery = normalizeLivery(input.livery);
  const state = await getLeagueState(db, leagueId);
  const team = state?.teams.find((candidate) => candidate.id === input.teamId);
  if (!state || !team) return null;

  await db.team.update({
    where: { id: team.id },
    data: { livery }
  });

  return getLeagueState(db, leagueId);
}

export async function updateTeamName(db: Db, leagueId: string, input: UpdateTeamNameInput = {}) {
  if (!input.teamId) {
    throw new LeagueRuleError("Expected a team.");
  }
  const name = normalizeDisplayName(input.name, TEAM_NAME_LIMIT);
  if (!name) {
    throw new LeagueRuleError("Team name must be 3 to 32 readable characters.");
  }

  const state = await getLeagueState(db, leagueId);
  const team = state?.teams.find((candidate) => candidate.id === input.teamId);
  if (!state || !team) return null;
  if (state.teams.some((candidate) => candidate.id !== team.id && candidate.name.toLowerCase() === name.toLowerCase())) {
    throw new LeagueRuleError("This team name is already taken.");
  }

  await db.team.update({
    where: { id: team.id },
    data: { name }
  });

  return getLeagueState(db, leagueId);
}

export async function submitDecision(db: Db, leagueId: string, input: SubmitDecisionInput) {
  const grandPrix = await getCurrentGrandPrix(db, leagueId);
  if (!grandPrix) return null;
  if (grandPrix.status === "resolved") {
    throw new LeagueRuleError("This Grand Prix is already resolved.");
  }
  const state = await getLeagueState(db, leagueId);
  const team = state?.teams.find((candidate) => candidate.id === input.teamId);
  if (!state || !team) return null;
  if (input.cardId && !team.cards.includes(input.cardId)) {
    throw new LeagueRuleError("This card is not in your inventory.");
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

export async function submitQualifyingRun(db: Db, leagueId: string, input: SubmitQualifyingInput) {
  const grandPrix = await getCurrentGrandPrix(db, leagueId);
  if (!grandPrix) return null;
  if (grandPrix.status === "resolved") {
    throw new LeagueRuleError("This Grand Prix is already resolved.");
  }

  const state = await getLeagueState(db, leagueId);
  const team = state?.teams.find((candidate) => candidate.id === input.teamId);
  if (!state || !team) return null;
  if (input.cardId && !team.cards.includes(input.cardId)) {
    throw new LeagueRuleError("This card is not in your inventory.");
  }

  const decision: RaceDecision = {
    approach: input.approach,
    preparation: input.preparation,
    cardId: input.cardId,
    rivalTeamId: input.rivalTeamId
  };
  const run = createQualifyingRun({
    seed: `${grandPrix.seed}-${team.id}-${Date.now()}-${Math.random()}`,
    teamId: team.id,
    teamName: team.name,
    decision,
    primaryTrait: grandPrix.primaryTrait as RaceInput["primaryTrait"],
    secondaryTrait: grandPrix.secondaryTrait as RaceInput["secondaryTrait"],
    traits: normalizeRaceTraits(input.traits),
    forecast: grandPrix.forecast as RaceInput["forecast"]
  });
  const runs = normalizeQualifyingRuns(grandPrix.qualifyingRuns);
  const previous = runs.find((candidate) => candidate.teamId === team.id);
  const attempts = (previous?.attempts ?? 0) + 1;
  if (attempts > state.league.qualifyingAttemptLimit) {
    throw new LeagueRuleError("No qualifying attempts left.");
  }
  const nextBest = previous && previous.time <= run.time ? { ...previous, attempts } : { ...run, attempts };
  const nextRuns = [...runs.filter((candidate) => candidate.teamId !== team.id), nextBest];

  await db.grandPrix.update({
    where: { id: grandPrix.id },
    data: { qualifyingRuns: nextRuns }
  });

  return {
    state: await getLeagueState(db, leagueId),
    run: { ...run, attempts },
    isBest: !previous || run.time < previous.time
  };
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

  if (state.league.fillWithBots) {
    await fillLeagueWithBots(db, state);
  }
  const readyState = state.league.fillWithBots ? await getLeagueState(db, leagueId) : state;
  if (!readyState) return null;
  if (readyState.teams.length < 2) {
    throw new LeagueRuleError("At least two teams are required to launch the Grand Prix.");
  }

  const participants = buildParticipants(readyState);
  const result = simulateRace({
    seed: grandPrix.seed,
    grandPrixName: grandPrix.name,
    primaryTrait: grandPrix.primaryTrait as RaceInput["primaryTrait"],
    secondaryTrait: grandPrix.secondaryTrait as RaceInput["secondaryTrait"],
    traits: normalizeRaceTraits(input.traits),
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
  for (const consumed of result.consumedCards) {
    const team = readyState.teams.find((candidate) => candidate.id === consumed.teamId);
    if (!team) continue;
    await db.team.update({
      where: { id: team.id },
      data: {
        cards: removeOneCard(team.cards, consumed.cardId)
      }
    });
  }

  return getLeagueState(db, leagueId);
}

export async function startNextGrandPrix(db: Db, leagueId: string) {
  const grandPrix = await getCurrentGrandPrix(db, leagueId);
  const state = await getLeagueState(db, leagueId);
  if (!grandPrix) return null;
  if (grandPrix.status !== "resolved") {
    throw new LeagueRuleError("Resolve the current Grand Prix before starting the next one.");
  }
  if (!state) return null;
  const nextSeason = grandPrix.round >= state.league.maxGrandPrixPerSeason ? grandPrix.season + 1 : grandPrix.season;
  const nextRound = grandPrix.round >= state.league.maxGrandPrixPerSeason ? 1 : grandPrix.round + 1;

  await db.grandPrix.create({
    data: {
      leagueId,
      name: DEMO_RACE_INPUT.grandPrixName,
      season: nextSeason,
      round: nextRound,
      seed: `${DEMO_RACE_INPUT.seed}-${leagueId}-s${nextSeason}-r${nextRound}`,
      primaryTrait: DEMO_RACE_INPUT.primaryTrait,
      secondaryTrait: DEMO_RACE_INPUT.secondaryTrait,
      forecast: DEMO_RACE_INPUT.forecast
    }
  });

  return getLeagueState(db, leagueId);
}

export async function restartLeague(db: Db, leagueId: string) {
  const state = await getLeagueState(db, leagueId);
  if (!state) return null;

  await db.raceDecision.deleteMany({
    where: {
      grandPrix: {
        leagueId
      }
    }
  });
  await db.grandPrix.deleteMany({ where: { leagueId } });
  await db.league.update({
    where: { id: leagueId },
    data: {
      preparationDeadlineAt: null
    }
  });

  for (const team of state.teams) {
    await db.team.update({
      where: { id: team.id },
      data: {
        points: 0,
        credits: 0,
        cards: team.kind === "human" ? STARTER_CARDS : [],
        livery: team.kind === "bot" ? randomBotLivery() : team.livery
      }
    });
  }

  await db.grandPrix.create({
    data: {
      leagueId,
      name: DEMO_RACE_INPUT.grandPrixName,
      season: 1,
      round: 1,
      seed: `${DEMO_RACE_INPUT.seed}-${leagueId}-restart`,
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
  const baseRank = new Map(state.teams.map((team, index) => [team.id, index + 1]));
  const qualifyingTime = new Map(state.currentGrandPrix.qualifyingRuns.map((run) => [run.teamId, run.time]));
  const qualifyingRank = new Map(
    [...state.teams]
      .sort(
        (left, right) =>
          (qualifyingTime.get(left.id) ?? Number.POSITIVE_INFINITY) - (qualifyingTime.get(right.id) ?? Number.POSITIVE_INFINITY) ||
          (baseRank.get(left.id) ?? 999) - (baseRank.get(right.id) ?? 999)
      )
      .map((team, index) => [team.id, index + 1])
  );

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
      standingsRank: qualifyingRank.get(team.id) ?? index + 1,
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

async function fillLeagueWithBots(db: Db, state: LeagueState) {
  const missing = Math.max(0, state.league.maxPlayers - state.teams.length);
  if (!missing) return;

  const existingNames = new Set(state.teams.map((team) => team.name.toLowerCase()));
  const botTemplates = DEMO_RACE_INPUT.participants.filter((participant) => participant.kind === "bot");
  const bots = Array.from({ length: missing }, (_, index) => {
    const participant = botTemplates[index % botTemplates.length];
    if (!participant) return null;
    let name = participant.teamName;
    let suffix = 2;
    while (existingNames.has(name.toLowerCase())) {
      name = `${participant.teamName} ${suffix}`;
      suffix += 1;
    }
    existingNames.add(name.toLowerCase());
    return { ...participant, teamName: name };
  }).filter((participant): participant is (typeof botTemplates)[number] => Boolean(participant));
  if (!bots.length) return;

  await db.team.createMany({
    data: bots.map((participant) => ({
      leagueId: state.league.id,
      name: participant.teamName,
      kind: "bot",
      claimCode: createClaimCode(),
      points: 0,
      credits: 0,
      cards: [],
      livery: randomBotLivery()
    }))
  });
}

function createQualifyingRun(input: {
  seed: string;
  teamId: string;
  teamName: string;
  decision: RaceDecision;
  primaryTrait: RaceInput["primaryTrait"];
  secondaryTrait: RaceInput["secondaryTrait"];
  traits?: RaceTraits;
  forecast: RaceInput["forecast"];
}): QualifyingRun {
  const weather = strongestForecast(input.forecast);
  const traits = input.traits ?? { grip: 62, overtaking: 62, energy: 62 };
  const traitBonus = (traits.grip + traits.overtaking + traits.energy - 180) / 18;
  const weatherPenalty = weather === "heavy_rain" ? 2.8 : weather === "light_rain" ? 1.2 : 0;
  const approachDelta = input.decision.approach === "aggressive" ? -1.1 : input.decision.approach === "prudent" ? 0.7 : 0;
  const prepDelta =
    input.decision.preparation === "speed"
      ? -1.2
      : input.decision.preparation === "weather" && weather !== "dry"
        ? -1.4
        : input.decision.preparation === "reliability"
          ? 0.4
          : 0;
  const cardDelta = input.decision.cardId === "launch_boost" ? -0.8 : input.decision.cardId === "rain_grip" && weather !== "dry" ? -0.7 : 0;
  const variance = (Math.random() - 0.5) * 2.4;
  const time = Number(Math.max(72, 91 - traitBonus + weatherPenalty + approachDelta + prepDelta + cardDelta + variance).toFixed(2));
  const result = createQualifyingResult(input.teamId, input.teamName, input.seed, input.decision, time, weather);

  return {
    teamId: input.teamId,
    time,
    attempts: 1,
    decision: input.decision,
    result,
    createdAt: new Date().toISOString()
  };
}

function createQualifyingResult(teamId: string, teamName: string, seed: string, decision: RaceDecision, time: number, weather: Weather): RaceResult {
  const segments: RaceSegment[] = ["start", "early", "mid", "late", "finish"];
  const event: RaceEvent = {
    id: "qualifying_finish",
    order: 0,
    segment: "finish",
    lap: 1,
    type: "finish",
    teamId,
    severity: "minor",
    positionDelta: 0,
    tags: ["qualifying"],
    replayText: `${teamName} boucle son chrono en ${time.toFixed(2)}s`,
    reportText: `${teamName} signe un chrono en ${time.toFixed(2)}s.`
  };

  return {
    grandPrixName: "Chrono",
    seed,
    resolvedWeather: Object.fromEntries(segments.map((segment) => [segment, weather])) as Record<RaceSegment, Weather>,
    classification: [
      {
        position: 1,
        teamId,
        teamName,
        points: 0,
        credits: 0,
        positionChange: 0,
        status: "finished",
        resultTags: [decision.approach, decision.preparation]
      }
    ],
    events: [event],
    replayTrace: Array.from({ length: 11 }, (_, index) => ({
      segment: segments[Math.min(segments.length - 1, Math.floor((index / 10) * segments.length))] ?? "start",
      lap: 1,
      progress: index / 10,
      order: [teamId],
      times: { [teamId]: Number(((time * index) / 10).toFixed(1)) },
      gaps: { [teamId]: 0 }
    })),
    consumedCards: [],
    report: {
      headline: `${teamName} ${time.toFixed(2)}s`,
      blocks: []
    }
  };
}

function strongestForecast(forecast: RaceInput["forecast"]): Weather {
  return (Object.entries(forecast).sort((left, right) => right[1] - left[1])[0]?.[0] ?? "dry") as Weather;
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

function normalizeRaceTraits(value: unknown): RaceTraits | undefined {
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

function clampTrait(value: number) {
  return Math.max(1, Math.min(99, Math.round(value)));
}

function clampInteger(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(min, Math.min(max, Math.round(value))) : fallback;
}

function createLeagueCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function createClaimCode() {
  return Math.random().toString(36).slice(2, 12).toUpperCase();
}

function createRecoveryCode() {
  return randomBytes(4).toString("hex").toUpperCase();
}

function hashRecoveryCode(code: string) {
  return createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return "";
  const email = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function normalizeDisplayName(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  const name = value.trim().replace(/\s+/g, " ");
  if (name.length < 3 || name.length > maxLength) return "";
  return /^[\p{L}\p{N}' -]+$/u.test(name) ? name : "";
}

async function ensureProfileExists(db: Db, profileId: string | undefined) {
  if (!profileId) return;
  const profile = await db.profile.findUnique({ where: { id: profileId } });
  if (!profile) throw new LeagueRuleError("Profile not found.");
}

async function profileSession(db: Db, profileId: string): Promise<ProfileSession | null> {
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

function isLeagueCadence(value: string): value is (typeof LEAGUE_CADENCES)[number] {
  return LEAGUE_CADENCES.includes(value as (typeof LEAGUE_CADENCES)[number]);
}

function isCardId(value: string): value is CardId {
  return value in CARD_DEFINITIONS;
}

function normalizeCards(value: Prisma.JsonValue): CardId[] {
  return Array.isArray(value) ? value.filter((cardId): cardId is CardId => typeof cardId === "string" && isCardId(cardId)) : [];
}

function normalizeQualifyingRuns(value: unknown): QualifyingRun[] {
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

function normalizeLivery(value: unknown): TeamLivery {
  if (!value || typeof value !== "object") return DEFAULT_LIVERY;
  const livery = value as Partial<Record<keyof TeamLivery, unknown>>;
  return {
    primary: typeof livery.primary === "string" && isHexColor(livery.primary) ? livery.primary : DEFAULT_LIVERY.primary,
    secondary: typeof livery.secondary === "string" && isHexColor(livery.secondary) ? livery.secondary : DEFAULT_LIVERY.secondary
  };
}

function randomBotLivery(): TeamLivery {
  const primary = BOT_LIVERY_COLORS[Math.floor(Math.random() * BOT_LIVERY_COLORS.length)] ?? DEFAULT_LIVERY.primary;
  const secondaryChoices = BOT_LIVERY_COLORS.filter((color) => color !== primary);
  const secondary = secondaryChoices[Math.floor(Math.random() * secondaryChoices.length)] ?? DEFAULT_LIVERY.secondary;
  return { primary, secondary };
}

function isHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}

function appendCard(cards: CardId[], cardId: CardId): Prisma.InputJsonValue {
  return [...cards, cardId];
}

function removeOneCard(cards: CardId[], cardId: CardId): Prisma.InputJsonValue {
  const nextCards = [...cards];
  const index = nextCards.indexOf(cardId);
  if (index >= 0) nextCards.splice(index, 1);
  return nextCards;
}
