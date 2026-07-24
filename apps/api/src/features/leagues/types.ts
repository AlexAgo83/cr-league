import type { PrismaClient } from "@prisma/client";
import type { CardId, CarAssetId, QualifyingRun, RaceDecision, RaceInput, TeamLivery } from "@cr-league/shared";

export type Db = Pick<PrismaClient, "league" | "grandPrix" | "team" | "raceDecision" | "profile" | "$queryRaw"> & {
  $transaction?: <T>(fn: (tx: Db) => Promise<T>) => Promise<T>;
};

export type RecoveryMailer = {
  active: boolean;
  sendRecoveryCode(email: string, code: string): Promise<boolean>;
};

export type CreateLeagueInput = {
  name?: string;
  teamName?: string;
  profileId?: string;
  recoveryCode?: string;
  maxPlayers?: number;
  fillWithBots?: boolean;
  qualifyingAttemptLimit?: number;
  maxGrandPrixPerSeason?: number;
};

export type JoinLeagueInput = {
  code?: string;
  teamName?: string;
  profileId?: string;
  recoveryCode?: string;
};

export type RejoinLeagueInput = {
  teamId?: string;
  claimCode?: string;
};

export type UpdateLeagueSettingsInput = {
  teamId?: string;
  claimCode?: string;
  cadence?: string;
  preparationDeadlineAt?: string | null;
};

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
    primaryTrait: RaceInput["primaryTrait"];
    secondaryTrait: RaceInput["secondaryTrait"];
    trackLengthMeters: number;
    forecast: RaceInput["forecast"];
    qualifyingRuns: QualifyingRun[];
    result: unknown;
  };
  grandPrixHistory: Array<{
    id: string;
    name: string;
    season: number;
    round: number;
    status: string;
    result: unknown;
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
    approach: string;
    preparation: string;
    pitStrategy: RaceDecision["pitStrategy"];
    cardId: string | null;
    rivalTeamId: string | null;
  }>;
};

export type SubmitDecisionInput = RaceDecision & {
  teamId: string;
  claimCode?: string;
};

export type SubmitQualifyingInput = SubmitDecisionInput & {
  traits?: unknown;
  laps?: unknown;
};

export type ResolveGrandPrixInput = {
  teamId?: string;
  claimCode?: string;
  allowDefaults?: boolean;
  traits?: unknown;
  trackLengthMeters?: unknown;
  laps?: unknown;
  pitLaneProgress?: unknown;
};

export type OpponentConfigComparison = {
  grandPrixId: string;
  teams: Array<{
    teamId: string;
    teamName: string;
    approach: string;
    preparation: string;
    pitStrategy: RaceDecision["pitStrategy"];
    cardId: string | null;
    result: { position: number; points: number; credits: number } | null;
  }>;
};

export type UpdateTeamLiveryInput = {
  teamId?: string;
  claimCode?: string;
  livery?: unknown;
};

export type BuyCarAssetInput = {
  teamId?: string;
  claimCode?: string;
  carAssetId?: string;
};

export type UpdateTeamNameInput = {
  teamId?: string;
  claimCode?: string;
  name?: string;
};

export type AdminProofInput = {
  teamId?: string;
  claimCode?: string;
};

export type CreateProfileInput = {
  email?: string;
};

export type RecoverProfileInput = {
  email?: string;
  recoveryCode?: string;
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
