## item_047_validate_the_redesigned_cockpit_with_screenshots_and_playtest_prompts - Validate the redesigned cockpit with screenshots and playtest prompts
> From version: 0.1.0
> Schema version: 1.0
> Status: In progress
> Understanding: 95
> Confidence: 95
> Progress: 75%
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

# Direction to carry into implementation
- Use the V2 mockup direction as the acceptance reference for visual QA. A screen that only matches the earlier coarse/blocky pass is not sufficient.
- Screenshot matrix:
  - Desktop and mobile, no-league/setup.
  - Desktop and mobile, briefing/preparation with directive form.
  - Desktop and mobile, ready/locked with directive summary.
  - Desktop and mobile, resolved/post-GP with result and readout.
  - Desktop and mobile, between-GP with garage purchase available.
  - At least one pass in French mode.
- Playtest questions to add:
  - Does the first viewport feel like a racing command cockpit instead of an admin dashboard?
  - Does the screen feel refined enough, or still like rough blocks laid out on a dark page?
  - Does the city circuit read as a real European racing layout rather than a generic abstract loop or fleet dashboard map?
  - Does the replay feel like watching a resolved race timeline, not a fake live simulation?
  - Are overtakes understandable when they happen on the map and in the event list?
  - Can you name the next action within five seconds?
  - Do you understand what the result says happened and why?
  - Does the race readout feel honest about what it shows?
  - Are any labels still in English in French mode?
  - Are championship and garage helpful without distracting from the current GP?
- Validation proof to record at closeout: unit tests, typecheck, lint, build, e2e or documented browser playtest, i18n validation/status, `logics-manager flow validate`, `logics-manager lint --require-status`, and `logics-manager audit --group-by-doc`.
- Known remaining limits should be documented explicitly, especially if the replay remains static or if some secondary playtest/debug controls stay visually less polished.

# Visual QA evidence - 2026-07-14
- Captured French desktop briefing state: `~/Desktop/CRL/crl-cockpit-desktop-briefing.png`.
- Captured French desktop resolved replay state: `~/Desktop/CRL/crl-cockpit-desktop-replay.png`.
- Captured French mobile briefing state: `~/Desktop/CRL/crl-cockpit-mobile-briefing.png`.
- Captured French mobile resolved replay state: `~/Desktop/CRL/crl-cockpit-mobile-replay.png`.
- Inspected the first mobile pass and fixed the cramped two-column action block before recording the final evidence.
- Inspected the resolved replay pass and replaced raw English simulator prose in redesigned result/event/report areas with catalog-backed display text.
- Rejected the first corrective visual pass as still too stacked, removed the desktop rail, widened the cockpit grid, moved directive controls before league settings, and captured replacement screenshots: `~/Desktop/CRL/crl-cockpit-desktop-briefing-v2.png`, `~/Desktop/CRL/crl-cockpit-desktop-replay-v2.png`, `~/Desktop/CRL/crl-cockpit-mobile-briefing-v2.png`, and `~/Desktop/CRL/crl-cockpit-mobile-replay-v2.png`.

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
