## task_044_orchestrate_api_surface_follow_up_hardening - Orchestrate API surface follow-up hardening
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
- [x] 1. Read req_041 and its task first so this work reuses the same proof model where possible.
- [x] 2. Implement the Fastify logger option first because it makes subsequent API test output readable.
- [x] 3. Design the minimal admin proof after inspecting league creation, profile linkage, and stored claims; document the rule in tests.
- [x] 4. Apply admin proof to settings, resolve, next-grand-prix, and restart with focused route tests.
- [x] 5. Harden simulation preview validation with small helpers and representative invalid-payload tests.
- [x] 6. Document the localStorage secret boundary and verify preference reset safety.
- [x] 7. Run typecheck, tests, build, lint, and Logics validation; record proof at closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_088_add_minimal_admin_proof_to_league_level_mutations`
- `item_089_make_fastify_logging_configurable_for_tests`
- `item_090_harden_simulation_preview_input_validation`
- `item_091_document_prototype_localstorage_secret_boundary`

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
- request-AC2 -> This task. Proof: apps/api/src/features/leagues/store.ts uses existing human team claimCode as the minimal admin proof; no auth dependency, JWT, OAuth, or session framework was added.
- request-AC3 -> This task. Proof: apps/api/src/app.ts accepts dependencies.logger and apps/api/src/app.test.ts passes logger: false, making app.inject tests quiet by default.
- request-AC5 -> This task. Proof: apps/api/src/app.test.ts covers both no-body demo preview and valid DEMO_RACE_INPUT custom preview returning RaceResult data.
- request-AC7 -> This task. Proof: apps/api/src/app.test.ts covers wrong/missing claimCode and invalid preview payloads; apps/web/src/app/App.test.ts protects profile/player localStorage keys during UI preference reset.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- Implemented configurable Fastify logger for tests, minimal claimCode proof for league-level mutations, route-local simulation preview validation, and documented prototype localStorage secret boundary. Validation: npm run --workspaces --if-present typecheck passed; npm run test -- --run passed 8 files / 66 tests; npm run build --workspaces --if-present passed; npm run lint passed.
- Finish workflow executed on 2026-07-18.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-07-18.
- Linked backlog item(s): `item_088_add_minimal_admin_proof_to_league_level_mutations`, `item_089_make_fastify_logging_configurable_for_tests`, `item_090_harden_simulation_preview_input_validation`, `item_091_document_prototype_localstorage_secret_boundary`
- Related request(s): `req_043_api_surface_follow_up_hardening`

# AI Context
- Summary: Orchestrate API surface follow-up hardening
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_043_api_surface_follow_up_hardening`
- Product brief(s): `prod_014_api_surface_follow_up_hardening_product_brief`
- Architecture decision(s): (none yet)
