## item_053_collapse_pass_2_duplicated_boilerplate_in_web_and_api_tests - Collapse pass-2 duplicated boilerplate in web and API tests
> From version: 0.1.0
> Schema version: 1.0
> Status: In progress
> Understanding: 90
> Confidence: 85
> Progress: 10%
> Complexity: Low
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
The same code is written by hand in multiple places: app.test.ts repeats the identical buildApp setup block in 13 tests; App.tsx turns message/deskState changes into notifications through two copy-pasted effects with dedup refs (events masquerading as effects); nine mutation handlers repeat the same run-api-setLeagueState-setMessage sequence; the two setup screens repeat the same shell markup; and livery-plate markup, WEATHER_ICONS, the language select, and a next_action label are each duplicated across view components.

# Scope
- In:
  - One createTestApp() helper in apps/api/src/app.test.ts replacing the 13 repeated buildApp blocks.
  - One pushNotification(text, tone) helper in App.tsx called directly from event sites, deleting both notification effects and their lastNotification/lastCommandHint refs.
  - One mutate(statusKey, path, body, successKey) helper collapsing the mutation handlers that share the exact POST-then-setLeagueState-then-setMessage shape (leave the ones that also navigate or remember claims as thin wrappers).
  - One SetupShell wrapper for the two setup screens; one exported LiveryPlate component reused in ChampionshipView and GarageView; one shared WEATHER_ICONS constant; one hoisted language select; drop the duplicated next_action label in ChampionshipView.
- Out:
  - The Modal wrapper and activeModal/ApiError refactors (deliberately rejected: gain too small for the churn).
  - Any change to rendered copy, test assertions, or API behavior.
  - Component extraction beyond the named duplications.

# Acceptance criteria
- AC9: Typecheck, lint, unit tests, build, and e2e all pass after the cleanup.
- AC14: Duplicated boilerplate is collapsed: one createTestApp helper in app.test.ts, one pushNotification helper replacing both notification effects and their dedup refs, one mutate helper for the repeated POST-then-setLeagueState handlers, one shared SetupShell for the two setup screens, one LiveryPlate component, one WEATHER_ICONS constant, one language select element, and the duplicated next_action label dropped.

# AC Traceability
- request-AC9 -> This backlog slice. Proof: AC9: Typecheck, lint, unit tests, build, and e2e all pass after the cleanup.
- request-AC14 -> This backlog slice. Proof: AC14: Duplicated boilerplate is collapsed: one createTestApp helper in app.test.ts, one pushNotification helper replacing both notification effects and their dedup refs, one mutate helper for the repeated POST-then-setLeagueState handlers, one shared SetupShell for the two setup screens, one LiveryPlate component, one WEATHER_ICONS constant, one language select element, and the duplicated next_action label dropped.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `logics/request/req_033_over_engineering_cleanup_pass_1.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Collapse pass-2 duplicated boilerplate in web and API tests
- Keywords: backlog-groom, request, collapse pass-2 duplicated boilerplate in web and api tests, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Collapse pass-2 duplicated boilerplate in web and API tests.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: Medium
- Rationale: Default until groomed.

# Notes
- Hybrid rationale: Derived from request `req_033_over_engineering_cleanup_pass_1` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_033_over_engineering_cleanup_pass_1.md`.
- Generated locally by logics-manager.
