## item_210_add_canonical_track_zone_model_and_derived_circuit_zones - Add canonical track zone model and derived circuit zones
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
- The shared circuit model has canonical markers, but it does not expose a reusable concept for sector, overtake, technical, or pit ranges.
- The simulation's five segments are abstract names instead of real circuit progress windows.
- Pit and main-straight data are single points/spans today, so consumers still need local interpretation to know the surrounding window.

# Scope
- In:
  - Define a compact shared `TrackZone` type with kind, label, startProgress, endProgress, and optional weight or source metadata only if needed by current consumers.
  - Add helpers in shared code for `trackZonesForCircuit`, `zonesAtProgress`, `zoneForRaceSegment`, `progressRangeForRaceSegment`, and `pitWindowForCircuit` or equivalent names that match local style.
  - Derive five sector zones for every circuit from the existing race segment model, preserving current segment order and determinism.
  - Derive the overtake/main-straight zone from `mainStraightStartProgress` and `mainStraightEndProgress`.
  - Derive a pit zone with entry, stop, and exit semantics from `pitLaneProgress` and a small documented window; do not use map projection to do this.
  - Add trait-driven technical zones only as lightweight defaults, such as tighter/lower-weight windows for technical circuits, without hand-authoring every corner.
  - Validate zones in `scripts/audit-circuits.mjs` or a focused shared test so invalid progress bounds fail locally.
- Out:
  - Per-corner handcrafted geometry for every city route.
  - Visual poses, route coordinates, SVG placement, camera, or marker transforms.
  - Changing card effects, race segment weights, or final classification logic.

# Acceptance criteria
- AC1: Shared types/helpers expose track zones without importing web route or projection modules.
- AC2: Every current circuit has five sector zones, at least one overtake zone, and one pit zone.
- AC3: Zone validation covers normalized progress bounds, wraparound ranges where needed, known zone kinds, and stable labels.
- AC4: Existing circuit audit or tests fail if a circuit lacks required zone coverage.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Shared types/helpers expose track zones without importing web route or projection modules.
- request-AC2 -> This backlog slice. Proof: AC2: Every current circuit has five sector zones, at least one overtake zone, and one pit zone.
- request-AC5 -> This backlog slice. Proof: AC3: Zone validation covers normalized progress bounds, wraparound ranges where needed, known zone kinds, and stable labels.
- request-AC6 -> This backlog slice. Proof: AC4: Existing circuit audit or tests fail if a circuit lacks required zone coverage.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_057_canonical_track_zones_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_093_canonical_track_zones_for_spatial_race_simulation`
- Primary task(s): `task_094_orchestrate_canonical_track_zones_for_spatial_race_simulation`

# AI Context
- Summary: Add canonical track zone model and derived circuit zones
- Keywords: scaffolded-backlog, add canonical track zone model and derived circuit zones, implementation-ready
- Use when: Implementing the scaffolded slice for Add canonical track zone model and derived circuit zones.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_094_orchestrate_canonical_track_zones_for_spatial_race_simulation`

# Notes
- Task `task_094_orchestrate_canonical_track_zones_for_spatial_race_simulation` was finished via `logics-manager flow finish task` on 2026-07-22.
