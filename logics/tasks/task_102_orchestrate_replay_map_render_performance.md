## task_102_orchestrate_replay_map_render_performance - Orchestrate replay map render performance
> From version: 0.4.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Do the route-geometry memo first (WeakMap getRouteGeometry): it removes ~80% of the redundant per-frame cost with zero behavior change and is the safest win.
- [ ] 2. Hoist the tile and route layers into useMemo and memoize the cars array so static layers stop reconciling per frame.
- [ ] 3. Move per-frame car positioning to imperative transforms mirroring the camera loop, kept as an isolated, independently revertible step.
- [ ] 4. Throttle the tower/live/active-moment updates to ~100ms while positions stay per-frame, keeping scrubbing immediate.
- [ ] 5. Add the byte-identical replay-output assertion and the geometry-not-rebuilt-per-frame non-regression check.
- [ ] 6. Run typecheck, test, lint, and logics:validate; confirm circuit generation and simulateRace are untouched; record proof at closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_247_memoize_immutable_route_geometry`
- `item_248_hoist_static_svg_layers_out_of_the_per_frame_render`
- `item_249_drive_car_positions_imperatively_per_frame`
- `item_250_throttle_non_positional_replay_state`
- `item_251_prove_behavior_preservation_and_guard_against_regression`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.

# Report
- Implementation complete.

# AI Context
- Summary: Orchestrate replay map render performance
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_101_replay_map_render_performance_memoize_route_geometry_hoist_static_svg_layers_imperative_car_transforms_and_throttle_non_positional_state`
- Product brief(s): `prod_064_replay_map_render_performance_product_brief`
- Architecture decision(s): (none yet)
