import { APP_VERSION } from "@cr-league/shared";
import type { ReactNode } from "react";
import type { StoredPlayerClaim } from "./appStorage.js";
import type { GameView, FormState, LeagueState, ProfileSession } from "./types.js";
import type { Translator } from "./helpers.js";
import { ChangelogView } from "../features/ChangelogView.js";
import { SetupShell } from "./OnboardingShell.js";
import { LeagueSetupView, ProfileSetupView, type ProfileMode, type SetupMode } from "./SetupViews.js";

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
  setupMode,
  savedClaims,
  savedLeagueIndex,
  status,
  pendingMessage,
  setForm,
  setProfileMode,
  setProfileForm,
  setProfileFormError,
  setSetupMode,
  setSavedLeagueIndex,
  createProfileSession,
  recoverProfileSession,
  createLeague,
  joinLeague,
  switchLeague,
  tt
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
  setupMode: SetupMode;
  savedClaims: StoredPlayerClaim[];
  savedLeagueIndex: number;
  status: "idle" | "loading" | "error";
  pendingMessage: string | null;
  setForm: (form: FormState) => void;
  setProfileMode: (mode: ProfileMode) => void;
  setProfileForm: (form: { email: string; recoveryCode: string }) => void;
  setProfileFormError: (error: string | null) => void;
  setSetupMode: (mode: SetupMode) => void;
  setSavedLeagueIndex: (updater: (index: number) => number) => void;
  createProfileSession: () => void;
  recoverProfileSession: () => void;
  createLeague: () => void;
  joinLeague: () => void;
  switchLeague: (teamId: string) => void;
  tt: Translator;
}) {
  if (!profileSession) {
    return (
      <SetupShell tt={tt} topbar={setupTopbar} notificationStack={notificationStack} errorModal={overlays} profileCodeModal={null} profileLogoutModal={null} preferencesResetModal={null}>
        <ProfileSetupView
          message={message}
          mode={profileMode}
          profileForm={profileForm}
          profileFormError={profileFormError}
          status={status}
          pendingMessage={pendingMessage}
          onCreateProfile={createProfileSession}
          onRecoverProfile={recoverProfileSession}
          onSetMode={setProfileMode}
          onSetProfileForm={setProfileForm}
          onSetProfileFormError={setProfileFormError}
          tt={tt}
        />
      </SetupShell>
    );
  }

  if (!leagueState) {
    return (
      <SetupShell tt={tt} topbar={setupTopbar} notificationStack={notificationStack} errorModal={overlays} profileCodeModal={null} profileLogoutModal={null} preferencesResetModal={null}>
        {gameView === "admin" && profileSession.admin ? (
          adminView
        ) : gameView === "changelog" ? (
          <ChangelogView currentVersion={APP_VERSION} tt={tt} />
        ) : (
          <LeagueSetupView
            form={form}
            message={message}
            mode={setupMode}
            savedClaims={savedClaims}
            savedLeagueIndex={savedLeagueIndex}
            status={status}
            pendingMessage={pendingMessage}
            onCreateLeague={createLeague}
            onJoinLeague={joinLeague}
            onSetForm={setForm}
            onSetMode={setSetupMode}
            onSetSavedLeagueIndex={setSavedLeagueIndex}
            onSwitchLeague={switchLeague}
            tt={tt}
          />
        )}
      </SetupShell>
    );
  }

  return null;
}
