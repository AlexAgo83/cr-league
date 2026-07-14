## item_047_validate_the_redesigned_cockpit_with_screenshots_and_playtest_prompts - Validate the redesigned cockpit with screenshots and playtest prompts
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Validation and playtest readiness
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The redesign is only successful if it changes what a tester understands and feels, not just if the code compiles.
- The current playtest checklist needs to capture visual direction, cockpit clarity, replay comprehension, and French-copy quality.
- Screenshots should catch obvious responsive failures before another playtest.

# Scope
- In:
  - Update the private-league 3-GP playtest checklist with cockpit-specific questions.
  - Capture desktop and mobile screenshots for briefing, ready, resolved, and between-GP states.
  - Document known remaining limits after the redesign, especially any replay limitations.
  - Run the established gates and record proof in the Logics task closeout.
- Out:
  - Running a full external playtest.
  - Analytics instrumentation.
  - Automated visual regression infrastructure.
  - Production release work.

# Acceptance criteria
- AC1: Playtest docs ask whether the cockpit feels like a racing game rather than an admin dashboard.
- AC2: Playtest docs ask whether the next action is obvious in each GP state.
- AC3: Desktop and mobile screenshots are captured or explicitly inspected for redesigned states.
- AC4: The Logics closeout records validation commands and visual QA proof.

# AC Traceability
- request-AC7 -> This backlog slice. Proof: AC1: Playtest docs ask whether the cockpit feels like a racing game rather than an admin dashboard.
- request-AC8 -> This backlog slice. Proof: AC2: Playtest docs ask whether the next action is obvious in each GP state.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_003_race_cockpit_redesign_v0_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_032_redesign_the_cr_league_race_cockpit_v0`
- Primary task(s): `task_033_orchestrate_race_cockpit_redesign_v0`

# AI Context
- Summary: Validate the redesigned cockpit with screenshots and playtest prompts
- Keywords: scaffolded-backlog, validate the redesigned cockpit with screenshots and playtest prompts, implementation-ready
- Use when: Implementing the scaffolded slice for Validate the redesigned cockpit with screenshots and playtest prompts.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
