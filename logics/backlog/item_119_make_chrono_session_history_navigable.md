## item_119_make_chrono_session_history_navigable - Make chrono session history navigable
> From version: 0.3.7
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Chrono learning loop
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Players can run multiple chronos, but cannot easily revisit each attempt and compare the setups that produced those times.

# Scope
- In:
  - Add a compact attempt navigator for the current player's chrono sessions on the current GP.
  - Use existing `playerQualifyingRuns` ordering and mark best, selected, and latest attempts.
  - Selecting an attempt updates the chrono report and existing qualifying replay preview when available.
  - Keep the UI usable on mobile with stable dimensions and no large table.
- Out:
  - Cross-GP chrono archive.
  - Server pagination.
  - Export/share of chrono sessions.

# Acceptance criteria
- AC1: With at least two attempts, the player can select each attempt and see its config/report.
- AC2: The best attempt is visually marked and remains identifiable after selecting another attempt.
- AC3: Mobile layout does not overflow the race desk.
- AC4: Tests cover selection and best marker behavior.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: With at least two attempts, the player can select each attempt and see its config/report.
- request-AC9 -> This backlog slice. Proof: AC2: The best attempt is visually marked and remains identifiable after selecting another attempt.
- request-AC10 -> This backlog slice. Proof: AC3: Mobile layout does not overflow the race desk.
- request-AC4 -> This backlog slice. Evidence needed: Map visuals reflect weather states in a lightweight, readable way across desktop and mobile, without hiding route, cars, or controls.
- request-AC5 -> This backlog slice. Evidence needed: Replay events can appear as short visual callouts near the affected car(s), keyed from real simulation events and bounded so the map stays legible.
- request-AC6 -> This backlog slice. Evidence needed: After replay completion, the player sees a payoff recap containing position change, points, credits, card spend/consumption, and championship movement when available.
- request-AC7 -> This backlog slice. Evidence needed: New leagues start without an inventory card and with a deliberate starting credit balance that lets the player choose an early card; tests and fixtures reflect the new economy.
- request-AC8 -> This backlog slice. Evidence needed: Tire strategy is specified as a small, testable mechanic with three choices (soft/medium/hard or equivalent), clear effects, and no speculative tire-management system.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_020_race_learning_and_feedback_systems_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_049_race_learning_and_feedback_systems`
- Primary task(s): `task_050_orchestrate_race_learning_and_feedback_systems`

# AI Context
- Summary: Make chrono session history navigable
- Keywords: scaffolded-backlog, make chrono session history navigable, implementation-ready
- Use when: Implementing the scaffolded slice for Make chrono session history navigable.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_050_orchestrate_race_learning_and_feedback_systems`

# Notes
- Task `task_050_orchestrate_race_learning_and_feedback_systems` was finished via `logics-manager flow finish task` on 2026-07-18.
