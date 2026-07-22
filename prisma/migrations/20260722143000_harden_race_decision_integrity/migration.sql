UPDATE "race_decisions"
SET "rivalTeamId" = NULL
WHERE "rivalTeamId" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "teams" WHERE "teams"."id" = "race_decisions"."rivalTeamId");

CREATE INDEX "race_decisions_teamId_idx" ON "race_decisions"("teamId");
CREATE INDEX "race_decisions_rivalTeamId_idx" ON "race_decisions"("rivalTeamId");

ALTER TABLE "race_decisions"
  ADD CONSTRAINT "race_decisions_rivalTeamId_fkey"
  FOREIGN KEY ("rivalTeamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "race_decisions_approach_check" CHECK ("approach" IN ('prudent', 'balanced', 'aggressive')),
  ADD CONSTRAINT "race_decisions_preparation_check" CHECK ("preparation" IN ('speed', 'weather', 'reliability')),
  ADD CONSTRAINT "race_decisions_pitStrategy_check" CHECK ("pitStrategy" IN ('heavy_pack', 'standard', 'mini_pack'));

ALTER TABLE "leagues"
  ADD CONSTRAINT "leagues_status_check" CHECK ("status" IN ('active', 'archived')),
  ADD CONSTRAINT "leagues_cadence_check" CHECK ("cadence" IN ('manual', 'fast', 'weekly'));

ALTER TABLE "teams"
  ADD CONSTRAINT "teams_kind_check" CHECK ("kind" IN ('human', 'bot'));

ALTER TABLE "grand_prixes"
  ADD CONSTRAINT "grand_prixes_status_check" CHECK ("status" IN ('briefing', 'resolved'));
