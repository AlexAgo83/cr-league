import { CARD_PRICES, DEFAULT_CAR_ASSET_ID, DEMO_RACE_INPUT, type CardId } from "@cr-league/shared";
import type { LeagueState } from "./types.js";

export const SOLO_LEAGUE_ID = "solo-local";
export const SOLO_TEAM_ID = "solo-team";
export const SOLO_CLAIM_CODE = "solo-local";

const STARTER_CARDS: CardId[] = ["rain_grip", "launch_boost", "soft_tires", "qualifying_focus", "defensive_order"];

export function isSoloLeagueState(state: LeagueState | null | undefined) {
  return state?.league.id === SOLO_LEAGUE_ID && state.player?.claimCode === SOLO_CLAIM_CODE;
}

export function createInitialSoloLeagueState(): LeagueState {
  const teams: LeagueState["teams"] = [
    {
      id: SOLO_TEAM_ID,
      name: "Volt Union",
      kind: "human",
      points: 0,
      credits: 300,
      cards: ["rain_grip"],
      livery: { primary: "#16c784", secondary: "#38bdf8", carAssetId: DEFAULT_CAR_ASSET_ID },
      unlockedCarAssetIds: [DEFAULT_CAR_ASSET_ID],
      ready: false
    },
    ...DEMO_RACE_INPUT.participants
      .filter((participant) => participant.kind === "bot")
      .slice(0, 5)
      .map((participant, index) => ({
        id: `solo-bot-${index + 1}`,
        name: participant.teamName,
        kind: "bot",
        points: 0,
        credits: 0,
        cards: participant.decision.cardId ? [participant.decision.cardId] : [],
        livery: botLivery(index),
        unlockedCarAssetIds: [DEFAULT_CAR_ASSET_ID],
        ready: false
      }))
  ];

  return {
    league: {
      id: SOLO_LEAGUE_ID,
      name: "Solo League",
      code: null,
      status: "active",
      cadence: "manual",
      maxPlayers: 6,
      fillWithBots: true,
      qualifyingAttemptLimit: 3,
      maxGrandPrixPerSeason: 6,
      variableShop: false,
      preparationDeadlineAt: null,
      reminderSentAt: null,
      reminderSentBy: null,
      reminderSeasonNumber: null,
      reminderSentCount: 0,
      reminderSkippedCount: 0
    },
    seasonSummaries: [],
    currentGrandPrix: {
      id: "solo-gp-1-1",
      name: DEMO_RACE_INPUT.grandPrixName,
      season: 1,
      round: 1,
      status: "briefing",
      primaryTrait: DEMO_RACE_INPUT.primaryTrait,
      secondaryTrait: DEMO_RACE_INPUT.secondaryTrait,
      trackLengthMeters: DEMO_RACE_INPUT.trackLengthMeters ?? 3200,
      forecast: DEMO_RACE_INPUT.forecast,
      qualifyingRuns: [],
      result: null
    },
    grandPrixHistory: [
      {
        id: "solo-gp-1-1",
        name: DEMO_RACE_INPUT.grandPrixName,
        season: 1,
        round: 1,
        status: "briefing",
        result: null
      }
    ],
    teams,
    cardShop: STARTER_CARDS.map((cardId) => ({ cardId, price: CARD_PRICES[cardId] })),
    actionState: {
      submittedTeamIds: [],
      missingTeamIds: teams.filter((team) => team.kind === "human").map((team) => team.id),
      canResolve: false,
      canResolveWithDefaults: true,
      canStartNextGrandPrix: false,
      nextAction: "resolve_with_defaults"
    },
    player: {
      teamId: SOLO_TEAM_ID,
      claimCode: SOLO_CLAIM_CODE
    },
    decisions: []
  };
}

function botLivery(index: number) {
  const palette = [
    ["#ef4444", "#facc15"],
    ["#8b5cf6", "#22d3ee"],
    ["#f97316", "#111827"],
    ["#0ea5e9", "#f8fafc"],
    ["#84cc16", "#1e293b"]
  ] as const;
  const [primary, secondary] = palette[index % palette.length] ?? palette[0];
  return { primary, secondary, carAssetId: DEFAULT_CAR_ASSET_ID };
}
