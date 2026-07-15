import { APP_NAME, type CardId, type QualifyingRun } from "@cr-league/shared";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { isLocale, t, type Locale, type TranslationKey } from "../i18n/index.js";
import { CITY_CIRCUITS, circuitForRound, countryFlag } from "./circuits.js";
import { cardFit, strongestForecast } from "./helpers.js";
import { randomLeagueName, randomTeamName } from "./nameSeeds.js";
import { GAME_VIEWS, type FormState, type GameView, type LeagueState, type ProfileSession } from "./types.js";
import { ChampionshipView } from "../features/ChampionshipView.js";
import { CircuitMap, MapTraitsPanel, type MapTraitImpacts } from "../features/CircuitMap.js";
import { DirectivePanel } from "../features/DirectivePanel.js";
import { GarageView } from "../features/GarageView.js";
import { ReplayView } from "../features/ReplayView.js";
import { ResultView, type ResultTab } from "../features/ResultView.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4874";
const PLAYER_CLAIMS_KEY = "cr-league-player-claims";
const ACTIVE_PLAYER_CLAIM_KEY = "cr-league-active-player-claim";
const PROFILE_SESSION_KEY = "cr-league-profile-session";
const LANGUAGE_KEY = "cr-league-language";

type StoredPlayerClaim = NonNullable<LeagueState["player"]> & {
  leagueId: string;
  leagueName: string;
  leagueCode: string;
  teamName: string;
};
type ProfileMode = "choice" | "create" | "recover";
type SetupMode = "choice" | "create" | "join";
type Notification = { id: number; text: string; tone: "info" | "error" };

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

function qualifyingReplayTower(run: QualifyingRun | null, runs: QualifyingRun[], tt: (key: TranslationKey) => string) {
  if (!run) return [];
  return runs
    .filter((lapRun) => lapRun.teamId === run.teamId && lapRun.attempts === run.attempts)
    .sort((left, right) => (left.lap ?? 0) - (right.lap ?? 0))
    .map((lapRun, index) => ({
      id: `${lapRun.teamId}-${lapRun.attempts}-${lapRun.lap ?? index + 1}`,
      teamId: lapRun.teamId,
      teamName: `${tt("unit_lap")} ${lapRun.lap ?? index + 1}`,
      value: `${lapRun.time.toFixed(2)}s`
    }));
}

