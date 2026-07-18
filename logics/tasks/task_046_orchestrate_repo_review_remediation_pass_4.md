## task_046_orchestrate_repo_review_remediation_pass_4 - Orchestrate repo review remediation pass 4
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
- [x] 1. Read req_044 and task_045 first; this pass extends the same patterns (runWrite transactions, unique-constraint claims, shared enum constants).
- [x] 2. Fix positionChange first (small, shared, unblocks the replay verification in later items) with its permutation test.
- [x] 3. Make ownership self-healing in requireAdminClaim with tests for null and dangling owners.
- [x] 4. Add the FOR UPDATE row locks and move the resolve/startNext reads inside their transactions, keeping the memory-db path working.
- [x] 5. Land the replay scrubber interaction fixes and the small web/shared correctness edges with their test extensions.
- [x] 6. Sweep the deferred debt: risk-path tests, balance-script lookup, single shared import path, node vitest env, API_PORT validation, render.yaml preDeployCommand.
- [x] 7. Run typecheck, tests, build, lint, e2e, and Logics validation; record proof at closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_098_self_healing_league_ownership`
- `item_099_row_locks_and_in_transaction_reads_for_league_writes`
- `item_100_restore_the_positionchange_invariant`
- `item_101_replay_scrubber_interaction_polish`
- `item_102_small_correctness_edges_across_web_and_shared`
- `item_103_deferred_debt_sweep_risk_path_tests_script_and_config_cleanups`

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
- request-AC2 -> This task. Proof: `submitQualifyingRun` and `ensureBotQualifyingRuns` call `lockGrandPrixRow` inside `runWrite`, which uses `SELECT ... FOR UPDATE` when `$queryRaw` exists and keeps the memory DB path green; attempt-limit API tests pass.
- request-AC3 -> This task. Proof: `resolveCurrentGrandPrix` rebuilds state, participants, and simulation result inside the claiming transaction; `startNextGrandPrix` re-reads league state inside its transaction before bot purchases and season resets.
- request-AC5 -> This task. Proof: `ReplayView` suppresses rAF range rewrites while scrubbing, adds lap/time `aria-valuetext`, keeps marker buttons interactive, and CSS sets `pointer-events: none` for replay weather/ticks; web replay/modal tests pass.
- request-AC7 -> This task. Proof: deterministic `risk-106` simulation test covers `mechanical_scare` and `mechanic_save`; balance script uses a lookup table; shared tests opt into node; scripts share the same shared index import path; `API_PORT` NaN falls back; Render migrations moved to `preDeployCommand`.

# Validation
- `npm run typecheck` passed.
- `npm test` passed: 94 tests.
- `npm run build` passed.
- `npm run lint` passed.
- `npm run test:e2e` passed: 3 tests.
- Run `logics-manager lint --require-status` during closeout.
- Run `logics-manager audit --group-by-doc` during closeout.
- typecheck passed; npm test passed (93 tests); npm run build passed; npm run lint passed; npm run test:e2e passed (3 tests)
- Finish workflow executed on 2026-07-18.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-07-18.
- Linked backlog item(s): `item_098_self_healing_league_ownership`, `item_099_row_locks_and_in_transaction_reads_for_league_writes`, `item_100_restore_the_positionchange_invariant`, `item_101_replay_scrubber_interaction_polish`, `item_102_small_correctness_edges_across_web_and_shared`, `item_103_deferred_debt_sweep_risk_path_tests_script_and_config_cleanups`
- Related request(s): `req_045_repo_review_remediation_pass_4_ownership_resilience_race_window_closure_and_replay_polish`

# AI Context
- Summary: Orchestrate repo review remediation pass 4
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_045_repo_review_remediation_pass_4_ownership_resilience_race_window_closure_and_replay_polish`
- Product brief(s): `prod_016_repo_review_remediation_pass_4_product_brief`
- Architecture decision(s): (none yet)
