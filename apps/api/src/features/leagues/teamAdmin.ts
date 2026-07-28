import { updateTeamLivery as applyUpdateTeamLivery, updateTeamName as applyUpdateTeamName } from "@cr-league/shared";
import { LEAGUE_NAME_LIMIT } from "./constants.js";
import { LeagueRuleError } from "./errors.js";
import { getLeagueState } from "./leagueState.js";
import { teamFromSharedState, toLeagueRuleError } from "./sharedRules.js";
import { requireAdminClaim, requireTeamClaim } from "./transactionHelpers.js";
import type { Db, UpdateLeagueSettingsInput, UpdateTeamLiveryInput, UpdateTeamNameInput } from "./types.js";
import { isLeagueCadence, normalizeDisplayName } from "./utils.js";

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
  const state = await getLeagueState(db, leagueId);
  if (!state) return null;
  const team = await requireTeamClaim(db, leagueId, input);
  const nextState = applyShared(() => applyUpdateTeamLivery(state, { teamId: team.id, livery: input.livery }));
  const nextTeam = teamFromSharedState(nextState, team.id);

  await db.team.update({
    where: { id: team.id },
    data: { livery: nextTeam.livery }
  });

  return getLeagueState(db, leagueId);
}

export async function updateTeamName(db: Db, leagueId: string, input: UpdateTeamNameInput = {}) {
  const state = await getLeagueState(db, leagueId);
  if (!state) return null;
  const team = await requireTeamClaim(db, leagueId, input);
  const nextState = applyShared(() => applyUpdateTeamName(state, { teamId: team.id, name: input.name }));
  const nextTeam = teamFromSharedState(nextState, team.id);

  await db.team.update({
    where: { id: team.id },
    data: { name: nextTeam.name }
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
