## task_097_orchestrate_canonical_race_track_replay_trace_and_simulation_handoff - Orchestrate canonical race-track replay trace and simulation handoff
> From version: 0.3.28
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 55%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Read the completed canonical geometry, track-zone, and corner-speed-profile requests first; treat this work as consolidation of those contracts, not a new visual tweak.
- [ ] 2. Map the current replay data flow from `simulateRace` through `RaceResult.replayTrace`, `replayFacts`, `ReplayView`, `replayMath`, and `replayDirector`, listing every canonical field and every fallback reconstruction path.
- [ ] 3. Define and validate the generated-race replay trace contract, keeping legacy compatibility separate from the stricter new-race path.
- [ ] 4. Move speed-profile progress effects to the shared trace handoff and update web replay consumers so canonical traces are rendered without a second independent remap.
- [ ] 5. Centralize or guard legacy fallback reconstruction and add focused tests for both canonical generated results and older incomplete results.
- [ ] 6. Document and enforce the circuit distance contract across simulation distance, replay pacing, labels, and circuit audit.
- [ ] 7. Add a deterministic trace-inspection artifact and validate representative Prague, Monaco, Montreal, and pit-stop scenarios.
- [ ] 8. Update Logics docs during implementation, run typecheck, lint, focused tests, audit:circuits, and Logics validation, then record exact proof and residual risks in closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_219_define_the_canonical_replay_trace_contract_for_generated_races`
- `item_220_move_speed_profile_motion_into_the_shared_trace_handoff`
- `item_221_isolate_legacy_replay_fallbacks_behind_an_explicit_adapter`
- `item_222_normalize_circuit_distance_semantics_and_audit_drift`
- `item_223_add_race_track_replay_trace_inspection_and_representative_validation`

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
- Wave 1: moved speed-profile motion into the generated replay trace handoff. `RaceInput` accepts `speedProfile`, league race resolution passes the circuit profile to `simulateRace`, generated car trace progress reflects the profile, and web replay no longer double-applies speed-profile easing to canonical `cars` traces.
- Wave 1 validation: `npm test -- packages/shared/src/simulation/simulateRace.test.ts apps/web/src/features/ReplayView.test.ts`, `npm run lint`, and `npm run typecheck` passed.
- Wave 2: added `npm run replay:inspect` for deterministic replay trace inspection across Prague, Monaco, and Montreal. Output includes trace point counts, phases, sample live order, gaps, lap, and phase state.
- Wave 2 validation: `npm run replay:inspect`, `npm run typecheck`, and `npm run lint` passed.

# AI Context
- Summary: Orchestrate canonical race-track replay trace and simulation handoff
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_096_canonical_race_track_replay_trace_and_simulation_handoff`
- Product brief(s): `prod_059_canonical_race_track_replay_trace_product_brief`
- Architecture decision(s): (none yet)
