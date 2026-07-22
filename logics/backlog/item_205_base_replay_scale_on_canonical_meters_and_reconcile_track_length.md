## item_205_base_replay_scale_on_canonical_meters_and_reconcile_track_length - Base replay scale on canonical meters and reconcile track length
> From version: 0.3.27
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Replay fidelity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- replayDistanceScale = circuitDisplayLength(circuit) * laps / 9000 (replayMath.ts:200-202) scales replay pacing by PROJECTED PIXELS, which depend on map zoom/projection, not on the track.
- The authored trackLengthMeters (circuits.ts) and the geodesic circuitLengthMeters (replayMath.ts:204) are two independent lengths with nothing asserting they match; circuitLengthMeters is exported but unused.

# Scope
- In:
  - Switch replayDistanceScale to a canonical meters basis instead of projected pixels.
  - Reconcile trackLengthMeters with the route geometry: generate or validate it from the geodesic length, and either make circuitLengthMeters the canonical basis or delete it.
  - Confirm replay pacing is unchanged in feel for existing circuits (or intentionally corrected) and stays seed-deterministic.
- Out:
  - Changing the projection or display units on the map.
  - Retuning race pacing beyond removing the pixel dependency.
  - Altering trackLengthMeters values that already match geometry.

# Acceptance criteria
- AC1: Replay pacing derives from canonical meters, with no dependency on projected pixel length.
- AC2: trackLengthMeters is reconciled with the route geometry (generated or validated), and circuitLengthMeters is either the basis or removed.
- AC3: Replays stay seed-deterministic.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: Replay pacing derives from canonical meters, with no dependency on projected pixel length.
- request-AC5 -> This backlog slice. Proof: AC2: trackLengthMeters is reconciled with the route geometry (generated or validated), and circuitLengthMeters is either the basis or removed.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_054_canonical_race_track_geometry_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_090_canonical_race_track_geometry_generate_semantic_track_markers_instead_of_interpreting_them_on_the_map`
- Primary task(s): `task_091_orchestrate_canonical_race_track_geometry`

# AI Context
- Summary: Base replay scale on canonical meters and reconcile track length
- Keywords: scaffolded-backlog, base replay scale on canonical meters and reconcile track length, implementation-ready
- Use when: Implementing the scaffolded slice for Base replay scale on canonical meters and reconcile track length.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
