## req_090_canonical_race_track_geometry_generate_semantic_track_markers_instead_of_interpreting_them_on_the_map - Canonical race-track geometry: generate semantic track markers instead of interpreting them on the map
> From version: 0.3.27
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Race-track data model
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Extend the single-canonical-origin principle from the pit (req_089) to the whole semantic track geometry: generate the main-straight span and the start/finish line position once from the route, store them as shared circuit data, and have both the simulation and the map READ them instead of the map improvising them with magic numbers.
- Remove the client from deciding race geometry: the pit and start positions must come from canonical shared data at resolve time, not be computed on the web and sent into the simulation.
- Base replay pacing on canonical meters rather than projected pixels, and reconcile the authored track length with the route's real geometry.
- Delete the client-side re-derivation of director beats, overtakes, and weather/pack/pit positions now that the simulation emits them canonically in replayFacts, so there is nothing left to drift.

# Context
- This builds directly on req_089, which extracts the longest-straight heuristic into a shared module and makes the pit position canonical and single-origin. This request generalizes that: the SAME shared heuristic emits the start/finish line position and the main-straight span as canonical circuit fields too, so startProgress stops being a render constant (0.88) recomputed on the map. Do not re-do the pit work req_089 owns; consume its shared heuristic module and add the sibling markers.
- startProgress is the load-bearing one: it is the zero-point of all on-map car progress (progressFromStart/stageProgress) and the value the pit reconciliation subtracts. Making it canonical means the map reads it from circuit data (no 0.88 scan), analyzeCircuitRoute's geometry scan is removed or reduced to producing render-only poses (startLine/pitStop via poseOnRoute) from the canonical scalars, and the unused longestStraight output is dropped or moved to canonical data.
- The client-side pit computation in leagueMutations.ts:81-91 goes away: with the pit and start positions canonical in shared, resolveCurrentGrandPrix reads them directly (as req_089 already routes the sim), and the web no longer computes pitLaneProgress from a client-side circuitRouteAnalysis call. This closes a determinism/trust gap in the same family as req_086's client-supplied resolve inputs.
- Replay scale: switch replayDistanceScale (replayMath.ts:200) from circuitDisplayLength (projected pixels, zoom-dependent) to a canonical meters basis. Either reconcile the authored trackLengthMeters (circuits.ts) with the geodesic circuitLengthMeters (replayMath.ts:204) by generating/validating it, or use the real meters directly; wire the currently-unused circuitLengthMeters into the canonical length or delete it. Nothing should depend on pixel length for pacing.
- Delete the client beat duplication: replayDirector.ts:43-74 and the replayMath fallbacks (orderChangesFromTrace, weather/pack copies, pitStopTraceProgress magic search) re-implement what simulateRace already emits in result.replayFacts. Remove the fallback branches and rely on replayFacts as the sole source; guard with a test asserting a resolved race always carries directorBeats/orderChanges so the deletion is safe, and keep only the thin facts-consuming path.
- Out of scope: introducing real per-corner or real sector geometry (the sim's abstract 5-segment model stays); changing the map projection, zoom-fit, tiling, camera, drift/heading, or path smoothing (all legitimately render-only); retuning any placement magic number's value (0.18/0.88 stay as the generation heuristic, just moved to one canonical origin); and the pit work owned by req_089.

# Acceptance criteria
- AC1: The main-straight span and start/finish line position are generated once from the route geometry (via the shared heuristic from req_089), stored as canonical shared circuit data, and both the simulation and the map read them; the map no longer derives startProgress from a 0.88 render constant and the unused longestStraight output is gone.
- AC2: The pit and start positions reach the simulation from canonical shared data at resolve time; the web no longer computes pitLaneProgress from a client-side route analysis (leagueMutations.ts:81-91 is removed).
- AC3: Replay pacing is scaled from canonical meters, not projected pixels; the authored trackLengthMeters is reconciled with the route geometry (generated or validated), and circuitLengthMeters is either the canonical basis or deleted.
- AC4: The client-side re-derivation of director beats, overtakes, and weather/pack/pit positions is deleted; replayFacts is the sole source, guarded by a test that a resolved race always carries them.
- AC5: Replays remain seed-deterministic and npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, npm run audit:circuits, and npm run logics:validate pass.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_054_canonical_race_track_geometry_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/request/req_087_simulation_fidelity_and_replay_performance_qualifying_track_response_replay_render_cost_recap_accuracy_and_input_robustness.md
- logics/request/req_089_align_pit_stop_visual_position_stop_cars_where_the_pit_is_drawn_on_the_circuit_map.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- packages/shared/src/domain/circuits.ts
- packages/shared/src/simulation/simulateRace.ts
- apps/web/src/features/CircuitMap.tsx
- apps/web/src/features/replay/replayMath.ts
- apps/web/src/features/replay/replayDirector.ts
- apps/web/src/app/leagueMutations.ts
- apps/web/src/app/circuitRoutes
- scripts/generate-circuit.mjs
- scripts/audit-circuits.mjs
- Architecture audit (2026-07-22) following the pit-stop alignment work (req_089): the race track's SEMANTIC geometry does not exist as canonical data anywhere. Route files (apps/web/src/app/circuitRoutes/*.ts) are pure {lat,lng}[] with no markers; the shared circuit identity (packages/shared/src/domain/circuits.ts) carries only city/layoutKey/laps/trackLengthMeters/traits/likelyWeather; the simulation works in an abstract 5-segment progress model that never sees geometry. So the web map IMPROVISES race meaning from raw points with magic numbers, and the sim improvises separately. Findings. (1) analyzeCircuitRoute (CircuitMap.tsx:215-254) greedily detects the longest straight (tolerance 18 degrees, CircuitMap.tsx:52) and from it derives TWO gameplay-relevant placements: pitProgress = straightStart + length*0.18 (CircuitMap.tsx:240) and startProgress/lineProgress = straightStart + length*0.88 (CircuitMap.tsx:241). startProgress is not just a marker: it is the ORIGIN of all on-map car progress via progressFromStart/stageProgress (CircuitMap.tsx:354,379,384,410) and the championship thumbnail (ChampionshipView.tsx:296); a render constant (0.88) silently defines the zero-point the sim's pit math is reconciled against. The longestStraight field (CircuitMap.tsx:248) is returned but has no consumer. (2) The pit value is currently computed CLIENT-SIDE: leagueMutations.ts:81-91 calls circuitRouteAnalysis on the web and sends pitLaneProgress = ((pitProgress - startProgress) % 1 + 1) % 1 into the resolve request, so the sim consumes a client-decided position (a determinism/trust concern, same family as req_086's client-supplied traits); req_089 makes the pit canonical but startProgress remains map-derived. (3) Replay pacing is scaled by PROJECTED PIXELS: replayDistanceScale = circuitDisplayLength(circuit) * laps / 9000 (replayMath.ts:200-202), where circuitDisplayLength is the pixel length of the projected route (CircuitMap.tsx:256), while the sim computes real distances from the authored trackLengthMeters. circuitLengthMeters (replayMath.ts:204-210) computes the true geodesic length of the same route but is exported and UNUSED, and nothing asserts the authored trackLengthMeters matches the geometry. (4) The client re-derives race beats the sim already emits: replayDirector.ts:43-74 re-implements simulateRace.ts buildReplayDirectorBeats (grid/overtake/weather/pack/pit/final) line-for-line, gated as a fallback behind result.replayFacts?.directorBeats?.length (replayDirector.ts:33); orderChangesFromTrace (replayMath.ts:120-139) duplicates buildReplayFacts.orderChanges; the weather-beat progress max(0.2, idx/5) (replayDirector.ts:27,61) and pack-beat window (replayDirector.ts:64) are byte-identical copies of simulateRace.ts:191,195; pitStopTraceProgress (replayMath.ts:270-288) is a magic-window binary search superseded by the sim's event.traceProgress. These fallbacks agree today only because facts win, and exist only to drift.

# AI Context
- Summary: Canonical race-track geometry: generate semantic track markers instead of interpreting them on the map
- Keywords: request-chain-scaffold, canonical race-track geometry: generate semantic track markers instead of interpreting them on the map, development-ready
- Use when: You need to implement or review the scaffolded workflow for Canonical race-track geometry: generate semantic track markers instead of interpreting them on the map.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_204_generate_the_main_straight_and_start_line_as_canonical_track_data`
- `item_205_base_replay_scale_on_canonical_meters_and_reconcile_track_length`
- `item_206_delete_client_side_replay_beat_re_derivation_replayfacts_is_the_sole_source`
