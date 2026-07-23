## req_101_replay_map_render_performance_memoize_route_geometry_hoist_static_svg_layers_imperative_car_transforms_and_throttle_non_positional_state - Replay map render performance: memoize route geometry, hoist static SVG layers, imperative car transforms, and throttle non-positional state
> From version: 0.4.1
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Replay render performance
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Eliminate the dominant per-frame cost by memoizing immutable route geometry so route segments are computed once per points array instead of ~9 times per car per frame.
- Stop re-rendering the static SVG layers (map tiles and route paths) 60 times a second when only car positions change.
- Move per-frame car positioning off the React render path to imperative DOM transforms, mirroring the existing camera loop.
- Throttle the non-positional replay state (standings tower, live lap/segment, active moment) so it does not recompute every frame.
- Prove the optimization is behavior-preserving and add a lightweight non-regression guard on the redundant geometry work.

# Context
- Route geometry memo (CircuitMap.tsx): the points array from circuitScene is stable for the circuit's lifetime, so cache route segments on its reference. Introduce a module-level `const routeGeometryCache = new WeakMap<RoutePoint[], { segments: RouteSegment[]; total: number }>()` and a `getRouteGeometry(points)` that returns the cached value or builds it once (segments with from/to/length/angle/startDistance/endDistance, plus the total length). Have routeSegments delegate to it and pointOnRoute (CircuitMap.tsx:157) read `{ segments, total }` from it instead of rebuilding segments and re-reducing the total each call. Behavior must be identical (same coordinates/angles). Optional: since segments now carry startDistance/endDistance, replace the linear scan in pointOnRoute with a binary search over cumulative distance - only if it stays exactly equivalent numerically.
- Hoist static layers (CircuitMap.tsx:392-420): wrap the tile-layer JSX in a useMemo keyed on [tiles, zoom] and the route-layer JSX (the four route <path>s plus start-line and pit-stop) in a useMemo keyed on [renderD, routeDecorStyle, routeAnalysis, hasCars] so they do not reconcile on every frame. Do not include cars or snapshot in those keys. Also memoize the cars array in ReplayView.tsx:253 (useMemo on [field, snapshot]) to avoid a fresh allocation each render.
- Imperative car transforms (CircuitMap.tsx + useReplayClock.ts): keep carProgress in a ref and, in the playback rAF loop, write each `.map-car` group's transform directly (translate to the pose, matching what render currently computes via poseOnRoute + stageProgress), the same way the camera loop sets transforms at CircuitMap.tsx:371-372, instead of driving positions through setSnapshot. React then renders the car structure once; only transforms update per frame. The rendered structure (sprites, labels, deltas) must match the current output exactly at any given progress. This is the most invasive step - do it after A and B1 and keep it isolated so it can be reverted independently.
- Throttle non-positional state (useReplayClock.ts:135-150): accumulate elapsed time in the rAF loop and only call the tower/live/active-moment updates about every 100ms (or on change), while positions update every frame (via the imperative path). setLive is already change-guarded (useReplayClock.ts:84); apply the same 'only when it actually changes / at reduced cadence' discipline to createTower and activeMomentId. Scrubbing (seek) must still update immediately.
- Verification: assert byte-identical replay output before/after (a fixed seed's carProgress snapshots and final classification/trace unchanged). Add a small non-regression check that route geometry is built at most once per circuit points array over a simulated playback (e.g. a counter/spy on the build path asserting it is not called per-frame). Keep CircuitMap.test.ts, ReplayView.test.ts, useReplayClock.test.ts green.
- Out of scope: any change to circuit generation (circuitScene, analyzeCircuitRoute, speed profiles) or to simulateRace/trace output; changing the visual design of the map or cars; swapping the SVG renderer for canvas/WebGL; reducing tile resolution or route point count; adding a new dependency.

# Acceptance criteria
- AC1: Route segment geometry is computed at most once per circuit points array (memoized on its reference), and pointOnRoute/poseOnRoute/driftAngle read from the cache; coordinates and angles are numerically identical to before.
- AC2: The map tile layer and route path layer no longer reconcile on every playback frame (memoized), and the cars array is memoized in ReplayView; only car positions change per frame.
- AC3: Per-frame car positioning is applied imperatively (like the camera loop) rather than through setSnapshot, and the rendered car structure at any given progress matches the previous output exactly.
- AC4: The standings tower, live lap/segment, and active moment update at a reduced cadence (~100ms or on change) rather than every frame, while scrubbing updates immediately.
- AC5: Replay output is byte-identical (fixed-seed carProgress snapshots, final classification, and trace unchanged), and a non-regression check proves route geometry is not rebuilt per frame.
- AC6: npm run typecheck, npm test, npm run lint, and npm run logics:validate pass, no existing test is deleted, and circuit generation and simulateRace are untouched.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_064_replay_map_render_performance_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- apps/web/src/features/CircuitMap.tsx
- apps/web/src/features/CircuitMap.test.ts
- apps/web/src/features/ReplayView.tsx
- apps/web/src/features/ReplayView.test.ts
- apps/web/src/features/replay/useReplayClock.ts
- apps/web/src/features/replay/useReplayClock.test.ts
- apps/web/src/features/replay/replayMath.ts
- Performance investigation on 2026-07-23 (HEAD c035120). Replay map rendering became laggy after the replay/race-track work. Root cause is entirely in the render path, NOT the simulation. Findings. (1) ROUTE GEOMETRY REBUILD: CircuitMap.tsx:158 pointOnRoute calls routeSegments(points) on EVERY invocation, and routeSegments walks the full points array (400-600 points per circuit) computing hypot+atan2 per segment. Per car per frame, poseOnRoute calls pointOnRoute 3x and driftAngle calls poseOnRoute 2x (=6x pointOnRoute), so ~9 routeSegments rebuilds per car per frame; with ~20 cars x ~600 points x 9 x 60fps that is millions of redundant trig operations per second, redundant because the points array is immutable for the life of the circuit. The camera loop (CircuitMap.tsx:349-355) also calls poseOnRoute each frame, compounding it. (2) FULL SVG RE-RENDER PER FRAME: the playback rAF loop (useReplayClock.ts:142) calls updateLive every frame, which calls setSnapshot (useReplayClock.ts:107) every frame; ReplayView.tsx:253 rebuilds the cars array on every render from snapshot.carProgress, so CircuitMap re-renders its entire SVG subtree (map tiles + the four heavy route <path>s at CircuitMap.tsx:405-409 + every car sprite) 60x/s even though only car positions changed. The camera already moves imperatively via setAttribute (CircuitMap.tsx:371-372) without re-render; the cars do not. (3) NON-POSITIONAL STATE AT 60FPS: updateLive also recomputes createTower and the active moment every frame; the standings tower, live lap/segment, and activeMoment do not need 60fps refresh (setLive is already change-guarded at useReplayClock.ts:84, the rest is not). HARD CONSTRAINT: car positions, replay trace, and finishing order must be byte-identical after the change; circuit generation (circuitScene/analyzeCircuitRoute) and simulateRace must not change; existing tests (CircuitMap.test.ts, ReplayView.test.ts, useReplayClock.test.ts) must stay green. This corpus is written to be executed end-to-end by another AI agent.

# AI Context
- Summary: Replay map render performance: memoize route geometry, hoist static SVG layers, imperative car transforms, and throttle non-positional state
- Keywords: request-chain-scaffold, replay map render performance: memoize route geometry, hoist static svg layers, imperative car transforms, and throttle non-positional state, development-ready
- Use when: You need to implement or review the scaffolded workflow for Replay map render performance: memoize route geometry, hoist static SVG layers, imperative car transforms, and throttle non-positional state.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_247_memoize_immutable_route_geometry`
- `item_248_hoist_static_svg_layers_out_of_the_per_frame_render`
- `item_249_drive_car_positions_imperatively_per_frame`
- `item_250_throttle_non_positional_replay_state`
- `item_251_prove_behavior_preservation_and_guard_against_regression`
