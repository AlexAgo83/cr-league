## item_145_verdict_block_in_the_race_report - Verdict block in the race report
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Progress: 100%
> Complexity: Low
> Theme: Race learning and feedback
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The report opens on a headline and podium, then jumps to phases and event lists; the direct answer a player wants is buried in four recap cards at the side.

# Scope
- In:
  - Render the verdict block in the report hero region above report-phases: stance line, cause sentence, try-next sentence.
  - Add the EN and FR strings as recap_verdict_* variant families following the existing naming and interpolation style.
  - Style consistently with the existing hero; no new layout system.
  - Add a ReportView test asserting the block renders with a finished race fixture; keep App.test.tsx report assertions green.
- Out:
  - Reordering or removing existing report sections.
  - Payoff panel and replay tab changes.

# Acceptance criteria
- AC1: The verdict block appears above the phases in both locales.
- AC2: Existing report tests pass unchanged and the new ReportView test covers the block.
- AC3: The i18n parity test passes.

# Implementation Notes
- 2026-07-20 wave 2: `ReportView` now renders a `Race verdict` block in the existing report hero before the podium/phases, translating the stance, dominant cause, and try-next lines from `buildRaceVerdict()`.
- Added minimal `.report-verdict` styling inside the existing report hero system, plus EN/FR `result_verdict` labels.
- Added `ReportView.test.tsx` to assert the verdict renders for a finished race and appears before report phases; adjusted the App test to allow the shared next-GP advice to appear in both verdict and recap.

# Validation
- 2026-07-20 targeted: `rtk npm run typecheck`; `rtk npm run lint`; `rtk npm test -- apps/web/src/features/ReportView.test.tsx apps/web/src/app/App.test.tsx apps/web/src/app/helpers.test.ts apps/web/src/i18n/index.test.ts`.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: The verdict block appears above the phases in both locales.
- request-AC4 -> This backlog slice. Proof: AC2: Existing report tests pass unchanged and the new ReportView test covers the block.
- request-AC3 -> This backlog slice. Proof: Rendering consumes `buildRaceVerdict()` directly; the helper shares cause ranking and next-lesson derivation with recap builders.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_024_result_verdict_pass_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_060_result_verdict_pass_why_it_worked_why_it_failed_what_to_try_next`
- Primary task(s): `task_061_orchestrate_result_verdict_pass`

# AI Context
- Summary: Verdict block in the race report
- Keywords: scaffolded-backlog, verdict block in the race report, implementation-ready
- Use when: Implementing the scaffolded slice for Verdict block in the race report.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_061_orchestrate_result_verdict_pass`

# Notes
- Task `task_061_orchestrate_result_verdict_pass` was finished via `logics-manager flow finish task` on 2026-07-20.
