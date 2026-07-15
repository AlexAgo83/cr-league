## item_078_validate_preference_reset_and_panel_behavior - Validate preference reset and panel behavior
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Regression coverage
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Persistence bugs are easy to miss because they require reload and localStorage assertions.
- The most important failure mode is destructive: a UI reset must never remove profile or league data.
- The feature touches both App-level cockpit UI and ReplayView state.

# Scope
- In:
  - Add unit tests for dismissed-panel state and reset allowlist behavior where practical.
  - Add or update e2e coverage for closing Race prep, closing Race replay, reloading, and using Reset UI preferences.
  - Assert durable localStorage keys are preserved after reset.
  - Assert replay speed/focus behavior follows the documented reset policy.
  - Run `npm run typecheck`, `npm run lint`, `npm test -- apps/web`, relevant Playwright tests, `npm run build`, and Logics validation.
- Out:
  - Browser matrix expansion beyond current project defaults.
  - Visual snapshot infrastructure.
  - Server integration tests for local-only preferences.

# Acceptance criteria
- AC1: Tests prove each contextual panel remains hidden after dismissal and reload.
- AC2: Tests prove Reset UI preferences brings contextual panels back.
- AC3: Tests prove durable profile/session/player claim keys survive reset.
- AC4: Local validation gates pass before closeout.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: Tests prove each contextual panel remains hidden after dismissal and reload.
- request-AC5 -> This backlog slice. Proof: AC2: Tests prove Reset UI preferences brings contextual panels back.
- request-AC6 -> This backlog slice. Proof: AC3: Tests prove durable profile/session/player claim keys survive reset.
- request-AC7 -> This backlog slice. Proof: AC4: Local validation gates pass before closeout.
- request-AC9 -> This backlog slice. Proof: AC4: Local validation gates pass before closeout.
- request-AC10 -> This backlog slice. Proof: AC4: Local validation gates pass before closeout.
- request-AC8 -> This backlog slice. Evidence needed: Language reset behavior is an explicit product decision: either preserved during UI reset or intentionally reset with visible copy making that clear.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_011_dismissible_help_panels_and_ui_preferences_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_040_add_dismissible_help_panels_and_ui_preference_reset`
- Primary task(s): `task_041_orchestrate_dismissible_help_panels_and_ui_preference_reset`

# AI Context
- Summary: Validate preference reset and panel behavior
- Keywords: scaffolded-backlog, validate preference reset and panel behavior, implementation-ready
- Use when: Implementing the scaffolded slice for Validate preference reset and panel behavior.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_041_orchestrate_dismissible_help_panels_and_ui_preference_reset`

# Notes
- Task `task_041_orchestrate_dismissible_help_panels_and_ui_preference_reset` was finished via `logics-manager flow finish task` on 2026-07-16.
