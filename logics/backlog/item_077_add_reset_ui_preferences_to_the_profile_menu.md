## item_077_add_reset_ui_preferences_to_the_profile_menu - Add Reset UI preferences to the Profile menu
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Preference recovery
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Dismissed contextual help needs a discoverable recovery path.
- The Profile menu already contains language, league, recovery, and forget-profile actions, so it is the natural location for a non-destructive preference reset.
- The reset action must be visually and behaviorally distinct from forgetting the profile.

# Scope
- In:
  - Add a Profile menu action for resetting UI preferences.
  - Clear only the preference allowlist defined for this feature.
  - Immediately update in-memory state so dismissed panels can reappear without requiring a full reload where practical.
  - Reset replay speed/focus and season recap seen flags if included in the allowlist.
  - Show existing lightweight status feedback after reset.
  - Add localized EN/FR labels and status copy.
- Out:
  - New settings page.
  - Confirmation modal unless the implementation proves accidental activation is likely.
  - Resetting profile, league, or recovery data.
  - Adding server APIs.

# Acceptance criteria
- AC1: The Profile menu shows a Reset UI preferences action.
- AC2: Activating it re-shows dismissed help panels.
- AC3: Activating it does not open the destructive forget-profile dialog.
- AC4: Activating it does not remove profile/session/player claim localStorage values.
- AC5: The user receives localized status feedback.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: The Profile menu shows a Reset UI preferences action.
- request-AC5 -> This backlog slice. Proof: AC2: Activating it re-shows dismissed help panels.
- request-AC6 -> This backlog slice. Proof: AC3: Activating it does not open the destructive forget-profile dialog.
- request-AC7 -> This backlog slice. Proof: AC4: Activating it does not remove profile/session/player claim localStorage values.
- request-AC8 -> This backlog slice. Proof: AC5: The user receives localized status feedback.
- request-AC9 -> This backlog slice. Proof: AC5: The user receives localized status feedback.
- request-AC10 -> This backlog slice. Evidence needed: Unit/e2e tests cover panel dismissal persistence, reset re-show behavior, replay preference reset behavior, and preservation of durable profile/session data.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_011_dismissible_help_panels_and_ui_preferences_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_040_add_dismissible_help_panels_and_ui_preference_reset`
- Primary task(s): `task_041_orchestrate_dismissible_help_panels_and_ui_preference_reset`

# AI Context
- Summary: Add Reset UI preferences to the Profile menu
- Keywords: scaffolded-backlog, add reset ui preferences to the profile menu, implementation-ready
- Use when: Implementing the scaffolded slice for Add Reset UI preferences to the Profile menu.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_041_orchestrate_dismissible_help_panels_and_ui_preference_reset`

# Notes
- Task `task_041_orchestrate_dismissible_help_panels_and_ui_preference_reset` was finished via `logics-manager flow finish task` on 2026-07-16.
