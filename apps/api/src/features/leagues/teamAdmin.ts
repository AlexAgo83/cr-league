import { CAR_ASSET_PRICES, isCarAssetId } from "@cr-league/shared";
import { LEAGUE_NAME_LIMIT, TEAM_NAME_LIMIT } from "./constants.js";
import { LeagueRuleError } from "./errors.js";
import { getLeagueState } from "./leagueState.js";
import { requireAdminClaim, requireTeamClaim } from "./transactionHelpers.js";
import type { Db, UpdateLeagueSettingsInput, UpdateTeamLiveryInput, UpdateTeamNameInput } from "./types.js";
import { isLeagueCadence, normalizeDisplayName, normalizeLivery, normalizeUnlockedCarAssetIds } from "./utils.js";

export async function updateLeagueSettings(db: Db, leagueId: string, input: UpdateLeagueSettingsInput = {}) {
  await requireAdminClaim(db, leagueId, input);
  const data: { name?: string; cadence?: string; preparationDeadlineAt?: Date | null } = {};

  if (input.name !== undefined) {
    const name = normalizeDisplayName(input.name, LEAGUE_NAME_LIMIT);
    if (!name) {
      throw new LeagueRuleError("League name must be 3 to 40 readable characters.");
    }
    data.name = name;
  }

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
