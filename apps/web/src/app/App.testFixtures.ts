import { circuitForRound } from "./circuits.js";
import { t } from "../i18n/index.js";

export function testCircuit(round: number, season = 1) {
  const circuit = circuitForRound(round, baseState.league.id, season);
  return {
    ...circuit,
    title: `${circuit.city} ${t(circuit.layoutKey, "en")}`
  };
}

export const baseState = {
  league: {
    id: "league_1",
    name: "Office League",
    code: "ABC123",
    status: "active",
    cadence: "manual",
    maxPlayers: 8,
    fillWithBots: true,
    qualifyingAttemptLimit: 3,
    maxGrandPrixPerSeason: 6,
    preparationDeadlineAt: null
  },
  currentGrandPrix: {
    id: "gp_1",
    name: "Silver Ridge GP",
    season: 1,
    round: 1,
    status: "briefing",
    primaryTrait: "fast",
    secondaryTrait: "weather_sensitive",
    forecast: {
      dry: 60,
      light_rain: 30,
      heavy_rain: 10
    },
    qualifyingRuns: [],
    result: null
  },
  grandPrixHistory: [
    {
      id: "gp_1",
      name: "Silver Ridge GP",
      season: 1,
      round: 1,
      status: "briefing",
      result: null
    }
  ],
  teams: [
    {
      id: "team_1",
      name: "Volt Union",
      kind: "human",
      points: 0,
      credits: 0,
      cards: ["rain_grip"],
      livery: { primary: "#16c784", secondary: "#38bdf8" },
      ready: false
    },
    {
      id: "team_2",
      name: "Mika Blitz",
      kind: "bot",
      points: 0,
      credits: 0,
      cards: [],
      livery: { primary: "#38bdf8", secondary: "#16c784" },
      ready: false
    }
  ],
  cardShop: [
    { cardId: "rain_grip", price: 120 },
    { cardId: "launch_boost", price: 120 },
    { cardId: "soft_tires", price: 120 },
    { cardId: "qualifying_focus", price: 120 },
    { cardId: "defensive_order", price: 120 }
  ],
  actionState: {
    submittedTeamIds: [],
    missingTeamIds: ["team_1", "team_2"],
    canResolve: false,
    canStartNextGrandPrix: false,
    nextAction: "wait_for_directives"
  },
  player: {
    teamId: "team_1",
    claimCode: "CLAIM123"
  },
  decisions: []
};

export const decidedState = {
  ...baseState,
  currentGrandPrix: {
    ...baseState.currentGrandPrix,
    qualifyingRuns: []
  },
  actionState: {
    submittedTeamIds: ["team_1"],
    missingTeamIds: ["team_2"],
    canResolve: true,
    canStartNextGrandPrix: false,
    nextAction: "resolve_grand_prix"
  },
  decisions: [
    {
      teamId: "team_1",
      approach: "balanced",
      preparation: "weather",
      cardId: "rain_grip",
      rivalTeamId: null
    }
  ]
};

