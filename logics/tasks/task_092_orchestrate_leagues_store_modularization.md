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
> Non-semantic edit: 2026-07-23 corpus grooming note added; no status/progress change.
> Semantic edit: 2026-07-23 replaced scaffold-generic DoD, AC traceability, validation, and report text with implementation-specific delivery guidance.

# Context
- Orchestrate a behavior-neutral backend modularization of `apps/api/src/features/leagues/store.ts`.
- This is a maintainability slice: keep route/admin/test import paths stable and preserve every transaction boundary, row lock, rule error, and validation behavior.

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
- [ ] `store.ts` is a barrel that re-exports the same public symbols consumed today.
- [ ] Lifecycle modules and the shared transaction-helper module own the moved code with no duplicated lock/helper logic.
- [ ] No route, admin-store, or test import path changes are required.
- [ ] Typecheck, lint, unit tests, and Logics validation pass.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof due at closeout: lifecycle modules exist and `store.ts` only re-exports.
- request-AC2 -> This task. Proof due at closeout: shared transaction helpers live in one module with no duplication.
- request-AC3 -> This task. Proof due at closeout: existing consumers keep importing from the same path.
- request-AC4 -> This task. Proof due at closeout: behavior-critical locks/errors are preserved.
- request-AC5 -> This task. Proof due at closeout: typecheck, lint, and unit tests pass.

# Validation
- Run `npm run typecheck`.
- Run `npm run lint`.
- Run the full unit test suite.
- Run `npm run logics:validate` or `logics-manager lint --require-status` plus `logics-manager audit --group-by-doc`.

# Report
- Not started. Record moved modules, unchanged import surface proof, test output, and any intentionally deferred helper cleanup at closeout.

# AI Context
- Summary: Orchestrate leagues store modularization
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_091_modularize_the_oversized_leagues_store`
- Product brief(s): `prod_055_leagues_store_modularization_product_brief`
- Architecture decision(s): (none yet)
