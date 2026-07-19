import type { TranslationKey } from "../i18n/index.js";
import type { FormState } from "./types.js";

export type ProfileMode = "choice" | "create" | "recover";
export type SetupMode = "choice" | "create" | "join";

type SavedClaim = {
  teamId: string;
  leagueName: string;
  leagueCode: string;
  teamName: string;
};

export function ProfileSetupView({
  message,
  mode,
  profileForm,
  profileFormError,
  status,
  onCreateProfile,
  onRecoverProfile,
  onSetMode,
  onSetProfileForm,
  onSetProfileFormError,
  tt
}: {
  message: string;
  mode: ProfileMode;
  profileForm: { email: string; recoveryCode: string };
  profileFormError: string | null;
  status: "idle" | "loading" | "error";
  onCreateProfile: () => void;
  onRecoverProfile: () => void;
  onSetMode: (mode: ProfileMode) => void;
  onSetProfileForm: (form: { email: string; recoveryCode: string }) => void;
  onSetProfileFormError: (error: string | null) => void;
  tt: (key: TranslationKey) => string;
}) {
  return (
    <section className="setup-grid setup-grid-single setup-grid-split" aria-labelledby="profile-title">
      <div className="panel setup-main-panel setup-hero-panel profile-hero-panel">
        <span className="section-kicker">{tt("profile_kicker")}</span>
        <h1 id="profile-title">{mode === "create" ? tt("profile_create_title") : mode === "recover" ? tt("profile_recover_title") : tt("profile_title")}</h1>
        <p className={status === "error" ? "status error" : "status"}>{message === tt("status_initial") ? tt("profile_intro") : message}</p>
      </div>
      <div className="panel setup-main-panel setup-form-panel">
        {mode === "choice" ? (
          <div className="setup-choice-grid">
            <button
              type="button"
              className="setup-choice"
              onClick={() => {
                onSetProfileFormError(null);
                onSetMode("create");
              }}
            >
              <strong>{tt("action_create_profile")}</strong>
              <small>{tt("profile_create_hint")}</small>
            </button>
            <button
              type="button"
              className="setup-choice"
              onClick={() => {
                onSetProfileFormError(null);
                onSetMode("recover");
              }}
            >
              <strong>{tt("action_recover_profile")}</strong>
              <small>{tt("profile_recover_hint")}</small>
            </button>
          </div>
        ) : (
          <>
            <div className="field-grid setup-fields">
              <label>
                {tt("field_email")}
                <input
                  type="email"
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
            <div className="actions primary-actions profile-form-actions">
              <button type="button" onClick={mode === "create" ? onCreateProfile : onRecoverProfile} disabled={status === "loading"}>
                {mode === "create" ? tt("action_create_profile") : tt("action_recover_profile")}
              </button>
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
          </>
        )}
      </div>
    </section>
  );
}

export function LeagueSetupView({
  form,
  message,
  mode,
  savedClaims,
  savedLeagueIndex,
  status,
  onCreateLeague,
  onJoinLeague,
  onSetForm,
  onSetMode,
  onSetSavedLeagueIndex,
  onSwitchLeague,
  tt
}: {
  form: FormState;
  message: string;
  mode: SetupMode;
  savedClaims: SavedClaim[];
  savedLeagueIndex: number;
  status: "idle" | "loading" | "error";
  onCreateLeague: () => void;
  onJoinLeague: () => void;
  onSetForm: (form: FormState) => void;
  onSetMode: (mode: SetupMode) => void;
  onSetSavedLeagueIndex: (updater: (index: number) => number) => void;
  onSwitchLeague: (teamId: string) => void;
  tt: (key: TranslationKey) => string;
}) {
  return (
    <section className="setup-grid setup-grid-single setup-grid-split" aria-label={tt("flow_label")}>
      <div className="panel setup-main-panel setup-hero-panel league-hero-panel">
        <span className="section-kicker">{tt("race_desk_kicker")}</span>
        <h1>{mode === "create" ? tt("setup_create_title") : mode === "join" ? tt("setup_join_title") : tt("race_desk_title")}</h1>
        <p className={status === "error" ? "status error" : "status"}>{message}</p>
      </div>
      <div className="panel setup-main-panel setup-form-panel">
        {mode === "choice" ? (
          <div className="setup-choice-grid">
            <button type="button" className="setup-choice" onClick={() => onSetMode("create")}>
              <strong>{tt("action_create_league")}</strong>
              <small>{tt("setup_create_hint")}</small>
            </button>
            <button type="button" className="setup-choice" onClick={() => onSetMode("join")}>
              <strong>{tt("action_join_league")}</strong>
              <small>{tt("setup_join_hint")}</small>
            </button>
          </div>
        ) : (
          <>
            <div className="field-grid setup-fields">
              {mode === "create" ? (
                <label>
                  {tt("field_league")}
                  <input maxLength={40} value={form.leagueName} onChange={(event) => onSetForm({ ...form, leagueName: event.target.value })} />
                </label>
              ) : (
                <label>
                  {tt("field_join_code")}
                  <input value={form.joinCode} onChange={(event) => onSetForm({ ...form, joinCode: event.target.value.toUpperCase() })} maxLength={6} placeholder="PLAY01" />
                </label>
              )}
              <label>
                {tt("field_team")}
                <input maxLength={32} value={form.teamName} onChange={(event) => onSetForm({ ...form, teamName: event.target.value })} />
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
                    <input type="number" min="1" max="18" value={form.maxGrandPrixPerSeason} onChange={(event) => onSetForm({ ...form, maxGrandPrixPerSeason: event.target.value === "" ? "" : Number(event.target.value) })} />
                  </label>
                  <label className="checkbox-field">
                    <input type="checkbox" checked={form.fillWithBots} onChange={(event) => onSetForm({ ...form, fillWithBots: event.target.checked })} />
                    {tt("field_fill_with_bots")}
                  </label>
                </>
              ) : null}
            </div>
            <div className="actions primary-actions setup-form-actions">
              <button type="button" onClick={mode === "create" ? onCreateLeague : onJoinLeague} disabled={status === "loading"}>
                {mode === "create" ? tt("action_start_league") : tt("action_join_league")}
              </button>
              <button type="button" className="secondary-button" onClick={() => onSetMode("choice")} disabled={status === "loading"}>
                {tt("action_back")}
              </button>
            </div>
          </>
        )}

        {mode === "choice" ? (
          <div className="saved-leagues saved-leagues-compact">
            <span className="section-kicker">{tt("profile_saved_leagues")}</span>
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
