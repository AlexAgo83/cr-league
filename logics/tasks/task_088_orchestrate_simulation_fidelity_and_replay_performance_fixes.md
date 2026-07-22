## task_088_orchestrate_simulation_fidelity_and_replay_performance_fixes - Orchestrate simulation fidelity and replay performance fixes
> From version: 0.3.26
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
- Summary: Orchestrate simulation fidelity and replay performance fixes
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_087_simulation_fidelity_and_replay_performance_qualifying_track_response_replay_render_cost_recap_accuracy_and_input_robustness`
- Product brief(s): `prod_051_simulation_fidelity_and_replay_performance_product_brief`
- Architecture decision(s): (none yet)
