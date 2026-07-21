import type { TranslationKey } from "../i18n/index.js";
import { ApiError, api, claimsFromProfile, storePlayerClaims, storeProfileEmail, storeProfileSession } from "./appStorage.js";
import type { ProfileMode } from "./SetupViews.js";
import type { ProfileSession } from "./types.js";

export function createProfileActions({
  profileForm,
  run,
  tt,
  setProfileFormError,
  setProfileSession,
  setSavedClaims,
  setSetupMode,
  setProfileOpen,
  showStatus,
  openProfileCodeHelp
}: {
  profileForm: { email: string; recoveryCode: string };
  run: (nextMessage: string, action: () => Promise<void>, staleClaimTeamId?: string, notify?: boolean, errorText?: (error: unknown) => string) => Promise<void>;
  tt: (key: TranslationKey) => string;
  setProfileFormError: (error: string | null) => void;
  setProfileSession: (session: ProfileSession) => void;
  setSavedClaims: (claims: ReturnType<typeof claimsFromProfile>) => void;
  setSetupMode: (mode: "choice") => void;
  setProfileOpen: (open: boolean) => void;
  showStatus: (text: string, tone?: "info" | "error", notify?: boolean) => void;
  openProfileCodeHelp: () => void;
}) {
  const validateProfileForm = (email: string, recoveryCode?: string) => {
    if (!email) return tt("profile_error_email_required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return tt("profile_error_email_invalid");
    if (recoveryCode !== undefined && !recoveryCode) return tt("profile_error_recovery_code_required");
    return null;
  };

  const profileApiErrorMessage = (error: unknown, mode: Exclude<ProfileMode, "choice"> | "requestCode") => {
    if (error instanceof TypeError) return tt("status_api_unavailable");
    if (error instanceof ApiError && error.statusCode >= 500) return tt("status_request_failed");
    if (mode === "recover" && error instanceof ApiError && [400, 401, 403, 404].includes(error.statusCode)) return tt("profile_error_recovery_failed");
    if (mode === "create" && error instanceof ApiError && error.statusCode === 409) return tt("profile_error_create_conflict");
    if (mode === "requestCode") return tt("profile_error_create_failed");
    return mode === "create" ? tt("profile_error_create_failed") : tt("profile_error_recovery_failed");
  };

  const createProfileSession = async () => {
    const email = profileForm.email.trim();
    const error = validateProfileForm(email);
    if (error) {
      setProfileFormError(error);
      return;
    }
    setProfileFormError(null);

    await run(tt("status_creating_profile"), async () => {
      const session = await api<ProfileSession>("/profiles", {
        method: "POST",
        body: JSON.stringify({ email })
      });
      storeProfileSession(session);
      setProfileSession(session);
      setSavedClaims(claimsFromProfile(session));
      setSetupMode("choice");
      setProfileOpen(false);
      showStatus(`${tt(session.recoveryEmailSent ? "status_profile_created_email_sent" : "status_profile_created")} ${session.recoveryCode ?? ""}`, "info", false);
      openProfileCodeHelp();
    }, undefined, true, (error) => profileApiErrorMessage(error, "create"));
  };

  const requestRecoveryCode = async () => {
    const email = profileForm.email.trim();
    const error = validateProfileForm(email);
    if (error) {
      setProfileFormError(error);
      return;
    }
    setProfileFormError(null);

    await run(tt("status_requesting_recovery_code"), async () => {
      await api("/profiles/recovery-code", {
        method: "POST",
        body: JSON.stringify({ email })
      });
      storeProfileEmail(email);
      showStatus(tt("status_recovery_code_requested"), "info", false);
    }, undefined, true, (error) => profileApiErrorMessage(error, "requestCode"));
  };

  const recoverProfileSession = async () => {
    const email = profileForm.email.trim();
    const recoveryCode = profileForm.recoveryCode.trim().toUpperCase();
    const error = validateProfileForm(email, recoveryCode);
    if (error) {
      setProfileFormError(error);
      return;
    }
    setProfileFormError(null);

    await run(tt("status_recovering_profile"), async () => {
      const session = await api<ProfileSession>("/profiles/recover", {
        method: "POST",
        body: JSON.stringify({ email, recoveryCode })
      });
      storeProfileSession(session);
      const claims = claimsFromProfile(session);
      storePlayerClaims(claims, claims[0]?.teamId);
      setProfileSession(session);
      setSavedClaims(claims);
      setSetupMode("choice");
      setProfileOpen(false);
      showStatus(tt("status_profile_recovered"), "info", false);
    }, undefined, true, (error) => profileApiErrorMessage(error, "recover"));
  };

  return { createProfileSession, recoverProfileSession, requestRecoveryCode };
}
