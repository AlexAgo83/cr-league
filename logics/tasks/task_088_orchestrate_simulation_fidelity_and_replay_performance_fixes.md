## task_088_orchestrate_simulation_fidelity_and_replay_performance_fixes - Orchestrate simulation fidelity and replay performance fixes
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Read req_085 and req_086 first so this fidelity/perf pass does not collide with their locking, economy, and resolve-determinism work; this request only touches qualifying trait wiring, replay render cost, recap/overlay accuracy, and preview/shuffle robustness.
- [ ] 2. Land the qualifying-trait wiring at all three call sites, add the cross-circuit chrono test, and run balance:sim to confirm no unintended shift.
- [ ] 3. Memoize the CircuitMap scene/route analysis and fix the useReplayClock pop-timer splice; verify no visual change.
- [ ] 4. Correct the recap weather label, settle the podium/loss verdict ordering, make ambient motion forward-only, and translate the focus-driver aria-label.
- [ ] 5. Add the /simulation/preview traits validation and the high-bit circuit shuffle with their tests.
- [ ] 6. Run typecheck, tests, build, lint, e2e, balance:sim, and Logics validation; record proof at closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_193_qualifying_responds_to_circuit_traits`
- `item_194_bound_replay_render_cost_and_timer_growth`
- `item_195_recap_accuracy_and_replay_overlay_polish`
- `item_196_simulation_input_robustness_and_unbiased_circuit_shuffle`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: store.ts passes circuit.traits into all qualifying run call sites; qualifying.test.ts proves same-seed chronos differ across numeric traits.
- request-AC2 -> This task. Proof: CircuitMap.tsx memoizes circuitScene, analyzeCircuitRoute, and routeFitTransform by circuit; useReplayClock.ts splices fired pop timers out of positionPopTimers.
- request-AC3 -> This task. Proof: helpers.ts reports strongest resolved weather and prioritizes podium verdicts; CircuitMap.tsx uses forward-only ambient animateMotion; ReplayStageOverlay.tsx uses translated action_focus_driver labels in en/fr catalogs.
- request-AC4 -> This task. Proof: simulation/routes.ts rejects non-numeric traits with 400; circuits.ts uses high LCG bits for Fisher-Yates swap indexes; app.smoke.test.ts and circuits.test.ts cover both.
- request-AC5 -> This task. Proof: npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, npm run balance:sim, and npm run logics:validate were run during closeout.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- Finish workflow executed on 2026-07-22.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-07-22.
- Linked backlog item(s): `item_193_qualifying_responds_to_circuit_traits`, `item_194_bound_replay_render_cost_and_timer_growth`, `item_195_recap_accuracy_and_replay_overlay_polish`, `item_196_simulation_input_robustness_and_unbiased_circuit_shuffle`
- Related request(s): `req_087_simulation_fidelity_and_replay_performance_qualifying_track_response_replay_render_cost_recap_accuracy_and_input_robustness`

# AI Context
- Summary: Orchestrate simulation fidelity and replay performance fixes
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_087_simulation_fidelity_and_replay_performance_qualifying_track_response_replay_render_cost_recap_accuracy_and_input_robustness`
- Product brief(s): `prod_051_simulation_fidelity_and_replay_performance_product_brief`
- Architecture decision(s): (none yet)
