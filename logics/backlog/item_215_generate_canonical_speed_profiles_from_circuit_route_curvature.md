## item_215_generate_canonical_speed_profiles_from_circuit_route_curvature - Generate canonical speed profiles from circuit route curvature
> From version: 0.3.28
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Race-track data model
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Circuit geometry now exposes canonical start, pit, straight, length, and zones, but there is no canonical data for where the route is fast or slow.
- CircuitMap.tsx can infer local heading/drift at render time, but using render-time geometry as race semantics repeats the pre-canonical-track smell.
- Without generated profile data, any corner slowdown would either be hand-authored, recomputed per frame, or duplicated between replay and future simulation.

# Scope
- In:
  - Define a compact shared `TrackSpeedProfile`/`TrackSpeedSpan` type with kind, startProgress, endProgress, factor, and optional reason/source fields only if useful.
  - Add a route-analysis helper or script path that computes local curvature from consecutive route segments using standard math already present in CircuitMap-style helpers.
  - Derive braking, corner, exit, and straight spans from angle deltas and segment lengths, then merge tiny/noisy adjacent spans.
  - Store generated profiles in shared circuit identities or expose deterministic shared helpers keyed by circuit identity, matching the existing canonical circuit data style.
  - Extend `scripts/generate-circuit.mjs` and `scripts/audit-circuits.mjs` so generated profiles are reproducible and route changes cannot silently drift.
- Out:
  - Manual per-corner authoring.
  - Runtime geometry analysis inside animation frames.
  - Using the profile in replay rendering or simulation; those are separate backlog items.

# Acceptance criteria
- AC1: Every current circuit exposes a deterministic generated speed profile from route geometry.
- AC2: Audit/test coverage validates progress bounds, factor range, minimum span size after merge, and no zero/negative-speed profile output.
- AC3: The generated profile is small enough to inspect and stable across repeated generation.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Every current circuit exposes a deterministic generated speed profile from route geometry.
- request-AC2 -> This backlog slice. Proof: AC2: Audit/test coverage validates progress bounds, factor range, minimum span size after merge, and no zero/negative-speed profile output.
- request-AC6 -> This backlog slice. Proof: AC3: The generated profile is small enough to inspect and stable across repeated generation.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_058_canonical_corner_speed_profile_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_095_canonical_corner_speed_profile_for_replay_motion`
- Primary task(s): `task_096_orchestrate_canonical_corner_speed_profile_for_replay_motion`

# AI Context
- Summary: Generate canonical speed profiles from circuit route curvature
- Keywords: scaffolded-backlog, generate canonical speed profiles from circuit route curvature, implementation-ready
- Use when: Implementing the scaffolded slice for Generate canonical speed profiles from circuit route curvature.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
