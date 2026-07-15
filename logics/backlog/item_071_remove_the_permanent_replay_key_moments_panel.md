## item_071_remove_the_permanent_replay_key_moments_panel - Remove the permanent replay key moments panel
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Replay layout simplification
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The current permanent Key moments panel competes with the replay map and makes the replay feel like a dashboard.
- The side panel consumes width that should belong to the race stage.
- The same information is better handled transiently during replay and durably in the Report tab.

# Scope
- In:
  - Remove `.replay-moments-panel` from the Replay tab layout.
  - Update `ReplayView.tsx` so key moments are no longer rendered as a permanent side list.
  - Update `layout.css` so the replay map/content area can span the full replay width.
  - Keep the replay copy panel and Report tab behavior intact.
  - Update tests that currently assert side-panel presence or alignment.
- Out:
  - Removing key moments from the report.
  - Changing event selection semantics.
  - Changing replay trace or race result data.
  - Redesigning Championship, Garage, or directive surfaces.

# Acceptance criteria
- AC1: `.replay-moments-panel` is no longer rendered in the Replay tab.
- AC2: The replay map spans the full available replay content width on desktop.
- AC3: Report tab still exposes post-race explanation and recap content.
- AC4: Mobile layout does not leave an empty gap where the side panel used to be.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: `.replay-moments-panel` is no longer rendered in the Replay tab.
- request-AC2 -> This backlog slice. Proof: AC2: The replay map spans the full available replay content width on desktop.
- request-AC7 -> This backlog slice. Proof: AC3: Report tab still exposes post-race explanation and recap content.
- request-AC8 -> This backlog slice. Proof: AC4: Mobile layout does not leave an empty gap where the side panel used to be.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_010_full_width_replay_moment_notifications_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_039_turn_replay_key_moments_into_timed_notifications`
- Primary task(s): `task_040_orchestrate_full_width_replay_moment_notifications`

# AI Context
- Summary: Remove the permanent replay key moments panel
- Keywords: scaffolded-backlog, remove the permanent replay key moments panel, implementation-ready
- Use when: Implementing the scaffolded slice for Remove the permanent replay key moments panel.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
