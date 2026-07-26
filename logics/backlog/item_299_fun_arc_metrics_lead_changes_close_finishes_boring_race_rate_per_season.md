## item_299_fun_arc_metrics_lead_changes_close_finishes_boring_race_rate_per_season - Fun-arc metrics: lead changes, close finishes, boring-race rate per season
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
- Fun is only a per-race scalar today; there is no view of the narrative arc.
- Nothing counts lead changes or close finishes, or flags boring races (no overtakes/order change).
- There is no per-season aggregation of exciting vs flat races or of the closest title / biggest comeback.

# Scope
- In:
  - Per race, count lead changes and close finishes (winning gap under a threshold) and mark boring races (no overtakes/order change), reusing the result's events/order-change facts.
  - Aggregate to a per-season narrative (share of exciting vs flat races, biggest comeback, closest title) with drill-down to the circuits producing the most boring races.
  - Write a fun-arc report under reports/ with a JSON option.
- Out:
  - Changing the fun/frustration formulas or the engine.
  - Re-deriving order changes from geometry instead of the emitted facts.

# Acceptance criteria
- AC1: Per-race lead changes, close finishes, and boring-race flags are computed from existing results.
- AC2: A per-season narrative aggregates them and names the most boring circuits.
- AC3: A fun-arc report is written under reports/ with a JSON option.

# AC Traceability
- request-AC2 -> `scripts/replayability-analytics.ts`. Proof: report computes lead changes, close finishes, boring race rate, order changes, and per-season rollups.
- request-AC3 -> `scripts/replayability-analytics.ts`. Proof: metrics are computed from `RaceResult` replay trace and order-change facts without editing fun/frustration formulas.
- request-AC4 -> `reports/playtest/replayability-analytics.md` and `.json`. Proof: drill-down includes boring circuits, biggest comebacks, and closest finishes.
- request-AC5 -> `package.json`. Proof: `npm run playtest:replayability` writes both report formats under `reports/playtest`.

# Report
- Delivered by `scripts/replayability-analytics.ts` and `npm run playtest:replayability`.
- Sample output: 1.96 average lead changes, 22.65 average order changes, 27.78% close finish rate, 0% boring race rate across 72 simulated races.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_073_replayability_and_fun_analytics_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_121_replayability_and_fun_analytics_measure_outcome_variety_strategy_dominance_and_emotional_arc_across_many_ai_seasons`
- Primary task(s): `task_122_orchestrate_replayability_and_fun_analytics`

# AI Context
- Summary: Fun-arc metrics: lead changes, close finishes, boring-race rate per season
- Keywords: scaffolded-backlog, fun-arc metrics: lead changes, close finishes, boring-race rate per season, implementation-ready
- Use when: Implementing the scaffolded slice for Fun-arc metrics: lead changes, close finishes, boring-race rate per season.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_122_orchestrate_replayability_and_fun_analytics`

# Notes
- Task `task_122_orchestrate_replayability_and_fun_analytics` was finished via `logics-manager flow finish task` on 2026-07-27.
