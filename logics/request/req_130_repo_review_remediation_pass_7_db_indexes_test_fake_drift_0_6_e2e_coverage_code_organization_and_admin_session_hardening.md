## req_130_repo_review_remediation_pass_7_db_indexes_test_fake_drift_0_6_e2e_coverage_code_organization_and_admin_session_hardening - Repo review remediation pass 7: DB indexes, test-fake drift, 0.6 E2E coverage, code organization, and admin/session hardening
> From version: 0.6.0
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Repo review remediation
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Add the missing leagueId indexes on Team and GrandPrix so the most common query path is indexed.
- Stop testMemoryDb.ts (the hand-rolled in-memory Prisma test fake) from silently diverging from real Prisma include/select/mutation-count semantics, since that drift already hid one real bug this session.
- Add targeted Playwright E2E coverage for the highest-risk 0.6 flows that currently have zero E2E coverage: commissioner Race direction, variable shop mode, and team profiles.
- Raise branch coverage on the specific files propping up a coverage threshold that is currently within 1 point of failing CI on unrelated PRs.
- Move stranded pure domain logic (season standings, rival derivation) from the web app into packages/shared, and stop the derived-rival and explicit-rival concepts from being confusable.
- Remove two code-organization traps a new contributor or another AI agent would fall into: a misleading store.ts filename collision between the leagues and admin features, and a 671-line lifecycle.ts mixing unrelated responsibilities.
- Close two hardening gaps: unrate-limited admin routes, and a plaintext-at-rest team claim code.
- Reduce E2E fragility from hardcoded UI copy assertions, and add CI-only Playwright retries if justified.

# Context
- Every item below is an independent, narrowly-scoped slice meant to be picked up and implemented by another AI agent with no context beyond its own backlog doc — do not assume the implementing agent has read the review conversation that produced this corpus.
- The testMemoryDb.ts fix (fix the select-shape bug) must land before the broader testMemoryDb hardening pass, since the hardening pass reuses the same shared include/select-respecting helper. Sequence: fix first, harden second.
- The claimCode hashing item is the highest-effort, highest-risk slice in this corpus: it needs a Prisma migration and must not break existing saved-league claim flows for teams created before the migration. Follow the same legacy-upgrade pattern this codebase already uses for verifyRecoveryCode (accept a legacy plaintext match once, then upgrade the stored value to a hash) rather than inventing a new migration strategy.
- The lifecycle.ts split and the standings/rival move both touch widely-imported modules; each must keep every existing call site working (update every import) and run the full test suite (unit, integration, e2e) before considering the slice done, not just typecheck.
- The CI-retries item is explicitly optional/low-priority: only add Playwright retries if the implementing agent finds evidence of actual flakiness in recent CI runs (e.g. `gh run list` history showing intermittent failures on the same commit); if no such evidence exists, note that in the report and skip the change rather than adding retries speculatively.
- This is an internal engineering-quality corpus, not a user-facing feature: no product design, no new user-visible copy beyond what a code-organization or coverage change incidentally requires.

