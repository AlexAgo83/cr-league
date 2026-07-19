import {
  CARD_DEFINITIONS,
  CARD_PRICE,
  DEMO_RACE_INPUT,
  PIT_STRATEGIES,
  RACE_APPROACHES,
  TECHNICAL_PREPARATIONS,
  circuitIdentityForRound,
  circuitSeasonSeed,
  raceInputFromCircuit,
  simulateRace,
  type CardId,
  type QualifyingRun,
  type RaceDecision,
  type RaceInput,
  type RaceParticipant
} from "@cr-league/shared";
import { createHash } from "node:crypto";
import {
  BOT_TEAM_NAMES,
  CARD_SHOP,
  DEFAULT_GRAND_PRIX_PER_SEASON,
  DEFAULT_MAX_PLAYERS,
  DEFAULT_QUALIFYING_ATTEMPTS,
  LEAGUE_NAME_LIMIT,
  MAX_GRAND_PRIX_PER_SEASON,
  MAX_PLAYERS_LIMIT,
  MAX_QUALIFYING_ATTEMPTS,
  STARTER_CARDS,
  STARTING_CREDITS,
  TEAM_NAME_LIMIT
} from "./constants.js";
import { LeagueRuleError } from "./errors.js";
import { getCurrentGrandPrix, isUniqueConstraintError, lockGrandPrixRow, retryUnique, runWrite } from "./persistence.js";
import { bestQualifyingRuns, createQualifyingRuns, qualifyingCardForTeam } from "./qualifying.js";
import type {
  AdminProofInput,
  CreateLeagueInput,
  CreateProfileInput,
  Db,
  JoinLeagueInput,
  LeagueState,
  ProfileSession,
  RecoverProfileInput,
  RejoinLeagueInput,
  ResolveGrandPrixInput,
  SubmitDecisionInput,
  SubmitQualifyingInput,
  UpdateLeagueSettingsInput,
  UpdateTeamLiveryInput,
  UpdateTeamNameInput
} from "./types.js";
import {
  appendCard,
  clampInteger,
  createClaimCode,
  createLeagueCode,
  createRecoveryCode,
  ensureProfileExists,
  hashRecoveryCode,
  isCardId,
  isLeagueCadence,
  liveryKey,
  normalizeCards,
  normalizeDisplayName,
  normalizeEmail,
  normalizeLivery,
  normalizeQualifyingRuns,
  normalizeRaceTraits,
  profileSession,
  randomLivery,
  removeOneCard,
  uniqueBotLivery
} from "./utils.js";

