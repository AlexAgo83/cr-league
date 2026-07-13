SET search_path = "cr_league";

ALTER TABLE "teams" ADD COLUMN "cards" JSONB NOT NULL DEFAULT '[]';
