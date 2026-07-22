## task_092_orchestrate_leagues_store_modularization - Orchestrate leagues store modularization
> From version: 0.3.27
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
- [ ] 1. Map every top-level function in store.ts to a lifecycle group and list its private helpers and shared dependencies.
- [ ] 2. Create a shared transaction-helpers module and move runWrite/lockTeamRow/lockGrandPrixRow/getCurrentGrandPrix/normalizeQualifyingRuns/requireTeamClaim/requireAdminClaim into it.
- [ ] 3. Move each lifecycle group into its own module, importing the shared helpers where needed.
- [ ] 4. Reduce store.ts to a barrel that re-exports the public symbols consumed by routes.ts, admin/store.ts, and tests.
- [ ] 5. Run typecheck, lint, and the full unit suite; record validation evidence in closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_207_split_leagues_store_into_lifecycle_modules_behind_a_barrel`

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
- Summary: Orchestrate leagues store modularization
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_091_modularize_the_oversized_leagues_store`
- Product brief(s): `prod_055_leagues_store_modularization_product_brief`
- Architecture decision(s): (none yet)
