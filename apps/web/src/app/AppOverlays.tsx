import type { AdminUser, FormState, LeagueState, ProfileSession } from "./types.js";
import { useT } from "../i18n/index.js";
import type { PlanRiskRead } from "./raceFlow.js";
import type { CityCircuit } from "./circuits.js";
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
  soloResetOpen,
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
  setForm,
  onCopyProfileCode,
  onForgetProfile,
  onResetUiPreferences,
  onResetSolo,
  onCopyTechnicalError,
  onSubmitDirectiveConfirmed,
  onEditPlan,
  onOpenChronoPlan,
  onResolveGrandPrix,
  onStartQualifyingRunConfirmed,
  onStartNextGrandPrix,
  onOpenResultReport,
  onUpdateSettings,
  onSendPlanReminders,
  onForgetPlayer,
  onRestartLeague,
  onCloseOnboardingHelp,
  onCloseAdminDelete,
  onDeleteAdminUser,
  onCloseProfileCode,
  onCloseProfileLogout,
  onCloseSoloReset,
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
  soloResetOpen: boolean;
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
  setForm: (form: FormState) => void;
  onCopyProfileCode: () => void;
  onForgetProfile: () => void;
  onResetUiPreferences: () => void;
  onResetSolo: () => void;
  onCopyTechnicalError: () => void;
  onSubmitDirectiveConfirmed: () => void;
  onEditPlan: () => void;
  onOpenChronoPlan: () => void;
  onResolveGrandPrix: () => void;
  onStartQualifyingRunConfirmed: () => void;
  onStartNextGrandPrix: () => void;
  onOpenResultReport: () => void;
  onUpdateSettings: () => void;
  onSendPlanReminders: () => void;
  onForgetPlayer: () => void;
  onRestartLeague: () => void;
  onCloseOnboardingHelp: (topic: OnboardingHelpTopic, dismiss: boolean) => void;
  onCloseAdminDelete: () => void;
  onDeleteAdminUser: (confirmation: string) => void;
  onCloseProfileCode: () => void;
  onCloseProfileLogout: () => void;
  onCloseSoloReset: () => void;
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
  const tt = useT();
  const playerTeam = leagueState?.teams.find((team) => team.id === playerTeamId);
  const hasUnusedCard = Boolean(playerTeam?.cards.length && !form.cardId);
  const directiveConfirmBody = (
    <span className="directive-confirm-summary">
      <span>{qualifyingAttemptsUsed === 0 ? tt("directive_confirm_no_qualifying") : qualifyingAttemptsLeft > 0 ? `${tt("directive_confirm_remaining")} ${qualifyingAttemptsLeft}/${qualifyingAttemptLimit}` : tt("directive_confirm_ready")}</span>
      <MapPlanPanel className="directive-confirm-plan" decision={{ approach: form.approach, preparation: form.preparation, pitStrategy: form.pitStrategy, cardId: form.cardId || undefined }} />
      <PlanRiskSummary read={planRiskRead} compact />
      {hasUnusedCard ? <strong>{tt("directive_confirm_unused_card_warning")}</strong> : null}
    </span>
  );
  const currentPlan = { approach: form.approach, preparation: form.preparation, pitStrategy: form.pitStrategy, cardId: form.cardId || undefined };
  const defaultPlanTeamNames = leagueState
    ? leagueState.teams
        .filter((team) => team.kind === "human" && leagueState.actionState.missingTeamIds.includes(team.id))
        .map((team) => team.name)
    : [];
  const qualifyingConfirmBody = (
    <span className="directive-confirm-summary">
      <span>{`${tt("qualifying_confirm_body")} ${tt("qualifying_remaining")} ${qualifyingAttemptsLeft}/${qualifyingAttemptLimit}`}</span>
      <MapPlanPanel className="directive-confirm-plan" decision={currentPlan} />
      <PlanRiskSummary read={planRiskRead} compact />
    </span>
  );

  return (
    <>
      {onboardingHelp ? (
        onboardingHelp === "leagueIntro" ? (
          <LeagueIntroModal onClose={(dismiss) => onCloseOnboardingHelp(onboardingHelp, dismiss)} />
        ) : (
          <OnboardingHelpModal topic={onboardingHelp} recoveryCode={onboardingHelp === "profileCode" ? profileSession?.recoveryCode : undefined} onClose={(dismiss) => onCloseOnboardingHelp(onboardingHelp, dismiss)} />
        )
      ) : null}
      {profileCodeOpen ? <ProfileCodeModal profileSession={profileSession} onClose={onCloseProfileCode} onCopy={onCopyProfileCode} /> : null}
      {profileLogoutOpen ? <ConfirmActionModal label={tt("profile_logout_title")} image="/assets/crl/danger-reset.webp" kicker={tt("profile_kicker")} title={tt("profile_logout_title")} body={tt("profile_logout_confirm")} actionLabel={tt("action_forget_profile")} status={status} danger onClose={onCloseProfileLogout} onConfirm={onForgetProfile} /> : null}
      {soloResetOpen ? <ConfirmActionModal label={tt("solo_reset_title")} image="/assets/crl/danger-reset.webp" kicker={tt("mode_badge_solo_local")} title={tt("solo_reset_title")} body={tt("solo_reset_confirm")} actionLabel={tt("action_reset_solo")} status={status} danger onClose={onCloseSoloReset} onConfirm={onResetSolo} /> : null}
      {preferencesResetOpen ? <ConfirmActionModal label={tt("preferences_reset_title")} image="/assets/crl/danger-reset.webp" kicker={tt("profile_kicker")} title={tt("preferences_reset_title")} body={tt("preferences_reset_confirm")} actionLabel={tt("action_reset_ui_preferences")} status={status} danger onClose={onClosePreferencesReset} onConfirm={onResetUiPreferences} /> : null}
      {technicalError ? <ConfirmActionModal label={tt("error_modal_title")} image="/assets/crl/pit-wall-mobile.webp" kicker={tt("error_modal_kicker")} title={tt("error_modal_title")} body={tt("error_modal_body")} actionLabel={tt("action_copy_error")} status={status} onClose={onCloseTechnicalError} onConfirm={onCopyTechnicalError} /> : null}
      {adminDeleteUser ? <AdminDeleteUserModal user={adminDeleteUser} onClose={onCloseAdminDelete} onDelete={onDeleteAdminUser} /> : null}
      {directiveConfirmOpen ? <ConfirmActionModal label={tt("directive_confirm_title")} testId="dialog-send-plan" image="/assets/crl/send-plan-modal.webp" kicker={tt("qualifying_kicker")} title={tt("directive_confirm_title")} body={directiveConfirmBody} actionLabel={tt("directive_confirm_action")} secondaryActionLabel={tt("action_modify_plan")} extraActionLabel={tt("plan_subscreen_chrono")} status={status} pendingMessage={pendingMessage} onClose={onCloseDirectiveConfirm} onSecondaryAction={onEditPlan} onExtraAction={onOpenChronoPlan} onConfirm={onSubmitDirectiveConfirmed} /> : null}
      {resolveConfirmOpen ? <ResolveGrandPrixConfirmModal currentCircuit={currentCircuit} forecastPick={forecastPick} playerTeamId={playerTeamId} defaultPlanTeamNames={defaultPlanTeamNames} startingGridEntries={startingGridEntries} status={status} pendingMessage={pendingMessage} startingGridExpanded={startingGridExpanded} onClose={onCloseResolveConfirm} onShowFullGrid={onShowFullGrid} onResolve={onResolveGrandPrix} /> : null}
      {qualifyingConfirmOpen ? <ConfirmActionModal label={tt("qualifying_confirm_title")} testId="dialog-run-chrono" image="/assets/crl/qualifying-modal.webp" kicker={tt("qualifying_kicker")} title={tt("qualifying_confirm_title")} body={qualifyingConfirmBody} actionLabel={tt("action_qualifying")} secondaryActionLabel={tt("action_modify_plan")} status={status} pendingMessage={pendingMessage} onClose={onCloseQualifyingConfirm} onSecondaryAction={onEditPlan} onConfirm={onStartQualifyingRunConfirmed} /> : null}
      {nextGrandPrixConfirmOpen ? <NextGrandPrixConfirmModal isSeasonFinalGrandPrix={isSeasonFinalGrandPrix} nextGrandPrixActionLabel={nextGrandPrixActionLabel} status={status} pendingMessage={pendingMessage} hasResult={hasResult} onClose={onCloseNextGrandPrixConfirm} onStartNextGrandPrix={onStartNextGrandPrix} onOpenReport={onOpenResultReport} /> : null}
      {seasonRecap ? <SeasonRecapModal recap={seasonRecap} playerTeamId={playerTeamId} onClose={onCloseSeasonRecap} /> : null}
      {leagueControlsOpen && leagueState ? (
        <LeagueControlsModal form={form} leagueState={leagueState} status={status} pendingMessage={pendingMessage} hasPlayer={Boolean(leagueState.player)} setForm={setForm} onClose={onCloseLeagueControls} onUpdateSettings={onUpdateSettings} onSendPlanReminders={onSendPlanReminders} onForgetPlayer={onForgetPlayer} onOpenRestartConfirm={onOpenRestartConfirm} />
      ) : null}
      {restartConfirmOpen ? <RestartConfirmModal status={status} pendingMessage={pendingMessage} onClose={onCloseRestartConfirm} onRestart={onRestartLeague} /> : null}
    </>
  );
}
