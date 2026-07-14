import type { TranslationKey } from "../i18n/index.js";
import { statusLabel, type Translator } from "../app/helpers.js";
import type { FormState, LeagueState } from "../app/types.js";

export function ChampionshipView({
  state,
  playerTeamId,
  form,
  setForm,
  loading,
  onUpdateSettings,
  onForgetPlayer,
  onRestartLeague,
  tt
}: {
  state: LeagueState;
  playerTeamId: string | undefined;
  form: FormState;
  setForm: (form: FormState) => void;
  loading: boolean;
  onUpdateSettings: () => void;
  onForgetPlayer: () => void;
  onRestartLeague: () => void;
  tt: Translator;
}) {
  const leader = state.teams[0];

  return (
    <div className="view-stack">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="section-kicker">{tt("championship_kicker")}</span>
            <h2>{state.league.name}</h2>
          </div>
        </div>
        <div className="dashboard-summary" aria-label={tt("dashboard_summary")}>
          <div>
            <span>{tt("dashboard_current_gp")}</span>
            <strong>
              {tt("league_round")} {state.currentGrandPrix.round}
            </strong>
            <small>{statusLabel(state.currentGrandPrix.status, tt)}</small>
          </div>
          <div>
            <span>{tt("dashboard_players")}</span>
            <strong>
              {state.actionState.submittedTeamIds.length}/{state.teams.length}
            </strong>
            <small>{tt("league_ready")}</small>
          </div>
          <div>
            <span>{tt("dashboard_leader")}</span>
            <strong>{leader?.name ?? "-"}</strong>
            <small>
              {leader?.points ?? 0} {tt("unit_points")}
            </small>
          </div>
          <div>
            <span>{tt("league_cadence")}</span>
            <strong>{tt(`cadence_${state.league.cadence}` as TranslationKey)}</strong>
            <small>{tt(`next_action_${state.actionState.nextAction}` as TranslationKey)}</small>
          </div>
        </div>
      </section>

      <section className="panel">
        <h3>{tt("dashboard_standings")}</h3>
        <ol className="classification standings-list">
          {state.teams.map((team, index) => (
            <li key={team.id} className={team.id === playerTeamId ? "current-team" : undefined}>
              <span>
                <strong>P{index + 1}</strong> {team.name}
                <small>
                  {team.id === playerTeamId ? tt("team_you") : team.kind === "bot" ? tt("team_bot") : tt("team_player")} ·{" "}
                  {team.ready ? tt("team_ready") : tt("team_missing")}
                </small>
              </span>
              <span>
                {team.points} {tt("unit_points")} · {team.credits} {tt("unit_credits")}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel">
        <h3>{tt("league_history")}</h3>
        <ol className="classification">
          {state.grandPrixHistory.map((grandPrix) => (
            <li key={grandPrix.id}>
              <span>
                {tt("league_round")} {grandPrix.round}
              </span>
              <span>{statusLabel(grandPrix.status, tt)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel">
        <h3>{tt("settings_title")}</h3>
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
          <button type="button" onClick={onUpdateSettings} disabled={loading}>
            {tt("action_update_settings")}
          </button>
          <button type="button" onClick={onForgetPlayer} disabled={loading || !state.player}>
            {tt("action_forget_team")}
          </button>
          <button type="button" onClick={onRestartLeague} disabled={loading}>
            {tt("action_restart_league")}
          </button>
        </div>
      </section>
    </div>
  );
}
