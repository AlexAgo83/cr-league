## item_118_add_dynamic_chrono_report_after_each_qualifying_attempt - Add dynamic chrono report after each qualifying attempt
> From version: 0.3.7
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 15%
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
