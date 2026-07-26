## item_294_instrument_the_browser_run_fun_frustration_report_ui_failure_capture_npm_wiring - Instrument the browser run: fun/frustration report, UI failure capture, npm wiring
> From version: 0.4.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: AI playtest tooling
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The browser run must report the same human-feel signal (fun/frustration) as ai-playtest, in the same reports/playtest family.
- Its whole value is catching UI failures headless runs miss, so missing elements, stuck states, and console errors must be captured, with a screenshot on failure.
- It needs to be runnable as an npm script without becoming a required CI gate yet.

# Scope
- In:
  - Emit a report under reports/playtest/ with outcomes plus the shared fun/frustration metrics from the browser run.
  - Capture UI-specific failures (missing element / stuck state / thrown console error) and save a screenshot on failure.
  - Wire an npm script (e.g. playtest:browser) and, optionally, a fast smoke variant; keep it non-blocking in CI for now.
- Out:
  - Making it a required CI gate.
  - Changing report formats of the existing tools.

# Acceptance criteria
- AC1: The run writes a reports/playtest report with outcomes and fun/frustration metrics.
- AC2: UI failures are surfaced with a screenshot on failure.
- AC3: An npm script runs it; typecheck/test/lint/logics:validate pass and the existing tools still work.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: The run writes a reports/playtest report with outcomes and fun/frustration metrics.
- request-AC5 -> This backlog slice. Proof: AC2: UI failures are surfaced with a screenshot on failure.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_071_ai_playtest_surfaces_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_119_browser_driven_ai_playtest_an_agent_that_plays_the_real_ui_like_a_human_decisions_from_the_shared_playtest_brain`
- Primary task(s): `task_120_orchestrate_the_browser_driven_ai_playtest`

# AI Context
- Summary: Instrument the browser run: fun/frustration report, UI failure capture, npm wiring
- Keywords: scaffolded-backlog, instrument the browser run: fun/frustration report, ui failure capture, npm wiring, implementation-ready
- Use when: Implementing the scaffolded slice for Instrument the browser run: fun/frustration report, UI failure capture, npm wiring.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_120_orchestrate_the_browser_driven_ai_playtest` was finished via `logics-manager flow finish task` on 2026-07-26.
