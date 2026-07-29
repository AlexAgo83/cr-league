import { useState } from "react";
import { useT } from "../i18n/index.js";
import { ConfirmActionModal } from "./AppModals.js";
import { BoardIcon, type BoardIconName } from "../features/VisualIcon.js";
import { PendingFeedback } from "../features/PendingFeedback.js";
import { TeamCar } from "../features/TeamCar.js";
import type { FormState } from "./types.js";
import type { SoloSlotSummary } from "./soloStorage.js";
import type { StoredPlayerClaim } from "./appStorage.js";

function formatDate(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
}

/** An info line reads faster with the icon the rest of the game already uses for that idea. */
function SaveLine({ icon, children }: { icon: BoardIconName; children: string }) {
  return (
    <small className="save-line">
      <BoardIcon className="save-line-icon" name={icon} />
      {children}
    </small>
  );
}

export type ProfileMode = "choice" | "create" | "recover";
export type SetupMode = "choice" | "create" | "join";
export type SetupEntryMode = "choice" | "multiplayer" | "solo" | "campaign" | "arcade" | "wheel";

/**
 * Stand-in board icons until the generated ones land (item_356). Swapping each is one line here;
 * nothing else in the app names them.
 */
export const SOLO_MODE_ICONS = {
  campaign: "stand-drive",
  arcade: "launch-boost",
  destinyWheel: "key-moment"
} satisfies Record<string, BoardIconName>;

// A choice step is a poster moment, not a form: icon first, and the panel drops the paper
// surface so the ambient circuit shows through. The forms keep the light surface.
function SetupChoice({ icon, label, hint, onSelect }: { icon: BoardIconName; label: string; hint: string; onSelect: () => void }) {
  return (
    <button type="button" className="setup-choice" aria-label={label} onClick={onSelect}>
      <BoardIcon className="setup-choice-icon" name={icon} />
      <span className="setup-choice-copy">
        <strong>{label}</strong>
        <small>{hint}</small>
      </span>
    </button>
  );
}

// Only shown at the "choice" step of each setup view: the create/join/recover forms already
// carry their own textual Back button, and two back affordances on one screen read as a bug.
function SetupBackButton({ onBack }: { onBack: () => void }) {
  const tt = useT();
  return (
    <button className="modal-close-button setup-back-button" type="button" aria-label={tt("action_back")} onClick={onBack}>
      ×
    </button>
  );
}

export function SetupEntryView({
  message,
  status,
  onStartSolo,
  onStartMultiplayer
}: {
  message: string;
  status: "idle" | "loading" | "error";
  onStartSolo: () => void;
  onStartMultiplayer: () => void;
}) {
  const tt = useT();
  return (
    <section className="setup-grid setup-grid-single setup-grid-split" aria-labelledby="setup-entry-title">
      <div className="panel setup-main-panel setup-hero-panel setup-entry-hero-panel">
        <span className="section-kicker">{tt("setup_entry_kicker")}</span>
        <h1 id="setup-entry-title">{tt("setup_entry_title")}</h1>
        <p className={status === "error" ? "status error" : "status"}>{message === tt("status_initial") ? tt("setup_entry_intro") : message}</p>
      </div>
      <div className="panel setup-main-panel setup-form-panel setup-choice-panel">
        <div className="setup-choice-grid">
          <SetupChoice icon="stand-drive" label={tt("action_start_solo")} hint={tt("setup_solo_hint")} onSelect={onStartSolo} />
          <SetupChoice icon="championship" label={tt("action_start_multiplayer")} hint={tt("setup_multiplayer_hint")} onSelect={onStartMultiplayer} />
        </div>
      </div>
    </section>
  );
}

/** Solo's two sub-modes. Campaign is what Solo has always been; Arcade is the new door. */
export function SoloModeView({
  status,
  onBack,
  onStartCampaign,
  onStartArcade
}: {
  status: "idle" | "loading" | "error";
  onBack: () => void;
  onStartCampaign: () => void;
  onStartArcade: () => void;
}) {
  const tt = useT();
  return (
    <section className="setup-grid setup-grid-single setup-grid-split" aria-labelledby="solo-mode-title">
      <div className="panel setup-main-panel setup-hero-panel setup-entry-hero-panel">
        <SetupBackButton onBack={onBack} />
        <span className="section-kicker">{tt("solo_mode_kicker")}</span>
        <h1 id="solo-mode-title">{tt("solo_mode_title")}</h1>
        <p className={status === "error" ? "status error" : "status"}>{tt("solo_mode_intro")}</p>
      </div>
      <div className="panel setup-main-panel setup-form-panel setup-choice-panel">
        <div className="setup-choice-grid">
          <SetupChoice icon={SOLO_MODE_ICONS.campaign} label={tt("solo_mode_campaign")} hint={tt("solo_mode_campaign_hint")} onSelect={onStartCampaign} />
          <SetupChoice icon={SOLO_MODE_ICONS.arcade} label={tt("solo_mode_arcade")} hint={tt("solo_mode_arcade_hint")} onSelect={onStartArcade} />
        </div>
      </div>
    </section>
  );
}

