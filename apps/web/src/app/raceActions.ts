import { type QualifyingRun } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import { api } from "./appStorage.js";
import type { CityCircuit } from "./circuits.js";
import { clampNumber } from "./helpers.js";
import type { FormState, GameView, LeagueState, ProfileSession } from "./types.js";
import type { CommandClick } from "./useCommandClicks.js";

export function createRaceActions({
  leagueState,
  profileSession,
  playerTeam,
  form,
  selectedCardId,
  currentCircuit,
  qualifyingAttemptsLeft,
  qualifyingDisabled,
  lastQualifyingRun,
  run,
  tt,
  setAdminInspecting,
  setLeagueState,
  setLeagueFormError,
  setGameView,
  setDirectiveConfirmOpen,
  setQualifyingResult,
  setQualifyingConfirmOpen,
  setResolveConfirmOpen,
  setStartingGridExpanded,
  setNextGrandPrixConfirmOpen,
  markCommandClicked,
  withCurrentPlayer,
  rememberPlayer,
  showStatus,
  pushCommandHint
}: {
  leagueState: LeagueState | null;
  profileSession: ProfileSession | null;
  playerTeam: LeagueState["teams"][number] | undefined;
  form: FormState;
  selectedCardId: FormState["cardId"];
  currentCircuit: CityCircuit;
  qualifyingAttemptsLeft: number;
  qualifyingDisabled: boolean;
  lastQualifyingRun: QualifyingRun | null;
  run: (nextMessage: string, action: () => Promise<void>) => Promise<void>;
  tt: (key: TranslationKey) => string;
  setAdminInspecting: (inspecting: boolean) => void;
  setLeagueState: (state: LeagueState) => void;
  setLeagueFormError: (error: string | null) => void;
  setGameView: (view: GameView) => void;
  setDirectiveConfirmOpen: (open: boolean) => void;
  setQualifyingResult: (result: QualifyingRun | null) => void;
  setQualifyingConfirmOpen: (open: boolean) => void;
  setResolveConfirmOpen: (open: boolean) => void;
  setStartingGridExpanded: (expanded: boolean) => void;
  setNextGrandPrixConfirmOpen: (open: boolean) => void;
  markCommandClicked: (command: CommandClick) => void;
  withCurrentPlayer: (state: LeagueState) => LeagueState;
  rememberPlayer: (state: LeagueState) => void;
  showStatus: (text: string) => void;
  pushCommandHint: (nextDeskState: "prepare" | "ready" | "resolved") => void;
}) {
  async function createLeague() {
    await run(tt("status_creating_league"), async () => {
      const state = await api<LeagueState>("/leagues", {
        method: "POST",
        body: JSON.stringify({
          name: form.leagueName,
          teamName: form.teamName.trim(),
          profileId: profileSession?.profile.id,
          recoveryCode: profileSession?.recoveryCode,
          maxPlayers: clampNumber(Number(form.maxPlayers), 2, 16),
          fillWithBots: form.fillWithBots,
          qualifyingAttemptLimit: clampNumber(Number(form.qualifyingAttemptLimit), 1, 5),
          maxGrandPrixPerSeason: clampNumber(Number(form.maxGrandPrixPerSeason), 1, 18)
        })
      });
      rememberPlayer(state);
      setAdminInspecting(false);
      setLeagueState(state);
      setGameView("drive");
      showStatus(tt("status_league_created"));
      pushCommandHint("prepare");
    });
  }

  async function joinLeague() {
    if (!form.joinCode.trim() || !form.teamName.trim()) {
      setLeagueFormError(tt("setup_error_join_required"));
      return;
    }
    await run(tt("status_joining_league"), async () => {
      const state = await api<LeagueState>("/leagues/join", {
        method: "POST",
        body: JSON.stringify({
          code: form.joinCode,
          teamName: form.teamName.trim(),
          profileId: profileSession?.profile.id,
          recoveryCode: profileSession?.recoveryCode
        })
      });
      rememberPlayer(state);
      setAdminInspecting(false);
      setLeagueState(state);
      setGameView("drive");
      showStatus(tt("status_league_joined"));
      pushCommandHint("prepare");
    });
  }

  async function submitDirective() {
    if (!leagueState || !playerTeam) return;
    markCommandClicked("directive");
    setDirectiveConfirmOpen(true);
  }

  async function submitDirectiveConfirmed() {
    const player = leagueState?.player;
    if (!leagueState || !player || !playerTeam) return;
    setDirectiveConfirmOpen(false);
    await run(tt("status_submitting_directive"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/decisions`, {
        method: "POST",
        body: JSON.stringify({
          teamId: playerTeam.id,
          claimCode: player.claimCode,
          approach: form.approach,
          preparation: form.preparation,
          pitStrategy: form.pitStrategy,
          cardId: selectedCardId || undefined
        })
      });
      setLeagueState(withCurrentPlayer(state));
      setQualifyingResult(null);
      showStatus(tt("status_directive_locked"));
      pushCommandHint("ready");
    });
  }

  async function launchQualifyingRun() {
    const player = leagueState?.player;
    if (!leagueState || !player || !playerTeam || qualifyingDisabled) return;

    await run(tt("status_qualifying_running"), async () => {
      const response = await api<{ state: LeagueState; run: QualifyingRun; isBest: boolean }>(`/leagues/${leagueState.league.id}/qualifying`, {
        method: "POST",
        body: JSON.stringify({
          teamId: playerTeam.id,
          claimCode: player.claimCode,
          approach: form.approach,
          preparation: form.preparation,
          pitStrategy: form.pitStrategy,
          cardId: selectedCardId || undefined,
          traits: currentCircuit.traits,
          laps: 3
        })
      });
      setLeagueState(withCurrentPlayer(response.state));
      setQualifyingResult(response.run);
      showStatus(response.isBest ? tt("status_qualifying_best") : tt("status_qualifying_done"));
    });
  }

  function openQualifyingRun() {
    if (qualifyingDisabled) return;
    markCommandClicked("qualifying");
    if (qualifyingAttemptsLeft > 1) {
      setQualifyingResult(null);
      void launchQualifyingRun();
      return;
    }
    setQualifyingConfirmOpen(true);
  }

  function openResolveConfirm() {
    markCommandClicked("launchGrandPrix");
    setStartingGridExpanded(false);
    setResolveConfirmOpen(true);
  }

  function openNextGrandPrixConfirm() {
    markCommandClicked("nextGrandPrix");
    setNextGrandPrixConfirmOpen(true);
  }

  function startQualifyingRunConfirmed() {
    setQualifyingConfirmOpen(false);
    setQualifyingResult(null);
    void launchQualifyingRun();
  }

  function openLastQualifyingRun() {
    if (lastQualifyingRun) setQualifyingResult(lastQualifyingRun);
  }

  return {
    createLeague,
    joinLeague,
    submitDirective,
    submitDirectiveConfirmed,
    openQualifyingRun,
    openResolveConfirm,
    openNextGrandPrixConfirm,
    startQualifyingRunConfirmed,
    openLastQualifyingRun
  };
}
