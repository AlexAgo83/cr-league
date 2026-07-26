## task_123_orchestrate_the_source_of_truth_remediation - Orchestrate the source-of-truth remediation
> From version: 0.4.6
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 65%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Treat this as remediation, not redesign: preserve the layering and server-authoritative model; every change removes duplication or moves a re-derivation to one source of truth.
- [ ] 2. Hoist the LeagueState/RaceResult response DTO into shared and reconcile the drift; stop the api typing its own result as unknown.
- [ ] 3. Consolidate the diverged sim/util helpers into shared, deciding each divergent behavior deliberately and pinning it with a test.
- [ ] 4. Move replay order/classification/gap derivation to one shared definition beside replayTrace and add a golden test; then decompose lifecycle.ts and App.tsx as a pure refactor.
- [ ] 5. Add the coverage floor and critical-path unit tests; persist server-side standings, add the circuit parity guard, and remove storeCore/dead exports and the in-logic speed-profile data.
- [ ] 6. DO NOT change the opponent-decision reveal (intentional meta-game) or rotate secrets (owner-handled). Run typecheck/test/build/lint/e2e/logics:validate and record proof at closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_300_single_source_of_truth_for_the_leaguestate_raceresult_response_contract`
- `item_301_consolidate_diverged_simulation_util_helpers_into_shared_reconciled_under_test`
- `item_302_one_shared_definition_of_replay_order_classification_gaps_with_a_golden_test`
- `item_303_decompose_the_god_modules_lifecycle_ts_and_app_tsx`
- `item_304_test_and_ci_hardening_coverage_floor_plus_critical_path_unit_tests`
- `item_305_server_authoritative_standings_circuit_parity_guard_and_dead_code_data_hygiene`

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
- Summary: Orchestrate the source-of-truth remediation
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_122_review_remediation_one_source_of_truth_for_cross_package_contracts_and_helpers_decompose_god_modules_close_test_gaps`
- Product brief(s): `prod_074_cross_package_source_of_truth_remediation_product_brief`
- Architecture decision(s): (none yet)
