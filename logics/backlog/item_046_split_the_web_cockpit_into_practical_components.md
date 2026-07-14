## item_046_split_the_web_cockpit_into_practical_components - Split the web cockpit into practical components
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Frontend maintainability
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- `apps/web/src/app/App.tsx` has grown into a large mixed surface that combines state orchestration, API actions, layout, result rendering, garage, dashboard, and replay.
- This makes visual redesign harder because every UI change risks touching the whole file.
- The code needs practical component boundaries, but not a speculative design system.

# Scope
- In:
  - Extract only the cockpit surfaces that are actively redesigned: race desk, championship panel, garage panel, result view, and visual replay.
  - Keep API state and top-level action handlers in the app root unless moving them clearly reduces duplication.
  - Reuse existing types and helper functions; do not introduce stores, contexts, factories, or one-off abstraction layers.
  - Keep tests focused on rendered behavior rather than component internals.
- Out:
  - Routing framework.
  - Global state library.
  - Design-system package.
  - Storybook or component explorer.
  - Large file/folder reorganization unrelated to the cockpit.

# Acceptance criteria
- AC1: The app root is smaller and delegates redesigned surfaces to clearly named components or local helpers.
- AC2: Component boundaries map to product surfaces, not generic UI abstractions.
- AC3: No new runtime dependency is added for the refactor.
- AC4: Existing unit and e2e tests continue to pass after extraction.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: The app root is smaller and delegates redesigned surfaces to clearly named components or local helpers.
- request-AC8 -> This backlog slice. Proof: AC2: Component boundaries map to product surfaces, not generic UI abstractions.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_003_race_cockpit_redesign_v0_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_032_redesign_the_cr_league_race_cockpit_v0`
- Primary task(s): `task_033_orchestrate_race_cockpit_redesign_v0`

# AI Context
- Summary: Split the web cockpit into practical components
- Keywords: scaffolded-backlog, split the web cockpit into practical components, implementation-ready
- Use when: Implementing the scaffolded slice for Split the web cockpit into practical components.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
