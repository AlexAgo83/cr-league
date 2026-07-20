import type { FormState } from "./types.js";
import type { Translator } from "./helpers.js";
import { completedSeasonSummaries } from "./helpers.js";
import { LiveryPlate } from "../features/LiveryPlate.js";
import { Modal } from "../features/Modal.js";
import { ModalHero } from "../features/ModalHero.js";
import { PendingFeedback } from "../features/PendingFeedback.js";
import { PositionBadge } from "../features/PositionBadge.js";
import { RewardValue } from "../features/RewardValue.js";

type SeasonRecap = ReturnType<typeof completedSeasonSummaries>[number];

export function SeasonRecapModal({
  recap,
  playerTeamId,
  tt,
  onClose
}: {
  recap: SeasonRecap;
  playerTeamId?: string;
  tt: Translator;
  onClose: () => void;
}) {
  return (
    <Modal label={tt("season_recap_title")} className="panel modal season-recap-modal" closeLabel={tt("action_close")} showCloseButton onClose={onClose}>
      <ModalHero image="/assets/crl/season-recap-modal.png" kicker={`${tt("league_season")} ${recap.season}`} title={tt("season_recap_title")} />
      <div className="season-champion-card">
        <span>{tt("season_champion")}</span>
        <strong>
          {recap.champion.livery ? <LiveryPlate className="standings-livery-plate leader-livery-plate" livery={recap.champion.livery} name={recap.champion.teamName} /> : null}
          {recap.champion.teamName}
        </strong>
        <small>
          <RewardValue type="points" value={recap.champion.points} tt={tt} /> · {recap.gpCount} {tt("season_gp_count")}
        </small>
      </div>
      <div className="season-recap-grid">
        <section>
          <h3>{tt("season_podium")}</h3>
          <ol className="season-podium-list">
            {recap.standings.slice(0, 3).map((entry) => (
              <li key={entry.teamId} className={entry.teamId === playerTeamId ? "current-team" : undefined}>
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
            {recap.standings.map((entry) => (
              <li key={entry.teamId} className={entry.teamId === playerTeamId ? "current-team" : undefined}>
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
  );
}

export function LeagueControlsModal({
  form,
  status,
  pendingMessage,
  hasPlayer,
  tt,
  setForm,
  onClose,
  onUpdateSettings,
  onForgetPlayer,
  onOpenRestartConfirm
}: {
  form: FormState;
  status: string;
  pendingMessage: string | null;
  hasPlayer: boolean;
  tt: Translator;
  setForm: (form: FormState) => void;
  onClose: () => void;
  onUpdateSettings: () => void;
  onForgetPlayer: () => void;
  onOpenRestartConfirm: () => void;
}) {
  return (
    <Modal label={tt("settings_title")} className="panel modal league-controls-modal" closeLabel={tt("action_close")} showCloseButton onClose={onClose}>
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
          <input type="datetime-local" value={form.preparationDeadlineAt} onChange={(event) => setForm({ ...form, preparationDeadlineAt: event.target.value })} />
        </label>
      </div>
      <div className="actions secondary-actions">
        <PendingFeedback message={pendingMessage} />
        <button type="button" onClick={onUpdateSettings} disabled={status === "loading"}>
          {tt("action_update_settings")}
        </button>
        <button type="button" onClick={onForgetPlayer} disabled={status === "loading" || !hasPlayer}>
          {tt("action_forget_team")}
        </button>
        <button type="button" onClick={onOpenRestartConfirm} disabled={status === "loading"}>
          {tt("action_restart_league")}
        </button>
      </div>
    </Modal>
  );
}

export function RestartConfirmModal({
  status,
  pendingMessage,
  tt,
  onClose,
  onRestart
}: {
  status: string;
  pendingMessage: string | null;
  tt: Translator;
  onClose: () => void;
  onRestart: () => void;
}) {
  return (
    <Modal label={tt("action_restart_league")} closeLabel={tt("action_close")} showCloseButton onClose={onClose}>
      <ModalHero image="/assets/crl/league-arrival.png" kicker={tt("championship_kicker")} title={tt("action_restart_league")} />
      <p>{tt("restart_confirm")}</p>
      <div className="actions secondary-actions">
        <PendingFeedback message={pendingMessage} />
        <button type="button" className="danger-button" onClick={onRestart} disabled={status === "loading"}>
          {tt("action_restart_league")}
        </button>
      </div>
    </Modal>
  );
}
