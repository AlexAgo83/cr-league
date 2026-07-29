import type { CardId, CarAssetId, QualifyingRun } from "@cr-league/shared";
import { useT } from "../i18n/index.js";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { GameTopbar } from "./AppChrome.js";
import type { DirectiveStep } from "../features/DirectivePanel.js";
import { DriveView } from "./DriveView.js";
import { GameViews } from "./GameViews.js";
import { SetupGate } from "./SetupGate.js";
import { isSoloLeagueState } from "./soloLeague.js";
import type { PlanSubscreen } from "./routes.js";
import type { FormState, GameView, LeagueState, ProfileSession } from "./types.js";
import type { CommandClick } from "./useCommandClicks.js";
import type { useRaceDerivations } from "./useRaceDerivations.js";
import type { CardPanel, ChampionshipRecordTab } from "./viewPreferences.js";

type RaceDerivations = ReturnType<typeof useRaceDerivations>;
type ResultTab = "replay" | "report";

export function AppShell({
  profileSession,
  leagueState,
  gameView,
  adminInspecting,
  adminView,
  setupTopbar,
  notificationStack,
  overlays,
  form,
  status,
  pendingMessage,
  resultTab,
  resultOpen,
  historyReplay,
  profileIsAdmin,
  preferencesResetSignal,
  qualifyingReplayInitialLap,
  qualifyingPanelOpen,
  primaryCommandClass,
  primaryCommand,
  race,
  planSubscreen,
  directiveStep,
  championshipRecordTab,
  garagePanel,
  gameProfileMenu,
  setForm,
  setResultTab,
  setResultOpen,
  setDirectiveStep,
  setGameView,
  setPlanSubscreen,
  setQualifyingResult,
  openQualifyingHistory,
  setSeasonRecapSeason,
  setChampionshipRecordTab,
  setGaragePanel,
  setQualifyingPanelOpen,
  closeHistoryReplay,
  openHistoryReplay,
  buyCard,
  sellCard,
  buyCarAsset,
  updateLivery,
  updateTeamName,
  clearTransientNotifications,
  clearScreenOnboardingSnoozes,
  markCommandClicked,
  openQualifyingRun,
  goHome,
  leaveToMenu,
  backToAdminConsole
}: {
  profileSession: ProfileSession | null;
  leagueState: LeagueState | null;
  gameView: GameView;
  adminInspecting: boolean;
  adminView: ReactNode;
  setupTopbar: ReactNode;
  notificationStack: ReactNode;
  overlays: ReactNode;
  form: FormState;
  status: "idle" | "loading" | "error";
  pendingMessage: string | null;
  resultTab: ResultTab;
  resultOpen: boolean;
  historyReplay: LeagueState["grandPrixHistory"][number] | null;
  profileIsAdmin: boolean;
  preferencesResetSignal: number;
  qualifyingReplayInitialLap?: number;
  qualifyingPanelOpen: boolean;
  primaryCommandClass: string;
  primaryCommand: { label: string; action: () => void | Promise<void>; disabled: boolean };
  race: RaceDerivations;
  planSubscreen: PlanSubscreen;
  directiveStep: DirectiveStep;
  championshipRecordTab: ChampionshipRecordTab;
  garagePanel: CardPanel;
  gameProfileMenu: ReactNode;
  setForm: Dispatch<SetStateAction<FormState>>;
  setResultTab: (tab: ResultTab) => void;
  setResultOpen: (open: boolean) => void;
  setDirectiveStep: (step: DirectiveStep) => void;
  setGameView: (view: GameView) => void;
  setPlanSubscreen: (screen: PlanSubscreen) => void;
  setQualifyingResult: (result: QualifyingRun | null) => void;
  openQualifyingHistory: (run: QualifyingRun) => void;
  setSeasonRecapSeason: Dispatch<SetStateAction<number | null>>;
  setChampionshipRecordTab: (tab: ChampionshipRecordTab) => void;
  setGaragePanel: (panel: CardPanel) => void;
  setQualifyingPanelOpen: (open: boolean) => void;
  closeHistoryReplay: () => void;
  openHistoryReplay: (grandPrix: LeagueState["grandPrixHistory"][number]) => void;
  buyCard: (cardId: CardId, quantity?: number) => void;
  sellCard: (cardId: CardId) => void;
  buyCarAsset: (carAssetId: CarAssetId) => void;
  updateLivery: (livery: LeagueState["teams"][number]["livery"], options?: { silent?: boolean }) => void;
  updateTeamName: (name: string) => void;
  clearTransientNotifications: () => void;
  clearScreenOnboardingSnoozes: () => void;
  markCommandClicked: (command: CommandClick) => void;
  openQualifyingRun: (options?: { confirm?: boolean }) => void;
  goHome: () => void;
  leaveToMenu: () => void;
  backToAdminConsole: () => void;
}) {
  const tt = useT();
  if (!leagueState || (!profileSession && !isSoloLeagueState(leagueState))) {
    return (
      <SetupGate
        profileSession={profileSession}
        leagueState={leagueState}
        gameView={gameView}
        adminView={adminView}
        setupTopbar={setupTopbar}
        notificationStack={notificationStack}
        overlays={overlays}
        form={form}
        status={status}
        pendingMessage={pendingMessage}
        setForm={setForm}
      />
    );
  }

  const isMapScreen = gameView === "drive" && (!race.visibleResult || resultTab === "replay");
  const selectGameView = (view: GameView) => {
    clearTransientNotifications();
    clearScreenOnboardingSnoozes();
    closeHistoryReplay();
    setGameView(view);
    if (view === "plan") setPlanSubscreen("plan");
    if (view === "drive" && race.result) setResultOpen(false);
  };

  return (
    <main className={isMapScreen ? "app-shell game-shell map-screen" : "app-shell game-shell"}>
      <GameTopbar leagueName={leagueState.league.name} modeBadge={isSoloLeagueState(leagueState) ? tt("mode_badge_solo_local") : undefined} gameView={gameView} pendingMessage={pendingMessage} profileMenu={gameProfileMenu} onHome={goHome} onLeaveToMenu={leaveToMenu} onSelectView={selectGameView} />
      <h1 className="visually-hidden">{leagueState.league.name}</h1>

      <section className="view-container">
        {adminInspecting ? (
          <div className="admin-inspection-banner" role="status">
            <strong>{tt("admin_inspection_banner")}</strong>
            <button type="button" onClick={backToAdminConsole}>
              {tt("admin_action_back_to_console")}
            </button>
          </div>
        ) : null}
        <GameViews
          gameView={gameView}
          state={leagueState}
          visibleResult={race.visibleResult}
          visibleResultCircuit={race.visibleResultCircuit}
          playerTeam={race.playerTeam}
          playerDecision={race.playerDecision}
          resultTab={resultTab}
          replayTraitImpacts={race.replayTraitImpacts}
          preferencesResetSignal={preferencesResetSignal}
          historyReplay={historyReplay}
          currentCircuit={race.currentCircuit}
          directiveStep={directiveStep}
          status={status}
          form={form}
          ownedCardIds={race.ownedCardIds}
          planSubscreen={planSubscreen}
          playerQualifyingRuns={race.playerQualifyingRuns}
          planRiskRead={race.planRiskRead}
          qualifyingAttemptLimit={race.qualifyingAttemptLimit}
          qualifyingAttemptsLeft={race.qualifyingAttemptsLeft}
          selectedCardFit={race.selectedCardFit}
          selectedCardId={race.selectedCardId}
          championshipRecordTab={championshipRecordTab}
          playerResult={race.playerResult}
          consumedCardIds={race.consumedCardIds}
          forecastPick={race.forecastPick}
          isResolved={race.isResolved}
          garagePanel={garagePanel}
          adminView={adminView}
          chronoReport={race.chronoReport}
          qualifyingLockedCardId={race.qualifyingLockedCardId}
          qualifyingReplayOpen={Boolean(race.currentQualifyingResult)}
          profileIsAdmin={profileIsAdmin}
          primaryCommand={primaryCommand}
          setResultTab={setResultTab}
          setResultOpen={setResultOpen}
          closeHistoryReplay={closeHistoryReplay}
          setDirectiveStep={setDirectiveStep}
          setForm={setForm}
          setGameView={setGameView}
          setPlanSubscreen={setPlanSubscreen}
          openQualifyingRun={openQualifyingRun}
          openQualifyingHistory={openQualifyingHistory}
          openHistoryReplay={openHistoryReplay}
          setSeasonRecapSeason={setSeasonRecapSeason}
          setChampionshipRecordTab={setChampionshipRecordTab}
          buyCard={buyCard}
          sellCard={sellCard}
          buyCarAsset={buyCarAsset}
          setGaragePanel={setGaragePanel}
          updateLivery={updateLivery}
          updateTeamName={updateTeamName}
        />
        {gameView === "drive" && !historyReplay && (race.currentQualifyingResult || !race.result || !resultOpen) ? (
          <DriveView
            state={leagueState}
            result={race.currentQualifyingResult ? null : race.result}
            currentQualifyingResult={race.currentQualifyingResult}
            currentCircuit={race.currentCircuit}
            qualifyingReplayCircuit={race.qualifyingReplayCircuit}
            playerTeam={race.playerTeam}
            mapPlan={race.mapPlan}
            directiveTraitImpacts={race.directiveTraitImpacts}
            replayTraitImpacts={race.replayTraitImpacts}
            forecastPick={race.forecastPick}
            raceDayPhase={race.raceDayPhase}
            qualifyingAttemptsUsed={race.qualifyingAttemptsUsed}
            qualifyingAttemptLimit={race.qualifyingAttemptLimit}
            qualifyingAttemptsLeft={race.qualifyingAttemptsLeft}
            qualifyingPanelOpen={qualifyingPanelOpen}
            qualifyingLeaderboard={race.qualifyingLeaderboard}
            qualifyingReplayEntries={race.qualifyingReplayEntries}
            primaryCommandClass={primaryCommandClass}
            primaryCommand={primaryCommand}
            deskState={race.deskState}
            preferencesResetSignal={preferencesResetSignal}
            qualifyingReplayInitialLap={qualifyingReplayInitialLap}
            setQualifyingPanelOpen={setQualifyingPanelOpen}
            setQualifyingResult={setQualifyingResult}
            onOpenQualifyingRun={() => openQualifyingRun({ confirm: true })}
            setPlanSubscreen={setPlanSubscreen}
            setGameView={setGameView}
            markCommandClicked={markCommandClicked}
          />
        ) : null}
      </section>

      {notificationStack}
      {overlays}
    </main>
  );
}
