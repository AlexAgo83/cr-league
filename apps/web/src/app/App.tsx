import { APP_NAME, type RaceDecision, type RaceResult } from "@cr-league/shared";
import { useEffect, useMemo, useState } from "react";
import { t, type TranslationKey } from "../i18n/index.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4874";
const PLAYER_CLAIM_KEY = "cr-league-player-claim";

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

const initialForm: FormState = {
  leagueName: t("default_league_name"),
  joinCode: "",
  teamName: t("default_team_name"),
  cadence: "manual",
  preparationDeadlineAt: "",
  approach: "balanced",
  preparation: "weather",
  cardId: "rain_grip"
};

export function App() {
  const [leagueState, setLeagueState] = useState<LeagueState | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState(t("status_initial"));

  useEffect(() => {
    const saved = localStorage.getItem(PLAYER_CLAIM_KEY);
    if (!saved) return;
    void run(t("status_rejoining_league"), async () => {
      const state = await api<LeagueState>("/leagues/rejoin", {
        method: "POST",
        body: saved
      });
      rememberPlayer(state);
      setLeagueState(state);
      setMessage(t("status_league_rejoined"));
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
    await run(t("status_creating_league"), async () => {
      const state = await api<LeagueState>("/leagues", {
        method: "POST",
        body: JSON.stringify({
          name: form.leagueName,
          teamName: form.teamName
        })
      });
      rememberPlayer(state);
      setLeagueState(state);
      setMessage(t("status_league_created"));
    });
  }

  async function joinLeague() {
    await run(t("status_joining_league"), async () => {
      const state = await api<LeagueState>("/leagues/join", {
        method: "POST",
        body: JSON.stringify({
          code: form.joinCode,
          teamName: form.teamName
        })
      });
      rememberPlayer(state);
      setLeagueState(state);
      setMessage(t("status_league_joined"));
    });
  }

  async function submitDirective() {
    if (!leagueState || !playerTeam) return;

    await run(t("status_submitting_directive"), async () => {
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
      setMessage(t("status_directive_locked"));
    });
  }

  async function updateSettings() {
    if (!leagueState) return;

    await run(t("status_updating_settings"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/settings`, {
        method: "POST",
        body: JSON.stringify({
          cadence: form.cadence,
          preparationDeadlineAt: form.preparationDeadlineAt ? new Date(form.preparationDeadlineAt).toISOString() : null
        })
      });
      setLeagueState(state);
      setMessage(t("status_settings_updated"));
    });
  }

  async function resolveGrandPrix() {
    if (!leagueState) return;

    await run(t("status_resolving_grand_prix"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/resolve`, {
        method: "POST",
        body: JSON.stringify({
          allowDefaults: !playerDecision
        })
      });
      setLeagueState(state);
      setMessage(t("status_grand_prix_resolved"));
    });
  }

  async function startNextGrandPrix() {
    if (!leagueState) return;

    await run(t("status_starting_next_grand_prix"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/next-grand-prix`, {
        method: "POST"
      });
      setLeagueState(state);
      setMessage(t("status_next_grand_prix_started"));
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
      setMessage(error instanceof Error ? error.message : t("status_api_unavailable"));
    }
  }

  function forgetPlayer() {
    localStorage.removeItem(PLAYER_CLAIM_KEY);
    setLeagueState(null);
    setMessage(t("status_player_forgotten"));
  }

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="app-title">
        <p className="eyebrow">{t("app_eyebrow")}</p>
        <h1 id="app-title">{APP_NAME}</h1>
        <p>{t("app_intro")}</p>
      </section>

      <section className="play-grid" aria-label={t("flow_label")}>
        <article className="panel control-panel">
          <h2>{t("race_desk_title")}</h2>
          <p className={status === "error" ? "status error" : "status"}>{message}</p>

          <div className="field-grid">
            <label>
              {t("field_league")}
              <input
                value={form.leagueName}
                onChange={(event) => setForm({ ...form, leagueName: event.target.value })}
                disabled={Boolean(leagueState)}
              />
            </label>
            <label>
              {t("field_join_code")}
              <input
                value={form.joinCode}
                onChange={(event) => setForm({ ...form, joinCode: event.target.value.toUpperCase() })}
                disabled={Boolean(leagueState)}
                maxLength={6}
              />
            </label>
            <label>
              {t("field_team")}
              <input
                value={form.teamName}
                onChange={(event) => setForm({ ...form, teamName: event.target.value })}
                disabled={Boolean(leagueState)}
              />
            </label>
          </div>

          {leagueState ? (
            <div className="field-grid">
              <label>
                {t("field_cadence")}
                <select value={form.cadence} onChange={(event) => setForm({ ...form, cadence: event.target.value })}>
                  <option value="manual">{t("cadence_manual")}</option>
                  <option value="fast">{t("cadence_fast")}</option>
                  <option value="weekly">{t("cadence_weekly")}</option>
                </select>
              </label>
              <label>
                {t("field_deadline")}
                <input
                  type="datetime-local"
                  value={form.preparationDeadlineAt}
                  onChange={(event) => setForm({ ...form, preparationDeadlineAt: event.target.value })}
                />
              </label>
            </div>
          ) : null}

          <div className="field-grid">
            <label>
              {t("field_approach")}
              <select value={form.approach} onChange={(event) => setForm({ ...form, approach: event.target.value as FormState["approach"] })}>
                <option value="prudent">{t("approach_prudent")}</option>
                <option value="balanced">{t("approach_balanced")}</option>
                <option value="aggressive">{t("approach_aggressive")}</option>
              </select>
            </label>
            <label>
              {t("field_preparation")}
              <select
                value={form.preparation}
                onChange={(event) => setForm({ ...form, preparation: event.target.value as FormState["preparation"] })}
              >
                <option value="speed">{t("preparation_speed")}</option>
                <option value="reliability">{t("preparation_reliability")}</option>
                <option value="weather">{t("preparation_weather")}</option>
              </select>
            </label>
            <label>
              {t("field_card")}
              <select value={form.cardId} onChange={(event) => setForm({ ...form, cardId: event.target.value as FormState["cardId"] })}>
                <option value="">{t("card_none")}</option>
                <option value="rain_grip">{t("card_rain_grip")}</option>
                <option value="fleet_maintenance">{t("card_fleet_maintenance")}</option>
                <option value="launch_boost">{t("card_launch_boost")}</option>
                <option value="urban_draft">{t("card_urban_draft")}</option>
                <option value="final_surge">{t("card_final_surge")}</option>
                <option value="fleet_sponsorship">{t("card_fleet_sponsorship")}</option>
              </select>
            </label>
          </div>

          <div className="actions">
            <button type="button" onClick={createLeague} disabled={status === "loading" || Boolean(leagueState)}>
              {t("action_create_league")}
            </button>
            <button type="button" onClick={joinLeague} disabled={status === "loading" || Boolean(leagueState)}>
              {t("action_join_league")}
            </button>
            <button type="button" onClick={submitDirective} disabled={status === "loading" || !leagueState || isResolved}>
              {t("action_submit_directive")}
            </button>
            <button type="button" onClick={resolveGrandPrix} disabled={status === "loading" || !leagueState || isResolved}>
              {t("action_launch_grand_prix")}
            </button>
            <button type="button" onClick={startNextGrandPrix} disabled={status === "loading" || !leagueState?.actionState.canStartNextGrandPrix}>
              {t("action_next_grand_prix")}
            </button>
            <button type="button" onClick={updateSettings} disabled={status === "loading" || !leagueState}>
              {t("action_update_settings")}
            </button>
            <button type="button" onClick={forgetPlayer} disabled={status === "loading" || !leagueState?.player}>
              {t("action_forget_team")}
            </button>
          </div>
        </article>

        {leagueState ? (
          <article className="panel">
            <h2>{leagueState.league.name}</h2>
            <section className="dashboard-section">
              <h3>{t("dashboard_my_team")}</h3>
              <p>{playerTeam ? `${t("league_your_team")} ${playerTeam.name}` : t("dashboard_no_team")}</p>
            </section>
            <section className="dashboard-section">
              <h3>{t("dashboard_current_gp")}</h3>
              <p>
                {t("league_code")} {leagueState.league.code} · {t("league_round")} {leagueState.currentGrandPrix.round} ·{" "}
                {leagueState.currentGrandPrix.status}
              </p>
              <p>
                {t("league_cadence")} {t(`cadence_${leagueState.league.cadence}` as TranslationKey)} · {t("league_next_action")}{" "}
                {t(`next_action_${leagueState.actionState.nextAction}` as TranslationKey)}
              </p>
            </section>
            <section className="dashboard-section">
              <h3>{t("dashboard_players")}</h3>
              <p>
                {leagueState.actionState.submittedTeamIds.length} {t("league_ready")} · {leagueState.actionState.missingTeamIds.length}{" "}
                {t("league_missing")}
              </p>
            </section>
            <ol className="classification">
              {leagueState.teams.map((team) => (
                <li key={team.id}>
                  <span>
                    <strong>{team.name}</strong> {team.kind === "bot" ? t("team_bot") : t("team_you")} ·{" "}
                    {team.ready ? t("team_ready") : t("team_missing")}
                  </span>
                  <span>
                    {team.points} {t("unit_points")} · {team.credits} {t("unit_credits")}
                  </span>
                </li>
              ))}
            </ol>
            <section className="dashboard-section">
              <h3>{t("league_history")}</h3>
              <ol className="classification">
                {leagueState.grandPrixHistory.map((grandPrix) => (
                  <li key={grandPrix.id}>
                    <span>
                      {t("league_round")} {grandPrix.round}
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
            <article className="panel">
              <h2>{result.grandPrixName}</h2>
              <p>{result.report.headline}</p>
              <ol className="classification">
                {result.classification.map((entry) => (
                  <li key={entry.teamId}>
                    <span>
                      <strong>P{entry.position}</strong> {entry.teamName}
                    </span>
                    <span>
                      {entry.points} {t("unit_points")} · {entry.credits} {t("unit_credits")}
                    </span>
                  </li>
                ))}
              </ol>
            </article>

            <article className="panel">
              <h2>{t("result_key_moments")}</h2>
              <ul className="events replay-timeline">
                {result.events.slice(0, 6).map((event) => (
                  <li key={event.id}>
                    <span className="lap-marker">{t("unit_lap")} {event.lap}</span>
                    <strong>{event.replayText}</strong>
                  </li>
                ))}
              </ul>
            </article>

            <article className="panel report-panel">
              <h2>{t("result_race_report")}</h2>
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
    throw new Error(errorBody?.message ?? `API request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}
