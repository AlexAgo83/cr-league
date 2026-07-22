## req_095_canonical_corner_speed_profile_for_replay_motion - Canonical corner speed profile for replay motion
> From version: 0.3.28
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Replay fidelity
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Generate a canonical per-circuit speed profile from route geometry so replay motion can slow before corners, carry lower speed through apex-like curved spans, and accelerate on exits/straights without hand-authoring every route.
- Store the speed profile as shared circuit data or deterministic shared helpers so the map/replay consumes a single stable source instead of recalculating curvature every animation frame.
- Use the speed profile in replay motion first, without changing simulation outcomes, classification, gaps, pit timing, rewards, cards, or event ordering.
- Validate that every current circuit has sane speed-profile coverage, no zero-speed dead zones, smooth enough transitions for watchable replay, and deterministic generated data.
- Document the explicit handoff criteria for a later simulation integration pass, so this slice reaches a complete replay-visible endpoint instead of becoming an open-ended physics project.

# Context
- The product observation is valid: after canonical race-track fixes, replay playback became more distance-faithful and therefore felt slower. Global speed calibration helped, but the better model is not a bigger multiplier; the circuit should describe where cars visually slow and recover.
- The current map already has the raw ingredients for a lazy v1. CircuitMap.tsx can compute heading changes from route points, and driftAngle already uses local angle deltas for visual turn feel. That same local curvature concept should be promoted into generated/shared speed-profile data, not recomputed in render loops.
- The first implementation must stay replay-only. The simulation trace, tower gaps, overtakes, event timings, pit-stop windows, and final classification remain the source of truth. The speed profile only changes how a car's visual progress is eased between canonical trace points on the route.
- The generated profile should be small and inspectable: normalized progress ranges with a factor and kind such as braking, corner, exit, or straight. It should be derived from route segment angles and lengths, then smoothed/merged so the replay does not stutter from tiny route-point noise.
- Main straight and track zones already exist as canonical geometry. Use them where helpful: main-straight spans can receive a mild speed-up, technical/curved zones can receive slowdown, but the first version should remain geometry-led rather than a gameplay balance retune.
- Simulation integration is deliberately a follow-up gate, not hidden scope. It becomes valid only after replay-only behavior is visually accepted and measured: no desync with events, pit stops still align, overtakes still read correctly, and generated profiles pass audit across all circuits.

# Acceptance criteria
- AC1: A shared `TrackSpeedProfile` contract exists with normalized progress ranges, speed factors, and stable kinds/labels, and every current circuit exposes a generated profile from route geometry.
- AC2: The generator/audit validates each profile: progress bounds are valid, factors stay within a documented safe range, adjacent noisy spans are merged or smoothed, coverage is complete enough for interpolation, and no profile can stall replay motion.
- AC3: Replay map motion consumes the canonical speed profile to visually slow before/through high-curvature spans and recover on exits/straights, while simulation results, event order, pit-stop logic, tower gaps, and classification are unchanged.
- AC4: Replay remains deterministic and watchable across representative circuits: a mostly straight route, a tight technical route, a long route, and a pit-stop race all keep aligned markers/events and non-jarring car motion.
- AC5: The implementation leaves an explicit simulation-handoff note with criteria for a later pass, but does not change card balance, race scoring, bot strategy, or result generation in this slice.
- AC6: Validation passes with `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run audit:circuits`, and `npm run logics:validate`.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_058_canonical_corner_speed_profile_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- logics/request/req_090_canonical_race_track_geometry_generate_semantic_track_markers_instead_of_interpreting_them_on_the_map.md
- logics/request/req_093_canonical_track_zones_for_spatial_race_simulation.md
- packages/shared/src/domain/circuits.ts
- packages/shared/src/domain/race.ts
- packages/shared/src/simulation/simulateRace.ts
- apps/web/src/app/circuits.ts
- apps/web/src/features/CircuitMap.tsx
- apps/web/src/features/replay/replayMath.ts
- apps/web/src/features/replay/useReplayClock.ts
- apps/web/src/features/replay/ReplayStageOverlay.tsx
- scripts/generate-circuit.mjs
- scripts/audit-circuits.mjs
- Current replay context: canonical track geometry made replay pacing distance-faithful, which made playback feel slower. A short-term calibration removed the 0.5x speed option and doubled the effective replay clock. The next step is not another global speed tweak: the track should expose where cars naturally slow down and speed up, derived from route curvature and straights.
- Code pointers: CircuitMap.tsx already computes route poses and turn feel with poseOnRoute, angleDelta, driftAngle, DRIFT_LOOKAHEAD, HEADING_LOOKAHEAD, routeSegments, routeLength, and stageProgress. Shared circuit identities already carry routeLengthMeters, startProgress, pitLaneProgress, mainStraightStartProgress, mainStraightEndProgress, track traits, and generated track zones. replayMath.ts owns replayDistanceScale and carProgressAtTrace; useReplayClock.ts owns elapsed replay time, while CircuitMap renders a known progress value onto the route.

# AI Context
- Summary: Canonical corner speed profile for replay motion
- Keywords: request-chain-scaffold, canonical corner speed profile for replay motion, development-ready
- Use when: You need to implement or review the scaffolded workflow for Canonical corner speed profile for replay motion.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_215_generate_canonical_speed_profiles_from_circuit_route_curvature`
- `item_216_apply_speed_profiles_to_replay_motion_without_changing_race_outcomes`
- `item_217_validate_replay_speed_profiles_across_representative_circuits`
- `item_218_document_the_simulation_handoff_for_speed_profile_gameplay`
