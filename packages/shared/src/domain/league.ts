import type { CardId, QualifyingRun, RaceDecision, RaceInput, RaceResult, TeamLivery } from "./race.js";
import type { CarAssetId } from "../economy/carAssets.js";

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
  seasonSummaries: SeasonSummary[];
  currentGrandPrix: {
    id: string;
    name: string;
    season: number;
    round: number;
    status: string;
    primaryTrait: RaceInput["primaryTrait"];
    secondaryTrait: RaceInput["secondaryTrait"];
    trackLengthMeters: number;
    forecast: RaceInput["forecast"];
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
    unlockedCarAssetIds: CarAssetId[];
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
    rivalTeamId?: string | null;
  }>;
};

export type SeasonSummary = {
  season: number;
  gpCount: number;
  standings: Array<{
    position: number;
    teamId: string;
    teamName: string;
    points: number;
    livery?: TeamLivery;
  }>;
  champion: {
    position: number;
    teamId: string;
    teamName: string;
    points: number;
    livery?: TeamLivery;
  };
};

export type ProfileSession = {
  profile: {
    id: string;
    email: string;
  };
  admin?: boolean;
  recoveryCode?: string;
  recoveryEmailSent?: boolean;
  teams: Array<{
    leagueId: string;
    leagueName: string;
    leagueCode: string;
    teamId: string;
    teamName: string;
    claimCode: string;
  }>;
};
