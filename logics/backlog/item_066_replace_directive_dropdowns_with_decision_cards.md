## item_066_replace_directive_dropdowns_with_decision_cards - Replace directive dropdowns with decision cards
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
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
