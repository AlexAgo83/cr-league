## req_092_admin_status_privacy_and_entry_bundle_hardening - Admin-status privacy and entry-bundle hardening
> From version: 0.3.27
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Privacy and frontend payload hardening
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Remove the public admin-status lookup so admin eligibility is only returned when a user proves profile ownership through the existing profile create/recover flows.
- Keep the admin console UX intact for users whose recovered profile session already includes admin: true, without adding a new auth system.
- Turn the Vite chunk-size warning into a bounded performance follow-up by measuring the entry bundle and deferring heavy circuit-route data until a game screen needs it.
- Leave the repo with runnable proof for API privacy, client session behavior, build output, and Logics validation.

# Context
- Current API surface: apps/api/src/features/leagues/routes.ts:92-95 exposes GET /profiles/:profileId/admin-status and returns { admin: true|false } from the profile's email plus ADMIN_EMAILS. The endpoint accepts no recoveryCode, claimCode, admin token, or session token.
- Current client surface: apps/web/src/app/sessionActions.ts:86-97 calls /profiles/:profileId/admin-status to refresh a stored profile session. If it fails, the client stores admin: false. The create/recover flows in apps/web/src/app/profileActions.ts already receive profile sessions from /profiles and /profiles/recover, and those API responses already pass through withAdminFlag in routes.ts.
- Current test contract: apps/api/src/app.admin.test.ts:266-278 asserts that admin-status is publicly readable by profile id. That test should be replaced with a privacy regression proving the endpoint is gone or requires profile proof, plus client tests proving recovered admin sessions keep admin access.
- Preferred implementation: delete the admin-status endpoint and delete refreshProfileAdminStatus. Do not add a replacement endpoint unless implementation proves the stored-session refresh is required. If refresh is required, use POST /profiles/admin-status with { profileId, recoveryCode } and reuse ensureProfileOwnership-style proof before returning the flag.
- Do not build a full server-side session/token system in this request. That is the right future direction only if broader auth requirements appear; this request is about closing the leak with the current claim/recovery-code model.
- Current performance signal: npm run build passes but reports the main entry chunk at 714.77 kB minified. Existing lazy imports are present in GameViews.tsx, DriveView.tsx, ResultView.tsx, and PlanView.tsx, so the next likely entry payload is eager circuit metadata/routes. apps/web/src/app/circuits.ts imports CIRCUIT_ROUTES from app/circuitRoutes/index.ts at module load.
- Performance follow-up should be measured and narrow: first inspect bundle output and imports, then lazy-load the full circuit route coordinates only for views that render maps/replays. Keep lightweight circuit identity data from @cr-league/shared eager if needed for labels and setup.
- Out of scope: full authentication/session redesign, new dependencies, broad UI redesign, rewriting circuit generation, changing gameplay/simulation behavior, or suppressing the Vite warning without reducing real entry payload.

# Acceptance criteria
- AC1: The app no longer exposes a public GET /profiles/:profileId/admin-status endpoint that returns admin eligibility from profile id alone.
- AC2: Admin eligibility still appears in profile sessions returned by /profiles and /profiles/recover after profile ownership is proven, and an admin recovered session can still open/use the admin console with the existing admin token flow.
- AC3: Client stored-session startup no longer makes an unauthenticated admin-status lookup, and deleting that refresh does not break normal profile recovery, league rejoin, sign-out, or admin console access.
- AC4: The build warning is either materially reduced by lazy-loading heavy circuit route data, or a measured follow-up note records why the remaining entry chunk is acceptable and what exact import still dominates it.
- AC5: npm run typecheck, npm run lint, npm test, npm run build, and npm run logics:validate pass.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_056_admin_privacy_and_entry_payload_hardening_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- apps/api/src/features/leagues/routes.ts
- apps/api/src/app.admin.test.ts
- apps/web/src/app/sessionActions.ts
- apps/web/src/app/profileActions.ts
- apps/web/src/app/appStorage.ts
- apps/web/src/app/circuits.ts
- apps/web/src/app/circuitRoutes/index.ts
- apps/web/src/app/GameViews.tsx
- apps/web/src/app/DriveView.tsx
- apps/web/src/features/ResultView.tsx
- package.json
- Review finding on 2026-07-22: GET /profiles/:profileId/admin-status returns admin eligibility with only a profile id. The client calls it from refreshProfileAdminStatus without a recovery code, and app.admin.test.ts currently asserts the public behavior. This leaks whether a profile email is listed in ADMIN_EMAILS when a profile id is known.
- Review finding on 2026-07-22: npm run build succeeds but Vite reports the main entry chunk at 714.77 kB minified. Existing lazy imports split several feature views, so the remaining likely payload is the eager circuit route/index path imported by circuits.ts.

# AI Context
- Summary: Admin-status privacy and entry-bundle hardening
- Keywords: request-chain-scaffold, admin-status privacy and entry-bundle hardening, development-ready
- Use when: You need to implement or review the scaffolded workflow for Admin-status privacy and entry-bundle hardening.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_208_remove_public_admin_eligibility_lookup`
- `item_209_measure_and_reduce_the_main_entry_bundle_warning`
