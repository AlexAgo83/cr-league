import { CARD_PRICES, circuitIdentityForRound, circuitSeasonSeed, type RaceDecision, type RaceInput, type RaceResult } from "@cr-league/shared";
import { CARD_SHOP } from "./constants.js";
import { normalizePitStrategy } from "./botLifecycle.js";
import type { Db, LeagueState } from "./types.js";
import { normalizeCards, normalizeLivery, normalizeQualifyingRuns, normalizeSeasonSummaries, normalizeUnlockedCarAssetIds } from "./utils.js";
import { buildActionState } from "./visibility.js";

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
      variableShop: league.variableShop,
      preparationDeadlineAt: league.preparationDeadlineAt?.toISOString() ?? null,
      reminderSentAt: league.reminderSentAt?.toISOString() ?? null,
      reminderSentBy: league.reminderSentBy,
      reminderSeasonNumber: league.reminderSeasonNumber,
      reminderSentCount: league.reminderSentCount,
      reminderSkippedCount: league.reminderSkippedCount
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
    cardShop: league.variableShop
      ? normalizeCards(grandPrix.shopCardIds).map((cardId) => ({ cardId, price: CARD_PRICES[cardId] }))
      : CARD_SHOP,
    actionState: buildActionState(
      league.teams.map((team) => ({ id: team.id, kind: team.kind })),
      grandPrix.status,
      grandPrix.decisions.map((decision) => decision.teamId)
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