# Acceptance criteria
- AC1: Team and GrandPrix models have @@index([leagueId]) in prisma/schema.prisma, backed by a Postgres migration, with no behavior change.
- AC2: testMemoryDb.ts's fake Prisma methods respect a requested `select` shape via one shared helper, not just the currently-broken grandPrix.findMany call site.
- AC3: testMemoryDb.ts's `include` handling and deleteMany/updateMany affected-row counts match real Prisma semantics for every method exercised by the existing test suite.
- AC4: Playwright E2E covers, with real assertions beyond visibility: clicking into the commissioner Race direction screen and verifying the reminder action, creating a league with variable shop mode enabled and verifying the shop UI reflects it, and opening a team profile modal from standings.
- AC5: apps/web/src/features/replay/ReplayProgress.tsx, packages/shared/src/simulation/replayMoment.ts, and apps/web/src/app/useReplayClock.ts have added unit tests raising their branch coverage, and the repo-wide branch coverage is no longer within 1 percentage point of the enforced vitest.config.ts threshold.
- AC6: seasonStandings and rival-derivation logic live in packages/shared (re-exported from apps/web/src/app/helpers.ts for back-compat), the derived-rival naming is distinct from RaceDecision.rivalTeamId, and a code comment cross-references the two concepts.
- AC7: apps/api/src/features/admin/store.ts is renamed to reflect its actual content, every import across the codebase is updated, and behavior is unchanged.
- AC8: apps/api/src/features/leagues/lifecycle.ts is split into focused files by responsibility (season lifecycle, team admin, reminders, visibility) with no behavior change and every existing call site and test still passing.
- AC9: Every route under /admin in apps/api/src/features/admin/routes.ts is rate-limited.
- AC10: Team claimCode is hashed at rest with a safe migration path for pre-existing rows (legacy plaintext match once, then upgrade to hash, mirroring verifyRecoveryCode's existing pattern), verified via the existing timing-safe hash-compare helper, and the plaintext value is only ever returned once at team-creation/join response time.
- AC11: tests/e2e/private-league.spec.ts's structural/navigational locators use data-testid instead of translated copy, except where a test specifically verifies that a translation/copy string renders.
- AC12: playwright.config.ts has CI-only retries added only if the implementing agent found evidence of real flakiness, with that evidence (or its absence) recorded in the closeout report.
- AC13: npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, and npm run logics:validate all pass after implementation of each slice.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_082_repo_review_remediation_pass_7_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- logics/request/req_129_0_6_beta_season_lifecycle_and_league_management_private_seasons_commissioner_tools_actionability_rivals_team_identity_and_optional_economy_variants.md
- prisma/schema.prisma
- apps/api/src/testMemoryDb.ts
- apps/api/src/features/leagues/lifecycle.ts
- apps/api/src/features/leagues/transactionHelpers.ts
- apps/api/src/features/leagues/utils.ts
- apps/api/src/features/admin/store.ts
- apps/api/src/features/admin/routes.ts
- apps/web/src/app/helpers.ts
- apps/web/src/features/replay/ReplayProgress.tsx
- packages/shared/src/simulation/replayMoment.ts
- apps/web/src/app/useReplayClock.ts
- tests/e2e/private-league.spec.ts
- playwright.config.ts
- vitest.config.ts
- A whole-repo review after the v0.6.0 release surfaced independent architecture, security, and test/CI-quality gaps. DB: Team (schema.prisma:52) and GrandPrix (schema.prisma:78) have no @@index([leagueId]) despite it being the most common query filter (getLeagueState, getCurrentGrandPrix). Test fake drift: testMemoryDb.ts's grandPrix.findMany ignores `select` entirely (called with select from lifecycle.ts:203-206), masking real over-fetch/data-leak bugs; separately team.findUnique always attaches `league` regardless of `include`, and several deleteMany/updateMany methods hardcode `{ count: 0 }`. E2E: tests/e2e/private-league.spec.ts has zero coverage of the just-shipped 0.6 corpus (variable shop, rival thread, card guidance, team profiles); the commissioner Race direction button is only asserted visible, never clicked. Coverage: vitest.config.ts's branch threshold is 80% against a measured 80.65%, propped up by apps/web/src/features/replay/ReplayProgress.tsx (~50% branch), packages/shared/src/simulation/replayMoment.ts (~35% branch), and apps/web/src/app/useReplayClock.ts (~60% branch). Code organization: seasonStandings/derivedRivalForTeam (apps/web/src/app/helpers.ts:129,179) are pure domain logic stranded in the web app instead of packages/shared, and conflate with the unrelated explicit RaceDecision.rivalTeamId concept with no cross-reference; apps/api/src/features/admin/store.ts (196 lines of real business logic) shares a filename with apps/api/src/features/leagues/store.ts (a pure re-export barrel), misleading contributors; apps/api/src/features/leagues/lifecycle.ts is 671 lines / 18 exports mixing season lifecycle, team admin, reminders, and visibility rules. Security/hardening: /admin/* routes (admin/routes.ts) have no rate limiting unlike league write routes (WRITE_RATE_LIMIT, 30/min); Team.claimCode is stored and compared in plaintext (transactionHelpers.ts, requireTeamClaim) unlike the already-hashed sessionClaimCodeHash/recoveryCodeHash. CI hygiene: tests/e2e/private-league.spec.ts hard-asserts exact UI copy dozens of times and already broke once this session on a button rename (League controls -> Race direction); playwright.config.ts has no retries configured.

# AI Context
- Summary: Repo review remediation pass 7: DB indexes, test-fake drift, 0.6 E2E coverage, code organization, and admin/session hardening
- Keywords: request-chain-scaffold, repo review remediation pass 7: db indexes, test-fake drift, 0.6 e2e coverage, code organization, and admin/session hardening, development-ready
- Use when: You need to implement or review the scaffolded workflow for Repo review remediation pass 7: DB indexes, test-fake drift, 0.6 E2E coverage, code organization, and admin/session hardening.
- Skip when: The change is unrelated to this scaffolded request chain.

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
