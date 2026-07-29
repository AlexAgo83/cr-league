## item_355_pick_a_solo_slot_from_the_entry_screen - Pick a solo slot from the entry screen
> From version: 0.8.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Solo persistence
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Solo currently launches straight into the game, so there is no surface on which to choose a run.
- A first-time player has nothing to choose between, and the entry flow was recently shortened on purpose.
- A slot that holds a game has to be recognisable without opening it.

# Scope
- In:
  - Add a slot picker reached from Solo, reusing the existing choice-step treatment rather than inventing a new panel style.
  - Show team name, season and round progress, resolved Grand Prix count and last played date on a slot that holds a game.
  - Show an empty slot as empty with a start action.
  - Skip the picker entirely when no slot holds a game, and start a new game directly.
  - Offer deletion behind the existing destructive confirmation, with the shared danger visual.
  - Cover the picker with tests: it appears once a slot exists, it is skipped when none does, and it opens the right slot.
- Out:
  - No new modal system or animation.
  - No slot picker for multiplayer leagues.
  - No settings toggle to force the picker.

# Acceptance criteria
- AC1: With no saved game, Solo starts a game without showing the picker.
- AC2: With at least one saved game, Solo shows three slots and opens the chosen one.
- AC3: A slot holding a game shows the team, progress and last played date; an empty one reads as empty.
- AC4: Deleting a slot asks for confirmation and leaves the other slots playable.
- AC5: Lint, typecheck, build, unit tests and the e2e suite pass.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: With no saved game, Solo starts a game without showing the picker.
- request-AC4 -> This backlog slice. Proof: AC2: With at least one saved game, Solo shows three slots and opens the chosen one.
- request-AC7 -> This backlog slice. Proof: AC3: A slot holding a game shows the team, progress and last played date; an empty one reads as empty.
- request-AC8 -> This backlog slice. Proof: AC4: Deleting a slot asks for confirmation and leaves the other slots playable.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_085_solo_save_slots_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_133_offer_three_solo_save_slots_with_readable_state`
- Primary task(s): `task_134_orchestrate_solo_save_slots`

# AI Context
- Summary: Pick a solo slot from the entry screen
- Keywords: scaffolded-backlog, pick a solo slot from the entry screen, implementation-ready
- Use when: Implementing the scaffolded slice for Pick a solo slot from the entry screen.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
