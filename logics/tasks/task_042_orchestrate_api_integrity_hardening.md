## task_042_orchestrate_api_integrity_hardening - Orchestrate API integrity hardening
> From version: 0.3.5
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
- [ ] 1. Start by reading the current routes/store/tests and confirming the reviewed findings still reproduce.
- [ ] 2. Implement create-league error handling and secure code generation first because they are small and unblock safer tests.
- [ ] 3. Add claimCode to team mutation contracts and update the web client in the smallest compatible diff.
- [ ] 4. Harden buyCard with an atomic write path and focused double-spend regression coverage.
- [ ] 5. Harden resolveCurrentGrandPrix with a transaction/conditional claim and focused duplicate-resolution regression coverage.
- [ ] 6. Clean the lint scratch artifact or narrow ignore, then run typecheck, tests, build, lint, and logics validation.
- [ ] 7. Record any deliberate simplification in the task closeout, especially if JSON inventory remains instead of a normalized table.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_079_require_claim_codes_for_team_mutations`
- `item_080_make_grand_prix_resolution_idempotent_and_transactional`
- `item_081_make_card_purchases_atomic`
- `item_082_handle_create_league_validation_errors_consistently`
- `item_083_use_crypto_backed_league_and_claim_codes_with_collision_retry`
- `item_084_restore_lint_reproducibility_from_a_clean_tree`

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
- Summary: Orchestrate API integrity hardening
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_041_api_integrity_hardening_from_repo_review`
- Product brief(s): `prod_012_api_integrity_hardening_product_brief`
- Architecture decision(s): (none yet)
