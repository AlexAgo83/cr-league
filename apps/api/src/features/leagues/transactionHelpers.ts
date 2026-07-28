import { LeagueRuleError } from "./errors.js";
import type { AdminProofInput, Db } from "./types.js";
import { normalizeCards, normalizeLivery, verifyRecoveryCode, verifyTeamClaimCode } from "./utils.js";

export { getCurrentGrandPrix, lockGrandPrixRow, lockLeagueRow, lockTeamRow, runWrite } from "./persistence.js";
export { normalizeQualifyingRuns } from "./utils.js";

export async function requireAdminClaim(db: Db, leagueId: string, input: AdminProofInput) {
  const team = await requireTeamClaim(db, leagueId, input);
  const league = await db.league.findUnique({
    where: { id: leagueId },
    include: { teams: { orderBy: { createdAt: "asc" } } }
  });
  if (!league) {
    throw new LeagueRuleError("Only the league owner can perform this action.", 403);
  }
  let owner = league.teams.find((candidate) => candidate.id === league.ownerTeamId && candidate.kind === "human");
  if (!owner) {
    owner = league.teams.find((candidate) => candidate.kind === "human");
    if (owner) await db.league.update({ where: { id: leagueId }, data: { ownerTeamId: owner.id } });
  }
  if (!owner) {
    throw new LeagueRuleError("Only the league owner can perform this action.", 403);
  }
  if (owner.id !== team.id) {
    throw new LeagueRuleError("Only the league owner can perform this action.", 403);
  }
  return team;
}

export async function requireTeamClaim(db: Db, leagueId: string, input: { teamId?: string; claimCode?: string }) {
  if (!input.teamId || !input.claimCode) {
    throw new LeagueRuleError("A valid team claim is required.");
  }
  const team = await db.team.findUnique({ where: { id: input.teamId } });
  const sessionValid = team?.sessionClaimCodeHash ? await verifyRecoveryCode(input.claimCode, team.sessionClaimCodeHash) : false;
  const claimValid = team ? sessionValid || (await verifyTeamClaimCode(db, team, input.claimCode)) : false;
  if (!team || team.leagueId !== leagueId || team.kind !== "human" || !claimValid) {
    throw new LeagueRuleError("A valid team claim is required.");
  }
  return { ...team, cards: normalizeCards(team.cards), livery: normalizeLivery(team.livery) };
}