export { LeagueRuleError } from "./errors.js";
export type {
  AdminProofInput,
  CreateLeagueInput,
  CreateProfileInput,
  LeagueState,
  ProfileSession,
  RecoverProfileInput,
  ResolveGrandPrixInput,
  SubmitDecisionInput,
  SubmitQualifyingInput,
  UpdateLeagueSettingsInput,
  UpdateTeamLiveryInput,
  UpdateTeamNameInput
} from "./types.js";

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

  const { league, playerClaimCode } = await retryUnique(async () => {
    const playerClaimCode = createClaimCode();
    const league = await runWrite(db, async (tx) => {
      const league = await tx.league.create({
        data: {
          name: leagueName || "CR League Demo",
          code: createLeagueCode(),
          maxPlayers,
          fillWithBots: input.fillWithBots ?? true,
          qualifyingAttemptLimit,
          maxGrandPrixPerSeason
        }
      });
      const openingRaceInput = raceInputFromCircuit(circuitIdentityForRound(1, circuitSeasonSeed(league.id, 1)));

      const ownerTeam = await tx.team.create({
        data: {
          leagueId: league.id,
          profileId: input.profileId,
          name: playerTeamName || DEMO_RACE_INPUT.participants[0]?.teamName || "Player Team",
          kind: "human",
          claimCode: playerClaimCode,
          points: 0,
          credits: STARTING_CREDITS,
          cards: STARTER_CARDS,
          livery: randomLivery()
        }
      });

      await tx.league.update({
        where: { id: league.id },
        data: { ownerTeamId: ownerTeam.id }
      });

      await tx.grandPrix.create({
        data: {
          leagueId: league.id,
          name: DEMO_RACE_INPUT.grandPrixName,
          season: 1,
          round: 1,
          seed: `${DEMO_RACE_INPUT.seed}-${league.id}`,
          primaryTrait: openingRaceInput.primaryTrait,
          secondaryTrait: openingRaceInput.secondaryTrait,
          forecast: openingRaceInput.forecast
        }
      });

      return league;
    });

    return { league, playerClaimCode };
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

  const team = await retryUnique(() =>
    db.team.create({
      data: {
        leagueId: league.id,
        profileId: input.profileId,
        name: teamName,
        kind: "human",
        claimCode: createClaimCode(),
        points: 0,
        credits: STARTING_CREDITS,
        cards: STARTER_CARDS,
        livery: randomLivery()
      }
    })
  );

  const nextState = await getLeagueState(db, league.id);
  return nextState ? withPlayer(nextState, team.id, team.claimCode ?? "") : nextState;
}

export async function rejoinLeague(db: Db, input: RejoinLeagueInput = {}) {
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
        orderBy: [{ season: "desc" }, { round: "desc" }],
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
      pitStrategy: normalizePitStrategy(decision.pitStrategy),
      cardId: decision.cardId,
      rivalTeamId: decision.rivalTeamId
    }))
  };
}

export async function buyCard(db: Db, leagueId: string, input: { teamId?: string; claimCode?: string; cardId?: string } = {}) {
  const cardId = input.cardId;
  if (typeof cardId !== "string" || !isCardId(cardId)) {
    throw new LeagueRuleError("Expected a team and a valid card.");
  }

  const state = await getLeagueState(db, leagueId);
  if (!state) return null;

  const team = await requireTeamClaim(db, leagueId, input);
  const price = CARD_PRICE;
  if (team.credits < price) {
    throw new LeagueRuleError("Not enough credits to buy this card.");
  }

  await runWrite(db, async (tx) => {
    const freshTeam = await tx.team.findUnique({ where: { id: team.id } });
    if (!freshTeam || freshTeam.leagueId !== leagueId || freshTeam.credits < price) {
      throw new LeagueRuleError("Not enough credits to buy this card.");
    }
    const updated = await tx.team.updateMany({
      where: { id: freshTeam.id, credits: { gte: price } },
      data: {
        credits: { decrement: price },
        cards: appendCard(normalizeCards(freshTeam.cards), cardId)
      }
    });
    if (updated.count !== 1) throw new LeagueRuleError("Not enough credits to buy this card.");
  });

  return getLeagueState(db, leagueId);
}

export async function sellCard(db: Db, leagueId: string, input: { teamId?: string; claimCode?: string; cardId?: string } = {}) {
  const cardId = input.cardId;
  if (typeof cardId !== "string" || !isCardId(cardId)) {
    throw new LeagueRuleError("Expected a team and a valid card.");
  }

  const state = await getLeagueState(db, leagueId);
  if (!state) return null;

  const team = await requireTeamClaim(db, leagueId, input);
  if (state.decisions.some((decision) => decision.teamId === team.id && decision.cardId === cardId)) {
    throw new LeagueRuleError("This card is already used in your current plan.");
  }
  if (qualifyingCardForTeam(state.currentGrandPrix.qualifyingRuns, team.id) === cardId) {
    throw new LeagueRuleError("This card is already locked by your qualifying run.");
  }

  await runWrite(db, async (tx) => {
    const freshTeam = await tx.team.findUnique({ where: { id: team.id } });
    const cards = freshTeam && freshTeam.leagueId === leagueId ? normalizeCards(freshTeam.cards) : [];
    if (!freshTeam || !cards.includes(cardId)) {
      throw new LeagueRuleError("This card is not in your inventory.");
    }
    await tx.team.update({
      where: { id: freshTeam.id },
      data: {
        credits: { increment: CARD_PRICE / 2 },
        cards: removeOneCard(cards, cardId)
      }
    });
  });

  return getLeagueState(db, leagueId);
}

