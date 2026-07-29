import { APP_VERSION } from "@cr-league/shared";
import { useState, type ReactNode } from "react";
import type { GameView, FormState, LeagueState, ProfileSession } from "./types.js";
import { ChangelogView } from "../features/ChangelogView.js";
import { SetupShell } from "./OnboardingShell.js";
import { useSetup } from "./setupContext.js";
import { ArcadeCatalogueView, LeagueSetupView, ProfileSetupView, SetupEntryView, SoloModeView, SoloSlotsView } from "./SetupViews.js";
import { DestinyWheelView } from "../features/arcade/DestinyWheelView.js";

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
    soloSlots,
    startCampaign,
    openSoloSlot,
    deleteSoloSlot,
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
  // The entry step still wants the ambient circuit behind its panel; the race covers the screen.
  const [wheelRacing, setWheelRacing] = useState(false);

  if (!leagueState && setupEntryMode === "choice" && !utilitySetupView) {
    return (
      <SetupShell topbar={setupTopbar} notificationStack={notificationStack} errorModal={overlays} profileCodeModal={null} profileLogoutModal={null} preferencesResetModal={null}>
        <SetupEntryView message={message} status={status} onStartSolo={startSolo} onStartMultiplayer={() => setSetupEntryMode("multiplayer")} />
      </SetupShell>
    );
  }

  if (!leagueState && setupEntryMode === "solo" && !utilitySetupView) {
    return (
      <SetupShell topbar={setupTopbar} notificationStack={notificationStack} errorModal={overlays} profileCodeModal={null} profileLogoutModal={null} preferencesResetModal={null}>
        <SoloModeView status={status} onBack={() => setSetupEntryMode("choice")} onStartCampaign={startCampaign} onStartArcade={() => setSetupEntryMode("arcade")} />
      </SetupShell>
    );
  }

  if (!leagueState && setupEntryMode === "campaign" && !utilitySetupView) {
    return (
      <SetupShell topbar={setupTopbar} notificationStack={notificationStack} errorModal={overlays} profileCodeModal={null} profileLogoutModal={null} preferencesResetModal={null}>
        <SoloSlotsView slots={soloSlots} status={status} onBack={() => setSetupEntryMode("solo")} onOpenSlot={openSoloSlot} onDeleteSlot={deleteSoloSlot} />
      </SetupShell>
    );
  }

  if (!leagueState && setupEntryMode === "arcade" && !utilitySetupView) {
    return (
      <SetupShell topbar={setupTopbar} notificationStack={notificationStack} errorModal={overlays} profileCodeModal={null} profileLogoutModal={null} preferencesResetModal={null}>
        <ArcadeCatalogueView status={status} onBack={() => setSetupEntryMode("solo")} onOpenWheel={() => setSetupEntryMode("wheel")} />
      </SetupShell>
    );
  }

  if (!leagueState && setupEntryMode === "wheel" && !utilitySetupView) {
    return (
      <SetupShell mapScreen={wheelRacing} topbar={setupTopbar} notificationStack={notificationStack} errorModal={overlays} profileCodeModal={null} profileLogoutModal={null} preferencesResetModal={null}>
        <DestinyWheelView onBack={() => setSetupEntryMode("arcade")} onRacingChange={setWheelRacing} />
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
