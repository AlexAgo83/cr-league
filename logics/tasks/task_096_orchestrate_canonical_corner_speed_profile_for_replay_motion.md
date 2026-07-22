## task_096_orchestrate_canonical_corner_speed_profile_for_replay_motion - Orchestrate canonical corner speed profile for replay motion
> From version: 0.3.28
> Schema version: 1.0
> Status: Done
> Understanding: 90
> Confidence: 91
> Progress: 100
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

- [x] 1. Read the canonical race-track geometry and track-zone docs first; this work must extend generated shared circuit data, not reintroduce render-time race semantics.
- [x] 2. Define the shared speed-profile contract and generator/audit path from route curvature, keeping the output compact, deterministic, and bounded.
- [x] 3. Generate profiles for all current circuits and add audit/test coverage for sane ranges, merged spans, and no replay-stalling output.
- [x] 4. Wire replay motion to consume the profile as visual-only progress easing, preserving canonical trace timing, pit alignment, event markers, tower gaps, overtakes, and final classification.
- [x] 5. Validate representative straight, technical, long, and pit-stop replay cases; adjust only the bounded heuristic constants if validation shows jarring motion.
- [x] 6. Document the simulation handoff criteria and explicitly defer outcome/balance usage until a later request.
- [x] 7. Run typecheck, lint, tests, build, audit:circuits, and Logics validation; record exact proof in closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_215_generate_canonical_speed_profiles_from_circuit_route_curvature`
- `item_216_apply_speed_profiles_to_replay_motion_without_changing_race_outcomes`
- `item_217_validate_replay_speed_profiles_across_representative_circuits`
- `item_218_document_the_simulation_handoff_for_speed_profile_gameplay`

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
- request-AC2 -> This task. Proof: `npm run audit:circuits` validates all 25 profiles with bounded factors/progress; `packages/shared/src/domain/circuits.test.ts` checks coverage and range.
- request-AC3 -> This task. Proof: `apps/web/src/features/replay/replayMath.ts` applies profile remapping to visual car progress only; replay tests cover slowdown, endpoints, and pit alignment.
- request-AC5 -> This task. Proof: `item_218` documents future simulation gates; no `simulateRace`, card, reward, bot strategy, scoring, economy, or classification code changed.

# Validation
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm test` passed.
- `npm run build` passed.
- `npm run audit:circuits` passed.
- `logics-manager audit --group-by-doc` passed with existing warnings only before final closeout.
- npm run typecheck passed; npm run lint passed; npm test passed; npm run build passed; npm run audit:circuits passed; logics-manager lint --require-status passed; logics-manager audit --group-by-doc passed
- Finish workflow executed on 2026-07-23.
- Linked backlog/request close verification passed.

# Report
- 2026-07-23: Added shared speed-profile contract, deterministic route-curvature generator, generated profiles for 25 circuits, replay-only visual progress remap, audit coverage, and focused unit tests.
- 2026-07-23 follow-up: Recalibrated generated corner spans from raw route progress into replay progress relative to `startProgress`, matching the `CircuitMap` render frame so braking happens on the visible corner.
- 2026-07-23 follow-up: Runtime inspection showed the previous variation was measurable but too subtle, so the generator now uses wider braking/corner spans, stronger corner slowdown, and replay-frame main-straight boost.
- Proof: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run audit:circuits`, and targeted replay/circuit tests passed.
- Finished on 2026-07-23.
- Linked backlog item(s): `item_215_generate_canonical_speed_profiles_from_circuit_route_curvature`, `item_216_apply_speed_profiles_to_replay_motion_without_changing_race_outcomes`, `item_217_validate_replay_speed_profiles_across_representative_circuits`, `item_218_document_the_simulation_handoff_for_speed_profile_gameplay`
- Related request(s): `req_095_canonical_corner_speed_profile_for_replay_motion`

# AI Context
- Summary: Orchestrate canonical corner speed profile for replay motion
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_095_canonical_corner_speed_profile_for_replay_motion`
- Product brief(s): `prod_058_canonical_corner_speed_profile_product_brief`
- Architecture decision(s): (none yet)
