## task_133_orchestrate_race_replay_driver_emotes - Orchestrate race replay driver emotes
> From version: 0.8.0
> Schema version: 1.0
> Status: Done
> Understanding: 100
> Confidence: 95
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Read CircuitMap.tsx around the car.eventLabel slot, useReplayClock.ts around positionPops, and RaceEventType in packages/shared/src/domain/race.ts before writing any code.
- [x] 2. Measure event density on a real race first: build a solo fixture, resolve a Grand Prix, and count events per team and per type, so the cooldown is tuned against data rather than guessed.
- [x] 3. Implement the pure event-to-emote mapping and the cooldown in packages/shared, with tests, before touching any rendering.
- [x] 4. Send the generator prompt already committed in `item_351` (and at `logics/design/race-replay-driver-emotes/prompt.md`) to an image generator, then slice, extract and convert following the board icon assets runbook. Do not regenerate the prompt.
- [x] 5. Add the emote channel to useReplayClock by mirroring positionPops, then feed the existing CircuitMap slot for every car in the field.
- [x] 6. Add the float keyframe and the prefers-reduced-motion entry alongside the existing ones.
- [x] 7. Verify visually on a rendered replay, not only through unit tests, and check that the emote does not collide with the position delta.
- [x] 8. Run lint, typecheck, build, unit tests and the e2e suite, and record the results.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_350_map_race_events_to_a_curated_emote_vocabulary`
- `item_351_produce_the_emote_sprite_sheet_and_its_assets`
- `item_352_render_the_emote_above_every_car_on_the_replay_map`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `packages/shared/src/domain/raceEmotes.ts` holds the pure mapping; `raceEmotes.test.ts` covers it with 34 cases and no DOM.
- request-AC2 -> This task. Proof: `EMOTE_BY_EVENT` returns null for pit, weather, note, sponsor and finish events; the test "drops a whole pit sequence" asserts the measured three-event pit burst yields zero emotes.
- request-AC3 -> This task. Proof: `emoteCandidates` applies `EMOTE_COOLDOWN` per team; tests cover one reaction per window, a major event displacing a minor one, reacting again after the window, and per-car independence.
- request-AC4 -> This task. Proof: `ReplayView` maps `emotePops` over every field entry, not only the player; a replay frame captured at trace 0.62 showed 5 emotes at once.
- request-AC5 -> This task. Proof: `useReplayClock` fires as the clock crosses `candidate.progress`, clears each pop after 1400 ms, and `seek` clears the timers, the fired set and the state.
- request-AC6 -> This task. Proof: 16 assets in `apps/web/public/assets/crl/emotes` at 128 px WebP, 76 KB total; `apps/web/src/features/raceEmoteAssets.test.ts` fails if a declared id has no asset.
- request-AC7 -> This task. Proof: `.map-car .map-car-emote { animation: none; }` inside the existing `prefers-reduced-motion` block in `layout.css`; the emote stays visible.
- request-AC8 -> This task. Proof: lint, typecheck, 482 unit tests, build and 7 chromium e2e scenarios all pass.

# Validation
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run test:e2e -- --project=chromium`
- command: `npm run lint && npm run typecheck && npm test && npm run build && npm run test:e2e` | result: passed | date: 2026-07-29
- Finish workflow executed on 2026-07-29.
- Linked backlog/request close verification passed.
- command: `npm test` | result: passed | date: 2026-07-29

# Report
- Delivered. Measured density on a real race: 27 events across 5 cars thinned to 12 emotes, about 2.4 per car.
- The dormant `car.eventLabel` text slot in CircuitMap was replaced by a live image slot rather than kept alongside it.
- One sheet cell bled into the row beneath and was recropped manually; recorded in the board icon assets runbook.
- Finished on 2026-07-29.
- Linked backlog item(s): `item_350_map_race_events_to_a_curated_emote_vocabulary`, `item_351_produce_the_emote_sprite_sheet_and_its_assets`, `item_352_render_the_emote_above_every_car_on_the_replay_map`
- Related request(s): `req_132_pop_driver_reaction_emotes_above_cars_during_the_replay`

# AI Context
- Summary: Orchestrate race replay driver emotes
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_132_pop_driver_reaction_emotes_above_cars_during_the_replay`
- Product brief(s): `prod_084_race_replay_driver_emotes_product_brief`
- Architecture decision(s): (none yet)
