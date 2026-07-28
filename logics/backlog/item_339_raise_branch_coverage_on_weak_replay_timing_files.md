## item_339_raise_branch_coverage_on_weak_replay_timing_files - Raise branch coverage on weak replay-timing files
> From version: 0.6.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Test coverage
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- vitest.config.ts enforces a branches coverage threshold of 80%, and the last measured full-suite branch coverage was 80.65% — a 0.65 percentage-point margin. A single unrelated PR touching low-branch-coverage files can push the average below the threshold and fail the required `coverage` CI lane.
- The specific files propping up the average with weak branch coverage are apps/web/src/features/replay/ReplayProgress.tsx (~50% branch), packages/shared/src/simulation/replayMoment.ts (~35% branch), and apps/web/src/app/useReplayClock.ts (~60% branch, ~70% statement).

# Scope
- In:
  - Add targeted unit tests for the untested branches in apps/web/src/features/replay/ReplayProgress.tsx, packages/shared/src/simulation/replayMoment.ts, and apps/web/src/app/useReplayClock.ts — read each file's current test file (if any) first and extend it, following this repo's existing testing conventions and libraries (vitest, @testing-library/react where applicable).
  - Re-run npx vitest run --coverage after adding tests and confirm the repo-wide branch coverage percentage has meaningfully increased (target: at least a few percentage points of real margin above the 80% threshold, not just barely above it).
  - Do not test implementation details that would make the tests brittle to refactors — test observable behavior (rendered output, returned values, clock ticks) for each branch.
- Out:
  - Lowering or removing the coverage threshold in vitest.config.ts — that is explicitly not the fix.
  - Adding coverage to any other file not named above, unless trivially adjacent to a change already being made.
  - Refactoring the three target files' implementation — only add tests, unless a file is genuinely untestable in its current shape, in which case note that in the closeout report rather than silently skipping it.

# Acceptance criteria
- AC1: apps/web/src/features/replay/ReplayProgress.tsx, packages/shared/src/simulation/replayMoment.ts, and apps/web/src/app/useReplayClock.ts each have measurably higher branch coverage than before this change.
- AC2: The repo-wide branch coverage reported by npx vitest run --coverage is no longer within 1 percentage point of the vitest.config.ts threshold.
- AC3: All added tests pass and the full existing test suite is unaffected.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: apps/web/src/features/replay/ReplayProgress.tsx, packages/shared/src/simulation/replayMoment.ts, and apps/web/src/app/useReplayClock.ts each have measurably higher branch coverage than before this change.
- request-AC13 -> This backlog slice. Proof: AC2: The repo-wide branch coverage reported by npx vitest run --coverage is no longer within 1 percentage point of the vitest.config.ts threshold.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_082_repo_review_remediation_pass_7_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_130_repo_review_remediation_pass_7_db_indexes_test_fake_drift_0_6_e2e_coverage_code_organization_and_admin_session_hardening`
- Primary task(s): `task_131_orchestrate_repo_review_remediation_pass_7`

# AI Context
- Summary: Raise branch coverage on weak replay-timing files
- Keywords: scaffolded-backlog, raise branch coverage on weak replay-timing files, implementation-ready
- Use when: Implementing the scaffolded slice for Raise branch coverage on weak replay-timing files.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
