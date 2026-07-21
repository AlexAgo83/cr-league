## item_168_lazy_load_secondary_web_views - Lazy-load secondary web views
> From version: 0.3.26
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Frontend performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The current Vite build places the application into one main JavaScript chunk around 714 kB uncompressed.
- Replay, reports, garage, and championship screens are not needed before a user chooses those surfaces.
- Loading every major view upfront increases parse and execution cost on mobile.

# Scope
- In:
  - Record the current Vite build chunk sizes as a baseline.
  - Introduce React.lazy and Suspense around secondary views from the existing App.tsx view switch.
  - Keep shared primitives, shell state, and frequently used controls eagerly loaded.
  - Use the existing panel/loading visual language for the fallback.
  - Verify navigation into each split view from normal UI flows, including report and replay entry points.
- Out:
  - Adding a new router or bundle analysis dependency.
  - Splitting tiny helper modules with no measurable impact.
  - Changing visible workflow copy or game behavior.

# Acceptance criteria
- AC1: Dynamic imports are present for the selected secondary views.
- AC2: The initial JS chunk is smaller than the recorded baseline.
- AC3: Lazy loading never leaves the app shell blank or inaccessible.
- AC4: Existing tests and e2e pass without weakening assertions.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Dynamic imports are present for the selected secondary views.
- request-AC2 -> This backlog slice. Proof: AC2: The initial JS chunk is smaller than the recorded baseline.
- request-AC3 -> This backlog slice. Proof: AC3: Lazy loading never leaves the app shell blank or inaccessible.
- request-AC4 -> This backlog slice. Proof: AC4: Existing tests and e2e pass without weakening assertions.
- request-AC5 -> This backlog slice. Proof: AC4: Existing tests and e2e pass without weakening assertions.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_034_web_view_code_splitting_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_070_split_large_web_views_from_the_initial_bundle`
- Primary task(s): `task_071_orchestrate_web_view_code_splitting`

# AI Context
- Summary: Lazy-load secondary web views
- Keywords: scaffolded-backlog, lazy-load secondary web views, implementation-ready
- Use when: Implementing the scaffolded slice for Lazy-load secondary web views.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
