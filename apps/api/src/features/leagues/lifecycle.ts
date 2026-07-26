import {
  CARD_DEFINITIONS,
  CARD_PRICES,
  CAR_ASSET_PRICES,
  DEMO_RACE_INPUT,
  PIT_STRATEGIES,
  circuitIdentityForRound,
  circuitSeasonSeed,
  raceInputFromCircuit,
  isCarAssetId,
  trackSpeedProfileForCircuit,
  type CardId,
  type CarAssetId,
  type LeagueState as SharedLeagueState,
  type RaceDecision,
  type RaceInput,
  type RaceResult
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
import { getCurrentGrandPrix, isUniqueConstraintError, lockGrandPrixRow, lockLeagueRow, lockTeamRow, retryUnique, runWrite } from "./persistence.js";
import { createQualifyingRuns } from "./qualifying.js";
import { requireAdminClaim, requireTeamClaim } from "./transactionHelpers.js";
import type { AdminProofInput, CreateLeagueInput, Db, JoinLeagueInput, LeagueState, RejoinLeagueInput, UpdateLeagueSettingsInput, UpdateTeamLiveryInput, UpdateTeamNameInput } from "./types.js";
import { appendCard, clampInteger, createClaimCode, createLeagueCode, ensureProfileOwnership, isLeagueCadence, liveryKey, normalizeCards, normalizeDisplayName, normalizeLivery, normalizeQualifyingRuns, normalizeSeasonSummaries, normalizeUnlockedCarAssetIds, randomLivery, uniqueBotLivery } from "./utils.js";

export async function createDemoLeague(db: Db, input: CreateLeagueInput = {}) {
  const leagueName = normalizeDisplayName(input.name, LEAGUE_NAME_LIMIT);
  const playerTeamName = normalizeDisplayName(input.teamName, TEAM_NAME_LIMIT);
  if (input.name !== undefined && !leagueName) {
    throw new LeagueRuleError("League name must be 3 to 40 readable characters.");
  }
  if (input.teamName !== undefined && !playerTeamName) {
    throw new LeagueRuleError("Team name must be 3 to 32 readable characters.");
  }
  await ensureProfileOwnership(db, input.profileId, input.recoveryCode);
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

  const createdState = await getLeagueState(db, league.id, { includeInviteCode: true });
  if (createdState?.league.fillWithBots) await fillLeagueWithBots(db, createdState);
  const state = createdState?.league.fillWithBots ? await getLeagueState(db, league.id, { includeInviteCode: true }) : createdState;
  const playerTeam = state?.teams.find((team) => team.kind === "human");
  return state && playerTeam ? withPlayer(state, playerTeam.id, playerClaimCode) : state;
}

export async function joinLeagueByCode(db: Db, input: JoinLeagueInput = {}) {
  const code = input.code?.trim().toUpperCase();
  const teamName = normalizeDisplayName(input.teamName, TEAM_NAME_LIMIT);
  if (!code || !teamName) {
    throw new LeagueRuleError("League code and team name are required.");
  }
  await ensureProfileOwnership(db, input.profileId, input.recoveryCode);

  const league = await db.league.findUnique({ where: { code } });
  if (!league) return null;

  const team = await retryUnique(() =>
    runWrite(db, async (tx) => {
      await lockLeagueRow(tx, league.id);
      const state = await getLeagueState(tx, league.id);
      if (!state) throw new LeagueRuleError("League not found.");
      if (state.currentGrandPrix.status === "resolved") {
        throw new LeagueRuleError("This league is not accepting new teams after the Grand Prix is resolved.");
      }
      if (state.teams.length >= state.league.maxPlayers) {
        throw new LeagueRuleError("This league is full.");
      }
      if (state.teams.some((team) => team.name.toLowerCase() === teamName.toLowerCase())) {
        throw new LeagueRuleError("This team name is already taken.");
      }

      return tx.team.create({
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
      });
    })
  );

  const nextState = await getLeagueState(db, league.id, { includeInviteCode: true });
  return nextState ? withPlayer(nextState, team.id, team.claimCode ?? "") : nextState;
}

export async function rejoinLeague(db: Db, input: RejoinLeagueInput = {}) {
  const team = await db.team.findUnique({
    where: { id: input.teamId },
    include: { league: true }
  });
  // ponytail: plain !== is fine — claim codes are 40-bit random, network timing attack is impractical; use timingSafeEqual only if codes ever get shorter/predictable.
  if (!team || team.claimCode !== input.claimCode) return null;

  const state = await getLeagueState(db, team.leagueId, { includeInviteCode: true });
  return state ? withPlayer(state, team.id, team.claimCode) : null;
}

export async function getLeagueState(db: Db, leagueId: string, options: { includeInviteCode?: boolean } = {}): Promise<LeagueState | null> {
  // ponytail: fetch only the current GP with its decisions; past GPs pulled decisions + result/
  // qualifying/forecast JSON blobs for nothing (history only needs id/name/season/round/status/result),
  // a cost that grew unbounded with seasons.
  const league = await db.league.findUnique({
    where: { id: leagueId },
    include: {
      teams: { orderBy: [{ points: "desc" }, { name: "asc" }] },
      grandPrixes: {
        orderBy: [{ season: "desc" }, { round: "desc" }],
        take: 1,
        include: {
          decisions: true
        }
      }
    }
  });

  if (!league || !league.grandPrixes[0]) return null;

  const grandPrix = league.grandPrixes[0];
  const grandPrixHistory = await db.grandPrix.findMany({
    where: { leagueId },
    orderBy: [{ season: "desc" }, { round: "desc" }],
    select: { id: true, name: true, season: true, round: true, status: true, result: true }
  });
  const currentCircuit = circuitIdentityForRound(grandPrix.round, circuitSeasonSeed(league.id, grandPrix.season));
  return {
    league: {
      id: league.id,
      name: league.name,
      code: options.includeInviteCode ? league.code : null,
      status: league.status,
      cadence: league.cadence,
      maxPlayers: league.maxPlayers,
      fillWithBots: league.fillWithBots,
      qualifyingAttemptLimit: league.qualifyingAttemptLimit,
      maxGrandPrixPerSeason: league.maxGrandPrixPerSeason,
      preparationDeadlineAt: league.preparationDeadlineAt?.toISOString() ?? null
    },
    seasonSummaries: normalizeSeasonSummaries(league.seasonSummaries),
    currentGrandPrix: {
      id: grandPrix.id,
      name: grandPrix.name,
      season: grandPrix.season,
      round: grandPrix.round,
      status: grandPrix.status,
      primaryTrait: grandPrix.primaryTrait as RaceInput["primaryTrait"],
      secondaryTrait: grandPrix.secondaryTrait as RaceInput["secondaryTrait"],
      trackLengthMeters: currentCircuit.trackLengthMeters,
      forecast: grandPrix.forecast as RaceInput["forecast"],
      qualifyingRuns: normalizeQualifyingRuns(grandPrix.qualifyingRuns),
      result: grandPrix.result as RaceResult | null
    },
    grandPrixHistory: grandPrixHistory.map((entry) => ({
      id: entry.id,
      name: entry.name,
      season: entry.season,
      round: entry.round,
      status: entry.status,
      result: entry.result as RaceResult | null
    })),
    teams: league.teams.map((team) => ({
      id: team.id,
      name: team.name,
      kind: team.kind,
      points: team.points,
      credits: team.credits,
      cards: normalizeCards(team.cards),
      livery: normalizeLivery(team.livery),
      unlockedCarAssetIds: normalizeUnlockedCarAssetIds(team.unlockedCarAssetIds),
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
      approach: decision.approach as RaceDecision["approach"],
      preparation: decision.preparation as RaceDecision["preparation"],
      pitStrategy: normalizePitStrategy(decision.pitStrategy),
      cardId: decision.cardId as RaceDecision["cardId"] | null,
      rivalTeamId: decision.rivalTeamId
    }))
  };
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
  const selectedCarAssetId = livery.carAssetId;
  if (
    selectedCarAssetId &&
    isCarAssetId(selectedCarAssetId) &&
    CAR_ASSET_PRICES[selectedCarAssetId] > 0 &&
    !normalizeUnlockedCarAssetIds(team.unlockedCarAssetIds).includes(selectedCarAssetId)
  ) {
    throw new LeagueRuleError("This car is locked.");
  }

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
  const closingSeasonSummary = nextSeason !== grandPrix.season ? seasonSummaryFromState(state, grandPrix.season) : null;

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
    if (closingSeasonSummary) {
      await tx.league.update({
        where: { id: leagueId },
        data: {
          seasonSummaries: upsertSeasonSummary(state.seasonSummaries, closingSeasonSummary)
        }
      });
    }
    const freshState = await getLeagueState(tx, leagueId);
    if (!freshState) return;
    await buyBotCars(tx, freshState, `${leagueId}-s${nextSeason}-r${nextRound}`);
    await buyBotCards(tx, freshState, `${leagueId}-s${nextSeason}-r${nextRound}`);
    if (nextSeason !== grandPrix.season) {
      for (const team of freshState.teams) {
        await lockTeamRow(tx, team.id);
        const freshTeam = await tx.team.findUnique({ where: { id: team.id } });
        if (!freshTeam || freshTeam.leagueId !== leagueId) continue;
        const data: { points: number; livery?: { primary: string; secondary: string; carAssetId?: CarAssetId } } = { points: 0 };
        if (freshTeam.kind === "bot") {
          const livery = normalizeLivery(freshTeam.livery);
          data.livery = {
            ...livery,
            carAssetId: randomCarAssetId(
              `${leagueId}-s${nextSeason}-r${nextRound}-${freshTeam.id}-season-car`,
              availableCarAssetIds(normalizeUnlockedCarAssetIds(freshTeam.unlockedCarAssetIds)),
              livery.carAssetId && isCarAssetId(livery.carAssetId) ? livery.carAssetId : undefined
            )
          };
        }
        await tx.team.update({ where: { id: team.id }, data });
      }
    }
  });

  return getLeagueState(db, leagueId);
}

