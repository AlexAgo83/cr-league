## req_093_canonical_track_zones_for_spatial_race_simulation - Canonical track zones for spatial race simulation
> From version: 0.3.27
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Race-track data model
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Promote non-visual track semantics that currently live as map heuristics or abstract simulation phases into canonical shared circuit data.
- Introduce a small `TrackZone` model for sector, overtake, technical, and pit ranges so the simulation, replay facts, and race reports can speak about the same physical part of the track.
- Derive safe default zones from existing canonical circuit fields and route markers rather than hand-authoring full per-corner data for every circuit in v1.
- Annotate simulation events and replay facts with canonical progress and zone metadata where the model already knows a race moment happened.
- Keep visual-only map concerns, projection math, camera framing, marker poses, sprite drift, and tile/render details out of shared domain data.

# Context
- The current shared circuit identity already tracks real race facts: `trackLengthMeters`, `routeLengthMeters`, `laps`, `traits`, `likelyWeather`, `startProgress`, `pitLaneProgress`, `mainStraightStartProgress`, and `mainStraightEndProgress`. Those are the right source for race semantics.
- `CircuitMap.tsx` and replay helpers still contain useful non-visual concepts that are not represented as race-track data: sector ranges, pit entry/exit window, main straight/overtake window, dense-traffic windows, and local technical zones.
- The existing simulation mostly thinks in five abstract race segments (`start`, `early`, `mid`, `late`, `finish`). That is enough for v1 if each segment maps to a canonical progress range instead of staying detached from the circuit.
- This request follows the same principle as the canonical race-track geometry work: the map may render positions, but it should not invent race semantics. Canonical track zones belong in shared data/helpers; projection, camera, marker scale, and visual fitting stay in the web map.
- The first implementation should be deliberately small. Generate or derive zones from existing fields and traits, expose query helpers, and wire optional event/replay metadata without retuning cards or race scoring.

# Acceptance criteria
- AC1: A shared `TrackZone` contract exists for sector, overtake, technical, and pit ranges, with validation that every zone has normalized progress bounds and a stable label/kind.
- AC2: Every current circuit exposes canonical zones through shared helpers, derived from existing circuit fields where possible: five segment/sector ranges, a main-straight/overtake range, a pit entry/exit range, and trait-driven technical zones.
- AC3: Simulation events and replay facts that already refer to pit stops, overtakes/order changes, weather/traffic pressure, and segment beats carry optional canonical `trackProgress`, `zoneKind`, and `zoneLabel` metadata without changing scoring outcomes.
- AC4: Replay/map/report consumers use the canonical zone metadata when displaying pit, overtake, technical, or segment context, and no shared domain code imports web-only route projection, camera, tile, marker, or styling concerns.
- AC5: Existing outputs remain deterministic; no card balance, reward, scoring, or league cadence retune is included in this request.
- AC6: Validation passes with `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run audit:circuits`, and `npm run logics:validate`.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_057_canonical_track_zones_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/request/req_090_align_pit_stop_visual_position_stop_cars_where_the_pit_is_drawn_on_the_circuit_map.md
- logics/request/req_091_canonical_race_track_geometry_generate_semantic_track_markers_instead_of_interpreting_them_on_the_map.md
- packages/shared/src/domain/circuits.ts
- packages/shared/src/domain/race.ts
- packages/shared/src/simulation/simulateRace.ts
- apps/api/src/features/leagues/store.ts
- apps/web/src/app/circuits.ts
- apps/web/src/app/raceFlow.ts
- apps/web/src/features/CircuitMap.tsx
- apps/web/src/features/replay/replayMath.ts
- apps/web/src/features/replay/replayDirector.ts
- apps/web/src/features/replay/ReplayStageOverlay.tsx
- apps/web/src/features/ReportView.tsx
- scripts/audit-circuits.mjs

# AI Context
- Summary: Canonical track zones for spatial race simulation
- Keywords: request-chain-scaffold, canonical track zones for spatial race simulation, development-ready
- Use when: You need to implement or review the scaffolded workflow for Canonical track zones for spatial race simulation.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_210_add_canonical_track_zone_model_and_derived_circuit_zones`
- `item_211_annotate_simulation_events_and_replay_facts_with_track_zones`
- `item_212_consume_canonical_track_zones_in_replay_map_and_reports`
- `item_213_document_deferred_zone_driven_gameplay_tuning`
