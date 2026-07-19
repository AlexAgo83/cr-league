import { APP_NAME, APP_VERSION, PIT_STRATEGIES, RACE_APPROACHES, TECHNICAL_PREPARATIONS, type CardId, type QualifyingRun, type Weather } from "@cr-league/shared";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isLocale, t, type Locale, type TranslationKey } from "../i18n/index.js";
import { circuitForRound } from "./circuits.js";
import { cardFit, clampNumber, completedSeasonSummaries, startingGrid, strongestForecast } from "./helpers.js";
import { GAME_VIEWS, type AdminLeague, type AdminUser, type FormState, type LeagueState, type ProfileSession } from "./types.js";
import { AdminConsoleView, type AdminTab } from "../features/AdminConsoleView.js";
import { AssetImage } from "../features/AssetImage.js";
import { CHAMPIONSHIP_RECORD_TAB_KEY, ChampionshipView } from "../features/ChampionshipView.js";
import { ChangelogView } from "../features/ChangelogView.js";
import { CircuitMap, MapTraitsPanel, circuitRouteAnalysis } from "../features/CircuitMap.js";
import { DIRECTIVE_STEP_KEY } from "../features/DirectivePanel.js";
import { GARAGE_PANEL_KEY, GarageView } from "../features/GarageView.js";
import { LiveryPlate } from "../features/LiveryPlate.js";
import { Modal } from "../features/Modal.js";
import { ModalHero } from "../features/ModalHero.js";
import { PendingFeedback } from "../features/PendingFeedback.js";
import { PlanView } from "../features/PlanView.js";
import { PositionBadge } from "../features/PositionBadge.js";
import { DISMISSED_REPLAY_HELP_KEY, REPLAY_FOCUS_KEY, REPLAY_SPEED_KEY, ReplayView } from "../features/ReplayView.js";
import { ResultView, type ResultTab } from "../features/ResultView.js";
import { RewardValue } from "../features/RewardValue.js";
import { CountryBadge, VisualIcon } from "../features/VisualIcon.js";
import { LeagueIntroModal, ONBOARDING_HELP_KEYS, OnboardingHelpModal, SCREEN_ONBOARDING_HELP_TOPICS, SetupShell, type OnboardingHelpTopic } from "./OnboardingShell.js";
import {
  ACTIVE_PLAYER_CLAIM_KEY,
  ApiError,
  LANGUAGE_KEY,
  PROFILE_SESSION_KEY,
  SEASON_RECAP_KEY_PREFIX,
  api,
  claimFromState,
  claimsFromProfile,
  copyText,
  getActiveClaim,
  loadPlayerClaims,
  loadProfileSession,
  seasonRecapStorageKey,
  storePlayerClaims,
  storeProfileSession,
  upsertPlayerClaim
} from "./appStorage.js";
import { bestQualifyingRuns, buildChronoReport, createInitialForm, latestQualifyingRun, qualifyingReplayTower, traitImpacts } from "./raceFlow.js";
import { isGrandPrixRouteId, shortGrandPrixId } from "./routes.js";
import { LeagueSetupView, ProfileSetupView, type ProfileMode, type SetupMode } from "./SetupViews.js";
import { useAppNavigation } from "./useAppNavigation.js";

