## item_299_fun_arc_metrics_lead_changes_close_finishes_boring_race_rate_per_season - Fun-arc metrics: lead changes, close finishes, boring-race rate per season
> From version: 0.4.6
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
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
- request-AC2 -> This backlog slice. Proof: AC1: Per-race lead changes, close finishes, and boring-race flags are computed from existing results.
- request-AC3 -> This backlog slice. Proof: AC2: A per-season narrative aggregates them and names the most boring circuits.
- request-AC4 -> This backlog slice. Proof: AC3: A fun-arc report is written under reports/ with a JSON option.
- request-AC5 -> This backlog slice. Proof: AC3: A fun-arc report is written under reports/ with a JSON option.

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
