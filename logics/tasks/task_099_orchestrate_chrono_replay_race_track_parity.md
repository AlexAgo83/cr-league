## task_099_orchestrate_chrono_replay_race_track_parity - Orchestrate chrono replay race-track parity
> From version: 0.3.28
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 85%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Read the current qualifying trace generator, all `createQualifyingRuns` call sites, and the recent race replay realism docs before implementing.
- [ ] 2. Apply speed-profile parity first at the chrono trace-generation boundary; do not add web-only remapping.
- [ ] 3. Add only solo-chrono phases: grid, launch, racing, finished.
- [ ] 4. Layer weather-visible speed metadata after speed-profile parity is test-covered.
- [ ] 5. Extend replay inspection to include representative chrono traces.
- [ ] 6. Update affected Logics docs after each meaningful wave and keep the repo commit-ready.
- [ ] 7. Run focused qualifying/replay tests, `npm run typecheck`, `npm run lint`, `npm run replay:inspect`, and Logics validation before closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_231_apply_circuit_speed_profile_to_chrono_replay_traces`
- `item_232_add_chrono_compatible_replay_phases`
- `item_233_make_chrono_weather_handling_visible_in_trace_speed`
- `item_234_extend_replay_inspection_to_chrono_traces`

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
- Wave 1: implemented chrono replay parity for circuit speed profile, solo phases, and weather-visible trace speed. `createQualifyingRuns` now accepts `speedProfile`, league chrono call sites pass `trackSpeedProfileForCircuit(circuit)`, generated chrono `cars` traces emit `grid`/`launch`/`racing`/`finished`, and rainy/non-straight spans lower trace speed without changing qualifying lap-time calculation.
- Wave 1 validation: `npm test -- apps/api/src/features/leagues/qualifying.test.ts` and `npm run typecheck` passed.
- Wave 2: extended `npm run replay:inspect` with representative chrono traces for Prague, Monaco, and Montreal. The output now includes trace count, phases, final chrono time, sample progress, lap, weather, phase, and speed alongside the race trace samples.
- Wave 2 validation: `npm run replay:inspect` and `npm run typecheck` passed.

# AI Context
- Summary: Orchestrate chrono replay race-track parity
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_098_chrono_replay_race_track_parity`
- Product brief(s): `prod_061_chrono_replay_race_track_parity_product_brief`
- Architecture decision(s): (none yet)
