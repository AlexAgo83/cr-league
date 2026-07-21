import { type CardId, type QualifyingRun } from "@cr-league/shared";
import { useMemo } from "react";
import type { TranslationKey } from "../i18n/index.js";
import { circuitForRound } from "./circuits.js";
import { cardFit, completedSeasonSummaries, startingGrid, strongestForecast } from "./helpers.js";
import { bestQualifyingRuns, buildChronoReport, buildPlanRiskRead, latestQualifyingRun, qualifyingReplayTower, traitImpacts } from "./raceFlow.js";
import type { FormState, LeagueState } from "./types.js";

type DeskState = "prepare" | "ready" | "resolved";

export function useRaceDerivations(input: {
  leagueState: LeagueState | null;
  adminInspecting: boolean;
  form: FormState;
  qualifyingResult: QualifyingRun | null;
  historyReplay: LeagueState["grandPrixHistory"][number] | null;
  resultOpen: boolean;
  status: "idle" | "loading" | "error";
  tt: (key: TranslationKey, params?: Record<string, string | number>) => string;
}) {
  const { leagueState, adminInspecting, form, qualifyingResult, historyReplay, resultOpen, status, tt } = input;
  const playerTeam =
    leagueState?.teams.find((team) => team.id === leagueState.player?.teamId) ??
    (adminInspecting ? undefined : leagueState?.teams.find((team) => team.kind === "human")) ??
    (adminInspecting ? undefined : leagueState?.teams[0]);
  const playerDecision = leagueState?.decisions.find((decision) => decision.teamId === playerTeam?.id);
  const qualifyingRuns = leagueState?.currentGrandPrix.qualifyingRuns ?? [];
  const playerQualifyingRuns = qualifyingRuns.filter((run) => run.teamId === playerTeam?.id);
  const lastQualifyingRun = latestQualifyingRun(playerQualifyingRuns);
  const currentQualifyingResult = qualifyingResult && playerQualifyingRuns.some((run) => run.teamId === qualifyingResult.teamId && run.attempts === qualifyingResult.attempts) ? qualifyingResult : null;
  const replayQualifyingRun = currentQualifyingResult ?? lastQualifyingRun;
  const qualifyingReplayEntries = qualifyingReplayTower(replayQualifyingRun, qualifyingRuns, tt);
  const qualifyingLeaderboardRuns = bestQualifyingRuns(qualifyingRuns);
  const qualifyingLeaderboard = [...qualifyingLeaderboardRuns]
    .sort((left, right) => left.time - right.time)
    .slice(0, 10)
    .map((run, index) => ({
      ...run,
      position: index + 1,
      teamName: leagueState?.teams.find((team) => team.id === run.teamId)?.name ?? run.teamId
    }));
  const qualifyingAttemptsUsed = Math.max(0, ...playerQualifyingRuns.map((run) => run.attempts));
  const qualifyingAttemptLimit = leagueState?.league.qualifyingAttemptLimit ?? Number(form.qualifyingAttemptLimit);
  const qualifyingAttemptsLeft = Math.max(0, qualifyingAttemptLimit - qualifyingAttemptsUsed);
  const qualifyingLockedCardId = playerQualifyingRuns.find((run) => run.decision?.cardId === "qualifying_focus")?.decision?.cardId;
  const result = leagueState?.currentGrandPrix.result;
  const isResolved = leagueState?.currentGrandPrix.status === "resolved" || Boolean(result);
  const qualifyingDisabled = status === "loading" || isResolved || Boolean(playerDecision) || qualifyingAttemptsLeft <= 0;
  const forecastPick = leagueState ? strongestForecast(leagueState.currentGrandPrix.forecast) : "dry";
  const ownedCardIds = useMemo(() => Array.from(new Set(playerTeam?.cards ?? [])), [playerTeam]);
  const selectedCardId = qualifyingLockedCardId ?? (ownedCardIds.includes(form.cardId as CardId) ? form.cardId : "");
  const selectedCardFit = leagueState && selectedCardId ? cardFit(selectedCardId as CardId, leagueState, forecastPick) : null;
  const directiveTraitImpacts = traitImpacts(form, selectedCardId, tt);
  const replayTraitImpacts = playerDecision
    ? traitImpacts({ ...form, approach: playerDecision.approach, preparation: playerDecision.preparation, pitStrategy: playerDecision.pitStrategy ?? "standard" }, playerDecision.cardId ?? "", tt)
    : directiveTraitImpacts;
  const mapPlan = playerDecision
    ? { approach: playerDecision.approach, preparation: playerDecision.preparation, pitStrategy: playerDecision.pitStrategy ?? "standard", cardId: playerDecision.cardId ?? undefined }
    : { approach: form.approach, preparation: form.preparation, pitStrategy: form.pitStrategy, cardId: selectedCardId || undefined };
  const playerResult = result?.classification.find((entry) => entry.teamId === playerTeam?.id);
  const consumedCardIds = result?.consumedCards.filter((card) => card.teamId === playerTeam?.id).map((card) => card.cardId) ?? [];
  const deskState: DeskState = isResolved ? "resolved" : playerDecision ? "ready" : "prepare";
  const currentCircuit = leagueState
    ? circuitForRound(leagueState.currentGrandPrix.round, leagueState.league.id, leagueState.currentGrandPrix.season)
    : circuitForRound(1);
  const qualifyingReplayCircuit = currentQualifyingResult
    ? {
        ...currentCircuit,
        laps: Math.min(3, Math.max(1, ...currentQualifyingResult.result.events.map((event) => event.lap), currentQualifyingResult.lap ?? 1))
      }
    : currentCircuit;
  const currentGrandPrixKey = leagueState ? `${leagueState.league.id}:${leagueState.currentGrandPrix.season}:${leagueState.currentGrandPrix.round}` : "";
  const raceDayPhase = isResolved ? "finished" : playerDecision ? "locked" : qualifyingAttemptsUsed > 0 || qualifyingAttemptsLeft <= 0 ? "adjust" : "briefing";
  const startingGridEntries = leagueState ? startingGrid(leagueState) : [];
  const playerGridPosition = startingGridEntries.find((entry) => entry.team.id === playerTeam?.id)?.position ?? 0;
  const planRiskForm: FormState = playerDecision
    ? {
        ...form,
        approach: playerDecision.approach,
        preparation: playerDecision.preparation,
        pitStrategy: playerDecision.pitStrategy ?? "standard",
        cardId: (playerDecision.cardId ?? "") as FormState["cardId"]
      }
    : form;
  const planRiskSelectedCardId = playerDecision ? playerDecision.cardId ?? "" : selectedCardId;
  const planRiskRead = buildPlanRiskRead({
    form: planRiskForm,
    selectedCardId: planRiskSelectedCardId,
    forecastPick,
    circuitTraits: currentCircuit.traits,
    qualifyingAttemptsUsed,
    qualifyingAttemptsLeft,
    gridPosition: playerGridPosition,
    tt
  });
  const chronoReport = buildChronoReport({
    runs: playerQualifyingRuns,
    gridPosition: playerGridPosition,
    attemptsLeft: qualifyingAttemptsLeft,
    attemptLimit: qualifyingAttemptLimit,
    forecastPick,
    form,
    selectedCardId: selectedCardId ?? "",
    tt
  });
  const completedSeasons = useMemo(() => (leagueState ? completedSeasonSummaries(leagueState) : []), [leagueState]);
  const visibleResult = historyReplay?.result ?? (resultOpen ? result : undefined);
  const visibleResultCircuit = historyReplay && leagueState ? circuitForRound(historyReplay.round, leagueState.league.id, historyReplay.season) : currentCircuit;
  const isSeasonFinalGrandPrix = Boolean(leagueState && leagueState.currentGrandPrix.round >= leagueState.league.maxGrandPrixPerSeason);

  return {
    playerTeam,
    playerDecision,
    playerQualifyingRuns,
    lastQualifyingRun,
    currentQualifyingResult,
    qualifyingReplayEntries,
    qualifyingLeaderboard,
    qualifyingAttemptsUsed,
    qualifyingAttemptLimit,
    qualifyingAttemptsLeft,
    qualifyingLockedCardId,
    result,
    isResolved,
    qualifyingDisabled,
    forecastPick,
    ownedCardIds,
    selectedCardId,
    selectedCardFit,
    directiveTraitImpacts,
    replayTraitImpacts,
    mapPlan,
    playerResult,
    consumedCardIds,
    deskState,
    currentCircuit,
    qualifyingReplayCircuit,
    currentGrandPrixKey,
    raceDayPhase,
    startingGridEntries,
    planRiskRead,
    chronoReport,
    completedSeasons,
    visibleResult,
    visibleResultCircuit,
    isSeasonFinalGrandPrix
  };
}
