## item_108_replace_stale_notification_stacking_with_command_lifecycle_feedback - Replace stale notification stacking with command lifecycle feedback
> From version: 0.3.6
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 80%
> Complexity: Medium
> Theme: Feedback and trust
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Playtest showed stale pending notifications remaining visible after later success messages, for example `Creating profile...` under `Profile created...`.
- The notification stack overlays race step copy, replay timeline, modal backdrops, and garage cards, creating the strongest impression of UI bug even when commands succeed.
- The current implementation treats pending and success feedback as independent toasts, so every command can add noise instead of updating one lifecycle.

# Scope
- In:
  - Refactor the existing `notifications` model in `apps/web/src/app/App.tsx` to support lifecycle entries such as pending, success, and error without adding a dependency.
  - Update the shared `run` wrapper so pending feedback is created or replaced for a command and then converted to success/error or dismissed.
  - Keep errors persistent and dismissible; auto-dismiss success messages after a short timeout; avoid toasting `status_initial`.
  - Cap visible notification count to the smallest useful number and prefer one active command notification over a stack of historical loading messages.
  - Move or adapt `.notification-stack` in `apps/web/src/styles/layout.css` so it does not cover primary controls, replay timeline, mobile bottom guidance, modal buttons, or garage card rows.
  - Preserve `aria-live` behavior with calmer announcements for status updates and assertive behavior only for errors if practical.
  - Update unit/e2e tests that currently expect old notification behavior.
- Out:
  - Adding a third-party toast library.
  - Persisting notifications across reloads.
  - Building a notification center or history drawer.
  - Changing backend command responses only for notification needs.

# Acceptance criteria
- AC1: A pending command notification is replaced or removed when the command succeeds, so stale loading messages cannot remain below success messages.
- AC2: Errors remain visible until dismissal and include the existing user-safe error behavior.
- AC3: Desktop and mobile screenshots show notifications not covering Race primary commands, replay timeline, modal actions, or garage cards.
- AC4: Automated tests cover at least one success lifecycle and one error lifecycle.
- AC5: Existing notification copy remains localized in English and French.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: A pending command notification is replaced or removed when the command succeeds, so stale loading messages cannot remain below success messages.
- request-AC2 -> This backlog slice. Proof: AC2: Errors remain visible until dismissal and include the existing user-safe error behavior.
- request-AC7 -> This backlog slice. Proof: AC3: Desktop and mobile screenshots show notifications not covering Race primary commands, replay timeline, modal actions, or garage cards.
- request-AC8 -> This backlog slice. Proof: AC4: Automated tests cover at least one success lifecycle and one error lifecycle.
- request-AC9 -> This backlog slice. Proof: AC5: Existing notification copy remains localized in English and French.
- request-AC10 -> This backlog slice. Proof: AC5: Existing notification copy remains localized in English and French.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_018_first_session_ux_polish_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_047_polish_first_session_ux_after_playtest_findings`
- Primary task(s): `task_048_orchestrate_first_session_ux_polish_from_playtest_findings`

# AI Context
- Summary: Replace stale notification stacking with command lifecycle feedback
- Keywords: scaffolded-backlog, replace stale notification stacking with command lifecycle feedback, implementation-ready
- Use when: Implementing the scaffolded slice for Replace stale notification stacking with command lifecycle feedback.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
