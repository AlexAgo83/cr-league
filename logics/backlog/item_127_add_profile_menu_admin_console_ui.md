## item_127_add_profile_menu_admin_console_ui - Add profile-menu admin console UI
> From version: 0.3.8
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Admin operations
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Even after API support exists, operators need a discoverable screen inside the app to use it.
- Admin access must not leak a real token into the client bundle.
- Users and leagues need separate, scannable sub-screens because their actions and risks differ.

# Scope
- In:
  - Add an Admin action to the existing profile menu.
  - Open an admin screen that asks for the admin token and stores it in `sessionStorage` for the tab session only.
  - Build a compact admin view with Users and Leagues sub-screens using existing panel, tab, button, modal, and profile-menu styling patterns.
  - Fetch admin data with `Authorization: Bearer <session token>` and handle 403/missing-token states clearly.
  - Render Users with profile id/email/created date/team count/league count, plus reset recovery and delete actions.
  - Show a reset recovery result in a modal or inline confirmation that makes clear the code is only shown once.
  - Render Leagues with id/code/name/status/current GP/player count/created date and an Enter/Inspect control.
  - When entering a league from admin mode, load the selected league read-only/admin context and visibly indicate admin inspection mode.
  - Add EN/FR i18n keys for all new labels, confirmations, empty states, and errors.
  - Add focused React tests for profile-menu admin entry, token form, user list, reset-code result, delete confirmation, league list, and enter/inspect behavior.
- Out:
  - Persisting admin token in localStorage.
  - Embedding an admin token in `import.meta.env` or other build-time public config.
  - Adding admin actions to resolve races, start next GP, reset leagues, or delete leagues.
  - Replacing the existing player profile/session flow.
  - Adding charts or analytics dashboards.

# Acceptance criteria
- AC1: The profile menu includes an Admin action that opens the admin token/auth screen.
- AC2: Submitting a token fetches admin data with an `Authorization: Bearer` header and keeps the token only in `sessionStorage`.
- AC3: The Users tab lists profiles and shows reset/delete actions without exposing recovery hashes.
- AC4: Reset recovery displays the newly generated code once and warns the operator to copy it before closing.
- AC5: Delete profile requires explicit confirmation and refreshes the Users list after success.
- AC6: The Leagues tab lists league summaries and lets the operator enter/inspect a selected league.
- AC7: Admin inspection mode is visibly distinct from a normal player claim session.
- AC8: All new visible text is localized in EN and FR.
- AC9: `npm run typecheck` and `npm test -- apps/web/src/app/App.test.tsx` pass.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: The profile menu includes an Admin action that opens the admin token/auth screen.
- request-AC3 -> This backlog slice. Proof: AC2: Submitting a token fetches admin data with an `Authorization: Bearer` header and keeps the token only in `sessionStorage`.
- request-AC4 -> This backlog slice. Proof: AC3: The Users tab lists profiles and shows reset/delete actions without exposing recovery hashes.
- request-AC5 -> This backlog slice. Proof: AC4: Reset recovery displays the newly generated code once and warns the operator to copy it before closing.
- request-AC6 -> This backlog slice. Proof: AC5: Delete profile requires explicit confirmation and refreshes the Users list after success.
- request-AC7 -> This backlog slice. Proof: AC6: The Leagues tab lists league summaries and lets the operator enter/inspect a selected league.
- request-AC8 -> This backlog slice. Proof: AC7: Admin inspection mode is visibly distinct from a normal player claim session.
- request-AC9 -> This backlog slice. Proof: AC8: All new visible text is localized in EN and FR.
- request-AC10 -> This backlog slice. Proof: AC9: `npm run typecheck` and `npm test -- apps/web/src/app/App.test.tsx` pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_021_admin_operations_console_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_050_add_a_secured_admin_operations_console`
- Primary task(s): `task_051_orchestrate_secured_admin_operations_console`

# AI Context
- Summary: Add profile-menu admin console UI
- Keywords: scaffolded-backlog, add profile-menu admin console ui, implementation-ready
- Use when: Implementing the scaffolded slice for Add profile-menu admin console UI.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
