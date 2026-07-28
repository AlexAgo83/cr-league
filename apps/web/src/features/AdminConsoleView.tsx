import type { Locale } from "../i18n/index.js";
import { useT } from "../i18n/index.js";
import type { AdminLeague, AdminPagination, AdminUser } from "../app/types.js";
import { PendingFeedback } from "./PendingFeedback.js";
import { BoardIcon } from "./VisualIcon.js";

export type AdminTab = "users" | "leagues";

export function AdminConsoleView({
  adminLeagues,
  adminRecoveryCode,
  adminTab,
  adminToken,
  adminUsers,
  adminUserPagination,
  adminUserQuery,
  adminLeaguePagination,
  adminLeagueQuery,
  locale,
  loading,
  pendingMessage,
  onDeleteUser,
  onInspectLeague,
  onPageLeagues,
  onPageUsers,
  onRefresh,
  onResetRecoveryCode,
  onSearchLeagues,
  onSearchUsers,
  onSetAdminLeagueQuery,
  onSetAdminTab,
  onSetAdminToken,
  onSetAdminUserQuery,
  onCleanupLeague,
  onCleanupUser
}: {
  adminLeagues: AdminLeague[];
  adminRecoveryCode: { email: string; code: string } | null;
  adminTab: AdminTab;
  adminToken: string;
  adminUsers: AdminUser[];
  adminUserPagination: AdminPagination;
  adminUserQuery: string;
  adminLeaguePagination: AdminPagination;
  adminLeagueQuery: string;
  locale: Locale;
  loading: boolean;
  pendingMessage: string | null;
  onCleanupLeague: (league: AdminLeague) => void;
  onCleanupUser: (user: AdminUser) => void;
  onDeleteUser: (user: AdminUser) => void;
  onInspectLeague: (league: AdminLeague) => void;
  onPageLeagues: (page: number) => void;
  onPageUsers: (page: number) => void;
  onRefresh: () => void;
  onResetRecoveryCode: (user: AdminUser) => void;
  onSearchLeagues: () => void;
  onSearchUsers: () => void;
  onSetAdminLeagueQuery: (query: string) => void;
  onSetAdminTab: (tab: AdminTab) => void;
  onSetAdminToken: (token: string) => void;
  onSetAdminUserQuery: (query: string) => void;
}) {
  const tt = useT();
  return (
    <section className="admin-console" aria-label={tt("admin_title")}>
      <div className="panel admin-console-header">
        <div className="admin-console-title">
          <BoardIcon className="admin-console-title-icon" name="security-warning" />
          <div>
            <span className="section-kicker">{tt("admin_kicker")}</span>
            <h1>{tt("admin_title")}</h1>
            <p>{tt("admin_body")}</p>
          </div>
        </div>
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
            <BoardIcon className="command-board-icon" name="connect-admin" />
            {tt("admin_action_connect")}
          </button>
        </form>
        <PendingFeedback message={pendingMessage} />
      </div>
      {adminRecoveryCode ? (
        <div className="panel admin-recovery-panel" role="status">
          <span className="section-kicker">{adminRecoveryCode.email}</span>
          <strong>{tt("admin_recovery_code_title")}</strong>
          <input className="profile-code-input" readOnly value={adminRecoveryCode.code} onClick={(event) => event.currentTarget.select()} />
        </div>
      ) : null}
      <div className="panel admin-data-panel">
        <PendingFeedback message={pendingMessage} />
        <div className="plan-steps plan-subscreen-tabs" role="tablist" aria-label={tt("admin_tabs_label")}>
          <button type="button" role="tab" aria-selected={adminTab === "users"} className={adminTab === "users" ? "plan-step active" : "plan-step"} onClick={() => onSetAdminTab("users")}>
            <BoardIcon className="section-switch-icon" name="users-admin" />
            <span className="plan-step-label">{tt("admin_tab_users")}</span>
          </button>
          <button type="button" role="tab" aria-selected={adminTab === "leagues"} className={adminTab === "leagues" ? "plan-step active" : "plan-step"} onClick={() => onSetAdminTab("leagues")}>
            <BoardIcon className="section-switch-icon" name="leagues-admin" />
            <span className="plan-step-label">{tt("admin_tab_leagues")}</span>
          </button>
        </div>
        {adminTab === "users" ? (
          <div className="admin-table-wrap">
            <AdminListControls
              label={tt("admin_filter_users_label")}
              loading={loading}
              onPage={onPageUsers}
              onSearch={onSearchUsers}
              onSetQuery={onSetAdminUserQuery}
              pagination={adminUserPagination}
              query={adminUserQuery}
            />
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
                          <BoardIcon className="admin-action-icon" name="reset-recovery" />
                          {tt("admin_action_reset_recovery")}
                        </button>
                        <button type="button" className="danger-button" onClick={() => onCleanupUser(user)} disabled={loading}>
                          <BoardIcon className="admin-action-icon" name="cleanup-test-data" />
                          {tt("admin_action_cleanup_test_data")}
                        </button>
                        <button type="button" className="danger-button" onClick={() => onDeleteUser(user)} disabled={loading}>
                          <BoardIcon className="admin-action-icon" name="delete-user" />
                          {tt("admin_action_delete_user")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!adminUsers.length ? <p className="admin-empty empty-state-line"><BoardIcon className="empty-state-inline-icon" name="users-admin" />{tt("admin_users_empty")}</p> : null}
          </div>
        ) : (
          <div className="admin-table-wrap">
            <AdminListControls
              label={tt("admin_filter_leagues_label")}
              loading={loading}
              onPage={onPageLeagues}
              onSearch={onSearchLeagues}
              onSetQuery={onSetAdminLeagueQuery}
              pagination={adminLeaguePagination}
              query={adminLeagueQuery}
            />
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
                      <div className="admin-row-actions">
                        <button type="button" onClick={() => onInspectLeague(league)} disabled={loading}>
                          <BoardIcon className="admin-action-icon" name="inspect-league" />
                          {tt("admin_action_inspect_league")}
                        </button>
                        <button type="button" className="danger-button" onClick={() => onCleanupLeague(league)} disabled={loading}>
                          <BoardIcon className="admin-action-icon" name="cleanup-test-data" />
                          {tt("admin_action_cleanup_test_data")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!adminLeagues.length ? <p className="admin-empty empty-state-line"><BoardIcon className="empty-state-inline-icon" name="leagues-admin" />{tt("admin_leagues_empty")}</p> : null}
          </div>
        )}
      </div>
    </section>
  );
}

