-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "cr_league";
SET search_path = "cr_league";

-- CreateTable
CREATE TABLE "leagues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leagues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'human',
    "credits" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grand_prixes" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "round" INTEGER NOT NULL DEFAULT 1,
    "seed" TEXT NOT NULL,
    "primaryTrait" TEXT NOT NULL,
    "secondaryTrait" TEXT NOT NULL,
    "forecast" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'briefing',
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grand_prixes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "race_decisions" (
    "id" TEXT NOT NULL,
    "grandPrixId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "approach" TEXT NOT NULL,
    "preparation" TEXT NOT NULL,
    "cardId" TEXT,
    "rivalTeamId" TEXT,
    "defaulted" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "race_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leagues_code_key" ON "leagues"("code");

-- CreateIndex
CREATE UNIQUE INDEX "teams_leagueId_name_key" ON "teams"("leagueId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "grand_prixes_leagueId_round_key" ON "grand_prixes"("leagueId", "round");

-- CreateIndex
CREATE UNIQUE INDEX "race_decisions_grandPrixId_teamId_key" ON "race_decisions"("grandPrixId", "teamId");

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "leagues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grand_prixes" ADD CONSTRAINT "grand_prixes_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "leagues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race_decisions" ADD CONSTRAINT "race_decisions_grandPrixId_fkey" FOREIGN KEY ("grandPrixId") REFERENCES "grand_prixes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race_decisions" ADD CONSTRAINT "race_decisions_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
