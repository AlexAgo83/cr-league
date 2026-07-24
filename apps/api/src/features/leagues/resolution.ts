import { DEMO_RACE_INPUT, circuitIdentityForRound, circuitSeasonSeed, simulateRace, trackSpeedProfileForCircuit, trackZonesForCircuit, type CardId, type RaceDecision, type RaceInput, type RaceParticipant } from "@cr-league/shared";
import { LeagueRuleError } from "./errors.js";
import { getCurrentGrandPrix, lockGrandPrixRow, runWrite } from "./persistence.js";
import { bestQualifyingRuns } from "./qualifying.js";
import { defaultBotDecision, ensureBotQualifyingRuns, fillLeagueWithBots, getLeagueState, normalizePitStrategy } from "./lifecycle.js";
import { requireAdminClaim } from "./transactionHelpers.js";
import type { Db, LeagueState, ResolveGrandPrixInput } from "./types.js";

export async function resolveCurrentGrandPrix(db: Db, leagueId: string, input: ResolveGrandPrixInput = {}) {
  await requireAdminClaim(db, leagueId, input);
  const state = await getLeagueState(db, leagueId);
  const grandPrix = await getCurrentGrandPrix(db, leagueId);
  if (!state || !grandPrix) return null;
  if (grandPrix.status === "resolved") {
    throw new LeagueRuleError("This Grand Prix is already resolved.");
  }
  if (!hasHumanDecision(state) && !input.allowDefaults) {
    throw new LeagueRuleError("Submit your race directive before launching the Grand Prix.");
  }

  if (state.league.fillWithBots) {
    await fillLeagueWithBots(db, state);
  }
  const readyState = state.league.fillWithBots ? await getLeagueState(db, leagueId) : state;
  if (!readyState) return null;
  await ensureBotQualifyingRuns(db, grandPrix, readyState);
  const raceState = await getLeagueState(db, leagueId);
  if (!raceState) return null;
  if (raceState.teams.length < 2) {
    throw new LeagueRuleError("At least two teams are required to launch the Grand Prix.");
  }

  await runWrite(db, async (tx) => {
    await lockGrandPrixRow(tx, grandPrix.id);
    const freshState = await getLeagueState(tx, leagueId);
    const freshGrandPrix = await getCurrentGrandPrix(tx, leagueId);
    if (!freshState || !freshGrandPrix || freshGrandPrix.id !== grandPrix.id) return;
    if (freshState.teams.length < 2) {
      throw new LeagueRuleError("At least two teams are required to launch the Grand Prix.");
    }
    const participants = buildParticipants(freshState);
    const circuit = circuitIdentityForRound(freshGrandPrix.round, circuitSeasonSeed(leagueId, freshGrandPrix.season));
    const result = simulateRace({
      seed: freshGrandPrix.seed,
      grandPrixName: freshGrandPrix.name,
      primaryTrait: freshGrandPrix.primaryTrait as RaceInput["primaryTrait"],
      secondaryTrait: freshGrandPrix.secondaryTrait as RaceInput["secondaryTrait"],
      traits: circuit.traits,
      trackLengthMeters: circuit.trackLengthMeters,
      laps: circuit.laps,
      pitLaneProgress: circuit.pitLaneProgress,
      trackZones: trackZonesForCircuit(circuit),
      speedProfile: trackSpeedProfileForCircuit(circuit),
      forecast: freshGrandPrix.forecast as RaceInput["forecast"],
      participants
    });
    const claimed = await tx.grandPrix.updateMany({
      where: { id: grandPrix.id, status: "briefing" },
      data: {
        status: "resolved",
        result
      }
    });
    if (claimed.count !== 1) throw new LeagueRuleError("This Grand Prix is already resolved.");

    for (const entry of result.classification) {
      await tx.team.update({
        where: { id: entry.teamId },
        data: {
          points: { increment: entry.points },
          credits: { increment: entry.credits }
        }
      });
    }
    // ponytail: group consumed cards per team and remove from the already-locked freshState snapshot,
    // replacing the per-card findUnique+update (2 queries each) with one update per affected team.
    const consumedByTeam = new Map<string, CardId[]>();
    for (const consumed of result.consumedCards) {
      consumedByTeam.set(consumed.teamId, [...(consumedByTeam.get(consumed.teamId) ?? []), consumed.cardId]);
    }
    for (const [teamId, cardIds] of consumedByTeam) {
      const team = freshState.teams.find((candidate) => candidate.id === teamId);
      if (!team) continue;
      const cards = [...team.cards];
      for (const cardId of cardIds) {
        const index = cards.indexOf(cardId);
        if (index >= 0) cards.splice(index, 1);
      }
      await tx.team.update({ where: { id: teamId }, data: { cards } });
    }
  });

  return getLeagueState(db, leagueId);
}

function hasHumanDecision(state: LeagueState) {
  const humanTeamIds = new Set(state.teams.filter((team) => team.kind === "human").map((team) => team.id));
  return state.decisions.some((decision) => humanTeamIds.has(decision.teamId));
}

function buildParticipants(state: LeagueState): RaceParticipant[] {
  const baseRank = new Map(state.teams.map((team, index) => [team.id, index + 1]));
  const qualifyingTime = new Map(bestQualifyingRuns(state.currentGrandPrix.qualifyingRuns).map((run) => [run.teamId, run.time]));
  const qualifyingRank = new Map(
    [...state.teams]
      .sort(
        (left, right) =>
          (qualifyingTime.get(left.id) ?? Number.POSITIVE_INFINITY) - (qualifyingTime.get(right.id) ?? Number.POSITIVE_INFINITY) ||
          (baseRank.get(left.id) ?? 999) - (baseRank.get(right.id) ?? 999)
      )
      .map((team, index) => [team.id, index + 1])
  );

  return state.teams.map((team, index) => {
    const demo = DEMO_RACE_INPUT.participants[index % DEMO_RACE_INPUT.participants.length];
    if (!demo) {
      throw new Error("Demo race participant template is missing.");
    }
    const decision = state.decisions.find((candidate) => candidate.teamId === team.id);

    return {
      teamId: team.id,
      teamName: team.name,
      kind: team.kind === "bot" ? "bot" : "human",
      standingsRank: qualifyingRank.get(team.id) ?? index + 1,
      botArchetype: demo.botArchetype,
      decision: team.kind === "bot" ? defaultBotDecision(state, team, demo.decision) : decision
        ? {
            approach: decision.approach as RaceDecision["approach"],
            preparation: decision.preparation as RaceDecision["preparation"],
            pitStrategy: normalizePitStrategy(decision.pitStrategy),
            cardId: (decision.cardId ?? undefined) as RaceDecision["cardId"],
            rivalTeamId: decision.rivalTeamId ?? undefined
          }
        : { ...demo.decision, cardId: undefined }
    };
  });
}