function seasonSummaryFromState(state: LeagueState, season: number): SharedLeagueState["seasonSummaries"][number] | null {
  const gpCount = state.grandPrixHistory.filter((grandPrix) => grandPrix.season === season && grandPrix.result).length;
  const standings = [...state.teams]
    .sort((left, right) => right.points - left.points || left.name.localeCompare(right.name))
    .map((team, index) => ({
      position: index + 1,
      teamId: team.id,
      teamName: team.name,
      points: team.points,
      livery: team.livery
    }));
  const champion = standings[0];
  return champion ? { season, gpCount, standings, champion } : null;
}

function upsertSeasonSummary(existing: LeagueState["seasonSummaries"], summary: NonNullable<ReturnType<typeof seasonSummaryFromState>>) {
  return [summary, ...existing.filter((candidate) => candidate.season !== summary.season)].sort((left, right) => right.season - left.season);
}

export async function restartLeague(db: Db, leagueId: string, input: AdminProofInput = {}) {
  await requireAdminClaim(db, leagueId, input);
  const state = await getLeagueState(db, leagueId);
  if (!state) return null;

  await runWrite(db, async (tx) => {
    await tx.raceDecision.deleteMany({
      where: {
        grandPrix: {
          leagueId
        }
      }
    });
    await tx.grandPrix.deleteMany({ where: { leagueId } });
    await tx.league.update({
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
      await tx.team.update({
        where: { id: team.id },
        data: {
          points: 0,
          credits: team.kind === "human" ? STARTING_CREDITS : 0,
          cards: team.kind === "human" ? STARTER_CARDS : [],
          livery
        }
      });
    }

    await tx.grandPrix.create({
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
  });

  return getLeagueState(db, leagueId);
}

export async function ensureBotQualifyingRuns(db: Db, grandPrix: Awaited<ReturnType<typeof getCurrentGrandPrix>>, state: LeagueState) {
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
    const circuit = circuitIdentityForRound(freshGrandPrix.round, circuitSeasonSeed(state.league.id, freshGrandPrix.season));
    for (const team of missingBots) {
      const demo = DEMO_RACE_INPUT.participants[state.teams.indexOf(team) % DEMO_RACE_INPUT.participants.length];
      nextRuns.push(
        createQualifyingRuns({
          seed: `${freshGrandPrix.seed}-${team.id}-bot-qualifying`,
          teamId: team.id,
          teamName: team.name,
          decision: defaultBotDecision(state, team, demo?.decision),
          primaryTrait: freshGrandPrix.primaryTrait as RaceInput["primaryTrait"],
          secondaryTrait: freshGrandPrix.secondaryTrait as RaceInput["secondaryTrait"],
          traits: circuit.traits,
          trackLengthMeters: circuit.trackLengthMeters,
          speedProfile: trackSpeedProfileForCircuit(circuit),
          forecast: freshGrandPrix.forecast as RaceInput["forecast"],
          laps: 1
        })[0]!
      );
    }

    await tx.grandPrix.update({ where: { id: freshGrandPrix.id }, data: { qualifyingRuns: nextRuns } });
  });
}

export function defaultBotDecision(state: LeagueState, team: LeagueState["teams"][number], fallback?: RaceDecision): RaceDecision {
  const submittedDecision = state.decisions.find((candidate) => candidate.teamId === team.id);
  if (submittedDecision) {
    return {
      approach: submittedDecision.approach as RaceDecision["approach"],
      preparation: submittedDecision.preparation as RaceDecision["preparation"],
      pitStrategy: normalizePitStrategy(submittedDecision.pitStrategy),
      cardId: (submittedDecision.cardId ?? undefined) as RaceDecision["cardId"],
      rivalTeamId: submittedDecision.rivalTeamId ?? undefined
    };
  }
  return {
    approach: fallback?.approach ?? "balanced",
    preparation: fallback?.preparation ?? "speed",
    pitStrategy: botPitStrategyForCircuit(state, team, fallback),
    cardId: defaultCardForTeam(team, fallback?.cardId),
    rivalTeamId: fallback?.rivalTeamId
  };
}

function botPitStrategyForCircuit(state: LeagueState, team: LeagueState["teams"][number], fallback?: RaceDecision): NonNullable<RaceDecision["pitStrategy"]> {
  const circuit = circuitIdentityForRound(state.currentGrandPrix.round, circuitSeasonSeed(state.league.id, state.currentGrandPrix.season));
  const traits = circuit.traits;
  const wetRisk = state.currentGrandPrix.forecast.light_rain + state.currentGrandPrix.forecast.heavy_rain * 2;
  const archetype = fallback?.preparation === "weather" ? "rain" : fallback?.approach;
  const wantsAttack = traits.overtaking >= 72 || state.currentGrandPrix.primaryTrait === "fast" || state.currentGrandPrix.primaryTrait === "urban";
  const wantsEndurance = traits.energy <= 58 || circuit.trackLengthMeters >= 5600 || state.currentGrandPrix.primaryTrait === "high_wear";

  if (wetRisk >= 100) return "standard";
  if (archetype === "aggressive" && wantsAttack) return "mini_pack";
  if (archetype === "prudent" && wantsEndurance) return "heavy_pack";
  if (archetype === "rain" && wetRisk >= 70) return "standard";
  if (wantsEndurance && team.id.length % 2 === 0) return "heavy_pack";
  if (wantsAttack) return "mini_pack";
  return normalizePitStrategy(fallback?.pitStrategy);
}

export function normalizePitStrategy(value: unknown): NonNullable<RaceDecision["pitStrategy"]> {
  return PIT_STRATEGIES.includes(value as NonNullable<RaceDecision["pitStrategy"]>) ? value as NonNullable<RaceDecision["pitStrategy"]> : "standard";
}

async function buyBotCards(db: Db, state: LeagueState, seed: string) {
  for (const team of state.teams.filter((team) => team.kind === "bot")) {
    await lockTeamRow(db, team.id);
    const freshTeam = await db.team.findUnique({ where: { id: team.id } });
    const credits = freshTeam?.leagueId === state.league.id ? freshTeam.credits : 0;
    const cards = freshTeam ? normalizeCards(freshTeam.cards) : team.cards;
    const affordable = affordableCardIds(credits);
    if (!freshTeam || !affordable.length) continue;
    const cardId = randomCardId(`${seed}-${team.id}-${credits}-${cards.length}`, affordable);
    await db.team.update({
      where: { id: team.id },
      data: {
        credits: { decrement: CARD_PRICES[cardId] },
        cards: appendCard(cards, cardId)
      }
    });
  }
}

async function buyBotCars(db: Db, state: LeagueState, seed: string) {
  for (const team of state.teams.filter((team) => team.kind === "bot")) {
    await lockTeamRow(db, team.id);
    const freshTeam = await db.team.findUnique({ where: { id: team.id } });
    if (!freshTeam || freshTeam.leagueId !== state.league.id) continue;
    const unlocked = normalizeUnlockedCarAssetIds(freshTeam.unlockedCarAssetIds);
    const affordable = paidCarAssetIds(freshTeam.credits).filter((carAssetId) => !unlocked.includes(carAssetId));
    if (!affordable.length) continue;
    const carAssetId = randomCarAssetId(`${seed}-${team.id}-${freshTeam.credits}-${unlocked.length}`, affordable);
    await db.team.updateMany({
      where: { id: team.id, credits: { gte: CAR_ASSET_PRICES[carAssetId] } },
      data: {
        credits: { decrement: CAR_ASSET_PRICES[carAssetId] },
        unlockedCarAssetIds: [...unlocked, carAssetId],
        livery: { ...normalizeLivery(freshTeam.livery), carAssetId }
      }
    });
  }
}

function defaultCardForTeam(team: LeagueState["teams"][number], preferred?: CardId) {
  return preferred && team.cards.includes(preferred) ? preferred : team.cards[0];
}

function affordableCardIds(credits: number): CardId[] {
  return (Object.keys(CARD_DEFINITIONS) as CardId[]).filter((cardId) => CARD_PRICES[cardId] <= credits);
}

function randomCardId(seed: string, cards: CardId[]): CardId {
  return cards[createHash("sha1").update(seed).digest()[0]! % cards.length]!;
}

function paidCarAssetIds(credits: number): CarAssetId[] {
  return (Object.keys(CAR_ASSET_PRICES) as CarAssetId[]).filter((carAssetId) => CAR_ASSET_PRICES[carAssetId] > 0 && CAR_ASSET_PRICES[carAssetId] <= credits);
}

function availableCarAssetIds(unlocked: CarAssetId[]): CarAssetId[] {
  return (Object.keys(CAR_ASSET_PRICES) as CarAssetId[]).filter((carAssetId) => CAR_ASSET_PRICES[carAssetId] === 0 || unlocked.includes(carAssetId));
}

function randomCarAssetId(seed: string, carAssetIds: CarAssetId[], current?: CarAssetId): CarAssetId {
  const candidates = carAssetIds.length > 1 ? carAssetIds.filter((carAssetId) => carAssetId !== current) : carAssetIds;
  return candidates[createHash("sha1").update(seed).digest()[0]! % candidates.length]!;
}

export async function fillLeagueWithBots(db: Db, state: LeagueState) {
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

export function publicLeagueState(state: LeagueState): LeagueState {
  return { ...state, decisions: [] };
}

export function withPlayer(state: LeagueState, teamId: string, claimCode: string): LeagueState {
  const visibleState = canRevealOpponentDecisions(state, teamId)
    ? { ...state, decisions: revealedDecisions(state) }
    : { ...state, decisions: state.decisions.filter((decision) => decision.teamId === teamId) };
  return {
    ...visibleState,
    league: {
      ...visibleState.league,
      code: visibleState.league.code ?? ""
    },
    player: {
      teamId,
      claimCode
    }
  };
}

export function canRevealOpponentDecisions(state: LeagueState, teamId: string) {
  return state.currentGrandPrix.status === "resolved" || state.decisions.some((decision) => decision.teamId === teamId);
}

export function revealedDecisions(state: LeagueState): LeagueState["decisions"] {
  const byTeam = new Map(state.decisions.map((decision) => [decision.teamId, decision]));
  return state.teams.flatMap((team, index) => {
    const explicit = byTeam.get(team.id);
    if (explicit) return [explicit];
    if (team.kind !== "bot" && state.currentGrandPrix.status !== "resolved") return [];
    const demo = DEMO_RACE_INPUT.participants[index % DEMO_RACE_INPUT.participants.length];
    const decision = defaultBotDecision(state, team, demo?.decision);
    return [{
      teamId: team.id,
      approach: decision.approach,
      preparation: decision.preparation,
      pitStrategy: normalizePitStrategy(decision.pitStrategy),
      cardId: decision.cardId ?? null,
      rivalTeamId: decision.rivalTeamId ?? null
    }];
  });
}
