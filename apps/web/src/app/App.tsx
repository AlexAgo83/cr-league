import { APP_NAME, APP_VERSION, type CardId, type QualifyingRun } from "@cr-league/shared";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { isLocale, t, type Locale, type TranslationKey } from "../i18n/index.js";
import { CITY_CIRCUITS, circuitForRound } from "./circuits.js";
import { cardFit, clampNumber, completedSeasonSummaries, startingGrid, strongestForecast } from "./helpers.js";
import { randomLeagueName, randomTeamName } from "./nameSeeds.js";
import { GAME_VIEWS, type FormState, type GameView, type LeagueState, type ProfileSession } from "./types.js";
import { ChampionshipView } from "../features/ChampionshipView.js";
import { ChangelogView } from "../features/ChangelogView.js";
import { CircuitMap, MapTraitsPanel, type MapTraitImpacts } from "../features/CircuitMap.js";
import { DirectivePanel } from "../features/DirectivePanel.js";
import { GARAGE_PANEL_KEY, GarageView } from "../features/GarageView.js";
import { LiveryPlate } from "../features/LiveryPlate.js";
import { Modal } from "../features/Modal.js";
import { DISMISSED_REPLAY_HELP_KEY, REPLAY_FOCUS_KEY, REPLAY_SPEED_KEY, ReplayView } from "../features/ReplayView.js";
import { ResultView, type ResultTab } from "../features/ResultView.js";
import { CountryBadge } from "../features/VisualIcon.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4874";
const PLAYER_CLAIMS_KEY = "cr-league-player-claims";
const ACTIVE_PLAYER_CLAIM_KEY = "cr-league-active-player-claim";
const PROFILE_SESSION_KEY = "cr-league-profile-session";
const LANGUAGE_KEY = "cr-league-language";
const SEASON_RECAP_KEY_PREFIX = "cr-league-season-recap";
const UI_PREFERENCE_KEYS = [DISMISSED_REPLAY_HELP_KEY, REPLAY_SPEED_KEY, REPLAY_FOCUS_KEY, GARAGE_PANEL_KEY] as const;

type StoredPlayerClaim = NonNullable<LeagueState["player"]> & {
  leagueId: string;
  leagueName: string;
  leagueCode: string;
  teamName: string;
};
type ProfileMode = "choice" | "create" | "recover";
type SetupMode = "choice" | "create" | "join";
type Notification = { id: number; text: string; tone: "info" | "error"; persistent?: boolean };

function traitImpacts(form: FormState, selectedCardId: FormState["cardId"], tt: (key: TranslationKey) => string): MapTraitImpacts {
  const impacts: MapTraitImpacts = {};
  const add = (trait: keyof MapTraitImpacts, label: string) => {
    impacts[trait] = [...(impacts[trait] ?? []), `+${label}`];
  };

  if (form.preparation === "weather") add("grip", tt("preparation_weather"));
  if (form.preparation === "speed") add("overtaking", tt("preparation_speed"));
  if (form.preparation === "reliability") add("energy", tt("preparation_reliability"));
  if (form.approach === "aggressive") add("overtaking", tt("approach_aggressive"));
  if (form.approach === "prudent") add("energy", tt("approach_prudent"));
  if (selectedCardId === "rain_grip" || selectedCardId === "rain_mapping") add("grip", tt("field_card"));
  if (selectedCardId === "launch_boost" || selectedCardId === "urban_draft" || selectedCardId === "soft_tires" || selectedCardId === "qualifying_focus" || selectedCardId === "adjustable_wing" || selectedCardId === "calculated_attack") add("overtaking", tt("field_card"));
  if (selectedCardId === "fleet_maintenance" || selectedCardId === "final_surge" || selectedCardId === "defensive_order" || selectedCardId === "economy_mode" || selectedCardId === "pit_relay" || selectedCardId === "hard_tires") add("energy", tt("field_card"));

  return impacts;
}

function qualifyingReplayTower(run: QualifyingRun | null, runs: QualifyingRun[], tt: (key: TranslationKey, params?: Record<string, string | number>) => string) {
  if (!run) return [];
  return runs
    .filter((lapRun) => lapRun.teamId === run.teamId && lapRun.attempts === run.attempts)
    .sort((left, right) => (left.lap ?? 0) - (right.lap ?? 0))
    .map((lapRun, index) => ({
      id: `${lapRun.teamId}-${lapRun.attempts}-${lapRun.lap ?? index + 1}`,
      teamId: lapRun.teamId,
      teamName: tt("qualifying_replay_lap_label", { attempt: lapRun.attempts, lap: lapRun.lap ?? index + 1 }),
      value: `${lapRun.time.toFixed(2)}s`
    }));
}

function latestQualifyingRun(runs: QualifyingRun[]) {
  return runs.reduce<QualifyingRun | null>(
    (latest, run) => (!latest || run.attempts > latest.attempts || (run.attempts === latest.attempts && (run.lap ?? 0) > (latest.lap ?? 0)) ? run : latest),
    null
  );
}

function bestQualifyingRuns(runs: QualifyingRun[]) {
  const best = new Map<string, QualifyingRun>();
  for (const run of runs) {
    const current = best.get(run.teamId);
    if (!current || run.time < current.time) best.set(run.teamId, run);
  }
  return [...best.values()];
}

