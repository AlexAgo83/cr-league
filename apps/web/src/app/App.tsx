import { PIT_STRATEGIES, RACE_APPROACHES, TECHNICAL_PREPARATIONS, type CardId, type QualifyingRun } from "@cr-league/shared";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isLocale, t, type Locale, type TranslationKey } from "../i18n/index.js";
import { circuitForRound } from "./circuits.js";
import { cardFit, clampNumber, completedSeasonSummaries, startingGrid, strongestForecast } from "./helpers.js";
import { type AdminLeague, type AdminUser, type FormState, type GameView, type LeagueState, type ProfileSession } from "./types.js";
import { AdminConsoleView, type AdminTab } from "../features/AdminConsoleView.js";
import { CHAMPIONSHIP_RECORD_TAB_KEY } from "../features/ChampionshipView.js";
import { DIRECTIVE_STEP_KEY } from "../features/DirectivePanel.js";
import { GARAGE_PANEL_KEY } from "../features/GarageView.js";
import { DISMISSED_REPLAY_HELP_KEY, REPLAY_FOCUS_KEY, REPLAY_SPEED_KEY } from "../features/ReplayView.js";
import type { ResultTab } from "../features/ResultView.js";
import { GameTopbar, LanguageSwitcher, NotificationStack, ProfileMenu, SetupTopbar } from "./AppChrome.js";
import { AppOverlays } from "./AppOverlays.js";
import { DriveView } from "./DriveView.js";
import { GameViews } from "./GameViews.js";
import { ONBOARDING_HELP_KEYS, SCREEN_ONBOARDING_HELP_TOPICS, type OnboardingHelpTopic } from "./OnboardingShell.js";
import {
  ACTIVE_PLAYER_CLAIM_KEY,
  ApiError,
  LANGUAGE_KEY,
  PROFILE_SESSION_KEY,
  SEASON_RECAP_KEY_PREFIX,
  api,
  copyText,
  getActiveClaim,
  loadPlayerClaims,
  loadProfileSession,
  seasonRecapStorageKey,
  storePlayerClaims,
  storeProfileSession,
} from "./appStorage.js";
import { createAdminActions } from "./adminActions.js";
import { rememberPlayerClaim, withCurrentPlayer as restoreCurrentPlayer, withoutPlayerClaim } from "./claimHelpers.js";
import { createProfileActions } from "./profileActions.js";
import { bestQualifyingRuns, buildChronoReport, createInitialForm, latestQualifyingRun, qualifyingReplayTower, traitImpacts } from "./raceFlow.js";
import { isGrandPrixRouteId, shortGrandPrixId } from "./routes.js";
import { SetupGate } from "./SetupGate.js";
import { type ProfileMode, type SetupMode } from "./SetupViews.js";
import { createLeagueMutations } from "./leagueMutations.js";
import { useAppNavigation } from "./useAppNavigation.js";

const UI_PREFERENCE_KEYS = [DISMISSED_REPLAY_HELP_KEY, REPLAY_SPEED_KEY, REPLAY_FOCUS_KEY, GARAGE_PANEL_KEY, CHAMPIONSHIP_RECORD_TAB_KEY, DIRECTIVE_STEP_KEY, ...Object.values(ONBOARDING_HELP_KEYS)] as const;
const PLAN_FORM_KEY = "cr-league-plan-form";
type Notification = { id: number; text: string; tone: "info" | "error"; persistent?: boolean };
type CommandClick = "qualifying" | "editPlan" | "directive" | "chronoReport" | "launchGrandPrix" | "resultReport" | "nextGrandPrix";
const COMMAND_CLICKS: CommandClick[] = ["qualifying", "editPlan", "directive", "chronoReport", "launchGrandPrix", "resultReport", "nextGrandPrix"];

function savedPlanForm() {
  try {
    const saved = JSON.parse(localStorage.getItem(PLAN_FORM_KEY) ?? "{}") as Partial<FormState>;
    const form: Partial<FormState> = {};
    if (RACE_APPROACHES.includes(saved.approach as FormState["approach"])) form.approach = saved.approach;
    if (TECHNICAL_PREPARATIONS.includes(saved.preparation as FormState["preparation"])) form.preparation = saved.preparation;
    if (PIT_STRATEGIES.includes(saved.pitStrategy as FormState["pitStrategy"])) form.pitStrategy = saved.pitStrategy;
    if (typeof saved.cardId === "string") form.cardId = saved.cardId as FormState["cardId"];
    return form;
  } catch {
    return {};
  }
}

