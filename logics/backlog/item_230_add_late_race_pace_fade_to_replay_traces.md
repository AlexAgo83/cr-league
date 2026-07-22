## item_230_add_late_race_pace_fade_to_replay_traces - Add late-race pace fade to replay traces
> From version: 0.3.28
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 20%
> Complexity: Medium
> Theme: Replay realism
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Late-race replay motion can feel too linear when every car keeps the same visible rhythm until the finish.
- A small pace fade can make energy, grip, and weather feel more meaningful without introducing a tire model.
- The effect must stay trace-level and bounded unless a later gameplay request chooses to rebalance outcomes.

# Scope
- In:
  - Add a small deterministic late-race pace fade or stability state based on existing traits, weather, and race phase.
  - Apply the effect only after earlier trace/gap/pit/overtake layers are stable.
  - Keep final trace endpoints and final classification intact.
  - Expose late-race state in inspection output where useful.
  - Add tests for high-energy, low-energy, dry, and wet representative cases.
- Out:
  - Tire compounds, tire wear, fuel loads, mechanical failures, or safety cars.
  - Changing final race times or rewards.
  - Per-driver long-run strategy AI.

# Acceptance criteria
- AC1: Late-race pace fade is visible, deterministic, and bounded.
- AC2: The effect reflects existing energy/grip/weather inputs without changing scored outcomes.
- AC3: Tests prove endpoints, live order consistency, and final classification are preserved.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Late-race pace fade is visible, deterministic, and bounded.
- request-AC7 -> This backlog slice. Proof: AC2: The effect reflects existing energy/grip/weather inputs without changing scored outcomes.
- request-AC8 -> This backlog slice. Proof: AC3: Tests prove endpoints, live order consistency, and final classification are preserved.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_060_race_replay_realism_layers_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_097_race_replay_realism_layers_after_canonical_trace`
- Primary task(s): `task_098_orchestrate_race_replay_realism_layers_after_canonical_trace`

# AI Context
- Summary: Add late-race pace fade to replay traces
- Keywords: scaffolded-backlog, add late-race pace fade to replay traces, implementation-ready
- Use when: Implementing the scaffolded slice for Add late-race pace fade to replay traces.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Low
- Rationale: Set by scaffold input or defaulted for grooming.
