import type { PrismaClient } from "@prisma/client";
import type { LeagueState, ProfileSession, RaceDecision } from "@cr-league/shared";

export type Db = Pick<PrismaClient, "league" | "grandPrix" | "team" | "raceDecision" | "profile" | "$queryRaw"> & {
  $transaction?: <T>(fn: (tx: Db) => Promise<T>) => Promise<T>;
};

export type RecoveryMailer = {
  active: boolean;
  sendRecoveryCode(email: string, code: string): Promise<boolean>;
  sendPlanReminder?(email: string, input: { leagueName: string; teamName: string; grandPrixName: string; season: number; round: number }): Promise<boolean>;
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
  variableShop?: boolean;
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
  name?: string;
  cadence?: string;
  preparationDeadlineAt?: string | null;
};

export type { LeagueState, ProfileSession };

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
