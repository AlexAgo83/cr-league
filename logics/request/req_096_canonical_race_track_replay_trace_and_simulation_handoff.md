## req_096_canonical_race_track_replay_trace_and_simulation_handoff - Canonical race-track replay trace and simulation handoff
> From version: 0.3.28
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Race-track replay architecture
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make the generated replay car trace the canonical source for live replay map positions, tower ordering, player context, pit alignment, event placement, and director markers for newly resolved races.
- Move circuit speed variation into the shared simulation trace generation or a shared trace-preparation layer so braking, cornering, exit recovery, and straight-line pace are represented once instead of applied as a web-only visual remap.
- Retire or strictly isolate legacy web fallback reconstruction paths now that generated race results carry replay facts, order changes, car traces, and zone metadata.
- Resolve the dual distance semantics between `trackLengthMeters` and `routeLengthMeters` with a documented source-of-truth contract for simulation scoring, replay pacing, circuit audit, and UI distance labels.
- Connect generated track zones and speed-profile spans so simulation events and replay facts can explain where a race moment happens without client-side semantic inference.
- Add a lightweight race-track replay inspection path that makes trace progress, speed phase, zone, ordering, and distance decisions visible to developers before deeper gameplay tuning begins.

# Context
- The current behavior is acceptable visually after the recent race-track fixes, but it is not yet the final architecture. The web replay layer still protects older or incomplete race results with fallback logic, while new results increasingly carry enough canonical data to avoid duplicated reasoning.
- The replay tower and map can disagree if one surface reads canonical trace car progress while another reads final rankings, inferred order changes, or a visually remapped progress value. Generated traces should provide the live race order contract; final classification remains the final result contract.
- The speed-profile work proved that route curvature can produce useful braking/corner/exit/straight rhythm. The next step is to place that rhythm at the trace boundary so every consumer sees the same car state instead of reapplying a rendering-only transform.
- `trackLengthMeters` currently feeds simulation distance and some labels, while `routeLengthMeters` now feeds replay pacing for map movement. Some circuits intentionally or historically have large differences between the two. That may be valid, but it must be named, audited, and consumed consistently.
- Backward compatibility matters only for already-persisted legacy results. New race resolution should have a stricter contract: complete replay facts, complete car trace data, canonical event progress, and zone metadata are expected.
- This request is an architecture consolidation, not a gameplay balance retune. It should not change winners, rewards, card effects, bot strategy, league cadence, or economy unless a later request explicitly uses track speed and zones for simulation scoring.

# Acceptance criteria
- AC1: Newly resolved races produce a complete canonical replay trace with per-car track progress, phase, speed/profile state where needed, canonical event progress, order changes, director beats, and zone metadata required by current replay consumers.
- AC2: Replay map positions, live tower ordering, player replay context, pit-stop placement, director markers, and event markers all prefer the canonical generated trace/facts for new races and cannot independently infer contradictory race semantics.
- AC3: Circuit speed-profile effects are applied at the shared trace-generation or trace-preparation boundary, and web replay motion does not apply an additional independent speed remap for canonical traces.
- AC4: Legacy fallback behavior is isolated behind an explicit adapter or guard with tests that prove older persisted results still replay, while generated traces use stricter validation and do not silently fall back to inferred facts.
- AC5: A documented distance contract explains `trackLengthMeters` versus `routeLengthMeters`, identifies which one owns simulation scoring, replay pacing, and display labels, and circuit audit fails on undocumented or suspicious drift.
- AC6: Generated track zones and speed-profile spans are connected enough that replay facts/events can expose useful braking, corner, exit, straight, pit, overtake, and sector context without importing web projection logic into shared code.
- AC7: A developer inspection artifact or command summarizes representative race-track replay traces, including progress, live order, zone, speed phase, pit moments, and distance basis for at least Prague, Monaco, Montreal, and one pit-stop race.
- AC8: Validation passes with `npm run typecheck`, `npm run lint`, focused replay/simulation tests, `npm run audit:circuits`, and `npm run logics:validate`; broader `npm test`/`npm run build` are run or explicitly justified in closeout.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_059_canonical_race_track_replay_trace_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/request/req_090_canonical_race_track_geometry_generate_semantic_track_markers_instead_of_interpreting_them_on_the_map.md
- logics/request/req_093_canonical_track_zones_for_spatial_race_simulation.md
- logics/request/req_095_canonical_corner_speed_profile_for_replay_motion.md
- logics/product/prod_054_canonical_race_track_geometry_product_brief.md
- logics/product/prod_058_canonical_corner_speed_profile_product_brief.md
- logics/scaffold/canonical-corner-speed-profile.json
- packages/shared/src/domain/circuits.ts
- packages/shared/src/domain/race.ts
- packages/shared/src/simulation/simulateRace.ts
- packages/shared/src/simulation/validateReplayTrace.ts
- apps/web/src/app/circuits.ts
- apps/web/src/features/CircuitMap.tsx
- apps/web/src/features/ReplayView.tsx
- apps/web/src/features/replay/replayMath.ts
- apps/web/src/features/replay/replayDirector.ts
- scripts/audit-circuits.mjs
- scripts/generate-circuit-speed-profiles.mjs
- Current replay state: the race-track work now has canonical route markers, generated track zones, generated speed profiles, visible corner slowdown, strict live classification for generated car traces, and route-length-based replay pacing. The remaining architecture gap is that replay rendering still contains compatibility reconstruction and visual speed remapping that can drift from the simulation trace.
- Code pointers: `simulateRace.ts` already emits `replayTrace.cars`, `replayFacts.directorBeats`, order changes, event `trackProgress`, and zone metadata. `ReplayView.tsx` and `replayMath.ts` still combine trace, facts, fallback plans, local progress mapping, and live tower ordering. `replayDirector.ts` still has a fallback director path. `circuits.ts` still carries both `trackLengthMeters` and `routeLengthMeters`, so the source of truth for simulation distance, display labels, and replay pacing needs an explicit contract.

# AI Context
- Summary: Canonical race-track replay trace and simulation handoff
- Keywords: request-chain-scaffold, canonical race-track replay trace and simulation handoff, development-ready
- Use when: You need to implement or review the scaffolded workflow for Canonical race-track replay trace and simulation handoff.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_219_define_the_canonical_replay_trace_contract_for_generated_races`
- `item_220_move_speed_profile_motion_into_the_shared_trace_handoff`
- `item_221_isolate_legacy_replay_fallbacks_behind_an_explicit_adapter`
- `item_222_normalize_circuit_distance_semantics_and_audit_drift`
- `item_223_add_race_track_replay_trace_inspection_and_representative_validation`
