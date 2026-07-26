## item_306_group_replayability_and_balance_diagnostics_by_strategy_axes - Group replayability and balance diagnostics by strategy axes
> From version: 0.4.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Balance diagnostics
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The replayability report lists full strategy clusters, but the evidence is too granular to isolate whether approach, pit strategy, card, or profile is driving the win concentration.
- The current sample shows aggressive mini-pack concentration without a formal dominance breach, so an immediate tuning change would be speculative.
- Designers need grouped signals that can be compared across larger deterministic runs.

# Scope
- In:
  - Add grouped output to the existing replayability or balance report for approach, preparation, pit strategy, card, and profile.
  - Include win share, podium or points proxy where available, and comparison to overall chance or sample share.
  - Run a larger deterministic sample and record whether the aggressive mini-pack concentration is confirmed or sample-driven.
- Out:
  - Changing balance values in this slice.
  - Adding a new analytics tool when existing scripts can carry the grouped output.

# Acceptance criteria
- AC1: Grouped strategy-axis tables are emitted in markdown and JSON.
- AC2: The report identifies the strongest drivers of the aggressive mini-pack concentration.
- AC3: Replayability/fun summary metrics are still visible next to the grouped diagnostics.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Grouped strategy-axis tables are emitted in markdown and JSON.
- request-AC2 -> This backlog slice. Proof: AC2: The report identifies the strongest drivers of the aggressive mini-pack concentration.
- request-AC4 -> This backlog slice. Proof: AC3: Replayability/fun summary metrics are still visible next to the grouped diagnostics.
- request-AC5 -> This backlog slice. Proof: AC3: Replayability/fun summary metrics are still visible next to the grouped diagnostics.
- request-AC6 -> This backlog slice. Proof: AC3: Replayability/fun summary metrics are still visible next to the grouped diagnostics.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_075_aggressive_mini_pack_balance_diagnostic_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_123_aggressive_mini_pack_balance_diagnostic_verify_and_correct_win_concentration_without_blind_nerfs`
- Primary task(s): `task_124_orchestrate_aggressive_mini_pack_balance_diagnostic`

# AI Context
- Summary: Group replayability and balance diagnostics by strategy axes
- Keywords: scaffolded-backlog, group replayability and balance diagnostics by strategy axes, implementation-ready
- Use when: Implementing the scaffolded slice for Group replayability and balance diagnostics by strategy axes.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_124_orchestrate_aggressive_mini_pack_balance_diagnostic`

# Notes
- Task `task_124_orchestrate_aggressive_mini_pack_balance_diagnostic` was finished via `logics-manager flow finish task` on 2026-07-27.
