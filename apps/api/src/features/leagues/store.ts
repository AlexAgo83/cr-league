import {
  CARD_DEFINITIONS,
  DEMO_RACE_INPUT,
  simulateRace,
  type CardId,
  type RaceDecision,
  type RaceInput,
  type RaceParticipant,
  type RaceTraits,
  type TeamLivery
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

  const league = await db.league.create({
    data: {
      name: leagueName || "CR League Demo",
      code
    }
  });

  await db.team.createMany({
    data: DEMO_RACE_INPUT.participants.map((participant, index) => ({
      leagueId: league.id,
      profileId: index === 0 ? input.profileId : undefined,
      name: index === 0 ? playerTeamName || DEMO_RACE_INPUT.participants[0]?.teamName || "Player Team" : participant.teamName,
      kind: participant.kind,
      claimCode: index === 0 ? playerClaimCode : createClaimCode(),
      points: 0,
      credits: 0,
      cards: index === 0 ? STARTER_CARDS : [],
      livery: participant.kind === "bot" ? randomBotLivery() : DEFAULT_LIVERY
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
  const playerTeam = state?.teams.find((team) => team.name === playerTeamName);
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
    const team = state.teams.find((candidate) => candidate.id === consumed.teamId);
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