const UI_PREFERENCE_KEYS = [DISMISSED_REPLAY_HELP_KEY, REPLAY_SPEED_KEY, REPLAY_FOCUS_KEY, GARAGE_PANEL_KEY, CHAMPIONSHIP_RECORD_TAB_KEY, DIRECTIVE_STEP_KEY, ...Object.values(ONBOARDING_HELP_KEYS)] as const;
const PLAN_FORM_KEY = "cr-league-plan-form";
type Notification = { id: number; text: string; tone: "info" | "error"; persistent?: boolean };

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
  const [qualifyingCommandClicked, setQualifyingCommandClicked] = useState(false);
  const [editPlanCommandClicked, setEditPlanCommandClicked] = useState(false);
  const [directiveCommandClicked, setDirectiveCommandClicked] = useState(false);
  const [chronoReportCommandClicked, setChronoReportCommandClicked] = useState(false);
  const [launchGrandPrixCommandClicked, setLaunchGrandPrixCommandClicked] = useState(false);
  const [resultReportCommandClicked, setResultReportCommandClicked] = useState(false);
  const [nextGrandPrixCommandClicked, setNextGrandPrixCommandClicked] = useState(false);
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
    if (!profileSession) return;
    const saved = getActiveClaim(savedClaims);
    if (!saved) return;
    void run(
      tt("status_rejoining_league"),
      async () => {
        const state = await api<LeagueState>("/leagues/rejoin", {
          method: "POST",
          body: JSON.stringify({ teamId: saved.teamId, claimCode: saved.claimCode })
        });
        rememberPlayer(state);
        setAdminInspecting(false);
        setLeagueState(state);
        showStatus(tt("status_league_rejoined"), "info", false);
      },
      saved.teamId,
      false
    );
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
  const playerResult = result?.classification.find((entry) => entry.teamId === playerTeam?.id);
  const consumedCardIds = result?.consumedCards.filter((card) => card.teamId === playerTeam?.id).map((card) => card.cardId) ?? [];
  const deskState = isResolved ? "resolved" : playerDecision ? "ready" : "prepare";
  const currentCircuit = leagueState
    ? circuitForRound(leagueState.currentGrandPrix.round, leagueState.league.id, leagueState.currentGrandPrix.season)
    : circuitForRound(1);
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
    (deskState === "prepare" && !directiveCommandClicked) ||
    (deskState === "ready" && !launchGrandPrixCommandClicked) ||
    (deskState === "resolved" && !nextGrandPrixCommandClicked)
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
    setQualifyingCommandClicked(false);
    setEditPlanCommandClicked(false);
    setDirectiveCommandClicked(false);
    setChronoReportCommandClicked(false);
    setLaunchGrandPrixCommandClicked(false);
    setResultReportCommandClicked(false);
    setNextGrandPrixCommandClicked(false);
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
          profileId: profileSession?.profile.id
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
    setDirectiveCommandClicked(true);
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
          laps: currentCircuit.laps
        })
      });
      setLeagueState(withCurrentPlayer(response.state));
      setQualifyingResult(response.run);
      showStatus(response.isBest ? tt("status_qualifying_best") : tt("status_qualifying_done"));
    });
  }

  function openQualifyingRun() {
    if (qualifyingDisabled) return;
    setQualifyingCommandClicked(true);
    setQualifyingConfirmOpen(true);
  }

  function openResolveConfirm() {
    setLaunchGrandPrixCommandClicked(true);
    setStartingGridExpanded(false);
    setResolveConfirmOpen(true);
  }

  function openNextGrandPrixConfirm() {
    setNextGrandPrixCommandClicked(true);
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

  async function mutateLeague(loadingKey: TranslationKey, path: string, body: unknown, successKey: TranslationKey) {
    await run(tt(loadingKey), async () => {
      const state = await api<LeagueState>(path, {
        method: "POST",
        body: body === undefined ? undefined : JSON.stringify(body)
      });
      setLeagueState(withCurrentPlayer(state));
      showStatus(tt(successKey));
    });
  }

  async function updateSettings() {
    if (!leagueState) return;

    await mutateLeague("status_updating_settings", `/leagues/${leagueState.league.id}/settings`, {
      teamId: leagueState.player?.teamId,
      claimCode: leagueState.player?.claimCode,
      cadence: form.cadence,
      preparationDeadlineAt: form.preparationDeadlineAt ? new Date(form.preparationDeadlineAt).toISOString() : null
    }, "status_settings_updated");
  }

  async function resolveGrandPrix() {
    if (!leagueState) return;
    setResolveConfirmOpen(false);

    await run(tt("status_resolving_grand_prix"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/resolve`, {
        method: "POST",
        body: JSON.stringify({
          teamId: leagueState.player?.teamId,
          claimCode: leagueState.player?.claimCode,
          allowDefaults: !playerDecision,
          traits: currentCircuit.traits,
          trackLengthMeters: currentCircuit.trackLengthMeters,
          laps: currentCircuit.laps,
          pitLaneProgress: currentPitLaneProgress()
        })
      });
      setLeagueState(withCurrentPlayer(state));
      setGameView("drive");
      setResultTab("replay");
      setResultOpen(true);
      pushCommandHint("resolved");
    });
  }

  function currentPitLaneProgress() {
    const analysis = circuitRouteAnalysis(currentCircuit);
    return (((analysis.pitProgress - analysis.startProgress) % 1) + 1) % 1;
  }

  async function startNextGrandPrix() {
    if (!leagueState) return;
    const finishingSeason = leagueState.currentGrandPrix.round >= leagueState.league.maxGrandPrixPerSeason;
    setNextGrandPrixConfirmOpen(false);
    setRouteReplayGrandPrixId(undefined);
    setHistoryReplay(null);
    setResultOpen(false);
    setGameView("drive");

    await run(tt(finishingSeason ? "status_finishing_season" : "status_starting_next_grand_prix"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/next-grand-prix`, {
        method: "POST",
        body: JSON.stringify({
          teamId: leagueState.player?.teamId,
          claimCode: leagueState.player?.claimCode
        })
      });
      setLeagueState(withCurrentPlayer(state));
      setGameView("drive");
      setResultOpen(false);
      showStatus(tt(finishingSeason ? "status_season_finished" : "status_next_grand_prix_started"));
      pushCommandHint("prepare");
    });
  }

  async function buyCard(cardId: CardId) {
    if (!leagueState || !playerTeam) return;

    await mutateLeague("status_buying_card", `/leagues/${leagueState.league.id}/cards/buy`, {
      teamId: playerTeam.id,
      claimCode: leagueState.player?.claimCode,
      cardId
    }, "status_card_bought");
  }

  async function sellCard(cardId: CardId) {
    if (!leagueState || !playerTeam) return;

    await mutateLeague("status_selling_card", `/leagues/${leagueState.league.id}/cards/sell`, {
      teamId: playerTeam.id,
      claimCode: leagueState.player?.claimCode,
      cardId
    }, "status_card_sold");
  }

  async function updateLivery(livery: LeagueState["teams"][number]["livery"]) {
    if (!leagueState || !playerTeam) return;

    await mutateLeague("status_livery_updating", `/leagues/${leagueState.league.id}/teams/livery`, {
      teamId: playerTeam.id,
      claimCode: leagueState.player?.claimCode,
      livery
    }, "status_livery_updated");
  }

  async function updateTeamName(name: string) {
    if (!leagueState || !playerTeam) return;

    await run(tt("status_team_name_updating"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/teams/name`, {
        method: "POST",
        body: JSON.stringify({
          teamId: playerTeam.id,
          claimCode: leagueState.player?.claimCode,
          name
        })
      });
      const nextState = withCurrentPlayer(state);
      setLeagueState(nextState);
      rememberPlayer(nextState);
      showStatus(tt("status_team_name_updated"));
    });
  }

  async function createProfileSession() {
    const email = profileForm.email.trim();
    const error = validateProfileForm(email);
    if (error) {
      setProfileFormError(error);
      return;
    }
    setProfileFormError(null);

    await run(tt("status_creating_profile"), async () => {
      const session = await api<ProfileSession>("/profiles", {
        method: "POST",
        body: JSON.stringify({ email })
      });
      storeProfileSession(session);
      setProfileSession(session);
      setSavedClaims(claimsFromProfile(session));
      setSetupMode("choice");
      setProfileOpen(false);
      showStatus(`${tt("status_profile_created")} ${session.recoveryCode ?? ""}`, "info", false);
      openOnboardingHelp("profileCode");
    }, undefined, true, (error) => profileApiErrorMessage(error, "create"));
  }

  async function recoverProfileSession() {
    const email = profileForm.email.trim();
    const recoveryCode = profileForm.recoveryCode.trim().toUpperCase();
    const error = validateProfileForm(email, recoveryCode);
    if (error) {
      setProfileFormError(error);
      return;
    }
    setProfileFormError(null);

    await run(tt("status_recovering_profile"), async () => {
      const session = await api<ProfileSession>("/profiles/recover", {
        method: "POST",
        body: JSON.stringify({ email, recoveryCode })
      });
      storeProfileSession(session);
      const claims = claimsFromProfile(session);
      storePlayerClaims(claims, claims[0]?.teamId);
      setProfileSession(session);
      setSavedClaims(claims);
      setSetupMode("choice");
      setProfileOpen(false);
      showStatus(tt("status_profile_recovered"), "info", false);
    }, undefined, true, (error) => profileApiErrorMessage(error, "recover"));
  }

  async function switchLeague(teamId: string) {
    const claim = savedClaims.find((candidate) => candidate.teamId === teamId);
    if (!claim || claim.teamId === leagueState?.player?.teamId) return;

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
        setGameView("drive");
        setProfileOpen(false);
        showStatus(tt("status_league_rejoined"));
        pushCommandHint("prepare");
      },
      claim.teamId
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

  async function openAdminConsole() {
    if (!profileSession?.admin) return;
    setProfileOpen(false);
    setGameView("admin");
    if (!adminToken.trim()) return;
    await refreshAdminData();
  }

  async function refreshAdminData() {
    if (!adminToken.trim()) {
      showStatus(tt("admin_token_required"), "error", false);
      return;
    }

    await run(tt("status_admin_loading"), async () => {
      const [users, leagues] = await Promise.all([
        api<{ users: AdminUser[] }>("/admin/users", { method: "GET", headers: adminHeaders() }),
        api<{ leagues: AdminLeague[] }>("/admin/leagues", { method: "GET", headers: adminHeaders() })
      ]);
      setAdminUsers(users.users);
      setAdminLeagues(leagues.leagues);
      showStatus(tt("status_admin_loaded"), "info", false);
    }, undefined, false, adminApiErrorMessage);
  }

  async function resetAdminRecoveryCode(user: AdminUser) {
    await run(tt("status_admin_resetting_recovery"), async () => {
      const response = await api<{ recoveryCode: string }>(`/admin/users/${user.id}/recovery-code`, {
        method: "POST",
        headers: adminHeaders()
      });
      setAdminRecoveryCode({ email: user.email, code: response.recoveryCode });
      await refreshAdminUsers();
      showStatus(tt("status_admin_recovery_reset"), "info", false);
    }, undefined, false, adminApiErrorMessage);
  }

  async function deleteAdminUserConfirmed() {
    if (!adminDeleteUser) return;
    const user = adminDeleteUser;
    setAdminDeleteUser(null);
    await run(tt("status_admin_deleting_user"), async () => {
      await api<{ ok: boolean }>(`/admin/users/${user.id}`, {
        method: "DELETE",
        headers: adminHeaders()
      });
      setAdminRecoveryCode(null);
      await refreshAdminUsers();
      showStatus(tt("status_admin_user_deleted"), "info", false);
    }, undefined, false, adminApiErrorMessage);
  }

  async function inspectAdminLeague(league: AdminLeague) {
    await run(tt("status_admin_inspecting_league"), async () => {
      const state = await api<LeagueState>(`/admin/leagues/${league.id}`, {
        method: "GET",
        headers: adminHeaders()
      });
      setLeagueState({ ...state, player: undefined });
      setAdminInspecting(true);
      setGameView("championship");
      showStatus(tt("status_admin_league_loaded"), "info", false);
    }, undefined, false, adminApiErrorMessage);
  }

  async function refreshAdminUsers() {
    const response = await api<{ users: AdminUser[] }>("/admin/users", { method: "GET", headers: adminHeaders() });
    setAdminUsers(response.users);
  }

  function adminHeaders() {
    return { authorization: `Bearer ${adminToken.trim()}` };
  }

  function adminApiErrorMessage(error: unknown) {
    if (error instanceof ApiError && error.statusCode === 503) return tt("admin_error_unconfigured");
    if (error instanceof ApiError && error.statusCode === 403) return tt("admin_error_forbidden");
    if (error instanceof TypeError) return tt("status_api_unavailable");
    return tt("status_request_failed");
  }

  async function restartLeague() {
    if (!leagueState || !window.confirm(tt("restart_confirm"))) return;

    await mutateLeague("status_restarting_league", `/leagues/${leagueState.league.id}/restart`, {
      teamId: leagueState.player?.teamId,
      claimCode: leagueState.player?.claimCode
    }, "status_league_restarted");
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

  function validateProfileForm(email: string, recoveryCode?: string) {
    if (!email) return tt("profile_error_email_required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return tt("profile_error_email_invalid");
    if (recoveryCode !== undefined && !recoveryCode) return tt("profile_error_recovery_code_required");
    return null;
  }

  function profileApiErrorMessage(error: unknown, mode: Exclude<ProfileMode, "choice">) {
    if (error instanceof TypeError) return tt("status_api_unavailable");
    if (error instanceof ApiError && error.statusCode >= 500) return tt("status_request_failed");
    if (mode === "recover" && error instanceof ApiError && [400, 401, 403, 404].includes(error.statusCode)) return tt("profile_error_recovery_failed");
    if (mode === "create" && error instanceof ApiError && error.statusCode === 409) return tt("profile_error_create_conflict");
    return mode === "create" ? tt("profile_error_create_failed") : tt("profile_error_recovery_failed");
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

  function languageSwitcher() {
    return (
      <div className="language-select" role="group" aria-label={tt("language_label")}>
        <span>{tt("language_label")}</span>
        {(["en", "fr"] as const).map((nextLocale) => (
          <button key={nextLocale} type="button" className={locale === nextLocale ? "active" : undefined} aria-pressed={locale === nextLocale} onClick={() => changeLocale(nextLocale)}>
            <CountryBadge country={nextLocale === "en" ? "GB" : "FR"} />
            {tt(`language_${nextLocale}`)}
          </button>
        ))}
      </div>
    );
  }

  function resetUiPreferences() {
    for (const key of UI_PREFERENCE_KEYS) localStorage.removeItem(key);
    const seasonRecapKeys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(
      (key): key is string => key !== null && key.startsWith(`${SEASON_RECAP_KEY_PREFIX}:`)
    );
    for (const key of seasonRecapKeys) localStorage.removeItem(key);
    snoozedOnboardingHelp.current.clear();
    setQualifyingCommandClicked(false);
    setEditPlanCommandClicked(false);
    setDirectiveCommandClicked(false);
    setChronoReportCommandClicked(false);
    setLaunchGrandPrixCommandClicked(false);
    setResultReportCommandClicked(false);
    setNextGrandPrixCommandClicked(false);
    setPreferencesResetSignal((signal) => signal + 1);
    setPreferencesResetOpen(false);
    setProfileOpen(false);
    showStatus(tt("status_ui_preferences_reset"), "info", Boolean(leagueState));
  }

  function closeLeagueControls() {
    setLeagueControlsOpen(false);
    setProfileOpen(false);
  }

  function profileMenu(showManageLeague = true, showLeagueSwitch = true) {
    return (
    <div
      className="profile-menu"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setProfileOpen(false);
      }}
    >
      <button type="button" className="profile-menu-button" aria-label={tt("profile_menu")} aria-expanded={profileOpen} onClick={() => setProfileOpen((open) => !open)}>
        {playerTeam?.name.slice(0, 2).toUpperCase() ?? "CR"}
      </button>
      {profileOpen ? (
        <div className="profile-menu-panel">
          <PendingFeedback message={pendingMessage} />
          {showLeagueSwitch && savedClaims.length > 1 ? (
            <label>
              {tt("profile_league_switch")}
              <select value={leagueState?.player?.teamId ?? ""} onChange={(event) => void switchLeague(event.target.value)}>
                {savedClaims.map((claim) => (
                  <option key={claim.teamId} value={claim.teamId}>
                    {claim.leagueName} · {claim.teamName}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {showManageLeague ? (
            <button type="button" className="profile-menu-action" onClick={addLeague}>
              {tt("action_add_league")}
            </button>
          ) : null}
          {leagueState ? (
            <button
              type="button"
              className="profile-menu-action"
              onClick={() => {
                setLeagueControlsOpen(true);
                setProfileOpen(false);
              }}
            >
              {tt("settings_title")}
            </button>
          ) : null}
          {profileSession?.admin ? (
            <button type="button" className="profile-menu-action profile-menu-action-info" onClick={() => void openAdminConsole()}>
              {tt("admin_action_open")}
            </button>
          ) : null}
          {profileSession?.recoveryCode ? (
            <button
              type="button"
              className="profile-menu-action profile-menu-action-info"
              onClick={() => {
                setProfileCodeOpen(true);
                setProfileOpen(false);
              }}
            >
              {tt("action_copy_profile_code")}
            </button>
          ) : null}
          {languageSwitcher()}
          <button
            type="button"
            className="profile-menu-action profile-menu-action-info"
            onClick={() => {
              setPreferencesResetOpen(true);
              setProfileOpen(false);
            }}
          >
            {tt("action_reset_ui_preferences")}
          </button>
          <button
            type="button"
            className="profile-menu-action profile-menu-action-danger"
            onClick={() => {
              setProfileLogoutOpen(true);
              setProfileOpen(false);
            }}
          >
            {tt("action_forget_profile")}
          </button>
          <button
            type="button"
            className="profile-menu-version"
            onClick={() => {
              setGameView("changelog");
              setProfileOpen(false);
              setResultOpen(false);
            }}
          >
            v{APP_VERSION}
          </button>
        </div>
      ) : null}
    </div>
    );
  }

  const setupTopbar = (
    <header className="setup-topbar">
      <button type="button" className="brand brand-button" onClick={goHome}>
        <AssetImage className="brand-icon" src="/favicon.svg" alt="" />
        <strong>{APP_NAME}</strong>
      </button>
      <div className="setup-topbar-actions">
        {profileSession ? (
          profileMenu(false, false)
        ) : (
          languageSwitcher()
        )}
      </div>
    </header>
  );

  const profileCodeModal = profileCodeOpen ? (
    <Modal label={tt("profile_code_title")} closeLabel={tt("action_close")} showCloseButton onClose={() => setProfileCodeOpen(false)}>
      <ModalHero image="/assets/crl/profile-arrival.png" kicker={tt("profile_kicker")} title={tt("profile_code_title")} />
      {profileSession?.recoveryCode ? (
        <input
          className="profile-code-input"
          aria-label={tt("action_copy_profile_code")}
          readOnly
          value={profileSession.recoveryCode}
          onClick={(event) => {
            event.currentTarget.select();
            void copyProfileCode();
          }}
        />
      ) : (
        <p>{tt("status_profile_code_missing")}</p>
      )}
    </Modal>
  ) : null;

  const profileLogoutModal = profileLogoutOpen ? (
    <Modal label={tt("profile_logout_title")} closeLabel={tt("action_close")} showCloseButton onClose={() => setProfileLogoutOpen(false)}>
      <ModalHero image="/assets/crl/profile-arrival.png" kicker={tt("profile_kicker")} title={tt("profile_logout_title")} />
      <p>{tt("profile_logout_confirm")}</p>
      <div className="actions secondary-actions">
        <button type="button" className="danger-button" onClick={forgetProfile}>
          {tt("action_forget_profile")}
        </button>
      </div>
    </Modal>
  ) : null;

  const preferencesResetModal = preferencesResetOpen ? (
    <Modal label={tt("preferences_reset_title")} closeLabel={tt("action_close")} showCloseButton onClose={() => setPreferencesResetOpen(false)}>
      <ModalHero image="/assets/crl/profile-arrival.png" kicker={tt("profile_kicker")} title={tt("preferences_reset_title")} />
      <p>{tt("preferences_reset_confirm")}</p>
      <div className="actions secondary-actions">
        <button type="button" className="danger-button" onClick={resetUiPreferences}>
          {tt("action_reset_ui_preferences")}
        </button>
      </div>
    </Modal>
  ) : null;

  const errorModal = technicalError ? (
    <Modal label={tt("error_modal_title")} closeLabel={tt("action_close")} showCloseButton onClose={() => setTechnicalError(null)}>
      <ModalHero image="/assets/crl/pit-wall-mobile.png" kicker={tt("error_modal_kicker")} title={tt("error_modal_title")} />
      <p>{tt("error_modal_body")}</p>
      <div className="actions secondary-actions">
        <button type="button" className="secondary-button" onClick={() => void copyTechnicalError()}>
          {tt("action_copy_error")}
        </button>
      </div>
    </Modal>
  ) : null;

  const directiveConfirmModal = directiveConfirmOpen ? (
    <Modal label={tt("directive_confirm_title")} closeLabel={tt("action_close")} showCloseButton onClose={() => setDirectiveConfirmOpen(false)}>
      <ModalHero image="/assets/crl/send-plan-modal.png" kicker={tt("qualifying_kicker")} title={tt("directive_confirm_title")} />
      <p>
        {qualifyingAttemptsUsed === 0
          ? tt("directive_confirm_no_qualifying")
          : `${tt("directive_confirm_remaining")} ${qualifyingAttemptsLeft}/${qualifyingAttemptLimit}`}
      </p>
      <div className="actions secondary-actions">
        <PendingFeedback message={pendingMessage} />
        <button type="button" onClick={submitDirectiveConfirmed} disabled={status === "loading"}>
          {tt("action_submit_directive")}
        </button>
      </div>
    </Modal>
  ) : null;
  const displayedStartingGridEntries = startingGridExpanded ? startingGridEntries : startingGridEntries.slice(0, 4);
  const hiddenStartingGridCount = startingGridEntries.length - displayedStartingGridEntries.length;
  const resolveConfirmModal = resolveConfirmOpen ? (
    <Modal label={tt("launch_gp_confirm_title")} closeLabel={tt("action_close")} showCloseButton onClose={() => setResolveConfirmOpen(false)}>
      <ModalHero image="/assets/crl/launch-gp-modal.png" kicker={tt("action_launch_grand_prix")} title={tt("launch_gp_confirm_title")} />
      <p>{tt("launch_gp_confirm_body")}</p>
      <div className="starting-grid-confirmation">
        <div>
          <span className="section-kicker">{tt("starting_grid_title")}</span>
          <strong>{tt(currentCircuit.layoutKey)}</strong>
          <small>
            <CountryBadge country={currentCircuit.country} /> {currentCircuit.city} · {tt("briefing_forecast")} {tt(`weather_${forecastPick}` as TranslationKey)}
          </small>
          <small>
            {tt("circuit_grip")} {currentCircuit.traits.grip} · {tt("circuit_overtaking")} {currentCircuit.traits.overtaking} · {tt("circuit_energy")}{" "}
            {currentCircuit.traits.energy}
          </small>
        </div>
        <ol className="starting-grid-list">
          {displayedStartingGridEntries.map((entry) => (
            <li key={entry.team.id} className={entry.team.id === playerTeam?.id ? "current-team" : undefined}>
              <PositionBadge position={entry.position} />
              <LiveryPlate className="standings-livery-plate" livery={entry.team.livery} name={entry.team.name} />
              <strong>{entry.team.name}</strong>
              <small>{entry.bestTime === undefined ? tt("starting_grid_no_time") : `${entry.bestTime.toFixed(2)}s`}</small>
            </li>
          ))}
        </ol>
        {hiddenStartingGridCount > 0 ? (
          <button type="button" className="secondary-button starting-grid-more-button" onClick={() => setStartingGridExpanded(true)}>
            {tt("action_show_full_grid")} ({hiddenStartingGridCount})
          </button>
        ) : null}
      </div>
      <div className="actions secondary-actions">
        <PendingFeedback message={pendingMessage} />
        <button type="button" onClick={() => void resolveGrandPrix()} disabled={status === "loading"}>
          {tt("action_launch_grand_prix")}
        </button>
      </div>
    </Modal>
  ) : null;
  const qualifyingConfirmModal = qualifyingConfirmOpen ? (
    <Modal label={tt("qualifying_confirm_title")} closeLabel={tt("action_close")} showCloseButton onClose={() => setQualifyingConfirmOpen(false)}>
      <ModalHero image="/assets/crl/qualifying-modal.png" kicker={tt("qualifying_kicker")} title={tt("qualifying_confirm_title")} />
      <p>
        {tt("qualifying_confirm_body")} {tt("qualifying_remaining")} {qualifyingAttemptsLeft}/{qualifyingAttemptLimit}
      </p>
      <div className="actions secondary-actions">
        <PendingFeedback message={pendingMessage} />
        <button type="button" onClick={startQualifyingRunConfirmed} disabled={status === "loading"}>
          {tt("action_qualifying")}
        </button>
      </div>
    </Modal>
  ) : null;
  const nextGrandPrixConfirmModal = nextGrandPrixConfirmOpen ? (
    <Modal label={tt(isSeasonFinalGrandPrix ? "finish_season_confirm_title" : "next_gp_confirm_title")} closeLabel={tt("action_close")} showCloseButton onClose={() => setNextGrandPrixConfirmOpen(false)}>
      <ModalHero image="/assets/crl/next-gp-modal.png" kicker={nextGrandPrixActionLabel} title={tt(isSeasonFinalGrandPrix ? "finish_season_confirm_title" : "next_gp_confirm_title")} />
      <p>{tt(isSeasonFinalGrandPrix ? "finish_season_confirm_body" : "next_gp_confirm_body")}</p>
      <div className="actions secondary-actions">
        <PendingFeedback message={pendingMessage} />
        <button type="button" onClick={() => void startNextGrandPrix()} disabled={status === "loading"}>
          {nextGrandPrixActionLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            setNextGrandPrixConfirmOpen(false);
            setGameView("drive");
            setResultTab("report");
            setResultOpen(true);
          }}
          disabled={!result}
        >
          {tt("result_tab_report")}
        </button>
      </div>
    </Modal>
  ) : null;
  const notificationStack = notifications.length ? (
    <div className="notification-stack" aria-live="polite">
      {notifications.map((notification) => (
        <div key={notification.id} className={`floating-notification ${notification.tone}`}>
          <p>{notification.text}</p>
          <button type="button" aria-label={tt("notification_close")} onClick={() => dismissNotification(notification.id)} />
        </div>
      ))}
    </div>
  ) : null;
  const onboardingHelpModal = onboardingHelp ? (
    onboardingHelp === "leagueIntro" ? (
      <LeagueIntroModal onClose={(dismiss) => closeOnboardingHelp(onboardingHelp, dismiss)} tt={tt} />
    ) : (
      <OnboardingHelpModal
        topic={onboardingHelp}
        recoveryCode={onboardingHelp === "profileCode" ? profileSession?.recoveryCode : undefined}
        onClose={(dismiss) => closeOnboardingHelp(onboardingHelp, dismiss)}
        tt={tt}
      />
    )
  ) : null;
  const adminDeleteModal = adminDeleteUser ? (
    <Modal label={tt("admin_delete_user_title")} closeLabel={tt("action_close")} showCloseButton onClose={() => setAdminDeleteUser(null)}>
      <ModalHero image="/assets/crl/league-arrival.png" kicker={tt("admin_kicker")} title={tt("admin_delete_user_title")} />
      <p>{tt("admin_delete_user_confirm", { email: adminDeleteUser.email })}</p>
      <div className="actions secondary-actions">
        <button type="button" className="danger-button" onClick={() => void deleteAdminUserConfirmed()}>
          {tt("admin_action_delete_user")}
        </button>
      </div>
    </Modal>
  ) : null;
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

  if (!profileSession) {
    return (
      <SetupShell
        tt={tt}
        topbar={setupTopbar}
        notificationStack={notificationStack}
        errorModal={errorModal}
        profileCodeModal={profileCodeModal}
        profileLogoutModal={profileLogoutModal}
        preferencesResetModal={preferencesResetModal}
      >
        <ProfileSetupView
          message={message}
          mode={profileMode}
          profileForm={profileForm}
          profileFormError={profileFormError}
          status={status}
          pendingMessage={pendingMessage}
          onCreateProfile={() => void createProfileSession()}
          onRecoverProfile={() => void recoverProfileSession()}
          onSetMode={setProfileMode}
          onSetProfileForm={setProfileForm}
          onSetProfileFormError={setProfileFormError}
          tt={tt}
        />
      </SetupShell>
    );
  }

  if (!leagueState) {
    return (
      <SetupShell
        tt={tt}
        topbar={setupTopbar}
        notificationStack={notificationStack}
        errorModal={errorModal}
        profileCodeModal={profileCodeModal}
        profileLogoutModal={profileLogoutModal}
        preferencesResetModal={preferencesResetModal}
      >
        {gameView === "admin" && profileSession.admin ? (
          adminView
        ) : gameView === "changelog" ? (
          <ChangelogView currentVersion={APP_VERSION} tt={tt} />
        ) : (
          <LeagueSetupView
            form={form}
            message={message}
            mode={setupMode}
            savedClaims={savedClaims}
            savedLeagueIndex={savedLeagueIndex}
            status={status}
            pendingMessage={pendingMessage}
            onCreateLeague={() => void createLeague()}
            onJoinLeague={() => void joinLeague()}
            onSetForm={setForm}
            onSetMode={setSetupMode}
            onSetSavedLeagueIndex={setSavedLeagueIndex}
            onSwitchLeague={(teamId) => void switchLeague(teamId)}
            tt={tt}
          />
        )}
        {onboardingHelpModal}
        {adminDeleteModal}
      </SetupShell>
    );
  }

  const isMapScreen = gameView === "drive" && (!visibleResult || resultTab === "replay");

  return (
    <main className={isMapScreen ? "app-shell game-shell map-screen" : "app-shell game-shell"}>
      <header className="topbar">
        <button type="button" className="brand brand-button" onClick={goHome}>
          <AssetImage className="brand-icon" src="/favicon.svg" alt="" />
          <strong>{leagueState.league.name}</strong>
        </button>
        <nav className="game-nav" aria-label={tt("cockpit_sections")}>
          {GAME_VIEWS.map((view) => (
            <button
              key={view}
              type="button"
              className={gameView === view ? "active" : undefined}
              onClick={() => {
                clearTransientNotifications();
                clearScreenOnboardingSnoozes();
                closeHistoryReplay();
                setGameView(view);
                if (view === "plan") setPlanSubscreen("plan");
                if (view === "drive" && result) setResultOpen(false);
              }}
            >
              <span className="nav-label-full">{tt(`rail_${view}` as TranslationKey)}</span>
              <span className="nav-label-short" aria-hidden="true">
                {tt(`rail_short_${view}` as TranslationKey)}
              </span>
            </button>
          ))}
        </nav>
        {profileMenu()}
      </header>

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
        {gameView === "admin" && profileSession?.admin ? adminView : null}
        {gameView === "drive" && visibleResult ? (
          <ResultView
            state={leagueState}
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
              if (historyReplay) {
                closeHistoryReplay();
                return;
              }
              setResultOpen(false);
            }}
            tt={tt}
          />
        ) : null}
        {gameView === "drive" && !historyReplay && (!result || !resultOpen) ? (
          <div className="drive-grid">
            <div className="drive-content-column">
              {!result && currentQualifyingResult ? (
                <div className="qualifying-replay-inline drive-map-panel">
                  <ReplayView
                    result={currentQualifyingResult.result}
                    circuit={currentCircuit}
                    playerTeamId={playerTeam?.id}
                    teamLiveries={Object.fromEntries(leagueState.teams.map((team) => [team.id, team.livery]))}
                    traitImpacts={directiveTraitImpacts}
                    towerEntries={qualifyingReplayEntries}
                    titleKey="qualifying_replay_title"
                    explainerKey="qualifying_replay_explainer"
                    initialLap={currentQualifyingResult.lap}
                    preferencesResetSignal={preferencesResetSignal}
                    onClose={() => setQualifyingResult(null)}
                    closeLabel={tt("action_back_to_circuit")}
                    overlayActions={
                      <>
                        <span>
                          {(chronoReport.best?.time ?? currentQualifyingResult.time).toFixed(2)}s · {tt("qualifying_remaining")} {qualifyingAttemptsLeft}/{qualifyingAttemptLimit}
                        </span>
                        <button
                          className={!chronoReportCommandClicked ? "highlight-command" : undefined}
                          type="button"
                          onClick={() => {
                            setChronoReportCommandClicked(true);
                            setPlanSubscreen("chrono");
                            setGameView("plan");
                          }}
                        >
                          {tt("plan_subscreen_chrono")}
                        </button>
                        <button type="button" onClick={openQualifyingRun} disabled={qualifyingDisabled}>
                          {tt("action_qualifying")}
                        </button>
                        <button className={primaryCommandClass} type="button" onClick={primaryCommand.action} disabled={primaryCommand.disabled}>
                          {primaryCommand.label}
                        </button>
                      </>
                    }
                    tt={tt}
                  />
                </div>
              ) : (
                <CircuitMap
                  className="drive-map-panel"
                  circuit={currentCircuit}
                  tt={tt}
                  showHeading={false}
                  framed={false}
                  showTraits={false}
                  weather={forecastPick as Weather}
                  overlay={
                    <>
                      <div className="map-info-stack">
                        <div className="map-status">
                          <span className="circuit-city">
                            <CountryBadge country={currentCircuit.country} /> {currentCircuit.city}
                          </span>
                          <strong>{tt(currentCircuit.layoutKey)}</strong>
                          <small>
                            {currentCircuit.laps} {tt("unit_laps")}
                          </small>
                          <small className="map-weather-readout">
                            <VisualIcon name={forecastPick as Weather} />
                            <span>{tt(`weather_${forecastPick}` as TranslationKey)}</span>
                          </small>
                        </div>
                        <MapTraitsPanel traits={currentCircuit.traits} impacts={result ? replayTraitImpacts : directiveTraitImpacts} tt={tt} />
                      </div>
                      <div className="map-workflow-panel">
                        <h2>{tt(`race_phase_${raceDayPhase}_title` as TranslationKey)}</h2>
                        <p>
                          {tt(`race_phase_${raceDayPhase}_body` as TranslationKey, {
                            used: qualifyingAttemptsUsed,
                            limit: qualifyingAttemptLimit,
                            left: qualifyingAttemptsLeft
                          })}
                        </p>
                        <div className="race-day-steps" aria-label={tt("race_day_steps")}>
                          {["briefing", "adjust", "locked", "gp"].map((step) => (
                            <span key={step} className={step === raceDayPhase || (step === "gp" && raceDayPhase === "finished") ? "active" : undefined}>
                              {tt(`race_step_${step}` as TranslationKey)}
                            </span>
                          ))}
                        </div>
                      </div>
                      {result ? (
                        <div className="map-final-classification">
                          <strong>{tt("result_final_classification")}</strong>
                          <ol>
                            {result.classification.map((entry) => (
                              <li key={entry.teamId} className={entry.teamId === playerTeam?.id ? "player" : undefined}>
                                <span>
                                  <PositionBadge position={entry.position} /> {entry.teamName}
                                </span>
                                <em>
                                  <RewardValue type="points" value={entry.points} tt={tt} />
                                </em>
                              </li>
                            ))}
                          </ol>
                        </div>
                      ) : null}
                      {!result && qualifyingPanelOpen ? (
                        <div className="map-qualifying-times">
                          <header>
                            <strong>
                              {tt("qualifying_times_title")} <span>{qualifyingAttemptsUsed}/{qualifyingAttemptLimit}</span>
                            </strong>
                            <button type="button" aria-label={`${tt("action_close")} ${tt("qualifying_times_title")}`} onClick={() => setQualifyingPanelOpen(false)}>
                              ×
                            </button>
                          </header>
                          {qualifyingLeaderboard.length ? (
                            <ol>
                              {qualifyingLeaderboard.map((run) => (
                                <li key={`${run.teamId}-${run.attempts}-${run.lap ?? 0}-${run.createdAt}`} className={run.teamId === playerTeam?.id ? "player" : undefined}>
                                  <span>
                                    <PositionBadge position={run.position} /> {run.teamName}
                                    {run.attempts ? ` · ${tt("qualifying_attempt_label", { attempt: run.attempts, lap: run.lap ?? 1 })}` : ""}
                                  </span>
                                  <em>{run.time.toFixed(2)}s</em>
                                </li>
                              ))}
                            </ol>
                          ) : (
                            <small>{tt("qualifying_times_empty")}</small>
                          )}
                        </div>
                      ) : !result ? (
                        <button className="map-qualifying-toggle" type="button" onClick={() => setQualifyingPanelOpen(true)}>
                          {tt("qualifying_times_title")} {qualifyingAttemptsUsed}/{qualifyingAttemptLimit}
                        </button>
                      ) : null}
                      {result ? (
                        <div className="race-phase-actions map-race-actions">
                          <PendingFeedback className="map-pending-feedback" message={pendingMessage} />
                          <button
                            className="result-toggle-command"
                            type="button"
                            onClick={() => {
                              setResultTab("replay");
                              setResultOpen(true);
                            }}
                          >
                            {tt("result_tab_replay")}
                          </button>
                          <button
                            className={`result-toggle-command${!resultReportCommandClicked ? " highlight-command" : ""}`}
                            type="button"
                            onClick={() => {
                              setResultReportCommandClicked(true);
                              setResultTab("report");
                              setResultOpen(true);
                            }}
                          >
                            {tt("result_tab_report")}
                          </button>
                          <button className={primaryCommandClass} type="button" onClick={primaryCommand.action} disabled={primaryCommand.disabled}>
                            {primaryCommand.label}
                          </button>
                        </div>
                      ) : (
                        <div className="race-phase-actions map-race-actions">
                          <PendingFeedback className="map-pending-feedback" message={pendingMessage} />
                          {deskState === "prepare" ? (
                            <>
                              <button
                                className={`primary-command${!editPlanCommandClicked ? " highlight-command" : ""}`}
                                type="button"
                                onClick={() => {
                                  setEditPlanCommandClicked(true);
                                  setPlanSubscreen("plan");
                                  setGameView("plan");
                                }}
                              >
                                {tt("action_edit_plan")}
                              </button>
                              <button
                                className={`primary-command${!qualifyingCommandClicked && qualifyingAttemptsUsed === 0 ? " highlight-command" : ""}`}
                                type="button"
                                onClick={openQualifyingRun}
                                disabled={qualifyingDisabled}
                              >
                                {tt("action_qualifying")}
                              </button>
                              <button
                                className="primary-command"
                                type="button"
                                onClick={openLastQualifyingRun}
                                disabled={!lastQualifyingRun}
                              >
                                {tt("action_qualifying_history")}
                              </button>
                              <button
                                className={primaryCommandClass}
                                type="button"
                                onClick={primaryCommand.action}
                                disabled={primaryCommand.disabled}
                              >
                                {primaryCommand.label}
                              </button>
                            </>
                          ) : (
                            <>
                              {deskState === "ready" ? (
                                <button
                                  className="primary-command"
                                  type="button"
                                  onClick={() => {
                                    setPlanSubscreen("plan");
                                    setGameView("plan");
                                  }}
                                >
                                  {tt("action_view_plan")}
                                </button>
                              ) : null}
                              <button className={primaryCommandClass} type="button" onClick={primaryCommand.action} disabled={primaryCommand.disabled}>
                                {primaryCommand.label}
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  }
                />
              )}
            </div>
          </div>
        ) : null}
        {gameView === "plan" ? (
          <PlanView
            cardLocked={Boolean(qualifyingLockedCardId)}
            chronoReport={chronoReport}
            circuitTraits={currentCircuit.traits}
            directiveStep={directiveStep}
            disabled={status === "loading" || Boolean(playerDecision) || isResolved}
            form={form}
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
          <ChampionshipView
            state={leagueState}
            playerTeamId={playerTeam?.id}
            recordTab={championshipRecordTab}
            onReplayGrandPrix={openHistoryReplay}
            onOpenSeasonRecap={setSeasonRecapSeason}
            onSelectRecordTab={setChampionshipRecordTab}
            tt={tt}
          />
        ) : null}
        {gameView === "garage" ? (
          <GarageView
            state={leagueState}
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
      </section>

      {notificationStack}
      {onboardingHelpModal}

      {errorModal}
      {profileCodeModal}
      {profileLogoutModal}
      {preferencesResetModal}
      {adminDeleteModal}
      {directiveConfirmModal}
      {resolveConfirmModal}
      {qualifyingConfirmModal}
      {nextGrandPrixConfirmModal}
      {seasonRecap ? (
        <Modal label={tt("season_recap_title")} className="panel modal season-recap-modal" closeLabel={tt("action_close")} showCloseButton onClose={() => setSeasonRecapSeason(null)}>
          <ModalHero image="/assets/crl/season-recap-modal.png" kicker={`${tt("league_season")} ${seasonRecap.season}`} title={tt("season_recap_title")} />
          <div className="season-champion-card">
            <span>{tt("season_champion")}</span>
            <strong>
              {seasonRecap.champion.livery ? (
                <LiveryPlate className="standings-livery-plate leader-livery-plate" livery={seasonRecap.champion.livery} name={seasonRecap.champion.teamName} />
              ) : null}
              {seasonRecap.champion.teamName}
            </strong>
            <small>
              <RewardValue type="points" value={seasonRecap.champion.points} tt={tt} /> · {seasonRecap.gpCount} {tt("season_gp_count")}
            </small>
          </div>
          <div className="season-recap-grid">
            <section>
              <h3>{tt("season_podium")}</h3>
              <ol className="season-podium-list">
                {seasonRecap.standings.slice(0, 3).map((entry) => (
                  <li key={entry.teamId} className={entry.teamId === playerTeam?.id ? "current-team" : undefined}>
                    <PositionBadge position={entry.position} />
                    {entry.livery ? <LiveryPlate className="standings-livery-plate" livery={entry.livery} name={entry.teamName} /> : null}
                    <span>{entry.teamName}</span>
                  </li>
                ))}
              </ol>
            </section>
            <section>
              <h3>{tt("season_final_standings")}</h3>
              <ol className="season-standings-list">
                {seasonRecap.standings.map((entry) => (
                  <li key={entry.teamId} className={entry.teamId === playerTeam?.id ? "current-team" : undefined}>
                    <PositionBadge position={entry.position} />
                    <span>{entry.teamName}</span>
                    <small>
                      <RewardValue type="points" value={entry.points} tt={tt} />
                    </small>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </Modal>
      ) : null}
      {leagueControlsOpen ? (
        <Modal label={tt("settings_title")} className="panel modal league-controls-modal" closeLabel={tt("action_close")} showCloseButton onClose={closeLeagueControls}>
          <ModalHero image="/assets/crl/league-arrival.png" kicker={tt("championship_kicker")} title={tt("settings_title")} />
          <div className="field-grid settings-fields">
            <label>
              {tt("field_cadence")}
              <select value={form.cadence} onChange={(event) => setForm({ ...form, cadence: event.target.value })}>
                <option value="manual">{tt("cadence_manual")}</option>
                <option value="fast">{tt("cadence_fast")}</option>
                <option value="weekly">{tt("cadence_weekly")}</option>
              </select>
            </label>
            <label>
              {tt("field_deadline")}
              <input
                type="datetime-local"
                value={form.preparationDeadlineAt}
                onChange={(event) => setForm({ ...form, preparationDeadlineAt: event.target.value })}
              />
            </label>
          </div>
          <div className="actions secondary-actions">
            <PendingFeedback message={pendingMessage} />
            <button type="button" onClick={updateSettings} disabled={status === "loading"}>
              {tt("action_update_settings")}
            </button>
            <button type="button" onClick={forgetPlayer} disabled={status === "loading" || !leagueState.player}>
              {tt("action_forget_team")}
            </button>
            <button type="button" onClick={restartLeague} disabled={status === "loading"}>
              {tt("action_restart_league")}
            </button>
          </div>
        </Modal>
      ) : null}
    </main>
  );

  function rememberPlayer(state: LeagueState) {
    const claim = claimFromState(state);
    if (!claim) return;
    const nextClaims = upsertPlayerClaim(loadPlayerClaims(), claim);
    storePlayerClaims(nextClaims, claim.teamId);
    setSavedClaims(nextClaims);
  }

  function withCurrentPlayer(state: LeagueState): LeagueState {
    const player = state.player ?? leagueState?.player;
    return player && state.teams.some((team) => team.id === player.teamId) ? { ...state, player } : state;
  }

  function forgetClaim(teamId?: string) {
    const activeTeamId = teamId ?? leagueState?.player?.teamId ?? localStorage.getItem(ACTIVE_PLAYER_CLAIM_KEY);
    const nextClaims = activeTeamId ? savedClaims.filter((claim) => claim.teamId !== activeTeamId) : savedClaims;
    storePlayerClaims(nextClaims, nextClaims[0]?.teamId);
    setSavedClaims(nextClaims);
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
