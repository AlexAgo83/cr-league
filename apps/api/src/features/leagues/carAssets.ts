import { buyCarAsset as applyBuyCarAsset } from "@cr-league/shared";
import { LeagueRuleError } from "./errors.js";
import { lockTeamRow, runWrite } from "./persistence.js";
import { getLeagueState } from "./leagueState.js";
import { teamFromSharedState, toLeagueRuleError } from "./sharedRules.js";
import { requireTeamClaim } from "./transactionHelpers.js";
import type { BuyCarAssetInput, Db } from "./types.js";

export async function buyCarAsset(db: Db, leagueId: string, input: BuyCarAssetInput = {}) {
  const state = await getLeagueState(db, leagueId);
  if (!state) return null;

  const team = await requireTeamClaim(db, leagueId, input);

  await runWrite(db, async (tx) => {
    await lockTeamRow(tx, team.id);
    const freshState = await getLeagueState(tx, leagueId);
    if (!freshState) throw new LeagueRuleError("Team not found in this league.");
    const nextState = applyShared(() => applyBuyCarAsset(freshState, { teamId: team.id, carAssetId: input.carAssetId }));
    const freshTeam = teamFromSharedState(freshState, team.id);
    const nextTeam = teamFromSharedState(nextState, team.id);
    const price = freshTeam.credits - nextTeam.credits;

    const updated = await tx.team.updateMany({
      where: { id: team.id, credits: { gte: price } },
      data: {
        credits: { decrement: price },
        unlockedCarAssetIds: nextTeam.unlockedCarAssetIds,
        livery: nextTeam.livery
      }
    });
    if (updated.count !== 1) throw new LeagueRuleError("Not enough credits to buy this car.");
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
