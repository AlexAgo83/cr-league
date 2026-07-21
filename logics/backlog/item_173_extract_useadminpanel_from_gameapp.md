## item_173_extract_useadminpanel_from_gameapp - Extract useAdminPanel() from GameApp
> From version: 0.3.26
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Frontend maintainability
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- GameApp mixes 57 hooks in one function, making the admin logic hard to locate and reason about.
- The admin state cluster is self-contained but still declared inline alongside unrelated app state.
- There is no established pattern yet for peeling cohesive slices out of GameApp.

# Scope
- In:
  - Create useAdminPanel() in apps/web/src/app that declares the 11 admin useState hooks.
  - Move the createAdminActions({...}) call into the hook and return its handlers together with the admin state.
  - Update GameApp to consume the hook and pass state/handlers to AdminConsoleView unchanged.
  - Keep existing admin tests passing; add or adjust only what the extraction strictly requires.
- Out:
  - Extracting replay, onboarding/help, or profile state.
  - Refactoring adminActions.ts or AdminConsoleView internals.
  - Any change to /admin/* endpoints, request shapes, or admin copy.

# Acceptance criteria
- AC1: GameApp declares no admin-only useState inline after the change.
- AC2: useAdminPanel() returns the admin state and handlers and is the single source for the admin console props.
- AC3: Admin console behavior and network calls are unchanged.
- AC4: Typecheck, lint, unit tests, and admin e2e pass without weakened assertions.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: GameApp declares no admin-only useState inline after the change.
- request-AC2 -> This backlog slice. Proof: AC2: useAdminPanel() returns the admin state and handlers and is the single source for the admin console props.
- request-AC3 -> This backlog slice. Proof: AC3: Admin console behavior and network calls are unchanged.
- request-AC4 -> This backlog slice. Proof: AC4: Typecheck, lint, unit tests, and admin e2e pass without weakened assertions.
- request-AC5 -> This backlog slice. Proof: AC4: Typecheck, lint, unit tests, and admin e2e pass without weakened assertions.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_039_gameapp_decomposition_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_075_extract_the_admin_panel_state_cluster_from_gameapp_into_a_hook`
- Primary task(s): `task_076_orchestrate_gameapp_admin_panel_hook_extraction`

# AI Context
- Summary: Extract useAdminPanel() from GameApp
- Keywords: scaffolded-backlog, extract useadminpanel() from gameapp, implementation-ready
- Use when: Implementing the scaffolded slice for Extract useAdminPanel() from GameApp.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
