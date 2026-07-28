import { resolveGrandPrix as applyResolveGrandPrix } from "@cr-league/shared";
import { LeagueRuleError } from "./errors.js";
import { getCurrentGrandPrix, lockGrandPrixRow, lockTeamRow, runWrite } from "./persistence.js";
import { fillLeagueWithBots } from "./botLifecycle.js";
import { ensureBotQualifyingRuns } from "./lifecycle.js";
import { getLeagueState } from "./leagueState.js";
import { teamFromSharedState, toLeagueRuleError } from "./sharedRules.js";
import { requireAdminClaim } from "./transactionHelpers.js";
import type { Db, LeagueState, ResolveGrandPrixInput } from "./types.js";

export async function resolveCurrentGrandPrix(db: Db, leagueId: string, input: ResolveGrandPrixInput = {}) {
  await requireAdminClaim(db, leagueId, input);
  const state = await getLeagueState(db, leagueId);
  const grandPrix = await getCurrentGrandPrix(db, leagueId);
  if (!state || !grandPrix) return null;
  if (grandPrix.status === "resolved") {
    throw new LeagueRuleError("This Grand Prix is already resolved.");
  }
  if (missingHumanTeamIds(state).length && !input.allowDefaults) {
    throw new LeagueRuleError("Some drivers still need to submit their race directive.");
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
    for (const team of [...raceState.teams].sort((left, right) => left.id.localeCompare(right.id))) {
      await lockTeamRow(tx, team.id);
    }
    await lockGrandPrixRow(tx, grandPrix.id);
    const freshState = await getLeagueState(tx, leagueId);
    const freshGrandPrix = await getCurrentGrandPrix(tx, leagueId);
    if (!freshState || !freshGrandPrix || freshGrandPrix.id !== grandPrix.id) return;
    if (freshState.teams.length < 2) {
      throw new LeagueRuleError("At least two teams are required to launch the Grand Prix.");
    }
    const nextState = applyShared(() => applyResolveGrandPrix(freshState, { allowDefaults: input.allowDefaults, seed: freshGrandPrix.seed }));
    if (!nextState.currentGrandPrix.result) throw new LeagueRuleError("This Grand Prix could not be resolved.");
    const claimed = await tx.grandPrix.updateMany({
      where: { id: grandPrix.id, status: "briefing" },
      data: {
        status: "resolved",
        result: nextState.currentGrandPrix.result
      }
    });
    if (claimed.count !== 1) throw new LeagueRuleError("This Grand Prix is already resolved.");

    for (const nextTeam of nextState.teams) {
      const previousTeam = teamFromSharedState(freshState, nextTeam.id);
      const data: {
        points: { increment: number };
        credits: { increment: number };
        cards?: typeof nextTeam.cards;
      } = {
        points: { increment: nextTeam.points - previousTeam.points },
        credits: { increment: nextTeam.credits - previousTeam.credits }
      };
      if (!sameCards(previousTeam.cards, nextTeam.cards)) data.cards = nextTeam.cards;
      await tx.team.update({
        where: { id: nextTeam.id },
        data
      });
    }
  });

  return getLeagueState(db, leagueId);
}

function missingHumanTeamIds(state: LeagueState) {
  const humanTeamIds = new Set(state.teams.filter((team) => team.kind === "human").map((team) => team.id));
  const submittedTeamIds = new Set(state.decisions.map((decision) => decision.teamId));
  return [...humanTeamIds].filter((teamId) => !submittedTeamIds.has(teamId));
}

function sameCards(left: readonly string[], right: readonly string[]) {
  return left.length === right.length && left.every((cardId, index) => cardId === right[index]);
}

function applyShared<T>(fn: () => T) {
  try {
    return fn();
  } catch (error) {
    return toLeagueRuleError(error);
  }
}
