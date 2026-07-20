import { ACTIVE_PLAYER_CLAIM_KEY, claimFromState, loadPlayerClaims, storePlayerClaims, upsertPlayerClaim } from "./appStorage.js";
import type { LeagueState } from "./types.js";

export function rememberPlayerClaim(state: LeagueState) {
  const claim = claimFromState(state);
  if (!claim) return null;
  const claims = upsertPlayerClaim(loadPlayerClaims(), claim);
  storePlayerClaims(claims, claim.teamId);
  return claims;
}

export function withCurrentPlayer(state: LeagueState, currentPlayer: LeagueState["player"]): LeagueState {
  const player = state.player ?? currentPlayer;
  return player && state.teams.some((team) => team.id === player.teamId) ? { ...state, player } : state;
}

export function withoutPlayerClaim(savedClaims: ReturnType<typeof loadPlayerClaims>, currentTeamId?: string) {
  const activeTeamId = currentTeamId ?? localStorage.getItem(ACTIVE_PLAYER_CLAIM_KEY);
  const claims = activeTeamId ? savedClaims.filter((claim) => claim.teamId !== activeTeamId) : savedClaims;
  storePlayerClaims(claims, claims[0]?.teamId);
  return claims;
}
