## item_357_split_solo_into_campaign_and_arcade - Split Solo into Campaign and Arcade
> From version: 0.8.0
> Schema version: 1.0
> Status: Done
> Understanding: 100
> Confidence: 95
> Progress: 100
> Complexity: Low
> Theme: Solo modes
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Non-semantic edit: 2026-07-29 closeout stamps only; status/progress unchanged.

# Problem
- Solo leads straight to campaign save slots, so a second kind of solo play has nowhere to live.
- The Arcade needs a catalogue that stays readable when it holds one game and when it holds several.

# Scope
- In:
  - Add an Arcade sub-mode beside Campaign on the Solo step, reusing the existing choice-step treatment.
  - Keep Campaign's path to the save slots exactly as it is, including the skip when no slot holds a game.
  - Add a catalogue screen listing the games that exist.
  - Cover the navigation with tests: Campaign still reaches the slots, Arcade reaches the catalogue.
- Out:
  - No locked or coming-soon entries in the catalogue.
  - No change to the multiplayer entry path.
  - No arcade game implementation in this item.

# Acceptance criteria
- AC1: Solo shows Campaign and Arcade, and Campaign behaves exactly as Solo did before.
- AC2: Arcade opens a catalogue listing the games that exist and nothing else.
- AC3: Back from either sub-mode returns to the Solo step, and back from Solo to the entry choice.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Solo shows Campaign and Arcade, and Campaign behaves exactly as Solo did before.
- request-AC2 -> This backlog slice. Proof: AC2: Arcade opens a catalogue listing the games that exist and nothing else.
- request-AC3 -> This backlog slice. Evidence needed: The Destiny Wheel asks for participants by name, and the list persists locally when it is validated.
- request-AC4 -> This backlog slice. Evidence needed: Launching runs a generated Grand Prix through the existing race simulation, without cards, plan, qualifying, points or credits.
- request-AC5 -> This backlog slice. Evidence needed: The race plays on the existing circuit map and its replay, with the plan and stats surfaces absent rather than disabled.
- request-AC6 -> This backlog slice. Evidence needed: The finishing order is shown as the result of the draw, and the draw can be run again with the same participants.
- request-AC7 -> This backlog slice. Evidence needed: Arcade never reads or writes a campaign save slot.
- request-AC8 -> This backlog slice. Evidence needed: The three new board icons and the arcade hero exist as committed assets in the app's formats, and the icon existence test covers them.
- request-AC9 -> This backlog slice. Evidence needed: Lint, typecheck, build, unit tests and the e2e suite pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_086_solo_arcade_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_134_split_solo_into_campaign_and_arcade_with_a_destiny_wheel_draw`
- Primary task(s): `task_135_orchestrate_the_solo_arcade_and_its_destiny_wheel`

# AI Context
- Summary: Split Solo into Campaign and Arcade
- Keywords: scaffolded-backlog, split solo into campaign and arcade, implementation-ready
- Use when: Implementing the scaffolded slice for Split Solo into Campaign and Arcade.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_135_orchestrate_the_solo_arcade_and_its_destiny_wheel`

# Notes
- Task `task_135_orchestrate_the_solo_arcade_and_its_destiny_wheel` was finished via `logics-manager flow finish task` on 2026-07-29.
