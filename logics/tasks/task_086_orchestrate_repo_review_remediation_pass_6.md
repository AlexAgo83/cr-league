## task_086_orchestrate_repo_review_remediation_pass_6 - Orchestrate repo review remediation pass 6
> From version: 0.3.26
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
- [ ] 1. Read req_058 (pass 5) and its Postgres integration lane first; these fixes extend the same runWrite/lockGrandPrixRow patterns and the concurrency ACs must run in that lane, not against the no-op memory DB.
- [ ] 2. Land the concurrency locks: add lockTeamRow, serialize buyCard/sellCard, move submitDecision under the GP lock with a status re-check, and lock joinLeagueByCode's cap; add the Postgres integration tests proving each invariant.
- [ ] 3. Fix the simulation: intervals from times in FinalClassification, classify tie-break on scores.score, and the carAhead elapsedTime snapshot; run balance:sim before and after to confirm order stability.
- [ ] 4. Add the destructive-op guards: confirmation-gated deleteAdminUser and the requireAdminClaim ownership-transfer removal, with tests; note the deliberate narrowing of pass-4 self-healing.
- [ ] 5. Extract the shared stat-delta descriptor and render DirectivePanel badges from it with a snapshot test.
- [ ] 6. Do the cleanup sweep last (lap helper, dead ternary, FNV timestamp, unused export, tt memo, single order computation), keeping every existing test green.
- [ ] 7. Run typecheck, tests, build, lint, e2e, and Logics validation; record proof at closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_185_lock_the_json_column_read_modify_write_paths`
- `item_186_restore_simulation_finishing_order_and_interval_fidelity`
- `item_187_guard_destructive_delete_and_league_admin_authority`
- `item_188_derive_plan_badges_from_a_single_shared_stat_delta_descriptor`
- `item_189_over_engineering_cleanup_sweep`

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
- Summary: Orchestrate repo review remediation pass 6
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_085_repo_review_remediation_pass_6_json_column_race_locks_simulation_finishing_order_fidelity_destructive_op_guards_and_over_engineering_cleanup`
- Product brief(s): `prod_049_repo_review_remediation_pass_6_product_brief`
- Architecture decision(s): (none yet)
