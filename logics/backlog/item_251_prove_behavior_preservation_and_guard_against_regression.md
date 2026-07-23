## item_251_prove_behavior_preservation_and_guard_against_regression - Prove behavior-preservation and guard against regression
> From version: 0.4.1
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Verification
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The optimizations touch the hot replay path and must not alter positions, trace, or finishing order.
- There is no guard preventing a future change from reintroducing per-frame geometry rebuilds.

# Scope
- In:
  - Assert byte-identical replay output for a fixed seed (carProgress snapshots, final classification, trace) before/after.
  - Add a non-regression check that route geometry is built at most once per points array over a simulated playback.
- Out:
  - A full performance benchmark harness.
  - Testing frame timing directly.

# Acceptance criteria
- AC1: A test pins fixed-seed replay output as unchanged.
- AC2: A test proves route geometry is not rebuilt per frame.
- AC3: The full suite is green and circuit generation/simulateRace are untouched.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: A test pins fixed-seed replay output as unchanged.
- request-AC6 -> This backlog slice. Proof: AC2: A test proves route geometry is not rebuilt per frame.
- request-AC3 -> This backlog slice. Evidence needed: Per-frame car positioning is applied imperatively (like the camera loop) rather than through setSnapshot, and the rendered car structure at any given progress matches the previous output exactly.
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
- Summary: Prove behavior-preservation and guard against regression
- Keywords: scaffolded-backlog, prove behavior-preservation and guard against regression, implementation-ready
- Use when: Implementing the scaffolded slice for Prove behavior-preservation and guard against regression.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_102_orchestrate_replay_map_render_performance`

# Notes
- Task `task_102_orchestrate_replay_map_render_performance` was finished via `logics-manager flow finish task` on 2026-07-23.
