## item_212_consume_canonical_track_zones_in_replay_map_and_reports - Consume canonical track zones in replay, map, and reports
> From version: 0.3.27
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Replay and race reporting
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The replay and map can show visually correct movement while still explaining moments with locally inferred or generic segment semantics.
- Pit and overtake displays should use the same canonical zone identity that the simulation attached to the event.
- Report and overlay copy can become more specific without turning visual helpers into domain logic.

# Scope
- In:
  - Update replay helpers and overlays to prefer event/replay-fact `trackProgress`, `zoneKind`, and `zoneLabel` when positioning or describing race moments.
  - Use canonical pit and overtake zones for pit-stop and attack/defense annotations instead of re-deriving a semantic window from the map.
  - Keep `CircuitMap.tsx` responsible only for rendering a known progress value onto the route, not for deciding what the progress means.
  - Update race report or recap surfaces to include zone labels where they improve clarity and already come from simulation facts.
  - Add focused tests for replay math/director/report helpers that verify canonical metadata is consumed and visual-only behavior stays isolated.
- Out:
  - Large visual redesigns, new map assets, camera choreography, or animation systems.
  - Moving route projection utilities into shared domain code.
  - Adding user-facing explanatory UI about the track-zone system.

# Acceptance criteria
- AC1: Replay/map consumers prefer canonical zone metadata for pit, overtake, segment, and technical context.
- AC2: Shared track-zone helpers stay independent from web-only route projection and render state.
- AC3: Existing replay interactions and report rendering remain stable on desktop and mobile.
- AC4: Tests cover at least one pit moment and one overtake/segment moment using canonical zone metadata.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: Replay/map consumers prefer canonical zone metadata for pit, overtake, segment, and technical context.
- request-AC5 -> This backlog slice. Proof: AC2: Shared track-zone helpers stay independent from web-only route projection and render state.
- request-AC6 -> This backlog slice. Proof: AC3: Existing replay interactions and report rendering remain stable on desktop and mobile.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_057_canonical_track_zones_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_093_canonical_track_zones_for_spatial_race_simulation`
- Primary task(s): `task_094_orchestrate_canonical_track_zones_for_spatial_race_simulation`

# AI Context
- Summary: Consume canonical track zones in replay, map, and reports
- Keywords: scaffolded-backlog, consume canonical track zones in replay, map, and reports, implementation-ready
- Use when: Implementing the scaffolded slice for Consume canonical track zones in replay, map, and reports.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_094_orchestrate_canonical_track_zones_for_spatial_race_simulation`

# Notes
- Task `task_094_orchestrate_canonical_track_zones_for_spatial_race_simulation` was finished via `logics-manager flow finish task` on 2026-07-22.
