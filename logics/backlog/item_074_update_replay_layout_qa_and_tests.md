## item_074_update_replay_layout_qa_and_tests - Update replay layout QA and tests
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Validation and regression coverage
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The current e2e test explicitly expects the moments panel to exist and align beside the replay copy panel.
- The new design needs different assertions: full-width map, no permanent side panel, notifications, markers, and report persistence.
- Replay overlays are easy to regress visually without layout checks.

# Scope
- In:
  - Update unit tests for replay controls and notification state where practical.
  - Update Playwright layout assertions for desktop and mobile replay map width.
  - Assert the permanent key moments panel is absent from Replay.
  - Assert notifications appear and marker seeking still works.
  - Run `npm run typecheck`, `npm run lint`, `npm test -- apps/web`, `npm run test:e2e -- --project=chromium`, `npm run build`, and `npm run logics:validate`.
  - Capture screenshots if layout checks are updated or if the implementation changes overlay placement materially.
- Out:
  - Visual snapshot testing framework.
  - Cross-browser matrix beyond current Playwright Chromium unless failures demand it.
  - Manual playtest scripting beyond noting residual risk.

# Acceptance criteria
- AC1: Existing replay control tests pass with the custom speed menu and notification overlay.
- AC2: E2E verifies full-width replay layout and absence of `.replay-moments-panel`.
- AC3: E2E verifies marker seek and notification behavior.
- AC4: Full local validation gate passes before closeout.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: Existing replay control tests pass with the custom speed menu and notification overlay.
- request-AC7 -> This backlog slice. Proof: AC2: E2E verifies full-width replay layout and absence of `.replay-moments-panel`.
- request-AC8 -> This backlog slice. Proof: AC3: E2E verifies marker seek and notification behavior.
- request-AC9 -> This backlog slice. Proof: AC4: Full local validation gate passes before closeout.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_010_full_width_replay_moment_notifications_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_039_turn_replay_key_moments_into_timed_notifications`
- Primary task(s): `task_040_orchestrate_full_width_replay_moment_notifications`

# AI Context
- Summary: Update replay layout QA and tests
- Keywords: scaffolded-backlog, update replay layout qa and tests, implementation-ready
- Use when: Implementing the scaffolded slice for Update replay layout QA and tests.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