export function App() {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (isLocale(saved)) return saved;
    const browserLocale = navigator.language.split("-")[0] ?? "en";
    return isLocale(browserLocale) ? browserLocale : "en";
  });
  const [profileSession, setProfileSession] = useState<ProfileSession | null>(loadProfileSession);
  const [historyReplay, setHistoryReplay] = useState<LeagueState["grandPrixHistory"][number] | null>(null);
  const [resultTab, setResultTab] = useState<ResultTab>("replay");
  const [resultOpen, setResultOpen] = useState(true);
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
  const tt = (key: TranslationKey, params?: Parameters<typeof t>[2]) => t(key, locale, params);
  const [profileMode, setProfileMode] = useState<ProfileMode>("choice");
  const [setupMode, setSetupMode] = useState<SetupMode>("choice");
  const [qualifyingConfirmOpen, setQualifyingConfirmOpen] = useState(false);
  const [commandClicks, setCommandClicks] = useState<Record<CommandClick, boolean>>(() => Object.fromEntries(COMMAND_CLICKS.map((key) => [key, false])) as Record<CommandClick, boolean>);
  const [qualifyingPanelOpen, setQualifyingPanelOpen] = useState(true);
  const [qualifyingResult, setQualifyingResult] = useState<QualifyingRun | null>(null);
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
  const [form, setForm] = useState<FormState>(() => ({ ...createInitialForm(locale), ...savedPlanForm() }));
  const [profileForm, setProfileForm] = useState({ email: "", recoveryCode: "" });
  const [adminToken, setAdminToken] = useState("");
  const [adminTab, setAdminTab] = useState<AdminTab>("users");
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminLeagues, setAdminLeagues] = useState<AdminLeague[]>([]);
  const [adminRecoveryCode, setAdminRecoveryCode] = useState<{ email: string; code: string } | null>(null);
  const [adminDeleteUser, setAdminDeleteUser] = useState<AdminUser | null>(null);
  const [adminInspecting, setAdminInspecting] = useState(false);
  const [savedClaims, setSavedClaims] = useState(loadPlayerClaims);
  const [savedLeagueIndex, setSavedLeagueIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState(() => t("status_initial", locale));
  const [technicalError, setTechnicalError] = useState<string | null>(null);
  const [profileFormError, setProfileFormError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [onboardingHelp, setOnboardingHelp] = useState<OnboardingHelpTopic | null>(null);
  const pendingMessage = status === "loading" ? message : null;
  const notificationId = useRef(0);
  const snoozedOnboardingHelp = useRef(new Set<OnboardingHelpTopic>());
  const initialProfileSession = useRef(profileSession);
  const initialActiveClaim = useRef(getActiveClaim(savedClaims));

  function pushNotification(text: string, tone: Notification["tone"] = "info", persistent = tone === "error") {
    const id = notificationId.current + 1;
    notificationId.current = id;
    setNotifications((items) => {
      const kept = items.filter((item) => item.persistent);
      return kept.at(-1)?.text === text ? kept : [...kept, { id, text, tone, persistent }].slice(-2);
    });
    if (!persistent) window.setTimeout(() => setNotifications((items) => items.filter((item) => item.id !== id)), 4_000);
    return id;
  }

  function showStatus(text: string, tone: Notification["tone"] = "info", notify = true) {
    setMessage(text);
    if (notify && text !== t("status_initial", locale)) pushNotification(text, tone);
  }

  function pushCommandHint(nextDeskState: "prepare" | "ready" | "resolved") {
    setMessage(t(`command_hint_${nextDeskState}` as TranslationKey, locale));
  }

  function markCommandClicked(command: CommandClick) {
    setCommandClicks((clicks) => ({ ...clicks, [command]: true }));
  }

  function resetCommandClicks() {
    setCommandClicks(Object.fromEntries(COMMAND_CLICKS.map((key) => [key, false])) as Record<CommandClick, boolean>);
  }

  function clearTransientNotifications() {
    setNotifications((items) => items.filter((item) => item.persistent));
  }

  function clearScreenOnboardingSnoozes() {
    for (const topic of SCREEN_ONBOARDING_HELP_TOPICS) snoozedOnboardingHelp.current.delete(topic);
  }

  function dismissNotification(id: number) {
    setNotifications((items) => items.filter((item) => item.id !== id));
  }

  useEffect(() => {
    setSavedLeagueIndex((index) => Math.min(index, Math.max(0, savedClaims.length - 1)));
  }, [savedClaims.length]);

  useEffect(() => {
    if (!initialProfileSession.current) return;
    const saved = initialActiveClaim.current;
    if (!saved) return;
    void rejoinClaim(saved, { setDrive: false, notify: false });
    // The automatic rejoin intentionally uses the first local-storage snapshot only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!profileSession || profileSession.admin !== undefined) return;
    void refreshProfileAdminStatus(profileSession);
  }, [profileSession]);

  useEffect(() => {
    localStorage.setItem(PLAN_FORM_KEY, JSON.stringify({
      approach: form.approach,
      preparation: form.preparation,
      pitStrategy: form.pitStrategy,
      cardId: form.cardId
    }));
  }, [form.approach, form.preparation, form.pitStrategy, form.cardId]);

  const playerTeam = useMemo(
    () =>
      leagueState?.teams.find((team) => team.id === leagueState.player?.teamId) ??
      (adminInspecting ? undefined : leagueState?.teams.find((team) => team.kind === "human")) ??
      (adminInspecting ? undefined : leagueState?.teams[0]),
    [adminInspecting, leagueState]
  );
  const playerDecision = leagueState?.decisions.find((decision) => decision.teamId === playerTeam?.id);
  const qualifyingRuns = leagueState?.currentGrandPrix.qualifyingRuns ?? [];
  const playerQualifyingRuns = qualifyingRuns.filter((run) => run.teamId === playerTeam?.id);
  const lastQualifyingRun = latestQualifyingRun(playerQualifyingRuns);
  const currentQualifyingResult = qualifyingResult && playerQualifyingRuns.some((run) => run.teamId === qualifyingResult.teamId && run.attempts === qualifyingResult.attempts) ? qualifyingResult : null;
  const replayQualifyingRun = currentQualifyingResult ?? lastQualifyingRun;
  const qualifyingReplayEntries = qualifyingReplayTower(replayQualifyingRun, qualifyingRuns, tt);
  const qualifyingLeaderboardRuns = playerDecision ? bestQualifyingRuns(qualifyingRuns) : qualifyingRuns;
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
  const deskState = isResolved ? "resolved" : playerDecision ? "ready" : "prepare";
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
  const raceDayPhase =
    isResolved
      ? "finished"
      : playerDecision
        ? "locked"
        : qualifyingAttemptsUsed > 0 || qualifyingAttemptsLeft <= 0
          ? "adjust"
          : "briefing";
  const startingGridEntries = leagueState ? startingGrid(leagueState) : [];
  const playerGridPosition = startingGridEntries.find((entry) => entry.team.id === playerTeam?.id)?.position ?? 0;
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
  const seasonRecap = seasonRecapSeason === null ? undefined : completedSeasons.find((season) => season.season === seasonRecapSeason);
  const visibleResult = historyReplay?.result ?? (resultOpen ? result : undefined);
  const visibleResultCircuit = historyReplay && leagueState ? circuitForRound(historyReplay.round, leagueState.league.id, historyReplay.season) : currentCircuit;
  const isSeasonFinalGrandPrix = Boolean(leagueState && leagueState.currentGrandPrix.round >= leagueState.league.maxGrandPrixPerSeason);
  const nextGrandPrixActionLabel = tt(isSeasonFinalGrandPrix ? "action_finish_season" : "action_next_grand_prix");
  const { updateSettings, resolveGrandPrix, startNextGrandPrix, buyCard, sellCard, updateLivery, updateTeamName, restartLeague: restartLeagueState } = createLeagueMutations({
    leagueState,
    playerTeam,
    playerDecision,
    form,
    currentCircuit,
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
  const { openAdminConsole, refreshAdminData, resetAdminRecoveryCode, deleteAdminUserConfirmed, inspectAdminLeague } = createAdminActions({
    profileIsAdmin: Boolean(profileSession?.admin),
    adminToken,
    adminDeleteUser,
    run,
    tt,
    setProfileOpen,
    setGameView,
    setAdminUsers,
    setAdminLeagues,
    setAdminRecoveryCode,
    setAdminDeleteUser,
    setLeagueState,
    setAdminInspecting,
    showStatus
  });
  const { createProfileSession, recoverProfileSession } = createProfileActions({
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
    (deskState === "prepare" && !commandClicks.directive) ||
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
    if (!localStorage.getItem(ONBOARDING_HELP_KEYS.leagueIntro) && !snoozedOnboardingHelp.current.has("leagueIntro")) return;
    if (gameView === "drive" && raceDayPhase === "briefing") openOnboardingHelp("race");
    if (gameView === "plan") openOnboardingHelp("plan");
    if (gameView === "garage") openOnboardingHelp("garage");
  }, [gameView, leagueState, onboardingHelp, preferencesResetSignal, raceDayPhase]);

  useEffect(() => {
    resetCommandClicks();
  }, [currentGrandPrixKey]);

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

  async function createLeague() {
    await run(tt("status_creating_league"), async () => {
      const state = await api<LeagueState>("/leagues", {
        method: "POST",
        body: JSON.stringify({
          name: form.leagueName,
          teamName: form.teamName.trim(),
          profileId: profileSession?.profile.id,
          recoveryCode: profileSession?.recoveryCode,
          maxPlayers: clampNumber(Number(form.maxPlayers), 2, 16),
          fillWithBots: form.fillWithBots,
          qualifyingAttemptLimit: clampNumber(Number(form.qualifyingAttemptLimit), 1, 5),
          maxGrandPrixPerSeason: clampNumber(Number(form.maxGrandPrixPerSeason), 1, 18)
        })
      });
      rememberPlayer(state);
      setAdminInspecting(false);
      setLeagueState(state);
      setGameView("drive");
      showStatus(tt("status_league_created"));
      pushCommandHint("prepare");
    });
  }

  async function joinLeague() {
    await run(tt("status_joining_league"), async () => {
      const state = await api<LeagueState>("/leagues/join", {
        method: "POST",
        body: JSON.stringify({
          code: form.joinCode,
          teamName: form.teamName.trim(),
          profileId: profileSession?.profile.id,
          recoveryCode: profileSession?.recoveryCode
        })
      });
      rememberPlayer(state);
      setAdminInspecting(false);
      setLeagueState(state);
      setGameView("drive");
      showStatus(tt("status_league_joined"));
      pushCommandHint("prepare");
    });
  }

  async function submitDirective() {
    if (!leagueState || !playerTeam) return;
    markCommandClicked("directive");
    if (qualifyingAttemptsUsed === 0 || qualifyingAttemptsLeft > 0) {
      setDirectiveConfirmOpen(true);
      return;
    }
    await submitDirectiveConfirmed();
  }

  async function submitDirectiveConfirmed() {
    const player = leagueState?.player;
    if (!leagueState || !player || !playerTeam) return;
    setDirectiveConfirmOpen(false);
    await run(tt("status_submitting_directive"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/decisions`, {
        method: "POST",
        body: JSON.stringify({
          teamId: playerTeam.id,
          claimCode: player.claimCode,
          approach: form.approach,
          preparation: form.preparation,
          pitStrategy: form.pitStrategy,
          cardId: selectedCardId || undefined
        })
      });
      setLeagueState(withCurrentPlayer(state));
      setQualifyingResult(null);
      showStatus(tt("status_directive_locked"));
      pushCommandHint("ready");
    });
  }

  async function launchQualifyingRun() {
    const player = leagueState?.player;
    if (!leagueState || !player || !playerTeam || qualifyingDisabled) return;

    await run(tt("status_qualifying_running"), async () => {
      const response = await api<{ state: LeagueState; run: QualifyingRun; isBest: boolean }>(`/leagues/${leagueState.league.id}/qualifying`, {
        method: "POST",
        body: JSON.stringify({
          teamId: playerTeam.id,
          claimCode: player.claimCode,
          approach: form.approach,
          preparation: form.preparation,
          pitStrategy: form.pitStrategy,
          cardId: selectedCardId || undefined,
          traits: currentCircuit.traits,
          laps: 3
        })
      });
      setLeagueState(withCurrentPlayer(response.state));
      setQualifyingResult(response.run);
      showStatus(response.isBest ? tt("status_qualifying_best") : tt("status_qualifying_done"));
    });
  }

  function openQualifyingRun() {
    if (qualifyingDisabled) return;
    markCommandClicked("qualifying");
    setQualifyingConfirmOpen(true);
  }

  function openResolveConfirm() {
    markCommandClicked("launchGrandPrix");
    setStartingGridExpanded(false);
    setResolveConfirmOpen(true);
  }

  function openNextGrandPrixConfirm() {
    markCommandClicked("nextGrandPrix");
    setNextGrandPrixConfirmOpen(true);
  }

  function startQualifyingRunConfirmed() {
    setQualifyingConfirmOpen(false);
    setQualifyingResult(null);
    void launchQualifyingRun();
  }

  function openLastQualifyingRun() {
    if (!lastQualifyingRun) return;
    setQualifyingResult(lastQualifyingRun);
  }

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

  async function switchLeague(teamId: string) {
    const claim = savedClaims.find((candidate) => candidate.teamId === teamId);
    if (!claim || claim.teamId === leagueState?.player?.teamId) return;

    await rejoinClaim(claim, { setDrive: true, notify: true });
  }

  async function rejoinClaim(claim: NonNullable<ReturnType<typeof getActiveClaim>>, options: { setDrive: boolean; notify: boolean }) {
    await run(
      tt("status_rejoining_league"),
      async () => {
        const state = await api<LeagueState>("/leagues/rejoin", {
          method: "POST",
          body: JSON.stringify({ teamId: claim.teamId, claimCode: claim.claimCode })
        });
        rememberPlayer(state);
        setAdminInspecting(false);
        setLeagueState(state);
        if (options.setDrive) setGameView("drive");
        if (options.setDrive) setProfileOpen(false);
        showStatus(tt("status_league_rejoined"), "info", options.notify);
        if (options.setDrive) pushCommandHint("prepare");
      },
      claim.teamId,
      options.notify
    );
  }

  async function refreshProfileAdminStatus(session: ProfileSession) {
    try {
      const response = await api<{ admin: boolean }>(`/profiles/${session.profile.id}/admin-status`, { method: "GET" });
      const nextSession = { ...session, admin: response.admin };
      storeProfileSession(nextSession);
      setProfileSession(nextSession);
    } catch {
      const nextSession = { ...session, admin: false };
      storeProfileSession(nextSession);
      setProfileSession(nextSession);
    }
  }

  async function restartLeague() {
    if (!leagueState) return;
    setRestartConfirmOpen(false);
    await restartLeagueState();
  }

  async function run(nextMessage: string, action: () => Promise<void>, staleClaimTeamId?: string, notify = true, errorText?: (error: unknown) => string) {
    closeOpenReplays();
    setStatus("loading");
    setMessage(nextMessage);
    if (notify) pushNotification(nextMessage);

    try {
      await action();
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      if (isStaleLeagueError(error)) {
        forgetClaim(staleClaimTeamId);
        setLeagueState(null);
        showStatus(tt("status_saved_league_expired"), "error", false);
        return;
      }
      const friendlyError = errorText?.(error);
      setTechnicalError(error instanceof Error ? error.message : String(error));
      clearTransientNotifications();
      showStatus(friendlyError ?? (error instanceof TypeError ? tt("status_api_unavailable") : tt("status_request_failed")), "error", notify);
    }
  }

  function closeOpenReplays() {
    if (historyReplay) closeHistoryReplay();
    if (qualifyingResult) setQualifyingResult(null);
    if (resultOpen && result) setResultOpen(false);
  }

  function forgetPlayer() {
    forgetClaim(leagueState?.player?.teamId);
    setLeagueState(null);
    setAdminInspecting(false);
    setGameView("drive");
    showStatus(tt("status_player_forgotten"));
  }

  function addLeague() {
    goHome();
  }

  function goHome() {
    setLeagueState(null);
    setAdminInspecting(false);
    setGameView("drive");
    setSetupMode("choice");
    setProfileOpen(false);
    closeHistoryReplay();
    setResultOpen(true);
    showStatus(tt("status_initial"));
  }

  async function copyProfileCode() {
    const code = profileSession?.recoveryCode;
    if (!code) {
      showStatus(tt("status_profile_code_missing"), "error", false);
      return;
    }

    await copyText(code);

    showStatus(`${tt("status_profile_code_copied")} ${code}`, "info", Boolean(leagueState));
  }

  async function copyTechnicalError() {
    if (!technicalError) return;
    await copyText(technicalError);
    showStatus(tt("status_error_copied"), "info", Boolean(leagueState));
  }

  function forgetProfile() {
    localStorage.removeItem(PROFILE_SESSION_KEY);
    setProfileSession(null);
    setLeagueState(null);
    setAdminInspecting(false);
    setProfileLogoutOpen(false);
    setProfileCodeOpen(false);
    setProfileOpen(false);
    setProfileMode("choice");
    setSetupMode("choice");
    setSavedClaims([]);
    storePlayerClaims([], undefined);
    showStatus(tt("status_initial"));
  }

  function changeLocale(nextLocale: Locale) {
    localStorage.setItem(LANGUAGE_KEY, nextLocale);
    setLocaleState(nextLocale);
    if (!leagueState && message === t("status_initial", locale)) {
      setMessage(t("status_initial", nextLocale));
    }
  }

  const languageSwitcher = <LanguageSwitcher locale={locale} tt={tt} onChangeLocale={changeLocale} />;

  function resetUiPreferences() {
    for (const key of UI_PREFERENCE_KEYS) localStorage.removeItem(key);
    const seasonRecapKeys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(
      (key): key is string => key !== null && key.startsWith(`${SEASON_RECAP_KEY_PREFIX}:`)
    );
    for (const key of seasonRecapKeys) localStorage.removeItem(key);
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
    <SetupTopbar profileMenu={profileSession ? profileMenu(false, false) : null} languageSwitcher={languageSwitcher} onHome={goHome} />
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
      onResolveGrandPrix={() => void resolveGrandPrix()}
      onStartQualifyingRunConfirmed={startQualifyingRunConfirmed}
      onStartNextGrandPrix={() => void startNextGrandPrix()}
      onOpenResultReport={() => {
        setNextGrandPrixConfirmOpen(false);
        setGameView("drive");
        setResultTab("report");
        setResultOpen(true);
      }}
      onUpdateSettings={updateSettings}
      onForgetPlayer={forgetPlayer}
      onRestartLeague={() => void restartLeague()}
      onCloseOnboardingHelp={closeOnboardingHelp}
      onCloseAdminDelete={() => setAdminDeleteUser(null)}
      onDeleteAdminUser={() => void deleteAdminUserConfirmed()}
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
      locale={locale}
      loading={status === "loading"}
      pendingMessage={pendingMessage}
      onDeleteUser={setAdminDeleteUser}
      onInspectLeague={(league) => void inspectAdminLeague(league)}
      onRefresh={() => void refreshAdminData()}
      onResetRecoveryCode={(user) => void resetAdminRecoveryCode(user)}
      onSetAdminTab={setAdminTab}
      onSetAdminToken={setAdminToken}
      tt={tt}
    />
  );

  if (!profileSession || !leagueState) {
    return (
      <SetupGate
        profileSession={profileSession}
        leagueState={leagueState}
        gameView={gameView}
        adminView={adminView}
        setupTopbar={setupTopbar}
        notificationStack={notificationStack}
        overlays={commonOverlays}
        form={form}
        message={message}
        profileMode={profileMode}
        profileForm={profileForm}
        profileFormError={profileFormError}
        setupMode={setupMode}
        savedClaims={savedClaims}
        savedLeagueIndex={savedLeagueIndex}
        status={status}
        pendingMessage={pendingMessage}
        setForm={setForm}
        setProfileMode={setProfileMode}
        setProfileForm={setProfileForm}
        setProfileFormError={setProfileFormError}
        setSetupMode={setSetupMode}
        setSavedLeagueIndex={setSavedLeagueIndex}
        createProfileSession={() => void createProfileSession()}
        recoverProfileSession={() => void recoverProfileSession()}
        createLeague={() => void createLeague()}
        joinLeague={() => void joinLeague()}
        switchLeague={(teamId) => void switchLeague(teamId)}
        tt={tt}
      />
    );
  }

  const isMapScreen = gameView === "drive" && (!visibleResult || resultTab === "replay");
  const selectGameView = (view: GameView) => {
    clearTransientNotifications();
    clearScreenOnboardingSnoozes();
    closeHistoryReplay();
    setGameView(view);
    if (view === "plan") setPlanSubscreen("plan");
    if (view === "drive" && result) setResultOpen(false);
  };

  return (
    <main className={isMapScreen ? "app-shell game-shell map-screen" : "app-shell game-shell"}>
      <GameTopbar leagueName={leagueState.league.name} gameView={gameView} profileMenu={profileMenu()} tt={tt} onHome={goHome} onSelectView={selectGameView} />

      <section className="view-container">
        {adminInspecting ? (
          <div className="admin-inspection-banner" role="status">
            <strong>{tt("admin_inspection_banner")}</strong>
            <button
              type="button"
              onClick={() => {
                setGameView("admin");
                setLeagueState(null);
                setAdminInspecting(false);
              }}
            >
              {tt("admin_action_back_to_console")}
            </button>
          </div>
        ) : null}
        <GameViews
          gameView={gameView}
          state={leagueState}
          visibleResult={visibleResult}
          visibleResultCircuit={visibleResultCircuit}
          playerTeam={playerTeam}
          playerDecision={playerDecision}
          resultTab={resultTab}
          replayTraitImpacts={replayTraitImpacts}
          preferencesResetSignal={preferencesResetSignal}
          historyReplay={historyReplay}
          currentCircuit={currentCircuit}
          directiveStep={directiveStep}
          status={status}
          form={form}
          ownedCardIds={ownedCardIds}
          planSubscreen={planSubscreen}
          playerQualifyingRuns={playerQualifyingRuns}
          qualifyingAttemptLimit={qualifyingAttemptLimit}
          qualifyingAttemptsLeft={qualifyingAttemptsLeft}
          selectedCardFit={selectedCardFit}
          selectedCardId={selectedCardId}
          championshipRecordTab={championshipRecordTab}
          playerResult={playerResult}
          consumedCardIds={consumedCardIds}
          forecastPick={forecastPick}
          isResolved={isResolved}
          pendingMessage={pendingMessage}
          garagePanel={garagePanel}
          adminView={adminView}
          chronoReport={chronoReport}
          qualifyingLockedCardId={qualifyingLockedCardId}
          profileIsAdmin={Boolean(profileSession?.admin)}
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
        {gameView === "drive" && !historyReplay && (!result || !resultOpen) ? (
          <DriveView
            state={leagueState}
            result={result}
            currentQualifyingResult={currentQualifyingResult}
            currentCircuit={currentCircuit}
            qualifyingReplayCircuit={qualifyingReplayCircuit}
            playerTeam={playerTeam}
            mapPlan={mapPlan}
            directiveTraitImpacts={directiveTraitImpacts}
            replayTraitImpacts={replayTraitImpacts}
            forecastPick={forecastPick}
            raceDayPhase={raceDayPhase}
            qualifyingAttemptsUsed={qualifyingAttemptsUsed}
            qualifyingAttemptLimit={qualifyingAttemptLimit}
            qualifyingAttemptsLeft={qualifyingAttemptsLeft}
            qualifyingPanelOpen={qualifyingPanelOpen}
            qualifyingLeaderboard={qualifyingLeaderboard}
            qualifyingReplayEntries={qualifyingReplayEntries}
            commandClicks={commandClicks}
            primaryCommandClass={primaryCommandClass}
            primaryCommand={primaryCommand}
            deskState={deskState}
            lastQualifyingRun={lastQualifyingRun}
            qualifyingDisabled={qualifyingDisabled}
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
      {commonOverlays}
    </main>
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

  function openOnboardingHelp(topic: OnboardingHelpTopic) {
    if (localStorage.getItem(ONBOARDING_HELP_KEYS[topic]) || snoozedOnboardingHelp.current.has(topic)) return;
    setOnboardingHelp(topic);
  }

  function closeOnboardingHelp(topic: OnboardingHelpTopic, dismiss: boolean) {
    if (dismiss) localStorage.setItem(ONBOARDING_HELP_KEYS[topic], "1");
    else snoozedOnboardingHelp.current.add(topic);
    setOnboardingHelp(null);
  }
}

function isStaleLeagueError(error: unknown) {
  return error instanceof ApiError && error.statusCode === 404 && localStorage.getItem(ACTIVE_PLAYER_CLAIM_KEY);
}
