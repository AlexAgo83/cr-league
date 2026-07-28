import { APP_VERSION } from "@cr-league/shared";
import type { ReactNode } from "react";
import type { StoredPlayerClaim } from "./appStorage.js";
import type { GameView, FormState, LeagueState, ProfileSession } from "./types.js";
import { ChangelogView } from "../features/ChangelogView.js";
import { SetupShell } from "./OnboardingShell.js";
import { LeagueSetupView, ProfileSetupView, SetupEntryView, type ProfileMode, type SetupEntryMode, type SetupMode } from "./SetupViews.js";

export function SetupGate({
  profileSession,
  leagueState,
  gameView,
  adminView,
  setupTopbar,
  notificationStack,
  overlays,
  form,
  message,
  profileMode,
  profileForm,
  profileFormError,
  leagueFormError,
  setupEntryMode,
  setupMode,
  savedClaims,
  savedLeagueIndex,
  status,
  pendingMessage,
  setForm,
  setProfileMode,
  setProfileForm,
  setProfileFormError,
  setLeagueFormError,
  setSetupEntryMode,
  setSetupMode,
  setSavedLeagueIndex,
  createProfileSession,
  recoverProfileSession,
  requestRecoveryCode,
  startSolo,
  createLeague,
  joinLeague,
  switchLeague
}: {
  profileSession: ProfileSession | null;
  leagueState: LeagueState | null;
  gameView: GameView;
  adminView: ReactNode;
  setupTopbar: ReactNode;
  notificationStack: ReactNode;
  overlays: ReactNode;
  form: FormState;
  message: string;
  profileMode: ProfileMode;
  profileForm: { email: string; recoveryCode: string };
  profileFormError: string | null;
  leagueFormError: string | null;
  setupEntryMode: SetupEntryMode;
  setupMode: SetupMode;
  savedClaims: StoredPlayerClaim[];
  savedLeagueIndex: number;
  status: "idle" | "loading" | "error";
  pendingMessage: string | null;
  setForm: (form: FormState) => void;
  setProfileMode: (mode: ProfileMode) => void;
  setProfileForm: (form: { email: string; recoveryCode: string }) => void;
  setProfileFormError: (error: string | null) => void;
  setLeagueFormError: (error: string | null) => void;
  setSetupEntryMode: (mode: SetupEntryMode) => void;
  setSetupMode: (mode: SetupMode) => void;
  setSavedLeagueIndex: (updater: (index: number) => number) => void;
  createProfileSession: () => void;
  recoverProfileSession: () => void;
  requestRecoveryCode: () => void;
  startSolo: () => void;
  createLeague: () => void;
  joinLeague: () => void;
  switchLeague: (teamId: string) => void;
}) {
  const utilitySetupView = profileSession && ((gameView === "admin" && profileSession.admin) || gameView === "changelog");

  if (!leagueState && setupEntryMode === "choice" && !utilitySetupView) {
    return (
      <SetupShell topbar={setupTopbar} notificationStack={notificationStack} errorModal={overlays} profileCodeModal={null} profileLogoutModal={null} preferencesResetModal={null}>
        <SetupEntryView message={message} status={status} onStartSolo={startSolo} onStartMultiplayer={() => setSetupEntryMode("multiplayer")} />
      </SetupShell>
    );
  }

  if (!profileSession) {
    return (
      <SetupShell topbar={setupTopbar} notificationStack={notificationStack} errorModal={overlays} profileCodeModal={null} profileLogoutModal={null} preferencesResetModal={null}>
        <ProfileSetupView
          message={message}
          mode={profileMode}
          profileForm={profileForm}
          profileFormError={profileFormError}
          status={status}
          pendingMessage={pendingMessage}
          onCreateProfile={createProfileSession}
          onRecoverProfile={recoverProfileSession}
          onRequestRecoveryCode={requestRecoveryCode}
          onSetMode={setProfileMode}
          onSetProfileForm={setProfileForm}
          onSetProfileFormError={setProfileFormError}
        />
      </SetupShell>
    );
  }

  if (!leagueState) {
    return (
      <SetupShell topbar={setupTopbar} notificationStack={notificationStack} errorModal={overlays} profileCodeModal={null} profileLogoutModal={null} preferencesResetModal={null}>
        {gameView === "admin" && profileSession.admin ? (
          adminView
        ) : gameView === "changelog" ? (
          <ChangelogView currentVersion={APP_VERSION} />
        ) : (
          <LeagueSetupView
            form={form}
            formError={leagueFormError}
            message={message}
            mode={setupMode}
            savedClaims={savedClaims}
            savedLeagueIndex={savedLeagueIndex}
            status={status}
            pendingMessage={pendingMessage}
            onCreateLeague={createLeague}
            onJoinLeague={joinLeague}
            onSetForm={setForm}
            onSetFormError={setLeagueFormError}
            onSetMode={setSetupMode}
            onSetSavedLeagueIndex={setSavedLeagueIndex}
            onSwitchLeague={switchLeague}
          />
        )}
      </SetupShell>
    );
  }

  return null;
}
