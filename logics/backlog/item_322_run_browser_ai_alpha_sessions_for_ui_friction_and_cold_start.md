## item_322_run_browser_ai_alpha_sessions_for_ui_friction_and_cold_start - Run browser AI alpha sessions for UI friction and cold start
> From version: 0.5.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Browser alpha evidence
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Headless agents can validate the model but cannot prove the real UI is understandable or stable.
- The browser agent and UX harness now exist, and Playwright Chromium is installed locally.
- The browser run should stay small enough to be rerunnable and inspectable, with screenshots/friction reports carrying the evidence.

# Scope
- In:
  - Run a browser playtest smoke with a representative profile set.
  - Run the UX playthrough report and cold-start onboarding report.
  - Collect generated report paths and note any console, navigation, screenshot, accessibility, or dead-end findings.
- Out:
  - Using browser sessions for statistical balance conclusions.
  - Fixing UI issues inside this item unless the run cannot complete at all.

# Acceptance criteria
- AC1: Browser playtest report exists and names profiles/rounds executed.
- AC2: UX/friction report and cold-start report exist.
- AC3: The item report classifies browser findings as blocker, follow-up, or acceptable for alpha.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Browser playtest report exists and names profiles/rounds executed.
- request-AC3 -> This backlog slice. Proof: AC2: UX/friction report and cold-start report exist.
- request-AC5 -> This backlog slice. Proof: AC3: The item report classifies browser findings as blocker, follow-up, or acceptable for alpha.
- request-AC6 -> This backlog slice. Proof: AC3: The item report classifies browser findings as blocker, follow-up, or acceptable for alpha.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_080_ai_alpha_seasons_evidence_run_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_128_ai_alpha_seasons_evidence_run_stress_the_season_loop_with_headless_and_browser_agents_before_0_6`
- Primary task(s): `task_129_orchestrate_the_ai_alpha_seasons_evidence_run`

# AI Context
- Summary: Run browser AI alpha sessions for UI friction and cold start
- Keywords: scaffolded-backlog, run browser ai alpha sessions for ui friction and cold start, implementation-ready
- Use when: Implementing the scaffolded slice for Run browser AI alpha sessions for UI friction and cold start.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
