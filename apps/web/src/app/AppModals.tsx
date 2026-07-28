import type { AdminUser, FormState, ProfileSession } from "./types.js";
import { useT } from "../i18n/index.js";
import type { ReactNode } from "react";
import { useState } from "react";
import { completedSeasonSummaries } from "./helpers.js";
import type { CityCircuit } from "./circuits.js";
import type { LeagueState } from "./types.js";
import type { TranslationKey } from "../i18n/index.js";
import { LiveryPlate } from "../features/LiveryPlate.js";
import { Modal } from "../features/Modal.js";
import { ModalHero } from "../features/ModalHero.js";
import { PendingFeedback } from "../features/PendingFeedback.js";
import { PositionBadge } from "../features/PositionBadge.js";
import { RewardValue } from "../features/RewardValue.js";
import { BoardIcon, CountryBadge, type BoardIconName } from "../features/VisualIcon.js";

export function ProfileCodeModal({
  profileSession,
  onClose,
  onCopy
}: {
  profileSession: ProfileSession | null;
  onClose: () => void;
  onCopy: () => void;
}) {
  const tt = useT();
  return (
    <Modal label={tt("profile_code_title")} testId="dialog-profile-code" closeLabel={tt("action_close")} showCloseButton onClose={onClose}>
      <ModalHero image="/assets/crl/profile-arrival.webp" kicker={tt("profile_kicker")} title={tt("profile_code_title")} />
      {profileSession?.recoveryCode ? (
        <input
          className="profile-code-input"
          aria-label={tt("action_copy_profile_code")}
          readOnly
          value={profileSession.recoveryCode}
          onClick={(event) => {
            event.currentTarget.select();
            onCopy();
          }}
        />
      ) : (
        <p>{tt("status_profile_code_missing")}</p>
      )}
    </Modal>
  );
}

export function ConfirmActionModal({
  label,
  testId,
  image,
  kicker,
  title,
  body,
  actionLabel,
  secondaryActionLabel,
  extraActionLabel,
  status,
  pendingMessage,
  danger = false,
  onClose,
  onSecondaryAction,
  onExtraAction,
  onConfirm
}: {
  label: string;
  testId?: string;
  image: string;
  kicker: string;
  title: string;
  body: ReactNode;
  actionLabel: string;
  secondaryActionLabel?: string;
  extraActionLabel?: string;
  status: string;
  pendingMessage?: string | null;
  danger?: boolean;
  onClose: () => void;
  onSecondaryAction?: () => void;
  onExtraAction?: () => void;
  onConfirm: () => void;
}) {
  const tt = useT();
  return (
    <Modal label={label} testId={testId} closeLabel={tt("action_close")} showCloseButton onClose={onClose}>
      <ModalHero image={image} kicker={kicker} title={title} />
      {typeof body === "string" ? <p>{body}</p> : <div className="modal-body">{body}</div>}
      <div className="actions secondary-actions">
        {pendingMessage !== undefined ? <PendingFeedback message={pendingMessage} /> : null}
        {secondaryActionLabel && onSecondaryAction ? (
          <button type="button" className="secondary-button modal-secondary-command" onClick={onSecondaryAction} disabled={status === "loading"}>
            <ModalActionIcon label={secondaryActionLabel} />
            {secondaryActionLabel}
          </button>
        ) : null}
        {extraActionLabel && onExtraAction ? (
          <button type="button" className="secondary-button modal-secondary-command" onClick={onExtraAction} disabled={status === "loading"}>
            <ModalActionIcon label={extraActionLabel} />
            {extraActionLabel}
          </button>
        ) : null}
        <button type="button" data-testid="modal-confirm" className={danger ? "danger-button modal-action-command" : "modal-action-command"} onClick={onConfirm} disabled={status === "loading"}>
          <ModalActionIcon danger={danger} label={actionLabel} />
          {actionLabel}
        </button>
      </div>
    </Modal>
  );
}

