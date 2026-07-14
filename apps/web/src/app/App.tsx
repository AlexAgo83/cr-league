import { APP_NAME, type CardId } from "@cr-league/shared";
import { useEffect, useMemo, useState } from "react";
import { isLocale, t, type Locale, type TranslationKey } from "../i18n/index.js";
import { circuitForRound, countryFlag } from "./circuits.js";
import { cardFit, strongestForecast } from "./helpers.js";
import { randomLeagueName, randomTeamName } from "./nameSeeds.js";
import { GAME_VIEWS, type FormState, type GameView, type LeagueState, type ProfileSession } from "./types.js";
import { ChampionshipView } from "../features/ChampionshipView.js";
import { CircuitMap, MapTraitsPanel, type MapTraitImpacts } from "../features/CircuitMap.js";
import { DirectivePanel } from "../features/DirectivePanel.js";
import { GarageView } from "../features/GarageView.js";
import { ResultView, type ResultTab } from "../features/ResultView.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4874";
const PLAYER_CLAIM_KEY = "cr-league-player-claim";
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
  if (selectedCardId === "rain_grip") add("grip", tt("field_card"));
  if (selectedCardId === "launch_boost" || selectedCardId === "urban_draft") add("overtaking", tt("field_card"));
  if (selectedCardId === "fleet_maintenance" || selectedCardId === "final_surge") add("energy", tt("field_card"));

  return impacts;
}

