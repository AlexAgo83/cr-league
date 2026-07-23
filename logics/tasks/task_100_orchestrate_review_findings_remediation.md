## task_100_orchestrate_review_findings_remediation - Orchestrate review-findings remediation
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
- [ ] 1. Do the determinism fix first (prng.ts sort + regression test): it is the highest-severity finding because it silently breaks replay, and its test also guards later weather changes.
- [ ] 2. Resolve positionDelta with an explicit, recorded gameplay decision (feed into classification + balance:sim, or delete the dead field); do not leave it written-but-unread.
- [ ] 3. Make client storage crash-safe with a single safeStorage wrapper and a throwing-storage test.
- [ ] 4. Close the two unauthenticated-surface security gaps: control-char rejection in normalizeEmail and a neutral POST /profiles response.
- [ ] 5. Add @fastify/rate-limit to unauthenticated writes and push where/skip/take into the admin list queries.
- [ ] 6. Make ownerTeamId removal-safe (reassign or fall back) and add validateReplayTrace negative tests.
- [ ] 7. Land the over-engineering cleanup last (extract replayTrace.ts, delete dead exports, unify App modal state) so it rebases cleanly on the fixes above.
- [ ] 8. Run typecheck, test, build, lint, and logics:validate; record proof and the positionDelta decision at closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_235_restore_deterministic_weighted_selection_and_pin_it_with_a_test`
- `item_236_resolve_the_dead_positiondelta_card_effect_accumulator`
- `item_237_make_web_client_storage_access_crash_safe`
- `item_238_close_email_header_injection_and_account_enumeration`
- `item_239_rate_limit_unauthenticated_writes_and_bound_admin_reads`
- `item_240_owner_team_resilience_and_replay_validator_negative_tests`
- `item_241_over_engineering_cleanup_extract_replay_trace_delete_dead_exports_unify_modal_state`

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
- Summary: Orchestrate review-findings remediation
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_099_review_findings_remediation_replay_determinism_dead_card_effects_client_storage_safety_api_security_and_scale_admin_config_integrity_and_over_engineering_cleanup`
- Product brief(s): `prod_062_review_findings_remediation_product_brief`
- Architecture decision(s): (none yet)
