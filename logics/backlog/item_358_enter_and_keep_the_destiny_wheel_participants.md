## item_358_enter_and_keep_the_destiny_wheel_participants - Enter and keep the Destiny Wheel participants
> From version: 0.8.0
> Schema version: 1.0
> Status: Done
> Understanding: 100
> Confidence: 95
> Progress: 100
> Complexity: Low
> Theme: Solo modes
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- A draw needs the people in it, and typing them again on every run would defeat the point of a quick tool.
- Arcade holds no league, so it must not borrow a campaign save slot to store anything.

# Scope
- In:
  - Add a participant list with add and remove, entered as names only.
  - Assign a livery and a car to each participant automatically, from the palette the game already uses.
  - Persist the list under its own key when the draw is validated, and restore it on the next visit.
  - Bound the list by the grid ceiling the domain already states, and require at least two.
  - Cover storage with unit tests, including that campaign slot keys are untouched.
- Out:
  - No colour or car picker.
  - No reordering, import or export of the list.
  - No named or multiple saved participant lists.

# Acceptance criteria
- AC1: A validated list is restored on the next visit to the game.
- AC2: The list cannot be launched below two participants and cannot exceed the grid ceiling.
- AC3: Each participant gets distinguishable colours without the player choosing them.
- AC4: No campaign slot key is read or written by the arcade.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: A validated list is restored on the next visit to the game.
- request-AC7 -> This backlog slice. Proof: AC2: The list cannot be launched below two participants and cannot exceed the grid ceiling.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_086_solo_arcade_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_134_split_solo_into_campaign_and_arcade_with_a_destiny_wheel_draw`
- Primary task(s): `task_135_orchestrate_the_solo_arcade_and_its_destiny_wheel`

# AI Context
- Summary: Enter and keep the Destiny Wheel participants
- Keywords: scaffolded-backlog, enter and keep the destiny wheel participants, implementation-ready
- Use when: Implementing the scaffolded slice for Enter and keep the Destiny Wheel participants.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
