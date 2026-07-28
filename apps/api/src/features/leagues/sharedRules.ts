import { SharedLeagueRuleError, type LeagueState } from "@cr-league/shared";
import { LeagueRuleError } from "./errors.js";

export function toLeagueRuleError(error: unknown): never {
  if (error instanceof SharedLeagueRuleError) {
    throw new LeagueRuleError(error.message);
  }
  throw error;
}

export function teamFromSharedState(state: LeagueState, teamId: string) {
  const team = state.teams.find((candidate) => candidate.id === teamId);
  if (!team) throw new LeagueRuleError("Team not found in this league.");
  return team;
}
