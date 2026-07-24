## task_117_orchestrate_the_performance_pass - Orchestrate the performance pass
> From version: 0.4.5
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
- [ ] 1. Wave 1 (safe, high-value): downscale+WebP car sprites, convert crl PNGs to WebP, switch auth scrypt to async; run typecheck/lint/tests after each.
- [ ] 2. Wave 2 (front): lazy-load circuit routes per selected circuit, then memoize the GameApp shell; verify with the web tests and a production build size check.
- [ ] 3. Wave 3 (API, with tests): cut getLeagueState rebuilds + history over-fetch, batch per-team write loops, then move simulateRace out of the write transaction last (riskiest).
- [ ] 4. Prove behavior parity at every step: identical visuals, byte-identical API responses, and intact race-integrity guarantees.
- [ ] 5. Run the full gate (typecheck, lint, unit suite, balance:gate, logics:validate) and record before/after evidence (bundle sizes, asset bytes) in closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_279_downscale_and_webp_the_car_sprite_assets`
- `item_280_convert_crl_ui_pngs_to_webp`
- `item_281_move_the_auth_scrypt_kdf_off_the_event_loop`
- `item_282_lazy_load_circuit_route_data_per_selected_circuit`
- `item_283_memoize_the_gameapp_shell_to_stop_unrelated_rebuilds`
- `item_284_cut_getleaguestate_rebuilds_and_historical_over_fetch`
- `item_285_batch_per_team_write_loops_in_resolve_rollover_and_bot_purchases`
- `item_286_compute_simulaterace_before_the_write_transaction`

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
- Summary: Orchestrate the performance pass
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_116_performance_pass_front_and_api`
- Product brief(s): `prod_068_performance_pass_front_and_api_product_brief`
- Architecture decision(s): (none yet)
