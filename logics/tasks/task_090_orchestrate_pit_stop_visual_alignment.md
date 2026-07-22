## task_090_orchestrate_pit_stop_visual_alignment - Orchestrate pit-stop visual alignment
> From version: 0.3.27
> Schema version: 1.0
> Status: Done
> Understanding: 90
> Confidence: 85
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Read req_087 first; this is a sibling replay-fidelity fix and must not regress the qualifying-trait, memoization, or robustness work it landed.
- [x] 2. Establish ONE canonical origin: extract the longest-straight pit/start heuristic out of analyzeCircuitRoute into a shared pure module, compute each circuit's from-start pit-lane progress at generation time, store it as shared circuit data, and generate/validate it through the circuit scripts so it cannot drift.
- [x] 3. Make the sim a reader: replace the hardcoded pitLaneProgress: 0.5 in resolveCurrentGrandPrix with the canonical circuit value and pass it into the qualifying/preview/demo sim inputs.
- [x] 4. Make the map a reader: draw the pit marker with the same projection cars use, poseOnRoute(renderPoints, stageProgress(pitLaneProgress)); remove analyzeCircuitRoute's independent pitProgress/pitStop derivation and route pitLapProgress/pitStopTraceProgress consumers to the canonical value.
- [x] 5. Confirm structural alignment: the pitting car's rendered pose must equal the drawn marker (same projection, same value); add the alignment test across circuits.
- [x] 6. Run typecheck, tests, build, lint, e2e, audit:circuits, and Logics validation; record proof at closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_202_expose_per_circuit_pit_lane_progress_as_shared_circuit_data`
- `item_203_feed_the_circuit_pit_lane_progress_into_the_simulation_and_align_the_marker`

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
- request-AC2 -> This task. Proof: resolveCurrentGrandPrix passes circuit.pitLaneProgress from shared circuit data instead of the previous hardcoded 0.5.
- request-AC3 -> This task. Proof: CircuitMap analyzes start/pit poses from canonical circuit.startProgress and circuit.pitLaneProgress, and CircuitMap tests verify canonical marker projection across circuits.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- typecheck OK; lint OK; npm test OK (250 passed, 7 skipped); build OK; Postgres integration OK (7 passed); e2e chromium OK (4 passed); audit:circuits OK; logics:validate OK.
- Finish workflow executed on 2026-07-22.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-07-22.
- Linked backlog item(s): `item_202_expose_per_circuit_pit_lane_progress_as_shared_circuit_data`, `item_203_feed_the_circuit_pit_lane_progress_into_the_simulation_and_align_the_marker`
- Related request(s): `req_089_align_pit_stop_visual_position_stop_cars_where_the_pit_is_drawn_on_the_circuit_map`

# AI Context
- Summary: Orchestrate pit-stop visual alignment
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_089_align_pit_stop_visual_position_stop_cars_where_the_pit_is_drawn_on_the_circuit_map`
- Product brief(s): `prod_053_pit_stop_visual_alignment_product_brief`
- Architecture decision(s): (none yet)