export function NextGrandPrixConfirmModal({
  isSeasonFinalGrandPrix,
  nextGrandPrixActionLabel,
  status,
  pendingMessage,
  hasResult,
  onClose,
  onStartNextGrandPrix,
  onOpenReport
}: {
  isSeasonFinalGrandPrix: boolean;
  nextGrandPrixActionLabel: string;
  status: string;
  pendingMessage: string | null;
  hasResult: boolean;
  onClose: () => void;
  onStartNextGrandPrix: () => void;
  onOpenReport: () => void;
}) {
  const tt = useT();
  return (
    <Modal label={tt(isSeasonFinalGrandPrix ? "finish_season_confirm_title" : "next_gp_confirm_title")} testId="dialog-next-gp" closeLabel={tt("action_close")} showCloseButton onClose={onClose}>
      <ModalHero image="/assets/crl/next-gp-modal.webp" kicker={nextGrandPrixActionLabel} title={tt(isSeasonFinalGrandPrix ? "finish_season_confirm_title" : "next_gp_confirm_title")} />
      <p>{tt(isSeasonFinalGrandPrix ? "finish_season_confirm_body" : "next_gp_confirm_body")}</p>
      <div className="actions secondary-actions">
        <PendingFeedback message={pendingMessage} />
        <button type="button" className="modal-action-command" onClick={onOpenReport} disabled={!hasResult}>
          <BoardIcon className="modal-action-icon" name="race-report" />
          {tt("result_tab_report")}
        </button>
        <button type="button" data-testid="modal-confirm" className="modal-action-command" onClick={onStartNextGrandPrix} disabled={status === "loading"}>
          <BoardIcon className="modal-action-icon" name={isSeasonFinalGrandPrix ? "championship" : "next-gp"} />
          {nextGrandPrixActionLabel}
        </button>
      </div>
    </Modal>
  );
}

type StartingGridEntry = {
  position: number;
  team: Pick<LeagueState["teams"][number], "id" | "name" | "livery">;
  bestTime: number | undefined;
};

export function ResolveGrandPrixConfirmModal({
  currentCircuit,
  forecastPick,
  playerTeamId,
  defaultPlanTeamNames,
  startingGridEntries,
  status,
  pendingMessage,
  startingGridExpanded,
  onClose,
  onShowFullGrid,
  onResolve
}: {
  currentCircuit: CityCircuit;
  forecastPick: string;
  playerTeamId: string | undefined;
  defaultPlanTeamNames: string[];
  startingGridEntries: StartingGridEntry[];
  status: string;
  pendingMessage: string | null;
  startingGridExpanded: boolean;
  onClose: () => void;
  onShowFullGrid: () => void;
  onResolve: () => void;
}) {
  const tt = useT();
  const displayedEntries = startingGridExpanded ? startingGridEntries : startingGridEntries.slice(0, 4);
  const hiddenCount = startingGridEntries.length - displayedEntries.length;

  return (
    <Modal label={tt("launch_gp_confirm_title")} testId="dialog-launch-gp" className="panel modal launch-gp-modal" closeLabel={tt("action_close")} showCloseButton onClose={onClose}>
      <ModalHero image="/assets/crl/launch-gp-modal.webp" kicker={tt("action_launch_grand_prix")} title={tt("launch_gp_confirm_title")} />
      <div className="launch-gp-content">
        <p>{tt("launch_gp_confirm_body")}</p>
        {defaultPlanTeamNames.length ? (
          <p className="race-direction-defaults">{tt("launch_gp_confirm_defaults", { teams: defaultPlanTeamNames.join(", ") })}</p>
        ) : null}
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
            {displayedEntries.map((entry) => (
              <li key={entry.team.id} className={entry.team.id === playerTeamId ? "current-team" : undefined}>
                <PositionBadge position={entry.position} />
                <LiveryPlate className="standings-livery-plate" livery={entry.team.livery} name={entry.team.name} />
                <strong>{entry.team.name}</strong>
                <small>{entry.bestTime === undefined ? tt("starting_grid_no_time") : `${entry.bestTime.toFixed(2)}s`}</small>
              </li>
            ))}
          </ol>
          {hiddenCount > 0 ? (
            <button type="button" className="secondary-button starting-grid-more-button" onClick={onShowFullGrid}>
              {tt("action_show_full_grid")} ({hiddenCount})
            </button>
          ) : null}
        </div>
      </div>
      <div className="actions secondary-actions">
        <PendingFeedback message={pendingMessage} />
        <button type="button" data-testid="modal-confirm" className="modal-action-command" onClick={onResolve} disabled={status === "loading"}>
          <BoardIcon className="modal-action-icon" name="launch-gp" />
          {tt("action_launch_grand_prix")}
        </button>
      </div>
    </Modal>
  );
}

