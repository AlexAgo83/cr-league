## task_076_orchestrate_gameapp_admin_panel_hook_extraction - Orchestrate GameApp admin-panel hook extraction
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Map every admin-only useState in App.tsx and each place GameApp reads or sets it (including the createAdminActions call at App.tsx:233 and the AdminConsoleView props).
- [x] 2. Create useAdminPanel() in apps/web/src/app holding those states and the createAdminActions wiring, returning state plus handlers.
- [x] 3. Replace the inline admin state and actions in GameApp with a single useAdminPanel() call, keeping AdminConsoleView props identical.
- [x] 4. Run typecheck, lint, and vitest; confirm admin console tests still pass unchanged.
- [x] 5. Run the admin/private-league Playwright flow and record validation evidence in closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; user requested regular commits for delivered subjects.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_173_extract_useadminpanel_from_gameapp`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> `apps/web/src/app/useAdminPanel.ts` owns token, tab, users, leagues, queries, pagination, recovery code, delete user, and inspecting state.
- request-AC2 -> `GameApp` consumes `useAdminPanel()` and no longer declares admin-only `useState` inline; `createAdminActions` moved into the hook.
- request-AC3 -> `AdminConsoleView` props and callbacks remain wired with the same names and handlers.
- request-AC4 -> No API contract or endpoint code changed; `adminActions.ts` request construction is reused unchanged.
- request-AC5 -> Proof: typecheck, lint, targeted admin unit tests, full unit tests, build, and private-league Playwright flow pass.

# Validation
- `npm run typecheck` passed.
- `npx vitest run apps/web/src/app/App.profile.test.tsx` passed: 20 tests.
- `npm run lint` passed.
- `npm run test` passed: 24 passed, 1 skipped; 216 passed, 4 skipped.
- `npm run build` passed; the existing Vite >500 kB chunk warning remains from the main bundle.
- `npm run test:e2e` passed: 4 Playwright tests.
- `npm run logics:validate` passed before and after closeout; warnings are deferred/open-doc warnings only.
- Finish workflow executed on 2026-07-21.
- Linked backlog/request close verification passed.
- Finish workflow executed on 2026-07-21.
- Linked backlog/request close verification passed.

# Report
- `useAdminPanel()` now contains the admin state cluster and `createAdminActions` wiring.
- `GameApp` keeps passing the same admin props to `AdminConsoleView` but no longer owns those admin-only `useState` calls.
- No admin API, UI, copy, or endpoint behavior changed.
- Finished on 2026-07-21.
- Linked backlog item(s): `item_173_extract_useadminpanel_from_gameapp`
- Related request(s): `req_075_extract_the_admin_panel_state_cluster_from_gameapp_into_a_hook`
- Finished on 2026-07-21.
- Linked backlog item(s): `item_173_extract_useadminpanel_from_gameapp`
- Related request(s): `req_075_extract_the_admin_panel_state_cluster_from_gameapp_into_a_hook`

# AI Context
- Summary: Orchestrate GameApp admin-panel hook extraction
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_075_extract_the_admin_panel_state_cluster_from_gameapp_into_a_hook`
- Product brief(s): `prod_039_gameapp_decomposition_product_brief`
- Architecture decision(s): (none yet)
