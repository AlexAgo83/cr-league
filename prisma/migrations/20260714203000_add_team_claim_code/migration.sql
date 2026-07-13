SET search_path = "cr_league";

ALTER TABLE "teams" ADD COLUMN "claimCode" TEXT;

UPDATE "teams" SET "claimCode" = "id" WHERE "claimCode" IS NULL;

CREATE UNIQUE INDEX "teams_claimCode_key" ON "teams"("claimCode");
