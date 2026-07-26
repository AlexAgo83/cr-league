## item_298_replayability_metrics_variety_dominant_strategy_detection_comebacks_title_suspense - Replayability metrics: variety, dominant-strategy detection, comebacks, title suspense
> From version: 0.4.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Replayability analytics
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- balance-simulations only reports gap % and pit-points spread; nothing measures whether outcomes vary run to run or converge.
- There is no detection of a dominant strategy (an approach/preparation/pit/card cluster winning far above chance), which would signal collapsed choice.
- Comeback frequency and title suspense (when the champion is effectively decided) are unmeasured.

# Scope
- In:
  - Over N seasons, compute outcome variety/divergence, win rate per strategy cluster vs chance (dominant-strategy detection), comeback frequency (large positive position deltas), and per-season title suspense (earliest round the champion is locked).
  - Extend the balance-simulations metric family rather than duplicating it; reuse the seeded run harness.
  - Write a replayability report under reports/ with drill-down to the dominant cluster and suspense-killing rounds, plus a JSON option.
- Out:
  - Changing the engine, personas, or balance thresholds.
  - Auto-tuning balance from the findings.

# Acceptance criteria
- AC1: The report includes variety, dominant-strategy win rates, comeback frequency, and title suspense.
- AC2: It drills down to the dominant strategy cluster and suspense-killing rounds.
- AC3: It reuses the seeded harness and writes to reports/ with a JSON option.

# AC Traceability
- request-AC1 -> `scripts/replayability-analytics.ts`. Proof: report includes unique champions, unique finishing orders, dominant cluster win rates, comeback race rate, and title locked round.
- request-AC3 -> `scripts/replayability-analytics.ts`. Proof: the script reuses the shared playtest brain and calls `simulateRace` post-hoc without engine/persona changes.
- request-AC4 -> `reports/playtest/replayability-analytics.md` and `.json`. Proof: drill-down includes dominant clusters, suspense-killing rounds, biggest comebacks, and closest finishes.
- request-AC5 -> `package.json`. Proof: `npm run playtest:replayability` writes both report formats under `reports/playtest`.

# Report
- Delivered by `scripts/replayability-analytics.ts` and `npm run playtest:replayability`.
- Sample output: 12 seasons x 6 GP, 6 unique champions, 72 unique finishing orders, 98.61% comeback race rate, average title lock round 5.83, no dominant cluster above the 25% threshold.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_073_replayability_and_fun_analytics_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_121_replayability_and_fun_analytics_measure_outcome_variety_strategy_dominance_and_emotional_arc_across_many_ai_seasons`
- Primary task(s): `task_122_orchestrate_replayability_and_fun_analytics`

# AI Context
- Summary: Replayability metrics: variety, dominant-strategy detection, comebacks, title suspense
- Keywords: scaffolded-backlog, replayability metrics: variety, dominant-strategy detection, comebacks, title suspense, implementation-ready
- Use when: Implementing the scaffolded slice for Replayability metrics: variety, dominant-strategy detection, comebacks, title suspense.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_122_orchestrate_replayability_and_fun_analytics`

# Notes
- Task `task_122_orchestrate_replayability_and_fun_analytics` was finished via `logics-manager flow finish task` on 2026-07-27.
