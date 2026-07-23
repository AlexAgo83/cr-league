## item_248_hoist_static_svg_layers_out_of_the_per_frame_render - Hoist static SVG layers out of the per-frame render
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
- The playback rAF loop calls setSnapshot every frame (useReplayClock.ts:107) and ReplayView.tsx:253 rebuilds cars each render, so CircuitMap re-renders its whole SVG (tiles + four route paths + sprites) 60x/s.
- Only car positions change per frame; the tile and route layers are static during playback.

# Scope
- In:
  - Wrap the tile-layer JSX in useMemo keyed on [tiles, zoom] and the route-layer JSX in useMemo keyed on [renderD, routeDecorStyle, routeAnalysis, hasCars].
  - Memoize the cars array in ReplayView.tsx:253 on [field, snapshot].
- Out:
  - Including cars/snapshot in the static-layer memo keys.
  - Changing the visual output of tiles or route.

# Acceptance criteria
- AC1: Tile and route layers do not reconcile on every playback frame.
- AC2: The cars array is memoized and not reallocated when inputs are unchanged.
- AC3: The rendered map looks identical; tests stay green.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: Tile and route layers do not reconcile on every playback frame.
- request-AC6 -> This backlog slice. Proof: AC2: The cars array is memoized and not reallocated when inputs are unchanged.
- request-AC3 -> This backlog slice. Evidence needed: Per-frame car positioning is applied imperatively (like the camera loop) rather than through setSnapshot, and the rendered car structure at any given progress matches the previous output exactly.
- request-AC4 -> This backlog slice. Evidence needed: The standings tower, live lap/segment, and active moment update at a reduced cadence (~100ms or on change) rather than every frame, while scrubbing updates immediately.
- request-AC5 -> This backlog slice. Evidence needed: Replay output is byte-identical (fixed-seed carProgress snapshots, final classification, and trace unchanged), and a non-regression check proves route geometry is not rebuilt per frame.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_064_replay_map_render_performance_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_101_replay_map_render_performance_memoize_route_geometry_hoist_static_svg_layers_imperative_car_transforms_and_throttle_non_positional_state`
- Primary task(s): `task_102_orchestrate_replay_map_render_performance`

# AI Context
- Summary: Hoist static SVG layers out of the per-frame render
- Keywords: scaffolded-backlog, hoist static svg layers out of the per-frame render, implementation-ready
- Use when: Implementing the scaffolded slice for Hoist static SVG layers out of the per-frame render.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_102_orchestrate_replay_map_render_performance`

# Notes
- Task `task_102_orchestrate_replay_map_render_performance` was finished via `logics-manager flow finish task` on 2026-07-23.
