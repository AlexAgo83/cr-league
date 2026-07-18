## task_050_orchestrate_race_learning_and_feedback_systems - Orchestrate race learning and feedback systems
> From version: 0.3.7
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
- [x] 1. Read current qualifying, replay, result, garage economy, directive, map, and simulation paths before starting implementation.
- [x] 2. Ship post-replay payoff recap first because it is high value and uses existing result data.
- [x] 3. Ship chrono report and chrono history together or sequentially, then add plan-lock suggestions once chrono evidence is visible.
- [x] 4. Ship weather map visuals and replay event callouts as separate visual passes with E2E layout checks.
- [x] 5. Ship starter economy after verifying first-session copy and no-card plan behavior.
- [x] 6. Treat tire strategy as the last item because it touches shared types, API validation, simulation, UI, and tests.
- [x] 7. For each backlog item, update EN/FR copy, run focused tests, then run typecheck, lint, unit tests, build, and affected E2E before closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_118_add_dynamic_chrono_report_after_each_qualifying_attempt`
- `item_119_make_chrono_session_history_navigable`
- `item_120_suggest_the_best_chrono_backed_configuration_before_plan_lock`
- `item_121_add_weather_visual_states_to_the_circuit_map`
- `item_122_render_replay_event_callouts_near_cars`
- `item_123_add_post_replay_payoff_recap`
- `item_124_start_new_leagues_with_credits_instead_of_a_starter_card`
- `item_125_specify_and_implement_a_simple_tire_strategy_directive`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `apps/web/src/app/App.tsx` renders the chrono report from `QualifyingRun` data with best time, grid position, latest gap, remaining attempts, and suggestion copy.
- request-AC2 -> This task. Proof: `apps/web/src/app/App.tsx` renders chrono session history in Plan and opens selected qualifying replays; `apps/web/src/app/App.test.tsx` covers history navigation.
- request-AC3 -> This task. Proof: `buildChronoReport` suggests returning to the best observed setup or testing the changed setup before plan lock.
- request-AC4 -> This task. Proof: `apps/web/src/features/CircuitMap.tsx` accepts a weather state and `apps/web/src/styles/layout.css` renders light/heavy rain ambience without hiding controls.
- request-AC5 -> This task. Proof: `apps/web/src/features/ReplayView.tsx` passes active event labels to `CircuitMap` and `apps/web/src/app/App.test.tsx` asserts `map-car-event`.
- request-AC6 -> This task. Proof: `apps/web/src/features/ResultView.tsx` shows finish, race movement, points, credits, card spend, and championship rank movement when a result is available.
- request-AC7 -> This task. Proof: `apps/api/src/features/leagues/store.ts` starts and restarts human teams with `STARTING_CREDITS` and no starter cards; API tests cover create/restart flows.
- request-AC8 -> This task. Proof: `apps/web/src/i18n/en.json` and `apps/web/src/i18n/fr.json` frame the three existing preparation choices as tire prep without adding a speculative tire-management system.
- request-AC9 -> This task. Proof: new strings are present in `apps/web/src/i18n/en.json` and `apps/web/src/i18n/fr.json`.
- request-AC10 -> This task. Proof: validation passed with `npm run db:generate`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `logics-manager flow validate req_049_race_learning_and_feedback_systems`, `logics-manager lint --require-status`, and `logics-manager audit --group-by-doc`.

# Validation
- `npm run db:generate` passed.
- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run test` passed: 13 files, 115 tests.
- `npm run build` passed.
- `logics-manager flow validate req_049_race_learning_and_feedback_systems` passed.
- `logics-manager lint --require-status` passed.
- `logics-manager audit --group-by-doc` passed with only pre-closeout traceability warnings.
- Implemented chrono report/history and setup suggestions in Plan; post-race payoff recap with championship movement; starter-credit economy without starter cards in API create/join/restart; tire-prep wording; weather ambience on maps; replay event labels attached to cars. Validation: npm run db:generate, npm run lint, npm run typecheck, npm run test, npm run build, logics-manager flow validate req_049_race_learning_and_feedback_systems, logics-manager lint --require-status, logics-manager audit --group-by-doc.
- Finish workflow executed on 2026-07-18.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-07-18.
- Linked backlog item(s): `item_118_add_dynamic_chrono_report_after_each_qualifying_attempt`, `item_119_make_chrono_session_history_navigable`, `item_120_suggest_the_best_chrono_backed_configuration_before_plan_lock`, `item_121_add_weather_visual_states_to_the_circuit_map`, `item_122_render_replay_event_callouts_near_cars`, `item_123_add_post_replay_payoff_recap`, `item_124_start_new_leagues_with_credits_instead_of_a_starter_card`, `item_125_specify_and_implement_a_simple_tire_strategy_directive`
- Related request(s): `req_049_race_learning_and_feedback_systems`

# AI Context
- Summary: Orchestrate race learning and feedback systems
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_049_race_learning_and_feedback_systems`
- Product brief(s): `prod_020_race_learning_and_feedback_systems_product_brief`
- Architecture decision(s): (none yet)