function ModalActionIcon({ danger = false, label }: { danger?: boolean; label: string }) {
  const tt = useT();
  const icon: BoardIconName = label === tt("directive_confirm_action")
    ? "send-plan"
    : label === tt("action_qualifying")
      ? "new-chrono"
      : label === tt("action_modify_plan")
        ? "edit-plan"
        : label === tt("plan_subscreen_chrono")
          ? "review-chrono"
          : label === tt("action_launch_grand_prix")
            ? "launch-gp"
            : label === tt("action_next_grand_prix")
              ? "next-gp"
              : label === tt("action_start_next_season")
                ? "championship"
                : label === tt("action_review_race")
                  ? "review-race"
                  : label === tt("result_tab_report")
                    ? "race-report"
                    : label === tt("action_copy_error")
                      ? "copy-error"
                      : danger
                        ? "delete-danger"
                        : "send-plan";
  return <BoardIcon className="modal-action-icon" name={icon} />;
}

export function AdminDeleteUserModal({
  user,
  onClose,
  onDelete
}: {
  user: AdminUser;
  onClose: () => void;
  onDelete: (confirmation: string) => void;
}) {
  const tt = useT();
  const [confirmation, setConfirmation] = useState("");
  return (
    <Modal label={tt("admin_delete_user_title")} closeLabel={tt("action_close")} showCloseButton onClose={onClose}>
      <ModalHero image="/assets/crl/league-arrival.webp" kicker={tt("admin_kicker")} title={tt("admin_delete_user_title")} />
      <p>{tt("admin_delete_user_confirm", { email: user.email })}</p>
      <label className="field">
        <span>{tt("admin_delete_user_confirmation_label")}</span>
        <input value={confirmation} onChange={(event) => setConfirmation(event.currentTarget.value)} />
      </label>
      <div className="actions secondary-actions">
        <button type="button" className="danger-button" onClick={() => onDelete(confirmation)} disabled={confirmation !== user.email}>
          {tt("admin_action_delete_user")}
        </button>
      </div>
    </Modal>
  );
}

type SeasonRecap = ReturnType<typeof completedSeasonSummaries>[number];

