-- Add league owner used to gate league-level admin mutations
ALTER TABLE "leagues" ADD COLUMN "ownerTeamId" TEXT;

-- Backfill existing leagues: the earliest-created human team owns the league
UPDATE "leagues"
SET "ownerTeamId" = (
  SELECT "id" FROM "teams"
  WHERE "teams"."leagueId" = "leagues"."id" AND "teams"."kind" = 'human'
  ORDER BY "teams"."createdAt" ASC
  LIMIT 1
);
