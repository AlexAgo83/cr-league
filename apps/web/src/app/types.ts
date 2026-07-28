import type { LeagueState, ProfileSession, RaceDecision } from "@cr-league/shared";

export type { LeagueState, ProfileSession };

export type GameView = "drive" | "plan" | "championship" | "garage" | "changelog" | "admin";

export const GAME_VIEWS: GameView[] = ["drive", "plan", "championship", "garage"];

export type FormState = {
  leagueName: string;
  joinCode: string;
  teamName: string;
  maxPlayers: number | "";
  fillWithBots: boolean;
  variableShop: boolean;
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

export type AdminPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
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