function createInitialForm(locale: Locale): FormState {
  return {
    leagueName: randomLeagueName() || t("default_league_name", locale),
    joinCode: "",
    teamName: randomTeamName() || t("default_team_name", locale),
    cadence: "manual",
    preparationDeadlineAt: "",
    approach: "balanced",
    preparation: "weather",
    cardId: "rain_grip"
  };
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
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [leagueControlsOpen, setLeagueControlsOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => createInitialForm(locale));
  const [profileSession, setProfileSession] = useState<ProfileSession | null>(loadProfileSession);
  const [profileForm, setProfileForm] = useState({ email: "", recoveryCode: "" });
  const [savedClaims, setSavedClaims] = useState(loadPlayerClaims);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState(() => t("status_initial", locale));

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
        setMessage(tt("status_league_rejoined"));
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
  const result = leagueState?.currentGrandPrix.result;
  const isResolved = leagueState?.currentGrandPrix.status === "resolved" || Boolean(result);
  const forecastPick = leagueState ? strongestForecast(leagueState.currentGrandPrix.forecast) : "dry";
  const ownedCardIds = useMemo(() => Array.from(new Set(playerTeam?.cards ?? [])), [playerTeam]);
  const selectedCardId = ownedCardIds.includes(form.cardId as CardId) ? form.cardId : "";
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
            action: startNextGrandPrix,
            disabled: status === "loading" || !leagueState?.actionState.canStartNextGrandPrix
          };

  async function createLeague() {
    await run(tt("status_creating_league"), async () => {
      const state = await api<LeagueState>("/leagues", {
        method: "POST",
        body: JSON.stringify({
          name: form.leagueName,
          teamName: form.teamName,
          profileId: profileSession?.profile.id
        })
      });
      rememberPlayer(state);
      setLeagueState(state);
      setGameView("drive");
      setMessage(tt("status_league_created"));
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
      setMessage(tt("status_league_joined"));
    });
  }

  async function submitDirective() {
    if (!leagueState || !playerTeam) return;

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
      setLeagueState(state);
      setMessage(tt("status_directive_locked"));
    });
  }

  async function updateSettings() {
    if (!leagueState) return;

    await run(tt("status_updating_settings"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/settings`, {
        method: "POST",
        body: JSON.stringify({
          cadence: form.cadence,
          preparationDeadlineAt: form.preparationDeadlineAt ? new Date(form.preparationDeadlineAt).toISOString() : null
        })
      });
      setLeagueState(state);
      setMessage(tt("status_settings_updated"));
    });
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
      setLeagueState(state);
      setGameView("result");
      setResultTab("replay");
      setMessage(tt("status_grand_prix_resolved"));
    });
  }

  async function startNextGrandPrix() {
    if (!leagueState) return;

    await run(tt("status_starting_next_grand_prix"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/next-grand-prix`, {
        method: "POST"
      });
      setLeagueState(state);
      setGameView("drive");
      setMessage(tt("status_next_grand_prix_started"));
    });
  }

  async function buyCard(cardId: CardId) {
    if (!leagueState || !playerTeam) return;

    await run(tt("status_buying_card"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/cards/buy`, {
        method: "POST",
        body: JSON.stringify({
          teamId: playerTeam.id,
          cardId
        })
      });
      setLeagueState(state);
      setMessage(tt("status_card_bought"));
    });
  }

  async function updateLivery(livery: LeagueState["teams"][number]["livery"]) {
    if (!leagueState || !playerTeam) return;

    await run(tt("status_livery_updated"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/teams/livery`, {
        method: "POST",
        body: JSON.stringify({
          teamId: playerTeam.id,
          livery
        })
      });
      setLeagueState(state);
      setMessage(tt("status_livery_updated"));
    });
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
      setLeagueState(state);
      rememberPlayer(state);
      setMessage(tt("status_team_name_updated"));
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
      setMessage(`${tt("status_profile_created")} ${session.recoveryCode ?? ""}`);
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
      setMessage(tt("status_profile_recovered"));
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
        setMessage(tt("status_league_rejoined"));
      },
      claim.teamId
    );
  }

  async function restartLeague() {
    if (!leagueState || !window.confirm(tt("restart_confirm"))) return;

    await run(tt("status_restarting_league"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/restart`, {
        method: "POST"
      });
      setLeagueState(leagueState.player ? { ...state, player: leagueState.player } : state);
      setMessage(tt("status_league_restarted"));
    });
  }

  async function run(nextMessage: string, action: () => Promise<void>, staleClaimTeamId?: string) {
    setStatus("loading");
    setMessage(nextMessage);

    try {
      await action();
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      if (isStaleLeagueError(error)) {
        forgetClaim(staleClaimTeamId);
        setLeagueState(null);
        setMessage(tt("status_saved_league_expired"));
        return;
      }
      setMessage(error instanceof Error ? error.message : tt("status_api_unavailable"));
    }
  }

  function forgetPlayer() {
    forgetClaim(leagueState?.player?.teamId);
    setLeagueState(null);
    setGameView("drive");
    setMessage(tt("status_player_forgotten"));
  }

  function addLeague() {
    setLeagueState(null);
    setGameView("drive");
    setProfileOpen(false);
    setMessage(tt("status_initial"));
  }

  function forgetProfile() {
    localStorage.removeItem(PROFILE_SESSION_KEY);
    localStorage.removeItem(PLAYER_CLAIM_KEY);
    setProfileSession(null);
    setLeagueState(null);
    setSavedClaims([]);
    storePlayerClaims([], undefined);
    setMessage(tt("status_initial"));
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

  if (!profileSession) {
    return (
      <main className="app-shell setup-shell">
        <section className="hero" aria-labelledby="app-title">
          <div className="hero-topline">
            <p className="eyebrow">{tt("app_eyebrow")}</p>
            <label className="language-select">
              {tt("language_label")}
              <select value={locale} onChange={(event) => changeLocale(event.target.value as Locale)}>
                <option value="en">{tt("language_en")}</option>
                <option value="fr">{tt("language_fr")}</option>
              </select>
            </label>
          </div>
          <h1 id="app-title">{APP_NAME}</h1>
          <p>{tt("profile_intro")}</p>
        </section>

        <section className="panel setup-panel" aria-label={tt("profile_title")}>
          <div className="panel-heading">
            <div>
              <span className="section-kicker">{tt("profile_kicker")}</span>
              <h2>{tt("profile_title")}</h2>
            </div>
          </div>
          <p className={status === "error" ? "status error" : "status"}>{message}</p>
          <div className="field-grid setup-fields">
            <label>
              {tt("field_email")}
              <input type="email" value={profileForm.email} onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })} />
            </label>
            <label>
              {tt("field_recovery_code")}
              <input value={profileForm.recoveryCode} onChange={(event) => setProfileForm({ ...profileForm, recoveryCode: event.target.value.toUpperCase() })} />
            </label>
          </div>
          <div className="actions primary-actions">
            <button type="button" onClick={createProfileSession} disabled={status === "loading"}>
              {tt("action_create_profile")}
            </button>
            <button type="button" onClick={recoverProfileSession} disabled={status === "loading"}>
              {tt("action_recover_profile")}
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (!leagueState) {
    return (
      <main className="app-shell setup-shell">
        <section className="hero" aria-labelledby="app-title">
          <div className="hero-topline">
            <p className="eyebrow">{tt("app_eyebrow")}</p>
            <label className="language-select">
              {tt("language_label")}
              <select value={locale} onChange={(event) => changeLocale(event.target.value as Locale)}>
                <option value="en">{tt("language_en")}</option>
                <option value="fr">{tt("language_fr")}</option>
              </select>
            </label>
          </div>
          <h1 id="app-title">{APP_NAME}</h1>
          <p>{tt("app_intro")}</p>
        </section>

        <section className="panel setup-panel" aria-label={tt("flow_label")}>
          <div className="panel-heading">
            <div>
              <span className="section-kicker">{tt("race_desk_kicker")}</span>
              <h2>{tt("race_desk_title")}</h2>
            </div>
          </div>
          <p className={status === "error" ? "status error" : "status"}>{message}</p>
          <div className="field-grid setup-fields">
            <label>
              {tt("field_league")}
              <input maxLength={40} value={form.leagueName} onChange={(event) => setForm({ ...form, leagueName: event.target.value })} />
            </label>
            <label>
              {tt("field_join_code")}
              <input
                value={form.joinCode}
                onChange={(event) => setForm({ ...form, joinCode: event.target.value.toUpperCase() })}
                maxLength={6}
                placeholder="PLAY01"
              />
            </label>
            <label>
              {tt("field_team")}
              <input maxLength={32} value={form.teamName} onChange={(event) => setForm({ ...form, teamName: event.target.value })} />
            </label>
          </div>
          <div className="actions primary-actions">
            <button type="button" onClick={createLeague} disabled={status === "loading"}>
              {tt("action_create_league")}
            </button>
            <button type="button" onClick={joinLeague} disabled={status === "loading"}>
              {tt("action_join_league")}
            </button>
          </div>
          {savedClaims.length ? (
            <div className="saved-leagues">
              <span className="section-kicker">{tt("profile_saved_leagues")}</span>
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
            </div>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell game-shell">
      <header className="topbar">
        <div className="brand">
          <img className="brand-icon" src="/favicon.svg" alt={APP_NAME} />
          <strong>{leagueState.league.name}</strong>
          <span className="invite-code">{leagueState.league.code}</span>
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
        <div
          className="profile-menu"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setProfileOpen(false);
          }}
        >
          <button
            type="button"
            className="profile-menu-button"
            aria-label={tt("profile_menu")}
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen(!profileOpen)}
          >
            {playerTeam?.name.slice(0, 2).toUpperCase() ?? "CR"}
          </button>
          {profileOpen ? (
            <div className="profile-menu-panel">
              <div className="profile-league-summary">
                <strong>{leagueState.league.name}</strong>
                <span className="invite-code">{leagueState.league.code}</span>
              </div>
              {savedClaims.length > 1 ? (
                <label>
                  {tt("profile_league_switch")}
                  <select value={leagueState.player?.teamId ?? ""} onChange={(event) => void switchLeague(event.target.value)}>
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
              <button type="button" className="profile-menu-action" onClick={addLeague}>
                {tt("action_add_league")}
              </button>
              <button type="button" className="profile-menu-action" onClick={forgetProfile}>
                {tt("action_forget_profile")}
              </button>
              {leagueState.player ? (
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
            </div>
          ) : null}
        </div>
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
                  </>
                }
              />
            </div>
            <DirectivePanel
              form={form}
              setForm={setForm}
              ownedCardIds={ownedCardIds}
              selectedCardId={selectedCardId}
              selectedCardFit={selectedCardFit}
              tt={tt}
            />
          </div>
        ) : null}
        {gameView === "championship" ? (
          <ChampionshipView
            state={leagueState}
            playerTeamId={playerTeam?.id}
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
          <p className={status === "error" ? "status error" : "status"}>{message}</p>
          <small className="command-hint">{tt(`command_hint_${deskState}` as TranslationKey)}</small>
        </div>
        <div className="command-actions">
          {gameView === "drive" ? (
            <button className="info-command" type="button" onClick={() => setBriefingOpen(true)}>
              {tt("race_info")}
            </button>
          ) : null}
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
          <button className="primary-command" type="button" onClick={primaryCommand.action} disabled={primaryCommand.disabled}>
            {primaryCommand.label}
          </button>
        </div>
      </footer>

      {briefingOpen ? (
        <div className="modal-overlay" onClick={() => setBriefingOpen(false)}>
          <section
            className="panel modal"
            role="dialog"
            aria-modal="true"
            aria-label={tt("briefing_next_action")}
            onClick={(event) => event.stopPropagation()}
          >
            <span className="section-kicker">{tt("briefing_next_action")}</span>
            <h2>{tt(`next_action_${leagueState.actionState.nextAction}` as TranslationKey)}</h2>
            <p>{isResolved ? tt("briefing_tip_resolved") : tt("briefing_tip_prepare")}</p>
            <div className="race-telemetry" aria-label={tt("race_telemetry")}>
              <span>{tt(`trait_${leagueState.currentGrandPrix.primaryTrait}` as TranslationKey)}</span>
              <span>{tt(`trait_${leagueState.currentGrandPrix.secondaryTrait}` as TranslationKey)}</span>
              <span>
                {tt(`weather_${forecastPick}` as TranslationKey)} {leagueState.currentGrandPrix.forecast[forecastPick]}%
              </span>
              <span>
                {tt("dashboard_players")} {leagueState.actionState.submittedTeamIds.length}/{leagueState.teams.length}
              </span>
            </div>
            <div className="actions">
              <button type="button" onClick={() => setBriefingOpen(false)}>
                {tt("action_close")}
              </button>
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
  const claims = parsePlayerClaims(localStorage.getItem(PLAYER_CLAIMS_KEY));
  const oldClaim = parseLegacyClaim(localStorage.getItem(PLAYER_CLAIM_KEY));
  if (!oldClaim) return claims;
  localStorage.removeItem(PLAYER_CLAIM_KEY);
  const migrated = upsertPlayerClaim(claims, oldClaim);
  storePlayerClaims(migrated, oldClaim.teamId);
  return migrated;
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

function parseLegacyClaim(raw: string | null): StoredPlayerClaim | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredPlayerClaim>;
    return typeof parsed.teamId === "string" && typeof parsed.claimCode === "string"
      ? {
          teamId: parsed.teamId,
          claimCode: parsed.claimCode,
          leagueId: parsed.leagueId ?? "",
          leagueName: parsed.leagueName ?? "Saved league",
          leagueCode: parsed.leagueCode ?? "",
          teamName: parsed.teamName ?? "Team"
        }
      : null;
  } catch {
    return null;
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
