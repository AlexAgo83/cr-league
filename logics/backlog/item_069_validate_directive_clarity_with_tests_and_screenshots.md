## item_069_validate_directive_clarity_with_tests_and_screenshots - Validate directive clarity with tests and screenshots
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 92
> Confidence: 87
> Progress: 100%
> Complexity: Medium
> Theme: Validation and QA
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The current flow is covered functionally, but the specific comprehension improvements need regression protection.
- The redesign changes control shape, so tests that target selects or old labels will need updates.
- The issue was discovered in playtest, so desktop and mobile visual checks matter.
- The updated scope must prove the start-of-day sequence is clearer without increasing screen clutter.

# Scope
- In:
  - Update unit tests for the directive surface copy, selected states, locked states, and plan summary.
  - Update Playwright flow selectors to use new accessible names.
  - Verify the cockpit exposes the current GP-day phase and next action before and after chrono attempts.
  - Verify chrono attempts are presented as setup testing and grid-position improvement before plan lock.
  - Run desktop and mobile screenshots or Playwright checks that confirm no overlap in the directive panel.
  - Check that the redesign does not introduce a new permanent tutorial/help panel competing with the map and directive controls.
  - Run `npm run typecheck`, `npm run lint`, `npm test -- apps/web`, `npm run test:e2e -- --project=chromium`, `npm run build`, and `npm run logics:validate`.
  - Record residual risks if only automated checks are available and no human playtest has been rerun.
- Out:
  - Formal usability study.
  - Analytics instrumentation.
  - Session replay tooling.
  - A/B testing.

# Acceptance criteria
- AC1: Tests cover choosing an approach, choosing a preparation, selecting no card or an owned card, and locking the directive.
- AC2: At least one test verifies the dynamic plan summary changes after a directive choice changes.
- AC3: E2E still covers the create profile, create league, submit directive, launch GP, and replay path.
- AC4: Validation commands pass locally before handoff or closeout.
- AC5: Tests or screenshots cover the compact current-phase/objective line and confirm the layout does not become more crowded.

# AC Traceability
- request-AC7 -> This backlog slice. Proof: AC1: Tests cover choosing an approach, choosing a preparation, selecting no card or an owned card, and locking the directive.
- request-AC8 -> This backlog slice. Proof: AC2: At least one test verifies the dynamic plan summary changes after a directive choice changes.
- request-AC9 -> This backlog slice. Proof: AC3: E2E still covers the create profile, create league, submit directive, launch GP, and replay path.
- request-AC11 -> This backlog slice. Proof: AC5: Tests or screenshots cover the compact current-phase/objective line and confirm the layout does not become more crowded.
- request-AC12 -> This backlog slice. Proof: AC5: Tests or screenshots cover the compact current-phase/objective line and confirm the layout does not become more crowded.
- request-AC4 -> This backlog slice. Evidence needed: Garage card selection is visual and understandable: no card, owned cards, fit status, card stat badges, and a short reason are visible without opening a dropdown.
- request-AC6 -> This backlog slice. Evidence needed: The primary command and confirmation copy make it clear that the directive locks the Grand Prix plan; qualifying remaining state remains visible before lock.
- request-AC10 -> This backlog slice. Evidence needed: Grip, Overtaking, and Energy remain visible on the map, and the race planning surface explains each value's qualitative level, concrete race meaning, and likely directive/card tradeoff.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_009_pit_wall_race_plan_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_038_redesign_the_race_directive_into_a_clear_pit_wall_plan`
- Primary task(s): `task_039_orchestrate_pit_wall_race_plan_clarity`

# AI Context
- Summary: Validate directive clarity with tests and screenshots
- Keywords: scaffolded-backlog, validate directive clarity with tests and screenshots, implementation-ready
- Use when: Implementing the scaffolded slice for Validate directive clarity with tests and screenshots.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_039_orchestrate_pit_wall_race_plan_clarity`

# Notes
- Task `task_039_orchestrate_pit_wall_race_plan_clarity` was finished via `logics-manager flow finish task` on 2026-07-16.
