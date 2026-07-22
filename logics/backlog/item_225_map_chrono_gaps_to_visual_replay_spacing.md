## item_225_map_chrono_gaps_to_visual_replay_spacing - Map chrono gaps to visual replay spacing
> From version: 0.3.28
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 15%
> Complexity: High
> Theme: Replay realism
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- A car at +0.2s and a car at +4s can read too similarly if visual spacing is driven mostly by normalized progress interpolation.
- The replay tower and map are easier to trust when visual distance roughly matches race gaps.
- Gap spacing must be clamped so large gaps do not make the map unreadable.

# Scope
- In:
  - Define a simple gap-to-distance mapping at the canonical trace boundary.
  - Use existing race times/gaps and circuit distance basis from the canonical trace work.
  - Clamp tiny, medium, and large gaps so close battles stay visible and isolated cars remain on-map.
  - Keep generated car progress monotonic and endpoint-preserving.
  - Add tests for close gap, medium gap, large gap, lapped/finished edge cases, and tower/map agreement.
- Out:
  - Exact motorsport telemetry modeling.
  - Infinite map separation for very large gaps.
  - Changing final result times to fit the visual model.

# Acceptance criteria
- AC1: Canonical trace spacing visibly distinguishes close, medium, and large chrono gaps.
- AC2: Map order and live tower order stay aligned for generated traces.
- AC3: Gap clamps and distance basis are documented and covered by focused tests.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Canonical trace spacing visibly distinguishes close, medium, and large chrono gaps.
- request-AC3 -> This backlog slice. Proof: AC2: Map order and live tower order stay aligned for generated traces.
- request-AC8 -> This backlog slice. Proof: AC3: Gap clamps and distance basis are documented and covered by focused tests.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_060_race_replay_realism_layers_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_097_race_replay_realism_layers_after_canonical_trace`
- Primary task(s): `task_098_orchestrate_race_replay_realism_layers_after_canonical_trace`

# AI Context
- Summary: Map chrono gaps to visual replay spacing
- Keywords: scaffolded-backlog, map chrono gaps to visual replay spacing, implementation-ready
- Use when: Implementing the scaffolded slice for Map chrono gaps to visual replay spacing.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
