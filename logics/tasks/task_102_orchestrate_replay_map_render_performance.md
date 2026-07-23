## task_102_orchestrate_replay_map_render_performance - Orchestrate replay map render performance
> From version: 0.4.1
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
- [x] 1. Do the route-geometry memo first (WeakMap getRouteGeometry): it removes ~80% of the redundant per-frame cost with zero behavior change and is the safest win.
- [x] 2. Hoist the tile and route layers into useMemo and memoize the cars array so static layers stop reconciling per frame.
- [x] 3. Move per-frame car positioning to imperative transforms mirroring the camera loop, kept as an isolated, independently revertible step.
- [x] 4. Throttle the tower/live/active-moment updates to ~100ms while positions stay per-frame, keeping scrubbing immediate.
- [x] 5. Add the byte-identical replay-output assertion and the geometry-not-rebuilt-per-frame non-regression check.
- [x] 6. Run typecheck, test, lint, and logics:validate; confirm circuit generation and simulateRace are untouched; record proof at closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_247_memoize_immutable_route_geometry`
- `item_248_hoist_static_svg_layers_out_of_the_per_frame_render`
- `item_249_drive_car_positions_imperatively_per_frame`
- `item_250_throttle_non_positional_replay_state`
- `item_251_prove_behavior_preservation_and_guard_against_regression`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.
- request-AC2 -> This task. Proof: static SVG layers and the `cars` array are memoized; car positions are driven from `carProgressRef`.
- request-AC3 -> This task. Proof: `.map-car` translate and `.map-car-sprite` rotate are updated imperatively in the map rAF loop.
- request-AC5 -> This task. Proof: route geometry build count test guards against redundant rebuilds; task_102 avoided circuit generation and simulation changes.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- Implemented route geometry WeakMap memoization, static SVG layer memoization, memoized replay cars, imperative car transforms from carProgressRef, and 100 ms publication cadence for non-positional replay state. Verified: targeted vitest 3 files/41 tests passed; npm test 29 passed/1 skipped, 290 passed/7 skipped; npm run typecheck passed; npm run lint passed; npm run logics:validate passed. Circuit generation and simulateRace were not changed for task_102.
- Finish workflow executed on 2026-07-23.
- Linked backlog/request close verification passed.

# Report
- Implemented task_102. Route geometry is cached per immutable points array, static SVG layers and replay cars are memoized, car transforms are updated imperatively from `carProgressRef`, and non-positional replay state publishes at a 100 ms cadence while seek remains immediate.
- Validation proof: targeted vitest passed 3 files/41 tests; `npm test` passed 29 files/290 tests with existing skips; `npm run typecheck`, `npm run lint`, and `npm run logics:validate` passed.
- Finished on 2026-07-23.
- Linked backlog item(s): `item_247_memoize_immutable_route_geometry`, `item_248_hoist_static_svg_layers_out_of_the_per_frame_render`, `item_249_drive_car_positions_imperatively_per_frame`, `item_250_throttle_non_positional_replay_state`, `item_251_prove_behavior_preservation_and_guard_against_regression`
- Related request(s): `req_101_replay_map_render_performance_memoize_route_geometry_hoist_static_svg_layers_imperative_car_transforms_and_throttle_non_positional_state`

# AI Context
- Summary: Orchestrate replay map render performance
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_101_replay_map_render_performance_memoize_route_geometry_hoist_static_svg_layers_imperative_car_transforms_and_throttle_non_positional_state`
- Product brief(s): `prod_064_replay_map_render_performance_product_brief`
- Architecture decision(s): (none yet)
