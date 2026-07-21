import type { AdminUser, FormState, LeagueState, ProfileSession } from "./types.js";
import type { PlanRiskRead } from "./raceFlow.js";
import type { CityCircuit } from "./circuits.js";
import type { Translator } from "./helpers.js";
import type { OnboardingHelpTopic } from "./OnboardingShell.js";
import { LeagueIntroModal, OnboardingHelpModal } from "./OnboardingShell.js";
import {
  AdminDeleteUserModal,
  ConfirmActionModal,
  LeagueControlsModal,
  NextGrandPrixConfirmModal,
  ProfileCodeModal,
  ResolveGrandPrixConfirmModal,
  RestartConfirmModal,
  SeasonRecapModal
} from "./AppModals.js";
import { MapPlanPanel } from "../features/MapPlanPanel.js";
import { PlanRiskSummary } from "../features/PlanRiskSummary.js";

type SeasonRecap = Parameters<typeof SeasonRecapModal>[0]["recap"];
type StartingGridEntry = Parameters<typeof ResolveGrandPrixConfirmModal>[0]["startingGridEntries"][number];

export function AppOverlays({
  profileSession,
  profileCodeOpen,
  profileLogoutOpen,
  preferencesResetOpen,
  technicalError,
  directiveConfirmOpen,
  resolveConfirmOpen,
  qualifyingConfirmOpen,
  nextGrandPrixConfirmOpen,
  leagueControlsOpen,
  restartConfirmOpen,
  onboardingHelp,
  adminDeleteUser,
  seasonRecap,
  playerTeamId,
  form,
  leagueState,
  status,
  pendingMessage,
  qualifyingAttemptsUsed,
  qualifyingAttemptsLeft,
  qualifyingAttemptLimit,
  planRiskRead,
  currentCircuit,
  forecastPick,
  startingGridEntries,
  startingGridExpanded,
  isSeasonFinalGrandPrix,
  nextGrandPrixActionLabel,
  hasResult,
  tt,
  setForm,
  onCopyProfileCode,
  onForgetProfile,
  onResetUiPreferences,
  onCopyTechnicalError,
  onSubmitDirectiveConfirmed,
  onEditPlan,
  onOpenChronoPlan,
  onResolveGrandPrix,
  onStartQualifyingRunConfirmed,
  onStartNextGrandPrix,
  onOpenResultReport,
  onUpdateSettings,
  onForgetPlayer,
  onRestartLeague,
  onCloseOnboardingHelp,
  onCloseAdminDelete,
  onDeleteAdminUser,
  onCloseProfileCode,
  onCloseProfileLogout,
  onClosePreferencesReset,
  onCloseTechnicalError,
  onCloseDirectiveConfirm,
  onCloseResolveConfirm,
  onShowFullGrid,
  onCloseQualifyingConfirm,
  onCloseNextGrandPrixConfirm,
  onCloseSeasonRecap,
  onCloseLeagueControls,
  onOpenRestartConfirm,
  onCloseRestartConfirm
}: {
  profileSession: ProfileSession | null;
  profileCodeOpen: boolean;
  profileLogoutOpen: boolean;
  preferencesResetOpen: boolean;
  technicalError: string | null;
  directiveConfirmOpen: boolean;
  resolveConfirmOpen: boolean;
  qualifyingConfirmOpen: boolean;
  nextGrandPrixConfirmOpen: boolean;
  leagueControlsOpen: boolean;
  restartConfirmOpen: boolean;
  onboardingHelp: OnboardingHelpTopic | null;
  adminDeleteUser: AdminUser | null;
  seasonRecap: SeasonRecap | undefined;
  playerTeamId: string | undefined;
  form: FormState;
  leagueState: LeagueState | null;
  status: "idle" | "loading" | "error";
  pendingMessage: string | null;
  qualifyingAttemptsUsed: number;
  qualifyingAttemptsLeft: number;
  qualifyingAttemptLimit: number;
  planRiskRead: PlanRiskRead;
  currentCircuit: CityCircuit;
  forecastPick: string;
  startingGridEntries: StartingGridEntry[];
  startingGridExpanded: boolean;
  isSeasonFinalGrandPrix: boolean;
  nextGrandPrixActionLabel: string;
  hasResult: boolean;
  tt: Translator;
  setForm: (form: FormState) => void;
  onCopyProfileCode: () => void;
  onForgetProfile: () => void;
  onResetUiPreferences: () => void;
  onCopyTechnicalError: () => void;
  onSubmitDirectiveConfirmed: () => void;
  onEditPlan: () => void;
  onOpenChronoPlan: () => void;
  onResolveGrandPrix: () => void;
  onStartQualifyingRunConfirmed: () => void;
  onStartNextGrandPrix: () => void;
  onOpenResultReport: () => void;
  onUpdateSettings: () => void;
  onForgetPlayer: () => void;
  onRestartLeague: () => void;
  onCloseOnboardingHelp: (topic: OnboardingHelpTopic, dismiss: boolean) => void;
  onCloseAdminDelete: () => void;
  onDeleteAdminUser: () => void;
  onCloseProfileCode: () => void;
  onCloseProfileLogout: () => void;
  onClosePreferencesReset: () => void;
  onCloseTechnicalError: () => void;
  onCloseDirectiveConfirm: () => void;
  onCloseResolveConfirm: () => void;
  onShowFullGrid: () => void;
  onCloseQualifyingConfirm: () => void;
  onCloseNextGrandPrixConfirm: () => void;
  onCloseSeasonRecap: () => void;
  onCloseLeagueControls: () => void;
  onOpenRestartConfirm: () => void;
  onCloseRestartConfirm: () => void;
}) {
  const playerTeam = leagueState?.teams.find((team) => team.id === playerTeamId);
  const hasUnusedCard = Boolean(playerTeam?.cards.length && !form.cardId);
  const directiveConfirmBody = (
    <span className="directive-confirm-summary">
      <span>{qualifyingAttemptsUsed === 0 ? tt("directive_confirm_no_qualifying") : qualifyingAttemptsLeft > 0 ? `${tt("directive_confirm_remaining")} ${qualifyingAttemptsLeft}/${qualifyingAttemptLimit}` : tt("directive_confirm_ready")}</span>
      <MapPlanPanel className="directive-confirm-plan" decision={{ approach: form.approach, preparation: form.preparation, pitStrategy: form.pitStrategy, cardId: form.cardId || undefined }} tt={tt} />
      <PlanRiskSummary read={planRiskRead} tt={tt} compact />
      {hasUnusedCard ? <strong>{tt("directive_confirm_unused_card_warning")}</strong> : null}
    </span>
  );
  const currentPlan = { approach: form.approach, preparation: form.preparation, pitStrategy: form.pitStrategy, cardId: form.cardId || undefined };
  const qualifyingConfirmBody = (
    <span className="directive-confirm-summary">
      <span>{`${tt("qualifying_confirm_body")} ${tt("qualifying_remaining")} ${qualifyingAttemptsLeft}/${qualifyingAttemptLimit}`}</span>
      <MapPlanPanel className="directive-confirm-plan" decision={currentPlan} tt={tt} />
    </span>
  );

  return (
    <>
      {onboardingHelp ? (
        onboardingHelp === "leagueIntro" ? (
          <LeagueIntroModal onClose={(dismiss) => onCloseOnboardingHelp(onboardingHelp, dismiss)} tt={tt} />
        ) : (
          <OnboardingHelpModal topic={onboardingHelp} recoveryCode={onboardingHelp === "profileCode" ? profileSession?.recoveryCode : undefined} onClose={(dismiss) => onCloseOnboardingHelp(onboardingHelp, dismiss)} tt={tt} />
        )
      ) : null}
      {profileCodeOpen ? <ProfileCodeModal profileSession={profileSession} tt={tt} onClose={onCloseProfileCode} onCopy={onCopyProfileCode} /> : null}
      {profileLogoutOpen ? <ConfirmActionModal label={tt("profile_logout_title")} image="/assets/crl/profile-arrival.png" kicker={tt("profile_kicker")} title={tt("profile_logout_title")} body={tt("profile_logout_confirm")} actionLabel={tt("action_forget_profile")} status={status} danger tt={tt} onClose={onCloseProfileLogout} onConfirm={onForgetProfile} /> : null}
      {preferencesResetOpen ? <ConfirmActionModal label={tt("preferences_reset_title")} image="/assets/crl/profile-arrival.png" kicker={tt("profile_kicker")} title={tt("preferences_reset_title")} body={tt("preferences_reset_confirm")} actionLabel={tt("action_reset_ui_preferences")} status={status} danger tt={tt} onClose={onClosePreferencesReset} onConfirm={onResetUiPreferences} /> : null}
      {technicalError ? <ConfirmActionModal label={tt("error_modal_title")} image="/assets/crl/pit-wall-mobile.png" kicker={tt("error_modal_kicker")} title={tt("error_modal_title")} body={tt("error_modal_body")} actionLabel={tt("action_copy_error")} status={status} tt={tt} onClose={onCloseTechnicalError} onConfirm={onCopyTechnicalError} /> : null}
      {adminDeleteUser ? <AdminDeleteUserModal user={adminDeleteUser} tt={tt} onClose={onCloseAdminDelete} onDelete={onDeleteAdminUser} /> : null}
      {directiveConfirmOpen ? <ConfirmActionModal label={tt("directive_confirm_title")} image="/assets/crl/send-plan-modal.png" kicker={tt("qualifying_kicker")} title={tt("directive_confirm_title")} body={directiveConfirmBody} actionLabel={tt("action_submit_directive")} secondaryActionLabel={tt("action_modify_plan")} extraActionLabel={tt("plan_subscreen_chrono")} status={status} pendingMessage={pendingMessage} tt={tt} onClose={onCloseDirectiveConfirm} onSecondaryAction={onEditPlan} onExtraAction={onOpenChronoPlan} onConfirm={onSubmitDirectiveConfirmed} /> : null}
      {resolveConfirmOpen ? <ResolveGrandPrixConfirmModal currentCircuit={currentCircuit} forecastPick={forecastPick} playerTeamId={playerTeamId} startingGridEntries={startingGridEntries} status={status} pendingMessage={pendingMessage} startingGridExpanded={startingGridExpanded} tt={tt} onClose={onCloseResolveConfirm} onShowFullGrid={onShowFullGrid} onResolve={onResolveGrandPrix} /> : null}
      {qualifyingConfirmOpen ? <ConfirmActionModal label={tt("qualifying_confirm_title")} image="/assets/crl/qualifying-modal.png" kicker={tt("qualifying_kicker")} title={tt("qualifying_confirm_title")} body={qualifyingConfirmBody} actionLabel={tt("action_qualifying")} secondaryActionLabel={tt("action_modify_plan")} status={status} pendingMessage={pendingMessage} tt={tt} onClose={onCloseQualifyingConfirm} onSecondaryAction={onEditPlan} onConfirm={onStartQualifyingRunConfirmed} /> : null}
      {nextGrandPrixConfirmOpen ? <NextGrandPrixConfirmModal isSeasonFinalGrandPrix={isSeasonFinalGrandPrix} nextGrandPrixActionLabel={nextGrandPrixActionLabel} status={status} pendingMessage={pendingMessage} hasResult={hasResult} tt={tt} onClose={onCloseNextGrandPrixConfirm} onStartNextGrandPrix={onStartNextGrandPrix} onOpenReport={onOpenResultReport} /> : null}
      {seasonRecap ? <SeasonRecapModal recap={seasonRecap} playerTeamId={playerTeamId} tt={tt} onClose={onCloseSeasonRecap} /> : null}
      {leagueControlsOpen && leagueState ? (
        <LeagueControlsModal form={form} status={status} pendingMessage={pendingMessage} hasPlayer={Boolean(leagueState.player)} tt={tt} setForm={setForm} onClose={onCloseLeagueControls} onUpdateSettings={onUpdateSettings} onForgetPlayer={onForgetPlayer} onOpenRestartConfirm={onOpenRestartConfirm} />
      ) : null}
      {restartConfirmOpen ? <RestartConfirmModal status={status} pendingMessage={pendingMessage} tt={tt} onClose={onCloseRestartConfirm} onRestart={onRestartLeague} /> : null}
    </>
  );
}
