## item_029_add_automated_private_league_playtest_scenario - Add automated private league playtest scenario
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 92%
> Confidence: 88%
> Progress: 100%
> Complexity: High
> Theme: Testing and playtest
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The private league prototype can be manually exercised, but regressions across several GP are not yet automatically caught.
- Unit tests and PostgreSQL smoke are useful, but they do not verify the browser flow through the 0.2 dashboard.

# Scope
- In:
  - Playwright dependency/config/script;
  - one browser E2E test for a 3 GP private league UI loop;
  - one API scenario test for a 3 GP private league loop;
  - README validation docs;
  - ignore generated Playwright artifacts.
- Out:
  - CI browser matrix;
  - visual screenshots;
  - real PostgreSQL inside Playwright;
  - cross-device E2E;
  - manual playtest questionnaire.

# Acceptance criteria
- AC1: `npm run test:e2e` runs Playwright.
- AC2: Browser test covers create/configure/submit/resolve/next GP across three rounds.
- AC3: API test covers three resolved GP and standings/history assertions.
- AC4: Existing validation remains green.
- AC5: Artifacts are not accidentally committed.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: script is in scope.
- request-AC2 -> This backlog slice. Proof: Playwright config is in scope.
- request-AC3 -> This backlog slice. Proof: browser 3-GP loop is in scope.
- request-AC4 -> This backlog slice. Proof: API 3-GP loop is in scope.
- request-AC5 -> This backlog slice. Proof: artifact ignore is in scope.
- request-AC6 -> This backlog slice. Proof: README update is in scope.
- request-AC7 -> This backlog slice. Proof: validation is in scope.

# Decision framing
- Product framing: Needed
- Product signals: This supports 0.2 playtest confidence before economy/replay expansion.
- Product follow-up: Add manual playtest checklist after automated loop coverage is stable.
- Architecture framing: Not needed
- Architecture signals: Playwright is a dev-only dependency and does not alter runtime architecture.
- Architecture follow-up: CI/browser matrix can be added when deployment workflow exists.

# Links
- Product brief(s): `prod_001_cr_league_product_brief`
- Roadmap(s): `road_001_cr_league_roadmap`
- Architecture decision(s): `adr_008_testing_quality`
- Request: `req_023_add_automated_private_league_playtest_scenario`
- Primary task(s): `task_024_add_automated_private_league_playtest_scenario`

# AI Context
- Summary: Backlog slice for automated private league playtest coverage.
- Keywords: backlog-groom, playwright, e2e, api-scenario, private-league
- Use when: Implementing or reviewing automated 3-GP private league tests.
- Skip when: The work is about production CI, visual regression, or manual playtest scripts.

# Priority
- Priority: High
- Rationale: Automated playtest coverage protects the 0.2 loop before adding more gameplay surface.

# Notes
- Task `task_024_add_automated_private_league_playtest_scenario` completed implementation and validation on 2026-07-14.

# Tasks
- `task_024_add_automated_private_league_playtest_scenario`