export const resolvedState = {
  ...decidedState,
  actionState: {
    submittedTeamIds: ["team_1"],
    missingTeamIds: [],
    canResolve: false,
    canStartNextGrandPrix: true,
    nextAction: "start_next_grand_prix"
  },
  currentGrandPrix: {
    ...baseState.currentGrandPrix,
    status: "resolved",
    result: {
      grandPrixName: "Silver Ridge GP",
      seed: "silver-ridge-001",
      resolvedWeather: {
        start: "dry",
        early: "dry",
        mid: "light_rain",
        late: "light_rain",
        finish: "light_rain"
      },
      classification: [
        {
          position: 1,
          teamId: "team_1",
          teamName: "Volt Union",
          points: 25,
          credits: 150,
          positionChange: 1,
          status: "finished",
          resultTags: ["weather_gamble"]
        },
        {
          position: 2,
          teamId: "team_2",
          teamName: "Mika Blitz",
          points: 18,
          credits: 100,
          positionChange: -1,
          status: "finished",
          resultTags: []
        }
      ],
      events: [
        {
          id: "evt_001",
          order: 0,
          segment: "mid",
          lap: 5,
          type: "weather_gamble_paid",
          teamId: "team_1",
          cardId: "rain_grip",
          severity: "major",
          positionDelta: 2,
          tags: ["card", "weather"],
          replayText: "Rain Grip triggers for Volt Union",
          reportText: "Volt Union called the rain correctly."
        }
      ],
      consumedCards: [{ teamId: "team_1", cardId: "rain_grip" }],
      report: {
        headline: "Silver Ridge GP: Volt Union wins.",
        blocks: [{ title: "Key moments", body: "Volt Union called the rain correctly." }]
      }
    }
  },
  teams: [
    {
      id: "team_1",
      name: "Volt Union",
      kind: "human",
      points: 25,
      credits: 150,
      cards: [],
      livery: { primary: "#16c784", secondary: "#38bdf8" },
      ready: true
    }
  ]
};

export const nextGrandPrixState = {
  ...baseState,
  currentGrandPrix: {
    ...baseState.currentGrandPrix,
    id: "gp_2",
    season: 1,
    round: 2
  },
  grandPrixHistory: [
    {
      ...baseState.grandPrixHistory[0],
      status: "resolved",
      result: resolvedState.currentGrandPrix.result
    },
    {
      id: "gp_2",
      name: "Silver Ridge GP",
      season: 1,
      round: 2,
      status: "briefing",
      result: null
    }
  ]
};

export const seasonTwoState = {
  ...baseState,
  league: {
    ...baseState.league,
    maxGrandPrixPerSeason: 1
  },
  currentGrandPrix: {
    ...baseState.currentGrandPrix,
    id: "gp_2",
    season: 2,
    round: 1
  },
  grandPrixHistory: [
    {
      ...baseState.grandPrixHistory[0],
      status: "resolved",
      result: resolvedState.currentGrandPrix.result
    },
    {
      id: "gp_2",
      name: "Silver Ridge GP",
      season: 2,
      round: 1,
      status: "briefing",
      result: null
    }
  ]
};

export const qualifyingRun = {
  teamId: "team_1",
  time: 72.42,
  lap: 2,
  attempts: 1,
  decision: { approach: "balanced", preparation: "weather", cardId: "rain_grip" },
  createdAt: "2026-07-18T12:00:00.000Z",
  result: resolvedState.currentGrandPrix.result
};

export const slowerQualifyingRun = {
  ...qualifyingRun,
  time: 75.18,
  lap: 1,
  attempts: 1
};

export const rivalQualifyingRun = {
  ...qualifyingRun,
  teamId: "team_2",
  time: 68.33,
  lap: 1,
  attempts: 1,
  decision: { approach: "aggressive", preparation: "speed" },
  createdAt: "2026-07-18T12:01:00.000Z"
};

export const qualifiedState = {
  ...baseState,
  currentGrandPrix: {
    ...baseState.currentGrandPrix,
    qualifyingRuns: [rivalQualifyingRun, slowerQualifyingRun, qualifyingRun]
  }
};

export const decidedStateWithQualifying = {
  ...decidedState,
  currentGrandPrix: {
    ...decidedState.currentGrandPrix,
    qualifyingRuns: [rivalQualifyingRun, slowerQualifyingRun, qualifyingRun]
  }
};

export const settingsState = {
  ...baseState,
  league: {
    ...baseState.league,
    cadence: "weekly",
    preparationDeadlineAt: "2026-07-15T10:00:00.000Z"
  }
};

export const otherLeagueState = {
  ...baseState,
  league: {
    ...baseState.league,
    id: "league_2",
    name: "Night League",
    code: "NIGHT1"
  },
  teams: [
    {
      ...baseState.teams[0],
      id: "team_3",
      name: "Late Apex"
    }
  ],
  player: {
    teamId: "team_3",
    claimCode: "CLAIM456"
  }
};
