import { APP_NAME, type RaceDecision, type RaceResult } from "@cr-league/shared";
import { useEffect, useMemo, useState } from "react";
import { isLocale, t, type Locale, type TranslationKey } from "../i18n/index.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4874";
const PLAYER_CLAIM_KEY = "cr-league-player-claim";
const LANGUAGE_KEY = "cr-league-language";

type LeagueState = {
  league: {
    id: string;
    name: string;
    code: string;
    status: string;
    cadence: string;
    preparationDeadlineAt: string | null;
  };
  currentGrandPrix: {
    id: string;
    name: string;
    round: number;
    status: string;
    result: RaceResult | null;
  };
  grandPrixHistory: Array<{
    id: string;
    name: string;
    round: number;
    status: string;
    result: RaceResult | null;
  }>;
  teams: Array<{
    id: string;
    name: string;
    kind: string;
    points: number;
    credits: number;
    ready: boolean;
  }>;
  actionState: {
    submittedTeamIds: string[];
    missingTeamIds: string[];
    canResolve: boolean;
    canStartNextGrandPrix: boolean;
    nextAction: string;
  };
  player?: {
    teamId: string;
    claimCode: string;
  };
  decisions: Array<{
    teamId: string;
    approach: RaceDecision["approach"];
    preparation: RaceDecision["preparation"];
    cardId: RaceDecision["cardId"] | null;
    rivalTeamId: string | null;
  }>;
};

