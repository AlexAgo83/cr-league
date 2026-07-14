ALTER TABLE "leagues" ALTER COLUMN "maxGrandPrixPerSeason" SET DEFAULT 6;
UPDATE "leagues" SET "maxGrandPrixPerSeason" = 6 WHERE "maxGrandPrixPerSeason" = 3;
