## task_099_orchestrate_chrono_replay_race_track_parity - Orchestrate chrono replay race-track parity
> From version: 0.3.28
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
- [x] 1. Read the current qualifying trace generator, all `createQualifyingRuns` call sites, and the recent race replay realism docs before implementing.
- [x] 2. Apply speed-profile parity first at the chrono trace-generation boundary; do not add web-only remapping.
- [x] 3. Add only solo-chrono phases: grid, launch, racing, finished.
- [x] 4. Layer weather-visible speed metadata after speed-profile parity is test-covered.
- [x] 5. Extend replay inspection to include representative chrono traces.
- [x] 6. Update affected Logics docs after each meaningful wave and keep the repo commit-ready.
- [x] 7. Run focused qualifying/replay tests, `npm run typecheck`, `npm run lint`, `npm run replay:inspect`, and Logics validation before closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_231_apply_circuit_speed_profile_to_chrono_replay_traces`
- `item_232_add_chrono_compatible_replay_phases`
- `item_233_make_chrono_weather_handling_visible_in_trace_speed`
- `item_234_extend_replay_inspection_to_chrono_traces`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `createQualifyingRuns` accepts `speedProfile`, all league chrono call sites pass `trackSpeedProfileForCircuit(circuit)`, and generated `cars` trace progress applies that profile.
- request-AC2 -> This task. Proof: generated chrono traces emit only `grid`, `launch`, `racing`, and `finished` phases; focused tests passed and final trace timing stays stable.
- request-AC3 -> This task. Proof: rainy and non-straight chrono spans lower deterministic trace `speed` metadata without changing qualifying lap-time calculation; dry versus wet tests passed.
- request-AC4 -> This task. Proof: `npm run replay:inspect` now prints Prague, Monaco, and Montreal chrono sections with progress, lap, weather, phase, speed, phases, and final time.
- request-AC5 -> This task. Proof: focused qualifying tests cover speed-profile application, launch phase presence, weather speed differences, deterministic output, and unchanged final timing for equal inputs.
- request-AC6 -> This task. Proof: the request/product/backlog docs explicitly keep pit stops, overtakes, defense, and multi-car gap spacing out of solo chrono scope.

# Validation
- `npm test -- apps/api/src/features/leagues/qualifying.test.ts apps/web/src/features/ReplayView.test.ts` passed.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run audit:circuits` passed.
- `npm run replay:inspect` passed.
- `logics-manager flow validate req_098_chrono_replay_race_track_parity` passed.
- `logics-manager lint --require-status` passed.
- `logics-manager audit --group-by-doc` passed with no blocking issues.
- npm test -- apps/api/src/features/leagues/qualifying.test.ts apps/web/src/features/ReplayView.test.ts passed; npm run typecheck passed; npm run lint passed; npm run audit:circuits passed; npm run replay:inspect passed; logics-manager flow validate req_098_chrono_replay_race_track_parity passed; logics-manager lint --require-status passed; logics-manager audit --group-by-doc passed with no blocking issues
- Finish workflow executed on 2026-07-23.
- Linked backlog/request close verification passed.

# Report
- Wave 1: implemented chrono replay parity for circuit speed profile, solo phases, and weather-visible trace speed. `createQualifyingRuns` now accepts `speedProfile`, league chrono call sites pass `trackSpeedProfileForCircuit(circuit)`, generated chrono `cars` traces emit `grid`/`launch`/`racing`/`finished`, and rainy/non-straight spans lower trace speed without changing qualifying lap-time calculation.
- Wave 1 validation: `npm test -- apps/api/src/features/leagues/qualifying.test.ts` and `npm run typecheck` passed.
- Wave 2: extended `npm run replay:inspect` with representative chrono traces for Prague, Monaco, and Montreal. The output now includes trace count, phases, final chrono time, sample progress, lap, weather, phase, and speed alongside the race trace samples.
- Wave 2 validation: `npm run replay:inspect` and `npm run typecheck` passed.
- Finished on 2026-07-23.
- Linked backlog item(s): `item_231_apply_circuit_speed_profile_to_chrono_replay_traces`, `item_232_add_chrono_compatible_replay_phases`, `item_233_make_chrono_weather_handling_visible_in_trace_speed`, `item_234_extend_replay_inspection_to_chrono_traces`
- Related request(s): `req_098_chrono_replay_race_track_parity`

# AI Context
- Summary: Orchestrate chrono replay race-track parity
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_098_chrono_replay_race_track_parity`
- Product brief(s): `prod_061_chrono_replay_race_track_parity_product_brief`
- Architecture decision(s): (none yet)
