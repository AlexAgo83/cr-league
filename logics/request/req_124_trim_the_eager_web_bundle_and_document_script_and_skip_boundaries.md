## req_124_trim_the_eager_web_bundle_and_document_script_and_skip_boundaries - Trim the eager web bundle and document script and skip boundaries
> From version: 0.5.0
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Low
> Theme: Frontend performance and contributor documentation
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Remove admin-only code from the bundle that every ordinary player downloads.
- Decide the landing-screen split on measured cold-start evidence rather than assumption.
- Let a new contributor tell release-gating scripts apart from diagnostic tooling without reading every script body.
- Record the two deliberate non-changes with named re-entry triggers so a future agent does not re-litigate or silently reverse them.

# Context
- This corpus follows a repository review that found all quality gates green: typecheck, lint, 344 passing tests, 89.4 percent line coverage, zero npm audit vulnerabilities, and a clean build.
- The circuit-route polylines were already moved off the first-paint path via a single dynamic import, so the remaining eager weight is application code, not data.
- The project deliberately avoids a router library, so any further splitting must fit the existing state-driven view switch.
- Two review findings were deliberately closed as skips rather than work: refactoring App.tsx further, and converting the generated speed-profile data to JSON.

# Acceptance criteria
- AC1: AdminConsoleView is loaded through a dynamic import and no longer appears in the eager index chunk.
- AC2: Non-admin users reach every existing screen with no visible regression, and admins still reach the console through the same entry point.
- AC3: A cold-start funnel measurement is recorded as evidence, and the GameApp split is either implemented with a prefetch on splash mount or declined in writing with the measured numbers that justify declining.
- AC4: CONTRIBUTING.md states which npm scripts gate a merge and which are diagnostic tooling, covering every script currently declared in package.json.
- AC5: The App.tsx and speed-profile skips are recorded with the specific observable condition that would reopen each one.
- AC6: Typecheck, lint, unit tests, and build pass, and the recorded index chunk size is smaller than the 433.86 kB raw baseline.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_076_review_follow_up_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- CONTRIBUTING.md
- package.json
- apps/web/vite.config.ts
- apps/web/src/app/App.tsx
- apps/web/src/app/HomeSplash.tsx
- apps/web/src/app/GameViews.tsx
- apps/web/src/app/DriveView.tsx
- apps/web/src/app/useAdminPanel.ts
- apps/web/src/features/AdminConsoleView.tsx
- apps/web/src/app/circuitRoutes/index.ts
- packages/shared/src/domain/circuits.ts
- packages/shared/src/domain/circuitSpeedProfiles.data.ts
- scripts/generate-circuit-speed-profiles.mjs
- docs/release-contract.md
- Current diagnostic: the production build emits dist/assets/index-*.js at 433.86 kB raw / 120.17 kB gzip, the largest JS chunk shipped after circuit-routes was already split out lazily.
- Current diagnostic: apps/web/src/features/AdminConsoleView.tsx is 265 lines and is statically imported at apps/web/src/app/App.tsx line 5, so every non-admin visitor downloads it.
- Current diagnostic: App() renders the 28-line HomeSplash first but statically imports GameApp, so the landing screen pulls the whole game import graph before the user enters.
- Current diagnostic: React.lazy is already the established pattern in this codebase at GameViews.tsx lines 16 to 18 and DriveView.tsx line 17.
- Current diagnostic: package.json declares 37 npm scripts, of which roughly 20 are diagnostic playtest, balance, generation, and audit tooling that never gates a merge.
- Current diagnostic: npm run playtest:ux:cold-start already produces a cold-start funnel report used to judge first-paint cost.
- Current diagnostic: App.tsx is 779 lines with 42 hook call sites but is already decomposed into 12 custom hooks and 3 action factories, so the remaining body is wiring.
- Current diagnostic: circuits.ts line 144 already casts CIRCUIT_SPEED_PROFILES to Record<string, TrackSpeedProfile>, so a JSON conversion would trade a satisfies check for a d.ts nobody reads.

# AI Context
- Summary: Trim the eager web bundle and document script and skip boundaries
- Keywords: request-chain-scaffold, trim the eager web bundle and document script and skip boundaries, development-ready
- Use when: You need to implement or review the scaffolded workflow for Trim the eager web bundle and document script and skip boundaries.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_308_lazy_load_the_admin_console_out_of_the_eager_chunk`
- `item_309_measure_cold_start_and_decide_the_gameapp_split_on_the_numbers`
- `item_310_document_the_release_gate_and_diagnostic_script_split`
- `item_311_record_the_app_tsx_and_speed_profile_skips_with_reopen_triggers`
