## item_351_produce_the_emote_sprite_sheet_and_its_assets - Produce the emote sprite sheet and its assets
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
- The emote vocabulary needs artwork, and the project has an established sheet-to-WebP path that should be followed rather than reinvented.
- A previous sheet came back with an opaque gradient background despite the prompt asking for transparency, so the extraction pass has to be planned rather than assumed.
- Nothing currently asserts that a declared emote identifier has a committed asset behind it.

# Scope
- In:
  - Send the generator prompt below as-is. It is already generated and committed; do not rewrite it or re-run the generator command.
  - Slice the returned sheet, remove the background if the generator ignores the transparency instruction, and convert to 128 px WebP as the board icon runbook describes.
  - Commit only the final WebP assets and keep the source sheet in logics/external, which is not versioned.
  - Add a test asserting every declared emote identifier resolves to a committed asset carrying a RIFF/WEBP header, mirroring the existing board icon asset test.
- Out:
  - Do not commit the source sheet or intermediate PNG cells.
  - Do not add a runtime image dependency or a sprite atlas loader.
  - Do not produce per-team or per-livery emote variants.

# Generator prompt

Ready to send to an image generator. Also committed verbatim at
`logics/design/race-replay-driver-emotes/prompt.md`, with the structured payload at
`prompt-pack.json` (sections, cell manifest, layout, cell size).

Produced by:

```
logics-manager design prompt --kind icon-sheet --cell-size 256x256 \
  --palette "warm oranges, reds, charcoal, steel grey, gold; no blues" \
  --style "glossy 3D board-game token, thick soft outlines, saturated colours, subtle top-left light" \
  --cells "scare: ...|relief: ...|<the 16 emotes in fill order>" \
  --text "driver reaction emotes that pop above a race car during a replay, seen at small size on a dark map"
```

The prompt to send:

```text
Create 16 icon sheet asset(s) for: driver reaction emotes that pop above a race car during a replay, seen at small size on a dark map.
Generator target: general AI image generator.
Canvas: 4x4 grid, 1024x1024 total with 256x256 cells; transparent background PNG; one asset per cell, centered, with generous padding and no bleed between cells. Fill left-to-right, then top-to-bottom.
Assets, in fill order:
1. scare: a worried grimace, wide eyes, sweat drop
2. relief: an exhaling face, eyes closed, puff of breath
3. fire: a determined blazing face
4. angry: a frustrated snort, furrowed brow
5. eyeing: narrowed focused eyes sizing up a target
6. pressure: a tense clenched grimace, gritted teeth
7. dizzy: a dazed face with spiral eyes
8. strong: a confident grin with a flexed arm
9. empty-battery: a drained face beside a flat battery
10. warning: an alarmed face beside a hazard triangle
11. cheer: a jubilant open-mouthed cheer
12. smug: a self-satisfied smirk
13. shocked: a jaw-dropped gasp
14. cool: a face wearing dark visor shades
15. sad: a downcast disappointed face
16. sleepy: a bored half-lidded yawn
Palette: warm oranges, reds, charcoal, steel grey, gold; no blues. Do not introduce colours outside it.
Style: glossy 3D board-game token, thick soft outlines, saturated colours, subtle top-left light.
Clean silhouettes, consistent lighting and perspective, readable at 24px, 32px and 48px.
Exclude: text, letters, numbers, labels, grid lines, watermarks, background decoration, any opaque or gradient background, drop shadows cast onto the transparent background, cropped or clipped assets.
```

The 16 cells fill the 4x4 grid exactly. Cells 1 to 10 are the vocabulary the event mapping
needs; 11 to 16 are reserve, so a later event type does not require a second sheet.

# Acceptance criteria
- AC1: Every emote identifier declared by the mapping has a committed 128 px WebP asset.
- AC2: Assets carry a transparent background and are readable at the size the map renders them.
- AC3: A test fails if an emote identifier has no asset behind it.
- AC4: The board icon assets runbook covers the emote sheet, including the extraction pass when transparency is ignored.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: Every emote identifier declared by the mapping has a committed 128 px WebP asset.
- request-AC2 -> This backlog slice. Evidence needed: Events that are narration or bookkeeping rather than a reaction emit nothing, and a single pit stop produces at most one emote instead of one per pit event.
- request-AC3 -> This backlog slice. Evidence needed: A per-car cooldown caps how often one car can react, with major severity winning over minor when both fall inside the same window.
- request-AC4 -> This backlog slice. Evidence needed: Every car on the map can emote, not only the player's car.
- request-AC5 -> This backlog slice. Evidence needed: The emote appears above the car at the moment the replay clock crosses the event position, floats and fades like the existing position delta, and is cleared without leaking timers.
- request-AC7 -> This backlog slice. Evidence needed: Motion is disabled under prefers-reduced-motion while the emote itself stays visible, matching the existing reduced-motion blocks.
- request-AC8 -> This backlog slice. Evidence needed: Lint, typecheck, build, unit tests and the e2e suite pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_084_race_replay_driver_emotes_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_132_pop_driver_reaction_emotes_above_cars_during_the_replay`
- Primary task(s): `task_133_orchestrate_race_replay_driver_emotes`

# AI Context
- Summary: Produce the emote sprite sheet and its assets
- Keywords: scaffolded-backlog, produce the emote sprite sheet and its assets, implementation-ready
- Use when: Implementing the scaffolded slice for Produce the emote sprite sheet and its assets.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_133_orchestrate_race_replay_driver_emotes`

# Notes
- Task `task_133_orchestrate_race_replay_driver_emotes` was finished via `logics-manager flow finish task` on 2026-07-29.
