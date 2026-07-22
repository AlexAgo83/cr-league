import { type QualifyingRun } from "@cr-league/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { isLocale, t, type Locale, type TranslationKey } from "../i18n/index.js";
import { type LeagueState, type ProfileSession } from "./types.js";
import { AdminConsoleView } from "../features/AdminConsoleView.js";
import { DIRECTIVE_STEP_KEY } from "../features/DirectivePanel.js";
import { DISMISSED_REPLAY_HELP_KEY, REPLAY_FOCUS_KEY, REPLAY_SPEED_KEY } from "../features/ReplayView.js";
import type { ResultTab } from "../features/ResultView.js";
import { LanguageSwitcher, NotificationStack, ProfileMenu, SetupTopbar } from "./AppChrome.js";
import { AppOverlays } from "./AppOverlays.js";
import { ONBOARDING_HELP_KEYS, SCREEN_ONBOARDING_HELP_TOPICS, type OnboardingHelpTopic } from "./OnboardingShell.js";
import {
  ACTIVE_PLAYER_CLAIM_KEY,
  ApiError,
  LANGUAGE_KEY,
  SEASON_RECAP_KEY_PREFIX,
  getActiveClaim,
  loadPlayerClaims,
  loadProfileEmail,
  loadProfileSession,
  seasonRecapStorageKey,
} from "./appStorage.js";
import { AppShell } from "./AppShell.js";
import { rememberPlayerClaim, withCurrentPlayer as restoreCurrentPlayer, withoutPlayerClaim } from "./claimHelpers.js";
import { createProfileActions } from "./profileActions.js";
import { createRaceActions } from "./raceActions.js";
import { isGrandPrixRouteId, isStartPath, shortGrandPrixId } from "./routes.js";
import { createSessionActions } from "./sessionActions.js";
import { type ProfileMode, type SetupMode } from "./SetupViews.js";
import { createLeagueMutations } from "./leagueMutations.js";
import { useAppNavigation } from "./useAppNavigation.js";
import { useCommandClicks } from "./useCommandClicks.js";
import { useAdminPanel } from "./useAdminPanel.js";
import { useNotifications, type Notification } from "./useNotifications.js";
import { usePlanForm } from "./usePlanForm.js";
import { useRaceDerivations } from "./useRaceDerivations.js";
import { CHAMPIONSHIP_RECORD_TAB_KEY, GARAGE_PANEL_KEY } from "./viewPreferences.js";

const UI_PREFERENCE_KEYS = [
  DISMISSED_REPLAY_HELP_KEY,
  REPLAY_SPEED_KEY,
  REPLAY_FOCUS_KEY,
  GARAGE_PANEL_KEY,
  CHAMPIONSHIP_RECORD_TAB_KEY,
  DIRECTIVE_STEP_KEY,
  "cr-league-card-consumption-help",
  "cr-league-card-consumption-help-v2",
  ...Object.values(ONBOARDING_HELP_KEYS)
] as const;
const LEAGUE_SCOPED_HELP_TOPICS = new Set<OnboardingHelpTopic>(["leagueIntro", "race", "plan", "garage"]);

function initialLocale() {
  const saved = localStorage.getItem(LANGUAGE_KEY);
  if (isLocale(saved)) return saved;
  const browserLocale = navigator.language.split("-")[0] ?? "en";
  return isLocale(browserLocale) ? browserLocale : "en";
}

export function App() {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [entered, setEntered] = useState(() => !isStartPath(window.location.pathname));
  const tt = useCallback((key: TranslationKey, params?: Parameters<typeof t>[2]) => t(key, locale, params), [locale]);

  const changeLocale = useCallback((nextLocale: Locale) => {
    localStorage.setItem(LANGUAGE_KEY, nextLocale);
    setLocaleState(nextLocale);
  }, []);

  if (!entered) return <HomeSplash locale={locale} tt={tt} onChangeLocale={changeLocale} onEnter={() => setEntered(true)} />;
  return <GameApp locale={locale} onLocaleChange={changeLocale} />;
}

