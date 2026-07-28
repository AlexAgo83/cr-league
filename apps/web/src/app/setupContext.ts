import { createContext, useContext } from "react";
import type { StoredPlayerClaim } from "./appStorage.js";
import type { ProfileMode, SetupEntryMode, SetupMode } from "./SetupViews.js";

// The setup flow (entry choice, profile, league creation/join) is a disjoint subtree: AppShell
// renders it but never reads any of its state. Passing it through as props meant ~23 forwarded
// arguments, so it travels by context instead.
// ponytail: the value object is rebuilt on every App render, no useMemo — AppShell is not
// memoized either, so it re-renders regardless. Add memoization only if a profiler says so.
export type SetupContextValue = {
  message: string;
  profileMode: ProfileMode;
  profileForm: { email: string; recoveryCode: string };
  profileFormError: string | null;
  leagueFormError: string | null;
  setupEntryMode: SetupEntryMode;
  setupMode: SetupMode;
  savedClaims: StoredPlayerClaim[];
  savedLeagueIndex: number;
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
};

const SetupContext = createContext<SetupContextValue | null>(null);
export const SetupProvider = SetupContext.Provider;

export function useSetup() {
  const value = useContext(SetupContext);
  if (!value) throw new Error("useSetup requires a <SetupProvider>.");
  return value;
}
