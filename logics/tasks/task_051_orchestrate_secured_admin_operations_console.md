## task_051_orchestrate_secured_admin_operations_console - Orchestrate secured admin operations console
> From version: 0.3.8
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85
> Progress: 100
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the secured admin operations implementation and keep sibling implementation slices linked.

# Plan
- [x] 1. Read `apps/api/src/config.ts`, `apps/api/src/app.ts`, league routes/store, Prisma schema, profile-menu code in `App.tsx`, i18n catalogs, and existing API/web tests.
- [x] 2. Implement the admin API slice first: config token, admin route registration, auth guard, profile list/reset/delete, league list, and read-only league inspection.
- [x] 3. Verify the recovery-code reset model: do not expose `recoveryCodeHash`, and prove the new code works through existing recovery flow.
- [x] 4. Implement the web admin slice: profile-menu entry, token capture, Users and Leagues tabs, reset/delete confirmations, and admin league inspection state.
- [x] 5. Localize all new copy in EN and FR.
- [x] 6. Run focused API tests, focused App tests, `npm run lint`, `npm run typecheck`, and `npm test`; record closeout evidence.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_126_add_secured_admin_api_operations`
- `item_127_add_profile_menu_admin_console_ui`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `apps/api/src/config.ts` reads `ADMIN_TOKEN`; `/admin/*` returns 503 without server token and 403 with missing/wrong bearer token, covered by `apps/api/src/app.test.ts`.
- request-AC2 -> This task. Proof: admin API and web calls use `Authorization: Bearer <token>`; the web token is typed into the admin screen and is not read from Vite env.
- request-AC3 -> This task. Proof: `apps/web/src/app/App.tsx` adds a profile-menu Admin action that opens the admin console without clearing the active league unless the operator enters inspection mode.
- request-AC4 -> This task. Proof: `GET /admin/users` returns id/email/createdAt/teamCount/leagueCount and tests assert `recoveryCodeHash` is absent.
- request-AC5 -> This task. Proof: `POST /admin/users/:profileId/recovery-code` resets the hash, returns the new code once, and focused API tests prove normal recovery accepts the new code while rejecting the old one.
- request-AC6 -> This task. Proof: `DELETE /admin/users/:profileId` is confirmation-gated in the UI and API tests prove linked teams remain with `profileId: null`.
- request-AC7 -> This task. Proof: `GET /admin/leagues` returns id/code/name/status/current season-round/player count/team count/createdAt and the React Leagues tab renders an Inspect control.
- request-AC8 -> This task. Proof: `GET /admin/leagues/:leagueId` loads league state without `player`; the UI shows admin inspection mode and existing player mutations lack a claim.
- request-AC9 -> This task. Proof: all new admin copy is present in `apps/web/src/i18n/en.json` and `apps/web/src/i18n/fr.json`; `logics-manager i18n status` passed.
- request-AC10 -> This task. Proof: focused API and React tests, full `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` passed.

# Validation
- `npm test -- apps/api/src/app.test.ts` passed.
- `npm test -- apps/web/src/app/App.test.tsx` passed.
- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm test` passed.
- `npm run build` passed.
- `logics-manager i18n status` passed.
- Focused API test passed: npm test -- apps/api/src/app.test.ts. Focused React test passed: npm test -- apps/web/src/app/App.test.tsx. Lint passed: npm run lint. Typecheck passed: npm run typecheck. Full test suite passed: npm test. Build passed: npm run build. i18n valid: logics-manager i18n status. diff check passed: git diff --check.
- Finish workflow executed on 2026-07-19.
- Linked backlog/request close verification passed.

# Report
- Admin API and UI implementation complete.
- Finished on 2026-07-19.
- Linked backlog item(s): `item_126_add_secured_admin_api_operations`, `item_127_add_profile_menu_admin_console_ui`
- Related request(s): `req_050_add_a_secured_admin_operations_console`

# AI Context
- Summary: Orchestrate secured admin operations console
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_050_add_a_secured_admin_operations_console`
- Product brief(s): `prod_021_admin_operations_console_product_brief`
- Architecture decision(s): (none yet)
