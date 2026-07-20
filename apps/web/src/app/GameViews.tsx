import type { CardId, QualifyingRun, RaceResult } from "@cr-league/shared";
import { APP_VERSION } from "@cr-league/shared";
import type { ReactNode } from "react";
import type { CityCircuit } from "./circuits.js";
import type { ChronoReport } from "./raceFlow.js";
import type { GameView, FormState, LeagueState } from "./types.js";
import type { CardFit, Translator } from "./helpers.js";
import { ChangelogView } from "../features/ChangelogView.js";
import { ChampionshipView, type ChampionshipRecordTab } from "../features/ChampionshipView.js";
import type { MapTraitImpacts } from "../features/CircuitMap.js";
import { GarageView, type CardPanel } from "../features/GarageView.js";
import { PlanView } from "../features/PlanView.js";
import type { DirectiveStep } from "../features/DirectivePanel.js";
import { ResultView, type ResultTab } from "../features/ResultView.js";
import type { PlanSubscreen } from "./routes.js";

export function GameViews({
  gameView,
  state,
  visibleResult,
  visibleResultCircuit,
  playerTeam,
  playerDecision,
  resultTab,
  replayTraitImpacts,
  preferencesResetSignal,
  historyReplay,
  currentCircuit,
  directiveStep,
  status,
  form,
  ownedCardIds,
  planSubscreen,
  playerQualifyingRuns,
  qualifyingAttemptLimit,
  qualifyingAttemptsLeft,
  selectedCardFit,
  selectedCardId,
  championshipRecordTab,
  playerResult,
  consumedCardIds,
  forecastPick,
  isResolved,
  pendingMessage,
  garagePanel,
  adminView,
  chronoReport,
  qualifyingLockedCardId,
  profileIsAdmin,
  setResultTab,
  setResultOpen,
  closeHistoryReplay,
  setDirectiveStep,
  setForm,
  setGameView,
  setPlanSubscreen,
  setQualifyingResult,
  openHistoryReplay,
  setSeasonRecapSeason,
  setChampionshipRecordTab,
  buyCard,
  sellCard,
  setGaragePanel,
  updateLivery,
  updateTeamName,
  tt
}: {
  gameView: GameView;
  state: LeagueState;
  visibleResult: RaceResult | null | undefined;
  visibleResultCircuit: CityCircuit;
  playerTeam: LeagueState["teams"][number] | undefined;
  playerDecision: LeagueState["decisions"][number] | undefined;
  resultTab: ResultTab;
  replayTraitImpacts: MapTraitImpacts;
  preferencesResetSignal: number;
  historyReplay: LeagueState["grandPrixHistory"][number] | null;
  currentCircuit: CityCircuit;
  directiveStep: DirectiveStep;
  status: "idle" | "loading" | "error";
  form: FormState;
  ownedCardIds: CardId[];
  planSubscreen: PlanSubscreen;
  playerQualifyingRuns: QualifyingRun[];
  qualifyingAttemptLimit: number;
  qualifyingAttemptsLeft: number;
  selectedCardFit: CardFit | null;
  selectedCardId: FormState["cardId"];
  championshipRecordTab: ChampionshipRecordTab;
  playerResult: RaceResult["classification"][number] | undefined;
  consumedCardIds: CardId[];
  forecastPick: string;
  isResolved: boolean;
  pendingMessage: string | null;
  garagePanel: CardPanel;
  adminView: ReactNode;
  chronoReport: ChronoReport;
  qualifyingLockedCardId: string | null | undefined;
  profileIsAdmin: boolean;
  setResultTab: (tab: ResultTab) => void;
  setResultOpen: (open: boolean) => void;
  closeHistoryReplay: () => void;
  setDirectiveStep: (step: DirectiveStep) => void;
  setForm: (form: FormState) => void;
  setGameView: (view: GameView) => void;
  setPlanSubscreen: (screen: PlanSubscreen) => void;
  setQualifyingResult: (run: QualifyingRun) => void;
  openHistoryReplay: (grandPrix: LeagueState["grandPrixHistory"][number]) => void;
  setSeasonRecapSeason: (season: number) => void;
  setChampionshipRecordTab: (tab: ChampionshipRecordTab) => void;
  buyCard: (cardId: CardId) => void;
  sellCard: (cardId: CardId) => void;
  setGaragePanel: (panel: CardPanel) => void;
  updateLivery: (livery: LeagueState["teams"][number]["livery"]) => void;
  updateTeamName: (name: string) => void;
  tt: Translator;
}) {
  return (
    <>
      {gameView === "admin" && profileIsAdmin ? adminView : null}
      {gameView === "drive" && visibleResult ? (
        <ResultView
          state={state}
          result={visibleResult}
          circuit={visibleResultCircuit}
          playerTeamId={playerTeam?.id}
          playerDecision={playerDecision}
          tab={resultTab}
          traitImpacts={replayTraitImpacts}
          preferencesResetSignal={preferencesResetSignal}
          showReplayIntro={!historyReplay}
          onOpenReplay={() => setResultTab("replay")}
          onOpenReport={() => setResultTab("report")}
          onClose={() => {
            if (historyReplay) closeHistoryReplay();
            else setResultOpen(false);
          }}
          tt={tt}
        />
      ) : null}
      {gameView === "plan" ? (
        <PlanView
          cardLocked={Boolean(qualifyingLockedCardId)}
          chronoReport={chronoReport}
          circuitTraits={currentCircuit.traits}
          directiveStep={directiveStep}
          disabled={status === "loading" || Boolean(playerDecision) || isResolved}
          form={form}
          forecastPick={forecastPick}
          ownedCardIds={ownedCardIds}
          planSubscreen={planSubscreen}
          playerQualifyingRuns={playerQualifyingRuns}
          qualifyingAttemptLimit={qualifyingAttemptLimit}
          qualifyingAttemptsLeft={qualifyingAttemptsLeft}
          selectedCardFit={selectedCardFit}
          selectedCardId={selectedCardId}
          onSetDirectiveStep={setDirectiveStep}
          onSetForm={setForm}
          onSetGameView={setGameView}
          onSetPlanSubscreen={setPlanSubscreen}
          onSetQualifyingResult={setQualifyingResult}
          tt={tt}
        />
      ) : null}
      {gameView === "championship" ? (
        <ChampionshipView state={state} playerTeamId={playerTeam?.id} recordTab={championshipRecordTab} onReplayGrandPrix={openHistoryReplay} onOpenSeasonRecap={setSeasonRecapSeason} onSelectRecordTab={setChampionshipRecordTab} tt={tt} />
      ) : null}
      {gameView === "garage" ? (
        <GarageView
          state={state}
          playerTeam={playerTeam}
          playerResult={playerResult}
          consumedCardIds={consumedCardIds}
          ownedCardIds={ownedCardIds}
          forecastPick={forecastPick}
          isResolved={isResolved}
          loading={status === "loading"}
          pendingMessage={pendingMessage}
          cardPanel={garagePanel}
          onBuyCard={buyCard}
          onSellCard={sellCard}
          onSelectCardPanel={setGaragePanel}
          onUpdateLivery={updateLivery}
          onUpdateTeamName={updateTeamName}
          tt={tt}
        />
      ) : null}
      {gameView === "changelog" ? <ChangelogView currentVersion={APP_VERSION} tt={tt} /> : null}
    </>
  );
}