type FormState = {
  leagueName: string;
  joinCode: string;
  teamName: string;
  cadence: string;
  preparationDeadlineAt: string;
  approach: RaceDecision["approach"];
  preparation: RaceDecision["preparation"];
  cardId: RaceDecision["cardId"] | "";
};

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
    return isLocale(saved) ? saved : "en";
  });
  const tt = (key: TranslationKey) => t(key, locale);
  const [leagueState, setLeagueState] = useState<LeagueState | null>(null);
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
          cardId: form.cardId || undefined
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
      setMessage(tt("status_next_grand_prix_started"));
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
    setMessage(tt("status_player_forgotten"));
  }

  function changeLocale(nextLocale: Locale) {
    localStorage.setItem(LANGUAGE_KEY, nextLocale);
    setLocaleState(nextLocale);
    if (!leagueState && message === t("status_initial", locale)) {
      setMessage(t("status_initial", nextLocale));
    }
  }

  return (
    <main className="app-shell">
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

      <section className="play-grid" aria-label={tt("flow_label")}>
        <article className={leagueState ? "panel race-panel" : "panel control-panel setup-panel"}>
          <h2>{tt("race_desk_title")}</h2>
          <p className={status === "error" ? "status error" : "status"}>{message}</p>

          {!leagueState ? (
            <>
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
            </>
          ) : null}

          {leagueState ? (
            <>
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

              <div className="field-grid directive-fields">
                <label>
                  {tt("field_approach")}
                  <select value={form.approach} onChange={(event) => setForm({ ...form, approach: event.target.value as FormState["approach"] })}>
                    <option value="prudent">{tt("approach_prudent")}</option>
                    <option value="balanced">{tt("approach_balanced")}</option>
                    <option value="aggressive">{tt("approach_aggressive")}</option>
                  </select>
                </label>
                <label>
                  {tt("field_preparation")}
                  <select
                    value={form.preparation}
                    onChange={(event) => setForm({ ...form, preparation: event.target.value as FormState["preparation"] })}
                  >
                    <option value="speed">{tt("preparation_speed")}</option>
                    <option value="reliability">{tt("preparation_reliability")}</option>
                    <option value="weather">{tt("preparation_weather")}</option>
                  </select>
                </label>
                <label>
                  {tt("field_card")}
                  <select value={form.cardId} onChange={(event) => setForm({ ...form, cardId: event.target.value as FormState["cardId"] })}>
                    <option value="">{tt("card_none")}</option>
                    <option value="rain_grip">{tt("card_rain_grip")}</option>
                    <option value="fleet_maintenance">{tt("card_fleet_maintenance")}</option>
                    <option value="launch_boost">{tt("card_launch_boost")}</option>
                    <option value="urban_draft">{tt("card_urban_draft")}</option>
                    <option value="final_surge">{tt("card_final_surge")}</option>
                    <option value="fleet_sponsorship">{tt("card_fleet_sponsorship")}</option>
                  </select>
                </label>
              </div>

              <div className="actions race-actions">
                <button type="button" onClick={submitDirective} disabled={status === "loading" || isResolved}>
                  {tt("action_submit_directive")}
                </button>
                <button type="button" onClick={resolveGrandPrix} disabled={status === "loading" || isResolved}>
                  {tt("action_launch_grand_prix")}
                </button>
                <button type="button" onClick={startNextGrandPrix} disabled={status === "loading" || !leagueState.actionState.canStartNextGrandPrix}>
                  {tt("action_next_grand_prix")}
                </button>
                <button type="button" onClick={updateSettings} disabled={status === "loading"}>
                  {tt("action_update_settings")}
                </button>
                <button type="button" onClick={forgetPlayer} disabled={status === "loading" || !leagueState.player}>
                  {tt("action_forget_team")}
                </button>
              </div>
            </>
          ) : null}
        </article>

        {leagueState ? (
          <article className="panel league-panel">
            <h2>{leagueState.league.name}</h2>
            <section className="dashboard-section">
              <h3>{tt("dashboard_my_team")}</h3>
              <p>{playerTeam ? `${tt("league_your_team")} ${playerTeam.name}` : tt("dashboard_no_team")}</p>
            </section>
            <section className="dashboard-section">
              <h3>{tt("dashboard_current_gp")}</h3>
              <p>
                {tt("league_code")} {leagueState.league.code} · {tt("league_round")} {leagueState.currentGrandPrix.round} ·{" "}
                {leagueState.currentGrandPrix.status}
              </p>
              <p>
                {tt("league_cadence")} {tt(`cadence_${leagueState.league.cadence}` as TranslationKey)} · {tt("league_next_action")}{" "}
                {tt(`next_action_${leagueState.actionState.nextAction}` as TranslationKey)}
              </p>
            </section>
            <section className="dashboard-section">
              <h3>{tt("dashboard_players")}</h3>
              <p>
                {leagueState.actionState.submittedTeamIds.length} {tt("league_ready")} · {leagueState.actionState.missingTeamIds.length}{" "}
                {tt("league_missing")}
              </p>
            </section>
            <ol className="classification">
              {leagueState.teams.map((team) => (
                <li key={team.id}>
                  <span>
                    <strong>{team.name}</strong> {team.kind === "bot" ? tt("team_bot") : tt("team_you")} ·{" "}
                    {team.ready ? tt("team_ready") : tt("team_missing")}
                  </span>
                  <span>
                    {team.points} {tt("unit_points")} · {team.credits} {tt("unit_credits")}
                  </span>
                </li>
              ))}
            </ol>
            <section className="dashboard-section">
              <h3>{tt("league_history")}</h3>
              <ol className="classification">
                {leagueState.grandPrixHistory.map((grandPrix) => (
                  <li key={grandPrix.id}>
                    <span>
                      {tt("league_round")} {grandPrix.round}
                    </span>
                    <span>{grandPrix.status}</span>
                  </li>
                ))}
              </ol>
            </section>
          </article>
        ) : null}

        {result ? (
          <>
            <article className="panel result-panel">
              <h2>{result.grandPrixName}</h2>
              <p>{result.report.headline}</p>
              <ol className="classification">
                {result.classification.map((entry) => (
                  <li key={entry.teamId}>
                    <span>
                      <strong>P{entry.position}</strong> {entry.teamName}
                    </span>
                    <span>
                      {entry.points} {tt("unit_points")} · {entry.credits} {tt("unit_credits")}
                    </span>
                  </li>
                ))}
              </ol>
            </article>

            <article className="panel moments-panel">
              <h2>{tt("result_key_moments")}</h2>
              <ul className="events replay-timeline">
                {result.events.slice(0, 6).map((event) => (
                  <li key={event.id}>
                    <span className="lap-marker">{tt("unit_lap")} {event.lap}</span>
                    <strong>{event.replayText}</strong>
                  </li>
                ))}
              </ul>
            </article>

            <article className="panel report-panel">
              <h2>{tt("result_race_report")}</h2>
              {result.report.blocks.map((block) => (
                <section key={block.title}>
                  <h3>{block.title}</h3>
                  <p>{block.body}</p>
                </section>
              ))}
            </article>
          </>
        ) : null}
      </section>
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
