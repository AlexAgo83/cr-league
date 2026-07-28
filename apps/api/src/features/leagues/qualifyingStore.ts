import { DEMO_RACE_INPUT, circuitIdentityForRound, circuitSeasonSeed, trackSpeedProfileForCircuit, type QualifyingRun, type RaceDecision, type RaceInput } from "@cr-league/shared";
import { LeagueRuleError } from "./errors.js";
import { getCurrentGrandPrix, lockGrandPrixRow, runWrite } from "./persistence.js";
import { createQualifyingRuns, qualifyingCardForTeam } from "./qualifying.js";
import { defaultBotDecision } from "./botLifecycle.js";
import { getLeagueState } from "./leagueState.js";
import { requireTeamClaim } from "./transactionHelpers.js";
import type { Db, SubmitQualifyingInput } from "./types.js";
import { clampInteger, normalizeQualifyingRuns } from "./utils.js";
import { validateDecisionValues } from "./decisions.js";

export async function submitQualifyingRun(db: Db, leagueId: string, input: SubmitQualifyingInput) {
  const grandPrix = await getCurrentGrandPrix(db, leagueId);
  if (!grandPrix) return null;
  if (grandPrix.status === "resolved") {
    throw new LeagueRuleError("This Grand Prix is already resolved.");
  }

  const state = await getLeagueState(db, leagueId);
  if (!state) return null;
  validateDecisionValues(state, input);
  const team = await requireTeamClaim(db, leagueId, input);
  if (state.decisions.some((decision) => decision.teamId === team.id)) {
    throw new LeagueRuleError("Qualifying is closed after submitting your directive.");
  }
  const lockedCardId = qualifyingCardForTeam(state.currentGrandPrix.qualifyingRuns, team.id);
  if (lockedCardId && input.cardId && input.cardId !== lockedCardId) {
    throw new LeagueRuleError("This Grand Prix card is already locked by your qualifying run.");
  }
  const cardId = lockedCardId ?? input.cardId;
  if (cardId && !team.cards.includes(cardId)) {
    throw new LeagueRuleError("This card is not in your inventory.");
  }

  const decision: RaceDecision = {
    approach: input.approach,
    preparation: input.preparation,
    pitStrategy: input.pitStrategy ?? "standard",
    cardId,
    rivalTeamId: input.rivalTeamId
  };
  const { nextRun, previousBest } = await runWrite(db, async (tx) => {
    await lockGrandPrixRow(tx, grandPrix.id);
    const freshGrandPrix = await getCurrentGrandPrix(tx, leagueId);
    if (!freshGrandPrix || freshGrandPrix.id !== grandPrix.id || freshGrandPrix.status === "resolved") {
      throw new LeagueRuleError("This Grand Prix is already resolved.");
    }
    const runs = normalizeQualifyingRuns(freshGrandPrix.qualifyingRuns);
    const teamRuns = runs.filter((candidate) => candidate.teamId === team.id);
    const previousBest = teamRuns.reduce<QualifyingRun | null>((best, candidate) => (!best || candidate.time < best.time ? candidate : best), null);
    const attempts = Math.max(0, ...teamRuns.map((candidate) => candidate.attempts)) + 1;
    if (attempts > state.league.qualifyingAttemptLimit) {
      throw new LeagueRuleError("No qualifying attempts left.");
    }
    const circuit = circuitIdentityForRound(freshGrandPrix.round, circuitSeasonSeed(leagueId, freshGrandPrix.season));
    const attemptRuns = createQualifyingRuns({
      // Deterministic per (GP, team, attempt): retries still differ via the attempt counter, but a given attempt is reproducible (ADR-004), mirroring the bot seed convention.
      seed: `${freshGrandPrix.seed}-${team.id}-qualifying-${attempts}`,
      teamId: team.id,
      teamName: team.name,
      decision,
      primaryTrait: freshGrandPrix.primaryTrait as RaceInput["primaryTrait"],
      secondaryTrait: freshGrandPrix.secondaryTrait as RaceInput["secondaryTrait"],
      // ponytail: qualifying uses the GP's canonical track traits (like bots); client traits are ignored so a team can't tune conditions to favor its own run.
      traits: circuit.traits,
      trackLengthMeters: circuit.trackLengthMeters,
      speedProfile: trackSpeedProfileForCircuit(circuit),
      forecast: freshGrandPrix.forecast as RaceInput["forecast"],
      laps: clampInteger(input.laps, 3, 1, 3),
      weatherSeed: freshGrandPrix.seed
    });
    const nextRunsForAttempt = attemptRuns.map((run) => ({ ...run, attempts }));
    const nextRun = nextRunsForAttempt.reduce((best, run) => (run.time < best.time ? run : best), nextRunsForAttempt[0]!);
    const nextRuns = [...runs, ...nextRunsForAttempt];
    for (const bot of state.teams.filter((candidate) => candidate.kind === "bot")) {
      const botAttempt = Math.max(0, ...nextRuns.filter((run) => run.teamId === bot.id).map((run) => run.attempts)) + 1;
      if (botAttempt > attempts || botAttempt > state.league.qualifyingAttemptLimit) continue;
      const demo = DEMO_RACE_INPUT.participants[state.teams.indexOf(bot) % DEMO_RACE_INPUT.participants.length];
      nextRuns.push(
        createQualifyingRuns({
          seed: `${freshGrandPrix.seed}-${bot.id}-bot-qualifying-${botAttempt}`,
          teamId: bot.id,
          teamName: bot.name,
          decision: defaultBotDecision(state, bot, demo?.decision),
          primaryTrait: freshGrandPrix.primaryTrait as RaceInput["primaryTrait"],
          secondaryTrait: freshGrandPrix.secondaryTrait as RaceInput["secondaryTrait"],
          traits: circuit.traits,
          trackLengthMeters: circuit.trackLengthMeters,
          speedProfile: trackSpeedProfileForCircuit(circuit),
          forecast: freshGrandPrix.forecast as RaceInput["forecast"],
          laps: 1,
          weatherSeed: freshGrandPrix.seed
        })[0]!
      );
      nextRuns[nextRuns.length - 1]!.attempts = botAttempt;
    }

    await tx.grandPrix.update({
      where: { id: freshGrandPrix.id },
      data: { qualifyingRuns: nextRuns }
    });

    return { nextRun, previousBest };
  });

  return {
    state: await getLeagueState(db, leagueId),
    run: nextRun,
    isBest: !previousBest || nextRun.time < previousBest.time
  };
}
