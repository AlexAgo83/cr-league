## item_202_expose_per_circuit_pit_lane_progress_as_shared_circuit_data - Expose per-circuit pit-lane progress as shared circuit data
> From version: 0.3.27
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Replay fidelity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The geometry-derived pit position (analyzeCircuitRoute pitProgress, CircuitMap.tsx:240; from-start form pitLapProgress, replayMath.ts:166) lives only in the web, while simulateRace runs shared/API-side and has no access to route geometry.
- packages/shared/src/domain/circuits.ts carries only metadata (traits, laps, trackLengthMeters, layoutKey), so the sim has no per-circuit pit position and falls back to a hardcoded 0.5.

# Scope
- In:
  - Precompute each circuit's from-start pit-lane progress (((pitProgress - startProgress) % 1 + 1) % 1) from the route geometry using the same longest-straight heuristic the map uses.
  - Store it as a pitLaneProgress field on the circuit identity in shared (or a companion map keyed by layoutKey) so both the sim and the map can read one value.
  - Generate the value via scripts/generate-circuit.mjs and add a scripts/audit-circuits.mjs check that fails if the stored value no longer matches the route geometry.
- Out:
  - Moving the route point arrays into the shared package.
  - Changing the pit-placement heuristic.
  - Wiring the value into the sim (next item).

# Acceptance criteria
- AC1: Every selectable circuit exposes a geometry-derived from-start pit-lane progress as shared data.
- AC2: The value is generated from the route geometry, not hand-entered.
- AC3: audit:circuits fails if the stored value drifts from the route.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Every selectable circuit exposes a geometry-derived from-start pit-lane progress as shared data.
- request-AC4 -> This backlog slice. Proof: AC2: The value is generated from the route geometry, not hand-entered.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_053_pit_stop_visual_alignment_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_089_align_pit_stop_visual_position_stop_cars_where_the_pit_is_drawn_on_the_circuit_map`
- Primary task(s): `task_090_orchestrate_pit_stop_visual_alignment`

# AI Context
- Summary: Expose per-circuit pit-lane progress as shared circuit data
- Keywords: scaffolded-backlog, expose per-circuit pit-lane progress as shared circuit data, implementation-ready
- Use when: Implementing the scaffolded slice for Expose per-circuit pit-lane progress as shared circuit data.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
