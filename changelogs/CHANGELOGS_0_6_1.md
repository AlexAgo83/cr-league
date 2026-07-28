# CR League 0.6.1
Release date: 2026-07-28

Maintenance release from the post-v0.6.0 whole-repo review (`req_130` / `task_131`, "repo review remediation pass 7"). No user-visible feature or gameplay change.

## Security
- Team claim codes are now hashed at rest. New teams and joins only ever persist a scrypt hash; verification goes through the existing timing-safe compare instead of a plaintext string comparison.
- Teams created before this release keep working: their plaintext claim code is accepted once, then the row is immediately rewritten to hash-only storage. Validated against a real Postgres, not only the in-memory test fake.
- Every route under `/admin` is now rate-limited (20 requests/minute), reads included. The limit runs before the admin-token check, so it also throttles repeated `Authorization` guesses.

## Changed
- Added the missing `leagueId` indexes on `Team` and `GrandPrix`, the most common query filter across the API.
- Moved season standings and the implied-rival derivation into `packages/shared`, re-exported from the web app so no import path changed. The derived rival is now named `standingsRival`, distinct from the explicitly chosen `RaceDecision.rivalTeamId`, and both carry cross-referencing comments.
- Split `apps/api/src/features/leagues/lifecycle.ts` (671 lines) into focused modules by responsibility: season lifecycle, league read model, team admin, reminders, and visibility. The public re-export surface is unchanged.
- Renamed `apps/api/src/features/admin/store.ts` to `adminData.ts`; it holds real business logic and no longer collides with the `store.ts` barrel convention used by the leagues feature.

## Fixed
- Fixed the in-memory Prisma test fake silently ignoring `select`, over-attaching `include` relations, ignoring a relation `take`, and returning hardcoded zero affected-row counts. This class of drift had already hidden one real bug.

## Notes
- Database migrations in this release: `20260728160000_add_league_id_indexes` (two indexes) and `20260728170000_hash_team_claim_code` (one nullable column, no backfill). Both are additive.
- Existing teams keep a plaintext claim code in the database until they next claim; the plaintext is the only input that can produce the hash, so there is no forced backfill. Whether to invalidate and re-issue the codes that never self-upgrade is a separate decision.
- Test coverage: unit suite 373 -> 405 tests, Playwright suite 4 -> 7 scenarios (commissioner Race direction, variable shop mode, team profiles), repo-wide branch coverage 80.83% -> 81.72%.
- Evaluated and intentionally not implemented: CI-only Playwright retries. 100 CI runs show zero commits with both a pass and a failure on the same SHA, so there is no flakiness to absorb.
