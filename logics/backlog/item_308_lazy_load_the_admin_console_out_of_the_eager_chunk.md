## item_308_lazy_load_the_admin_console_out_of_the_eager_chunk - Lazy-load the admin console out of the eager chunk
> From version: 0.5.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
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
