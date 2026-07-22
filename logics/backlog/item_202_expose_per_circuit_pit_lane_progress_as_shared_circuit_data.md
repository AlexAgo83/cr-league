## item_202_expose_per_circuit_pit_lane_progress_as_shared_circuit_data - Expose per-circuit pit-lane progress as shared circuit data
> From version: 0.3.27
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85
> Progress: 0%
> Complexity: Medium
> Theme: Replay fidelity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The pit position has two independent origins: the simulation halts the car at a hardcoded 0.5 (store.ts:724) with no geometry knowledge, and the map derives its OWN pitProgress from the longest straight (analyzeCircuitRoute, CircuitMap.tsx:240). They coincide only by accident, and each side re-deciding "where the pit is" is the root defect.
- The longest-straight heuristic and the route point arrays live only in the web (analyzeCircuitRoute over apps/web/src/app/circuitRoutes/*.ts); simulateRace runs shared/API-side and packages/shared/src/domain/circuits.ts carries only metadata (traits, laps, trackLengthMeters, layoutKey), so there is no single canonical pit position either side can share.

# Scope
- In:
  - Establish exactly ONE canonical origin for the pit position: compute each circuit's from-start pit-lane progress (((pitProgress - startProgress) % 1 + 1) % 1) from the route geometry, at circuit-generation time, and store it as a pitLaneProgress field on the shared circuit definition (packages/shared/src/domain/circuits.ts, or a companion map keyed by layoutKey).
  - Extract the longest-straight pit/start derivation out of the React component (analyzeCircuitRoute) into a single pure module that both scripts/generate-circuit.mjs and the web import, so the heuristic has one implementation and is never re-derived in two places.
  - Generate the value via scripts/generate-circuit.mjs and add a scripts/audit-circuits.mjs check that fails if the stored value drifts from the route geometry.
- Out:
  - Moving the full route point arrays into the shared package (only the derived scalar is canonical).
  - Changing the longest-straight placement heuristic itself.
  - Wiring the value into the sim and map consumers (next item).

# Acceptance criteria
- AC1: There is exactly one canonical, generated from-start pit-lane progress per circuit, stored as shared circuit data.
- AC2: The longest-straight heuristic exists in a single shared implementation used by generation, not duplicated in the map component.
- AC3: audit:circuits fails if the stored value drifts from the route geometry.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: One canonical, generated from-start pit-lane progress per circuit, stored as shared circuit data.
- request-AC4 -> This backlog slice. Proof: AC2: A single shared implementation of the heuristic generates the value; audit:circuits guards drift.

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
