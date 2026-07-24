import { type SetStateAction, useCallback, useRef, useState } from "react";

export type ActiveModal =
  | "profile"
  | "preferencesReset"
  | "profileCode"
  | "profileLogout"
  | "directiveConfirm"
  | "resolveConfirm"
  | "qualifyingConfirm"
  | "nextGrandPrixConfirm"
  | "leagueControls"
  | "restartConfirm";

export function useActiveModal() {
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null);
  const modalReturnRef = useRef<ActiveModal | null>(null);
  const setModalOpen = useCallback((modal: ActiveModal, value: SetStateAction<boolean>) => {
    setActiveModal((current) => {
      const open = current === modal;
      const next = typeof value === "function" ? value(open) : value;
      if (next) return modal;
      if (current !== modal) return current;
      const returnModal = modalReturnRef.current;
      modalReturnRef.current = null;
      return returnModal;
    });
  }, []);

  return {
    modalReturnRef,
    setProfileOpen: useCallback((value: SetStateAction<boolean>) => setModalOpen("profile", value), [setModalOpen]),
    setPreferencesResetOpen: useCallback((value: SetStateAction<boolean>) => setModalOpen("preferencesReset", value), [setModalOpen]),
    setProfileCodeOpen: useCallback((value: SetStateAction<boolean>) => setModalOpen("profileCode", value), [setModalOpen]),
    setProfileLogoutOpen: useCallback((value: SetStateAction<boolean>) => setModalOpen("profileLogout", value), [setModalOpen]),
    setDirectiveConfirmOpen: useCallback((value: SetStateAction<boolean>) => setModalOpen("directiveConfirm", value), [setModalOpen]),
    setResolveConfirmOpen: useCallback((value: SetStateAction<boolean>) => setModalOpen("resolveConfirm", value), [setModalOpen]),
    setQualifyingConfirmOpen: useCallback((value: SetStateAction<boolean>) => setModalOpen("qualifyingConfirm", value), [setModalOpen]),
    setNextGrandPrixConfirmOpen: useCallback((value: SetStateAction<boolean>) => setModalOpen("nextGrandPrixConfirm", value), [setModalOpen]),
    setLeagueControlsOpen: useCallback((value: SetStateAction<boolean>) => setModalOpen("leagueControls", value), [setModalOpen]),
    setRestartConfirmOpen: useCallback((value: SetStateAction<boolean>) => setModalOpen("restartConfirm", value), [setModalOpen]),
    profileOpen: activeModal === "profile",
    preferencesResetOpen: activeModal === "preferencesReset",
    profileCodeOpen: activeModal === "profileCode",
    profileLogoutOpen: activeModal === "profileLogout",
    directiveConfirmOpen: activeModal === "directiveConfirm",
    resolveConfirmOpen: activeModal === "resolveConfirm",
    qualifyingConfirmOpen: activeModal === "qualifyingConfirm",
    nextGrandPrixConfirmOpen: activeModal === "nextGrandPrixConfirm",
    leagueControlsOpen: activeModal === "leagueControls",
    restartConfirmOpen: activeModal === "restartConfirm"
  };
}
