import type { CardId, RaceDecision, RaceResult, TeamLivery } from "@cr-league/shared";

export type LeagueState = {
  league: {
    id: string;
    name: string;
    code: string;
    status: string;
    cadence: string;
    preparationDeadlineAt: string | null;
  };
  currentGrandPrix: {
    id: string;
    name: string;
    round: number;
    status: string;
    primaryTrait: string;
    secondaryTrait: string;
    forecast: Record<string, number>;
    result: RaceResult | null;
  };
  grandPrixHistory: Array<{
    id: string;
    name: string;
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
    cardId: RaceDecision["cardId"] | null;
    rivalTeamId: string | null;
  }>;
};

export type ProfileSession = {
  profile: {
    id: string;
    email: string;
  };
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

export type GameView = "drive" | "championship" | "garage" | "result";

export const GAME_VIEWS: GameView[] = ["drive", "championship", "garage", "result"];

export type FormState = {
  leagueName: string;
  joinCode: string;
  teamName: string;
  cadence: string;
  preparationDeadlineAt: string;
  approach: RaceDecision["approach"];
  preparation: RaceDecision["preparation"];
  cardId: RaceDecision["cardId"] | "";
};
