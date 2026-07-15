## item_066_replace_directive_dropdowns_with_decision_cards - Replace directive dropdowns with decision cards
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Directive interaction design
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Dropdowns hide the available strategies and make the player compare options one at a time.
- The current control shape makes the most important game decision feel like settings configuration.
- The UI does not give enough visual feedback when a choice is selected or locked.

# Scope
- In:
  - Render approach choices as visible selectable controls or cards, all visible at once.
  - Render preparation choices as visible selectable controls or cards, all visible at once.
  - Show selected state, disabled/locked state, and focus state clearly.
  - Keep the existing `setForm` updates and internal values unchanged.
  - Preserve keyboard and screen-reader access through semantic buttons or radios.
  - Update component tests or e2e selectors that currently assume `<select>` controls.
- Out:
  - Changing the command bar architecture.
  - Adding animations beyond simple hover/focus states.
  - New drag-and-drop or carousel interactions.
  - Changing API request bodies.

# Acceptance criteria
- AC1: A player can see all approach options and all preparation options without opening a dropdown.
- AC2: The selected approach and preparation are visually clear on desktop and mobile.
- AC3: Disabled/locked state prevents edits after directive lock while keeping the chosen plan readable.
- AC4: Existing submit-directive flow still posts the same values to the API.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: A player can see all approach options and all preparation options without opening a dropdown.
- request-AC3 -> This backlog slice. Proof: AC2: The selected approach and preparation are visually clear on desktop and mobile.
- request-AC8 -> This backlog slice. Proof: AC3: Disabled/locked state prevents edits after directive lock while keeping the chosen plan readable.
- request-AC9 -> This backlog slice. Proof: AC4: Existing submit-directive flow still posts the same values to the API.
- request-AC5 -> This backlog slice. Evidence needed: A dynamic plan summary explains the selected approach, preparation, and card in one short race-strategy sentence before the player locks the plan.
- request-AC6 -> This backlog slice. Evidence needed: The primary command and confirmation copy make it clear that the directive locks the Grand Prix plan; qualifying remaining state remains visible before lock.
- request-AC7 -> This backlog slice. Evidence needed: The redesign is localized through `apps/web/src/i18n/en.json` and `apps/web/src/i18n/fr.json` with no new hardcoded user-facing copy in the redesigned surface.
- request-AC10 -> This backlog slice. Evidence needed: Grip, Overtaking, and Energy remain visible on the map, and the race planning surface explains each value's qualitative level, concrete race meaning, and likely directive/card tradeoff.
- request-AC11 -> This backlog slice. Evidence needed: The race-day start communicates the current phase and next action in a compact way covering circuit reading, chrono testing, directive adjustment, plan locking, and GP launch.
- request-AC12 -> This backlog slice. Evidence needed: The implementation reduces visible cognitive load by consolidating or replacing existing explanatory clutter; it does not add a new permanent tutorial panel.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_009_pit_wall_race_plan_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_038_redesign_the_race_directive_into_a_clear_pit_wall_plan`
- Primary task(s): `task_039_orchestrate_pit_wall_race_plan_clarity`

# AI Context
- Summary: Replace directive dropdowns with decision cards
- Keywords: scaffolded-backlog, replace directive dropdowns with decision cards, implementation-ready
- Use when: Implementing the scaffolded slice for Replace directive dropdowns with decision cards.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_039_orchestrate_pit_wall_race_plan_clarity`

# Notes
- Task `task_039_orchestrate_pit_wall_race_plan_clarity` was finished via `logics-manager flow finish task` on 2026-07-16.
