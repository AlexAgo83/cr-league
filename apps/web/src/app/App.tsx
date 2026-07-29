import {
  SharedLeagueRuleError,
  buyCard as buySoloCard,
  buyCarAsset as buySoloCarAsset,
  resolveGrandPrix as resolveSoloGrandPrixState,
  runQualifying as runSoloQualifying,
  sellCard as sellSoloCard,
  startNextGrandPrix as startSoloNextGrandPrixState,
  submitDecision as submitSoloDecision,
  type QualifyingRun,
  updateTeamLivery as updateSoloTeamLivery,
  updateTeamName as updateSoloTeamName
} from "@cr-league/shared";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { t, TranslationProvider, type Locale, type TranslationKey } from "../i18n/index.js";
import { type LeagueState, type ProfileSession } from "./types.js";
import { LanguageSwitcher, NotificationStack, ProfileMenu, SetupTopbar } from "./AppChrome.js";
import { AppOverlays } from "./AppOverlays.js";
import { ONBOARDING_HELP_KEYS, SCREEN_ONBOARDING_HELP_TOPICS, type OnboardingHelpTopic } from "./OnboardingShell.js";
import { clearStoredUiPreferences, LEAGUE_SCOPED_HELP_TOPICS } from "./appPreferences.js";
import {
  ApiError,
  getActiveClaim,
  loadPlayerClaims,
  loadProfileEmail,
  loadProfileSession,
  safeStorage,
  seasonRecapStorageKey,
} from "./appStorage.js";
import { initialLocale, isStaleLeagueError, persistLocale } from "./appSession.js";
import { HomeSplash } from "./HomeSplash.js";
import { AppShell } from "./AppShell.js";
import { useCircuitRoutesReady } from "./circuitRoutes/index.js";
import { rememberPlayerClaim, withCurrentPlayer as restoreCurrentPlayer, withoutPlayerClaim } from "./claimHelpers.js";
import { createProfileActions } from "./profileActions.js";
import { SetupProvider, type SetupContextValue } from "./setupContext.js";
import { createRaceActions } from "./raceActions.js";
import { isGrandPrixRouteId, isStartPath, shortGrandPrixId } from "./routes.js";
import { createSessionActions } from "./sessionActions.js";
import { type ProfileMode, type SetupEntryMode, type SetupMode } from "./SetupViews.js";
import { createLeagueMutations } from "./leagueMutations.js";
import { useAppNavigation } from "./useAppNavigation.js";
import { useCommandClicks } from "./useCommandClicks.js";
import { useAdminPanel } from "./useAdminPanel.js";
import { useActiveModal } from "./useActiveModal.js";
import { useNotifications, type Notification } from "./useNotifications.js";
import { usePlanForm } from "./usePlanForm.js";
import { useRaceDerivations } from "./useRaceDerivations.js";
import { useReplayUiState } from "./useReplayUiState.js";
import { createInitialSoloLeagueState, isSoloLeagueState } from "./soloLeague.js";
import { clearSoloSlot, firstFreeSoloSlot, hasAnySoloSave, listSoloSlots, loadSoloSlot, saveSoloSlot, type SoloSlot, type SoloSlotSummary } from "./soloStorage.js";

const AdminConsoleView = lazy(() => import("../features/AdminConsoleView.js").then((module) => ({ default: module.AdminConsoleView })));

function toDatetimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function App() {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [entered, setEntered] = useState(() => !isStartPath(window.location.pathname));
  const tt = useCallback((key: TranslationKey, params?: Parameters<typeof t>[2]) => t(key, locale, params), [locale]);

  const changeLocale = useCallback((nextLocale: Locale) => {
    persistLocale(nextLocale);
    setLocaleState(nextLocale);
  }, []);

  return (
    <TranslationProvider value={tt}>
      {entered ? (
        <GameApp locale={locale} onLocaleChange={changeLocale} />
      ) : (
        <HomeSplash locale={locale} onChangeLocale={changeLocale} onEnter={() => setEntered(true)} />
      )}
    </TranslationProvider>
  );
}