function AdminListControls({
  label,
  loading,
  onPage,
  onSearch,
  onSetQuery,
  pagination,
  query
}: {
  label: string;
  loading: boolean;
  onPage: (page: number) => void;
  onSearch: () => void;
  onSetQuery: (query: string) => void;
  pagination: AdminPagination;
  query: string;
}) {
  const tt = useT();
  return (
    <div className="admin-list-controls">
      <form
        className="admin-filter-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
      >
        <label>
          {label}
          <input value={query} onChange={(event) => onSetQuery(event.target.value)} placeholder={tt("admin_filter_placeholder")} />
        </label>
        <button type="submit" disabled={loading}>
          {tt("admin_action_filter")}
        </button>
      </form>
      <div className="admin-pagination" aria-label={tt("admin_pagination_label")}>
        <span>{tt("admin_pagination_status", { page: pagination.page, totalPages: pagination.totalPages, total: pagination.total })}</span>
        <button type="button" onClick={() => onPage(pagination.page - 1)} disabled={loading || !pagination.hasPrevious}>
          {tt("admin_action_previous_page")}
        </button>
        <button type="button" onClick={() => onPage(pagination.page + 1)} disabled={loading || !pagination.hasNext}>
          {tt("admin_action_next_page")}
        </button>
      </div>
    </div>
  );
}

function formatAdminDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
