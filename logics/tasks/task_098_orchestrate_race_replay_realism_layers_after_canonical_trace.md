## task_098_orchestrate_race_replay_realism_layers_after_canonical_trace - Orchestrate race replay realism layers after canonical trace
> From version: 0.3.28
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 80%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Read `req_096` first and confirm the canonical replay trace handoff is ready enough before implementing any realism layer.
- [ ] 2. Implement or schedule the layers in dependency order: launch/first corner, chrono-gap spacing, pit-lane phases, overtake stories, traffic/defense, weather handling, late-race pace fade.
- [ ] 3. For each layer, keep logic at the shared trace boundary, keep the web renderer as a consumer, and avoid outcome/balance changes unless a future request explicitly asks for them.
- [ ] 4. After each meaningful layer, update affected Logics docs with scope, validation proof, and any deferred ceiling.
- [ ] 5. Use the developer trace inspection artifact from the canonical trace work to compare representative races before and after each layer.
- [ ] 6. Run focused replay/simulation tests, typecheck, lint, audit:circuits, and Logics validation before closing; run broader tests/build when the touched surface justifies it.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_224_add_launch_and_first_corner_replay_phase`
- `item_225_map_chrono_gaps_to_visual_replay_spacing`
- `item_226_represent_pit_stops_as_entry_stop_and_exit_trace_phases`
- `item_227_turn_order_changes_into_prepared_overtake_stories`
- `item_228_add_bounded_traffic_and_defense_behavior`
- `item_229_make_weather_visible_in_replay_handling`
- `item_230_add_late_race_pace_fade_to_replay_traces`

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
- Wave 1: added a canonical `launch` car phase to generated replay traces for the early car-progress window. This keeps launch/first-corner behavior trace-level and does not change final race scoring.
- Wave 1 validation: `npm test -- packages/shared/src/simulation/simulateRace.test.ts` and `npm run typecheck` passed.
- Wave 2 support: `npm run replay:inspect` now provides the representative trace inspection artifact required before layering more realism effects.
- Wave 3: made weather visible in generated traces by softening non-straight speed-profile spans for rainy segments and exposing lower racing `speed` values in trace output. This remains trace-level and does not retune scoring.
- Wave 3 validation: `npm test -- packages/shared/src/simulation/simulateRace.test.ts`, `npm run typecheck`, `npm run lint`, and `npm run replay:inspect` passed.
- Wave 4: added bounded late-race pace fade to generated trace `speed` values for low-energy circuits in late/finish segments. This preserves final timing and classification.
- Wave 4 validation: `npm test -- packages/shared/src/simulation/simulateRace.test.ts`, `npm run typecheck`, and `npm run lint` passed.
- Wave 5: mapped close chrono gaps into bounded visual spacing in generated replay traces. Close battles now get a minimum visible gap while large gaps remain capped, with pit/grid/finish phases left untouched.
- Wave 5 validation: `npm test -- packages/shared/src/simulation/simulateRace.test.ts`, `npm run typecheck`, and `npm run lint` passed.
- Wave 6: added bounded traffic/defense annotation by marking close leading cars as `defending` in generated trace phases. It is trace metadata only and does not create or remove overtakes.
- Wave 6 validation: `npm test -- packages/shared/src/simulation/simulateRace.test.ts`, `npm run typecheck`, and `npm run lint` passed.

# AI Context
- Summary: Orchestrate race replay realism layers after canonical trace
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_097_race_replay_realism_layers_after_canonical_trace`
- Product brief(s): `prod_060_race_replay_realism_layers_product_brief`
- Architecture decision(s): (none yet)
