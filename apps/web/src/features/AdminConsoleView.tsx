import type { Locale, TranslationKey } from "../i18n/index.js";
import type { AdminLeague, AdminUser } from "../app/types.js";

export type AdminTab = "users" | "leagues";

export function AdminConsoleView({
  adminLeagues,
  adminRecoveryCode,
  adminTab,
  adminToken,
  adminUsers,
  locale,
  loading,
  onDeleteUser,
  onInspectLeague,
  onRefresh,
  onResetRecoveryCode,
  onSetAdminTab,
  onSetAdminToken,
  tt
}: {
  adminLeagues: AdminLeague[];
  adminRecoveryCode: { email: string; code: string } | null;
  adminTab: AdminTab;
  adminToken: string;
  adminUsers: AdminUser[];
  locale: Locale;
  loading: boolean;
  onDeleteUser: (user: AdminUser) => void;
  onInspectLeague: (league: AdminLeague) => void;
  onRefresh: () => void;
  onResetRecoveryCode: (user: AdminUser) => void;
  onSetAdminTab: (tab: AdminTab) => void;
  onSetAdminToken: (token: string) => void;
  tt: (key: TranslationKey, params?: Record<string, string | number>) => string;
}) {
  return (
    <section className="admin-console" aria-label={tt("admin_title")}>
      <div className="panel admin-console-header">
        <span className="section-kicker">{tt("admin_kicker")}</span>
        <h1>{tt("admin_title")}</h1>
        <p>{tt("admin_body")}</p>
        <form
          className="admin-token-form"
          onSubmit={(event) => {
            event.preventDefault();
            onRefresh();
          }}
        >
          <label>
            {tt("admin_token_label")}
            <input type="password" value={adminToken} onChange={(event) => onSetAdminToken(event.target.value)} autoComplete="off" />
          </label>
          <button type="submit" disabled={loading}>
            {tt("admin_action_connect")}
          </button>
        </form>
      </div>
      {adminRecoveryCode ? (
        <div className="panel admin-recovery-panel" role="status">
          <span className="section-kicker">{adminRecoveryCode.email}</span>
          <strong>{tt("admin_recovery_code_title")}</strong>
          <input className="profile-code-input" readOnly value={adminRecoveryCode.code} onClick={(event) => event.currentTarget.select()} />
        </div>
      ) : null}
      <div className="panel admin-data-panel">
        <div className="plan-steps plan-subscreen-tabs" role="tablist" aria-label={tt("admin_tabs_label")}>
          <button type="button" role="tab" aria-selected={adminTab === "users"} className={adminTab === "users" ? "plan-step active" : "plan-step"} onClick={() => onSetAdminTab("users")}>
            <span className="plan-step-label">{tt("admin_tab_users")}</span>
          </button>
          <button type="button" role="tab" aria-selected={adminTab === "leagues"} className={adminTab === "leagues" ? "plan-step active" : "plan-step"} onClick={() => onSetAdminTab("leagues")}>
            <span className="plan-step-label">{tt("admin_tab_leagues")}</span>
          </button>
        </div>
        {adminTab === "users" ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{tt("admin_user_email")}</th>
                  <th>{tt("admin_user_counts")}</th>
                  <th>{tt("admin_created_at")}</th>
                  <th>{tt("admin_actions")}</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.email}</strong>
                      <small>{user.id}</small>
                    </td>
                    <td>{tt("admin_user_counts_value", { teams: user.teamCount, leagues: user.leagueCount })}</td>
                    <td>{formatAdminDate(user.createdAt, locale)}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" onClick={() => onResetRecoveryCode(user)} disabled={loading}>
                          {tt("admin_action_reset_recovery")}
                        </button>
                        <button type="button" className="danger-button" onClick={() => onDeleteUser(user)} disabled={loading}>
                          {tt("admin_action_delete_user")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!adminUsers.length ? <p className="admin-empty">{tt("admin_users_empty")}</p> : null}
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{tt("admin_league_name")}</th>
                  <th>{tt("admin_league_status")}</th>
                  <th>{tt("admin_league_counts")}</th>
                  <th>{tt("admin_created_at")}</th>
                  <th>{tt("admin_actions")}</th>
                </tr>
              </thead>
              <tbody>
                {adminLeagues.map((league) => (
                  <tr key={league.id}>
                    <td>
                      <strong>{league.name}</strong>
                      <small>
                        {league.code} · {league.id}
                      </small>
                    </td>
                    <td>
                      {league.status} ·{" "}
                      {league.currentSeason && league.currentRound
                        ? tt("admin_league_round_value", { season: league.currentSeason, round: league.currentRound })
                        : tt("admin_league_no_round")}
                    </td>
                    <td>{tt("admin_league_counts_value", { players: league.playerCount, teams: league.teamCount })}</td>
                    <td>{formatAdminDate(league.createdAt, locale)}</td>
                    <td>
                      <button type="button" onClick={() => onInspectLeague(league)} disabled={loading}>
                        {tt("admin_action_inspect_league")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!adminLeagues.length ? <p className="admin-empty">{tt("admin_leagues_empty")}</p> : null}
          </div>
        )}
      </div>
    </section>
  );
}

function formatAdminDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
