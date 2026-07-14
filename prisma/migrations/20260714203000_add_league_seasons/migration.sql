ALTER TABLE "leagues" ADD COLUMN "maxGrandPrixPerSeason" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "grand_prixes" ADD COLUMN "season" INTEGER NOT NULL DEFAULT 1;
DROP INDEX "grand_prixes_leagueId_round_key";
CREATE UNIQUE INDEX "grand_prixes_leagueId_season_round_key" ON "grand_prixes"("leagueId", "season", "round");
