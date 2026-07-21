## item_164_surface_non_winning_feedback_in_reports - Surface non-winning feedback in reports
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Report UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Derived feedback must appear in the result/report flow where players judge whether the race made sense.
- The UI must stay compact and not compete with the main verdict.

# Scope
- In:
  - Render the derived non-winning feedback in result/report surfaces.
  - Add EN/FR copy for supported verdicts.
  - Extend focused render/e2e tests around a non-winning scenario.
- Out:
  - New report page structure.
  - Long narrative generation.
  - Adding rewards or missions.

# Acceptance criteria
- AC1: Reports can show concrete non-winning success feedback.
- AC5: EN/FR copy is present.
- AC6: Report/replay/result flow still passes.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: `ReportView` renders the derived non-winning panel below the race verdict.
- request-AC5 -> This backlog slice. Proof: `en.json` and `fr.json` include label, success, and miss copy.
- request-AC6 -> This backlog slice. Proof: `ReportView.test.tsx` covers visible non-winning feedback and Playwright report flow still passes.
- request-AC7 -> This backlog slice. Proof: covered by the task closeout validation suite.

# Notes
- Feedback uses a compact `.non-winning-feedback` panel and does not add a new results page.
- Task `task_069_orchestrate_non_winning_success_feedback` owns closeout validation.
- Task `task_069_orchestrate_non_winning_success_feedback` was finished via `logics-manager flow finish task` on 2026-07-21.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_032_non_winning_success_feedback_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_068_non_winning_success_feedback`
- Primary task(s): `task_069_orchestrate_non_winning_success_feedback`

# AI Context
- Summary: Surface non-winning feedback in reports
- Keywords: scaffolded-backlog, surface non-winning feedback in reports, implementation-ready
- Use when: Implementing the scaffolded slice for Surface non-winning feedback in reports.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
