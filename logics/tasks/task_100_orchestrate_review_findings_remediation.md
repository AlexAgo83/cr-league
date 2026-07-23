## task_100_orchestrate_review_findings_remediation - Orchestrate review-findings remediation
> From version: 0.4.1
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Non-semantic edit: 2026-07-23 corpus grooming note added; no status/progress change.
> Semantic edit: 2026-07-23 replaced scaffold-generic DoD, AC traceability, validation, and report text with implementation-specific delivery guidance.
> Owner: codex

# Context
- Orchestrate the 2026-07-23 repo-review remediation pass for release 0.4.1.
- Prioritize correctness and security before cleanup: replay determinism and `positionDelta` honesty are the highest product-risk items, while the client/API hardening protects beta operations.

# Plan
- [x] 1. Do the determinism fix first (prng.ts sort + regression test): it is the highest-severity finding because it silently breaks replay, and its test also guards later weather changes.
- [x] 2. Resolve positionDelta with an explicit, recorded gameplay decision (feed into classification + balance:sim, or delete the dead field); do not leave it written-but-unread.
- [x] 3. Make client storage crash-safe with a single safeStorage wrapper and a throwing-storage test.
- [x] 4. Close the two unauthenticated-surface security gaps: control-char rejection in normalizeEmail and a neutral POST /profiles response.
- [x] 5. Add @fastify/rate-limit to unauthenticated writes and push where/skip/take into the admin list queries.
- [x] 6. Make ownerTeamId removal-safe (reassign or fall back) and add validateReplayTrace negative tests.
- [x] 7. Land the over-engineering cleanup last (extract replayTrace.ts, delete dead exports, unify App modal state) so it rebases cleanly on the fixes above.
- [x] 8. Run typecheck, test, build, lint, and logics:validate; record proof and the positionDelta decision at closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_235_restore_deterministic_weighted_selection_and_pin_it_with_a_test`
- `item_236_resolve_the_dead_positiondelta_card_effect_accumulator`
- `item_237_make_web_client_storage_access_crash_safe`
- `item_238_close_email_header_injection_and_account_enumeration`
- `item_239_rate_limit_unauthenticated_writes_and_bound_admin_reads`
- `item_240_owner_team_resilience_and_replay_validator_negative_tests`
- `item_241_over_engineering_cleanup_extract_replay_trace_delete_dead_exports_unify_modal_state`

# Definition of Done (DoD)
- [x] Weighted selection determinism is restored and covered by a regression test.
- [x] The `positionDelta` decision is recorded here, implemented consistently, and validated with `balance:sim` if it affects classification.
- [x] Web storage, unauthenticated profile/email handling, route rate limiting, admin pagination/filtering, owner-team resilience, and replay-trace negative tests are implemented.
- [x] Cosmetic replay-trace helpers are extracted, dead exports removed, and modal state simplified without unrelated UI changes.
- [x] Typecheck, tests, build, lint, and Logics validation pass.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `packages/shared/src/simulation/prng.test.ts` covers key-order-independent weighted selection.
- request-AC2 -> This task. Proof: `packages/shared/src/simulation/simulateRace.ts` uses `classificationScore = score + positionDelta`; decision recorded in Notes; `npm run balance:sim -- --runs 5 --circuits 3 --limit 5` passed.
- request-AC3 -> This task. Proof: `apps/web/src/app/appStorage.ts` centralizes `safeStorage`; `apps/web/src/app/appStorage.test.ts` stubs throwing storage.
- request-AC4 -> This task. Proof: `apps/api/src/features/leagues/utils.test.ts` covers whitespace/control rejection; `apps/api/src/app.admin.test.ts` covers neutral profile creation and duplicate response.
- request-AC5 -> This task. Proof: `apps/api/src/features/leagues/routes.ts` adds write route rate limits; `apps/api/src/features/admin/store.ts` uses Prisma where/skip/take; API tests cover rate limit and admin paging.
- request-AC6 -> This task. Proof: `apps/api/src/features/leagues/store.ts` repairs stale owners; `apps/api/src/app.admin.test.ts` covers owner repair; `packages/shared/src/simulation/validateReplayTrace.test.ts` covers negative replay errors.
- request-AC7 -> This task. Proof: `packages/shared/src/simulation/replayTrace.ts` contains replay facts/event trace helpers; dead API exports removed from utils; `apps/web/src/app/App.tsx` uses `activeModal`.
- request-AC8 -> This task. Proof: validation commands below passed.

# Validation
- PASS 2026-07-23: `npm run typecheck`.
- PASS 2026-07-23: `npm test` (29 files passed, 1 skipped; 283 tests passed, 7 skipped).
- PASS 2026-07-23: `npm run build`.
- PASS 2026-07-23: `npm run lint`.
- PASS 2026-07-23: `npm run balance:sim -- --runs 5 --circuits 3 --limit 5`.
- PASS 2026-07-23: `npm run logics:validate` (lint OK; audit OK with deferred closeout warnings before this proof update).
- Implemented and validated review remediation. Passing proof: npm run typecheck; npm test; npm run build; npm run lint; npm run balance:sim -- --runs 5 --circuits 3 --limit 5; npm run logics:validate.
- Finish workflow executed on 2026-07-23.
- Linked backlog/request close verification passed.

# Report
- Delivered all seven remediation slices. `positionDelta` is kept as a real gameplay effect and included in classification scoring, preserving card promises while keeping replay/time movement unchanged for this pass.
- Finished on 2026-07-23.
- Linked backlog item(s): `item_235_restore_deterministic_weighted_selection_and_pin_it_with_a_test`, `item_236_resolve_the_dead_positiondelta_card_effect_accumulator`, `item_237_make_web_client_storage_access_crash_safe`, `item_238_close_email_header_injection_and_account_enumeration`, `item_239_rate_limit_unauthenticated_writes_and_bound_admin_reads`, `item_240_owner_team_resilience_and_replay_validator_negative_tests`, `item_241_over_engineering_cleanup_extract_replay_trace_delete_dead_exports_unify_modal_state`
- Related request(s): `req_099_review_findings_remediation_replay_determinism_dead_card_effects_client_storage_safety_api_security_and_scale_admin_config_integrity_and_over_engineering_cleanup`

# AI Context
- Summary: Orchestrate review-findings remediation
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_099_review_findings_remediation_replay_determinism_dead_card_effects_client_storage_safety_api_security_and_scale_admin_config_integrity_and_over_engineering_cleanup`
- Product brief(s): `prod_062_review_findings_remediation_product_brief`
- Architecture decision(s): (none yet)

# Notes
- 2026-07-23 wave 1 decision: keep positionDelta as a real gameplay effect by folding it into the final classification score. This preserves existing card promises instead of deleting exposed effects; targeted PRNG/simulation tests pass.