export function SeasonRecapModal({
  recap,
  playerTeamId,
  onClose
}: {
  recap: SeasonRecap;
  playerTeamId?: string;
  onClose: () => void;
}) {
  const tt = useT();
  const leaderPoints = recap.standings[0]?.points ?? recap.champion.points;
  return (
    <Modal label={tt("season_recap_title")} className="panel modal season-recap-modal" closeLabel={tt("action_close")} showCloseButton onClose={onClose}>
      <ModalHero image="/assets/crl/season-recap-modal.webp" kicker={`${tt("league_season")} ${recap.season}`} title={`${recap.champion.teamName} ${tt("season_champion")}`} />
      <div className="season-champion-card">
        {recap.champion.livery ? <LiveryPlate className="standings-livery-plate season-champion-livery" livery={recap.champion.livery} name={recap.champion.teamName} wins={1} /> : null}
        <div>
          <span>{tt("season_champion")}</span>
          <strong>{recap.champion.teamName}</strong>
          <small>
            <RewardValue type="points" value={recap.champion.points} /> · {recap.gpCount} {tt("season_gp_count")}
          </small>
        </div>
      </div>
      <div className="season-recap-grid">
        <section>
          <h3>{tt("season_podium")}</h3>
          <ol className="season-podium-list">
            {recap.standings.slice(0, 3).map((entry) => (
              <li key={entry.teamId} className={entry.teamId === playerTeamId ? "current-team" : undefined}>
                <PositionBadge position={entry.position} />
                {entry.livery ? <LiveryPlate className="standings-livery-plate" livery={entry.livery} name={entry.teamName} wins={entry.teamId === recap.champion.teamId ? 1 : 0} /> : null}
                <span>
                  {entry.teamName}
                  <small><RewardValue type="points" value={entry.points} /></small>
                </span>
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
                  <RewardValue type="points" value={entry.points} />
                  <em>{entry.position === 1 ? "-" : `+${leaderPoints - entry.points}`}</em>
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
  leagueState,
  status,
  pendingMessage,
  hasPlayer,
  setForm,
  onClose,
  onUpdateSettings,
  onSendPlanReminders,
  onForgetPlayer,
  onOpenRestartConfirm
}: {
  form: FormState;
  leagueState: LeagueState;
  status: string;
  pendingMessage: string | null;
  hasPlayer: boolean;
  setForm: (form: FormState) => void;
  onClose: () => void;
  onUpdateSettings: () => void;
  onSendPlanReminders: () => void;
  onForgetPlayer: () => void;
  onOpenRestartConfirm: () => void;
}) {
  const tt = useT();
  const submitted = new Set(leagueState.actionState.submittedTeamIds);
  const humanTeams = leagueState.teams.filter((team) => team.kind === "human");
  const pendingTeams = humanTeams.filter((team) => !submitted.has(team.id));
  const readyTeams = humanTeams.filter((team) => submitted.has(team.id));
  const reminderLocked = leagueState.league.reminderSeasonNumber === leagueState.currentGrandPrix.season && Boolean(leagueState.league.reminderSentAt);
  const inviteLink = leagueState.league.code ? `${globalThis.location?.origin ?? ""}/?code=${leagueState.league.code}` : "";
  return (
    <Modal label={tt("settings_title")} testId="dialog-race-direction" className="panel modal league-controls-modal" closeLabel={tt("action_close")} showCloseButton onClose={onClose}>
      <ModalHero image="/assets/crl/league-arrival.webp" kicker={tt("championship_kicker")} title={tt("settings_title")} />
      <div className="race-direction-grid">
        <section className="race-direction-panel">
          <span className="section-kicker">{tt("race_direction_current_gp")}</span>
          <strong>{tt("league_season")} {leagueState.currentGrandPrix.season} · {tt("league_round")} {leagueState.currentGrandPrix.round}/{leagueState.league.maxGrandPrixPerSeason}</strong>
          <small>{tt(`next_action_${leagueState.actionState.nextAction}` as TranslationKey)}</small>
        </section>
        <section className="race-direction-panel">
          <span className="section-kicker">{tt("race_direction_share")}</span>
          <strong>{leagueState.league.code ?? tt("race_direction_no_invite")}</strong>
          <button type="button" className="secondary-button" onClick={() => void navigator.clipboard?.writeText(inviteLink || leagueState.league.code || "")} disabled={!leagueState.league.code}>
            {tt("action_copy_invite")}
          </button>
        </section>
      </div>
      <div className="race-direction-lanes">
        <section>
          <h3>{tt("race_direction_pending")} ({pendingTeams.length})</h3>
          <ul>
            {pendingTeams.length ? pendingTeams.map((team) => <li key={team.id}>{team.name}</li>) : <li>{tt("race_direction_none")}</li>}
          </ul>
        </section>
        <section>
          <h3>{tt("race_direction_ready")} ({readyTeams.length})</h3>
          <ul>
            {readyTeams.length ? readyTeams.map((team) => <li key={team.id}>{team.name}</li>) : <li>{tt("race_direction_none")}</li>}
          </ul>
        </section>
      </div>
      {pendingTeams.length ? <p className="race-direction-defaults">{tt("race_direction_defaults")}</p> : null}
      <div className="field-grid settings-fields">
        <label>
          {tt("field_league")}
          <input value={form.leagueName} maxLength={40} onChange={(event) => setForm({ ...form, leagueName: event.target.value })} />
        </label>
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
      {leagueState.league.reminderSentAt ? (
        <p className="race-direction-reminder-result">{tt("plan_reminder_last_result", { sentCount: leagueState.league.reminderSentCount, skippedCount: leagueState.league.reminderSkippedCount })}</p>
      ) : null}
      <div className="actions secondary-actions">
        <PendingFeedback message={pendingMessage} />
        <button type="button" onClick={onUpdateSettings} disabled={status === "loading"}>
          {tt("action_update_settings")}
        </button>
        <button type="button" onClick={onSendPlanReminders} disabled={status === "loading" || !pendingTeams.length || reminderLocked}>
          {reminderLocked ? tt("plan_reminder_already_sent") : tt("action_send_plan_reminders")}
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
  onClose,
  onRestart
}: {
  status: string;
  pendingMessage: string | null;
  onClose: () => void;
  onRestart: () => void;
}) {
  const tt = useT();
  return (
    <Modal label={tt("action_restart_league")} closeLabel={tt("action_close")} showCloseButton onClose={onClose}>
      <ModalHero image="/assets/crl/league-arrival.webp" kicker={tt("championship_kicker")} title={tt("action_restart_league")} />
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
