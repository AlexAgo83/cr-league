ALTER TABLE "leagues" ADD COLUMN "maxGrandPrixPerSeason" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "grand_prixes" ADD COLUMN "season" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "grand_prixes" DROP CONSTRAINT "grand_prixes_leagueId_round_key";
ALTER TABLE "grand_prixes" ADD CONSTRAINT "grand_prixes_leagueId_season_round_key" UNIQUE ("leagueId", "season", "round");
