## item_211_annotate_simulation_events_and_replay_facts_with_track_zones - Annotate simulation events and replay facts with track zones
> From version: 0.3.27
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Simulation fidelity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Race events can describe a pit stop, weather issue, dense traffic, or overtake without consistently saying where on the circuit it happened.
- Replay facts already carry some progress information, but consumers still infer the semantic location locally.
- Without canonical zone metadata, future simulation/card changes will keep re-creating track logic in different modules.

# Scope
- In:
  - Extend `RaceEvent` and replay-fact shapes with backward-compatible optional fields such as `trackProgress`, `zoneKind`, and `zoneLabel`.
  - Map each simulation segment to the canonical sector zone when building replay trace, director beats, and events.
  - Attach pit-zone metadata to pit-stop events and facts using the canonical pit window.
  - Attach overtake-zone metadata to order changes when progress falls inside a canonical overtake zone; otherwise attach the sector zone so the event still has a location.
  - Attach technical or traffic zone metadata to dense-pack, weather, and handling-related events only when the existing deterministic model already selects that moment.
  - Add tests proving the same seed/race inputs still produce deterministic results and that new metadata is present for representative pit, overtake, and weather/traffic cases.
- Out:
  - Changing winner selection, time deltas, rewards, card consumption, or race report verdicts.
  - Adding random location generation that is not tied to existing deterministic simulation state.
  - Retuning card effectiveness around zones in this request.

# Acceptance criteria
- AC1: Representative simulation events carry canonical progress and zone metadata where applicable.
- AC2: Replay facts expose zone metadata without requiring the web layer to recompute race semantics.
- AC3: Determinism tests cover the new metadata as part of the result shape.
- AC4: Existing public API and stored-result compatibility is preserved through optional fields or documented migration-safe changes.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: Representative simulation events carry canonical progress and zone metadata where applicable.
- request-AC5 -> This backlog slice. Proof: AC2: Replay facts expose zone metadata without requiring the web layer to recompute race semantics.
- request-AC6 -> This backlog slice. Proof: AC3: Determinism tests cover the new metadata as part of the result shape.
- request-AC4 -> This backlog slice. Evidence needed: Replay/map/report consumers use the canonical zone metadata when displaying pit, overtake, technical, or segment context, and no shared domain code imports web-only route projection, camera, tile, marker, or styling concerns.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_057_canonical_track_zones_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_093_canonical_track_zones_for_spatial_race_simulation`
- Primary task(s): `task_094_orchestrate_canonical_track_zones_for_spatial_race_simulation`

# AI Context
- Summary: Annotate simulation events and replay facts with track zones
- Keywords: scaffolded-backlog, annotate simulation events and replay facts with track zones, implementation-ready
- Use when: Implementing the scaffolded slice for Annotate simulation events and replay facts with track zones.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_094_orchestrate_canonical_track_zones_for_spatial_race_simulation`

# Notes
- Task `task_094_orchestrate_canonical_track_zones_for_spatial_race_simulation` was finished via `logics-manager flow finish task` on 2026-07-22.
