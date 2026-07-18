## item_118_add_dynamic_chrono_report_after_each_qualifying_attempt - Add dynamic chrono report after each qualifying attempt
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
- Chrono attempts currently produce a time and replay data, but the player does not get a clear interpretation of whether the tested setup was good, bad, or situational.
- The decision and result data already exist on each `QualifyingRun`; the UI is underusing them.

# Scope
- In:
  - Build a chrono report model from the latest `QualifyingRun`: lap time, attempt/lap number, tested approach/preparation/card, likely weather, circuit traits, and delta versus player best.
  - Render the report near the current chrono result area in the race desk using existing panel/modal patterns.
  - Add one concise interpretation sentence chosen from data: better than best, slower than best, weather-aligned, trait-misaligned, card helped, or no clear signal.
  - Add EN/FR strings and focused React tests for report rendering and fallback states.
- Out:
  - Persisting new data server-side.
  - Full telemetry charts.
  - AI recommendations.
  - Changing qualifying simulation.

# Acceptance criteria
- AC1: After a chrono attempt, the latest attempt report is visible with time, config, comparison, and interpretation.
- AC2: If there is only one attempt, comparison copy says it is the reference attempt rather than showing a fake delta.
- AC3: The report handles a missing card cleanly.
- AC4: EN/FR copy and focused tests are included.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: After a chrono attempt, the latest attempt report is visible with time, config, comparison, and interpretation.
- request-AC9 -> This backlog slice. Proof: AC2: If there is only one attempt, comparison copy says it is the reference attempt rather than showing a fake delta.
- request-AC10 -> This backlog slice. Proof: AC3: The report handles a missing card cleanly.
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
- Summary: Add dynamic chrono report after each qualifying attempt
- Keywords: scaffolded-backlog, add dynamic chrono report after each qualifying attempt, implementation-ready
- Use when: Implementing the scaffolded slice for Add dynamic chrono report after each qualifying attempt.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_050_orchestrate_race_learning_and_feedback_systems`

# Notes
- Task `task_050_orchestrate_race_learning_and_feedback_systems` was finished via `logics-manager flow finish task` on 2026-07-18.
