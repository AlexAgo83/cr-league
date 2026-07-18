## task_045_orchestrate_repo_review_remediation_pass_3 - Orchestrate repo review remediation pass 3
> From version: 0.3.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: claude

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Read req_041 and req_043 plus their tasks first; reuse the guarded updateMany and transaction patterns they established.
- [x] 2. Fix the balance script exports and scripts typecheck first so the build is honest before touching runtime code.
- [x] 3. Add League.ownerTeamId with migration and backfill, then tighten requireAdminClaim and cover it with owner/non-owner tests.
- [x] 4. Apply persisted-decision validation and the preview participants cap with shared helpers and route tests.
- [x] 5. Make the three concurrent write paths transactional and idempotent, reusing the resolve claim pattern for next-grand-prix.
- [x] 6. Build the shared Modal component, migrate existing modals, replace the replay scrubber with a native range input, and clamp league-config numeric inputs.
- [x] 7. Add PRNG and reward unit tests.
- [x] 8. Run typecheck, tests, build, lint, and Logics validation; record proof at closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_092_add_league_owner_and_gate_admin_mutations_on_it`
- `item_093_validate_persisted_decisions_and_cap_preview_participants`
- `item_094_make_concurrent_league_write_paths_safe`
- `item_095_fix_balance_script_imports_and_typecheck_scripts_directory`
- `item_096_web_accessibility_and_numeric_input_clamping`
- `item_097_test_prng_determinism_and_reward_math`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.
- request-AC2 -> This task. Proof: apps/api/src/features/leagues/store.ts validateDecisionValues rejects invalid approach/preparation/cardId/rivalTeamId with 400 using shared RACE_APPROACHES/TECHNICAL_PREPARATIONS; apps/api/src/features/simulation/routes.ts caps preview participants at 16; both covered by apps/api/src/app.test.ts.
- request-AC3 -> This task. Proof: apps/api/src/features/leagues/store.ts wraps qualifyingRuns append and bot qualifying in runWrite transactions with in-transaction re-reads, fillLeagueWithBots swallows the unique-constraint conflict (first writer wins), and startNextGrandPrix claims the (leagueId, season, round) unique constraint inside one transaction before spending bot credits; sequential double next-grand-prix covered by apps/api/src/app.test.ts.
- request-AC5 -> This task. Proof: apps/web/src/features/Modal.tsx (focus on open, Escape close, Tab trap, focus restore, no new dependency) migrated across App.tsx and GarageView.tsx; ReplayView.tsx scrubber is a native range input with aria-label and focusable seek markers; createLeague clamps numeric fields via clampNumber in helpers.ts; covered by Modal.test.tsx and helpers.test.ts.
- request-AC7 -> This task. Proof: npm run typecheck (tsc -b && tsc -p scripts), npm test (88 tests, 11 files), npm run build, npm run lint, and npm run logics:validate all passed on 2026-07-18.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- npm run typecheck (tsc -b && tsc -p scripts), npm test (88 tests, 11 files), npm run lint, npm run build all passed on 2026-07-18. League owner gating (403 for non-owner on settings/resolve/next-grand-prix/restart), persisted decision validation (400), preview participants cap, transactional qualifying runs, idempotent bot fill and next-grand-prix, accessible Modal + native range scrubber + clamped inputs, PRNG and reward-math tests all covered by vitest suites.
- Finish workflow executed on 2026-07-18.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-07-18.
- Linked backlog item(s): `item_092_add_league_owner_and_gate_admin_mutations_on_it`, `item_093_validate_persisted_decisions_and_cap_preview_participants`, `item_094_make_concurrent_league_write_paths_safe`, `item_095_fix_balance_script_imports_and_typecheck_scripts_directory`, `item_096_web_accessibility_and_numeric_input_clamping`, `item_097_test_prng_determinism_and_reward_math`
- Related request(s): `req_044_repo_review_remediation_pass_3_league_ownership_robustness_and_web_accessibility`

# AI Context
- Summary: Orchestrate repo review remediation pass 3
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_044_repo_review_remediation_pass_3_league_ownership_robustness_and_web_accessibility`
- Product brief(s): `prod_015_repo_review_remediation_pass_3_product_brief`
- Architecture decision(s): (none yet)
