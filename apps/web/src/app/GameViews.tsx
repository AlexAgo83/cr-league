import type { CardId, QualifyingRun, RaceResult } from "@cr-league/shared";
import { APP_VERSION } from "@cr-league/shared";
import { lazy, Suspense, type ReactNode } from "react";
import type { CityCircuit } from "./circuits.js";
import type { ChronoReport, PlanRiskRead } from "./raceFlow.js";
import type { GameView, FormState, LeagueState } from "./types.js";
import type { CardFit, Translator } from "./helpers.js";
import { ChangelogView } from "../features/ChangelogView.js";
import type { MapTraitImpacts } from "../features/CircuitMap.js";
import { PlanView } from "../features/PlanView.js";
import type { DirectiveStep } from "../features/DirectivePanel.js";
import type { ResultTab } from "../features/ResultView.js";
import type { PlanSubscreen } from "./routes.js";
import type { CardPanel, ChampionshipRecordTab } from "./viewPreferences.js";

const ChampionshipView = lazy(() => import("../features/ChampionshipView.js").then((module) => ({ default: module.ChampionshipView })));
const GarageView = lazy(() => import("../features/GarageView.js").then((module) => ({ default: module.GarageView })));
const ResultView = lazy(() => import("../features/ResultView.js").then((module) => ({ default: module.ResultView })));

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
  planRiskRead,
  qualifyingAttemptLimit,
  qualifyingAttemptsLeft,
  selectedCardFit,
  selectedCardId,
  championshipRecordTab,
  playerResult,
  consumedCardIds,
  forecastPick,
  isResolved,
  garagePanel,
  adminView,
  chronoReport,
  qualifyingLockedCardId,
  qualifyingReplayOpen,
  profileIsAdmin,
  primaryCommand,
  setResultTab,
  setResultOpen,
  closeHistoryReplay,
  setDirectiveStep,
  setForm,
  setGameView,
  setPlanSubscreen,
  openQualifyingRun,
  openQualifyingHistory,
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
  planRiskRead: PlanRiskRead;
  qualifyingAttemptLimit: number;
  qualifyingAttemptsLeft: number;
  selectedCardFit: CardFit | null;
  selectedCardId: FormState["cardId"];
  championshipRecordTab: ChampionshipRecordTab;
  playerResult: RaceResult["classification"][number] | undefined;
  consumedCardIds: CardId[];
  forecastPick: string;
  isResolved: boolean;
  garagePanel: CardPanel;
  adminView: ReactNode;
  chronoReport: ChronoReport;
  qualifyingLockedCardId: string | null | undefined;
  qualifyingReplayOpen: boolean;
  profileIsAdmin: boolean;
  primaryCommand: { label: string; action: () => void | Promise<void>; disabled: boolean };
  setResultTab: (tab: ResultTab) => void;
  setResultOpen: (open: boolean) => void;
  closeHistoryReplay: () => void;
  setDirectiveStep: (step: DirectiveStep) => void;
  setForm: (form: FormState) => void;
  setGameView: (view: GameView) => void;
  setPlanSubscreen: (screen: PlanSubscreen) => void;
  openQualifyingRun: (options?: { confirm?: boolean }) => void;
  openQualifyingHistory: (run: QualifyingRun) => void;
  openHistoryReplay: (grandPrix: LeagueState["grandPrixHistory"][number]) => void;
  setSeasonRecapSeason: (season: number) => void;
  setChampionshipRecordTab: (tab: ChampionshipRecordTab) => void;
  buyCard: (cardId: CardId, quantity?: number) => void;
  sellCard: (cardId: CardId) => void;
  setGaragePanel: (panel: CardPanel) => void;
  updateLivery: (livery: LeagueState["teams"][number]["livery"]) => void;
  updateTeamName: (name: string) => void;
  tt: Translator;
}) {
  return (
    <>
      {gameView === "admin" && profileIsAdmin ? adminView : null}
      {gameView === "drive" && visibleResult && !qualifyingReplayOpen ? (
        <Suspense fallback={<p className="pending-feedback" role="status">{tt("status_loading_view")}</p>}>
          <ResultView
            state={state}
            result={visibleResult}
            circuit={visibleResultCircuit}
            playerTeamId={playerTeam?.id}
            playerDecision={playerDecision}
            planDecisions={historyReplay ? [] : state.decisions}
            tab={resultTab}
            traitImpacts={replayTraitImpacts}
            preferencesResetSignal={preferencesResetSignal}
            showReplayIntro={!historyReplay}
            onOpenReplay={() => setResultTab("replay")}
            onOpenPlanReport={() => {
              if (historyReplay) closeHistoryReplay();
              setPlanSubscreen("report");
              setGameView("plan");
            }}
            onOpenPlan={() => {
              setPlanSubscreen("plan");
              setGameView("plan");
            }}
            onClose={() => {
              if (historyReplay) closeHistoryReplay();
              else setResultOpen(false);
            }}
            tt={tt}
          />
        </Suspense>
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
          locked={Boolean(playerDecision) || isResolved}
          planSubscreen={planSubscreen}
          playerQualifyingRuns={playerQualifyingRuns}
          playerDecision={playerDecision}
          playerTeamId={playerTeam?.id}
          planRiskRead={planRiskRead}
          qualifyingAttemptLimit={qualifyingAttemptLimit}
          qualifyingAttemptsLeft={qualifyingAttemptsLeft}
          selectedCardFit={selectedCardFit}
          selectedCardId={selectedCardId}
          primaryCommand={primaryCommand}
          reportCircuit={currentCircuit}
          reportResult={state.currentGrandPrix.result}
          state={state}
          onSetDirectiveStep={setDirectiveStep}
          onSetForm={setForm}
          onSetGameView={setGameView}
          onSetPlanSubscreen={setPlanSubscreen}
          onOpenRaceReplay={() => {
            setResultTab("replay");
            setResultOpen(true);
            setGameView("drive");
          }}
          onOpenQualifyingRun={() => openQualifyingRun({ confirm: true })}
          onOpenQualifyingHistory={openQualifyingHistory}
          tt={tt}
        />
      ) : null}
      {gameView === "championship" ? (
        <Suspense fallback={<p className="pending-feedback" role="status">{tt("status_loading_view")}</p>}>
          <ChampionshipView state={state} playerTeamId={playerTeam?.id} recordTab={championshipRecordTab} onReplayGrandPrix={openHistoryReplay} onOpenSeasonRecap={setSeasonRecapSeason} onSelectRecordTab={setChampionshipRecordTab} tt={tt} />
        </Suspense>
      ) : null}
      {gameView === "garage" ? (
        <Suspense fallback={<p className="pending-feedback" role="status">{tt("status_loading_view")}</p>}>
          <GarageView
            state={state}
            playerTeam={playerTeam}
            playerResult={playerResult}
            consumedCardIds={consumedCardIds}
            ownedCardIds={ownedCardIds}
            forecastPick={forecastPick}
            isResolved={isResolved}
            loading={status === "loading"}
            cardPanel={garagePanel}
            onBuyCard={buyCard}
            onSellCard={sellCard}
            onSelectCardPanel={setGaragePanel}
            onUpdateLivery={updateLivery}
            onUpdateTeamName={updateTeamName}
            tt={tt}
          />
        </Suspense>
      ) : null}
      {gameView === "changelog" ? <ChangelogView currentVersion={APP_VERSION} tt={tt} /> : null}
    </>
  );
}
