## req_132_pop_driver_reaction_emotes_above_cars_during_the_replay - Pop driver reaction emotes above cars during the replay
> From version: 0.8.0
> Schema version: 1.0
> Status: Done
> Understanding: 90
> Confidence: 85
> Complexity: Medium
> Theme: Race replay expressiveness
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Give every car on the replay map a visible reaction to what happens to it during the race.
- React to simulation race events rather than to player-authored input, so solo and multiplayer both benefit.
- Keep the replay readable: the map already carries car sprites, position deltas, the plan panel, the classification and the race director banner.
- Reuse the existing pop-and-float machinery instead of introducing a second animation system.

# Context
- The replay is the emotional payoff of a Grand Prix and currently shows position changes as bare numbers, with no reaction attached to mechanical scares, errors, defenses or personal records.
- Events are already resolved to a position on the trace, so an emote can appear where the incident happens rather than at a fixed screen location.
- Event density is the main risk: 27 events across 5 cars in one race means an unfiltered mapping would produce near-continuous pops, and one pit stop alone emits three consecutive events.
- The project ships 128 px WebP board icons produced from 4x4 sprite sheets, documented in the board icon assets runbook, and the emote set should follow the same production and conversion path.
- The generator prompt for the emote sheet is already generated and committed, verbatim in `item_351` and at `logics/design/race-replay-driver-emotes/`, so the implementer sends it rather than composing one.

# Acceptance criteria
- AC1: A pure mapping function in packages/shared resolves a RaceEvent to an emote identifier or to nothing, and is covered by unit tests without a browser.
- AC2: Events that are narration or bookkeeping rather than a reaction emit nothing, and a single pit stop produces at most one emote instead of one per pit event.
- AC3: A per-car cooldown caps how often one car can react, with major severity winning over minor when both fall inside the same window.
- AC4: Every car on the map can emote, not only the player's car.
- AC5: The emote appears above the car at the moment the replay clock crosses the event position, floats and fades like the existing position delta, and is cleared without leaking timers.
- AC6: A 16-emote sprite sheet is generated, sliced, converted to 128 px WebP, and every declared emote identifier resolves to a committed asset, asserted by a test in the same spirit as the existing board icon asset test.
- AC7: Motion is disabled under prefers-reduced-motion while the emote itself stays visible, matching the existing reduced-motion blocks.
- AC8: Lint, typecheck, build, unit tests and the e2e suite pass.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_084_race_replay_driver_emotes_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- apps/web/src/features/CircuitMap.tsx
- apps/web/src/features/ReplayView.tsx
- apps/web/src/features/replay/useReplayClock.ts
- apps/web/src/features/VisualIcon.tsx
- apps/web/src/styles/layout.css
- packages/shared/src/domain/race.ts
- docs/board-icon-assets-runbook.md
- Current diagnostic: CircuitMap already renders a text slot for car.eventLabel at y=-34, above the position delta at y=-16, but no caller ever sets eventLabel, so the slot has never displayed anything.
- Current diagnostic: useReplayClock already computes positionPops as a record keyed by teamId holding a delta plus a key that forces the float animation to replay, and clears each entry with a 1100 ms timer. An emote channel is the same shape with a glyph instead of a number.
- Current diagnostic: RaceEvent already carries lap, traceProgress, trackProgress, zoneKind, severity and positionDelta, so events are positioned along the trace and can be fired as the replay clock crosses them.
- Current diagnostic: RaceEventType declares 26 event types. A measured 8-lap solo race with 5 teams produced 27 events in total and 6 for a single team, three of which were the consecutive pit_imminent, pit_stop and pit_exit of one pit stop.
- Current diagnostic: the CSS keyframe map-car-delta-float already animates a 32 px rise with a fade over 1 s and is the pattern the emote pop should mirror.
- Current diagnostic: prefers-reduced-motion blocks already exist in layout.css for the splash title, the finish flag and the saved league card.

# AI Context
- Summary: Pop driver reaction emotes above cars during the replay
- Keywords: request-chain-scaffold, pop driver reaction emotes above cars during the replay, development-ready
- Use when: You need to implement or review the scaffolded workflow for Pop driver reaction emotes above cars during the replay.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_350_map_race_events_to_a_curated_emote_vocabulary`
- `item_351_produce_the_emote_sprite_sheet_and_its_assets`
- `item_352_render_the_emote_above_every_car_on_the_replay_map`
