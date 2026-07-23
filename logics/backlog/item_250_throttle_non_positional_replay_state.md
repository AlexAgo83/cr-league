## item_250_throttle_non_positional_replay_state - Throttle non-positional replay state
> From version: 0.4.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Render performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- updateLive recomputes createTower and the active moment every frame (useReplayClock.ts:135-150), which the tower/lap/segment UI does not need at 60fps.
- setLive is already change-guarded, but the tower and activeMoment updates are not.

# Scope
- In:
  - Accumulate elapsed time in the rAF loop and refresh tower/live/active-moment ~every 100ms or on change, while positions update every frame.
  - Keep seek/scrubbing immediate.
- Out:
  - Throttling car positions.
  - Changing tower/classification computation logic.

# Acceptance criteria
- AC1: Tower, live lap/segment, and active moment refresh at reduced cadence or on change.
- AC2: Scrubbing updates the tower and moment immediately.
- AC3: No visible correctness change in the tower or moments.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: Tower, live lap/segment, and active moment refresh at reduced cadence or on change.
- request-AC6 -> This backlog slice. Proof: AC2: Scrubbing updates the tower and moment immediately.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_064_replay_map_render_performance_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_101_replay_map_render_performance_memoize_route_geometry_hoist_static_svg_layers_imperative_car_transforms_and_throttle_non_positional_state`
- Primary task(s): `task_102_orchestrate_replay_map_render_performance`

# AI Context
- Summary: Throttle non-positional replay state
- Keywords: scaffolded-backlog, throttle non-positional replay state, implementation-ready
- Use when: Implementing the scaffolded slice for Throttle non-positional replay state.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
