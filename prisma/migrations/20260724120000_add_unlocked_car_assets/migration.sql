SET search_path = "cr_league";

ALTER TABLE "teams" ADD COLUMN "unlockedCarAssetIds" JSONB NOT NULL DEFAULT '[]';

UPDATE "teams"
SET
  "unlockedCarAssetIds" = CASE
    WHEN COALESCE("livery"->>'carAssetId', 'car-008') IN (
      'car-008', 'car-009', 'car-010', 'car-011', 'car-012', 'car-013', 'car-014', 'car-015', 'car-016'
    )
      THEN jsonb_build_array(COALESCE("livery"->>'carAssetId', 'car-008'))
    ELSE '[]'::jsonb
  END,
  "livery" = CASE
    WHEN NOT ("livery" ? 'carAssetId') THEN jsonb_set("livery", '{carAssetId}', '"car-008"'::jsonb, true)
    ELSE "livery"
  END;