export async function updateLeagueSettings(db: Db, leagueId: string, input: UpdateLeagueSettingsInput = {}) {
  await requireAdminClaim(db, leagueId, input);
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
  const livery = normalizeLivery(input.livery);
  const state = await getLeagueState(db, leagueId);
  if (!state) return null;
  const team = await requireTeamClaim(db, leagueId, input);

  await db.team.update({
    where: { id: team.id },
    data: { livery }
  });

  return getLeagueState(db, leagueId);
}

export async function updateTeamName(db: Db, leagueId: string, input: UpdateTeamNameInput = {}) {
  const name = normalizeDisplayName(input.name, TEAM_NAME_LIMIT);
  if (!name) {
    throw new LeagueRuleError("Team name must be 3 to 32 readable characters.");
  }

  const state = await getLeagueState(db, leagueId);
  if (!state) return null;
  const team = await requireTeamClaim(db, leagueId, input);
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
  if (!state) return null;
  validateDecisionValues(state, input);
  const team = await requireTeamClaim(db, leagueId, input);
  const lockedCardId = qualifyingCardForTeam(state.currentGrandPrix.qualifyingRuns, team.id);
  if (lockedCardId && input.cardId && input.cardId !== lockedCardId) {
    throw new LeagueRuleError("This Grand Prix card is already locked by your qualifying run.");
  }
  const cardId = lockedCardId ?? input.cardId;
  if (cardId && !team.cards.includes(cardId)) {
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
      pitStrategy: input.pitStrategy ?? "standard",
      cardId,
      rivalTeamId: input.rivalTeamId
    },
    create: {
      grandPrixId: grandPrix.id,
      teamId: input.teamId,
      approach: input.approach,
      preparation: input.preparation,
      pitStrategy: input.pitStrategy ?? "standard",
      cardId,
      rivalTeamId: input.rivalTeamId
    }
  });

  const lockedState = await getLeagueState(db, leagueId);
  if (!lockedState) return null;
  if (lockedState.league.fillWithBots) {
    await fillLeagueWithBots(db, lockedState);
  }
  const readyState = lockedState.league.fillWithBots ? await getLeagueState(db, leagueId) : lockedState;
  if (readyState) await ensureBotQualifyingRuns(db, grandPrix, readyState);

  return getLeagueState(db, leagueId);
}

