ALTER TABLE "profiles" ADD COLUMN "sessionCredentialHash" TEXT;

ALTER TABLE "teams" ADD COLUMN "sessionClaimCodeHash" TEXT;
