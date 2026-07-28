import { getLeagueState } from "./leagueState.js";
import { requireAdminClaim } from "./transactionHelpers.js";
import type { AdminProofInput, Db } from "./types.js";

export async function sendPlanReminders(db: Db, leagueId: string, input: AdminProofInput = {}, mailer?: { active: boolean; sendPlanReminder?: (email: string, input: { leagueName: string; teamName: string; grandPrixName: string; season: number; round: number }) => Promise<boolean> }) {
  await requireAdminClaim(db, leagueId, input);
  const league = await db.league.findUnique({
    where: { id: leagueId },
    include: {
      teams: { include: { profile: true } },
      grandPrixes: {
        orderBy: [{ season: "desc" }, { round: "desc" }],
        take: 1,
        include: { decisions: true }
      }
    }
  });
  const grandPrix = league?.grandPrixes[0];
  if (!league || !grandPrix) return null;
  if (league.reminderSeasonNumber === grandPrix.season && league.reminderSentAt) {
    return { state: await getLeagueState(db, leagueId), reminder: { alreadySent: true, sentCount: 0, skippedCount: 0 } };
  }

  const submitted = new Set(grandPrix.decisions.map((decision) => decision.teamId));
  const pendingTeams = league.teams.filter((team) => team.kind === "human" && !submitted.has(team.id));
  let sentCount = 0;
  let skippedCount = 0;
  for (const team of pendingTeams) {
    const email = team.profile?.email;
    if (!email || !mailer?.active || !mailer.sendPlanReminder) {
      skippedCount += 1;
      continue;
    }
    try {
      if (await mailer.sendPlanReminder(email, { leagueName: league.name, teamName: team.name, grandPrixName: grandPrix.name, season: grandPrix.season, round: grandPrix.round })) {
        sentCount += 1;
      } else {
        skippedCount += 1;
      }
    } catch {
      skippedCount += 1;
    }
  }

  if (sentCount > 0) {
    await db.league.update({
      where: { id: leagueId },
      data: {
        reminderSentAt: new Date(),
        reminderSentBy: input.teamId,
        reminderSeasonNumber: grandPrix.season,
        reminderSentCount: sentCount,
        reminderSkippedCount: skippedCount
      }
    });
  }

  return { state: await getLeagueState(db, leagueId), reminder: { alreadySent: false, sentCount, skippedCount } };
}
