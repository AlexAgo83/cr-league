## item_344_hash_team_claimcode_at_rest_with_a_backward_compatible_migration - Hash team claimCode at rest with a backward-compatible migration
> From version: 0.6.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 95
> Progress: 100
> Complexity: High
> Theme: Security hardening
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Non-semantic edit: Raised priority to High and noted that production already holds plaintext claimCode rows since v0.6.0 shipped; no scope or AC change.

# Problem
- Team.claimCode (prisma/schema.prisma, the Team model) is stored and compared in plaintext (apps/api/src/features/leagues/transactionHelpers.ts, requireTeamClaim, and its use in apps/api/src/features/leagues/utils.ts / lifecycle.ts wherever teams are created/joined), unlike sessionClaimCodeHash and recoveryCodeHash, which are already hashed. A database dump or backup leak exposes every team's claim code directly, with no hash protecting it.
- This is not theoretical: v0.6.0 is live in production (https://cr-league-api.onrender.com), so real leagues and teams created since that release already have plaintext claimCode rows sitting in the production database today. The migration below must be run against that real, already-populated production data, not just against hypothetical "existing rows" — validate the legacy-upgrade path against production-shaped data before considering this closed.
- This is the highest-effort, highest-risk slice in this corpus: it requires a schema migration and must not break claim/recovery flows for teams already created before the migration runs, since those existing rows will have no hash to verify against.

# Scope
- In:
  - Add a claimCodeHash column to the Team model via a Prisma migration, following this repo's existing hand-authored migration.sql convention.
  - At team creation and join time, generate the plaintext claimCode as today, but store only its hash (using the same hashing helper already used for sessionClaimCodeHash/recoveryCodeHash), returning the plaintext to the caller exactly once in the creation/join response — mirroring the existing recovery-code pattern already used elsewhere in this codebase.
  - Update requireTeamClaim (and any other claimCode verification path) to verify against the hash using the existing timing-safe compare helper, instead of the current plaintext `!==` comparison.
  - Handle pre-migration rows explicitly: since existing teams have no claimCodeHash yet, follow the same legacy-upgrade pattern this codebase already uses in verifyRecoveryCode — accept a legacy plaintext match once (if a legacy plaintext claimCode column/value is still present), then immediately upgrade that row to store only the hash going forward. Do not silently lock out existing saved leagues.
  - Add tests covering: a freshly created team's claim only works via the hash path, a pre-migration-style team (no hash, plaintext code) still successfully claims once and is upgraded to a hash afterward, and a wrong claim code is rejected in both cases.
- Out:
  - Reworking the broader session/auth model beyond this one field.
  - Deprecating or removing claimCode as a concept in favor of session credentials — that is a larger, separate decision not in scope here.
  - Any change to recoveryCodeHash or sessionClaimCodeHash, which are already correctly hashed.

# Acceptance criteria
- AC1: Team.claimCode is no longer stored in plaintext for any newly created or newly claimed team; only claimCodeHash is persisted going forward.
- AC2: Existing pre-migration teams can still successfully claim exactly once via a legacy plaintext match, and are upgraded to hash-only storage immediately after that successful claim.
- AC3: Claim verification uses the existing timing-safe hash-compare helper, not a plaintext string comparison.
- AC4: Tests cover fresh-team claim, legacy-team claim-and-upgrade, and wrong-code rejection for both cases.
- AC5: No existing saved-league claim flow test regresses.

# AC Traceability
- request-AC10 -> This backlog slice. Proof: AC1: Team.claimCode is no longer stored in plaintext for any newly created or newly claimed team; only claimCodeHash is persisted going forward.
- request-AC13 -> This backlog slice. Proof: AC2: Existing pre-migration teams can still successfully claim exactly once via a legacy plaintext match, and are upgraded to hash-only storage immediately after that successful claim.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_082_repo_review_remediation_pass_7_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_130_repo_review_remediation_pass_7_db_indexes_test_fake_drift_0_6_e2e_coverage_code_organization_and_admin_session_hardening`
- Primary task(s): `task_131_orchestrate_repo_review_remediation_pass_7`

# AI Context
- Summary: Hash team claimCode at rest with a backward-compatible migration
- Keywords: scaffolded-backlog, hash team claimcode at rest with a backward-compatible migration, implementation-ready
- Use when: Implementing the scaffolded slice for Hash team claimCode at rest with a backward-compatible migration.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: v0.6.0 is already deployed to production, so plaintext claimCode rows already exist in the live database — this is a present exposure, not a future one.

# Notes
- Done: `Team.claimCodeHash` added (migration `20260728170000_hash_team_claim_code`, one nullable column, no backfill). Team creation and league join now store `claimCode: null` plus a scrypt hash of the generated code; the plaintext is never written and was already never returned (both flows hand the client a session credential instead), so no response shape changed.
- New `verifyTeamClaimCode(db, team, code)` in `utils.ts` is the single verification path, used by `requireTeamClaim` and `rejoinLeague`. It checks `claimCodeHash` via the existing timing-safe `verifyRecoveryCode`; the plaintext `!==` comparisons and their two `ponytail:` comments are gone.
- Legacy upgrade: a pre-migration row (plaintext `claimCode`, `claimCodeHash` NULL) is matched once via `verifyRecoveryCode(code, hashLegacyRecoveryCode(team.claimCode))` — timing-safe, same helper as the recovery-code legacy path — then the row is rewritten to `claimCode: null` + hash. A wrong code leaves the row untouched. `claimCode` stays `@unique` and nullable; Postgres allows many NULLs, so nulling upgraded rows is safe.
- Production-shaped validation: two tests were added to the **Postgres integration lane** (`app.postgres.test.ts`), not just the in-memory fake — they run `prisma migrate deploy` against a real Postgres, force a team row into the pre-migration shape, and assert wrong-code rejection without upgrade, one successful legacy claim, the row upgrade to `scrypt$...`, and continued access afterwards. Run: `POSTGRES_INTEGRATION=1 DATABASE_URL=... npx vitest run apps/api/src/app.postgres.test.ts` — 9 passed.
- Unit coverage in `apps/api/src/features/leagues/teamClaim.test.ts`: fresh team stores hash only, hashed verify accept/reject, legacy accept-then-upgrade, legacy wrong-code no-upgrade, legacy rejoin through the real endpoint.
- Operational note: existing production rows keep their plaintext value until each team claims once. There is no forced backfill, by design — the plaintext is the only thing that can produce the hash. Rows that never claim again stay plaintext; if that residue needs clearing, it is a separate decision (invalidate and re-issue), not part of this slice.
- Typecheck, lint, full suite (385 passed, 7 skipped), and the Postgres lane all green.
