import { useState } from "react";
import type { TranslationKey } from "../i18n/index.js";
import { createAdminActions } from "./adminActions.js";
import type { AdminLeague, AdminPagination, AdminUser, GameView, LeagueState } from "./types.js";
import type { AdminTab } from "../features/AdminConsoleView.js";

const EMPTY_ADMIN_PAGINATION: AdminPagination = { page: 1, limit: 100, total: 0, totalPages: 1, hasPrevious: false, hasNext: false };

export function useAdminPanel({
  profileIsAdmin,
  run,
  tt,
  setProfileOpen,
  setGameView,
  setLeagueState,
  showStatus
}: {
  profileIsAdmin: boolean;
  run: (nextMessage: string, action: () => Promise<void>, staleClaimTeamId?: string, notify?: boolean, errorText?: (error: unknown) => string) => Promise<void>;
  tt: (key: TranslationKey) => string;
  setProfileOpen: (open: boolean) => void;
  setGameView: (view: GameView) => void;
  setLeagueState: (state: LeagueState | null) => void;
  showStatus: (text: string, tone?: "info" | "error", notify?: boolean) => void;
}) {
  const [adminToken, setAdminToken] = useState("");
  const [adminTab, setAdminTab] = useState<AdminTab>("users");
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminLeagues, setAdminLeagues] = useState<AdminLeague[]>([]);
  const [adminUserQuery, setAdminUserQuery] = useState("");
  const [adminLeagueQuery, setAdminLeagueQuery] = useState("");
  const [adminUserPagination, setAdminUserPagination] = useState(EMPTY_ADMIN_PAGINATION);
  const [adminLeaguePagination, setAdminLeaguePagination] = useState(EMPTY_ADMIN_PAGINATION);
  const [adminRecoveryCode, setAdminRecoveryCode] = useState<{ email: string; code: string } | null>(null);
  const [adminDeleteUser, setAdminDeleteUser] = useState<AdminUser | null>(null);
  const [adminInspecting, setAdminInspecting] = useState(false);

  const actions = createAdminActions({
    profileIsAdmin,
    adminToken,
    adminDeleteUser,
    adminUserQuery,
    adminLeagueQuery,
    adminUserPagination,
    adminLeaguePagination,
    run,
    tt,
    setProfileOpen,
    setGameView,
    setAdminUsers,
    setAdminLeagues,
    setAdminUserQuery,
    setAdminLeagueQuery,
    setAdminUserPagination,
    setAdminLeaguePagination,
    setAdminRecoveryCode,
    setAdminDeleteUser,
    setLeagueState,
    setAdminInspecting,
    showStatus
  });

  return {
    adminToken,
    adminTab,
    adminUsers,
    adminLeagues,
    adminUserQuery,
    adminLeagueQuery,
    adminUserPagination,
    adminLeaguePagination,
    adminRecoveryCode,
    adminDeleteUser,
    adminInspecting,
    setAdminToken,
    setAdminTab,
    setAdminDeleteUser,
    setAdminInspecting,
    ...actions
  };
}
