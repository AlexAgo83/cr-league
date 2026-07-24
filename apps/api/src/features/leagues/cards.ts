import { CARD_PRICES } from "@cr-league/shared";
import { LeagueRuleError } from "./errors.js";
import { getCurrentGrandPrix, lockTeamRow, runWrite } from "./persistence.js";
import { qualifyingCardForTeam } from "./qualifying.js";
import { getLeagueState } from "./lifecycle.js";
import { requireTeamClaim } from "./transactionHelpers.js";
import type { Db } from "./types.js";
import { clampInteger, isCardId, normalizeCards, normalizeQualifyingRuns, removeOneCard } from "./utils.js";

export async function buyCard(db: Db, leagueId: string, input: { teamId?: string; claimCode?: string; cardId?: string; quantity?: number } = {}) {
  const cardId = input.cardId;
  if (typeof cardId !== "string" || !isCardId(cardId)) {
    throw new LeagueRuleError("Expected a team and a valid card.");
  }
  const quantity = clampInteger(input.quantity, 1, 1, 99);

  const state = await getLeagueState(db, leagueId);
  if (!state) return null;

  const team = await requireTeamClaim(db, leagueId, input);
  const price = CARD_PRICES[cardId];
  const totalPrice = price * quantity;
  if (team.credits < totalPrice) {
    throw new LeagueRuleError("Not enough credits to buy this card.");
  }

  await runWrite(db, async (tx) => {
    await lockTeamRow(tx, team.id);
    const freshTeam = await tx.team.findUnique({ where: { id: team.id } });
    if (!freshTeam || freshTeam.leagueId !== leagueId || freshTeam.credits < totalPrice) {
      throw new LeagueRuleError("Not enough credits to buy this card.");
    }
    const updated = await tx.team.updateMany({
      where: { id: freshTeam.id, credits: { gte: totalPrice } },
      data: {
        credits: { decrement: totalPrice },
        cards: [...normalizeCards(freshTeam.cards), ...Array.from({ length: quantity }, () => cardId)]
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

  await runWrite(db, async (tx) => {
    await lockTeamRow(tx, team.id);
    const freshGrandPrix = await getCurrentGrandPrix(tx, leagueId);
    const freshDecisions = freshGrandPrix ? await tx.raceDecision.findMany({ where: { grandPrixId: freshGrandPrix.id, teamId: team.id } }) : [];
    if (freshDecisions.some((decision) => decision.cardId === cardId)) {
      throw new LeagueRuleError("This card is already used in your current plan.");
    }
    if (qualifyingCardForTeam(normalizeQualifyingRuns(freshGrandPrix?.qualifyingRuns), team.id) === cardId) {
      throw new LeagueRuleError("This card is already locked by your qualifying run.");
    }
    const freshTeam = await tx.team.findUnique({ where: { id: team.id } });
    const cards = freshTeam && freshTeam.leagueId === leagueId ? normalizeCards(freshTeam.cards) : [];
    if (!freshTeam || !cards.includes(cardId)) {
      throw new LeagueRuleError("This card is not in your inventory.");
    }
    await tx.team.update({
      where: { id: freshTeam.id },
      data: {
        credits: { increment: CARD_PRICES[cardId] / 2 },
        cards: removeOneCard(cards, cardId)
      }
    });
  });

  return getLeagueState(db, leagueId);
}
