## task_094_orchestrate_canonical_track_zones_for_spatial_race_simulation - Orchestrate canonical track zones for spatial race simulation
> From version: 0.3.27
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Read the existing canonical geometry requests and the live circuit/simulation/replay code before editing, especially `circuits.ts`, `race.ts`, `simulateRace.ts`, `CircuitMap.tsx`, `replayMath.ts`, and `replayDirector.ts`.
- [x] 2. Add the shared `TrackZone` contract and derived zone helpers first, with tests and circuit audit coverage proving every current circuit has sector, overtake, technical, and pit coverage.
- [x] 3. Wire the simulation to attach optional canonical progress and zone metadata to existing events/replay facts while preserving deterministic outputs and scoring behavior.
- [x] 4. Update replay, map, and report consumers to use zone metadata for pit/overtake/segment context while keeping projection and render-only logic inside the web layer.
- [x] 5. Document deferred zone-driven gameplay/card tuning as a follow-up instead of implementing balance changes in this slice.
- [x] 6. Run typecheck, lint, tests, build, audit:circuits, and Logics validation; record exact proof in the closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_210_add_canonical_track_zone_model_and_derived_circuit_zones`
- `item_211_annotate_simulation_events_and_replay_facts_with_track_zones`
- `item_212_consume_canonical_track_zones_in_replay_map_and_reports`
- `item_213_document_deferred_zone_driven_gameplay_tuning`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> item_210. Proof: shared `TrackZone` contract and validation for normalized bounds, kind, and labels.
- request-AC2 -> item_210. Proof: derived sector, overtake, pit, and technical zones cover every current circuit.
- request-AC3 -> item_211. Proof: simulation events and replay facts carry optional canonical progress and zone metadata.
- request-AC4 -> item_212. Proof: replay, map, and report consumers read zone metadata while shared code stays free of visual imports.
- request-AC5 -> item_211, item_213. Proof: deterministic behavior is preserved and zone-driven gameplay tuning remains deferred.
- request-AC6 -> This task. Proof: typecheck, lint, tests, build, circuit audit, and Logics validation are recorded before closeout.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- PASS: `rtk npm test -- packages/shared/src/domain/circuits.test.ts packages/shared/src/simulation/simulateRace.test.ts apps/web/src/features/ReplayView.test.ts` (53 passed).
- PASS: `rtk npm run typecheck`.
- PASS: `rtk npm run lint`.
- PASS: `rtk npm test` (255 passed, 7 skipped).
- PASS: `rtk npm run audit:circuits`.
- PASS: `rtk npm run build`.
- PASS: `rtk npm run logics:validate` (OK with pre-existing req_091 warnings only).
- Implemented canonical TrackZone/RaceTrackZone helpers, derived zones for every circuit, simulation event/replay fact zone metadata, replay/report consumers, and deferred gameplay tuning docs. Validation commands are recorded in the task Validation section.
- Finish workflow executed on 2026-07-22.
- Linked backlog/request close verification passed.

# Report
- In progress: shared `TrackZone`/`RaceTrackZone` helpers are derived from existing circuit fields and exported through shared code.
- In progress: `simulateRace` now annotates events, order-change facts, and director beats with optional `trackProgress`, `zoneKind`, and `zoneLabel` while preserving existing scoring paths.
- In progress: replay debug/director copy and report text consume canonical zone labels; `CircuitMap` remains render-only and receives canonical circuit data from `apps/web/src/app/circuits.ts`.
- Deferred by design: zone-aware card/scoring/bot tuning is documented in `item_213` and not included in this slice.
- Finished on 2026-07-22.
- Linked backlog item(s): `item_210_add_canonical_track_zone_model_and_derived_circuit_zones`, `item_211_annotate_simulation_events_and_replay_facts_with_track_zones`, `item_212_consume_canonical_track_zones_in_replay_map_and_reports`, `item_213_document_deferred_zone_driven_gameplay_tuning`
- Related request(s): `req_093_canonical_track_zones_for_spatial_race_simulation`

# AI Context
- Summary: Orchestrate canonical track zones for spatial race simulation
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_093_canonical_track_zones_for_spatial_race_simulation`
- Product brief(s): `prod_057_canonical_track_zones_product_brief`
- Architecture decision(s): (none yet)
