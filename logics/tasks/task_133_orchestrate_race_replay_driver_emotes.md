## task_133_orchestrate_race_replay_driver_emotes - Orchestrate race replay driver emotes
> From version: 0.8.0
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
- [ ] 1. Read CircuitMap.tsx around the car.eventLabel slot, useReplayClock.ts around positionPops, and RaceEventType in packages/shared/src/domain/race.ts before writing any code.
- [ ] 2. Measure event density on a real race first: build a solo fixture, resolve a Grand Prix, and count events per team and per type, so the cooldown is tuned against data rather than guessed.
- [ ] 3. Implement the pure event-to-emote mapping and the cooldown in packages/shared, with tests, before touching any rendering.
- [ ] 4. Generate the sheet prompt with logics-manager design prompt, then slice, extract and convert following the board icon assets runbook.
- [ ] 5. Add the emote channel to useReplayClock by mirroring positionPops, then feed the existing CircuitMap slot for every car in the field.
- [ ] 6. Add the float keyframe and the prefers-reduced-motion entry alongside the existing ones.
- [ ] 7. Verify visually on a rendered replay, not only through unit tests, and check that the emote does not collide with the position delta.
- [ ] 8. Run lint, typecheck, build, unit tests and the e2e suite, and record the results.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_350_map_race_events_to_a_curated_emote_vocabulary`
- `item_351_produce_the_emote_sprite_sheet_and_its_assets`
- `item_352_render_the_emote_above_every_car_on_the_replay_map`

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
- Summary: Orchestrate race replay driver emotes
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_132_pop_driver_reaction_emotes_above_cars_during_the_replay`
- Product brief(s): `prod_084_race_replay_driver_emotes_product_brief`
- Architecture decision(s): (none yet)
