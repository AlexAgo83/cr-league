## task_103_orchestrate_track_driven_chrono_race_engine_migration - Orchestrate track-driven chrono race engine migration
> From version: 0.4.2
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 35%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Start with the engine contract and parameter mapping. Do not implement ticks until every current decision, preparation, pit strategy, and card has a documented runtime effect or explicit non-motion rationale.
- [ ] 2. Implement the chrono engine as a focused internal module behind simulateRace, keeping RaceInput/RaceResult compatible and avoiding unrelated API/web/schema changes.
- [ ] 3. Integrate pit stops, overtakes, defense, incidents, weather, and events into actual motion state so emitted race facts do not contradict trace speed/order/gaps.
- [ ] 4. Update replayTrace and replay helpers only as needed to consume chrono truth; keep web rendering behavior stable.
- [ ] 5. Run deterministic and invariant tests continuously, then broaden to balance simulations across fixed seeds/circuits/weather/cards/pit strategies.
- [ ] 6. Tune only within documented review bands, record distribution evidence, and explicitly list any gameplay follow-up risks.
- [ ] 7. Run typecheck, test, build, lint, e2e, bounded balance:sim, and logics:validate before closeout; confirm the diff stays contained.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_252_define_the_chrono_engine_contract_and_motion_parameter_mapping`
- `item_253_implement_deterministic_track_driven_time_distance_simulation`
- `item_254_integrate_pit_stops_overtakes_defense_and_events_into_chrono_motion`
- `item_255_make_replay_trace_and_web_replay_consume_chrono_truth`
- `item_256_calibrate_balance_and_preserve_gameplay_value_across_the_new_engine`
- `item_257_migration_gates_tests_and_rollout_readiness_for_chrono_engine`

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
- Summary: Orchestrate track-driven chrono race engine migration
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_102_track_driven_chrono_race_engine_derive_grand_prix_timing_gaps_classification_and_replay_from_speed_over_the_race_track`
- Product brief(s): `prod_065_track_driven_chrono_race_engine_product_brief`
- Architecture decision(s): (none yet)
