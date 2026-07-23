## task_101_orchestrate_post_remediation_review_fixes - Orchestrate post-remediation review fixes
> From version: 0.4.1
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Do the determinism comparator fix first (prng.ts byte comparator + strengthened test): it silently breaks cross-environment replay and is the highest-severity finding.
- [x] 2. Pin the positionDelta wiring by exporting and unit-testing classificationScore, and align the createReplayTracePoint tiebreak with it.
- [x] 3. Decide and record the account-enumeration posture (Option A recommended) and apply it, keeping signup and the DB guard intact.
- [x] 4. Add the replay-validator negative tests and the multi-seed PRNG determinism test.
- [x] 5. Clean up the test-helper storage invariant, verify the activeModal single-open assumption, and resolve the positionDelta units question.
- [x] 6. Run typecheck, test, lint, and logics:validate; record proof and the enumeration decision at closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_242_restore_cross_environment_determinism_in_weighted_selection`
- `item_243_pin_positiondelta_wiring_and_align_trace_tiebreak_with_classification`
- `item_244_close_the_account_enumeration_oracle_on_profile_creation`
- `item_245_deepen_replay_validator_and_prng_determinism_tests`
- `item_246_resolve_residual_invariant_and_units_assumptions`

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
- request-AC2 -> This task. Proof: `classificationScore` is exported and directly tested; replay elapsed-time ties use `classificationScore`.
- request-AC3 -> This task. Proof: Option A chosen; existing-email profile creation reissues recovery mail under the same cooldown and returns the neutral response while DB duplicate protection remains.
- request-AC5 -> This task. Proof: `App.testHelpers.ts` uses `safeStorage`; `activeModal` is guarded by `openModal` with the documented restart return path; `positionDelta` is documented as a final-score perturbation.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- Implemented byte-stable weighted selection, classificationScore export/test and replay tiebreak alignment, neutral existing-email profile creation reissue, replay validator negative tests, and safeStorage test helper. Verified: targeted vitest 7 files/115 tests passed; npm test 29 passed/1 skipped, 288 passed/7 skipped; npm run typecheck passed; npm run lint passed; npm run logics:validate passed with non-blocking warnings.
- Finish workflow executed on 2026-07-23.
- Linked backlog/request close verification passed.

# Report
- Implemented task_101. Option A chosen for account enumeration: existing-email `POST /profiles` reuses the recovery-code path and returns the neutral body, matching recovery-code behavior without weakening the DB duplicate guard.
- Active modal audit: all open sites route through `openModal`, which ignores new opens while a modal is active; only restart from league controls records `modalReturnRef` and intentionally returns to the controls modal.
- Validation proof: targeted vitest passed 7 files/115 tests; `npm test` passed 29 files/288 tests with existing skips; `npm run typecheck`, `npm run lint`, and `npm run logics:validate` passed.
- Finished on 2026-07-23.
- Linked backlog item(s): `item_242_restore_cross_environment_determinism_in_weighted_selection`, `item_243_pin_positiondelta_wiring_and_align_trace_tiebreak_with_classification`, `item_244_close_the_account_enumeration_oracle_on_profile_creation`, `item_245_deepen_replay_validator_and_prng_determinism_tests`, `item_246_resolve_residual_invariant_and_units_assumptions`
- Related request(s): `req_100_post_remediation_review_fixes_replay_determinism_comparator_positiondelta_test_tiebreak_coherence_account_enumeration_neutrality_and_replay_validator_prng_test_depth`

# AI Context
- Summary: Orchestrate post-remediation review fixes
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_100_post_remediation_review_fixes_replay_determinism_comparator_positiondelta_test_tiebreak_coherence_account_enumeration_neutrality_and_replay_validator_prng_test_depth`
- Product brief(s): `prod_063_post_remediation_review_fixes_product_brief`
- Architecture decision(s): (none yet)