/**
 * Lists the arcade games that exist. One today; another is one entry in this array, which is why
 * it is a list rather than a hand-placed pair of cards.
 */
export function ArcadeCatalogueView({
  status,
  onBack,
  onOpenWheel
}: {
  status: "idle" | "loading" | "error";
  onBack: () => void;
  onOpenWheel: () => void;
}) {
  const tt = useT();
  const games = [{ key: "wheel", icon: SOLO_MODE_ICONS.destinyWheel, label: tt("arcade_wheel_title"), hint: tt("arcade_wheel_hint"), onSelect: onOpenWheel }];
  return (
    <section className="setup-grid setup-grid-single setup-grid-split" aria-labelledby="arcade-title">
      <div className="panel setup-main-panel setup-hero-panel setup-entry-hero-panel">
        <SetupBackButton onBack={onBack} />
        <span className="section-kicker">{tt("arcade_kicker")}</span>
        <h1 id="arcade-title">{tt("arcade_title")}</h1>
        <p className={status === "error" ? "status error" : "status"}>{tt("arcade_intro")}</p>
      </div>
      <div className="panel setup-main-panel setup-form-panel setup-choice-panel">
        <div className="setup-choice-grid">
          {games.map((game) => (
            <SetupChoice key={game.key} icon={game.icon} label={game.label} hint={game.hint} onSelect={game.onSelect} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function SoloSlotsView({
  slots,
  status,
  onBack,
  onOpenSlot,
  onDeleteSlot
}: {
  slots: ReadonlyArray<SoloSlotSummary | null>;
  status: "idle" | "loading" | "error";
  onBack: () => void;
  onOpenSlot: (slot: number) => void;
  onDeleteSlot: (slot: number) => void;
}) {
  const tt = useT();
  const [pendingDelete, setPendingDelete] = useState<SoloSlotSummary | null>(null);
  // The run the player left off in is the one they most likely came back for, so it gets the
  // same pull as a saved league on the multiplayer screen. With a single save there is nothing
  // to tell apart, so the glow stays off.
  const filled = slots.filter((slot): slot is SoloSlotSummary => Boolean(slot));
  const lastPlayed = filled.length > 1 ? filled.reduce((best, slot) => (slot.updatedAt > best.updatedAt ? slot : best)) : null;
  return (
    <section className="setup-grid setup-grid-single setup-grid-split" aria-labelledby="solo-slots-title">
      <div className="panel setup-main-panel setup-hero-panel setup-entry-hero-panel">
        <SetupBackButton onBack={onBack} />
        <span className="section-kicker">{tt("solo_slots_kicker")}</span>
        <h1 id="solo-slots-title">{tt("solo_slots_title")}</h1>
        <p className={status === "error" ? "status error" : "status"}>{tt("solo_slots_intro")}</p>
      </div>
      <div className="panel setup-main-panel setup-form-panel setup-choice-panel">
        <ul className="solo-slot-list">
          {slots.map((slot, index) => (
            <li key={index} className={slot ? "solo-slot solo-slot-filled" : "solo-slot"}>
              <button
                type="button"
                className={slot && slot.slot === lastPlayed?.slot ? "setup-choice solo-slot-open solo-slot-recent" : "setup-choice solo-slot-open"}
                aria-label={slot ? `${tt("solo_slot_label", { slot: index + 1 })}: ${slot.teamName}` : `${tt("solo_slot_label", { slot: index + 1 })}: ${tt("solo_slot_empty")}`}
                disabled={status === "loading"}
                onClick={() => onOpenSlot(index)}
              >
                {slot?.livery ? (
                  <TeamCar className="solo-slot-car" livery={slot.livery} />
                ) : (
                  <BoardIcon className="setup-choice-icon" name={slot ? "stand-drive" : "empty-card-slot"} />
                )}
                <span className="setup-choice-copy">
                  <small className="solo-slot-index">{tt("solo_slot_label", { slot: index + 1 })}</small>
                  <strong>{slot ? slot.teamName : tt("solo_slot_empty")}</strong>
                  {slot ? (
                    <>
                      <SaveLine icon="circuits">{tt("save_progress", { season: slot.season, round: slot.round, rounds: slot.maxRounds })}</SaveLine>
                      <SaveLine icon="standings">{tt("save_meta", { races: slot.resolvedGrandPrix, points: slot.points })}</SaveLine>
                      <SaveLine icon="chrono">{tt("save_last_played", { date: formatDate(slot.updatedAt) })}</SaveLine>
                    </>
                  ) : (
                    <small>{tt("solo_slot_empty_hint")}</small>
                  )}
                </span>
              </button>
              {slot ? (
                <button
                  type="button"
                  className="secondary-button solo-slot-delete"
                  aria-label={`${tt("solo_slot_delete")} — ${tt("solo_slot_label", { slot: index + 1 })}: ${slot.teamName}`}
                  disabled={status === "loading"}
                  onClick={() => setPendingDelete(slot)}
                >
                  {tt("solo_slot_delete")}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
      {pendingDelete ? (
        <ConfirmActionModal
          label={tt("solo_slot_delete_title")}
          testId="dialog-delete-solo-slot"
          image="/assets/crl/danger-reset.webp"
          kicker={tt("solo_slots_kicker")}
          title={tt("solo_slot_delete_title")}
          body={`${pendingDelete.teamName} — ${tt("solo_slot_delete_confirm")}`}
          actionLabel={tt("solo_slot_delete")}
          status={status}
          danger
          onClose={() => setPendingDelete(null)}
          onConfirm={() => {
            onDeleteSlot(pendingDelete.slot);
            setPendingDelete(null);
          }}
        />
      ) : null}
    </section>
  );
}

export function ProfileSetupView({
  message,
  mode,
  pendingMessage,
  profileForm,
  profileFormError,
  status,
  onBack,
  onCreateProfile,
  onRecoverProfile,
  onRequestRecoveryCode,
  onSetMode,
  onSetProfileForm,
  onSetProfileFormError
}: {
  message: string;
  mode: ProfileMode;
  pendingMessage: string | null;
  profileForm: { email: string; recoveryCode: string };
  profileFormError: string | null;
  status: "idle" | "loading" | "error";
  onCreateProfile: () => void;
  onRecoverProfile: () => void;
  onRequestRecoveryCode: () => void;
  onBack: () => void;
  onSetMode: (mode: ProfileMode) => void;
  onSetProfileForm: (form: { email: string; recoveryCode: string }) => void;
  onSetProfileFormError: (error: string | null) => void;
}) {
  const tt = useT();
  return (
    <section className="setup-grid setup-grid-single setup-grid-split" aria-labelledby="profile-title">
      <div className="panel setup-main-panel setup-hero-panel profile-hero-panel">
        {mode === "choice" ? <SetupBackButton onBack={onBack} /> : null}
        <span className="section-kicker">{tt("profile_kicker")}</span>
        <h1 id="profile-title">{mode === "create" ? tt("profile_create_title") : mode === "recover" ? tt("profile_recover_title") : tt("profile_title")}</h1>
        <p className={status === "error" ? "status error" : "status"}>{message === tt("status_initial") ? tt("profile_intro") : message}</p>
      </div>
      <div className={`panel setup-main-panel setup-form-panel${mode === "choice" ? " setup-choice-panel" : ""}`}>
        {mode === "choice" ? (
          <div className="setup-choice-grid">
            <SetupChoice
              icon="team-profile"
              label={tt("action_create_profile")}
              hint={tt("profile_create_hint")}
              onSelect={() => {
                onSetProfileFormError(null);
                onSetMode("create");
              }}
            />
            <SetupChoice
              icon="reset-recovery"
              label={tt("action_recover_profile")}
              hint={tt("profile_recover_hint")}
              onSelect={() => {
                onSetProfileFormError(null);
                onSetMode("recover");
              }}
            />
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (status !== "loading") (mode === "create" ? onCreateProfile : onRecoverProfile)();
            }}
          >
            <div className="field-grid setup-fields">
              <label>
                {tt("field_email")}
                <input
                  type="email"
                  autoComplete="email"
                  value={profileForm.email}
                  aria-invalid={profileFormError ? true : undefined}
                  onChange={(event) => {
                    onSetProfileFormError(null);
                    onSetProfileForm({ ...profileForm, email: event.target.value });
                  }}
                />
              </label>
              {mode === "recover" ? (
                <label>
                  {tt("field_recovery_code")}
                  <input
                    value={profileForm.recoveryCode}
                    aria-invalid={profileFormError ? true : undefined}
                    onChange={(event) => {
                      onSetProfileFormError(null);
                      onSetProfileForm({ ...profileForm, recoveryCode: event.target.value.toUpperCase() });
                    }}
                  />
                </label>
              ) : null}
            </div>
            {profileFormError ? <p className="form-feedback error">{profileFormError}</p> : null}
            <PendingFeedback message={pendingMessage} />
            <div className="actions primary-actions profile-form-actions">
              <button type="submit" disabled={status === "loading"}>
                {mode === "create" ? tt("action_create_profile") : tt("action_recover_profile")}
              </button>
              {mode === "recover" ? (
                <button type="button" className="secondary-button" onClick={onRequestRecoveryCode} disabled={status === "loading"}>
                  {tt("action_request_recovery_code")}
                </button>
              ) : null}
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  onSetProfileFormError(null);
                  onSetMode("choice");
                }}
                disabled={status === "loading"}
              >
                {tt("action_back")}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export function LeagueSetupView({
  form,
  formError,
  message,
  mode,
  pendingMessage,
  savedClaims,
  savedLeagueIndex,
  status,
  onBack,
  onCreateLeague,
  onJoinLeague,
  onSetForm,
  onSetFormError,
  onSetMode,
  onSetSavedLeagueIndex,
  onSwitchLeague
}: {
  form: FormState;
  formError: string | null;
  message: string;
  mode: SetupMode;
  pendingMessage: string | null;
  savedClaims: StoredPlayerClaim[];
  savedLeagueIndex: number;
  status: "idle" | "loading" | "error";
  onBack: () => void;
  onCreateLeague: () => void;
  onJoinLeague: () => void;
  onSetForm: (form: FormState) => void;
  onSetFormError: (error: string | null) => void;
  onSetMode: (mode: SetupMode) => void;
  onSetSavedLeagueIndex: (updater: (index: number) => number) => void;
  onSwitchLeague: (teamId: string) => void;
}) {
  const tt = useT();
  return (
    <section className="setup-grid setup-grid-single setup-grid-split" aria-label={tt("flow_label")}>
      <div className="panel setup-main-panel setup-hero-panel league-hero-panel">
        {mode === "choice" ? <SetupBackButton onBack={onBack} /> : null}
        <span className="section-kicker">{tt("race_desk_kicker")}</span>
        <h1>{mode === "create" ? tt("setup_create_title") : mode === "join" ? tt("setup_join_title") : tt("race_desk_title")}</h1>
        <p className={status === "error" ? "status error" : "status"}>{message}</p>
      </div>
      <div className={`panel setup-main-panel setup-form-panel${mode === "choice" ? " setup-choice-panel" : ""}`}>
        {mode === "choice" ? (
          <div className="setup-choice-grid">
            <SetupChoice
              icon="create-league"
              label={tt("action_create_league")}
              hint={tt("setup_create_hint")}
              onSelect={() => {
                onSetFormError(null);
                onSetMode("create");
              }}
            />
            <SetupChoice
              icon="join-league"
              label={tt("action_join_league")}
              hint={tt("setup_join_hint")}
              onSelect={() => {
                onSetFormError(null);
                onSetMode("join");
              }}
            />
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (status !== "loading") (mode === "create" ? onCreateLeague : onJoinLeague)();
            }}
          >
            <div className="field-grid setup-fields">
              {mode === "create" ? (
                <label>
                  {tt("field_league")}
                  <input
                    maxLength={40}
                    value={form.leagueName}
                    onChange={(event) => {
                      onSetFormError(null);
                      onSetForm({ ...form, leagueName: event.target.value });
                    }}
                  />
                </label>
              ) : (
                <label>
                  {tt("field_join_code")}
                  <input
                    aria-invalid={formError ? true : undefined}
                    value={form.joinCode}
                    onChange={(event) => {
                      onSetFormError(null);
                      onSetForm({ ...form, joinCode: event.target.value.toUpperCase() });
                    }}
                    maxLength={6}
                    placeholder="PLAY01"
                  />
                </label>
              )}
              <label>
                {tt("field_team")}
                <input
                  aria-invalid={formError ? true : undefined}
                  maxLength={32}
                  value={form.teamName}
                  onChange={(event) => {
                    onSetFormError(null);
                    onSetForm({ ...form, teamName: event.target.value });
                  }}
                />
              </label>
              {mode === "create" ? (
                <>
                  <label>
                    {tt("field_max_players")}
                    <input type="number" min="2" max="16" value={form.maxPlayers} onChange={(event) => onSetForm({ ...form, maxPlayers: event.target.value === "" ? "" : Number(event.target.value) })} />
                  </label>
                  <label>
                    {tt("field_qualifying_attempts")}
                    <input type="number" min="1" max="5" value={form.qualifyingAttemptLimit} onChange={(event) => onSetForm({ ...form, qualifyingAttemptLimit: event.target.value === "" ? "" : Number(event.target.value) })} />
                  </label>
                  <label>
                    {tt("field_gp_per_season")}
                    <select value={form.maxGrandPrixPerSeason} onChange={(event) => onSetForm({ ...form, maxGrandPrixPerSeason: Number(event.target.value) })}>
                      <option value={6}>{tt("season_preset_standard")}</option>
                      <option value={3}>{tt("season_preset_quick")}</option>
                    </select>
                  </label>
                  <label className="checkbox-field">
                    <input type="checkbox" checked={form.fillWithBots} onChange={(event) => onSetForm({ ...form, fillWithBots: event.target.checked })} />
                    {tt("field_fill_with_bots")}
                  </label>
                  <label className="checkbox-field">
                    <input type="checkbox" checked={form.variableShop} onChange={(event) => onSetForm({ ...form, variableShop: event.target.checked })} />
                    {tt("field_variable_shop")}
                  </label>
                </>
              ) : null}
            </div>
            {formError ? <p className="form-feedback error">{formError}</p> : null}
            <PendingFeedback message={pendingMessage} />
            <div className="actions primary-actions setup-form-actions">
              <button type="submit" disabled={status === "loading"}>
                {mode === "create" ? tt("action_start_league") : tt("action_join_league")}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  onSetFormError(null);
                  onSetMode("choice");
                }}
                disabled={status === "loading"}
              >
                {tt("action_back")}
              </button>
            </div>
          </form>
        )}

        {mode === "choice" ? (
          <div className="saved-leagues saved-leagues-compact">
            <span className="section-kicker">{tt("profile_saved_leagues")}</span>
            <PendingFeedback message={pendingMessage} />
            {savedClaims.length ? (
              <div className="saved-league-carousel">
                <button type="button" className="saved-league-arrow" aria-label={tt("action_previous_saved_league")} disabled={status === "loading" || savedClaims.length < 2} onClick={() => onSetSavedLeagueIndex((index) => (index + savedClaims.length - 1) % savedClaims.length)}>
                  {"<"}
                </button>
                {(() => {
                  const claim = savedClaims[savedLeagueIndex] ?? savedClaims[0]!;
                  return (
                    <button type="button" className="profile-menu-action saved-league-card" onClick={() => onSwitchLeague(claim.teamId)} disabled={status === "loading"}>
                      <span className="saved-league-head">
                        {claim.livery ? <TeamCar className="saved-league-car" livery={claim.livery} /> : null}
                        <span>
                          <strong>{claim.leagueName}</strong>
                          <small>
                            {claim.teamName}
                            {claim.leagueCode ? ` · ${claim.leagueCode}` : ""}
                          </small>
                        </span>
                      </span>
                      {/* Claims stored before the card carried progress have none of this. */}
                      {claim.season && claim.round && claim.maxRounds ? (
                        <SaveLine icon="circuits">{tt("save_progress", { season: claim.season, round: claim.round, rounds: claim.maxRounds })}</SaveLine>
                      ) : null}
                      {claim.resolvedGrandPrix !== undefined && claim.points !== undefined ? (
                        <SaveLine icon="standings">{tt("save_meta", { races: claim.resolvedGrandPrix, points: claim.points })}</SaveLine>
                      ) : null}
                      {claim.updatedAt ? <SaveLine icon="chrono">{tt("save_last_played", { date: formatDate(claim.updatedAt) })}</SaveLine> : null}
                    </button>
                  );
                })()}
                <button type="button" className="saved-league-arrow" aria-label={tt("action_next_saved_league")} disabled={status === "loading" || savedClaims.length < 2} onClick={() => onSetSavedLeagueIndex((index) => (index + 1) % savedClaims.length)}>
                  {">"}
                </button>
              </div>
            ) : (
              <div className="saved-leagues-empty">
                <p>{tt("profile_saved_leagues_empty")}</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
