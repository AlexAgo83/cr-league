## item_119_make_chrono_session_history_navigable - Make chrono session history navigable
> From version: 0.3.7
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 70%
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
