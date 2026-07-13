SET search_path = "cr_league";

ALTER TABLE "leagues" ADD COLUMN "cadence" TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE "leagues" ADD COLUMN "preparationDeadlineAt" TIMESTAMP(3);
