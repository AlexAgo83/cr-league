## task_090_orchestrate_pit_stop_visual_alignment - Orchestrate pit-stop visual alignment
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
- [ ] 1. Read req_087 first; this is a sibling replay-fidelity fix and must not regress the qualifying-trait, memoization, or robustness work it landed.
- [ ] 2. Derive each circuit's from-start pit-lane progress from the route geometry (same longest-straight heuristic as analyzeCircuitRoute), store it as shared circuit data, and generate/validate it through the circuit scripts so it cannot drift.
- [ ] 3. Replace the hardcoded pitLaneProgress: 0.5 in resolveCurrentGrandPrix with the circuit value and pass it into the qualifying/preview/demo sim inputs.
- [ ] 4. Confirm the start-line offset resolves: the pitting car's rendered pose must equal the drawn marker; add the alignment test across circuits.
- [ ] 5. Run typecheck, tests, build, lint, e2e, audit:circuits, and Logics validation; record proof at closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_202_expose_per_circuit_pit_lane_progress_as_shared_circuit_data`
- `item_203_feed_the_circuit_pit_lane_progress_into_the_simulation_and_align_the_marker`

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
- Summary: Orchestrate pit-stop visual alignment
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_089_align_pit_stop_visual_position_stop_cars_where_the_pit_is_drawn_on_the_circuit_map`
- Product brief(s): `prod_053_pit_stop_visual_alignment_product_brief`
- Architecture decision(s): (none yet)
