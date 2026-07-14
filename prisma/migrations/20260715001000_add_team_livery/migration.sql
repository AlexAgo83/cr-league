SET search_path = "cr_league";

ALTER TABLE "teams" ADD COLUMN "livery" JSONB NOT NULL DEFAULT '{"primary":"#16c784","secondary":"#38bdf8"}';
