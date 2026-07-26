## task_122_orchestrate_replayability_and_fun_analytics - Orchestrate replayability and fun analytics
> From version: 0.4.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Confirm the metrics are post-hoc over existing ai-playtest/balance results; do not touch simulateRace, personas, or the fun/frustration formulas.
- [x] 2. Build the replayability report (variety, dominant-strategy detection, comebacks, title suspense) extending the balance-simulations metric family and reusing the seeded harness.
- [x] 3. Build the fun-arc report (lead changes, close finishes, boring-race rate) aggregated per season from the emitted events/order-change facts.
- [x] 4. Add drill-down to drivers (dominant strategy cluster, boring circuits, suspense-killing rounds) and a JSON output, writing under reports/.
- [x] 5. Wire npm script(s), keep non-blocking in CI; run typecheck/test/lint/logics:validate and record proof at closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_298_replayability_metrics_variety_dominant_strategy_detection_comebacks_title_suspense`
- `item_299_fun_arc_metrics_lead_changes_close_finishes_boring_race_rate_per_season`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> `scripts/replayability-analytics.ts`. Proof: `npm run playtest:replayability` generated champion/order variety, dominant clusters, comeback rate, and title lock round in `reports/playtest/replayability-analytics.md`.
- request-AC2 -> `scripts/replayability-analytics.ts`. Proof: the same report includes lead changes, close finishes, boring race rate, order changes, and per-season rows in JSON.
- request-AC3 -> `scripts/replayability-analytics.ts`. Proof: post-hoc harness calls `simulateRace` and shared playtest brain without editing engine, personas, or fun/frustration formulas.
- request-AC4 -> `reports/playtest/replayability-analytics.md` and `.json`. Proof: report drills into dominant clusters, boring circuits, suspense-killing rounds, biggest comebacks, and closest finishes.
- request-AC5 -> `package.json`. Proof: `playtest:replayability` is an explicit non-CI npm script; validation commands below passed.

# Validation
- `npm run typecheck` passed.
- `npm run playtest:replayability` passed and wrote `reports/playtest/replayability-analytics.md` plus `.json`.
- `npm run lint` passed.
- `npm test` passed: 41 files passed, 344 tests passed, 1 file/7 tests skipped.
- `npm run build` passed.
- `npm run logics:validate` pending final closeout state.
- npm run typecheck; npm run playtest:replayability; npm run lint; npm test; npm run build passed
- Finish workflow executed on 2026-07-27.
- Linked backlog/request close verification passed.

# Report
- Added `scripts/replayability-analytics.ts`, a deterministic offline analytics script over seeded simulated AI seasons.
- Added `npm run playtest:replayability`.
- Latest generated sample: 12 seasons x 6 GP x 14 agents, 6 unique champions, 72 unique finishing orders, 98.61% comeback race rate, average title lock round 5.83, 1.96 average lead changes, 27.78% close finish rate, 0% boring race rate, no dominant cluster above the 25% threshold.
- Finished on 2026-07-27.
- Linked backlog item(s): `item_298_replayability_metrics_variety_dominant_strategy_detection_comebacks_title_suspense`, `item_299_fun_arc_metrics_lead_changes_close_finishes_boring_race_rate_per_season`
- Related request(s): `req_121_replayability_and_fun_analytics_measure_outcome_variety_strategy_dominance_and_emotional_arc_across_many_ai_seasons`

# AI Context
- Summary: Orchestrate replayability and fun analytics
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_121_replayability_and_fun_analytics_measure_outcome_variety_strategy_dominance_and_emotional_arc_across_many_ai_seasons`
- Product brief(s): `prod_073_replayability_and_fun_analytics_product_brief`
- Architecture decision(s): (none yet)
