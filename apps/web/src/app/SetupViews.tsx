import { useT } from "../i18n/index.js";
import { BoardIcon, type BoardIconName } from "../features/VisualIcon.js";
import { PendingFeedback } from "../features/PendingFeedback.js";
import type { FormState } from "./types.js";

export type ProfileMode = "choice" | "create" | "recover";
export type SetupMode = "choice" | "create" | "join";
export type SetupEntryMode = "choice" | "multiplayer";

type SavedClaim = {
  teamId: string;
  leagueName: string;
  leagueCode: string;
  teamName: string;
};

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
  savedClaims: SavedClaim[];
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
                      <strong>{claim.leagueName}</strong>
                      <small>
                        {claim.teamName}
                        {claim.leagueCode ? ` · ${claim.leagueCode}` : ""}
                      </small>
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
