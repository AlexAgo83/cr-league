import { APP_VERSION } from "@cr-league/shared";
import type { ReactNode } from "react";
import type { GameView, FormState, LeagueState, ProfileSession } from "./types.js";
import { ChangelogView } from "../features/ChangelogView.js";
import { SetupShell } from "./OnboardingShell.js";
import { useSetup } from "./setupContext.js";
import { LeagueSetupView, ProfileSetupView, SetupEntryView } from "./SetupViews.js";

export function SetupGate({
  profileSession,
  leagueState,
  gameView,
  adminView,
  setupTopbar,
  notificationStack,
  overlays,
  form,
  status,
  pendingMessage,
  setForm
}: {
  profileSession: ProfileSession | null;
  leagueState: LeagueState | null;
  gameView: GameView;
  adminView: ReactNode;
  setupTopbar: ReactNode;
  notificationStack: ReactNode;
  overlays: ReactNode;
  form: FormState;
  status: "idle" | "loading" | "error";
  pendingMessage: string | null;
  setForm: (form: FormState) => void;
}) {
  const {
    message,
    profileMode,
    profileForm,
    profileFormError,
    leagueFormError,
    setupEntryMode,
    setupMode,
    savedClaims,
    savedLeagueIndex,
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
  } = useSetup();
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
          onBack={() => setSetupEntryMode("choice")}
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
            onBack={() => setSetupEntryMode("choice")}
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
