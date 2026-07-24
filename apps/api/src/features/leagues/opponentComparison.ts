import { LeagueRuleError } from "./errors.js";
import { canRevealOpponentDecisions, getLeagueState, normalizePitStrategy, revealedDecisions } from "./lifecycle.js";
import { requireTeamClaim } from "./transactionHelpers.js";
import type { Db, OpponentConfigComparison } from "./types.js";

export async function getOpponentConfigComparison(db: Db, leagueId: string, input: { teamId?: string; claimCode?: string }): Promise<OpponentConfigComparison | null> {
  const team = await requireTeamClaim(db, leagueId, input);
  const state = await getLeagueState(db, leagueId);
  if (!state) return null;
  if (!canRevealOpponentDecisions(state, team.id)) {
    throw new LeagueRuleError("Submit your race directive before viewing opponent configurations.");
  }
  const decisions = revealedDecisions(state);
  const resultByTeam = new Map(state.currentGrandPrix.result && typeof state.currentGrandPrix.result === "object" && "classification" in state.currentGrandPrix.result
    ? (state.currentGrandPrix.result.classification as Array<{ teamId: string; position: number; points: number; credits: number }>).map((entry) => [entry.teamId, entry])
    : []
  );
  const teamName = new Map(state.teams.map((entry) => [entry.id, entry.name]));
  return {
    grandPrixId: state.currentGrandPrix.id,
    teams: decisions
      .filter((decision) => decision.teamId !== team.id)
      .map((decision) => {
        const result = resultByTeam.get(decision.teamId);
        return {
          teamId: decision.teamId,
          teamName: teamName.get(decision.teamId) ?? decision.teamId,
          approach: decision.approach,
          preparation: decision.preparation,
          pitStrategy: normalizePitStrategy(decision.pitStrategy),
          cardId: decision.cardId,
          result: result ? { position: result.position, points: result.points, credits: result.credits } : null
        };
      })
      .sort((left, right) => (left.result?.position ?? 999) - (right.result?.position ?? 999) || left.teamName.localeCompare(right.teamName))
  };
}
