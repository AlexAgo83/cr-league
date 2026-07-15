## item_067_make_garage_card_selection_readable_inside_the_race_plan - Make garage card selection readable inside the race plan
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Garage card clarity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The current card dropdown hides the player's inventory and does not make card spending feel like a strategic lever.
- The fit badge and card stat badges exist but are visually subordinate to the form control.
- Players may not understand that selecting no card is valid and sometimes desirable.

# Scope
- In:
  - Render `No card` as an explicit save-resources option.
  - Render owned cards as selectable cards or rows with name, fit label, short reason, and `CardStatBadges`.
  - Show empty inventory copy when no cards are owned.
  - Keep qualifying lock behavior for `qualifying_focus` understandable when a card is locked by a qualifying run.
  - Use existing `cardFit`, card hints, and owned card IDs rather than new recommendation logic.
- Out:
  - Changing the garage shop.
  - Adding card rarity or card art.
  - Adding new card effects.
  - Changing card ownership or consumption rules.

# Acceptance criteria
- AC1: The no-card choice is visible and describes why saving a card can be valid.
- AC2: Owned cards are selectable without a dropdown.
- AC3: Card fit status and card stat badges remain visible for selected or candidate cards.
- AC4: Empty inventory state is clear and does not block plan locking.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: The no-card choice is visible and describes why saving a card can be valid.
- request-AC5 -> This backlog slice. Proof: AC2: Owned cards are selectable without a dropdown.
- request-AC7 -> This backlog slice. Proof: AC3: Card fit status and card stat badges remain visible for selected or candidate cards.
- request-AC8 -> This backlog slice. Proof: AC4: Empty inventory state is clear and does not block plan locking.
- request-AC9 -> This backlog slice. Proof: AC4: Empty inventory state is clear and does not block plan locking.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_009_pit_wall_race_plan_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_038_redesign_the_race_directive_into_a_clear_pit_wall_plan`
- Primary task(s): `task_039_orchestrate_pit_wall_race_plan_clarity`

# AI Context
- Summary: Make garage card selection readable inside the race plan
- Keywords: scaffolded-backlog, make garage card selection readable inside the race plan, implementation-ready
- Use when: Implementing the scaffolded slice for Make garage card selection readable inside the race plan.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
