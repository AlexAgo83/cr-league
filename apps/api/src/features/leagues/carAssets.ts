import { CAR_ASSET_PRICES, isCarAssetId } from "@cr-league/shared";
import { LeagueRuleError } from "./errors.js";
import { lockTeamRow, runWrite } from "./persistence.js";
import { getLeagueState } from "./lifecycle.js";
import { requireTeamClaim } from "./transactionHelpers.js";
import type { BuyCarAssetInput, Db } from "./types.js";
import { normalizeLivery, normalizeUnlockedCarAssetIds } from "./utils.js";

export async function buyCarAsset(db: Db, leagueId: string, input: BuyCarAssetInput = {}) {
  const carAssetId = input.carAssetId;
  if (typeof carAssetId !== "string" || !isCarAssetId(carAssetId) || CAR_ASSET_PRICES[carAssetId] <= 0) {
    throw new LeagueRuleError("Expected a valid paid car.");
  }

  const state = await getLeagueState(db, leagueId);
  if (!state) return null;

  const team = await requireTeamClaim(db, leagueId, input);
  const price = CAR_ASSET_PRICES[carAssetId];
  if (team.credits < price) throw new LeagueRuleError("Not enough credits to buy this car.");

  await runWrite(db, async (tx) => {
    await lockTeamRow(tx, team.id);
    const freshTeam = await tx.team.findUnique({ where: { id: team.id } });
    const unlocked = normalizeUnlockedCarAssetIds(freshTeam?.unlockedCarAssetIds);
    if (!freshTeam || freshTeam.leagueId !== leagueId) throw new LeagueRuleError("Team not found in this league.");
    if (unlocked.includes(carAssetId)) throw new LeagueRuleError("This car is already unlocked.");
    if (freshTeam.credits < price) throw new LeagueRuleError("Not enough credits to buy this car.");

    const updated = await tx.team.updateMany({
      where: { id: freshTeam.id, credits: { gte: price } },
      data: {
        credits: { decrement: price },
        unlockedCarAssetIds: [...unlocked, carAssetId],
        livery: { ...normalizeLivery(freshTeam.livery), carAssetId }
      }
    });
    if (updated.count !== 1) throw new LeagueRuleError("Not enough credits to buy this car.");
  });

  return getLeagueState(db, leagueId);
}
