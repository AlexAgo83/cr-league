## item_228_add_bounded_traffic_and_defense_behavior - Add bounded traffic and defense behavior
> From version: 0.3.28
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 35%
> Complexity: Medium
> Theme: Replay realism
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- When two cars are close, the following car should not always look like it can drive its ideal pace through every zone.
- Traffic and defense are useful only after chrono-gap spacing defines proximity reliably.
- The effect must be subtle enough not to contradict simulation results.

# Scope
- In:
  - Apply a small deterministic blocked/defense effect only when canonical gaps, live order, and zone data show cars are close.
  - Prefer non-overtake or technical zones for blocked behavior and overtake zones for release/attack behavior.
  - Keep the effect bounded and trace-level, preserving monotonic progress and final ordering.
  - Expose traffic/defense state in replay facts or trace metadata only where current consumers need it.
  - Add tests for close-following, not-close, overtake-zone, and final-classification cases.
- Out:
  - A full dirty-air model.
  - Driver-specific defense AI.
  - Changing race outcome or overtake probability in this request.

# Acceptance criteria
- AC1: Traffic/defense effects only apply under canonical proximity and zone conditions.
- AC2: The following car remains visually constrained without breaking tower/map alignment.
- AC3: Tests prove the effect is bounded and deterministic.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Traffic/defense effects only apply under canonical proximity and zone conditions.
- request-AC6 -> This backlog slice. Proof: AC2: The following car remains visually constrained without breaking tower/map alignment.
- request-AC8 -> This backlog slice. Proof: AC3: Tests prove the effect is bounded and deterministic.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_060_race_replay_realism_layers_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_097_race_replay_realism_layers_after_canonical_trace`
- Primary task(s): `task_098_orchestrate_race_replay_realism_layers_after_canonical_trace`

# AI Context
- Summary: Add bounded traffic and defense behavior
- Keywords: scaffolded-backlog, add bounded traffic and defense behavior, implementation-ready
- Use when: Implementing the scaffolded slice for Add bounded traffic and defense behavior.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
