## task_091_orchestrate_canonical_race_track_geometry - Orchestrate canonical race-track geometry
> From version: 0.3.27
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
- [ ] 1. Read req_089 first; this generalizes its single-canonical-origin pit work to the whole semantic track geometry and must consume its shared heuristic module rather than duplicate it.
- [ ] 2. Generate the main-straight span and start line as canonical shared circuit data, make the map and sim read them, drop the render-time geometry scan and the unused longestStraight, and remove the client-side pit computation (leagueMutations).
- [ ] 3. Base replay scale on canonical meters and reconcile trackLengthMeters with the geodesic geometry, wiring or deleting circuitLengthMeters.
- [ ] 4. Delete the client-side replay beat/overtake/weather/pack/pit re-derivation and rely on replayFacts, guarded by a resolved-race test.
- [ ] 5. Run typecheck, tests, build, lint, e2e, audit:circuits, and Logics validation; record proof at closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_204_generate_the_main_straight_and_start_line_as_canonical_track_data`
- `item_205_base_replay_scale_on_canonical_meters_and_reconcile_track_length`
- `item_206_delete_client_side_replay_beat_re_derivation_replayfacts_is_the_sole_source`

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
- Summary: Orchestrate canonical race-track geometry
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_090_canonical_race_track_geometry_generate_semantic_track_markers_instead_of_interpreting_them_on_the_map`
- Product brief(s): `prod_054_canonical_race_track_geometry_product_brief`
- Architecture decision(s): (none yet)
