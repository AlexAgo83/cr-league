## task_118_orchestrate_the_deferred_performance_follow_up - Orchestrate the deferred performance follow-up
> From version: 0.4.5
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Non-semantic edit: traceability repair only.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Do the two items as independent, dedicated changes — not a sweep.
- [ ] 2. For lazy circuits: introduce dynamic import + upstream async hydration, verify with web + e2e and a production bundle-size check.
- [ ] 3. For simulateRace: compute before the transaction from a consistent snapshot, keep only writes under the lock, and extend resolution tests for concurrency + output parity.
- [ ] 4. Run the full gate (typecheck, lint, unit, balance:gate, e2e, logics:validate) and record evidence in closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_287_lazy_load_circuit_route_data_per_selected_circuit`
- `item_288_take_simulaterace_off_the_locked_write_transaction`

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
- request-AC2 -> This task. Evidence needed: simulateRace no longer runs while holding the grand-prix row lock (computed before the write transaction, or on a worker thread); the transaction performs only validation and writes.
- request-AC3 -> This task. Evidence needed: Race-integrity guarantees (single resolve wins, lock semantics) and simulation outputs are preserved verbatim, proven by the resolution tests and balance:gate.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- Finish workflow executed on 2026-07-24.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-07-24.
- Linked backlog item(s): `item_287_lazy_load_circuit_route_data_per_selected_circuit`, `item_288_take_simulaterace_off_the_locked_write_transaction`
- Related request(s): `req_117_performance_pass_deferred_follow_up`

# AI Context
- Summary: Orchestrate the deferred performance follow-up
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_117_performance_pass_deferred_follow_up`
- Product brief(s): `prod_069_performance_pass_deferred_follow_up_product_brief`
- Architecture decision(s): (none yet)
