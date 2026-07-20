## task_068_orchestrate_plan_risk_readability_layer - Orchestrate plan risk readability layer
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Inspect current plan derivations, directive controls, send-plan confirmation, and report verdict helpers for reusable patterns.
- [x] 2. Implement the smallest pure helper for safe/risky/high-upside derivation and focused tests.
- [x] 3. Render the summary in PlanView and send-plan confirmation using existing compact panel styles.
- [x] 4. Add i18n copy in EN/FR and targeted tests for render and flow behavior.
- [x] 5. Run typecheck, tests, build, lint, e2e, and Logics validation; record proof at closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_161_derive_deterministic_plan_risk_reads`
- `item_162_render_plan_risk_summary_before_commitment`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `PlanRiskSummary` renders the compact risk panel in `apps/web/src/features/PlanView.tsx` with level, strength, failure mode, and finishing band from `buildPlanRiskRead`.
- request-AC2 -> This task. Proof: `apps/web/src/app/AppOverlays.tsx` renders the same `PlanRiskSummary` in the send-plan confirmation before locking the directive; covered by `apps/web/src/app/App.test.tsx`.
- request-AC3 -> This task. Proof: `buildPlanRiskRead` in `apps/web/src/app/raceFlow.ts` uses approach, tire prep, pit strategy, selected card, forecast, circuit traits, chrono attempts, and grid position; representative safe/risky/high-upside cases are covered in `apps/web/src/app/raceFlow.test.ts`.
- request-AC4 -> This task. Proof: the change is UI/derivation-only and does not alter simulation, API handlers, persisted directive payloads, or shared contract types.
- request-AC5 -> This task. Proof: EN/FR keys were added in `apps/web/src/i18n/en.json` and `apps/web/src/i18n/fr.json`; `logics-manager i18n status` reported valid.
- request-AC6 -> This task. Proof: `rtk npm test -- apps/web/src/app/raceFlow.test.ts`, `rtk npm test -- apps/web/src/app/App.test.tsx`, and full `rtk npm test` passed.
- request-AC7 -> This task. Proof: `rtk npm run typecheck`, `rtk npm test`, `rtk npm run build`, `rtk npm run lint`, `rtk npm run test:e2e`, and `rtk npm run logics:validate` were run during closeout.

# Validation
- `rtk logics-manager i18n status`: OK.
- `rtk npm test -- apps/web/src/app/raceFlow.test.ts`: 9 passed.
- `rtk npm test -- apps/web/src/app/App.test.tsx`: 28 passed.
- `rtk npm run typecheck`: OK.
- `rtk npm test`: 23 passed, 1 skipped; 204 passed, 4 skipped.
- `rtk npm run build`: OK.
- `rtk npm run lint`: OK.
- `rtk npm run test:e2e`: 4 passed.
- `rtk npm run logics:validate`: OK.
- Finish workflow executed on 2026-07-20.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-07-20.
- Linked backlog item(s): `item_161_derive_deterministic_plan_risk_reads`, `item_162_render_plan_risk_summary_before_commitment`
- Related request(s): `req_067_plan_risk_readability_layer`

# AI Context
- Summary: Orchestrate plan risk readability layer
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_067_plan_risk_readability_layer`
- Product brief(s): `prod_031_plan_risk_readability_product_brief`
- Architecture decision(s): (none yet)
