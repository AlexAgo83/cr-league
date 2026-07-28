import { buyCard as applyBuyCard, sellCard as applySellCard } from "@cr-league/shared";
import { LeagueRuleError } from "./errors.js";
import { lockTeamRow, runWrite } from "./persistence.js";
import { getLeagueState } from "./leagueState.js";
import { teamFromSharedState, toLeagueRuleError } from "./sharedRules.js";
import { requireTeamClaim } from "./transactionHelpers.js";
import type { Db } from "./types.js";

export async function buyCard(db: Db, leagueId: string, input: { teamId?: string; claimCode?: string; cardId?: string; quantity?: number } = {}) {
  const state = await getLeagueState(db, leagueId);
  if (!state) return null;

  const team = await requireTeamClaim(db, leagueId, input);

  await runWrite(db, async (tx) => {
    await lockTeamRow(tx, team.id);
    const freshState = await getLeagueState(tx, leagueId);
    if (!freshState) throw new LeagueRuleError("Team not found in this league.");
    const nextState = applyShared(() => applyBuyCard(freshState, { teamId: team.id, cardId: input.cardId, quantity: input.quantity }));
    const nextTeam = teamFromSharedState(nextState, team.id);
    const totalPrice = teamFromSharedState(freshState, team.id).credits - nextTeam.credits;
    const updated = await tx.team.updateMany({
      where: { id: team.id, credits: { gte: totalPrice } },
      data: {
        credits: { decrement: totalPrice },
        cards: nextTeam.cards
      }
    });
    if (updated.count !== 1) throw new LeagueRuleError("Not enough credits to buy this card.");
  });

  return getLeagueState(db, leagueId);
}
export async function sellCard(db: Db, leagueId: string, input: { teamId?: string; claimCode?: string; cardId?: string } = {}) {
  const state = await getLeagueState(db, leagueId);
  if (!state) return null;

  const team = await requireTeamClaim(db, leagueId, input);

  await runWrite(db, async (tx) => {
    await lockTeamRow(tx, team.id);
    const freshState = await getLeagueState(tx, leagueId);
    if (!freshState) throw new LeagueRuleError("Team not found in this league.");
    const nextState = applyShared(() => applySellCard(freshState, { teamId: team.id, cardId: input.cardId }));
    const nextTeam = teamFromSharedState(nextState, team.id);
    await tx.team.update({
      where: { id: team.id },
      data: {
        credits: nextTeam.credits,
        cards: nextTeam.cards
      }
    });
  });

  return getLeagueState(db, leagueId);
}

function applyShared<T>(fn: () => T) {
  try {
    return fn();
  } catch (error) {
    return toLeagueRuleError(error);
  }
}
