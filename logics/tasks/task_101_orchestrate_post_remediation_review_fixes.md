## task_101_orchestrate_post_remediation_review_fixes - Orchestrate post-remediation review fixes
> From version: 0.4.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Do the determinism comparator fix first (prng.ts byte comparator + strengthened test): it silently breaks cross-environment replay and is the highest-severity finding.
- [ ] 2. Pin the positionDelta wiring by exporting and unit-testing classificationScore, and align the createReplayTracePoint tiebreak with it.
- [ ] 3. Decide and record the account-enumeration posture (Option A recommended) and apply it, keeping signup and the DB guard intact.
- [ ] 4. Add the replay-validator negative tests and the multi-seed PRNG determinism test.
- [ ] 5. Clean up the test-helper storage invariant, verify the activeModal single-open assumption, and resolve the positionDelta units question.
- [ ] 6. Run typecheck, test, lint, and logics:validate; record proof and the enumeration decision at closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_242_restore_cross_environment_determinism_in_weighted_selection`
- `item_243_pin_positiondelta_wiring_and_align_trace_tiebreak_with_classification`
- `item_244_close_the_account_enumeration_oracle_on_profile_creation`
- `item_245_deepen_replay_validator_and_prng_determinism_tests`
- `item_246_resolve_residual_invariant_and_units_assumptions`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.

# Report
- Implementation complete.

# AI Context
- Summary: Orchestrate post-remediation review fixes
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_100_post_remediation_review_fixes_replay_determinism_comparator_positiondelta_test_tiebreak_coherence_account_enumeration_neutrality_and_replay_validator_prng_test_depth`
- Product brief(s): `prod_063_post_remediation_review_fixes_product_brief`
- Architecture decision(s): (none yet)
