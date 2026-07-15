## item_065_map_directive_choices_to_player_facing_race_plan_language - Map directive choices to player-facing race plan language
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 92
> Confidence: 87
> Progress: 100%
> Complexity: Low
> Theme: UX copy and decision model
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The current labels Approach, Preparation, and Card are accurate but not explanatory enough for a new player.
- The current hints describe each field in isolation, so players do not understand the combined race plan.
- The lock moment uses submit-style wording that does not clearly communicate consequence.
- The start of the GP day does not clearly frame the sequence from circuit reading to chrono testing, directive adjustment, plan lock, and GP launch.

# Scope
- In:
  - Define player-facing labels for the existing approach values: prudent, balanced, and aggressive.
  - Define player-facing labels for the existing preparation values: speed, reliability, and weather.
  - Define short consequence copy for each choice: priority, upside, downside, and when to use it.
  - Define plan-summary copy templates for common combinations without adding simulation logic.
  - Define compact current-step copy for the race-day sequence: read circuit, test chrono, adjust directive, lock plan, launch GP.
  - Rename the panel and CTA to communicate a pit wall plan and lock action.
  - Explain chrono attempts as setup validation and grid-position improvement before the plan is final.
  - Add all new copy to EN/FR i18n catalogs.
- Out:
  - New directive values.
  - New simulation modifiers.
  - Long tutorial text.
  - A new permanent tutorial panel.
  - AI recommendations.
  - Marketing copy outside the game UI.

# Acceptance criteria
- AC1: Every current directive value has a plain-language label and consequence in EN/FR.
- AC2: The primary CTA copy communicates that the plan will be locked.
- AC3: The confirmation modal explains qualifying attempts left and lock consequence in EN/FR.
- AC4: No new player-facing copy is hardcoded inside `DirectivePanel.tsx`.
- AC5: The race-day start exposes one compact current objective that makes chrono purpose and the next transition clear.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Every current directive value has a plain-language label and consequence in EN/FR.
- request-AC2 -> This backlog slice. Proof: AC2: The primary CTA copy communicates that the plan will be locked.
- request-AC3 -> This backlog slice. Proof: AC3: The confirmation modal explains qualifying attempts left and lock consequence in EN/FR.
- request-AC5 -> This backlog slice. Proof: AC4: No new player-facing copy is hardcoded inside `DirectivePanel.tsx`.
- request-AC6 -> This backlog slice. Proof: AC4: No new player-facing copy is hardcoded inside `DirectivePanel.tsx`.
- request-AC7 -> This backlog slice. Proof: AC4: No new player-facing copy is hardcoded inside `DirectivePanel.tsx`.
- request-AC11 -> This backlog slice. Proof: AC5: The race-day start exposes one compact current objective that makes chrono purpose and the next transition clear.
- request-AC12 -> This backlog slice. Proof: AC5: The race-day start exposes one compact current objective that makes chrono purpose and the next transition clear.
- request-AC8 -> This backlog slice. Evidence needed: Existing create-league, qualifying, submit-directive, launch-GP, and replay flows continue to pass unit/e2e validation.
- request-AC9 -> This backlog slice. Evidence needed: Desktop and mobile layouts keep all directive controls readable, with no text overflow or overlapping controls.
- request-AC10 -> This backlog slice. Evidence needed: Grip, Overtaking, and Energy remain visible on the map, and the race planning surface explains each value's qualitative level, concrete race meaning, and likely directive/card tradeoff.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_009_pit_wall_race_plan_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_038_redesign_the_race_directive_into_a_clear_pit_wall_plan`
- Primary task(s): `task_039_orchestrate_pit_wall_race_plan_clarity`

# AI Context
- Summary: Map directive choices to player-facing race plan language
- Keywords: scaffolded-backlog, map directive choices to player-facing race plan language, implementation-ready
- Use when: Implementing the scaffolded slice for Map directive choices to player-facing race plan language.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_039_orchestrate_pit_wall_race_plan_clarity`

# Notes
- Task `task_039_orchestrate_pit_wall_race_plan_clarity` was finished via `logics-manager flow finish task` on 2026-07-16.
