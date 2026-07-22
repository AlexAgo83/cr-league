## req_089_align_pit_stop_visual_position_stop_cars_where_the_pit_is_drawn_on_the_circuit_map - Align pit-stop visual position: stop cars where the pit is drawn on the circuit map
> From version: 0.3.27
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85
> Complexity: Medium
> Theme: Replay fidelity
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make the pit-stop position a single generated property of the circuit that BOTH the simulation (to stop the car) and the map (to draw the garage) READ, instead of each side deciding its own position — so cars visibly halt exactly where the pit is rendered.
- Generate that per-circuit pit-lane progress from the route geometry at circuit-generation time and store it as shared circuit data, so the sim stops using the hardcoded 0.5 and the map stops re-deriving its own pitProgress.
- Draw the marker with the same projection the map uses for cars, so alignment is structural (not two derivations that happen to match), and keep replays seed-deterministic.

# Context
- The user chose the clean option, then sharpened it: the pit is a generated property of the circuit with exactly ONE origin. The geometry-derived pit location is the source of truth, the car must stop there (not move the marker to 0.5), and — critically — the map must READ that canonical value rather than re-derive its own pitProgress. Two derivations that "match by construction" are rejected; there is one value, generated once, read by both sides.
- Because route geometry and its pit derivation live only in the web (circuitScene/analyzeCircuitRoute over apps/web/src/app/circuitRoutes/*.ts) while simulateRace runs shared/API-side, the cleanest single-source-of-truth is to precompute each circuit's from-start pit-lane progress once and store it as shared circuit data — a pitLaneProgress field on the circuit identity in packages/shared/src/domain/circuits.ts (or a companion map keyed by layoutKey). The value is deterministic from the route geometry, so it can be generated offline by the same longest-straight heuristic analyzeCircuitRoute uses (compute pitProgress and startProgress from the route points, then pitLaneProgress = ((pitProgress - startProgress) % 1 + 1) % 1).
- To keep the baked value from drifting when a route file changes, generate it through the existing scripts (scripts/generate-circuit.mjs to emit it, scripts/audit-circuits.mjs to validate that the stored value still matches the route geometry). Treat a mismatch as an audit failure.
- Once the value is shared data: replace the hardcoded pitLaneProgress: 0.5 in resolveCurrentGrandPrix (store.ts:724) with the circuit's pitLaneProgress, and pass the same value anywhere else the sim is fed a pit position (qualifying and preview paths, and the demo/default race input). The web map must READ the same shared value — analyzeCircuitRoute stops computing its own pitProgress/pitStop, and pitLapProgress / pitStopTraceProgress (replayMath.ts:166 and callers) resolve to the canonical value.
- Structural alignment via the car projection: draw the marker as poseOnRoute(renderPoints, stageProgress(pitLaneProgress)) — the SAME transform applied to cars (stageProgress = progressFromStart(progress, startProgress), CircuitMap.tsx:354). Then the marker is literally "where a car at pitLaneProgress is drawn", so a pitting car's pose equals the marker by construction. startProgress stays a map-only projection concern (it never reaches the sim) and is applied identically to cars and marker, so its exact value cannot break alignment. Feed the FROM-START fraction into the sim (its progress is start-relative), not a raw route value.
- Out of scope: changing the longest-straight pit-placement heuristic itself, moving the full route geometry into shared (only the derived scalar is needed), the distance-vs-time replay dwell behavior (separate concern), and any pit-stop timing/cost balance.

# Acceptance criteria
- AC1: Each circuit exposes exactly one canonical, generated from-start pit-lane progress as shared data, produced by a single shared implementation of the longest-straight heuristic and validated by the circuit audit so it cannot silently drift; no second pit-position derivation remains in the codebase.
- AC2: The simulation reads that canonical value — resolveCurrentGrandPrix and the qualifying/preview/demo sim inputs feed it into simulateRace instead of the hardcoded 0.5.
- AC3: The map reads the same canonical value and draws the marker with the same projection it uses for cars, so a pitting car's rendered pose equals the drawn pit-garage marker for every circuit, verified by a test.
- AC4: Replays remain seed-deterministic and npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, npm run audit:circuits, and npm run logics:validate pass.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_053_pit_stop_visual_alignment_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/request/req_087_simulation_fidelity_and_replay_performance_qualifying_track_response_replay_render_cost_recap_accuracy_and_input_robustness.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- packages/shared/src/simulation/simulateRace.ts
- packages/shared/src/domain/circuits.ts
- apps/api/src/features/leagues/store.ts
- apps/web/src/features/CircuitMap.tsx
- apps/web/src/features/replay/replayMath.ts
- apps/web/src/app/circuitRoutes
- scripts/generate-circuit.mjs
- scripts/audit-circuits.mjs
- During-race pit stops render the car halting at the WRONG spot on the circuit map: it stops cleanly (not a glide), but not where the pit garage graphic is drawn. Root cause is two independent, unrelated pit positions. WHERE THE CAR STOPS is decided by the simulation: pitLaneTrackProgress (simulateRace.ts:374-378) returns (lapIndex + pitLaneProgress) / laps, and pitLaneProgress is a simulation input that resolveCurrentGrandPrix hardcodes to 0.5 (store.ts:724) — a flat half-lap constant that ignores circuit geometry entirely. WHERE THE PIT IS DRAWN is decided by the web map geometry: analyzeCircuitRoute (CircuitMap.tsx:240) computes pitProgress = (straightStart + (best.length / total) * 0.18) % 1 (18% into the longest straight) and draws the garage at poseOnRoute(points, pitProgress) (CircuitMap.tsx:439). These two values coincide only by accident. There is already a web helper pitLapProgress(circuit) (replayMath.ts:166) that expresses the drawn pit position as a fraction from the start line — exactly the quantity the sim's pitLaneProgress means — but it is never fed into the simulation. ARCHITECTURE CONSTRAINT: the route geometry (the point arrays in apps/web/src/app/circuitRoutes/*.ts, 26 files) and the pit-progress derivation (circuitScene/analyzeCircuitRoute) live only in the web, while simulateRace runs shared/API-side and has no access to route geometry; packages/shared/src/domain/circuits.ts carries only metadata (traits, laps, trackLengthMeters, layoutKey), not geometry. OFFSET DETAIL: the car is drawn via stageProgress = progressFromStart(progress, startProgress) (CircuitMap.tsx:354) which offsets by the start line, while the marker uses raw pitProgress; feeding the from-start value pitLapProgress into the sim makes the car's drawn position land back on raw pitProgress, so the offset resolves correctly ONLY if the value fed to the sim is the from-start pit fraction, not the raw one.

# AI Context
- Summary: Align pit-stop visual position: stop cars where the pit is drawn on the circuit map
- Keywords: request-chain-scaffold, align pit-stop visual position: stop cars where the pit is drawn on the circuit map, development-ready
- Use when: You need to implement or review the scaffolded workflow for Align pit-stop visual position: stop cars where the pit is drawn on the circuit map.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_202_expose_per_circuit_pit_lane_progress_as_shared_circuit_data`
- `item_203_feed_the_circuit_pit_lane_progress_into_the_simulation_and_align_the_marker`