export async function submitQualifyingRun(db: Db, leagueId: string, input: SubmitQualifyingInput) {
  const grandPrix = await getCurrentGrandPrix(db, leagueId);
  if (!grandPrix) return null;
  if (grandPrix.status === "resolved") {
    throw new LeagueRuleError("This Grand Prix is already resolved.");
  }

  const state = await getLeagueState(db, leagueId);
  if (!state) return null;
  validateDecisionValues(state, input);
  const team = await requireTeamClaim(db, leagueId, input);
  if (state.decisions.some((decision) => decision.teamId === team.id)) {
    throw new LeagueRuleError("Qualifying is closed after submitting your directive.");
  }
  const lockedCardId = qualifyingCardForTeam(state.currentGrandPrix.qualifyingRuns, team.id);
  if (lockedCardId && input.cardId && input.cardId !== lockedCardId) {
    throw new LeagueRuleError("This Grand Prix card is already locked by your qualifying run.");
  }
  const cardId = lockedCardId ?? input.cardId;
  if (cardId && !team.cards.includes(cardId)) {
    throw new LeagueRuleError("This card is not in your inventory.");
  }

  const decision: RaceDecision = {
    approach: input.approach,
    preparation: input.preparation,
    pitStrategy: input.pitStrategy ?? "standard",
    cardId,
    rivalTeamId: input.rivalTeamId
  };
  const { nextRun, previousBest } = await runWrite(db, async (tx) => {
    await lockGrandPrixRow(tx, grandPrix.id);
    const freshGrandPrix = await getCurrentGrandPrix(tx, leagueId);
    if (!freshGrandPrix || freshGrandPrix.id !== grandPrix.id || freshGrandPrix.status === "resolved") {
      throw new LeagueRuleError("This Grand Prix is already resolved.");
    }
    const runs = normalizeQualifyingRuns(freshGrandPrix.qualifyingRuns);
    const teamRuns = runs.filter((candidate) => candidate.teamId === team.id);
    const previousBest = teamRuns.reduce<QualifyingRun | null>((best, candidate) => (!best || candidate.time < best.time ? candidate : best), null);
    const attempts = Math.max(0, ...teamRuns.map((candidate) => candidate.attempts)) + 1;
    if (attempts > state.league.qualifyingAttemptLimit) {
      throw new LeagueRuleError("No qualifying attempts left.");
    }
    const attemptRuns = createQualifyingRuns({
      seed: `${freshGrandPrix.seed}-${team.id}-${Date.now()}-${Math.random()}`,
      teamId: team.id,
      teamName: team.name,
      decision,
      primaryTrait: freshGrandPrix.primaryTrait as RaceInput["primaryTrait"],
      secondaryTrait: freshGrandPrix.secondaryTrait as RaceInput["secondaryTrait"],
      traits: normalizeRaceTraits(input.traits),
      forecast: freshGrandPrix.forecast as RaceInput["forecast"],
      laps: clampInteger(input.laps, 5, 1, 20)
    });
    const nextRunsForAttempt = attemptRuns.map((run) => ({ ...run, attempts }));
    const nextRun = nextRunsForAttempt.reduce((best, run) => (run.time < best.time ? run : best), nextRunsForAttempt[0]!);

    await tx.grandPrix.update({
      where: { id: freshGrandPrix.id },
      data: { qualifyingRuns: [...runs, ...nextRunsForAttempt] }
    });

    return { nextRun, previousBest };
  });

  return {
    state: await getLeagueState(db, leagueId),
    run: nextRun,
    isBest: !previousBest || nextRun.time < previousBest.time
  };
}

export async function resolveCurrentGrandPrix(db: Db, leagueId: string, input: ResolveGrandPrixInput = {}) {
  await requireAdminClaim(db, leagueId, input);
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
  await ensureBotQualifyingRuns(db, grandPrix, readyState);
  const raceState = await getLeagueState(db, leagueId);
  if (!raceState) return null;
  if (raceState.teams.length < 2) {
    throw new LeagueRuleError("At least two teams are required to launch the Grand Prix.");
  }

  await runWrite(db, async (tx) => {
    await lockGrandPrixRow(tx, grandPrix.id);
    const freshState = await getLeagueState(tx, leagueId);
    const freshGrandPrix = await getCurrentGrandPrix(tx, leagueId);
    if (!freshState || !freshGrandPrix || freshGrandPrix.id !== grandPrix.id) return;
    if (freshState.teams.length < 2) {
      throw new LeagueRuleError("At least two teams are required to launch the Grand Prix.");
    }
    const participants = buildParticipants(freshState);
    const result = simulateRace({
      seed: freshGrandPrix.seed,
      grandPrixName: freshGrandPrix.name,
      primaryTrait: freshGrandPrix.primaryTrait as RaceInput["primaryTrait"],
      secondaryTrait: freshGrandPrix.secondaryTrait as RaceInput["secondaryTrait"],
      traits: normalizeRaceTraits(input.traits),
      forecast: freshGrandPrix.forecast as RaceInput["forecast"],
      participants
    });
    const claimed = await tx.grandPrix.updateMany({
      where: { id: grandPrix.id, status: "briefing" },
      data: {
        status: "resolved",
        result
      }
    });
    if (claimed.count !== 1) throw new LeagueRuleError("This Grand Prix is already resolved.");

    for (const entry of result.classification) {
      await tx.team.update({
        where: { id: entry.teamId },
        data: {
          points: { increment: entry.points },
          credits: { increment: entry.credits }
        }
      });
    }
    for (const consumed of result.consumedCards) {
      const team = await tx.team.findUnique({ where: { id: consumed.teamId } });
      if (!team || team.leagueId !== leagueId) continue;
      await tx.team.update({
        where: { id: team.id },
        data: {
          cards: removeOneCard(normalizeCards(team.cards), consumed.cardId)
        }
      });
    }
  });

  return getLeagueState(db, leagueId);
}

