## item_247_memoize_immutable_route_geometry - Memoize immutable route geometry
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
- CircuitMap.tsx:158 pointOnRoute rebuilds routeSegments(points) on every call, walking the full 400-600 point array with hypot+atan2 per segment.
- poseOnRoute (3x pointOnRoute) and driftAngle (6x pointOnRoute) mean ~9 rebuilds per car per frame; the points array is immutable, so this is entirely redundant.

# Scope
- In:
  - Add a WeakMap<RoutePoint[], { segments, total }> cache and a getRouteGeometry(points) that builds geometry once per points reference.
  - Have routeSegments delegate to it and pointOnRoute read segments+total from it.
  - Optionally binary-search cumulative distance instead of the linear scan, only if numerically identical.
- Out:
  - Changing coordinates, angles, or the points array itself.
  - Touching circuitScene/analyzeCircuitRoute.

# Acceptance criteria
- AC1: Route geometry is built at most once per points array and reused by all callers.
- AC2: Output coordinates and angles are numerically identical to before.
- AC3: Existing CircuitMap tests stay green.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Route geometry is built at most once per points array and reused by all callers.
- request-AC5 -> This backlog slice. Proof: AC2: Output coordinates and angles are numerically identical to before.
- request-AC6 -> This backlog slice. Proof: AC3: Existing CircuitMap tests stay green.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_064_replay_map_render_performance_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_101_replay_map_render_performance_memoize_route_geometry_hoist_static_svg_layers_imperative_car_transforms_and_throttle_non_positional_state`
- Primary task(s): `task_102_orchestrate_replay_map_render_performance`

# AI Context
- Summary: Memoize immutable route geometry
- Keywords: scaffolded-backlog, memoize immutable route geometry, implementation-ready
- Use when: Implementing the scaffolded slice for Memoize immutable route geometry.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