function HomeSplash({ locale, tt, onChangeLocale, onEnter }: { locale: Locale; tt: (key: TranslationKey) => string; onChangeLocale: (locale: Locale) => void; onEnter: () => void }) {
  return (
    <main className="home-splash" aria-label={tt("splash_label")}>
      <img className="home-splash-background" src="/assets/crl/home-background.jpg" alt="" />
      <SetupTopbar profileMenu={null} languageSwitcher={<LanguageSwitcher locale={locale} tt={tt} onChangeLocale={onChangeLocale} />} onHome={() => undefined} />
      <div className="home-splash-title" aria-hidden="true">
        <img className="home-splash-title-cr" src="/assets/crl/home-title-cr.png" alt="" />
        <img className="home-splash-title-league" src="/assets/crl/home-title-league.png" alt="" />
      </div>
      <button type="button" className="home-press-start" onClick={onEnter}>
        {tt("splash_press_start")}
      </button>
    </main>
  );
}

function GameApp({ locale, onLocaleChange }: { locale: Locale; onLocaleChange: (locale: Locale) => void }) {
  const [profileSession, setProfileSession] = useState<ProfileSession | null>(loadProfileSession);
  const [historyReplay, setHistoryReplay] = useState<LeagueState["grandPrixHistory"][number] | null>(null);
  const [resultTab, setResultTab] = useState<ResultTab>("replay");
  const [resultOpen, setResultOpen] = useState(false);
  const [leagueState, setLeagueState] = useState<LeagueState | null>(null);
  const clearRouteReplay = useCallback(() => setHistoryReplay(null), []);
  const activeReplayGrandPrixId =
    historyReplay ? shortGrandPrixId(historyReplay.id) : leagueState?.currentGrandPrix.result && resultOpen && resultTab === "replay" ? shortGrandPrixId(leagueState.currentGrandPrix.id) : undefined;
  const {
    gameView,
    planSubscreen,
    directiveStep,
    championshipRecordTab,
    garagePanel,
    setGameView,
    setPlanSubscreen,
    setDirectiveStep,
    setChampionshipRecordTab,
    setGaragePanel,
    routeReplayGrandPrixId,
    setRouteReplayGrandPrixId
  } = useAppNavigation(profileSession, clearRouteReplay, activeReplayGrandPrixId);
  const tt = useCallback((key: TranslationKey, params?: Parameters<typeof t>[2]) => t(key, locale, params), [locale]);
  const [profileMode, setProfileMode] = useState<ProfileMode>("choice");
  const [setupMode, setSetupMode] = useState<SetupMode>("choice");
  const [qualifyingConfirmOpen, setQualifyingConfirmOpen] = useState(false);
  const { commandClicks, markCommandClicked, resetCommandClicks } = useCommandClicks();
  const [qualifyingPanelOpen, setQualifyingPanelOpen] = useState(true);
  const [qualifyingResult, setQualifyingResult] = useState<QualifyingRun | null>(null);
  const [qualifyingReplayInitialLap, setQualifyingReplayInitialLap] = useState<number | undefined>();
  const [seasonRecapSeason, setSeasonRecapSeason] = useState<number | null>(null);
  const previousSeasonRef = useRef<number | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [preferencesResetSignal, setPreferencesResetSignal] = useState(0);
  const [preferencesResetOpen, setPreferencesResetOpen] = useState(false);
  const [profileCodeOpen, setProfileCodeOpen] = useState(false);
  const [profileLogoutOpen, setProfileLogoutOpen] = useState(false);
  const [directiveConfirmOpen, setDirectiveConfirmOpen] = useState(false);
  const [resolveConfirmOpen, setResolveConfirmOpen] = useState(false);
  const [startingGridExpanded, setStartingGridExpanded] = useState(false);
  const [nextGrandPrixConfirmOpen, setNextGrandPrixConfirmOpen] = useState(false);
  const [leagueControlsOpen, setLeagueControlsOpen] = useState(false);
  const [restartConfirmOpen, setRestartConfirmOpen] = useState(false);
  const [form, setForm] = usePlanForm(locale);
  const [profileForm, setProfileForm] = useState(() => ({ email: loadProfileEmail(), recoveryCode: "" }));
  const [savedClaims, setSavedClaims] = useState(loadPlayerClaims);
  const [savedLeagueIndex, setSavedLeagueIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState(() => t("status_initial", locale));
  const [technicalError, setTechnicalError] = useState<string | null>(null);
  const [profileFormError, setProfileFormError] = useState<string | null>(null);
  const [leagueFormError, setLeagueFormError] = useState<string | null>(null);
  const { notifications, pushNotification, clearTransientNotifications, dismissNotification } = useNotifications();
  const [onboardingHelp, setOnboardingHelp] = useState<OnboardingHelpTopic | null>(null);
  const pendingMessage = status === "loading" ? message : null;
  const snoozedOnboardingHelp = useRef(new Set<string>());
  const initialProfileSession = useRef(profileSession);
  const initialActiveClaim = useRef(getActiveClaim(savedClaims));
  const savedClaimsRef = useRef(savedClaims);
  const statusRef = useRef(status);
  const adminInspectingRef = useRef(false);
  const leagueStateRef = useRef(leagueState);
  const tabRefreshInFlight = useRef(false);
  const onboardingStorageKey = useCallback(
    (topic: OnboardingHelpTopic) => (LEAGUE_SCOPED_HELP_TOPICS.has(topic) && leagueState ? `${ONBOARDING_HELP_KEYS[topic]}:${leagueState.league.id}` : ONBOARDING_HELP_KEYS[topic]),
    [leagueState]
  );
  const openOnboardingHelp = useCallback(
    (topic: OnboardingHelpTopic) => {
      const key = onboardingStorageKey(topic);
      if (localStorage.getItem(key) || snoozedOnboardingHelp.current.has(key)) return;
      setOnboardingHelp(topic);
    },
    [onboardingStorageKey]
  );

  function showStatus(text: string, tone: Notification["tone"] = "info", notify = true) {
    setMessage(text);
    if (notify && text !== t("status_initial", locale)) pushNotification(text, tone);
  }

  function pushCommandHint(nextDeskState: "prepare" | "ready" | "resolved") {
    setMessage(t(`command_hint_${nextDeskState}` as TranslationKey, locale));
  }

  function clearScreenOnboardingSnoozes() {
    for (const topic of SCREEN_ONBOARDING_HELP_TOPICS) snoozedOnboardingHelp.current.delete(onboardingStorageKey(topic));
  }

  const {
    adminToken,
    adminTab,
    adminUsers,
    adminLeagues,
    adminUserQuery,
    adminLeagueQuery,
    adminUserPagination,
    adminLeaguePagination,
    adminRecoveryCode,
    adminDeleteUser,
    adminInspecting,
    setAdminToken,
    setAdminTab,
    setAdminDeleteUser,
    setAdminInspecting,
    openAdminConsole,
    refreshAdminData,
    resetAdminRecoveryCode,
    deleteAdminUserConfirmed,
    inspectAdminLeague,
    cleanupAdminTestData,
    searchAdminUsers,
    searchAdminLeagues,
    pageAdminUsers,
    pageAdminLeagues,
    setAdminUserQuery,
    setAdminLeagueQuery
  } = useAdminPanel({
    profileIsAdmin: Boolean(profileSession?.admin),
    run,
    tt,
    setProfileOpen,
    setGameView,
    setLeagueState,
    showStatus
  });

  useEffect(() => {
    setSavedLeagueIndex((index) => Math.min(index, Math.max(0, savedClaims.length - 1)));
  }, [savedClaims.length]);

  useEffect(() => {
    savedClaimsRef.current = savedClaims;
  }, [savedClaims]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    adminInspectingRef.current = adminInspecting;
  }, [adminInspecting]);

  useEffect(() => {
    leagueStateRef.current = leagueState;
  }, [leagueState]);

  useEffect(() => {
    if (!initialProfileSession.current) return;
    const saved = initialActiveClaim.current;
    if (!saved) return;
    void rejoinClaim(saved, { setDrive: false, notify: false });
    // The automatic rejoin intentionally uses the first local-storage snapshot only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const race = useRaceDerivations({ leagueState, adminInspecting, form, qualifyingResult, historyReplay, resultOpen, status, tt });
  const {
    playerTeam,
    playerDecision,
    lastQualifyingRun,
    qualifyingAttemptsUsed,
    qualifyingAttemptLimit,
    qualifyingAttemptsLeft,
    result,
    isResolved,
    qualifyingDisabled,
    forecastPick,
    selectedCardId,
    deskState,
    currentCircuit,
    currentGrandPrixKey,
    raceDayPhase,
    startingGridEntries,
    completedSeasons,
    isSeasonFinalGrandPrix
  } = race;
  const seasonRecap = seasonRecapSeason === null ? undefined : completedSeasons.find((season) => season.season === seasonRecapSeason);
  const nextGrandPrixActionLabel = tt(isSeasonFinalGrandPrix ? "action_finish_season" : "action_next_grand_prix");
  const { updateSettings, resolveGrandPrix, startNextGrandPrix, buyCard, sellCard, updateLivery, updateTeamName, restartLeague: restartLeagueState } = createLeagueMutations({
    leagueState,
    playerTeam,
    playerDecision,
    form,
    run,
    tt,
    setLeagueState,
    setGameView,
    setResultTab,
    setResultOpen,
    setResolveConfirmOpen,
    setNextGrandPrixConfirmOpen,
    setRouteReplayGrandPrixId,
    setHistoryReplay,
    showStatus,
    pushCommandHint,
    withCurrentPlayer,
    rememberPlayer
  });
  const { createProfileSession, recoverProfileSession, requestRecoveryCode } = createProfileActions({
    profileForm,
    run,
    tt,
    setProfileFormError,
    setProfileSession,
    setSavedClaims,
    setSetupMode,
    setProfileOpen,
    showStatus,
    openProfileCodeHelp: () => openOnboardingHelp("profileCode")
  });
  const { rejoinClaim, switchLeague, refreshProfileAdminStatus, goHome, addLeague, forgetPlayer, copyProfileCode, copyTechnicalError, forgetProfile } = createSessionActions({
    profileSession,
    leagueState,
    savedClaims,
    technicalError,
    initialStatusText: tt("status_initial"),
    run,
    tt,
    setProfileSession,
    setLeagueState,
    setAdminInspecting,
    setGameView,
    setSetupMode,
    setProfileOpen,
    setProfileMode,
    setProfileCodeOpen,
    setProfileLogoutOpen,
    setResultOpen,
    setSavedClaims,
    closeHistoryReplay,
    rememberPlayer,
    forgetClaim,
    showStatus,
    pushCommandHint
  });
  useEffect(() => {
    function refreshOnVisible() {
      if (document.visibilityState !== "visible" || statusRef.current === "loading" || adminInspectingRef.current || tabRefreshInFlight.current) return;
      if (!leagueStateRef.current?.player) return;
      const claim = getActiveClaim(savedClaimsRef.current);
      if (!claim) return;

      tabRefreshInFlight.current = true;
      void rejoinClaim(claim, { setDrive: false, notify: false, preserveLocalState: true }).finally(() => {
        tabRefreshInFlight.current = false;
      });
    }

    document.addEventListener("visibilitychange", refreshOnVisible);
    return () => document.removeEventListener("visibilitychange", refreshOnVisible);
  }, [rejoinClaim]);
  const { createLeague, joinLeague, submitDirective, submitDirectiveConfirmed, openQualifyingRun, openResolveConfirm, openNextGrandPrixConfirm, startQualifyingRunConfirmed } = createRaceActions({
    leagueState,
    profileSession,
    playerTeam,
    form,
    selectedCardId,
    currentCircuit,
    qualifyingAttemptsLeft,
    qualifyingDisabled,
    lastQualifyingRun,
    run,
    tt,
    setAdminInspecting,
    setLeagueState,
    setLeagueFormError,
    setGameView,
    setDirectiveConfirmOpen,
    setQualifyingResult: (result) => {
      setQualifyingReplayInitialLap(undefined);
      setQualifyingResult(result);
    },
    setQualifyingConfirmOpen,
    setResolveConfirmOpen,
    setStartingGridExpanded,
    setNextGrandPrixConfirmOpen,
    markCommandClicked,
    withCurrentPlayer,
    rememberPlayer,
    showStatus,
    pushCommandHint
  });
  useEffect(() => {
    if (!profileSession || profileSession.admin !== undefined) return;
    void refreshProfileAdminStatus(profileSession);
  }, [profileSession, refreshProfileAdminStatus]);
  const primaryCommand =
    deskState === "prepare"
      ? { label: tt("action_submit_directive"), action: submitDirective, disabled: status === "loading" || isResolved }
      : deskState === "ready"
        ? { label: tt("action_launch_grand_prix"), action: openResolveConfirm, disabled: status === "loading" || isResolved }
        : {
            label: nextGrandPrixActionLabel,
            action: openNextGrandPrixConfirm,
            disabled: status === "loading" || !leagueState?.actionState.canStartNextGrandPrix
          };
  const primaryCommandClass = `primary-command${
    (deskState === "prepare" && qualifyingAttemptsUsed > 0 && !commandClicks.directive) ||
    (deskState === "ready" && !commandClicks.launchGrandPrix) ||
    (deskState === "resolved" && !commandClicks.nextGrandPrix)
      ? " highlight-command"
      : ""
  }`;
  useEffect(() => {
    if (!leagueState || !routeReplayGrandPrixId) return;
    if (historyReplay && isGrandPrixRouteId(historyReplay.id, routeReplayGrandPrixId)) return;

    if (leagueState.currentGrandPrix.result && isGrandPrixRouteId(leagueState.currentGrandPrix.id, routeReplayGrandPrixId)) {
      if (historyReplay) setHistoryReplay(null);
      setResultTab("replay");
      setResultOpen(true);
      setGameView("drive");
      return;
    }

    const replay = leagueState.grandPrixHistory.find((grandPrix) => grandPrix.result && isGrandPrixRouteId(grandPrix.id, routeReplayGrandPrixId));
    if (!replay) {
      setRouteReplayGrandPrixId(undefined);
      return;
    }

    setHistoryReplay(replay);
    setResultTab("replay");
    setResultOpen(true);
    setGameView("drive");
  }, [historyReplay, leagueState, routeReplayGrandPrixId, setGameView, setRouteReplayGrandPrixId]);

  useEffect(() => {
    if (!leagueState || onboardingHelp) return;
    openOnboardingHelp("leagueIntro");
    if (!localStorage.getItem(onboardingStorageKey("leagueIntro")) && !snoozedOnboardingHelp.current.has(onboardingStorageKey("leagueIntro"))) return;
    if (gameView === "drive" && raceDayPhase === "briefing") openOnboardingHelp("race");
    if (gameView === "plan") openOnboardingHelp("plan");
    if (gameView === "garage") openOnboardingHelp("garage");
  }, [gameView, leagueState, onboardingHelp, onboardingStorageKey, openOnboardingHelp, preferencesResetSignal, raceDayPhase]);

  useEffect(() => {
    resetCommandClicks();
  }, [currentGrandPrixKey, resetCommandClicks]);

  useEffect(() => {
    if (!leagueState) {
      previousSeasonRef.current = null;
      return;
    }
    const currentSeason = leagueState.currentGrandPrix.season;
    const previousSeason = previousSeasonRef.current;
    previousSeasonRef.current = currentSeason;
    const endedSeason = currentSeason - 1;
    if (previousSeason === null || currentSeason <= previousSeason) return;
    if (endedSeason < 1 || !completedSeasons.some((season) => season.season === endedSeason)) return;
    const key = seasonRecapStorageKey(leagueState.league.id, endedSeason);
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "seen");
    setSeasonRecapSeason(endedSeason);
  }, [completedSeasons, leagueState]);

  function openHistoryReplay(grandPrix: LeagueState["grandPrixHistory"][number]) {
    if (!grandPrix.result) return;
    setHistoryReplay(grandPrix);
    setRouteReplayGrandPrixId(shortGrandPrixId(grandPrix.id));
    setResultTab("replay");
    setResultOpen(true);
    setGameView("drive");
  }

  function closeHistoryReplay() {
    setHistoryReplay(null);
    setRouteReplayGrandPrixId(undefined);
  }

  async function restartLeague() {
    if (!leagueState) return;
    setRestartConfirmOpen(false);
    await restartLeagueState();
  }

  async function run(nextMessage: string, action: () => Promise<void>, staleClaimTeamId?: string, notify = true, errorText?: (error: unknown) => string, closeReplays = true) {
    if (closeReplays) closeOpenReplays();
    setTechnicalError(null);
    setStatus("loading");
    setMessage(nextMessage);
    if (notify) pushNotification(nextMessage);

    try {
      await action();
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      const friendlyError = errorText?.(error);
      if (!friendlyError && isStaleLeagueError(error)) {
        forgetClaim(staleClaimTeamId);
        setLeagueState(null);
        showStatus(tt("status_saved_league_expired"), "error", false);
        return;
      }
      if (!friendlyError || (error instanceof ApiError && error.statusCode >= 500)) {
        setTechnicalError(error instanceof Error ? error.message : String(error));
      }
      clearTransientNotifications();
      showStatus(friendlyError ?? (error instanceof TypeError ? tt("status_api_unavailable") : tt("status_request_failed")), "error", notify);
    }
  }

  function closeOpenReplays() {
    if (historyReplay) closeHistoryReplay();
    if (qualifyingResult) {
      setQualifyingReplayInitialLap(undefined);
      setQualifyingResult(null);
    }
    if (resultOpen && result) setResultOpen(false);
  }

  function openQualifyingHistory(run: QualifyingRun) {
    setQualifyingReplayInitialLap(run.lap ?? 1);
    setQualifyingResult(run);
  }

  function changeLocale(nextLocale: Locale) {
    onLocaleChange(nextLocale);
    if (!leagueState && message === t("status_initial", locale)) {
      setMessage(t("status_initial", nextLocale));
    }
  }

  const languageSwitcher = <LanguageSwitcher locale={locale} tt={tt} onChangeLocale={changeLocale} />;

  function resetUiPreferences() {
    for (const key of UI_PREFERENCE_KEYS) localStorage.removeItem(key);
    const dynamicPreferenceKeys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(
      (key): key is string => key !== null && (key.startsWith(`${SEASON_RECAP_KEY_PREFIX}:`) || key.startsWith(`${ONBOARDING_HELP_KEYS.leagueIntro}:`) || key.startsWith(`${ONBOARDING_HELP_KEYS.race}:`) || key.startsWith(`${ONBOARDING_HELP_KEYS.plan}:`) || key.startsWith(`${ONBOARDING_HELP_KEYS.garage}:`))
    );
    for (const key of dynamicPreferenceKeys) localStorage.removeItem(key);
    snoozedOnboardingHelp.current.clear();
    resetCommandClicks();
    setPreferencesResetSignal((signal) => signal + 1);
    setPreferencesResetOpen(false);
    setProfileOpen(false);
    showStatus(tt("status_ui_preferences_reset"), "info", Boolean(leagueState));
  }

  function closeLeagueControls() {
    setLeagueControlsOpen(false);
    setProfileOpen(false);
  }

  const profileMenu = (showManageLeague = true, showLeagueSwitch = true) => (
    <ProfileMenu
      locale={locale}
      profileOpen={profileOpen}
      playerTeamName={playerTeam?.name}
      pendingMessage={pendingMessage}
      savedClaims={savedClaims}
      activeTeamId={leagueState?.player?.teamId ?? ""}
      showManageLeague={showManageLeague}
      showLeagueSwitch={showLeagueSwitch}
      hasLeague={Boolean(leagueState)}
      isAdmin={Boolean(profileSession?.admin)}
      hasRecoveryCode={Boolean(profileSession?.recoveryCode)}
      tt={tt}
      onChangeLocale={changeLocale}
      onToggleOpen={() => setProfileOpen((open) => !open)}
      onClose={() => setProfileOpen(false)}
      onSwitchLeague={(teamId) => void switchLeague(teamId)}
      onAddLeague={addLeague}
      onOpenLeagueControls={() => {
        setLeagueControlsOpen(true);
        setProfileOpen(false);
      }}
      onOpenAdminConsole={() => void openAdminConsole()}
      onOpenProfileCode={() => {
        setProfileCodeOpen(true);
        setProfileOpen(false);
      }}
      onOpenPreferencesReset={() => {
        setPreferencesResetOpen(true);
        setProfileOpen(false);
      }}
      onOpenProfileLogout={() => {
        setProfileLogoutOpen(true);
        setProfileOpen(false);
      }}
      onOpenChangelog={() => {
        setGameView("changelog");
        setProfileOpen(false);
        setResultOpen(false);
      }}
    />
  );

  const setupTopbar = (
    <SetupTopbar profileMenu={profileSession ? profileMenu(false, false) : null} languageSwitcher={languageSwitcher} pendingMessage={pendingMessage} onHome={goHome} />
  );

  const notificationStack = <NotificationStack notifications={notifications} tt={tt} onDismiss={dismissNotification} />;
  const commonOverlays = (
    <AppOverlays
      profileSession={profileSession}
      profileCodeOpen={profileCodeOpen}
      profileLogoutOpen={profileLogoutOpen}
      preferencesResetOpen={preferencesResetOpen}
      technicalError={technicalError}
      directiveConfirmOpen={directiveConfirmOpen}
      resolveConfirmOpen={resolveConfirmOpen}
      qualifyingConfirmOpen={qualifyingConfirmOpen}
      nextGrandPrixConfirmOpen={nextGrandPrixConfirmOpen}
      leagueControlsOpen={leagueControlsOpen}
      restartConfirmOpen={restartConfirmOpen}
      onboardingHelp={onboardingHelp}
      adminDeleteUser={adminDeleteUser}
      seasonRecap={seasonRecap}
      playerTeamId={playerTeam?.id}
      form={form}
      leagueState={leagueState}
      status={status}
      pendingMessage={pendingMessage}
      qualifyingAttemptsUsed={qualifyingAttemptsUsed}
      qualifyingAttemptsLeft={qualifyingAttemptsLeft}
      qualifyingAttemptLimit={qualifyingAttemptLimit}
      planRiskRead={race.planRiskRead}
      currentCircuit={currentCircuit}
      forecastPick={forecastPick}
      startingGridEntries={startingGridEntries}
      startingGridExpanded={startingGridExpanded}
      isSeasonFinalGrandPrix={isSeasonFinalGrandPrix}
      nextGrandPrixActionLabel={nextGrandPrixActionLabel}
      hasResult={Boolean(result)}
      tt={tt}
      setForm={setForm}
      onCopyProfileCode={() => void copyProfileCode()}
      onForgetProfile={forgetProfile}
      onResetUiPreferences={resetUiPreferences}
      onCopyTechnicalError={() => void copyTechnicalError()}
      onSubmitDirectiveConfirmed={submitDirectiveConfirmed}
      onEditPlan={() => {
        setDirectiveConfirmOpen(false);
        setQualifyingConfirmOpen(false);
        setPlanSubscreen("plan");
        setGameView("plan");
      }}
      onOpenChronoPlan={() => {
        setDirectiveConfirmOpen(false);
        setPlanSubscreen("chrono");
        setGameView("plan");
      }}
      onResolveGrandPrix={() => void resolveGrandPrix()}
      onStartQualifyingRunConfirmed={startQualifyingRunConfirmed}
      onStartNextGrandPrix={() => void startNextGrandPrix()}
      onOpenResultReport={() => {
        setNextGrandPrixConfirmOpen(false);
        setPlanSubscreen("report");
        setGameView("plan");
      }}
      onUpdateSettings={updateSettings}
      onForgetPlayer={forgetPlayer}
      onRestartLeague={() => void restartLeague()}
      onCloseOnboardingHelp={closeOnboardingHelp}
      onCloseAdminDelete={() => setAdminDeleteUser(null)}
      onDeleteAdminUser={(confirmation) => void deleteAdminUserConfirmed(confirmation)}
      onCloseProfileCode={() => setProfileCodeOpen(false)}
      onCloseProfileLogout={() => setProfileLogoutOpen(false)}
      onClosePreferencesReset={() => setPreferencesResetOpen(false)}
      onCloseTechnicalError={() => setTechnicalError(null)}
      onCloseDirectiveConfirm={() => setDirectiveConfirmOpen(false)}
      onCloseResolveConfirm={() => setResolveConfirmOpen(false)}
      onShowFullGrid={() => setStartingGridExpanded(true)}
      onCloseQualifyingConfirm={() => setQualifyingConfirmOpen(false)}
      onCloseNextGrandPrixConfirm={() => setNextGrandPrixConfirmOpen(false)}
      onCloseSeasonRecap={() => setSeasonRecapSeason(null)}
      onCloseLeagueControls={closeLeagueControls}
      onOpenRestartConfirm={() => setRestartConfirmOpen(true)}
      onCloseRestartConfirm={() => setRestartConfirmOpen(false)}
    />
  );
  const adminView = (
    <AdminConsoleView
      adminLeagues={adminLeagues}
      adminRecoveryCode={adminRecoveryCode}
      adminTab={adminTab}
      adminToken={adminToken}
      adminUsers={adminUsers}
      adminUserPagination={adminUserPagination}
      adminUserQuery={adminUserQuery}
      adminLeaguePagination={adminLeaguePagination}
      adminLeagueQuery={adminLeagueQuery}
      locale={locale}
      loading={status === "loading"}
      pendingMessage={pendingMessage}
      onCleanupLeague={(league) => void cleanupAdminTestData({ leagueIds: [league.id] })}
      onCleanupUser={(user) => void cleanupAdminTestData({ profileIds: [user.id] })}
      onDeleteUser={setAdminDeleteUser}
      onInspectLeague={(league) => void inspectAdminLeague(league)}
      onPageLeagues={(page) => void pageAdminLeagues(page)}
      onPageUsers={(page) => void pageAdminUsers(page)}
      onRefresh={() => void refreshAdminData()}
      onResetRecoveryCode={(user) => void resetAdminRecoveryCode(user)}
      onSearchLeagues={() => void searchAdminLeagues()}
      onSearchUsers={() => void searchAdminUsers()}
      onSetAdminLeagueQuery={setAdminLeagueQuery}
      onSetAdminTab={setAdminTab}
      onSetAdminToken={setAdminToken}
      onSetAdminUserQuery={setAdminUserQuery}
      tt={tt}
    />
  );

  return (
    <AppShell
      profileSession={profileSession}
      leagueState={leagueState}
      gameView={gameView}
      adminInspecting={adminInspecting}
      adminView={adminView}
      setupTopbar={setupTopbar}
      notificationStack={notificationStack}
      overlays={commonOverlays}
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
      resultTab={resultTab}
      resultOpen={resultOpen}
      historyReplay={historyReplay}
      profileIsAdmin={Boolean(profileSession?.admin)}
      preferencesResetSignal={preferencesResetSignal}
      qualifyingReplayInitialLap={qualifyingReplayInitialLap}
      qualifyingPanelOpen={qualifyingPanelOpen}
      primaryCommandClass={primaryCommandClass}
      primaryCommand={primaryCommand}
      race={race}
      planSubscreen={planSubscreen}
      directiveStep={directiveStep}
      championshipRecordTab={championshipRecordTab}
      garagePanel={garagePanel}
      gameProfileMenu={profileMenu()}
      setForm={setForm}
      setProfileMode={setProfileMode}
      setProfileForm={setProfileForm}
      setProfileFormError={setProfileFormError}
      setLeagueFormError={setLeagueFormError}
      setSetupMode={setSetupMode}
      setSavedLeagueIndex={setSavedLeagueIndex}
      setResultTab={setResultTab}
      setResultOpen={setResultOpen}
      setDirectiveStep={setDirectiveStep}
      setGameView={setGameView}
      setPlanSubscreen={setPlanSubscreen}
      setQualifyingResult={(result) => {
        if (!result) setQualifyingReplayInitialLap(undefined);
        setQualifyingResult(result);
      }}
      openQualifyingHistory={openQualifyingHistory}
      setSeasonRecapSeason={setSeasonRecapSeason}
      setChampionshipRecordTab={setChampionshipRecordTab}
      setGaragePanel={setGaragePanel}
      setQualifyingPanelOpen={setQualifyingPanelOpen}
      createProfileSession={() => void createProfileSession()}
      recoverProfileSession={() => void recoverProfileSession()}
      requestRecoveryCode={() => void requestRecoveryCode()}
      createLeague={() => void createLeague()}
      joinLeague={() => void joinLeague()}
      switchLeague={(teamId) => void switchLeague(teamId)}
      closeHistoryReplay={closeHistoryReplay}
      openHistoryReplay={openHistoryReplay}
      buyCard={buyCard}
      sellCard={sellCard}
      updateLivery={updateLivery}
      updateTeamName={updateTeamName}
      clearTransientNotifications={clearTransientNotifications}
      clearScreenOnboardingSnoozes={clearScreenOnboardingSnoozes}
      markCommandClicked={markCommandClicked}
      openQualifyingRun={openQualifyingRun}
      goHome={goHome}
      backToAdminConsole={() => {
        setGameView("admin");
        setLeagueState(null);
        setAdminInspecting(false);
      }}
      tt={tt}
    />
  );

  function rememberPlayer(state: LeagueState) {
    const nextClaims = rememberPlayerClaim(state);
    if (nextClaims) setSavedClaims(nextClaims);
  }

  function withCurrentPlayer(state: LeagueState): LeagueState {
    return restoreCurrentPlayer(state, leagueState?.player);
  }

  function forgetClaim(teamId?: string) {
    setSavedClaims(withoutPlayerClaim(savedClaims, teamId ?? leagueState?.player?.teamId));
  }

  function closeOnboardingHelp(topic: OnboardingHelpTopic, dismiss: boolean) {
    const key = onboardingStorageKey(topic);
    if (dismiss || LEAGUE_SCOPED_HELP_TOPICS.has(topic)) localStorage.setItem(key, "1");
    else snoozedOnboardingHelp.current.add(key);
    setOnboardingHelp(null);
  }
}

function isStaleLeagueError(error: unknown) {
  return error instanceof ApiError && error.statusCode === 404 && localStorage.getItem(ACTIVE_PLAYER_CLAIM_KEY);
}
