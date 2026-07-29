## item_352_render_the_emote_above_every_car_on_the_replay_map - Render the emote above every car on the replay map
> From version: 0.8.0
> Schema version: 1.0
> Status: Done
> Understanding: 100
> Confidence: 95
> Progress: 100
> Complexity: Medium
> Theme: Race replay expressiveness
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The rendering slot exists but has never been fed: CircuitMap renders car.eventLabel and no caller sets it.
- The replay clock already knows how to pop, animate and clear a per-car indicator, and duplicating that logic would create a second lifecycle to keep correct.
- The map is already dense, so the emote has to be legible without competing with the position delta directly below it.

# Scope
- In:
  - Fire the mapped emote when the replay clock crosses the event position along the trace, for every car in the field.
  - Add an emote channel to useReplayClock modelled on positionPops, including the key that replays the animation and the timer that clears it.
  - Feed the existing car.eventLabel slot in CircuitMap, or replace it with an image slot if a text glyph cannot carry the asset.
  - Add a float-and-fade keyframe alongside map-car-delta-float and register the emote in the prefers-reduced-motion block.
  - Cover the clock behaviour with tests: an emote appears when its position is crossed, and clears without leaking timers.
- Out:
  - Do not change how position deltas are computed or displayed.
  - Do not add a settings toggle unless review asks for one.
  - Do not render emotes outside the replay map.

# Acceptance criteria
- AC1: Every car on the map can display an emote, not only the player's.
- AC2: The emote appears when the clock crosses the event position, floats, fades and is removed.
- AC3: Timers are cleared on unmount and no emote state leaks between replays.
- AC4: Under prefers-reduced-motion the emote is shown without motion.
- AC5: Lint, typecheck, build, unit tests and the e2e suite pass.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: Every car on the map can display an emote, not only the player's.
- request-AC5 -> This backlog slice. Proof: AC2: The emote appears when the clock crosses the event position, floats, fades and is removed.
- request-AC7 -> This backlog slice. Proof: AC3: Timers are cleared on unmount and no emote state leaks between replays.
- request-AC8 -> This backlog slice. Proof: AC4: Under prefers-reduced-motion the emote is shown without motion.
- request-AC6 -> This backlog slice. Evidence needed: A 16-emote sprite sheet is generated, sliced, converted to 128 px WebP, and every declared emote identifier resolves to a committed asset, asserted by a test in the same spirit as the existing board icon asset test.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_084_race_replay_driver_emotes_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_132_pop_driver_reaction_emotes_above_cars_during_the_replay`
- Primary task(s): `task_133_orchestrate_race_replay_driver_emotes`

# AI Context
- Summary: Render the emote above every car on the replay map
- Keywords: scaffolded-backlog, render the emote above every car on the replay map, implementation-ready
- Use when: Implementing the scaffolded slice for Render the emote above every car on the replay map.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_133_orchestrate_race_replay_driver_emotes`

# Notes
- Task `task_133_orchestrate_race_replay_driver_emotes` was finished via `logics-manager flow finish task` on 2026-07-29.