export async function startNextGrandPrix(db: Db, leagueId: string, input: AdminProofInput = {}) {
  await requireAdminClaim(db, leagueId, input);
  const grandPrix = await getCurrentGrandPrix(db, leagueId);
  const state = await getLeagueState(db, leagueId);
  if (!grandPrix) return null;
  if (grandPrix.status !== "resolved") {
    throw new LeagueRuleError("Resolve the current Grand Prix before starting the next one.");
  }
  if (!state) return null;
  const nextSeason = grandPrix.round >= state.league.maxGrandPrixPerSeason ? grandPrix.season + 1 : grandPrix.season;
  const nextRound = grandPrix.round >= state.league.maxGrandPrixPerSeason ? 1 : grandPrix.round + 1;
  const nextRaceInput = raceInputFromCircuit(circuitIdentityForRound(nextRound, circuitSeasonSeed(leagueId, nextSeason)));

  await runWrite(db, async (tx) => {
    // The (leagueId, season, round) unique constraint claims the transition: a concurrent double call fails here before touching credits or points.
    try {
      await tx.grandPrix.create({
        data: {
          leagueId,
          name: DEMO_RACE_INPUT.grandPrixName,
          season: nextSeason,
          round: nextRound,
          seed: `${DEMO_RACE_INPUT.seed}-${leagueId}-s${nextSeason}-r${nextRound}`,
          primaryTrait: nextRaceInput.primaryTrait,
          secondaryTrait: nextRaceInput.secondaryTrait,
          forecast: nextRaceInput.forecast
        }
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) throw new LeagueRuleError("The next Grand Prix has already started.");
      throw error;
    }
    const freshState = await getLeagueState(tx, leagueId);
    if (!freshState) return;
    await buyBotCards(tx, freshState, `${leagueId}-s${nextSeason}-r${nextRound}`);
    if (nextSeason !== grandPrix.season) {
      await Promise.all(freshState.teams.map((team) => tx.team.update({ where: { id: team.id }, data: { points: 0 } })));
    }
  });

  return getLeagueState(db, leagueId);
}

export async function restartLeague(db: Db, leagueId: string, input: AdminProofInput = {}) {
  await requireAdminClaim(db, leagueId, input);
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

  const usedBotLiveries = new Set(state.teams.filter((team) => team.kind !== "bot").map((team) => liveryKey(team.livery)));
  let botLiveryIndex = 0;
  for (const team of state.teams) {
    const livery = team.kind === "bot" ? uniqueBotLivery(botLiveryIndex, usedBotLiveries) : team.livery;
    if (team.kind === "bot") botLiveryIndex += 1;
    await db.team.update({
      where: { id: team.id },
      data: {
        points: 0,
        credits: team.kind === "human" ? STARTING_CREDITS : 0,
        cards: team.kind === "human" ? STARTER_CARDS : [],
        livery
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

async function ensureBotQualifyingRuns(db: Db, grandPrix: Awaited<ReturnType<typeof getCurrentGrandPrix>>, state: LeagueState) {
  if (!grandPrix) return;
  await runWrite(db, async (tx) => {
    await lockGrandPrixRow(tx, grandPrix.id);
    const freshGrandPrix = await getCurrentGrandPrix(tx, state.league.id);
    if (!freshGrandPrix || freshGrandPrix.id !== grandPrix.id) return;
    const runs = normalizeQualifyingRuns(freshGrandPrix.qualifyingRuns);
    const runTeamIds = new Set(runs.map((run) => run.teamId));
    const missingBots = state.teams.filter((team) => team.kind === "bot" && !runTeamIds.has(team.id));
    if (!missingBots.length) return;

    const nextRuns = [...runs];
    for (const team of missingBots) {
      const demo = DEMO_RACE_INPUT.participants[state.teams.indexOf(team) % DEMO_RACE_INPUT.participants.length];
      const submittedDecision = state.decisions.find((candidate) => candidate.teamId === team.id);
      const decision: RaceDecision = submittedDecision
        ? {
            approach: submittedDecision.approach as RaceDecision["approach"],
            preparation: submittedDecision.preparation as RaceDecision["preparation"],
            pitStrategy: normalizePitStrategy(submittedDecision.pitStrategy),
            cardId: (submittedDecision.cardId ?? undefined) as RaceDecision["cardId"],
            rivalTeamId: submittedDecision.rivalTeamId ?? undefined
          }
        : {
            approach: demo?.decision.approach ?? "balanced",
            preparation: demo?.decision.preparation ?? "speed",
            pitStrategy: normalizePitStrategy(demo?.decision.pitStrategy),
            cardId: defaultCardForTeam(team, demo?.decision.cardId),
            rivalTeamId: demo?.decision.rivalTeamId
          };
      nextRuns.push(
        createQualifyingRuns({
          seed: `${freshGrandPrix.seed}-${team.id}-bot-qualifying`,
          teamId: team.id,
          teamName: team.name,
          decision,
          primaryTrait: freshGrandPrix.primaryTrait as RaceInput["primaryTrait"],
          secondaryTrait: freshGrandPrix.secondaryTrait as RaceInput["secondaryTrait"],
          forecast: freshGrandPrix.forecast as RaceInput["forecast"],
          laps: 1
        })[0]!
      );
    }

    await tx.grandPrix.update({ where: { id: freshGrandPrix.id }, data: { qualifyingRuns: nextRuns } });
  });
}

function buildParticipants(state: LeagueState): RaceParticipant[] {
  const baseRank = new Map(state.teams.map((team, index) => [team.id, index + 1]));
  const qualifyingTime = new Map(bestQualifyingRuns(state.currentGrandPrix.qualifyingRuns).map((run) => [run.teamId, run.time]));
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
            pitStrategy: normalizePitStrategy(decision.pitStrategy),
            cardId: (decision.cardId ?? undefined) as RaceDecision["cardId"],
            rivalTeamId: decision.rivalTeamId ?? undefined
          }
        : { ...demo.decision, cardId: defaultCardForTeam(team, demo.decision.cardId) }
    };
  });
}

function validateDecisionValues(state: LeagueState, input: SubmitDecisionInput) {
  if (!RACE_APPROACHES.includes(input.approach)) {
    throw new LeagueRuleError("Unsupported race approach.", 400);
  }
  if (!TECHNICAL_PREPARATIONS.includes(input.preparation)) {
    throw new LeagueRuleError("Unsupported technical preparation.", 400);
  }
  if (input.pitStrategy != null && !PIT_STRATEGIES.includes(input.pitStrategy)) {
    throw new LeagueRuleError("Unsupported pit strategy.", 400);
  }
  if (input.cardId != null && (typeof input.cardId !== "string" || !isCardId(input.cardId))) {
    throw new LeagueRuleError("Unknown card.", 400);
  }
  if (input.rivalTeamId != null && !state.teams.some((team) => team.id === input.rivalTeamId)) {
    throw new LeagueRuleError("Unknown rival team.", 400);
  }
}

function normalizePitStrategy(value: unknown): NonNullable<RaceDecision["pitStrategy"]> {
  return PIT_STRATEGIES.includes(value as NonNullable<RaceDecision["pitStrategy"]>) ? value as NonNullable<RaceDecision["pitStrategy"]> : "standard";
}

async function requireAdminClaim(db: Db, leagueId: string, input: AdminProofInput) {
  const team = await requireTeamClaim(db, leagueId, input);
  const league = await db.league.findUnique({
    where: { id: leagueId },
    include: { teams: { orderBy: { createdAt: "asc" } } }
  });
  if (!league) {
    throw new LeagueRuleError("Only the league owner can perform this action.", 403);
  }
  const owner = league.teams.find((candidate) => candidate.id === league.ownerTeamId && candidate.kind === "human");
  const fallbackOwner = owner ?? league.teams.find((candidate) => candidate.kind === "human");
  if (!fallbackOwner) {
    throw new LeagueRuleError("Only the league owner can perform this action.", 403);
  }
  if (league.ownerTeamId !== fallbackOwner.id) {
    await db.league.update({ where: { id: leagueId }, data: { ownerTeamId: fallbackOwner.id } });
  }
  if (fallbackOwner.id !== team.id) {
    throw new LeagueRuleError("Only the league owner can perform this action.", 403);
  }
  return team;
}

async function requireTeamClaim(db: Db, leagueId: string, input: { teamId?: string; claimCode?: string }) {
  if (!input.teamId || !input.claimCode) {
    throw new LeagueRuleError("A valid team claim is required.");
  }
  const team = await db.team.findUnique({ where: { id: input.teamId } });
  if (!team || team.leagueId !== leagueId || team.kind !== "human" || team.claimCode !== input.claimCode) {
    throw new LeagueRuleError("A valid team claim is required.");
  }
  return { ...team, cards: normalizeCards(team.cards), livery: normalizeLivery(team.livery) };
}

async function buyBotCards(db: Db, state: LeagueState, seed: string) {
  await Promise.all(
    state.teams
      .filter((team) => team.kind === "bot" && team.credits >= CARD_PRICE)
      .map((team) => {
        const cardId = randomCardId(`${seed}-${team.id}-${team.credits}-${team.cards.length}`);
        return db.team.update({
          where: { id: team.id },
          data: {
            credits: { decrement: CARD_PRICE },
            cards: appendCard(team.cards, cardId)
          }
        });
      })
  );
}

function defaultCardForTeam(team: LeagueState["teams"][number], preferred?: CardId) {
  return preferred && team.cards.includes(preferred) ? preferred : team.cards[0];
}

function randomCardId(seed: string): CardId {
  const cards = Object.keys(CARD_DEFINITIONS) as CardId[];
  return cards[createHash("sha1").update(seed).digest()[0]! % cards.length]!;
}

async function fillLeagueWithBots(db: Db, state: LeagueState) {
  const missing = Math.max(0, state.league.maxPlayers - state.teams.length);
  if (!missing) return;

  const existingNames = new Set(state.teams.map((team) => team.name.toLowerCase()));
  const botTemplates = DEMO_RACE_INPUT.participants.filter((participant) => participant.kind === "bot");
  const bots = Array.from({ length: missing }, (_, index) => {
    const participant = botTemplates[index % botTemplates.length];
    if (!participant) return null;
    const baseName = BOT_TEAM_NAMES[index % BOT_TEAM_NAMES.length] ?? participant.teamName;
    let name = baseName;
    let suffix = 2;
    while (existingNames.has(name.toLowerCase())) {
      name = `${baseName} ${suffix}`;
      suffix += 1;
    }
    existingNames.add(name.toLowerCase());
    return { ...participant, teamName: name };
  }).filter((participant): participant is (typeof botTemplates)[number] => Boolean(participant));
  if (!bots.length) return;

  const usedLiveries = new Set(state.teams.map((team) => liveryKey(team.livery)));
  try {
    await db.team.createMany({
      data: bots.map((participant, index) => ({
        leagueId: state.league.id,
        name: participant.teamName,
        kind: "bot",
        claimCode: null,
        points: 0,
        credits: 0,
        cards: [],
        livery: uniqueBotLivery(index, usedLiveries)
      }))
    });
  } catch (error) {
    // Concurrent fill: the first writer already created the bots, keep its result.
    if (!isUniqueConstraintError(error)) throw error;
  }
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
