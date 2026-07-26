## task_122_orchestrate_replayability_and_fun_analytics - Orchestrate replayability and fun analytics
> From version: 0.4.6
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
- [ ] 1. Confirm the metrics are post-hoc over existing ai-playtest/balance results; do not touch simulateRace, personas, or the fun/frustration formulas.
- [ ] 2. Build the replayability report (variety, dominant-strategy detection, comebacks, title suspense) extending the balance-simulations metric family and reusing the seeded harness.
- [ ] 3. Build the fun-arc report (lead changes, close finishes, boring-race rate) aggregated per season from the emitted events/order-change facts.
- [ ] 4. Add drill-down to drivers (dominant strategy cluster, boring circuits, suspense-killing rounds) and a JSON output, writing under reports/.
- [ ] 5. Wire npm script(s), keep non-blocking in CI; run typecheck/test/lint/logics:validate and record proof at closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_298_replayability_metrics_variety_dominant_strategy_detection_comebacks_title_suspense`
- `item_299_fun_arc_metrics_lead_changes_close_finishes_boring_race_rate_per_season`

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
- Summary: Orchestrate replayability and fun analytics
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_121_replayability_and_fun_analytics_measure_outcome_variety_strategy_dominance_and_emotional_arc_across_many_ai_seasons`
- Product brief(s): `prod_073_replayability_and_fun_analytics_product_brief`
- Architecture decision(s): (none yet)
