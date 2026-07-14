import { APP_NAME, type CardId } from "@cr-league/shared";
import { useEffect, useMemo, useState } from "react";
import { isLocale, t, type Locale, type TranslationKey } from "../i18n/index.js";
import { circuitForRound, countryFlag } from "./circuits.js";
import { cardFit, strongestForecast } from "./helpers.js";
import { GAME_VIEWS, type FormState, type GameView, type LeagueState } from "./types.js";
import { ChampionshipView } from "../features/ChampionshipView.js";
import { CircuitMap, MapTraitsPanel } from "../features/CircuitMap.js";
import { DirectivePanel } from "../features/DirectivePanel.js";
import { GarageView } from "../features/GarageView.js";
import { ResultView, type ResultTab } from "../features/ResultView.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4874";
const PLAYER_CLAIM_KEY = "cr-league-player-claim";
const LANGUAGE_KEY = "cr-league-language";

function createInitialForm(locale: Locale): FormState {
  return {
    leagueName: t("default_league_name", locale),
    joinCode: "",
    teamName: t("default_team_name", locale),
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
  const [form, setForm] = useState<FormState>(() => createInitialForm(locale));
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState(() => t("status_initial", locale));

  useEffect(() => {
    const saved = localStorage.getItem(PLAYER_CLAIM_KEY);
    if (!saved) return;
    void run(tt("status_rejoining_league"), async () => {
      const state = await api<LeagueState>("/leagues/rejoin", {
        method: "POST",
        body: saved
      });
      rememberPlayer(state);
      setLeagueState(state);
      setMessage(tt("status_league_rejoined"));
    });
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
          teamName: form.teamName
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
          teamName: form.teamName
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
          allowDefaults: !playerDecision
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

  async function run(nextMessage: string, action: () => Promise<void>) {
    setStatus("loading");
    setMessage(nextMessage);

    try {
      await action();
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      if (isStaleLeagueError(error)) {
        localStorage.removeItem(PLAYER_CLAIM_KEY);
        setLeagueState(null);
        setMessage(tt("status_saved_league_expired"));
        return;
      }
      setMessage(error instanceof Error ? error.message : tt("status_api_unavailable"));
    }
  }

  function forgetPlayer() {
    localStorage.removeItem(PLAYER_CLAIM_KEY);
    setLeagueState(null);
    setGameView("drive");
    setMessage(tt("status_player_forgotten"));
  }

  function changeLocale(nextLocale: Locale) {
    localStorage.setItem(LANGUAGE_KEY, nextLocale);
    setLocaleState(nextLocale);
    if (!leagueState && message === t("status_initial", locale)) {
      setMessage(t("status_initial", nextLocale));
    }
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
              <input value={form.leagueName} onChange={(event) => setForm({ ...form, leagueName: event.target.value })} />
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
              <input value={form.teamName} onChange={(event) => setForm({ ...form, teamName: event.target.value })} />
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
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell game-shell">
      <header className="topbar">
        <div className="brand">
          <span className="eyebrow">{APP_NAME}</span>
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
              {tt(`rail_${view}` as TranslationKey)}
            </button>
          ))}
        </nav>
        <select
          className="game-language"
          aria-label={tt("language_label")}
          value={locale}
          onChange={(event) => changeLocale(event.target.value as Locale)}
        >
          <option value="en">{tt("language_en")}</option>
          <option value="fr">{tt("language_fr")}</option>
        </select>
      </header>

      <section className="view-container">
        {gameView === "drive" ? (
          <div className="drive-grid">
            <CircuitMap
              className="drive-map-panel"
              circuit={currentCircuit}
              tt={tt}
              showHeading={false}
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
                  <MapTraitsPanel traits={currentCircuit.traits} tt={tt} />
                </>
              }
            />
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
            form={form}
            setForm={setForm}
            loading={status === "loading"}
            onUpdateSettings={updateSettings}
            onForgetPlayer={forgetPlayer}
            onRestartLeague={restartLeague}
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
            tt={tt}
          />
        ) : null}
      </section>

      <footer className="command-bar">
        <div className="command-context">
          <span className={`race-state state-${deskState}`}>{tt(`race_state_${deskState}` as TranslationKey)}</span>
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
    </main>
  );
}

function rememberPlayer(state: LeagueState) {
  if (state.player) {
    localStorage.setItem(PLAYER_CLAIM_KEY, JSON.stringify(state.player));
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
  return error instanceof ApiError && error.statusCode === 404 && localStorage.getItem(PLAYER_CLAIM_KEY);
}
