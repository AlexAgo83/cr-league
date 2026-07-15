## item_062_show_the_starting_grid_in_the_race_launch_confirmation - Show the starting grid in the race launch confirmation
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Pre-race ceremony
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Launching the race jumps straight from the directive to the result: the player never sees the starting line their qualifying earned, so qualifying feels disconnected from the race.
- The server computes the grid (standingsRank from best qualifying times) but the web never shows it.

# Scope
- In:
  - Add a grid-order helper in apps/web mirroring buildParticipants' comparator (best qualifying time ascending, team-order fallback for missing times), unit-tested against the server rule.
  - Enrich the existing race-launch confirmation with the grid list: P1..Pn, livery, team name, best time or no-qualifying label, player row highlighted, plus circuit name, traits, and forecast already available in state.
  - Route all new copy through EN/FR catalogs.
  - Extend or complement the e2e flow to assert the grid appears before launch.
- Out:
  - Changing how the server builds participants or any qualifying mechanic.
  - A separate pre-race screen or extra confirmation step.
  - Grid animations.

# Acceptance criteria
- AC1: With qualifying times present, the confirmation lists the field in server-identical order with times; without any qualifying, it falls back to team order with the no-qualifying label.
- AC2: The player's row is visually highlighted and the GP conditions are shown in the same modal.
- AC3: The grid helper unit test covers ties/missing times; EN and FR keys are complete.
- AC4: All gates pass and the e2e asserts the grid recap.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: With qualifying times present, the confirmation lists the field in server-identical order with times; without any qualifying, it falls back to team order with the no-qualifying label.
- request-AC2 -> This backlog slice. Proof: AC2: The player's row is visually highlighted and the GP conditions are shown in the same modal.
- request-AC7 -> This backlog slice. Proof: AC3: The grid helper unit test covers ties/missing times; EN and FR keys are complete.
- request-AC8 -> This backlog slice. Proof: AC4: All gates pass and the e2e asserts the grid recap.
- request-AC9 -> This backlog slice. Proof: AC4: All gates pass and the e2e asserts the grid recap.
- request-AC5 -> This backlog slice. Evidence needed: The Championship view gains a palmares: one line per completed season (season number, champion name and livery, GP count), derived from the same helper, visible without opening any modal.
- request-AC6 -> This backlog slice. Evidence needed: The GP history is grouped by season with the most recent season expanded and older seasons collapsed; each season header shows the summary line and each entry keeps its current content and interactions (including history replay).

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_008_race_ceremony_and_season_narrative_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_037_starting_grid_modal_and_season_narrative`
- Primary task(s): `task_038_orchestrate_starting_grid_and_season_narrative`

# AI Context
- Summary: Show the starting grid in the race launch confirmation
- Keywords: scaffolded-backlog, show the starting grid in the race launch confirmation, implementation-ready
- Use when: Implementing the scaffolded slice for Show the starting grid in the race launch confirmation.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_038_orchestrate_starting_grid_and_season_narrative`

# Notes
- Task `task_038_orchestrate_starting_grid_and_season_narrative` was finished via `logics-manager flow finish task` on 2026-07-15.
