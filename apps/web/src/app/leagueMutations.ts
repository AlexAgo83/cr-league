import type { CardId } from "@cr-league/shared";
import type { TranslationKey } from "../i18n/index.js";
import { circuitRouteAnalysis } from "../features/CircuitMap.js";
import type { CityCircuit } from "./circuits.js";
import { api } from "./appStorage.js";
import type { FormState, GameView, LeagueState } from "./types.js";

export function createLeagueMutations({
  leagueState,
  playerTeam,
  playerDecision,
  form,
  currentCircuit,
  run,
  tt,
  setLeagueState,
  setGameView,
  setResultTab,
  setResultOpen,
  setResolveConfirmOpen,
  setNextGrandPrixConfirmOpen,
  setRouteReplayGrandPrixId,
  setHistoryReplay,
  showStatus,
  pushCommandHint,
  withCurrentPlayer,
  rememberPlayer
}: {
  leagueState: LeagueState | null;
  playerTeam: LeagueState["teams"][number] | undefined;
  playerDecision: LeagueState["decisions"][number] | undefined;
  form: FormState;
  currentCircuit: CityCircuit;
  run: (nextMessage: string, action: () => Promise<void>) => Promise<void>;
  tt: (key: TranslationKey) => string;
  setLeagueState: (state: LeagueState) => void;
  setGameView: (view: GameView) => void;
  setResultTab: (tab: "replay" | "report") => void;
  setResultOpen: (open: boolean) => void;
  setResolveConfirmOpen: (open: boolean) => void;
  setNextGrandPrixConfirmOpen: (open: boolean) => void;
  setRouteReplayGrandPrixId: (id: string | undefined) => void;
  setHistoryReplay: (grandPrix: LeagueState["grandPrixHistory"][number] | null) => void;
  showStatus: (text: string) => void;
  pushCommandHint: (nextDeskState: "prepare" | "ready" | "resolved") => void;
  withCurrentPlayer: (state: LeagueState) => LeagueState;
  rememberPlayer: (state: LeagueState) => void;
}) {
  async function mutateLeague(loadingKey: TranslationKey, path: string, body: unknown, successKey: TranslationKey) {
    await run(tt(loadingKey), async () => {
      const state = await api<LeagueState>(path, {
        method: "POST",
        body: body === undefined ? undefined : JSON.stringify(body)
      });
      setLeagueState(withCurrentPlayer(state));
      showStatus(tt(successKey));
    });
  }

  async function updateSettings() {
    if (!leagueState) return;

    await mutateLeague(
      "status_updating_settings",
      `/leagues/${leagueState.league.id}/settings`,
      {
        teamId: leagueState.player?.teamId,
        claimCode: leagueState.player?.claimCode,
        cadence: form.cadence,
        preparationDeadlineAt: form.preparationDeadlineAt ? new Date(form.preparationDeadlineAt).toISOString() : null
      },
      "status_settings_updated"
    );
  }

  async function resolveGrandPrix() {
    if (!leagueState) return;
    setResolveConfirmOpen(false);

    await run(tt("status_resolving_grand_prix"), async () => {
      const analysis = circuitRouteAnalysis(currentCircuit);
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/resolve`, {
        method: "POST",
        body: JSON.stringify({
          teamId: leagueState.player?.teamId,
          claimCode: leagueState.player?.claimCode,
          allowDefaults: !playerDecision,
          traits: currentCircuit.traits,
          trackLengthMeters: currentCircuit.trackLengthMeters,
          laps: currentCircuit.laps,
          pitLaneProgress: (((analysis.pitProgress - analysis.startProgress) % 1) + 1) % 1
        })
      });
      setLeagueState(withCurrentPlayer(state));
      setGameView("drive");
      setResultTab("replay");
      setResultOpen(true);
      pushCommandHint("resolved");
    });
  }

  async function startNextGrandPrix() {
    if (!leagueState) return;
    const finishingSeason = leagueState.currentGrandPrix.round >= leagueState.league.maxGrandPrixPerSeason;
    setNextGrandPrixConfirmOpen(false);
    setRouteReplayGrandPrixId(undefined);
    setHistoryReplay(null);
    setResultOpen(false);
    setGameView("drive");

    await run(tt(finishingSeason ? "status_finishing_season" : "status_starting_next_grand_prix"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/next-grand-prix`, {
        method: "POST",
        body: JSON.stringify({
          teamId: leagueState.player?.teamId,
          claimCode: leagueState.player?.claimCode
        })
      });
      setLeagueState(withCurrentPlayer(state));
      setGameView("drive");
      setResultOpen(false);
      showStatus(tt(finishingSeason ? "status_season_finished" : "status_next_grand_prix_started"));
      pushCommandHint("prepare");
    });
  }

  async function buyCard(cardId: CardId, quantity = 1) {
    if (!leagueState || !playerTeam) return;

    await mutateLeague(
      "status_buying_card",
      `/leagues/${leagueState.league.id}/cards/buy`,
      {
        teamId: playerTeam.id,
        claimCode: leagueState.player?.claimCode,
        cardId,
        quantity
      },
      "status_card_bought"
    );
  }

  async function sellCard(cardId: CardId) {
    if (!leagueState || !playerTeam) return;

    await mutateLeague(
      "status_selling_card",
      `/leagues/${leagueState.league.id}/cards/sell`,
      {
        teamId: playerTeam.id,
        claimCode: leagueState.player?.claimCode,
        cardId
      },
      "status_card_sold"
    );
  }

  async function updateLivery(livery: LeagueState["teams"][number]["livery"]) {
    if (!leagueState || !playerTeam) return;

    await mutateLeague(
      "status_livery_updating",
      `/leagues/${leagueState.league.id}/teams/livery`,
      {
        teamId: playerTeam.id,
        claimCode: leagueState.player?.claimCode,
        livery
      },
      "status_livery_updated"
    );
  }

  async function updateTeamName(name: string) {
    if (!leagueState || !playerTeam) return;

    await run(tt("status_team_name_updating"), async () => {
      const state = await api<LeagueState>(`/leagues/${leagueState.league.id}/teams/name`, {
        method: "POST",
        body: JSON.stringify({
          teamId: playerTeam.id,
          claimCode: leagueState.player?.claimCode,
          name
        })
      });
      const nextState = withCurrentPlayer(state);
      setLeagueState(nextState);
      rememberPlayer(nextState);
      showStatus(tt("status_team_name_updated"));
    });
  }

  async function restartLeague() {
    if (!leagueState) return;

    await mutateLeague(
      "status_restarting_league",
      `/leagues/${leagueState.league.id}/restart`,
      {
        teamId: leagueState.player?.teamId,
        claimCode: leagueState.player?.claimCode
      },
      "status_league_restarted"
    );
  }

  return { updateSettings, resolveGrandPrix, startNextGrandPrix, buyCard, sellCard, updateLivery, updateTeamName, restartLeague };
}
