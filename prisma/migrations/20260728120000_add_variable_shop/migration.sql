ALTER TABLE "leagues"
  ADD COLUMN "variableShop" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "grand_prixes"
  ADD COLUMN "shopCardIds" JSONB NOT NULL DEFAULT '[]';