function createInitialForm(locale: Locale): FormState {
  return {
    leagueName: randomLeagueName() || t("default_league_name", locale),
    joinCode: "",
    teamName: randomTeamName() || t("default_team_name", locale),
    maxPlayers: 8,
    fillWithBots: true,
    qualifyingAttemptLimit: 3,
    maxGrandPrixPerSeason: 6,
    cadence: "manual",
    preparationDeadlineAt: "",
    approach: "balanced",
    preparation: "weather",
    cardId: "rain_grip"
  };
}

function AmbientRaceBackground({ tt }: { tt: (key: TranslationKey) => string }) {
  const { circuit, cars } = useMemo(() => {
    const liveries: Array<[string, string]> = [
      ["#22c55e", "#052e16"],
      ["#38bdf8", "#082f49"],
      ["#facc15", "#451a03"],
      ["#fb7185", "#4c0519"],
      ["#a78bfa", "#2e1065"],
      ["#f97316", "#431407"],
      ["#14b8a6", "#042f2e"],
      ["#e5e7eb", "#111827"]
    ];
    return {
      circuit: CITY_CIRCUITS[Math.floor(Math.random() * CITY_CIRCUITS.length)]!,
      cars: liveries.map(([primary, secondary], index) => ({
        id: `ambient-${index}`,
        label: "",
        player: false,
        delay: -index * 2.2,
        duration: 14 + index * 1.4,
        repeatCount: "indefinite" as const,
        livery: { primary, secondary }
      }))
    };
  }, []);

  return (
    <div className="ambient-race-background" aria-hidden="true">
      <CircuitMap className="ambient-race-map" circuit={circuit} tt={tt} cars={cars} camera={{ enabled: true, car: cars[0] }} showHeading={false} framed={false} showTraits={false} />
    </div>
  );
}

function SetupShell({
  children,
  errorModal,
  notificationStack,
  preferencesResetModal,
  profileCodeModal,
  profileLogoutModal,
  topbar,
  tt
}: {
  children: ReactNode;
  errorModal: ReactNode;
  notificationStack: ReactNode;
  preferencesResetModal: ReactNode;
  profileCodeModal: ReactNode;
  profileLogoutModal: ReactNode;
  topbar: ReactNode;
  tt: (key: TranslationKey) => string;
}) {
  return (
    <main className="app-shell setup-shell">
      <AmbientRaceBackground tt={tt} />
      {topbar}
      {children}
      {notificationStack}
      {errorModal}
      {preferencesResetModal}
      {profileCodeModal}
      {profileLogoutModal}
    </main>
  );
}

