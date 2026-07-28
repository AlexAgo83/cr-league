## task_131_orchestrate_repo_review_remediation_pass_7 - Orchestrate repo review remediation pass 7
> From version: 0.6.0
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 95
> Progress: 100
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Non-semantic edit: Noted that v0.6.0 is live in production and item_344's exposure is already real, not just future risk; no scope or plan change.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.
- v0.6.0 is live in production (https://cr-league-api.onrender.com). `item_344` (hash team claimCode) is not a preventive fix for a future risk — real leagues/teams created since that release already have plaintext claimCode rows in the production database today. Treat `item_344` as High priority and validate its migration against production-shaped data, not only against fresh test rows.

# Plan
- [x] 1. Land the DB index slice first — it is independent, low-risk, and quick. (`item_335` Done: schema `@@index([leagueId])` on `Team`/`GrandPrix` + migration `20260728160000_add_league_id_indexes`; typecheck and full suite green.)
- [x] 2. Land the testMemoryDb select-fix slice, then the broader testMemoryDb hardening slice that depends on it (in that order — the hardening slice reuses the select-fix slice's shared helper). (`item_336` and `item_337` Done: shared `applySelect` helper, include gating on `team`/`league`/`profile` finders, relation `take`, real deleteMany counts, all pinned by `apps/api/src/testMemoryDb.test.ts`.)
- [x] 3. Land the 0.6 E2E coverage slice and the coverage-threshold-margin slice in parallel with the above; they are independent of the testMemoryDb and DB-index work. (`item_338` and `item_339` Done: E2E now 7 scenarios covering Race direction, variable shop, and team profiles; branch coverage 80.83% -> 81.72%.)
- [x] 4. Land the standings/rival code-move, the admin/store.ts rename, and the lifecycle.ts split as a code-organization batch — each is independent of the others but all three touch widely-imported modules, so run the full test suite after each one individually rather than batching all three changes before testing. (`item_340`, `item_341`, `item_342` Done, one commit each, full suite run after each.)
- [x] 5. Land the admin rate-limiting slice (quick, independent). (`item_343` Done: `ADMIN_RATE_LIMIT` 20/min on all six admin routes, reads included; also throttles token guessing since the limit runs on `onRequest`.)
- [x] 6. Land the claimCode hashing slice last among the required work — it is the highest-effort and highest-risk slice (schema migration, backward compatibility) and benefits from every other slice's test-suite hardening already being in place. (`item_344` Done: `claimCodeHash` column, single `verifyTeamClaimCode` path, legacy accept-once-then-upgrade, validated on a real Postgres via the integration lane.)
- [x] 7. Land the E2E data-testid slice, and evaluate (and land only if justified) the CI-retries slice. (`item_345` Done; `item_346` closed as *not done on purpose* — 100 CI runs show zero same-SHA pass/fail, so no retries were added.)
- [x] 8. Run npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, and npm run logics:validate after the full set of slices; record proof at closeout. (See Validation below.)
- [x] 9. Keep commits scoped per slice (or per small related group of slices) rather than one giant commit, so each change is independently reviewable and revertible. (Eleven commits, one per slice plus the roadmap sync.)
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready. (Each slice's backlog doc was closed with its own notes in the same commit as the code.)
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass. (`logics-manager lint --require-status` OK, `audit --group-by-doc` OK, `npm run logics:validate` OK.)

# Backlog
- `item_335_add_missing_leagueid_indexes_on_team_and_grandprix`
- `item_336_fix_testmemorydb_s_silent_select_handling`
- `item_337_harden_testmemorydb_against_further_include_mutation_count_drift`
- `item_338_add_e2e_coverage_for_the_0_6_corpus_s_highest_risk_flows`
- `item_339_raise_branch_coverage_on_weak_replay_timing_files`
- `item_340_move_standings_rival_derivation_logic_into_packages_shared`
- `item_341_rename_admin_store_ts_to_reflect_its_actual_content`
- `item_342_split_lifecycle_ts_by_responsibility`
- `item_343_rate_limit_all_admin_routes`
- `item_344_hash_team_claimcode_at_rest_with_a_backward_compatible_migration`
- `item_345_replace_hardcoded_e2e_copy_assertions_with_data_testid`
- `item_346_add_ci_only_playwright_retries_if_flakiness_is_evidenced`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> `item_335`. Proof: `@@index([leagueId])` on `Team` and `GrandPrix` in `prisma/schema.prisma`, backed by migration `20260728160000_add_league_id_indexes`; no query or behaviour change.
- request-AC2 -> `item_336`. Proof: one shared `applySelect(row, select)` helper in `apps/api/src/testMemoryDb.ts`, used by `grandPrix.findMany` (the broken call site), `grandPrix.findFirst`, `raceDecision.findMany`, and `team.findUnique`; pinned by `apps/api/src/testMemoryDb.test.ts`.
- request-AC3 -> `item_337`. Proof: `include` is now gated on `team.findUnique`, `league.findUnique` (teams and grandPrixes, with relation `take` honoured), and `profile.findUnique`; `grandPrix.deleteMany` and `raceDecision.deleteMany` return real affected-row counts. Tests in `testMemoryDb.test.ts`.
- request-AC4 -> `item_338`. Proof: three new Playwright scenarios (7 total, all green) — the commissioner Race direction screen with a working reminder action and its one-send-per-season lock, league creation with variable shop mode showing a 6-card shop, and the team profile modal opened from standings.
- request-AC5 -> `item_339`. Proof: added tests for `replayMoment.ts`, `ReplayProgress.tsx`, and `useReplayClock.ts`; repo-wide branch coverage 80.83% -> 81.72% against the 80% threshold, so the margin is no longer within 1 point.
- request-AC6 -> `item_340`. Proof: `seasonStandings` and the renamed `standingsRival` live in `packages/shared/src/domain/standings.ts`, re-exported from `apps/web/src/app/helpers.ts`; cross-reference comments on both `RaceDecision.rivalTeamId` (shared type + `prisma/schema.prisma`) and `standingsRival()`.
- request-AC7 -> `item_341`. Proof: `apps/api/src/features/admin/store.ts` renamed to `adminData.ts` via `git mv`, its single importer updated, contents unchanged.
- request-AC8 -> `item_342`. Proof: `lifecycle.ts` 671 -> 375 lines, split into `leagueState.ts`, `teamAdmin.ts`, `reminders.ts`, and `visibility.ts`; `store.ts`'s external re-export surface is unchanged and every internal call site was repointed.
- request-AC9 -> `item_343`. Proof: `ADMIN_RATE_LIMIT` (20/min) on all six routes in `apps/api/src/features/admin/routes.ts`, reads included; a test proves both the token-guessing 429 and an authenticated read being limited.
- request-AC10 -> `item_344`. Proof: `Team.claimCodeHash` (migration `20260728170000_hash_team_claim_code`); creation and join store hash-only, `verifyTeamClaimCode` verifies through the timing-safe `verifyRecoveryCode`, and pre-migration plaintext rows are accepted once then upgraded. Validated against a real Postgres in the integration lane (9 passed) plus `apps/api/src/features/leagues/teamClaim.test.ts`.
- request-AC11 -> `item_345`. Proof: navigation, profile menu, dialogs, and modal confirm/close use `data-testid`; tabs reuse the pre-existing `data-section-tab`. Only one copy-named dialog locator remains, and it asserts copy on purpose.
- request-AC12 -> `item_346`. Proof: **no retries added** — `gh run list --limit 100 --workflow CI` shows zero commits with both a pass and a fail on the same SHA; every failure is a deterministic one (the parked Dependabot majors). Evidence recorded on the backlog doc.
- request-AC13 -> This task. Proof: see Validation below.

# Validation
Run at closeout on 2026-07-28, all green:
- `npm run typecheck`
- `npm run lint`
- `npm test` — 405 passed, 9 skipped (was 373 passed, 7 skipped at the start of the pass)
- `npx vitest run --coverage` — branches 81.72% against the 80% threshold
- `npm run build`
- `npm run test:e2e` — 7 passed (was 4)
- `POSTGRES_INTEGRATION=1 DATABASE_URL=... npx vitest run apps/api/src/app.postgres.test.ts` — 9 passed, including the two new claim-code migration cases
- `npm run balance:gate` — exit 0
- `npm run logics:validate`, `logics-manager lint --require-status`, `logics-manager audit --group-by-doc` — OK

# Report
- All 12 slices are Done. Eleven scoped commits, one per slice, each with the full test suite run before commit.
- `item_346` is Done as a deliberate **no-op**: the CI evidence did not justify Playwright retries, and that is recorded rather than silently skipped.
- Two things worth carrying forward:
  - `item_344` does not force-backfill production: existing rows keep their plaintext claim code until each team claims once, since the plaintext is the only input that can produce the hash. Clearing that residue would mean invalidating and re-issuing codes — a separate decision.
  - `item_339` raised the coverage margin to 1.72 points, which meets its AC, but further margin needs files this slice's scope excluded (`pwa.ts` 23% branch, `adminActions.ts` 42%, `mailer.ts` 43%, several `*Actions.ts` at 50-63%). A follow-up coverage slice could take those.

# AI Context
- Summary: Orchestrate repo review remediation pass 7
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_130_repo_review_remediation_pass_7_db_indexes_test_fake_drift_0_6_e2e_coverage_code_organization_and_admin_session_hardening`
- Product brief(s): `prod_082_repo_review_remediation_pass_7_product_brief`
- Architecture decision(s): (none yet)
