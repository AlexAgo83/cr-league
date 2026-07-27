ALTER TABLE "leagues"
  ADD COLUMN "reminderSentAt" TIMESTAMP(3),
  ADD COLUMN "reminderSentBy" TEXT,
  ADD COLUMN "reminderSeasonNumber" INTEGER,
  ADD COLUMN "reminderSentCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "reminderSkippedCount" INTEGER NOT NULL DEFAULT 0;
