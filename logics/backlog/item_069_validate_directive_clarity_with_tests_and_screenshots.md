## item_069_validate_directive_clarity_with_tests_and_screenshots - Validate directive clarity with tests and screenshots
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Validation and QA
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The current flow is covered functionally, but the specific comprehension improvements need regression protection.
- The redesign changes control shape, so tests that target selects or old labels will need updates.
- The issue was discovered in playtest, so desktop and mobile visual checks matter.

# Scope
- In:
  - Update unit tests for the directive surface copy, selected states, locked states, and plan summary.
  - Update Playwright flow selectors to use new accessible names.
  - Run desktop and mobile screenshots or Playwright checks that confirm no overlap in the directive panel.
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

# AC Traceability
- request-AC7 -> This backlog slice. Proof: AC1: Tests cover choosing an approach, choosing a preparation, selecting no card or an owned card, and locking the directive.
- request-AC8 -> This backlog slice. Proof: AC2: At least one test verifies the dynamic plan summary changes after a directive choice changes.
- request-AC9 -> This backlog slice. Proof: AC3: E2E still covers the create profile, create league, submit directive, launch GP, and replay path.

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
