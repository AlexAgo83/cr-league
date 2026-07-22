## item_209_measure_and_reduce_the_main_entry_bundle_warning - Measure and reduce the main entry bundle warning
> From version: 0.3.27
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Frontend performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- npm run build succeeds but Vite reports the main entry chunk at 714.77 kB minified.
- Feature views are already lazy-loaded, so suppressing the warning would hide rather than solve the likely eager data/import issue.
- apps/web/src/app/circuits.ts eagerly imports app/circuitRoutes/index.ts, which likely pulls all route coordinate arrays into the first chunk.

# Scope
- In:
  - Capture the current build output and inspect which imports land in the main entry chunk.
  - If circuit route data dominates, split it out of the entry chunk; prefer true lazy loading only if it can be done without rewriting synchronous map/replay consumers.
  - Keep setup labels and season circuit selection working before route coordinates load.
  - Add one focused test or smoke assertion for the lazy route loading path if logic changes.
  - Record final build output and whether the main chunk warning is gone or materially reduced.
- Out:
  - Adding a bundle-analyzer dependency unless the existing Vite output is insufficient.
  - Raising chunkSizeWarningLimit as the only change.
  - Changing route geometry, simulation, or replay semantics.
  - Broad code-splitting unrelated screens.

# Acceptance criteria
- AC1: The implementation records before/after main chunk sizes from npm run build.
- AC2: Heavy circuit route data is split out of the entry chunk if it is confirmed as the main entry contributor.
- AC3: Map, replay, setup, and season circuit flows still render with the same circuit identities and coordinates.
- AC4: The remaining warning, if any, has a concrete measured explanation and next import target.

# Implementation proof
- Before: `rtk npm run build` produced `index-PaMWfZOo.js` at 714.48 kB minified and emitted Vite's >500 kB chunk warning.
- Measured contributor: apps/web/src/app/circuitRoutes is about 324 KB of source route coordinates imported through apps/web/src/app/circuits.ts.
- Implemented apps/web/vite.config.ts manualChunks for `vendor` and `circuit-routes`. This splits the heavy route coordinates out of the entry chunk without changing synchronous map/replay consumers.
- After: `rtk npm run build` produced `index-CIUd6Gmv.js` at 303.74 kB, `vendor-Dn20CUfX.js` at 192.36 kB, and `circuit-routes-Bh3wIAop.js` at 217.73 kB with no Vite chunk-size warning.
- Deferred true async route-coordinate loading because the current map/replay/catalogue flow consumes coordinates synchronously on first drive/championship render; manual chunking removed the warning and avoided a behavior rewrite.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: recorded before/after build sizes and removed the Vite warning by splitting vendor/circuit route chunks.
- request-AC5 -> This backlog slice. Proof: build, typecheck, lint, and tests passed after chunk split.
- request-AC1 -> This backlog slice. Evidence needed: The app no longer exposes a public GET /profiles/:profileId/admin-status endpoint that returns admin eligibility from profile id alone.
- request-AC2 -> This backlog slice. Evidence needed: Admin eligibility still appears in profile sessions returned by /profiles and /profiles/recover after profile ownership is proven, and an admin recovered session can still open/use the admin console with the existing admin token flow.
- request-AC3 -> This backlog slice. Evidence needed: Client stored-session startup no longer makes an unauthenticated admin-status lookup, and deleting that refresh does not break normal profile recovery, league rejoin, sign-out, or admin console access.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_056_admin_privacy_and_entry_payload_hardening_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_092_admin_status_privacy_and_entry_bundle_hardening`
- Primary task(s): `task_093_orchestrate_admin_privacy_and_entry_payload_hardening`

# AI Context
- Summary: Measure and reduce the main entry bundle warning
- Keywords: scaffolded-backlog, measure and reduce the main entry bundle warning, implementation-ready
- Use when: Implementing the scaffolded slice for Measure and reduce the main entry bundle warning.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_093_orchestrate_admin_privacy_and_entry_payload_hardening`

# Notes
- Task `task_093_orchestrate_admin_privacy_and_entry_payload_hardening` was finished via `logics-manager flow finish task` on 2026-07-22.
