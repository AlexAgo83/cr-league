## task_045_orchestrate_repo_review_remediation_pass_3 - Orchestrate repo review remediation pass 3
> From version: 0.3.6
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
- [ ] 1. Read req_041 and req_043 plus their tasks first; reuse the guarded updateMany and transaction patterns they established.
- [ ] 2. Fix the balance script exports and scripts typecheck first so the build is honest before touching runtime code.
- [ ] 3. Add League.ownerTeamId with migration and backfill, then tighten requireAdminClaim and cover it with owner/non-owner tests.
- [ ] 4. Apply persisted-decision validation and the preview participants cap with shared helpers and route tests.
- [ ] 5. Make the three concurrent write paths transactional and idempotent, reusing the resolve claim pattern for next-grand-prix.
- [ ] 6. Build the shared Modal component, migrate existing modals, replace the replay scrubber with a native range input, and clamp league-config numeric inputs.
- [ ] 7. Add PRNG and reward unit tests.
- [ ] 8. Run typecheck, tests, build, lint, and Logics validation; record proof at closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_092_add_league_owner_and_gate_admin_mutations_on_it`
- `item_093_validate_persisted_decisions_and_cap_preview_participants`
- `item_094_make_concurrent_league_write_paths_safe`
- `item_095_fix_balance_script_imports_and_typecheck_scripts_directory`
- `item_096_web_accessibility_and_numeric_input_clamping`
- `item_097_test_prng_determinism_and_reward_math`

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
- Summary: Orchestrate repo review remediation pass 3
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_044_repo_review_remediation_pass_3_league_ownership_robustness_and_web_accessibility`
- Product brief(s): `prod_015_repo_review_remediation_pass_3_product_brief`
- Architecture decision(s): (none yet)
