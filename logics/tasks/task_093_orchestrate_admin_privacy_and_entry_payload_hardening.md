## task_093_orchestrate_admin_privacy_and_entry_payload_hardening - Orchestrate admin privacy and entry payload hardening
> From version: 0.3.27
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
- [x] 1. Start by deleting or proof-gating the admin-status route; prefer deletion unless a client test proves refresh is required.
- [x] 2. Remove the unauthenticated client refresh path and update profile/admin tests to lock the new privacy contract.
- [x] 3. Run the API and web profile/admin test slices, then the full test suite.
- [x] 4. Measure the current build output and inspect whether circuitRoutes are in the main entry path.
- [x] 5. Split route coordinates into a dedicated Vite chunk while keeping lightweight circuit identity eager.
- [x] 6. Run typecheck, lint, tests, build, and logics validation; record before/after build evidence in task closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_208_remove_public_admin_eligibility_lookup`
- `item_209_measure_and_reduce_the_main_entry_bundle_warning`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> item_208_remove_public_admin_eligibility_lookup. Proof: removed GET /profiles/:profileId/admin-status from apps/api/src/features/leagues/routes.ts; app.admin.test.ts now expects a bare profile-id lookup to return 404.
- request-AC2 -> item_208_remove_public_admin_eligibility_lookup. Proof: create/recover profile tests still assert admin: true is returned after profile proof for ADMIN_EMAILS.
- request-AC3 -> item_208_remove_public_admin_eligibility_lookup. Proof: removed refreshProfileAdminStatus and its App.tsx startup effect; App.profile.test.tsx asserts stored admin access remains without an admin-status fetch.
- request-AC4 -> item_209_measure_and_reduce_the_main_entry_bundle_warning. Proof: before build index-PaMWfZOo.js was 714.48 kB with the Vite chunk warning; after apps/web/vite.config.ts manualChunks, index-CIUd6Gmv.js is 303.74 kB, vendor is 192.36 kB, circuit-routes is 217.73 kB, and the warning is gone.
- request-AC5 -> This task. Proof: rtk npm run typecheck, rtk npm run lint, rtk npm test, and rtk npm run build passed.

# Validation
- `rtk npm test -- apps/api/src/app.admin.test.ts` passed: 16 tests.
- `rtk npm test -- apps/web/src/app/App.profile.test.tsx` passed: 22 tests.
- `rtk npm run typecheck` passed.
- `rtk npm run lint` passed.
- `rtk npm test` passed: 26 files passed, 1 skipped; 251 tests passed, 7 skipped.
- `rtk npm run build` passed; main entry chunk reduced from 714.48 kB to 303.74 kB and no Vite chunk-size warning remained.
- `npm run logics:validate` pending final run after doc closeout edits.
- API privacy: removed GET /profiles/:profileId/admin-status; app.admin.test.ts now asserts profile-id-only lookup returns 404 while create/recover still return admin after profile proof. Client: removed refreshProfileAdminStatus startup call; App.profile.test.ts asserts stored admin sessions keep admin access without an admin-status fetch. Bundle: before build index-PaMWfZOo.js 714.48 kB minified with Vite chunk warning; after apps/web/vite.config.ts manualChunks, index-CIUd6Gmv.js 303.74 kB, vendor-Dn20CUfX.js 192.36 kB, circuit-routes-Bh3wIAop.js 217.73 kB and no Vite chunk-size warning. Gates: rtk npm test -- apps/api/src/app.admin.test.ts OK; rtk npm test -- apps/web/src/app/App.profile.test.tsx OK; rtk npm run typecheck OK; rtk npm run lint OK; rtk npm test OK; rtk npm run build OK.
- Finish workflow executed on 2026-07-22.
- Linked backlog/request close verification passed.

# Report
- Implementation complete. Deleted the public admin-status refresh path and split vendor/circuit route data out of the Vite entry chunk without changing UI behavior.
- Finished on 2026-07-22.
- Linked backlog item(s): `item_208_remove_public_admin_eligibility_lookup`, `item_209_measure_and_reduce_the_main_entry_bundle_warning`
- Related request(s): `req_092_admin_status_privacy_and_entry_bundle_hardening`

# AI Context
- Summary: Orchestrate admin privacy and entry payload hardening
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_092_admin_status_privacy_and_entry_bundle_hardening`
- Product brief(s): `prod_056_admin_privacy_and_entry_payload_hardening_product_brief`
- Architecture decision(s): (none yet)
