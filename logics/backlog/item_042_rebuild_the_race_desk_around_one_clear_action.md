## item_042_rebuild_the_race_desk_around_one_clear_action - Rebuild the race desk around one clear action
> From version: 0.1.0
> Schema version: 1.0
> Status: In progress
> Understanding: 95
> Confidence: 95
> Progress: 70%
> Complexity: Medium
> Theme: Race desk UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The race desk currently mixes setup, settings, directive controls, telemetry, and action buttons in a way that dilutes the main task.
- Players should immediately understand whether they are preparing, waiting, resolving, reviewing, or starting the next GP.
- Several labels and copy paths need to be checked so the race desk does not leak English in French playtests.

# Scope
- In:
  - Redesign the race desk first viewport for briefing, ready, and resolved states.
  - Keep exactly one visually dominant command for the current state.
  - Group directive controls as a clear strategy form, separate from league settings.
  - Show track traits, likely weather, selected card, readiness, and player team status as supporting cockpit telemetry.
  - Move secondary commands such as settings, forget team, and restart away from the primary action row.
  - Route all new race desk copy through EN/FR catalogs.
- Out:
  - Changing directive choices.
  - Adding card recommendations beyond existing logic.
  - New scheduler behavior.
  - Account or permission changes.

# Acceptance criteria
- AC1: In each race state, there is one visually dominant primary action and secondary actions are clearly lower priority.
- AC2: The directive form remains usable and validated by the existing API flow.
- AC3: French mode shows French labels for the redesigned race desk controls and state text.
- AC4: Existing create, directive submit, resolve, and next-GP flows remain covered by unit or e2e tests.

# Direction to carry into implementation
- Briefing/preparation state:
  - Header: current GP, track name if available, and state label `Preparation`.
  - Primary command: `Submit directive`.
  - Supporting telemetry: city, circuit layout, lap count, likely weather, grip, overtaking, energy, readiness, available card, player team, and invite/league context only if it helps the decision.
  - Directive form: compact, grouped as the strategy input, with validation errors near the relevant control.
- Ready/locked state:
  - Header: current GP and state label `Directive locked`.
  - Primary command: `Launch GP` or the existing resolve wording used by the app.
  - Supporting telemetry: one-line directive summary, selected card, readiness, and what will happen next.
  - Do not keep editable strategy controls visually dominant once the directive is locked.
- Resolved state:
  - Header: state label `Race complete`.
  - Primary command: `Next GP` when valid.
  - Supporting telemetry: position, points, credits, card consumed, reward, and the shortest explanation of why the outcome happened.
- Secondary commands such as settings, forget team, restart, and debug/playtest controls must sit away from the command row and cannot compete with the state command.
- All labels above must exist in EN and FR catalogs before the slice is considered complete.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: In each race state, there is one visually dominant primary action and secondary actions are clearly lower priority.
- request-AC3 -> This backlog slice. Proof: AC2: The directive form remains usable and validated by the existing API flow.
- request-AC5 -> This backlog slice. Proof: AC3: French mode shows French labels for the redesigned race desk controls and state text.
- request-AC8 -> This backlog slice. Proof: AC4: Existing create, directive submit, resolve, and next-GP flows remain covered by unit or e2e tests.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_003_race_cockpit_redesign_v0_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_032_redesign_the_cr_league_race_cockpit_v0`
- Primary task(s): `task_033_orchestrate_race_cockpit_redesign_v0`

# AI Context
- Summary: Rebuild the race desk around one clear action
- Keywords: scaffolded-backlog, rebuild the race desk around one clear action, implementation-ready
- Use when: Implementing the scaffolded slice for Rebuild the race desk around one clear action.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