// ponytail: keep App.tsx as orchestration wiring; reopen a broader split only when an App.tsx change
// breaks a flow it did not touch.
function GameApp({ locale, onLocaleChange }: { locale: Locale; onLocaleChange: (locale: Locale) => void }) {
  // Kicks off the lazy circuit-route load and re-renders once ready so circuitForRound (below) hands
  // the freshly-loaded polyline to the race/replay/championship views.
  useCircuitRoutesReady();
  const [profileSession, setProfileSession] = useState<ProfileSession | null>(loadProfileSession);
  const {
    historyReplay,
    setHistoryReplay,
    resultTab,
    setResultTab,
    resultOpen,
    setResultOpen,
    qualifyingPanelOpen,
    setQualifyingPanelOpen,
    qualifyingResult,
    setQualifyingResult,
    qualifyingReplayInitialLap,
    openQualifyingReplay
  } = useReplayUiState();
  const {
    modalReturnRef,
    setProfileOpen,
    setPreferencesResetOpen,
    setProfileCodeOpen,
    setProfileLogoutOpen,
    setDirectiveConfirmOpen,
    setResolveConfirmOpen,
    setQualifyingConfirmOpen,
    setNextGrandPrixConfirmOpen,
    setLeagueControlsOpen,
    setRestartConfirmOpen,
    setSoloResetOpen,
    profileOpen,
    preferencesResetOpen,
    profileCodeOpen,
    profileLogoutOpen,
    directiveConfirmOpen,
    resolveConfirmOpen,
    qualifyingConfirmOpen,
    nextGrandPrixConfirmOpen,
    leagueControlsOpen,
    restartConfirmOpen,
    soloResetOpen
  } = useActiveModal();
  const [leagueState, setLeagueState] = useState<LeagueState | null>(null);
  const clearRouteReplay = useCallback(() => setHistoryReplay(null), [setHistoryReplay]);
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
  const [setupEntryMode, setSetupEntryMode] = useState<SetupEntryMode>("choice");
  const [activeSoloSlot, setActiveSoloSlot] = useState<SoloSlot | null>(null);
  const [soloSlots, setSoloSlots] = useState<Array<SoloSlotSummary | null>>([null, null, null]);
  const [setupMode, setSetupMode] = useState<SetupMode>("choice");
  const { commandClicks, markCommandClicked, resetCommandClicks } = useCommandClicks();
  const [seasonRecapSeason, setSeasonRecapSeason] = useState<number | null>(null);
  const previousSeasonRef = useRef<number | null>(null);
  const [preferencesResetSignal, setPreferencesResetSignal] = useState(0);
  const [startingGridExpanded, setStartingGridExpanded] = useState(false);
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
      if (safeStorage.get(key) || snoozedOnboardingHelp.current.has(key)) return;
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
    void rejoinClaim(saved, { setDrive: false, notify: false, silent: true });
    // The automatic rejoin intentionally uses the first local-storage snapshot only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const race = useRaceDerivations({ leagueState, adminInspecting, form, qualifyingResult, historyReplay, resultOpen, status, tt });
  const {
    playerTeam,
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
  const nextGrandPrixActionLabel = tt(isSeasonFinalGrandPrix ? "action_start_next_season" : "action_next_grand_prix");
  const soloMode = isSoloLeagueState(leagueState);
  const { updateSettings, resolveGrandPrix, startNextGrandPrix, buyCard, sellCard, buyCarAsset, updateLivery, updateTeamName, restartLeague: restartLeagueState, sendPlanReminders } = createLeagueMutations({
    leagueState,
    playerTeam,
    form,
    run,
    tt,
    setLeagueState,
    setGameView,
    setResultTab,
    setResultOpen,
    setResolveConfirmOpen,
    setNextGrandPrixConfirmOpen,
    setForm,
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
    setProfileMode,
    openProfileCodeHelp: () => openOnboardingHelp("profileCode"),
    showStatus
  });
  const { rejoinClaim, switchLeague, goHome, addLeague, forgetPlayer, copyProfileCode, copyTechnicalError, forgetProfile } = createSessionActions({
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
    setSetupEntryMode,
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
      if (isSoloLeagueState(leagueStateRef.current)) return;
      const claim = getActiveClaim(savedClaimsRef.current);
      if (!claim) return;

      tabRefreshInFlight.current = true;
      void rejoinClaim(claim, { setDrive: false, notify: false, preserveLocalState: true, silent: true }).finally(() => {
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
    setQualifyingResult,
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
  }, [historyReplay, leagueState, routeReplayGrandPrixId, setGameView, setHistoryReplay, setResultOpen, setResultTab, setRouteReplayGrandPrixId]);

  useEffect(() => {
    if (!leagueState || onboardingHelp) return;
    openOnboardingHelp("leagueIntro");
    if (!safeStorage.get(onboardingStorageKey("leagueIntro")) && !snoozedOnboardingHelp.current.has(onboardingStorageKey("leagueIntro"))) return;
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
    if (safeStorage.get(key)) return;
    safeStorage.set(key, "seen");
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
      // A stale claim is cleaned up whatever the caller supplies as friendly text: the saved
      // league is genuinely gone, and leaving the claim behind would retry it forever.
      if (isStaleLeagueError(error)) {
        forgetClaim(staleClaimTeamId);
        setLeagueState(null);
        showStatus(tt("status_saved_league_expired"), "error", false);
        return;
      }
      const friendlyError = errorText?.(error);
      if (!friendlyError || (error instanceof ApiError && error.statusCode >= 500)) {
        setTechnicalError(error instanceof Error ? error.message : String(error));
      }
      clearTransientNotifications();
      showStatus(friendlyError ?? (error instanceof TypeError ? tt("status_api_unavailable") : tt("status_request_failed")), "error", notify);
    }
  }

  function closeOpenReplays() {
    if (historyReplay) closeHistoryReplay();
    if (qualifyingResult) setQualifyingResult(null);
    if (resultOpen && result) setResultOpen(false);
  }

  function openQualifyingHistory(run: QualifyingRun) {
    openQualifyingReplay(run);
  }

  function persistSoloState(nextState: LeagueState) {
    if (activeSoloSlot !== null) saveSoloSlot(activeSoloSlot, nextState);
    setLeagueState(nextState);
  }

  function openSoloSlot(slot: SoloSlot) {
    const save = loadSoloSlot(slot);
    const state = save?.state ?? createInitialSoloLeagueState();
    if (!save) saveSoloSlot(slot, state);
    setActiveSoloSlot(slot);
    setAdminInspecting(false);
    setSetupEntryMode("choice");
    setLeagueState(state);
    setGameView("drive");
    showStatus(tt(save ? "status_solo_resumed" : "status_solo_started"));
    pushCommandHint("prepare");
  }

  function deleteSoloSlot(slot: SoloSlot) {
    clearSoloSlot(slot);
    setSoloSlots(listSoloSlots());
  }

  function startSolo() {
    setSetupEntryMode("solo");
  }

  function startCampaign() {
    // A first-time player has nothing to choose between, so keep their path to a race direct.
    if (!hasAnySoloSave()) {
      openSoloSlot(firstFreeSoloSlot() ?? 0);
      return;
    }
    setSoloSlots(listSoloSlots());
    setSetupEntryMode("campaign");
  }

  async function runSoloMutation(loadingKey: TranslationKey, action: () => LeagueState, successKey: TranslationKey) {
    await run(
      tt(loadingKey),
      async () => {
        persistSoloState(action());
        showStatus(tt(successKey));
      },
      undefined,
      true,
      (error) => (error instanceof SharedLeagueRuleError ? error.message : "")
    );
  }

  async function submitSoloDirectiveConfirmed() {
    if (!leagueState || !playerTeam) return;
    setDirectiveConfirmOpen(false);
    await run(
      tt("status_submitting_directive"),
      async () => {
        const nextState = submitSoloDecision(leagueState, {
          teamId: playerTeam.id,
          approach: form.approach,
          preparation: form.preparation,
          pitStrategy: form.pitStrategy,
          cardId: selectedCardId || undefined
        });
        persistSoloState(nextState);
        setQualifyingResult(null);
        showStatus(tt("status_directive_locked"));
        pushCommandHint("ready");
      },
      undefined,
      true,
      (error) => (error instanceof SharedLeagueRuleError ? error.message : "")
    );
  }

  async function resolveSoloGrandPrix() {
    if (!leagueState) return;
    setResolveConfirmOpen(false);
    await run(
      tt("status_resolving_grand_prix"),
      async () => {
        const nextState = resolveSoloGrandPrixState(leagueState, { allowDefaults: leagueState.actionState.missingTeamIds.length > 0 });
        persistSoloState(nextState);
        setGameView("drive");
        setResultTab("replay");
        setResultOpen(true);
        pushCommandHint("resolved");
      },
      undefined,
      true,
      (error) => (error instanceof SharedLeagueRuleError ? error.message : "")
    );
  }

  async function startSoloNextGrandPrix() {
    if (!leagueState) return;
    const finishingSeason = leagueState.currentGrandPrix.round >= leagueState.league.maxGrandPrixPerSeason;
    setNextGrandPrixConfirmOpen(false);
    setRouteReplayGrandPrixId(undefined);
    setHistoryReplay(null);
    setResultOpen(false);
    setGameView("drive");
    await run(
      tt(finishingSeason ? "status_starting_next_season" : "status_starting_next_grand_prix"),
      async () => {
        const nextState = startSoloNextGrandPrixState(leagueState);
        persistSoloState(nextState);
        setForm((current) => (current.cardId ? { ...current, cardId: "" } : current));
        setGameView("drive");
        setResultOpen(false);
        showStatus(tt(finishingSeason ? "status_next_season_started" : "status_next_grand_prix_started"));
        pushCommandHint("prepare");
      },
      undefined,
      true,
      (error) => (error instanceof SharedLeagueRuleError ? error.message : "")
    );
  }

  async function launchSoloQualifyingRun() {
    if (!leagueState || !playerTeam || qualifyingDisabled) return;
    await run(
      tt("status_qualifying_running"),
      async () => {
        const response = runSoloQualifying(leagueState, {
          teamId: playerTeam.id,
          approach: form.approach,
          preparation: form.preparation,
          pitStrategy: form.pitStrategy,
          cardId: selectedCardId || undefined,
          laps: 3
        });
        persistSoloState(response.state);
        setQualifyingResult(response.run);
        showStatus(response.isBest ? tt("status_qualifying_best") : tt("status_qualifying_done"));
      },
      undefined,
      true,
      (error) => (error instanceof SharedLeagueRuleError ? error.message : "")
    );
  }

  function openSoloQualifyingRun(options?: { confirm?: boolean }) {
    if (qualifyingDisabled) return;
    markCommandClicked("qualifying");
    if (!options?.confirm && qualifyingAttemptsLeft > 1) {
      setQualifyingResult(null);
      void launchSoloQualifyingRun();
      return;
    }
    setQualifyingConfirmOpen(true);
  }

  function startSoloQualifyingRunConfirmed() {
    setQualifyingConfirmOpen(false);
    setQualifyingResult(null);
    void launchSoloQualifyingRun();
  }

  function changeLocale(nextLocale: Locale) {
    onLocaleChange(nextLocale);
    if (!leagueState && message === t("status_initial", locale)) {
      setMessage(t("status_initial", nextLocale));
    }
  }

  const languageSwitcher = <LanguageSwitcher locale={locale} onChangeLocale={changeLocale} />;

  function resetUiPreferences() {
    clearStoredUiPreferences();
    snoozedOnboardingHelp.current.clear();
    resetCommandClicks();
    setPreferencesResetSignal((signal) => signal + 1);
    setPreferencesResetOpen(false);
    setProfileOpen(false);
    showStatus(tt("status_ui_preferences_reset"), "info", Boolean(leagueState));
  }

  function resetSoloLeague() {
    if (activeSoloSlot !== null) clearSoloSlot(activeSoloSlot);
    setActiveSoloSlot(null);
    setSoloSlots(listSoloSlots());
    setSoloResetOpen(false);
    setProfileOpen(false);
    setLeagueState(null);
    setResultOpen(false);
    setHistoryReplay(null);
    setQualifyingResult(null);
    setSetupEntryMode("choice");
    setGameView("drive");
    showStatus(tt("status_solo_reset"), "info", false);
  }

  function closeLeagueControls() {
    setLeagueControlsOpen(false);
    setProfileOpen(false);
  }

  const profileMenu = (showManageLeague = true) => (
    <ProfileMenu
      locale={locale}
      profileOpen={profileOpen}
      playerTeamName={playerTeam?.name}
      pendingMessage={pendingMessage}
      showManageLeague={showManageLeague}
      hasLeague={Boolean(leagueState)}
      isSoloLeague={soloMode}
      isAdmin={Boolean(profileSession?.admin)}
      hasRecoveryCode={Boolean(profileSession?.recoveryCode)}
      onChangeLocale={changeLocale}
      onToggleOpen={() => setProfileOpen((open) => !open)}
      onClose={() => setProfileOpen(false)}
      onAddLeague={addLeague}
      onOpenLeagueControls={() => {
        if (leagueState) {
          setForm((current) => ({
            ...current,
            leagueName: leagueState.league.name,
            cadence: leagueState.league.cadence,
            preparationDeadlineAt: toDatetimeLocal(leagueState.league.preparationDeadlineAt)
          }));
        }
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
      onOpenSoloReset={() => {
        setSoloResetOpen(true);
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
    <SetupTopbar hideWordmark profileMenu={profileSession ? profileMenu(false) : null} languageSwitcher={languageSwitcher} pendingMessage={pendingMessage} onHome={goHome} />
  );

  const notificationStack = <NotificationStack notifications={notifications} onDismiss={dismissNotification} />;
  const commonOverlays = (
    <AppOverlays
      profileSession={profileSession}
      profileCodeOpen={profileCodeOpen}
      profileLogoutOpen={profileLogoutOpen}
      soloResetOpen={soloResetOpen}
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
      setForm={setForm}
      onCopyProfileCode={() => void copyProfileCode()}
      onForgetProfile={forgetProfile}
      onResetUiPreferences={resetUiPreferences}
      onResetSolo={resetSoloLeague}
      onCopyTechnicalError={() => void copyTechnicalError()}
      onSubmitDirectiveConfirmed={soloMode ? submitSoloDirectiveConfirmed : submitDirectiveConfirmed}
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
      onResolveGrandPrix={() => void (soloMode ? resolveSoloGrandPrix() : resolveGrandPrix())}
      onStartQualifyingRunConfirmed={soloMode ? startSoloQualifyingRunConfirmed : startQualifyingRunConfirmed}
      onStartNextGrandPrix={() => void (soloMode ? startSoloNextGrandPrix() : startNextGrandPrix())}
      onOpenResultReport={() => {
        setNextGrandPrixConfirmOpen(false);
        setPlanSubscreen("report");
        setGameView("plan");
      }}
      onUpdateSettings={updateSettings}
      onSendPlanReminders={() => void sendPlanReminders()}
      onForgetPlayer={forgetPlayer}
      onRestartLeague={() => void restartLeague()}
      onCloseOnboardingHelp={closeOnboardingHelp}
      onCloseAdminDelete={() => setAdminDeleteUser(null)}
      onDeleteAdminUser={(confirmation) => void deleteAdminUserConfirmed(confirmation)}
      onCloseProfileCode={() => setProfileCodeOpen(false)}
      onCloseProfileLogout={() => setProfileLogoutOpen(false)}
      onCloseSoloReset={() => setSoloResetOpen(false)}
      onClosePreferencesReset={() => setPreferencesResetOpen(false)}
      onCloseTechnicalError={() => setTechnicalError(null)}
      onCloseDirectiveConfirm={() => setDirectiveConfirmOpen(false)}
      onCloseResolveConfirm={() => setResolveConfirmOpen(false)}
      onShowFullGrid={() => setStartingGridExpanded(true)}
      onCloseQualifyingConfirm={() => setQualifyingConfirmOpen(false)}
      onCloseNextGrandPrixConfirm={() => setNextGrandPrixConfirmOpen(false)}
      onCloseSeasonRecap={() => setSeasonRecapSeason(null)}
      onCloseLeagueControls={closeLeagueControls}
      onOpenRestartConfirm={() => {
        modalReturnRef.current = "leagueControls";
        setRestartConfirmOpen(true);
      }}
      onCloseRestartConfirm={() => setRestartConfirmOpen(false)}
    />
  );
  // ponytail: only admins on the admin view ever render this tree (GameViews gates it), so don't
  // build the whole AdminConsoleView on every render for the non-admin majority.
  const adminView = profileSession?.admin ? (
    <Suspense fallback={null}>
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
      />
    </Suspense>
  ) : null;

  const setup: SetupContextValue = {
    message,
    profileMode,
    profileForm,
    profileFormError,
    leagueFormError,
    setupEntryMode,
    soloSlots,
    openSoloSlot: (slot: number) => openSoloSlot(Math.min(2, Math.max(0, Math.trunc(slot))) as SoloSlot),
    deleteSoloSlot: (slot: number) => deleteSoloSlot(Math.min(2, Math.max(0, Math.trunc(slot))) as SoloSlot),
    setupMode,
    savedClaims,
    savedLeagueIndex,
    setProfileMode,
    setProfileForm,
    setProfileFormError,
    setLeagueFormError,
    setSetupEntryMode,
    setSetupMode,
    setSavedLeagueIndex,
    createProfileSession: () => void createProfileSession(),
    recoverProfileSession: () => void recoverProfileSession(),
    requestRecoveryCode: () => void requestRecoveryCode(),
    startSolo,
    startCampaign,
    createLeague: () => void createLeague(),
    joinLeague: () => void joinLeague(),
    switchLeague: (teamId) => void switchLeague(teamId)
  };

  return (
    <SetupProvider value={setup}>
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
        setResultTab={setResultTab}
        setResultOpen={setResultOpen}
        setDirectiveStep={setDirectiveStep}
        setGameView={setGameView}
        setPlanSubscreen={setPlanSubscreen}
        setQualifyingResult={setQualifyingResult}
        openQualifyingHistory={openQualifyingHistory}
        setSeasonRecapSeason={setSeasonRecapSeason}
        setChampionshipRecordTab={setChampionshipRecordTab}
        setGaragePanel={setGaragePanel}
        setQualifyingPanelOpen={setQualifyingPanelOpen}
        closeHistoryReplay={closeHistoryReplay}
        openHistoryReplay={openHistoryReplay}
        buyCard={(cardId, quantity) =>
          void (soloMode
            ? runSoloMutation("status_buying_card", () => buySoloCard(leagueState!, { teamId: playerTeam?.id, cardId, quantity }), "status_card_bought")
            : buyCard(cardId, quantity))
        }
        sellCard={(cardId) =>
          void (soloMode
            ? runSoloMutation("status_selling_card", () => sellSoloCard(leagueState!, { teamId: playerTeam?.id, cardId }), "status_card_sold")
            : sellCard(cardId))
        }
        buyCarAsset={(carAssetId) =>
          void (soloMode
            ? runSoloMutation("status_buying_car", () => buySoloCarAsset(leagueState!, { teamId: playerTeam?.id, carAssetId }), "status_car_bought")
            : buyCarAsset(carAssetId))
        }
        updateLivery={(livery, options) =>
          void (soloMode
            ? runSoloMutation("status_livery_updating", () => updateSoloTeamLivery(leagueState!, { teamId: playerTeam?.id, livery }), "status_livery_updated")
            : updateLivery(livery, options))
        }
        updateTeamName={(name) =>
          void (soloMode
            ? runSoloMutation("status_team_name_updating", () => updateSoloTeamName(leagueState!, { teamId: playerTeam?.id, name }), "status_team_name_updated")
            : updateTeamName(name))
        }
        clearTransientNotifications={clearTransientNotifications}
        clearScreenOnboardingSnoozes={clearScreenOnboardingSnoozes}
        markCommandClicked={markCommandClicked}
        openQualifyingRun={soloMode ? openSoloQualifyingRun : openQualifyingRun}
        goHome={goHome}
        backToAdminConsole={() => {
          setGameView("admin");
          setLeagueState(null);
          setAdminInspecting(false);
        }}
      />
    </SetupProvider>
  );

  function rememberPlayer(state: LeagueState) {
    if (isSoloLeagueState(state)) return;
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
    if (dismiss || LEAGUE_SCOPED_HELP_TOPICS.has(topic)) safeStorage.set(key, "1");
    else snoozedOnboardingHelp.current.add(key);
    setOnboardingHelp(null);
  }
}
