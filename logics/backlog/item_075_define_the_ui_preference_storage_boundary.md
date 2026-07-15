## item_075_define_the_ui_preference_storage_boundary - Define the UI preference storage boundary
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Preference safety
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The app stores both durable profile data and lightweight UI preferences in localStorage.
- A reset action is useful only if it is clearly non-destructive.
- Broad localStorage clearing would risk deleting profile, league, and recovery data.

# Scope
- In:
  - Inventory the existing localStorage keys in `App.tsx` and `ReplayView.tsx`.
  - Define stable dismissed-panel keys for Race prep and Race replay help.
  - Create a small explicit UI preference allowlist or helper that covers only intended UI keys.
  - Handle dynamic `cr-league-season-recap:*` keys through a narrow prefix rule if they are included.
  - Make an explicit decision about whether `cr-league-language` is preserved or reset.
  - Document the reset boundary in code comments only where it prevents dangerous future edits.
- Out:
  - Server-side preference persistence.
  - A generic settings registry.
  - Migration tooling for old preference keys.
  - Changing profile/session storage format.

# Acceptance criteria
- AC1: The reset implementation has an explicit list of removable UI preference keys and prefixes.
- AC2: Durable keys for profile session, player claims, and active player claim are visibly excluded.
- AC3: Language behavior is intentional and covered by copy or tests.
- AC4: No implementation path calls `localStorage.clear()`.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: The reset implementation has an explicit list of removable UI preference keys and prefixes.
- request-AC5 -> This backlog slice. Proof: AC2: Durable keys for profile session, player claims, and active player claim are visibly excluded.
- request-AC6 -> This backlog slice. Proof: AC3: Language behavior is intentional and covered by copy or tests.
- request-AC7 -> This backlog slice. Proof: AC4: No implementation path calls `localStorage.clear()`.
- request-AC8 -> This backlog slice. Proof: AC4: No implementation path calls `localStorage.clear()`.
- request-AC10 -> This backlog slice. Proof: AC4: No implementation path calls `localStorage.clear()`.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_011_dismissible_help_panels_and_ui_preferences_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_040_add_dismissible_help_panels_and_ui_preference_reset`
- Primary task(s): `task_041_orchestrate_dismissible_help_panels_and_ui_preference_reset`

# AI Context
- Summary: Define the UI preference storage boundary
- Keywords: scaffolded-backlog, define the ui preference storage boundary, implementation-ready
- Use when: Implementing the scaffolded slice for Define the UI preference storage boundary.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
