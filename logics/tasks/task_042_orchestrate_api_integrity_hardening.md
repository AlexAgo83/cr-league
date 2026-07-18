## task_042_orchestrate_api_integrity_hardening - Orchestrate API integrity hardening
> From version: 0.3.5
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex-work4

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Start by reading the current routes/store/tests and confirming the reviewed findings still reproduce.
- [x] 2. Implement create-league error handling and secure code generation first because they are small and unblock safer tests.
- [x] 3. Add claimCode to team mutation contracts and update the web client in the smallest compatible diff.
- [x] 4. Harden buyCard with an atomic write path and focused double-spend regression coverage.
- [x] 5. Harden resolveCurrentGrandPrix with a transaction/conditional claim and focused duplicate-resolution regression coverage.
- [x] 6. Clean the lint scratch artifact or narrow ignore, then run typecheck, tests, build, lint, and logics validation.
- [x] 7. Record any deliberate simplification in the task closeout, especially if JSON inventory remains instead of a normalized table.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_079_require_claim_codes_for_team_mutations`
- `item_080_make_grand_prix_resolution_idempotent_and_transactional`
- `item_081_make_card_purchases_atomic`
- `item_082_handle_create_league_validation_errors_consistently`
- `item_083_use_crypto_backed_league_and_claim_codes_with_collision_retry`
- `item_084_restore_lint_reproducibility_from_a_clean_tree`

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
- request-AC2 -> This task. Proof: apps/web/src/app/App.tsx sends leagueState.player.claimCode in team mutation payloads and adds no new visible claimCode UI.
- request-AC3 -> This task. Proof: apps/api/src/features/leagues/store.ts claims Grand Prix resolution with updateMany({ status: "briefing" }) before applying rewards; losing resolvers receive the existing already-resolved conflict.
- request-AC5 -> This task. Proof: apps/api/src/features/leagues/routes.ts wraps /leagues createDemoLeague errors with the same LeagueRuleError conflict response used by sibling league routes.
- request-AC7 -> This task. Proof: npm run --workspaces --if-present typecheck, npm run test -- --run, npm run build --workspaces --if-present, and npm run lint passed on 2026-07-18.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- Implemented claimCode checks for team mutations, crypto-backed league/claim code generation, create-league LeagueRuleError mapping, conditional buyCard writes, conditional Grand Prix resolve claim, and lint gate cleanup. Validation: npm run --workspaces --if-present typecheck passed; npm run test -- --run passed 8 files / 66 tests; npm run build --workspaces --if-present passed; npm run lint passed.
- Finish workflow executed on 2026-07-18.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-07-18.
- Linked backlog item(s): `item_079_require_claim_codes_for_team_mutations`, `item_080_make_grand_prix_resolution_idempotent_and_transactional`, `item_081_make_card_purchases_atomic`, `item_082_handle_create_league_validation_errors_consistently`, `item_083_use_crypto_backed_league_and_claim_codes_with_collision_retry`, `item_084_restore_lint_reproducibility_from_a_clean_tree`
- Related request(s): `req_041_api_integrity_hardening_from_repo_review`

# AI Context
- Summary: Orchestrate API integrity hardening
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_041_api_integrity_hardening_from_repo_review`
- Product brief(s): `prod_012_api_integrity_hardening_product_brief`
- Architecture decision(s): (none yet)
