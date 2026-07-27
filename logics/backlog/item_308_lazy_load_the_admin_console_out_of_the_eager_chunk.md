## item_308_lazy_load_the_admin_console_out_of_the_eager_chunk - Lazy-load the admin console out of the eager chunk
> From version: 0.5.0
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Progress: 100%
> Complexity: Low
> Theme: Frontend performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- AdminConsoleView is 265 lines and is statically imported at App.tsx line 5.
- The console is reachable only by admins, so the overwhelming majority of downloads are pure waste.
- The lazy pattern is already established elsewhere in the same file tree, so nothing new has to be invented.

# Scope
- In:
  - Record the current dist/assets/index-*.js raw and gzip sizes as a baseline.
  - Replace the static AdminConsoleView import with React.lazy, matching the existing GameViews.tsx pattern.
  - Keep the useAdminPanel hook import static, since hooks cannot be lazily imported.
  - Ensure the render site sits under a Suspense boundary with the existing fallback style.
  - Verify the admin console still opens through its normal entry point.
- Out:
  - Splitting any other view in the same pass.
  - Changing admin authentication, the admin token check, or any admin route.
  - Restructuring App.tsx beyond the import and render site.

# Acceptance criteria
- AC1: The build emits a separate chunk containing AdminConsoleView.
- AC2: The index chunk is smaller than the recorded baseline, and the delta is written down.
- AC3: Opening the admin console still works and never leaves a blank panel.
- AC4: Existing unit tests pass without weakening assertions.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: The build emits a separate chunk containing AdminConsoleView.
- request-AC2 -> This backlog slice. Proof: AC2: The index chunk is smaller than the recorded baseline, and the delta is written down.
- request-AC6 -> This backlog slice. Proof: AC3: Opening the admin console still works and never leaves a blank panel.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_076_review_follow_up_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_124_trim_the_eager_web_bundle_and_document_script_and_skip_boundaries`
- Primary task(s): `task_125_orchestrate_the_review_follow_up`

# AI Context
- Summary: Lazy-load the admin console out of the eager chunk
- Keywords: scaffolded-backlog, lazy-load the admin console out of the eager chunk, implementation-ready
- Use when: Implementing the scaffolded slice for Lazy-load the admin console out of the eager chunk.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Validation
- 2026-07-27 validation: baseline build index-BKtGgQsY.js was 243.86 kB raw / 70.92 kB gzip. After React.lazy, build emits AdminConsoleView-BVLfYFkL.js at 6.19 kB raw / 1.56 kB gzip and index-VhC2J-Xv.js at 237.97 kB raw / 69.91 kB gzip, a -5.89 kB raw / -1.01 kB gzip index delta. npm run typecheck OK; npm run lint OK; npm test -- apps/web/src/app/App.profile.test.tsx OK; npm test OK with 352 passing / 7 skipped; npm run build OK.

# Notes
- Task `task_125_orchestrate_the_review_follow_up` was finished via `logics-manager flow finish task` on 2026-07-27.
