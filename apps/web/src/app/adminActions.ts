import type { TranslationKey } from "../i18n/index.js";
import { ApiError, api } from "./appStorage.js";
import type { AdminLeague, AdminUser, GameView, LeagueState } from "./types.js";

export function createAdminActions({
  profileIsAdmin,
  adminToken,
  adminDeleteUser,
  run,
  tt,
  setProfileOpen,
  setGameView,
  setAdminUsers,
  setAdminLeagues,
  setAdminRecoveryCode,
  setAdminDeleteUser,
  setLeagueState,
  setAdminInspecting,
  showStatus
}: {
  profileIsAdmin: boolean;
  adminToken: string;
  adminDeleteUser: AdminUser | null;
  run: (nextMessage: string, action: () => Promise<void>, staleClaimTeamId?: string, notify?: boolean, errorText?: (error: unknown) => string) => Promise<void>;
  tt: (key: TranslationKey) => string;
  setProfileOpen: (open: boolean) => void;
  setGameView: (view: GameView) => void;
  setAdminUsers: (users: AdminUser[]) => void;
  setAdminLeagues: (leagues: AdminLeague[]) => void;
  setAdminRecoveryCode: (recovery: { email: string; code: string } | null) => void;
  setAdminDeleteUser: (user: AdminUser | null) => void;
  setLeagueState: (state: LeagueState | null) => void;
  setAdminInspecting: (inspecting: boolean) => void;
  showStatus: (text: string, tone?: "info" | "error", notify?: boolean) => void;
}) {
  const adminHeaders = () => ({ authorization: `Bearer ${adminToken.trim()}` });

  const adminApiErrorMessage = (error: unknown) => {
    if (error instanceof ApiError && error.statusCode === 503) return tt("admin_error_unconfigured");
    if (error instanceof ApiError && error.statusCode === 403) return tt("admin_error_forbidden");
    if (error instanceof TypeError) return tt("status_api_unavailable");
    return tt("status_request_failed");
  };

  const refreshAdminUsers = async () => {
    const response = await api<{ users: AdminUser[] }>("/admin/users", { method: "GET", headers: adminHeaders() });
    setAdminUsers(response.users);
  };

  const refreshAdminData = async () => {
    if (!adminToken.trim()) {
      showStatus(tt("admin_token_required"), "error", false);
      return;
    }

    await run(tt("status_admin_loading"), async () => {
      const [users, leagues] = await Promise.all([
        api<{ users: AdminUser[] }>("/admin/users", { method: "GET", headers: adminHeaders() }),
        api<{ leagues: AdminLeague[] }>("/admin/leagues", { method: "GET", headers: adminHeaders() })
      ]);
      setAdminUsers(users.users);
      setAdminLeagues(leagues.leagues);
      showStatus(tt("status_admin_loaded"), "info", false);
    }, undefined, false, adminApiErrorMessage);
  };

  const openAdminConsole = async () => {
    if (!profileIsAdmin) return;
    setProfileOpen(false);
    setGameView("admin");
    if (!adminToken.trim()) return;
    await refreshAdminData();
  };

  const resetAdminRecoveryCode = async (user: AdminUser) => {
    await run(tt("status_admin_resetting_recovery"), async () => {
      const response = await api<{ recoveryCode: string }>(`/admin/users/${user.id}/recovery-code`, {
        method: "POST",
        headers: adminHeaders()
      });
      setAdminRecoveryCode({ email: user.email, code: response.recoveryCode });
      await refreshAdminUsers();
      showStatus(tt("status_admin_recovery_reset"), "info", false);
    }, undefined, false, adminApiErrorMessage);
  };

  const deleteAdminUserConfirmed = async () => {
    if (!adminDeleteUser) return;
    const user = adminDeleteUser;
    setAdminDeleteUser(null);
    await run(tt("status_admin_deleting_user"), async () => {
      await api<{ ok: boolean }>(`/admin/users/${user.id}`, {
        method: "DELETE",
        headers: adminHeaders()
      });
      setAdminRecoveryCode(null);
      await refreshAdminUsers();
      showStatus(tt("status_admin_user_deleted"), "info", false);
    }, undefined, false, adminApiErrorMessage);
  };

  const inspectAdminLeague = async (league: AdminLeague) => {
    await run(tt("status_admin_inspecting_league"), async () => {
      const state = await api<LeagueState>(`/admin/leagues/${league.id}`, {
        method: "GET",
        headers: adminHeaders()
      });
      setLeagueState({ ...state, player: undefined });
      setAdminInspecting(true);
      setGameView("championship");
      showStatus(tt("status_admin_league_loaded"), "info", false);
    }, undefined, false, adminApiErrorMessage);
  };

  return { openAdminConsole, refreshAdminData, resetAdminRecoveryCode, deleteAdminUserConfirmed, inspectAdminLeague };
}
