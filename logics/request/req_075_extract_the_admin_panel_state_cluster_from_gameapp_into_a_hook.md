## req_075_extract_the_admin_panel_state_cluster_from_gameapp_into_a_hook - Extract the admin-panel state cluster from GameApp into a hook
> From version: 0.3.26
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Frontend maintainability
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Move the admin-panel state cluster and its wiring out of GameApp into a dedicated useAdminPanel() custom hook.
- Keep the admin console behaving identically: token entry, tab switching, user/league search and pagination, recovery-code reset, user delete, league inspect, and test-data cleanup.
- Shrink GameApp so the first God-component slice is removed and the extraction pattern is reusable for later slices (replay controls, onboarding/help state).
- Change no API contract, no visible UI, no i18n copy, and add no new dependency.

# Context
- apps/web is a Vite React workspace with an intentionally small dependency set (React, React DOM, local shared package); no state-management or routing library is used.
- GameApp holds all app state as local useState/useMemo; admin state is one cohesive cluster that only talks to /admin/* endpoints via createAdminActions.
- createAdminActions in adminActions.ts already receives the admin setters and returns the admin action handlers; AdminConsoleView renders from the admin state and those handlers.
- Vitest component tests exercise the admin console through App.test.tsx and App.profile.test.tsx; a Playwright admin flow also exists.

# Acceptance criteria
- AC1: A useAdminPanel() hook in apps/web/src/app owns the admin state cluster (token, tab, users, leagues, both queries, both paginations, recoveryCode, deleteUser, inspecting) and returns that state plus the handlers from createAdminActions.
- AC2: GameApp consumes useAdminPanel() and no longer declares any admin-only useState inline; the createAdminActions call moves into the hook.
- AC3: The admin console behaves identically — token gating, tab switching, search, pagination, recovery-code reset, user delete, league inspect, and test-data cleanup all work as before, with no UI or copy change.
- AC4: No API contract, request shape, or endpoint changes; the network calls issued are byte-for-byte the same.
- AC5: Typecheck, lint, unit tests, and the admin/private-league e2e flow pass without weakening any assertion.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_039_gameapp_decomposition_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- apps/web/src/app/App.tsx
- apps/web/src/app/adminActions.ts
- apps/web/src/features/AdminConsoleView.tsx
- apps/web/src/app/App.test.tsx
- apps/web/src/app/App.profile.test.tsx
- Current diagnostic: GameApp in apps/web/src/app/App.tsx is a single ~670-line component with 57 hook calls; App.tsx is 752 lines total.
- Current diagnostic: about 11 useState declarations are admin-only (adminToken, adminTab, adminUsers, adminLeagues, adminUserQuery, adminLeagueQuery, adminUserPagination, adminLeaguePagination, adminRecoveryCode, adminDeleteUser, adminInspecting) and are wired into createAdminActions({...}) at App.tsx:233 and consumed by AdminConsoleView.
- Current diagnostic: admin API calls are already factored into apps/web/src/app/adminActions.ts (createAdminActions) and the UI into apps/web/src/features/AdminConsoleView.tsx; only the state cluster and its wiring still live inline in GameApp.

# AI Context
- Summary: Extract the admin-panel state cluster from GameApp into a hook
- Keywords: request-chain-scaffold, extract the admin-panel state cluster from gameapp into a hook, development-ready
- Use when: You need to implement or review the scaffolded workflow for Extract the admin-panel state cluster from GameApp into a hook.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_173_extract_useadminpanel_from_gameapp`
