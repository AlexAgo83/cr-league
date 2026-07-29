## item_351_produce_the_emote_sprite_sheet_and_its_assets - Produce the emote sprite sheet and its assets
> From version: 0.8.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90
> Confidence: 85
> Progress: 0
> Complexity: Medium
> Theme: Race replay expressiveness
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The emote vocabulary needs artwork, and the project has an established sheet-to-WebP path that should be followed rather than reinvented.
- A previous sheet came back with an opaque gradient background despite the prompt asking for transparency, so the extraction pass has to be planned rather than assumed.
- Nothing currently asserts that a declared emote identifier has a committed asset behind it.

# Scope
- In:
  - Generate the sheet prompt with logics-manager design prompt using --kind icon-sheet, --cell-size 256x256, a --cells manifest listing every emote in fill order, and the project palette and style. The generated pack is already committed at `logics/design/race-replay-driver-emotes/`.
  - Slice the returned sheet, remove the background if the generator ignores the transparency instruction, and convert to 128 px WebP as the board icon runbook describes.
  - Commit only the final WebP assets and keep the source sheet in logics/external, which is not versioned.
  - Add a test asserting every declared emote identifier resolves to a committed asset carrying a RIFF/WEBP header, mirroring the existing board icon asset test.
- Out:
  - Do not commit the source sheet or intermediate PNG cells.
  - Do not add a runtime image dependency or a sprite atlas loader.
  - Do not produce per-team or per-livery emote variants.

# Acceptance criteria
- AC1: Every emote identifier declared by the mapping has a committed 128 px WebP asset.
- AC2: Assets carry a transparent background and are readable at the size the map renders them.
- AC3: A test fails if an emote identifier has no asset behind it.
- AC4: The board icon assets runbook covers the emote sheet, including the extraction pass when transparency is ignored.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: Every emote identifier declared by the mapping has a committed 128 px WebP asset.

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
