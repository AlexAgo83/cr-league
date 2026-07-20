import type { CardId, QualifyingRun, RaceDecision, RaceResult, TeamLivery } from "@cr-league/shared";

export type LeagueState = {
  league: {
    id: string;
    name: string;
    code: string | null;
    status: string;
    cadence: string;
    maxPlayers: number;
    fillWithBots: boolean;
    qualifyingAttemptLimit: number;
    maxGrandPrixPerSeason: number;
    preparationDeadlineAt: string | null;
  };
  currentGrandPrix: {
    id: string;
    name: string;
    season: number;
    round: number;
    status: string;
    primaryTrait: string;
    secondaryTrait: string;
    trackLengthMeters: number;
    forecast: Record<string, number>;
    qualifyingRuns: QualifyingRun[];
    result: RaceResult | null;
  };
  grandPrixHistory: Array<{
    id: string;
    name: string;
    season: number;
    round: number;
    status: string;
    result: RaceResult | null;
  }>;
  teams: Array<{
    id: string;
    name: string;
    kind: string;
    points: number;
    credits: number;
    cards: CardId[];
    livery: TeamLivery;
    ready: boolean;
  }>;
  cardShop: Array<{
    cardId: CardId;
    price: number;
  }>;
  actionState: {
    submittedTeamIds: string[];
    missingTeamIds: string[];
    canResolve: boolean;
    canStartNextGrandPrix: boolean;
    nextAction: string;
  };
  player?: {
    teamId: string;
    claimCode: string;
  };
  decisions: Array<{
    teamId: string;
    approach: RaceDecision["approach"];
    preparation: RaceDecision["preparation"];
    pitStrategy?: RaceDecision["pitStrategy"];
    cardId: RaceDecision["cardId"] | null;
  }>;
};

export type ProfileSession = {
  profile: {
    id: string;
    email: string;
  };
  admin?: boolean;
  recoveryCode?: string;
  teams: Array<{
    leagueId: string;
    leagueName: string;
    leagueCode: string;
    teamId: string;
    teamName: string;
    claimCode: string;
  }>;
};

export type GameView = "drive" | "plan" | "championship" | "garage" | "changelog" | "admin";

export const GAME_VIEWS: GameView[] = ["drive", "plan", "championship", "garage"];

export type FormState = {
  leagueName: string;
  joinCode: string;
  teamName: string;
  maxPlayers: number | "";
  fillWithBots: boolean;
  qualifyingAttemptLimit: number | "";
  maxGrandPrixPerSeason: number | "";
  cadence: string;
  preparationDeadlineAt: string;
  approach: RaceDecision["approach"];
  preparation: RaceDecision["preparation"];
  pitStrategy: NonNullable<RaceDecision["pitStrategy"]>;
  cardId: RaceDecision["cardId"] | "";
};

export type AdminUser = {
  id: string;
  email: string;
  createdAt: string;
  teamCount: number;
  leagueCount: number;
};

export type AdminLeague = {
  id: string;
  code: string;
  name: string;
  status: string;
  currentSeason: number | null;
  currentRound: number | null;
  playerCount: number;
  teamCount: number;
  createdAt: string;
};