function latestQualifyingRun(runs: QualifyingRun[]) {
  return runs.reduce<QualifyingRun | null>(
    (latest, run) => (!latest || run.attempts > latest.attempts || (run.attempts === latest.attempts && (run.lap ?? 0) > (latest.lap ?? 0)) ? run : latest),
    null
  );
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
  notificationStack,
  profileCodeModal,
  profileLogoutModal,
  topbar,
  tt
}: {
  children: ReactNode;
  notificationStack: ReactNode;
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
  const tt = (key: TranslationKey) => t(key, locale);
  const [leagueState, setLeagueState] = useState<LeagueState | null>(null);
  const [profileMode, setProfileMode] = useState<ProfileMode>("choice");
  const [setupMode, setSetupMode] = useState<SetupMode>("choice");
  const [qualifyingOpen, setQualifyingOpen] = useState(false);
  const [qualifyingConfirmOpen, setQualifyingConfirmOpen] = useState(false);
  const [qualifyingPanelOpen, setQualifyingPanelOpen] = useState(true);
  const [qualifyingResult, setQualifyingResult] = useState<QualifyingRun | null>(null);
  const [historyReplay, setHistoryReplay] = useState<LeagueState["grandPrixHistory"][number] | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileCodeOpen, setProfileCodeOpen] = useState(false);
  const [profileLogoutOpen, setProfileLogoutOpen] = useState(false);
  const [directiveConfirmOpen, setDirectiveConfirmOpen] = useState(false);
  const [nextGrandPrixConfirmOpen, setNextGrandPrixConfirmOpen] = useState(false);
  const [leagueControlsOpen, setLeagueControlsOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => createInitialForm(locale));
  const [profileSession, setProfileSession] = useState<ProfileSession | null>(loadProfileSession);
  const [profileForm, setProfileForm] = useState({ email: "", recoveryCode: "" });
  const [savedClaims, setSavedClaims] = useState(loadPlayerClaims);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState(() => t("status_initial", locale));
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationId = useRef(0);

  function pushNotification(text: string, tone: Notification["tone"] = "info") {
    const id = notificationId.current + 1;
    notificationId.current = id;
    queueMicrotask(() => {
      setNotifications((items) => [...items, { id, text, tone }].slice(-5));
      window.setTimeout(() => setNotifications((items) => items.filter((item) => item.id !== id)), 5_000);
    });
  }

  function showStatus(text: string, tone: Notification["tone"] = "info", notify = true) {
    setMessage(text);
    if (notify && text !== t("status_initial", locale)) pushNotification(text, tone);
  }

  function pushCommandHint(nextDeskState: "prepare" | "ready" | "resolved") {
    pushNotification(t(`command_hint_${nextDeskState}` as TranslationKey, locale));
  }

  function dismissNotification(id: number) {
    setNotifications((items) => items.filter((item) => item.id !== id));
  }

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
        showStatus(tt("status_league_rejoined"));
        pushCommandHint("prepare");
      },
      saved.teamId
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
  const qualifyingLeaderboard = [...qualifyingRuns]
    .sort((left, right) => left.time - right.time)
    .slice(0, 10)
    .map((run, index) => ({
      ...run,
      position: index + 1,
      teamName: leagueState?.teams.find((team) => team.id === run.teamId)?.name ?? run.teamId
    }));
  const qualifyingAttemptsUsed = Math.max(0, ...playerQualifyingRuns.map((run) => run.attempts));
  const qualifyingAttemptLimit = leagueState?.league.qualifyingAttemptLimit ?? form.qualifyingAttemptLimit;
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
  const primaryCommand =
    deskState === "prepare"
      ? { label: tt("action_submit_directive"), action: submitDirective, disabled: status === "loading" || isResolved }
      : deskState === "ready"
        ? { label: tt("action_launch_grand_prix"), action: resolveGrandPrix, disabled: status === "loading" || isResolved }
        : {
            label: tt("action_next_grand_prix"),
            action: () => setNextGrandPrixConfirmOpen(true),
            disabled: status === "loading" || !leagueState?.actionState.canStartNextGrandPrix
          };

  async function createLeague() {
    await run(tt("status_creating_league"), async () => {
      const state = await api<LeagueState>("/leagues", {
        method: "POST",
        body: JSON.stringify({
          name: form.leagueName,
          teamName: form.teamName,
          profileId: profileSession?.profile.id,
          maxPlayers: form.maxPlayers,
          fillWithBots: form.fillWithBots,
          qualifyingAttemptLimit: form.qualifyingAttemptLimit,
          maxGrandPrixPerSeason: form.maxGrandPrixPerSeason
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
          teamName: form.teamName,
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
    if (!leagueState || !playerTeam) return;
    setDirectiveConfirmOpen(false);
    await run(tt("status_submitting_directive"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/decisions`, {
        method: "POST",
        body: JSON.stringify({
          teamId: playerTeam.id,
          approach: form.approach,
          preparation: form.preparation,
          cardId: selectedCardId || undefined
        })
      });
      setLeagueState(withCurrentPlayer(state));
      showStatus(tt("status_directive_locked"));
      pushCommandHint("ready");
    });
  }

  async function launchQualifyingRun() {
    if (!leagueState || !playerTeam || qualifyingDisabled) return;

    await run(tt("status_qualifying_running"), async () => {
      const response = await api<{ state: LeagueState; run: QualifyingRun; isBest: boolean }>(`/leagues/${leagueState.league.id}/qualifying`, {
        method: "POST",
        body: JSON.stringify({
          teamId: playerTeam.id,
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
    setQualifyingOpen(true);
    void launchQualifyingRun();
  }

  function openLastQualifyingRun() {
    if (!lastQualifyingRun) return;
    setQualifyingResult(lastQualifyingRun);
    setQualifyingOpen(true);
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
      cadence: form.cadence,
      preparationDeadlineAt: form.preparationDeadlineAt ? new Date(form.preparationDeadlineAt).toISOString() : null
    }, "status_settings_updated");
  }

  async function resolveGrandPrix() {
    if (!leagueState) return;

    await run(tt("status_resolving_grand_prix"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/resolve`, {
        method: "POST",
        body: JSON.stringify({
          allowDefaults: !playerDecision,
          traits: currentCircuit.traits
        })
      });
      setLeagueState(withCurrentPlayer(state));
      setGameView("result");
      setResultTab("replay");
      showStatus(tt("status_grand_prix_resolved"));
      pushCommandHint("resolved");
    });
  }

  async function startNextGrandPrix() {
    if (!leagueState) return;
    setNextGrandPrixConfirmOpen(false);

    await run(tt("status_starting_next_grand_prix"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/next-grand-prix`, {
        method: "POST"
      });
      setLeagueState(withCurrentPlayer(state));
      setGameView("drive");
      showStatus(tt("status_next_grand_prix_started"));
      pushCommandHint("prepare");
    });
  }

  async function buyCard(cardId: CardId) {
    if (!leagueState || !playerTeam) return;

    await mutateLeague("status_buying_card", `/leagues/${leagueState.league.id}/cards/buy`, { teamId: playerTeam.id, cardId }, "status_card_bought");
  }

  async function updateLivery(livery: LeagueState["teams"][number]["livery"]) {
    if (!leagueState || !playerTeam) return;

    await mutateLeague("status_livery_updated", `/leagues/${leagueState.league.id}/teams/livery`, { teamId: playerTeam.id, livery }, "status_livery_updated");
  }

  async function updateTeamName(name: string) {
    if (!leagueState || !playerTeam) return;

    await run(tt("status_team_name_updated"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/teams/name`, {
        method: "POST",
        body: JSON.stringify({
          teamId: playerTeam.id,
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
      showStatus(`${tt("status_profile_created")} ${session.recoveryCode ?? ""}`);
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
      showStatus(tt("status_profile_recovered"));
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

    await mutateLeague("status_restarting_league", `/leagues/${leagueState.league.id}/restart`, undefined, "status_league_restarted");
  }

  async function run(nextMessage: string, action: () => Promise<void>, staleClaimTeamId?: string) {
    setStatus("loading");
    showStatus(nextMessage);

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
      showStatus(error instanceof Error ? error.message : tt("status_api_unavailable"), "error");
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

    try {
      await navigator.clipboard?.writeText(code);
    } catch {
      const input = document.createElement("input");
      input.value = code;
      input.setAttribute("readonly", "");
      input.style.left = "-9999px";
      input.style.position = "fixed";
      document.body.append(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }

    showStatus(`${tt("status_profile_code_copied")} ${code}`, "info", false);
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
          <label>
            {tt("language_label")}
            <select value={locale} onChange={(event) => changeLocale(event.target.value as Locale)}>
              <option value="en">{tt("language_en")}</option>
              <option value="fr">{tt("language_fr")}</option>
            </select>
          </label>
          {showManageLeague ? (
            <button type="button" className="profile-menu-action" onClick={addLeague}>
              {tt("action_add_league")}
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
    <div className="modal-overlay" onClick={() => setProfileCodeOpen(false)}>
      <section className="panel modal" role="dialog" aria-modal="true" aria-label={tt("profile_code_title")} onClick={(event) => event.stopPropagation()}>
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
      </section>
    </div>
  ) : null;

  const profileLogoutModal = profileLogoutOpen ? (
    <div className="modal-overlay" onClick={() => setProfileLogoutOpen(false)}>
      <section className="panel modal" role="dialog" aria-modal="true" aria-label={tt("profile_logout_title")} onClick={(event) => event.stopPropagation()}>
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
      </section>
    </div>
  ) : null;

  const directiveConfirmModal = directiveConfirmOpen ? (
    <div className="modal-overlay" onClick={() => setDirectiveConfirmOpen(false)}>
      <section className="panel modal" role="dialog" aria-modal="true" aria-label={tt("directive_confirm_title")} onClick={(event) => event.stopPropagation()}>
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
      </section>
    </div>
  ) : null;
  const qualifyingConfirmModal = qualifyingConfirmOpen ? (
    <div className="modal-overlay" onClick={() => setQualifyingConfirmOpen(false)}>
      <section className="panel modal" role="dialog" aria-modal="true" aria-label={tt("qualifying_confirm_title")} onClick={(event) => event.stopPropagation()}>
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
      </section>
    </div>
  ) : null;
  const nextGrandPrixConfirmModal = nextGrandPrixConfirmOpen ? (
    <div className="modal-overlay" onClick={() => setNextGrandPrixConfirmOpen(false)}>
      <section className="panel modal" role="dialog" aria-modal="true" aria-label={tt("next_gp_confirm_title")} onClick={(event) => event.stopPropagation()}>
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
              setGameView("result");
              setResultTab("report");
            }}
            disabled={!result}
          >
            {tt("result_tab_report")}
          </button>
          <button type="button" onClick={() => setNextGrandPrixConfirmOpen(false)}>
            {tt("action_close")}
          </button>
        </div>
      </section>
    </div>
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
      <SetupShell tt={tt} topbar={setupTopbar} notificationStack={notificationStack} profileCodeModal={profileCodeModal} profileLogoutModal={profileLogoutModal}>
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
                <div className="actions primary-actions">
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
      <SetupShell tt={tt} topbar={setupTopbar} notificationStack={notificationStack} profileCodeModal={profileCodeModal} profileLogoutModal={profileLogoutModal}>
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
                          onChange={(event) => setForm({ ...form, maxPlayers: Number(event.target.value) })}
                        />
                      </label>
                      <label>
                        {tt("field_qualifying_attempts")}
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={form.qualifyingAttemptLimit}
                          onChange={(event) => setForm({ ...form, qualifyingAttemptLimit: Number(event.target.value) })}
                        />
                      </label>
                      <label>
                        {tt("field_gp_per_season")}
                        <input
                          type="number"
                          min="1"
                          max="18"
                          value={form.maxGrandPrixPerSeason}
                          onChange={(event) => setForm({ ...form, maxGrandPrixPerSeason: Number(event.target.value) })}
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
                <div className="actions primary-actions">
                  <button type="button" onClick={setupMode === "create" ? createLeague : joinLeague} disabled={status === "loading"}>
                    {setupMode === "create" ? tt("action_start_league") : tt("action_join_league")}
                  </button>
                  <button type="button" className="secondary-button" onClick={() => setSetupMode("choice")} disabled={status === "loading"}>
                    {tt("action_back")}
                  </button>
                </div>
              </>
            )}

            <div className="saved-leagues saved-leagues-compact">
              <span className="section-kicker">{tt("profile_saved_leagues")}</span>
              {savedClaims.length ? (
                <div className="saved-league-list">
                  {savedClaims.map((claim) => (
                    <button key={claim.teamId} type="button" className="profile-menu-action" onClick={() => void switchLeague(claim.teamId)} disabled={status === "loading"}>
                      <strong>{claim.leagueName}</strong>
                      <small>
                        {claim.teamName}
                        {claim.leagueCode ? ` · ${claim.leagueCode}` : ""}
                      </small>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="saved-leagues-empty">{tt("profile_saved_leagues_empty")}</p>
              )}
            </div>
          </div>
        </section>
      </SetupShell>
    );
  }

  return (
    <main className="app-shell game-shell">
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
              onClick={() => setGameView(view)}
              disabled={view === "result" && !result}
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
        {gameView === "drive" ? (
          <div className="drive-grid">
            <div className="drive-content-column">
              <section className="panel race-context-panel">
                <h2>{tt("drive_context_title")}</h2>
                <p>{tt("drive_context_explainer")}</p>
              </section>
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
                        {countryFlag(currentCircuit.country)} {currentCircuit.city}
                      </span>
                      <strong>{tt(currentCircuit.layoutKey)}</strong>
                      <small>
                        {currentCircuit.laps} {tt("unit_laps")} · {tt(`weather_${currentCircuit.likelyWeather}` as TranslationKey)}
                      </small>
                    </div>
                    <MapTraitsPanel traits={currentCircuit.traits} impacts={directiveTraitImpacts} tt={tt} />
                    {qualifyingPanelOpen ? (
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
                                  {run.lap ? ` · ${tt("unit_lap")} ${run.lap}` : ""}
                                </span>
                                <em>{run.time.toFixed(2)}s</em>
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <small>{tt("qualifying_times_empty")}</small>
                        )}
                      </div>
                    ) : (
                      <button className="map-qualifying-toggle" type="button" onClick={() => setQualifyingPanelOpen(true)}>
                        {tt("qualifying_times_title")} {qualifyingAttemptsUsed}/{qualifyingAttemptLimit}
                      </button>
                    )}
                  </>
                }
              />
            </div>
            <div className="drive-content-column">
              <DirectivePanel
                form={form}
                setForm={setForm}
                ownedCardIds={ownedCardIds}
                selectedCardId={selectedCardId}
                selectedCardFit={selectedCardFit}
                cardLocked={Boolean(qualifyingLockedCardId)}
                disabled={status === "loading" || Boolean(playerDecision) || isResolved}
                tt={tt}
              />
            </div>
          </div>
        ) : null}
        {gameView === "championship" ? (
          <ChampionshipView
            state={leagueState}
            playerTeamId={playerTeam?.id}
            onReplayGrandPrix={setHistoryReplay}
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
            onUpdateLivery={updateLivery}
            onUpdateTeamName={updateTeamName}
            tt={tt}
          />
        ) : null}
        {gameView === "result" && result ? (
          <ResultView
            state={leagueState}
            result={result}
            circuit={currentCircuit}
            playerTeamId={playerTeam?.id}
            playerDecision={playerDecision}
            forecastPick={forecastPick}
            tab={resultTab}
            traitImpacts={replayTraitImpacts}
            tt={tt}
          />
        ) : null}
      </section>

      <footer className="command-bar">
        <div className="command-context">
          <span className={`race-state state-${deskState}`}>
            <span className="race-state-label">{tt(`race_state_${deskState}` as TranslationKey)}</span>
          </span>
        </div>
        <div className="command-actions">
          {gameView === "result" && result ? (
            <button
              className="result-toggle-command"
              type="button"
              aria-controls={`result-${resultTab === "report" ? "replay" : "report"}-panel`}
              onClick={() => setResultTab(resultTab === "report" ? "replay" : "report")}
            >
              {tt(`result_tab_${resultTab === "report" ? "replay" : "report"}` as TranslationKey)}
            </button>
          ) : null}
          {gameView === "drive" ? (
            <>
              <button className="result-toggle-command" type="button" onClick={openQualifyingRun} disabled={qualifyingDisabled}>
                {tt("action_qualifying")}
              </button>
              <button
                className="result-toggle-command command-icon-button"
                type="button"
                aria-label={tt("action_qualifying_history")}
                title={tt("action_qualifying_history")}
                onClick={openLastQualifyingRun}
                disabled={!lastQualifyingRun}
              >
                ◷
              </button>
            </>
          ) : null}
          {gameView === "championship" ? (
            <button className="result-toggle-command" type="button" onClick={() => setLeagueControlsOpen(true)}>
              {tt("settings_title")}
            </button>
          ) : null}
          <button className="primary-command" type="button" onClick={primaryCommand.action} disabled={primaryCommand.disabled}>
            {primaryCommand.label}
          </button>
        </div>
      </footer>
      {notificationStack}

      {qualifyingOpen ? (
        <div className="modal-overlay" onClick={() => setQualifyingOpen(false)}>
          <section className="panel modal qualifying-modal" role="dialog" aria-modal="true" aria-label={tt("qualifying_replay_title")} onClick={(event) => event.stopPropagation()}>
            <button className="modal-close-button" type="button" aria-label={tt("action_close")} onClick={() => setQualifyingOpen(false)}>
              ×
            </button>
            {replayQualifyingRun ? (
              <div className="qualifying-replay">
                <ReplayView
                  result={replayQualifyingRun.result}
                  circuit={currentCircuit}
                  playerTeamId={playerTeam?.id}
                  teamLiveries={Object.fromEntries(leagueState.teams.map((team) => [team.id, team.livery]))}
                  traitImpacts={directiveTraitImpacts}
                  towerEntries={qualifyingReplayEntries}
                  titleKey="qualifying_replay_title"
                  explainerKey="qualifying_replay_explainer"
                  tt={tt}
                />
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
      {profileCodeModal}
      {profileLogoutModal}
      {directiveConfirmModal}
      {qualifyingConfirmModal}
      {nextGrandPrixConfirmModal}
      {historyReplay?.result ? (
        <div className="modal-overlay" onClick={() => setHistoryReplay(null)}>
          <section className="panel modal qualifying-modal" role="dialog" aria-modal="true" aria-label={tt("result_replay_title")} onClick={(event) => event.stopPropagation()}>
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
                tt={tt}
              />
            </div>
          </section>
        </div>
      ) : null}
      {leagueControlsOpen ? (
        <div className="modal-overlay" onClick={closeLeagueControls}>
          <section className="panel modal league-controls-modal" role="dialog" aria-modal="true" aria-label={tt("settings_title")} onClick={(event) => event.stopPropagation()}>
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
          </section>
        </div>
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
