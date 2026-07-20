import type { CardId, QualifyingRun } from "@cr-league/shared";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { TranslationKey } from "../i18n/index.js";
import { GameTopbar } from "./AppChrome.js";
import type { ChampionshipRecordTab } from "../features/ChampionshipView.js";
import type { DirectiveStep } from "../features/DirectivePanel.js";
import type { CardPanel } from "../features/GarageView.js";
import { DriveView } from "./DriveView.js";
import { GameViews } from "./GameViews.js";
import { SetupGate } from "./SetupGate.js";
import type { ProfileMode, SetupMode } from "./SetupViews.js";
import type { FormState, GameView, LeagueState, ProfileSession } from "./types.js";
import type { CommandClick } from "./useCommandClicks.js";
import type { useRaceDerivations } from "./useRaceDerivations.js";

type RaceDerivations = ReturnType<typeof useRaceDerivations>;
type ResultTab = "replay" | "report";
type PlanSubscreen = "plan" | "chrono";

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
  message,
  profileMode,
  profileForm,
  profileFormError,
  leagueFormError,
  setupMode,
  savedClaims,
  savedLeagueIndex,
  status,
  pendingMessage,
  resultTab,
  resultOpen,
  historyReplay,
  profileIsAdmin,
  preferencesResetSignal,
  qualifyingPanelOpen,
  commandClicks,
  primaryCommandClass,
  primaryCommand,
  race,
  planSubscreen,
  directiveStep,
  championshipRecordTab,
  garagePanel,
  showCarriedOverPlanLabel,
  gameProfileMenu,
  setForm,
  setProfileMode,
  setProfileForm,
  setProfileFormError,
  setLeagueFormError,
  setSetupMode,
  setSavedLeagueIndex,
  setResultTab,
  setResultOpen,
  setDirectiveStep,
  setGameView,
  setPlanSubscreen,
  setQualifyingResult,
  setSeasonRecapSeason,
  setChampionshipRecordTab,
  setGaragePanel,
  setQualifyingPanelOpen,
  createProfileSession,
  recoverProfileSession,
  requestRecoveryCode,
  createLeague,
  joinLeague,
  switchLeague,
  closeHistoryReplay,
  openHistoryReplay,
  buyCard,
  sellCard,
  updateLivery,
  updateTeamName,
  clearTransientNotifications,
  clearScreenOnboardingSnoozes,
  markCommandClicked,
  openQualifyingRun,
  openLastQualifyingRun,
  goHome,
  backToAdminConsole,
  tt
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
  message: string;
  profileMode: ProfileMode;
  profileForm: { email: string; recoveryCode: string };
  profileFormError: string | null;
  leagueFormError: string | null;
  setupMode: SetupMode;
  savedClaims: ProfileSession["teams"];
  savedLeagueIndex: number;
  status: "idle" | "loading" | "error";
  pendingMessage: string | null;
  resultTab: ResultTab;
  resultOpen: boolean;
  historyReplay: LeagueState["grandPrixHistory"][number] | null;
  profileIsAdmin: boolean;
  preferencesResetSignal: number;
  qualifyingPanelOpen: boolean;
  commandClicks: Record<CommandClick, boolean>;
  primaryCommandClass: string;
  primaryCommand: { label: string; action: () => void | Promise<void>; disabled: boolean };
  race: RaceDerivations;
  planSubscreen: PlanSubscreen;
  directiveStep: DirectiveStep;
  championshipRecordTab: ChampionshipRecordTab;
  garagePanel: CardPanel;
  showCarriedOverPlanLabel: boolean;
  gameProfileMenu: ReactNode;
  setForm: Dispatch<SetStateAction<FormState>>;
  setProfileMode: Dispatch<SetStateAction<ProfileMode>>;
  setProfileForm: Dispatch<SetStateAction<{ email: string; recoveryCode: string }>>;
  setProfileFormError: Dispatch<SetStateAction<string | null>>;
  setLeagueFormError: Dispatch<SetStateAction<string | null>>;
  setSetupMode: Dispatch<SetStateAction<SetupMode>>;
  setSavedLeagueIndex: Dispatch<SetStateAction<number>>;
  setResultTab: (tab: ResultTab) => void;
  setResultOpen: (open: boolean) => void;
  setDirectiveStep: (step: DirectiveStep) => void;
  setGameView: (view: GameView) => void;
  setPlanSubscreen: (screen: PlanSubscreen) => void;
  setQualifyingResult: (result: QualifyingRun | null) => void;
  setSeasonRecapSeason: Dispatch<SetStateAction<number | null>>;
  setChampionshipRecordTab: (tab: ChampionshipRecordTab) => void;
  setGaragePanel: (panel: CardPanel) => void;
  setQualifyingPanelOpen: (open: boolean) => void;
  createProfileSession: () => void;
  recoverProfileSession: () => void;
  requestRecoveryCode: () => void;
  createLeague: () => void;
  joinLeague: () => void;
  switchLeague: (teamId: string) => void;
  closeHistoryReplay: () => void;
  openHistoryReplay: (grandPrix: LeagueState["grandPrixHistory"][number]) => void;
  buyCard: (cardId: CardId) => void;
  sellCard: (cardId: CardId) => void;
  updateLivery: (livery: LeagueState["teams"][number]["livery"]) => void;
  updateTeamName: (name: string) => void;
  clearTransientNotifications: () => void;
  clearScreenOnboardingSnoozes: () => void;
  markCommandClicked: (command: CommandClick) => void;
  openQualifyingRun: () => void;
  openLastQualifyingRun: () => void;
  goHome: () => void;
  backToAdminConsole: () => void;
  tt: (key: TranslationKey, params?: Record<string, string | number>) => string;
}) {
  if (!profileSession || !leagueState) {
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
        message={message}
        profileMode={profileMode}
        profileForm={profileForm}
        profileFormError={profileFormError}
        leagueFormError={leagueFormError}
        setupMode={setupMode}
        savedClaims={savedClaims}
        savedLeagueIndex={savedLeagueIndex}
        status={status}
        pendingMessage={pendingMessage}
        setForm={setForm}
        setProfileMode={setProfileMode}
        setProfileForm={setProfileForm}
        setProfileFormError={setProfileFormError}
        setLeagueFormError={setLeagueFormError}
        setSetupMode={setSetupMode}
        setSavedLeagueIndex={setSavedLeagueIndex}
        createProfileSession={createProfileSession}
        recoverProfileSession={recoverProfileSession}
        requestRecoveryCode={requestRecoveryCode}
        createLeague={createLeague}
        joinLeague={joinLeague}
        switchLeague={switchLeague}
        tt={tt}
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
      <GameTopbar leagueName={leagueState.league.name} gameView={gameView} profileMenu={gameProfileMenu} tt={tt} onHome={goHome} onSelectView={selectGameView} />

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
          qualifyingAttemptLimit={race.qualifyingAttemptLimit}
          qualifyingAttemptsLeft={race.qualifyingAttemptsLeft}
          selectedCardFit={race.selectedCardFit}
          selectedCardId={race.selectedCardId}
          championshipRecordTab={championshipRecordTab}
          playerResult={race.playerResult}
          consumedCardIds={race.consumedCardIds}
          forecastPick={race.forecastPick}
          isResolved={race.isResolved}
          pendingMessage={pendingMessage}
          garagePanel={garagePanel}
          showCarriedOverPlanLabel={showCarriedOverPlanLabel}
          adminView={adminView}
          chronoReport={race.chronoReport}
          qualifyingLockedCardId={race.qualifyingLockedCardId}
          profileIsAdmin={profileIsAdmin}
          setResultTab={setResultTab}
          setResultOpen={setResultOpen}
          closeHistoryReplay={closeHistoryReplay}
          setDirectiveStep={setDirectiveStep}
          setForm={setForm}
          setGameView={setGameView}
          setPlanSubscreen={setPlanSubscreen}
          setQualifyingResult={setQualifyingResult}
          openHistoryReplay={openHistoryReplay}
          setSeasonRecapSeason={setSeasonRecapSeason}
          setChampionshipRecordTab={setChampionshipRecordTab}
          buyCard={buyCard}
          sellCard={sellCard}
          setGaragePanel={setGaragePanel}
          updateLivery={updateLivery}
          updateTeamName={updateTeamName}
          tt={tt}
        />
        {gameView === "drive" && !historyReplay && (!race.result || !resultOpen) ? (
          <DriveView
            state={leagueState}
            result={race.result}
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
            commandClicks={commandClicks}
            primaryCommandClass={primaryCommandClass}
            primaryCommand={primaryCommand}
            deskState={race.deskState}
            lastQualifyingRun={race.lastQualifyingRun}
            qualifyingDisabled={race.qualifyingDisabled}
            pendingMessage={pendingMessage}
            preferencesResetSignal={preferencesResetSignal}
            setQualifyingPanelOpen={setQualifyingPanelOpen}
            setQualifyingResult={setQualifyingResult}
            setPlanSubscreen={setPlanSubscreen}
            setGameView={setGameView}
            setResultTab={setResultTab}
            setResultOpen={setResultOpen}
            markCommandClicked={markCommandClicked}
            openQualifyingRun={openQualifyingRun}
            openLastQualifyingRun={openLastQualifyingRun}
            tt={tt}
          />
        ) : null}
      </section>

      {notificationStack}
      {overlays}
    </main>
  );
}
