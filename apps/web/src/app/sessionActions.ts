import type { TranslationKey } from "../i18n/index.js";
import { PROFILE_SESSION_KEY, api, copyText, storePlayerClaims, storeProfileSession } from "./appStorage.js";
import type { GameView, LeagueState, ProfileSession } from "./types.js";

type NotificationTone = "info" | "error";
type SavedClaim = ProfileSession["teams"][number];

export function createSessionActions({
  profileSession,
  leagueState,
  savedClaims,
  technicalError,
  initialStatusText,
  run,
  tt,
  setProfileSession,
  setLeagueState,
  setAdminInspecting,
  setGameView,
  setSetupMode,
  setProfileOpen,
  setProfileMode,
  setProfileCodeOpen,
  setProfileLogoutOpen,
  setResultOpen,
  setSavedClaims,
  closeHistoryReplay,
  rememberPlayer,
  forgetClaim,
  showStatus,
  pushCommandHint
}: {
  profileSession: ProfileSession | null;
  leagueState: LeagueState | null;
  savedClaims: SavedClaim[];
  technicalError: string | null;
  initialStatusText: string;
  run: (nextMessage: string, action: () => Promise<void>, staleClaimTeamId?: string, notify?: boolean, errorText?: (error: unknown) => string, closeReplays?: boolean) => Promise<void>;
  tt: (key: TranslationKey) => string;
  setProfileSession: (session: ProfileSession | null) => void;
  setLeagueState: (state: LeagueState | null) => void;
  setAdminInspecting: (inspecting: boolean) => void;
  setGameView: (view: GameView) => void;
  setSetupMode: (mode: "choice") => void;
  setProfileOpen: (open: boolean) => void;
  setProfileMode: (mode: "choice") => void;
  setProfileCodeOpen: (open: boolean) => void;
  setProfileLogoutOpen: (open: boolean) => void;
  setResultOpen: (open: boolean) => void;
  setSavedClaims: (claims: SavedClaim[]) => void;
  closeHistoryReplay: () => void;
  rememberPlayer: (state: LeagueState) => void;
  forgetClaim: (teamId?: string) => void;
  showStatus: (text: string, tone?: NotificationTone, notify?: boolean) => void;
  pushCommandHint: (nextDeskState: "prepare" | "ready" | "resolved") => void;
}) {
  async function rejoinClaim(claim: SavedClaim, options: { setDrive: boolean; notify: boolean; preserveLocalState?: boolean }) {
    await run(
      tt("status_rejoining_league"),
      async () => {
        const state = await api<LeagueState>("/leagues/rejoin", {
          method: "POST",
          body: JSON.stringify({ teamId: claim.teamId, claimCode: claim.claimCode })
        });
        rememberPlayer(state);
        setAdminInspecting(false);
        setLeagueState(state);
        if (options.setDrive) setGameView("drive");
        if (options.setDrive) setProfileOpen(false);
        showStatus(tt("status_league_rejoined"), "info", options.notify);
        if (options.setDrive) pushCommandHint("prepare");
      },
      claim.teamId,
      options.notify,
      undefined,
      !options.preserveLocalState
    );
  }

  async function switchLeague(teamId: string) {
    const claim = savedClaims.find((candidate) => candidate.teamId === teamId);
    if (!claim || claim.teamId === leagueState?.player?.teamId) return;
    await rejoinClaim(claim, { setDrive: true, notify: true });
  }

  async function refreshProfileAdminStatus(session: ProfileSession) {
    try {
      const response = await api<{ admin: boolean }>(`/profiles/${session.profile.id}/admin-status`, { method: "GET" });
      const nextSession = { ...session, admin: response.admin };
      storeProfileSession(nextSession);
      setProfileSession(nextSession);
    } catch {
      const nextSession = { ...session, admin: false };
      storeProfileSession(nextSession);
      setProfileSession(nextSession);
    }
  }

  function goHome() {
    setLeagueState(null);
    setAdminInspecting(false);
    setGameView("drive");
    setSetupMode("choice");
    setProfileOpen(false);
    closeHistoryReplay();
    setResultOpen(true);
    showStatus(initialStatusText);
  }

  function forgetPlayer() {
    forgetClaim(leagueState?.player?.teamId);
    setLeagueState(null);
    setAdminInspecting(false);
    setGameView("drive");
    showStatus(tt("status_player_forgotten"));
  }

  async function copyProfileCode() {
    const code = profileSession?.recoveryCode;
    if (!code) {
      showStatus(tt("status_profile_code_missing"), "error", false);
      return;
    }

    await copyText(code);
    showStatus(tt("status_profile_code_copied"), "info", Boolean(leagueState));
  }

  async function copyTechnicalError() {
    if (!technicalError) return;
    await copyText(technicalError);
    showStatus(tt("status_error_copied"), "info", Boolean(leagueState));
  }

  function forgetProfile() {
    localStorage.removeItem(PROFILE_SESSION_KEY);
    setProfileSession(null);
    setLeagueState(null);
    setAdminInspecting(false);
    setProfileLogoutOpen(false);
    setProfileCodeOpen(false);
    setProfileOpen(false);
    setProfileMode("choice");
    setSetupMode("choice");
    setSavedClaims([]);
    storePlayerClaims([], undefined);
    showStatus(initialStatusText);
  }

  return {
    rejoinClaim,
    switchLeague,
    refreshProfileAdminStatus,
    goHome,
    addLeague: goHome,
    forgetPlayer,
    copyProfileCode,
    copyTechnicalError,
    forgetProfile
  };
}
