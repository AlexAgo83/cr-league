## item_038_implement_visual_replay_panel_in_the_web_app - Implement visual replay panel in the web app
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Frontend implementation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Resolved GP screens still rely mostly on text panels.
- The visual replay needs to fit into the existing race recap/report flow without creating a separate page or UI framework.

# Scope
- In:
  - Add a visual replay panel to the resolved GP area.
  - Render player and field/rival markers from classification data.
  - Render key event callouts from major and player-related events.
  - Keep the existing text timeline and report below or alongside the visual panel.
  - Add EN/FR copy for new labels.
  - Validate with unit/e2e coverage and visual screenshots.
- Out:
  - Autoplay controls beyond a static or very lightweight CSS presentation.
  - Canvas game loop.
  - New replay API endpoints.
  - New npm dependencies.

# Acceptance criteria
- AC1: A resolved GP displays the visual replay panel with player marker, field marker, winner/result context, and at least one event callout when events exist.
- AC2: If there are no events, the panel degrades to a clear empty state instead of breaking layout.
- AC3: The panel remains legible at mobile width and desktop width.
- AC4: Unit or e2e tests assert the visual replay renders in the 3-GP flow.
- AC5: `npm run typecheck`, `npm test`, `npm run lint`, `npm run build`, `npm run test:e2e`, `logics-manager i18n validate`, and `npm run logics:validate` pass.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: A resolved GP displays the visual replay panel with player marker, field marker, winner/result context, and at least one event callout when events exist.
- request-AC2 -> This backlog slice. Proof: AC2: If there are no events, the panel degrades to a clear empty state instead of breaking layout.
- request-AC3 -> This backlog slice. Proof: AC3: The panel remains legible at mobile width and desktop width.
- request-AC4 -> This backlog slice. Proof: AC4: Unit or e2e tests assert the visual replay renders in the 3-GP flow.
- request-AC5 -> This backlog slice. Proof: AC5: `npm run typecheck`, `npm test`, `npm run lint`, `npm run build`, `npm run test:e2e`, `logics-manager i18n validate`, and `npm run logics:validate` pass.
- request-AC6 -> This backlog slice. Proof: AC5: `npm run typecheck`, `npm test`, `npm run lint`, `npm run build`, `npm run test:e2e`, `logics-manager i18n validate`, and `npm run logics:validate` pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_002_visual_replay_v0_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_031_add_first_visual_race_replay_from_event_timeline`
- Primary task(s): `task_032_orchestrate_visual_replay_v0`

# AI Context
- Summary: Implement visual replay panel in the web app
- Keywords: scaffolded-backlog, implement visual replay panel in the web app, implementation-ready
- Use when: Implementing the scaffolded slice for Implement visual replay panel in the web app.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_032_orchestrate_visual_replay_v0`

# Notes
- Task `task_032_orchestrate_visual_replay_v0` was finished via `logics-manager flow finish task` on 2026-07-14.
