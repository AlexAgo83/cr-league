## item_209_measure_and_reduce_the_main_entry_bundle_warning - Measure and reduce the main entry bundle warning
> From version: 0.3.27
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
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
  - If circuit route data dominates, split lightweight circuit identity from heavy route coordinates and lazy-load coordinates only for map/replay consumers.
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
- AC2: Heavy circuit route data is lazy-loaded if it is confirmed as the main entry contributor.
- AC3: Map, replay, setup, and season circuit flows still render with the same circuit identities and coordinates.
- AC4: The remaining warning, if any, has a concrete measured explanation and next import target.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: The implementation records before/after main chunk sizes from npm run build.
- request-AC5 -> This backlog slice. Proof: AC2: Heavy circuit route data is lazy-loaded if it is confirmed as the main entry contributor.

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
