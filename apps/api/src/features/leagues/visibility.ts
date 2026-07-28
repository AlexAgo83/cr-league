import { DEMO_RACE_INPUT } from "@cr-league/shared";
import { defaultBotDecision, normalizePitStrategy } from "./botLifecycle.js";
import type { LeagueState } from "./types.js";

export function buildActionState(teams: Array<{ id: string; kind: string }>, grandPrixStatus: string, submittedTeamIds: string[]) {
  const submitted = new Set(submittedTeamIds);
  const humanTeamIds = teams.filter((team) => team.kind === "human").map((team) => team.id);
  const missingTeamIds = grandPrixStatus === "resolved" ? [] : humanTeamIds.filter((teamId) => !submitted.has(teamId));
  const canStartNextGrandPrix = grandPrixStatus === "resolved";
  const canResolve = grandPrixStatus !== "resolved" && humanTeamIds.length > 0 && missingTeamIds.length === 0;
  const canResolveWithDefaults = grandPrixStatus !== "resolved" && missingTeamIds.length > 0;

  return {
    submittedTeamIds,
    missingTeamIds,
    canResolve,
    canResolveWithDefaults,
    canStartNextGrandPrix,
    nextAction: canStartNextGrandPrix ? "start_next_grand_prix" : canResolve ? "resolve_grand_prix" : canResolveWithDefaults ? "resolve_with_defaults" : "wait_for_directives"
  };
}

export function publicLeagueState(state: LeagueState): LeagueState {
  return { ...state, decisions: [] };
}

export function withPlayer(state: LeagueState, teamId: string, claimCode: string): LeagueState {
  const visibleState = canRevealOpponentDecisions(state, teamId)
    ? { ...state, decisions: revealedDecisions(state) }
    : { ...state, decisions: state.decisions.filter((decision) => decision.teamId === teamId) };
  return {
    ...visibleState,
    league: {
      ...visibleState.league,
      code: visibleState.league.code ?? ""
    },
    player: {
      teamId,
      claimCode
    }
  };
}

export function canRevealOpponentDecisions(state: LeagueState, teamId: string) {
  return state.currentGrandPrix.status === "resolved" || state.decisions.some((decision) => decision.teamId === teamId);
}

export function revealedDecisions(state: LeagueState): LeagueState["decisions"] {
  const byTeam = new Map(state.decisions.map((decision) => [decision.teamId, decision]));
  return state.teams.flatMap((team, index) => {
    const explicit = byTeam.get(team.id);
    if (explicit) return [explicit];
    if (team.kind !== "bot" && state.currentGrandPrix.status !== "resolved") return [];
    const demo = DEMO_RACE_INPUT.participants[index % DEMO_RACE_INPUT.participants.length];
    const decision = defaultBotDecision(state, team, demo?.decision);
    return [{
      teamId: team.id,
      approach: decision.approach,
      preparation: decision.preparation,
      pitStrategy: normalizePitStrategy(decision.pitStrategy),
      cardId: decision.cardId ?? null,
      rivalTeamId: decision.rivalTeamId ?? null
    }];
  });
}
