## task_103_orchestrate_track_driven_chrono_race_engine_migration - Orchestrate track-driven chrono race engine migration
> From version: 0.4.2
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Start with the engine contract and parameter mapping. Do not implement ticks until every current decision, preparation, pit strategy, and card has a documented runtime effect or explicit non-motion rationale.
- [x] 2. Implement the chrono engine as a focused internal module behind simulateRace, keeping RaceInput/RaceResult compatible and avoiding unrelated API/web/schema changes.
- [x] 3. Integrate pit stops, overtakes, defense, incidents, weather, and events into actual motion state so emitted race facts do not contradict trace speed/order/gaps.
- [x] 4. Update replayTrace and replay helpers only as needed to consume chrono truth; keep web rendering behavior stable.
- [x] 5. Run deterministic and invariant tests continuously, then broaden to balance simulations across fixed seeds/circuits/weather/cards/pit strategies.
- [x] 6. Tune only within documented review bands, record distribution evidence, and explicitly list any gameplay follow-up risks.
- [x] 7. Run typecheck, test, build, lint, e2e, bounded balance:sim, and logics:validate before closeout; confirm the diff stays contained.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_252_define_the_chrono_engine_contract_and_motion_parameter_mapping`
- `item_253_implement_deterministic_track_driven_time_distance_simulation`
- `item_254_integrate_pit_stops_overtakes_defense_and_events_into_chrono_motion`
- `item_255_make_replay_trace_and_web_replay_consume_chrono_truth`
- `item_256_calibrate_balance_and_preserve_gameplay_value_across_the_new_engine`
- `item_257_migration_gates_tests_and_rollout_readiness_for_chrono_engine`

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
- request-AC2 -> This task. Proof: `motionParametersForDecision` and chrono timing map every approach, preparation, pit strategy, card, trait, weather state, and speed-profile span into runtime motion/timing parameters; tests cover all current cards and decisions.
- request-AC3 -> This task. Proof: `simulateRace` now classifies by chrono finish times and `validateReplayTrace` checks final order, final times, and final gaps against classification; replay tests cover fixed-seed coherence.
- request-AC5 -> This task. Proof: deterministic replay tests cover repeated seeds/circuits/weather/pit/card combinations, and `balance:sim` now reports duration, gap spread, favorite win rate, upset rate, card impact, and pit strategy summary.
- request-AC7 -> This task. Proof: validation passed: `npm run typecheck`, `npm test`, `npm run build`, `npm run lint`, `npm run test:e2e`, bounded `npm run balance:sim -- --runs 5 --circuits 4 --limit 5 --json /tmp/cr-league-chrono-balance.json`, and `npm run logics:validate`.

# Validation
- `npm run typecheck` passed.
- `npm test` passed: 29 passed, 1 skipped; 292 passed, 7 skipped.
- `npm run lint` passed.
- `npm run build` passed.
- `npm run test:e2e` passed: 4 passed.
- `npm run balance:sim -- --runs 5 --circuits 4 --limit 5 --json /tmp/cr-league-chrono-balance.json` passed.
- `npm run logics:validate` passed.
- Implemented deterministic track-driven chrono finish times behind simulateRace; replay final order/times/gaps now share chrono truth; motion mapping covers every approach, preparation, pit strategy, and card. Validation: npm run typecheck passed; npm test passed (29 passed, 1 skipped; 292 passed, 7 skipped); npm run lint passed; npm run build passed; npm run test:e2e passed (4 passed); npm run balance:sim -- --runs 5 --circuits 4 --limit 5 --json /tmp/cr-league-chrono-balance.json passed; npm run logics:validate passed.
- Finish workflow executed on 2026-07-23.
- Linked backlog/request close verification passed.

# Report
- Implemented deterministic track-driven chrono finish times behind `simulateRace`.
- Classification now follows chrono finish times; `classificationScore` remains a score display/tiebreak helper.
- Replay final order, final times, and final gaps share the same chrono source of truth.
- Motion mapping covers approaches, preparations, pit strategies, cards, circuit traits, weather, and speed-profile spans.
- Balance reporting now includes chrono duration, gap spread, favorite win rate, upset rate, card impact, and pit strategy summaries.
- Follow-up risk: balance distributions changed intentionally; `defensive_order`, `economy_mode`, and heavy-pack strategies remain conservative tradeoffs to revisit after broader playtest data.
- Finished on 2026-07-23.
- Linked backlog item(s): `item_252_define_the_chrono_engine_contract_and_motion_parameter_mapping`, `item_253_implement_deterministic_track_driven_time_distance_simulation`, `item_254_integrate_pit_stops_overtakes_defense_and_events_into_chrono_motion`, `item_255_make_replay_trace_and_web_replay_consume_chrono_truth`, `item_256_calibrate_balance_and_preserve_gameplay_value_across_the_new_engine`, `item_257_migration_gates_tests_and_rollout_readiness_for_chrono_engine`
- Related request(s): `req_102_track_driven_chrono_race_engine_derive_grand_prix_timing_gaps_classification_and_replay_from_speed_over_the_race_track`

# AI Context
- Summary: Orchestrate track-driven chrono race engine migration
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_102_track_driven_chrono_race_engine_derive_grand_prix_timing_gaps_classification_and_replay_from_speed_over_the_race_track`
- Product brief(s): `prod_065_track_driven_chrono_race_engine_product_brief`
- Architecture decision(s): (none yet)
