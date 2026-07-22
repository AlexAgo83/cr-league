## task_096_orchestrate_canonical_corner_speed_profile_for_replay_motion - Orchestrate canonical corner speed profile for replay motion
> From version: 0.3.28
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
- [ ] 1. Read the canonical race-track geometry and track-zone docs first; this work must extend generated shared circuit data, not reintroduce render-time race semantics.
- [ ] 2. Define the shared speed-profile contract and generator/audit path from route curvature, keeping the output compact, deterministic, and bounded.
- [ ] 3. Generate profiles for all current circuits and add audit/test coverage for sane ranges, merged spans, and no replay-stalling output.
- [ ] 4. Wire replay motion to consume the profile as visual-only progress easing, preserving canonical trace timing, pit alignment, event markers, tower gaps, overtakes, and final classification.
- [ ] 5. Validate representative straight, technical, long, and pit-stop replay cases; adjust only the bounded heuristic constants if validation shows jarring motion.
- [ ] 6. Document the simulation handoff criteria and explicitly defer outcome/balance usage until a later request.
- [ ] 7. Run typecheck, lint, tests, build, audit:circuits, and Logics validation; record exact proof in closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_215_generate_canonical_speed_profiles_from_circuit_route_curvature`
- `item_216_apply_speed_profiles_to_replay_motion_without_changing_race_outcomes`
- `item_217_validate_replay_speed_profiles_across_representative_circuits`
- `item_218_document_the_simulation_handoff_for_speed_profile_gameplay`

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
- Summary: Orchestrate canonical corner speed profile for replay motion
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_095_canonical_corner_speed_profile_for_replay_motion`
- Product brief(s): `prod_058_canonical_corner_speed_profile_product_brief`
- Architecture decision(s): (none yet)