export function App() {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (isLocale(saved)) return saved;
    const browserLocale = navigator.language.split("-")[0] ?? "en";
    return isLocale(browserLocale) ? browserLocale : "en";
  });
  const [gameView, setGameView] = useState<GameView>("drive");
  const [resultTab, setResultTab] = useState<ResultTab>("replay");
  const [resultOpen, setResultOpen] = useState(true);
  const tt = (key: TranslationKey, params?: Parameters<typeof t>[2]) => t(key, locale, params);
  const [leagueState, setLeagueState] = useState<LeagueState | null>(null);
  const [profileMode, setProfileMode] = useState<ProfileMode>("choice");
  const [setupMode, setSetupMode] = useState<SetupMode>("choice");
  const [qualifyingConfirmOpen, setQualifyingConfirmOpen] = useState(false);
  const [qualifyingPanelOpen, setQualifyingPanelOpen] = useState(true);
  const [qualifyingResult, setQualifyingResult] = useState<QualifyingRun | null>(null);
  const [historyReplay, setHistoryReplay] = useState<LeagueState["grandPrixHistory"][number] | null>(null);
  const [seasonRecapSeason, setSeasonRecapSeason] = useState<number | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [preferencesResetSignal, setPreferencesResetSignal] = useState(0);
  const [preferencesResetOpen, setPreferencesResetOpen] = useState(false);
  const [profileCodeOpen, setProfileCodeOpen] = useState(false);
  const [profileLogoutOpen, setProfileLogoutOpen] = useState(false);
  const [directiveConfirmOpen, setDirectiveConfirmOpen] = useState(false);
  const [resolveConfirmOpen, setResolveConfirmOpen] = useState(false);
  const [nextGrandPrixConfirmOpen, setNextGrandPrixConfirmOpen] = useState(false);
  const [leagueControlsOpen, setLeagueControlsOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => createInitialForm(locale));
  const [profileSession, setProfileSession] = useState<ProfileSession | null>(loadProfileSession);
  const [profileForm, setProfileForm] = useState({ email: "", recoveryCode: "" });
  const [savedClaims, setSavedClaims] = useState(loadPlayerClaims);
  const [savedLeagueIndex, setSavedLeagueIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState(() => t("status_initial", locale));
  const [technicalError, setTechnicalError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationId = useRef(0);

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
        setLeagueState(state);
        showStatus(tt("status_league_rejoined"), "info", false);
      },
      saved.teamId,
      false
    );
  }, []);

  const playerTeam = useMemo(
    () =>
      leagueState?.teams.find((team) => team.id === leagueState.player?.teamId) ??
      leagueState?.teams.find((team) => team.kind === "human") ??
      leagueState?.teams[0],
    [leagueState]
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
    ? traitImpacts({ ...form, approach: playerDecision.approach, preparation: playerDecision.preparation }, playerDecision.cardId ?? "", tt)
    : directiveTraitImpacts;
  const playerResult = result?.classification.find((entry) => entry.teamId === playerTeam?.id);
  const consumedCardIds = result?.consumedCards.filter((card) => card.teamId === playerTeam?.id).map((card) => card.cardId) ?? [];
  const deskState = isResolved ? "resolved" : playerDecision ? "ready" : "prepare";
  const currentCircuit = circuitForRound(leagueState?.currentGrandPrix.round ?? 1);
  const raceDayPhase =
    isResolved
      ? "finished"
      : playerDecision
        ? "locked"
        : qualifyingAttemptsUsed > 0 || qualifyingAttemptsLeft <= 0
          ? "adjust"
          : "briefing";
  const startingGridEntries = leagueState ? startingGrid(leagueState) : [];
  const completedSeasons = useMemo(() => (leagueState ? completedSeasonSummaries(leagueState) : []), [leagueState]);
  const seasonRecap = seasonRecapSeason === null ? undefined : completedSeasons.find((season) => season.season === seasonRecapSeason);
  const primaryCommand =
    deskState === "prepare"
      ? { label: tt("action_submit_directive"), action: submitDirective, disabled: status === "loading" || isResolved }
      : deskState === "ready"
        ? { label: tt("action_launch_grand_prix"), action: () => setResolveConfirmOpen(true), disabled: status === "loading" || isResolved }
        : {
            label: tt("action_next_grand_prix"),
            action: () => setNextGrandPrixConfirmOpen(true),
            disabled: status === "loading" || !leagueState?.actionState.canStartNextGrandPrix
          };
  useEffect(() => {
    if (!leagueState) return;
    const endedSeason = leagueState.currentGrandPrix.season - 1;
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
      setLeagueState(state);
      setGameView("drive");
      showStatus(tt("status_league_joined"));
      pushCommandHint("prepare");
    });
  }

  async function submitDirective() {
    if (!leagueState || !playerTeam) return;
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
    setQualifyingConfirmOpen(true);
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
          traits: currentCircuit.traits
        })
      });
      setLeagueState(withCurrentPlayer(state));
      setGameView("drive");
      setResultTab("replay");
      setResultOpen(true);
      showStatus(tt("status_grand_prix_resolved"));
      pushCommandHint("resolved");
    });
  }

  async function startNextGrandPrix() {
    if (!leagueState) return;
    setNextGrandPrixConfirmOpen(false);

    await run(tt("status_starting_next_grand_prix"), async () => {
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
      showStatus(tt("status_next_grand_prix_started"));
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

    await mutateLeague("status_livery_updated", `/leagues/${leagueState.league.id}/teams/livery`, {
      teamId: playerTeam.id,
      claimCode: leagueState.player?.claimCode,
      livery
    }, "status_livery_updated");
  }

  async function updateTeamName(name: string) {
    if (!leagueState || !playerTeam) return;

    await run(tt("status_team_name_updated"), async () => {
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
    await run(tt("status_creating_profile"), async () => {
      const session = await api<ProfileSession>("/profiles", {
        method: "POST",
        body: JSON.stringify({ email: profileForm.email })
      });
      storeProfileSession(session);
      setProfileSession(session);
      setSavedClaims(claimsFromProfile(session));
      setSetupMode("choice");
      setProfileOpen(false);
      showStatus(`${tt("status_profile_created")} ${session.recoveryCode ?? ""}`, "info", false);
    });
  }

  async function recoverProfileSession() {
    await run(tt("status_recovering_profile"), async () => {
      const session = await api<ProfileSession>("/profiles/recover", {
        method: "POST",
        body: JSON.stringify(profileForm)
      });
      storeProfileSession(session);
      const claims = claimsFromProfile(session);
      storePlayerClaims(claims, claims[0]?.teamId);
      setProfileSession(session);
      setSavedClaims(claims);
      setSetupMode("choice");
      setProfileOpen(false);
      showStatus(tt("status_profile_recovered"), "info", false);
    });
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
        setLeagueState(state);
        setGameView("drive");
        setProfileOpen(false);
        showStatus(tt("status_league_rejoined"));
        pushCommandHint("prepare");
      },
      claim.teamId
    );
  }

  async function restartLeague() {
    if (!leagueState || !window.confirm(tt("restart_confirm"))) return;

    await mutateLeague("status_restarting_league", `/leagues/${leagueState.league.id}/restart`, {
      teamId: leagueState.player?.teamId,
      claimCode: leagueState.player?.claimCode
    }, "status_league_restarted");
  }

  async function run(nextMessage: string, action: () => Promise<void>, staleClaimTeamId?: string, notify = true) {
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
      setTechnicalError(error instanceof Error ? error.message : String(error));
      clearTransientNotifications();
      showStatus(error instanceof TypeError ? tt("status_api_unavailable") : tt("status_request_failed"), "error", notify);
    }
  }

  function forgetPlayer() {
    forgetClaim(leagueState?.player?.teamId);
    setLeagueState(null);
    setGameView("drive");
    showStatus(tt("status_player_forgotten"));
  }

  function addLeague() {
    setLeagueState(null);
    setGameView("drive");
    setSetupMode("choice");
    setProfileOpen(false);
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

  function resetUiPreferences() {
    for (const key of UI_PREFERENCE_KEYS) localStorage.removeItem(key);
    const seasonRecapKeys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(
      (key): key is string => key !== null && key.startsWith(`${SEASON_RECAP_KEY_PREFIX}:`)
    );
    for (const key of seasonRecapKeys) localStorage.removeItem(key);
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
          <label>
            {tt("language_label")}
            <select value={locale} onChange={(event) => changeLocale(event.target.value as Locale)}>
              <option value="en">{tt("language_en")}</option>
              <option value="fr">{tt("language_fr")}</option>
            </select>
          </label>
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
      <div className="brand">
        <img className="brand-icon" src="/favicon.svg" alt={APP_NAME} />
        <strong>{APP_NAME}</strong>
      </div>
      <div className="setup-topbar-actions">
        {profileSession ? (
          profileMenu(false, false)
        ) : (
          <label className="language-select">
            {tt("language_label")}
            <select value={locale} onChange={(event) => changeLocale(event.target.value as Locale)}>
              <option value="en">{tt("language_en")}</option>
              <option value="fr">{tt("language_fr")}</option>
            </select>
          </label>
        )}
      </div>
    </header>
  );

  const profileCodeModal = profileCodeOpen ? (
    <Modal label={tt("profile_code_title")} onClose={() => setProfileCodeOpen(false)}>
      <span className="section-kicker">{tt("profile_kicker")}</span>
      <h2>{tt("profile_code_title")}</h2>
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
      <div className="actions">
        <button type="button" onClick={() => setProfileCodeOpen(false)}>
          {tt("action_close")}
        </button>
      </div>
    </Modal>
  ) : null;

  const profileLogoutModal = profileLogoutOpen ? (
    <Modal label={tt("profile_logout_title")} onClose={() => setProfileLogoutOpen(false)}>
      <span className="section-kicker">{tt("profile_kicker")}</span>
      <h2>{tt("profile_logout_title")}</h2>
      <p>{tt("profile_logout_confirm")}</p>
      <div className="actions secondary-actions">
        <button type="button" className="danger-button" onClick={forgetProfile}>
          {tt("action_forget_profile")}
        </button>
        <button type="button" onClick={() => setProfileLogoutOpen(false)}>
          {tt("action_close")}
        </button>
      </div>
    </Modal>
  ) : null;

  const preferencesResetModal = preferencesResetOpen ? (
    <Modal label={tt("preferences_reset_title")} onClose={() => setPreferencesResetOpen(false)}>
      <span className="section-kicker">{tt("profile_kicker")}</span>
      <h2>{tt("preferences_reset_title")}</h2>
      <p>{tt("preferences_reset_confirm")}</p>
      <div className="actions secondary-actions">
        <button type="button" className="danger-button" onClick={resetUiPreferences}>
          {tt("action_reset_ui_preferences")}
        </button>
        <button type="button" onClick={() => setPreferencesResetOpen(false)}>
          {tt("action_close")}
        </button>
      </div>
    </Modal>
  ) : null;

  const errorModal = technicalError ? (
    <Modal label={tt("error_modal_title")} onClose={() => setTechnicalError(null)}>
      <span className="section-kicker">{tt("error_modal_kicker")}</span>
      <h2>{tt("error_modal_title")}</h2>
      <p>{tt("error_modal_body")}</p>
      <div className="actions secondary-actions">
        <button type="button" className="secondary-button" onClick={() => void copyTechnicalError()}>
          {tt("action_copy_error")}
        </button>
        <button type="button" onClick={() => setTechnicalError(null)}>
          {tt("action_close")}
        </button>
      </div>
    </Modal>
  ) : null;

  const directiveConfirmModal = directiveConfirmOpen ? (
    <Modal label={tt("directive_confirm_title")} onClose={() => setDirectiveConfirmOpen(false)}>
      <span className="section-kicker">{tt("qualifying_kicker")}</span>
      <h2>{tt("directive_confirm_title")}</h2>
      <p>
        {qualifyingAttemptsUsed === 0
          ? tt("directive_confirm_no_qualifying")
          : `${tt("directive_confirm_remaining")} ${qualifyingAttemptsLeft}/${qualifyingAttemptLimit}`}
      </p>
      <div className="actions secondary-actions">
        <button type="button" onClick={submitDirectiveConfirmed} disabled={status === "loading"}>
          {tt("action_submit_directive")}
        </button>
        <button type="button" onClick={() => setDirectiveConfirmOpen(false)}>
          {tt("action_close")}
        </button>
      </div>
    </Modal>
  ) : null;
  const resolveConfirmModal = resolveConfirmOpen ? (
    <Modal label={tt("launch_gp_confirm_title")} onClose={() => setResolveConfirmOpen(false)}>
      <span className="section-kicker">{tt("action_launch_grand_prix")}</span>
      <h2>{tt("launch_gp_confirm_title")}</h2>
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
          {startingGridEntries.map((entry) => (
            <li key={entry.team.id} className={entry.team.id === playerTeam?.id ? "current-team" : undefined}>
              <span>P{entry.position}</span>
              <LiveryPlate className="standings-livery-plate" livery={entry.team.livery} name={entry.team.name} />
              <strong>{entry.team.name}</strong>
              <small>{entry.bestTime === undefined ? tt("starting_grid_no_time") : `${entry.bestTime.toFixed(2)}s`}</small>
            </li>
          ))}
        </ol>
      </div>
      <div className="actions secondary-actions">
        <button type="button" onClick={() => void resolveGrandPrix()} disabled={status === "loading"}>
          {tt("action_launch_grand_prix")}
        </button>
        <button type="button" onClick={() => setResolveConfirmOpen(false)}>
          {tt("action_close")}
        </button>
      </div>
    </Modal>
  ) : null;
  const qualifyingConfirmModal = qualifyingConfirmOpen ? (
    <Modal label={tt("qualifying_confirm_title")} onClose={() => setQualifyingConfirmOpen(false)}>
      <span className="section-kicker">{tt("qualifying_kicker")}</span>
      <h2>{tt("qualifying_confirm_title")}</h2>
      <p>
        {tt("qualifying_confirm_body")} {tt("qualifying_remaining")} {qualifyingAttemptsLeft}/{qualifyingAttemptLimit}
      </p>
      <div className="actions secondary-actions">
        <button type="button" onClick={startQualifyingRunConfirmed} disabled={status === "loading"}>
          {tt("action_qualifying")}
        </button>
        <button type="button" onClick={() => setQualifyingConfirmOpen(false)}>
          {tt("action_close")}
        </button>
      </div>
    </Modal>
  ) : null;
  const nextGrandPrixConfirmModal = nextGrandPrixConfirmOpen ? (
    <Modal label={tt("next_gp_confirm_title")} onClose={() => setNextGrandPrixConfirmOpen(false)}>
      <span className="section-kicker">{tt("action_next_grand_prix")}</span>
      <h2>{tt("next_gp_confirm_title")}</h2>
      <p>{tt("next_gp_confirm_body")}</p>
      <div className="actions secondary-actions">
        <button type="button" onClick={() => void startNextGrandPrix()} disabled={status === "loading"}>
          {tt("action_next_grand_prix")}
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
        <button type="button" onClick={() => setNextGrandPrixConfirmOpen(false)}>
          {tt("action_close")}
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
        <section className="setup-grid setup-grid-single" aria-labelledby="profile-title">
          <div className="panel setup-main-panel">
            <div className="panel-heading">
              <div>
                <span className="section-kicker">{tt("profile_kicker")}</span>
                <h1 id="profile-title">
                  {profileMode === "create" ? tt("profile_create_title") : profileMode === "recover" ? tt("profile_recover_title") : tt("profile_title")}
                </h1>
              </div>
            </div>
            <p className={status === "error" ? "status error" : "status"}>{message === tt("status_initial") ? tt("profile_intro") : message}</p>
            {profileMode === "choice" ? (
              <div className="setup-choice-grid">
                <button type="button" className="setup-choice" onClick={() => setProfileMode("create")}>
                  <strong>{tt("action_create_profile")}</strong>
                  <small>{tt("profile_create_hint")}</small>
                </button>
                <button type="button" className="setup-choice" onClick={() => setProfileMode("recover")}>
                  <strong>{tt("action_recover_profile")}</strong>
                  <small>{tt("profile_recover_hint")}</small>
                </button>
              </div>
            ) : (
              <>
                <div className="field-grid setup-fields">
                  <label>
                    {tt("field_email")}
                    <input type="email" value={profileForm.email} onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })} />
                  </label>
                  {profileMode === "recover" ? (
                    <label>
                      {tt("field_recovery_code")}
                      <input value={profileForm.recoveryCode} onChange={(event) => setProfileForm({ ...profileForm, recoveryCode: event.target.value.toUpperCase() })} />
                    </label>
                  ) : null}
                </div>
                <div className="actions primary-actions profile-form-actions">
                  <button type="button" onClick={profileMode === "create" ? createProfileSession : recoverProfileSession} disabled={status === "loading"}>
                    {profileMode === "create" ? tt("action_create_profile") : tt("action_recover_profile")}
                  </button>
                  <button type="button" className="secondary-button" onClick={() => setProfileMode("choice")} disabled={status === "loading"}>
                    {tt("action_back")}
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
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
        {gameView === "changelog" ? (
          <ChangelogView currentVersion={APP_VERSION} tt={tt} />
        ) : (
        <section className="setup-grid setup-grid-single" aria-label={tt("flow_label")}>
          <div className="panel setup-main-panel">
            <div className="panel-heading">
              <div>
                <span className="section-kicker">{tt("race_desk_kicker")}</span>
                <h1>{setupMode === "create" ? tt("setup_create_title") : setupMode === "join" ? tt("setup_join_title") : tt("race_desk_title")}</h1>
              </div>
            </div>
            <p className={status === "error" ? "status error" : "status"}>{message}</p>

            {setupMode === "choice" ? (
              <div className="setup-choice-grid">
                <button type="button" className="setup-choice" onClick={() => setSetupMode("create")}>
                  <strong>{tt("action_create_league")}</strong>
                  <small>{tt("setup_create_hint")}</small>
                </button>
                <button type="button" className="setup-choice" onClick={() => setSetupMode("join")}>
                  <strong>{tt("action_join_league")}</strong>
                  <small>{tt("setup_join_hint")}</small>
                </button>
              </div>
            ) : (
              <>
                <div className="field-grid setup-fields">
                  {setupMode === "create" ? (
                    <label>
                      {tt("field_league")}
                      <input maxLength={40} value={form.leagueName} onChange={(event) => setForm({ ...form, leagueName: event.target.value })} />
                    </label>
                  ) : (
                    <label>
                      {tt("field_join_code")}
                      <input
                        value={form.joinCode}
                        onChange={(event) => setForm({ ...form, joinCode: event.target.value.toUpperCase() })}
                        maxLength={6}
                        placeholder="PLAY01"
                      />
                    </label>
                  )}
                  <label>
                    {tt("field_team")}
                    <input maxLength={32} value={form.teamName} onChange={(event) => setForm({ ...form, teamName: event.target.value })} />
                  </label>
                  {setupMode === "create" ? (
                    <>
                      <label>
                        {tt("field_max_players")}
                        <input
                          type="number"
                          min="2"
                          max="16"
                          value={form.maxPlayers}
                          onChange={(event) => setForm({ ...form, maxPlayers: event.target.value === "" ? "" : Number(event.target.value) })}
                        />
                      </label>
                      <label>
                        {tt("field_qualifying_attempts")}
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={form.qualifyingAttemptLimit}
                          onChange={(event) => setForm({ ...form, qualifyingAttemptLimit: event.target.value === "" ? "" : Number(event.target.value) })}
                        />
                      </label>
                      <label>
                        {tt("field_gp_per_season")}
                        <input
                          type="number"
                          min="1"
                          max="18"
                          value={form.maxGrandPrixPerSeason}
                          onChange={(event) => setForm({ ...form, maxGrandPrixPerSeason: event.target.value === "" ? "" : Number(event.target.value) })}
                        />
                      </label>
                      <label className="checkbox-field">
                        <input
                          type="checkbox"
                          checked={form.fillWithBots}
                          onChange={(event) => setForm({ ...form, fillWithBots: event.target.checked })}
                        />
                        {tt("field_fill_with_bots")}
                      </label>
                    </>
                  ) : null}
                </div>
                <div className="actions primary-actions setup-form-actions">
                  <button type="button" onClick={setupMode === "create" ? createLeague : joinLeague} disabled={status === "loading"}>
                    {setupMode === "create" ? tt("action_start_league") : tt("action_join_league")}
                  </button>
                  <button type="button" className="secondary-button" onClick={() => setSetupMode("choice")} disabled={status === "loading"}>
                    {tt("action_back")}
                  </button>
                </div>
              </>
            )}

            {setupMode === "choice" ? (
              <div className="saved-leagues saved-leagues-compact">
                <span className="section-kicker">{tt("profile_saved_leagues")}</span>
                {savedClaims.length ? (
                  <div className="saved-league-carousel">
                    <button
                      type="button"
                      className="saved-league-arrow"
                      aria-label={tt("action_previous_saved_league")}
                      disabled={status === "loading" || savedClaims.length < 2}
                      onClick={() => setSavedLeagueIndex((index) => (index + savedClaims.length - 1) % savedClaims.length)}
                    >
                      {"<"}
                    </button>
                    {(() => {
                      const claim = savedClaims[savedLeagueIndex] ?? savedClaims[0]!;
                      return (
                        <button type="button" className="profile-menu-action saved-league-card" onClick={() => void switchLeague(claim.teamId)} disabled={status === "loading"}>
                          <strong>{claim.leagueName}</strong>
                          <small>
                            {claim.teamName}
                            {claim.leagueCode ? ` · ${claim.leagueCode}` : ""}
                          </small>
                        </button>
                      );
                    })()}
                    <button
                      type="button"
                      className="saved-league-arrow"
                      aria-label={tt("action_next_saved_league")}
                      disabled={status === "loading" || savedClaims.length < 2}
                      onClick={() => setSavedLeagueIndex((index) => (index + 1) % savedClaims.length)}
                    >
                      {">"}
                    </button>
                  </div>
                ) : (
                  <p className="saved-leagues-empty">{tt("profile_saved_leagues_empty")}</p>
                )}
              </div>
            ) : null}
          </div>
        </section>
        )}
      </SetupShell>
    );
  }

  const isMapScreen = gameView === "drive" && (!result || !resultOpen || resultTab === "replay");

  return (
    <main className={isMapScreen ? "app-shell game-shell map-screen" : "app-shell game-shell"}>
      <header className="topbar">
        <div className="brand">
          <img className="brand-icon" src="/favicon.svg" alt={APP_NAME} />
          <strong>{leagueState.league.name}</strong>
        </div>
        <nav className="game-nav" aria-label={tt("cockpit_sections")}>
          {GAME_VIEWS.map((view) => (
            <button
              key={view}
              type="button"
              className={gameView === view ? "active" : undefined}
              onClick={() => {
                setGameView(view);
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
        {gameView === "drive" && result && resultOpen ? (
          <ResultView
            state={leagueState}
            result={result}
            circuit={currentCircuit}
            playerTeamId={playerTeam?.id}
            playerDecision={playerDecision}
            tab={resultTab}
            traitImpacts={replayTraitImpacts}
            preferencesResetSignal={preferencesResetSignal}
            onClose={() => setResultOpen(false)}
            tt={tt}
          />
        ) : null}
        {gameView === "drive" && (!result || !resultOpen) ? (
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
                    preferencesResetSignal={preferencesResetSignal}
                    onClose={() => setQualifyingResult(null)}
                    closeLabel={tt("action_back_to_circuit")}
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
                  overlay={
                    <>
                      <div className="map-status">
                        <span className="circuit-city">
                          <CountryBadge country={currentCircuit.country} /> {currentCircuit.city}
                        </span>
                        <strong>{tt(currentCircuit.layoutKey)}</strong>
                        <small>
                          {currentCircuit.laps} {tt("unit_laps")} · {tt(`weather_${currentCircuit.likelyWeather}` as TranslationKey)}
                        </small>
                      </div>
                      <MapTraitsPanel traits={currentCircuit.traits} impacts={result ? replayTraitImpacts : directiveTraitImpacts} tt={tt} />
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
                                  {entry.position}. {entry.teamName}
                                </span>
                                <em>
                                  {entry.points} {tt("unit_points")}
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
                                    {run.position}. {run.teamName}
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
                            className="result-toggle-command"
                            type="button"
                            onClick={() => {
                              setResultTab("report");
                              setResultOpen(true);
                            }}
                          >
                            {tt("result_tab_report")}
                          </button>
                          <button className="primary-command" type="button" onClick={primaryCommand.action} disabled={primaryCommand.disabled}>
                            {primaryCommand.label}
                          </button>
                        </div>
                      ) : (
                        <div className="race-phase-actions map-race-actions">
                          {deskState === "prepare" ? (
                            <>
                              <button className="primary-command" type="button" onClick={() => setGameView("plan")}>
                                {tt("action_edit_plan")}
                              </button>
                              <button className="primary-command" type="button" onClick={openQualifyingRun} disabled={qualifyingDisabled}>
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
                              <button className="primary-command" type="button" onClick={primaryCommand.action} disabled={primaryCommand.disabled}>
                                {primaryCommand.label}
                              </button>
                            </>
                          ) : (
                            <>
                              {deskState === "ready" ? (
                                <button className="primary-command" type="button" onClick={() => setGameView("plan")}>
                                  {tt("action_view_plan")}
                                </button>
                              ) : null}
                              <button className="primary-command" type="button" onClick={primaryCommand.action} disabled={primaryCommand.disabled}>
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
          <div className="plan-view">
            <DirectivePanel
              form={form}
              setForm={setForm}
              ownedCardIds={ownedCardIds}
              selectedCardId={selectedCardId}
              selectedCardFit={selectedCardFit}
              circuitTraits={currentCircuit.traits}
              cardLocked={Boolean(qualifyingLockedCardId)}
              disabled={status === "loading" || Boolean(playerDecision) || isResolved}
              tt={tt}
            />
          </div>
        ) : null}
        {gameView === "championship" ? (
          <ChampionshipView
            state={leagueState}
            playerTeamId={playerTeam?.id}
            onReplayGrandPrix={setHistoryReplay}
            onOpenSeasonRecap={setSeasonRecapSeason}
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
            onBuyCard={buyCard}
            onSellCard={sellCard}
            onUpdateLivery={updateLivery}
            onUpdateTeamName={updateTeamName}
            tt={tt}
          />
        ) : null}
        {gameView === "changelog" ? <ChangelogView currentVersion={APP_VERSION} tt={tt} /> : null}
      </section>

      {notificationStack}

      {errorModal}
      {profileCodeModal}
      {profileLogoutModal}
      {preferencesResetModal}
      {directiveConfirmModal}
      {resolveConfirmModal}
      {qualifyingConfirmModal}
      {nextGrandPrixConfirmModal}
      {seasonRecap ? (
        <Modal label={tt("season_recap_title")} className="panel modal season-recap-modal" onClose={() => setSeasonRecapSeason(null)}>
          <span className="section-kicker">
            {tt("league_season")} {seasonRecap.season}
          </span>
          <h2>{tt("season_recap_title")}</h2>
          <div className="season-champion-card">
            <span>{tt("season_champion")}</span>
            <strong>
              {seasonRecap.champion.livery ? (
                <LiveryPlate className="standings-livery-plate leader-livery-plate" livery={seasonRecap.champion.livery} name={seasonRecap.champion.teamName} />
              ) : null}
              {seasonRecap.champion.teamName}
            </strong>
            <small>
              {seasonRecap.champion.points} {tt("unit_points")} · {seasonRecap.gpCount} {tt("season_gp_count")}
            </small>
          </div>
          <div className="season-recap-grid">
            <section>
              <h3>{tt("season_podium")}</h3>
              <ol className="season-podium-list">
                {seasonRecap.standings.slice(0, 3).map((entry) => (
                  <li key={entry.teamId} className={entry.teamId === playerTeam?.id ? "current-team" : undefined}>
                    <strong>P{entry.position}</strong>
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
                    <strong>P{entry.position}</strong>
                    <span>{entry.teamName}</span>
                    <small>
                      {entry.points} {tt("unit_points")}
                    </small>
                  </li>
                ))}
              </ol>
            </section>
          </div>
          <div className="actions secondary-actions">
            <button type="button" onClick={() => setSeasonRecapSeason(null)}>
              {tt("action_close")}
            </button>
          </div>
        </Modal>
      ) : null}
      {historyReplay?.result ? (
        <Modal label={tt("result_replay_title")} className="panel modal qualifying-modal" onClose={() => setHistoryReplay(null)}>
          <button className="modal-close-button" type="button" aria-label={tt("action_close")} onClick={() => setHistoryReplay(null)}>
            ×
          </button>
          <div className="qualifying-replay">
            <ReplayView
              result={historyReplay.result}
              circuit={circuitForRound(historyReplay.round)}
              playerTeamId={playerTeam?.id}
              teamLiveries={Object.fromEntries(leagueState.teams.map((team) => [team.id, team.livery]))}
              traitImpacts={replayTraitImpacts}
              preferencesResetSignal={preferencesResetSignal}
              showIntro={false}
              tt={tt}
            />
          </div>
        </Modal>
      ) : null}
      {leagueControlsOpen ? (
        <Modal label={tt("settings_title")} className="panel modal league-controls-modal" onClose={closeLeagueControls}>
          <span className="section-kicker">{tt("championship_kicker")}</span>
          <h2>{tt("settings_title")}</h2>
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
            <button type="button" onClick={updateSettings} disabled={status === "loading"}>
              {tt("action_update_settings")}
            </button>
            <button type="button" onClick={forgetPlayer} disabled={status === "loading" || !leagueState.player}>
              {tt("action_forget_team")}
            </button>
            <button type="button" onClick={restartLeague} disabled={status === "loading"}>
              {tt("action_restart_league")}
            </button>
            <button type="button" onClick={closeLeagueControls}>
              {tt("action_close")}
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
}

async function api<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: init.body ? { "content-type": "application/json", ...init.headers } : init.headers
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new ApiError(response.status, errorBody?.message ?? `API request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    message: string
  ) {
    super(message);
  }
}

function isStaleLeagueError(error: unknown) {
  return error instanceof ApiError && error.statusCode === 404 && localStorage.getItem(ACTIVE_PLAYER_CLAIM_KEY);
}

async function copyText(text: string) {
  try {
    await navigator.clipboard?.writeText(text);
  } catch {
    const input = document.createElement("input");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.left = "-9999px";
    input.style.position = "fixed";
    document.body.append(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
}

function claimFromState(state: LeagueState): StoredPlayerClaim | null {
  const team = state.teams.find((candidate) => candidate.id === state.player?.teamId);
  return state.player && team
    ? {
        ...state.player,
        leagueId: state.league.id,
        leagueName: state.league.name,
        leagueCode: state.league.code,
        teamName: team.name
      }
    : null;
}

function loadPlayerClaims(): StoredPlayerClaim[] {
  return parsePlayerClaims(localStorage.getItem(PLAYER_CLAIMS_KEY));
}

function loadProfileSession(): ProfileSession | null {
  const raw = localStorage.getItem(PROFILE_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ProfileSession;
    return parsed?.profile?.id && parsed.profile.email ? parsed : null;
  } catch {
    return null;
  }
}

function seasonRecapStorageKey(leagueId: string, season: number) {
  return `${SEASON_RECAP_KEY_PREFIX}:${leagueId}:${season}`;
}

function storeProfileSession(session: ProfileSession) {
  localStorage.setItem(PROFILE_SESSION_KEY, JSON.stringify(session));
}

function claimsFromProfile(session: ProfileSession): StoredPlayerClaim[] {
  return session.teams.map((team) => ({
    teamId: team.teamId,
    claimCode: team.claimCode,
    leagueId: team.leagueId,
    leagueName: team.leagueName,
    leagueCode: team.leagueCode,
    teamName: team.teamName
  }));
}

function parsePlayerClaims(raw: string | null): StoredPlayerClaim[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StoredPlayerClaim[];
    return Array.isArray(parsed) ? parsed.filter(isStoredPlayerClaim) : [];
  } catch {
    return [];
  }
}

function isStoredPlayerClaim(claim: Partial<StoredPlayerClaim>): claim is StoredPlayerClaim {
  return (
    typeof claim.teamId === "string" &&
    typeof claim.claimCode === "string" &&
    typeof claim.leagueId === "string" &&
    typeof claim.leagueName === "string" &&
    typeof claim.leagueCode === "string" &&
    typeof claim.teamName === "string"
  );
}

function upsertPlayerClaim(claims: StoredPlayerClaim[], claim: StoredPlayerClaim) {
  return [claim, ...claims.filter((candidate) => candidate.teamId !== claim.teamId)];
}

function storePlayerClaims(claims: StoredPlayerClaim[], activeTeamId?: string) {
  localStorage.setItem(PLAYER_CLAIMS_KEY, JSON.stringify(claims));
  if (activeTeamId) {
    localStorage.setItem(ACTIVE_PLAYER_CLAIM_KEY, activeTeamId);
  } else {
    localStorage.removeItem(ACTIVE_PLAYER_CLAIM_KEY);
  }
}

function getActiveClaim(claims: StoredPlayerClaim[]) {
  const activeTeamId = localStorage.getItem(ACTIVE_PLAYER_CLAIM_KEY);
  return claims.find((claim) => claim.teamId === activeTeamId) ?? claims[0];
}
