## item_204_generate_the_main_straight_and_start_line_as_canonical_track_data - Generate the main straight and start line as canonical track data
> From version: 0.3.27
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Race-track data model
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- analyzeCircuitRoute derives startProgress = 0.88 of the longest straight (CircuitMap.tsx:241) at render time, and startProgress is the origin of all on-map car progress (progressFromStart/stageProgress) plus the value the pit reconciliation subtracts — a render constant silently defining the sim's zero-point.
- The pit is computed client-side and sent to resolve (leagueMutations.ts:81-91), so the sim consumes a client-decided position.
- The longestStraight output (CircuitMap.tsx:248) is returned but unused.

# Scope
- In:
  - Using req_089's shared longest-straight heuristic, generate the main-straight span and start/finish line position (from-start form) as canonical shared circuit data alongside the pit.
  - Have the map read startProgress (and pit) from canonical data; reduce analyzeCircuitRoute to producing render-only poses (startLine/pitStop via poseOnRoute) from the canonical scalars, and drop the unused longestStraight output.
  - Remove the client-side pit computation (leagueMutations.ts:81-91) so resolve reads the canonical start/pit from shared data.
  - Generate the markers via scripts/generate-circuit.mjs and validate them via scripts/audit-circuits.mjs so they cannot drift from the route.
- Out:
  - Redoing the pit-position wiring owned by req_089 (consume it, do not duplicate).
  - Real per-corner/sector geometry.
  - Changing the 0.18/0.88 heuristic values.

# Acceptance criteria
- AC1: The main-straight span and start line are canonical shared circuit data, generated and audited.
- AC2: The map reads startProgress from canonical data and no longer scans geometry for it; longestStraight is gone.
- AC3: The web no longer computes pitLaneProgress client-side; resolve reads canonical start/pit.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: The main-straight span and start line are canonical shared circuit data, generated and audited.
- request-AC2 -> This backlog slice. Proof: AC2: The map reads startProgress from canonical data and no longer scans geometry for it; longestStraight is gone.
- request-AC5 -> This backlog slice. Proof: AC3: The web no longer computes pitLaneProgress client-side; resolve reads canonical start/pit.
- request-AC4 -> This backlog slice. Evidence needed: The client-side re-derivation of director beats, overtakes, and weather/pack/pit positions is deleted; replayFacts is the sole source, guarded by a test that a resolved race always carries them.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_054_canonical_race_track_geometry_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_090_canonical_race_track_geometry_generate_semantic_track_markers_instead_of_interpreting_them_on_the_map`
- Primary task(s): `task_091_orchestrate_canonical_race_track_geometry`

# AI Context
- Summary: Generate the main straight and start line as canonical track data
- Keywords: scaffolded-backlog, generate the main straight and start line as canonical track data, implementation-ready
- Use when: Implementing the scaffolded slice for Generate the main straight and start line as canonical track data.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_091_orchestrate_canonical_race_track_geometry`

# Notes
- Task `task_091_orchestrate_canonical_race_track_geometry` was finished via `logics-manager flow finish task` on 2026-07-22.
