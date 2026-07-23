## item_249_drive_car_positions_imperatively_per_frame - Drive car positions imperatively per frame
> From version: 0.4.1
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Render performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Car positions update through setSnapshot -> React re-render each frame, while the camera already updates imperatively via setAttribute (CircuitMap.tsx:371-372).
- Reconciling car groups every frame is unnecessary when only their transform changes.

# Scope
- In:
  - Keep carProgress in a ref and write each .map-car group's transform directly in the playback rAF loop, matching the pose the render currently computes.
  - Render car structure (sprites, labels, deltas) once; update only transforms per frame.
  - Keep this step isolated so it can be reverted independently.
- Out:
  - Changing the car sprite structure or the pose math.
  - Removing the snapshot entirely if the tower still needs it.

# Acceptance criteria
- AC1: Per-frame car positioning is imperative, not via setSnapshot.
- AC2: The car structure and position at any given progress match the previous output exactly.
- AC3: Scrubbing and pause/resume still position cars correctly.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: Per-frame car positioning is imperative, not via setSnapshot.
- request-AC5 -> This backlog slice. Proof: AC2: The car structure and position at any given progress match the previous output exactly.
- request-AC6 -> This backlog slice. Proof: AC3: Scrubbing and pause/resume still position cars correctly.
- request-AC4 -> This backlog slice. Evidence needed: The standings tower, live lap/segment, and active moment update at a reduced cadence (~100ms or on change) rather than every frame, while scrubbing updates immediately.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_064_replay_map_render_performance_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_101_replay_map_render_performance_memoize_route_geometry_hoist_static_svg_layers_imperative_car_transforms_and_throttle_non_positional_state`
- Primary task(s): `task_102_orchestrate_replay_map_render_performance`

# AI Context
- Summary: Drive car positions imperatively per frame
- Keywords: scaffolded-backlog, drive car positions imperatively per frame, implementation-ready
- Use when: Implementing the scaffolded slice for Drive car positions imperatively per frame.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_102_orchestrate_replay_map_render_performance`

# Notes
- Task `task_102_orchestrate_replay_map_render_performance` was finished via `logics-manager flow finish task` on 2026-07-23.
