SET search_path = "cr_league";

CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "recoveryCodeHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

ALTER TABLE "teams" ADD COLUMN "profileId" TEXT;

ALTER TABLE "teams" ADD CONSTRAINT "teams_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
