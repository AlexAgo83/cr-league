import { PIT_STRATEGIES, RACE_APPROACHES, TECHNICAL_PREPARATIONS } from "@cr-league/shared";
import { LeagueRuleError } from "./errors.js";
import { getCurrentGrandPrix, lockGrandPrixRow, lockTeamRow, runWrite } from "./persistence.js";
import { qualifyingCardForTeam } from "./qualifying.js";
import { fillLeagueWithBots } from "./botLifecycle.js";
import { ensureBotQualifyingRuns } from "./lifecycle.js";
import { getLeagueState } from "./leagueState.js";
import { requireTeamClaim } from "./transactionHelpers.js";
import type { Db, LeagueState, SubmitDecisionInput } from "./types.js";
import { isCardId, normalizeCards, normalizeQualifyingRuns } from "./utils.js";

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

  await runWrite(db, async (tx) => {
    await lockTeamRow(tx, team.id);
    await lockGrandPrixRow(tx, grandPrix.id);
    const freshGrandPrix = await getCurrentGrandPrix(tx, leagueId);
    if (!freshGrandPrix || freshGrandPrix.id !== grandPrix.id || freshGrandPrix.status === "resolved") {
      throw new LeagueRuleError("This Grand Prix is already resolved.");
    }
    const freshTeam = await tx.team.findUnique({ where: { id: team.id } });
    const lockedCardId = qualifyingCardForTeam(normalizeQualifyingRuns(freshGrandPrix.qualifyingRuns), team.id);
    if (lockedCardId && input.cardId && input.cardId !== lockedCardId) {
      throw new LeagueRuleError("This Grand Prix card is already locked by your qualifying run.");
    }
    const cardId = lockedCardId ?? input.cardId;
    if (cardId && (!freshTeam || freshTeam.leagueId !== leagueId || !normalizeCards(freshTeam.cards).includes(cardId))) {
      throw new LeagueRuleError("This card is not in your inventory.");
    }
    await tx.raceDecision.upsert({
      where: {
        grandPrixId_teamId: {
          grandPrixId: freshGrandPrix.id,
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
        grandPrixId: freshGrandPrix.id,
        teamId: input.teamId,
        approach: input.approach,
        preparation: input.preparation,
        pitStrategy: input.pitStrategy ?? "standard",
        cardId,
        rivalTeamId: input.rivalTeamId
      }
    });
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

export function validateDecisionValues(state: LeagueState, input: SubmitDecisionInput) {
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
  if (input.rivalTeamId === input.teamId) {
    throw new LeagueRuleError("A rival must be another team.", 400);
  }
}
