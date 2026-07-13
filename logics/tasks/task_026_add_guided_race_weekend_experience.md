## task_026_add_guided_race_weekend_experience - Add guided race weekend experience
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: High
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready through explicit commits.

# Backlog
- `item_031_add_guided_race_weekend_experience`

# Acceptance criteria
- AC1: The web UI can switch between English and French and persists the selected language locally.
- AC2: The race desk shows a guided GP briefing with next action, track traits, likely weather, and action guidance.
- AC3: Directive controls include concise hints explaining approach, preparation, and card tradeoffs.
- AC4: Race simulation emits deterministic minor replay events so reports feel less repetitive without changing race balance.
- AC5: README, roadmap, playtest report, i18n contract, and Logics workflow docs reflect the slice.
- AC6: Validation covers typecheck, unit/component tests, E2E, lint, build, i18n, Logics, and closeout.

# AC Traceability
- request-AC1 -> This task. Proof: `fa953ec Add French language switcher`.
- request-AC2 -> This task. Proof: `45401d2 Add guided race briefing`.
- request-AC3 -> This task. Proof: `45401d2 Add guided race briefing`.
- request-AC4 -> This task. Proof: `b6b596c Add race replay flavor events`.
- request-AC5 -> This task. Proof: docs updated in README, roadmap, playtest report, i18n contract, request, backlog, and task.
- request-AC6 -> This task. Proof: validation section below.
- backlog-AC1 -> This task. Proof: language switcher test and persisted `cr-league-language`.
- backlog-AC2 -> This task. Proof: race desk renders next action, track profile, and likely weather.
- backlog-AC3 -> This task. Proof: approach, preparation, and card controls render helper text.
- backlog-AC4 -> This task. Proof: simulation test asserts four `race_note` flavor events.
- backlog-AC5 -> This task. Proof: docs updated in this closeout.
- backlog-AC6 -> This task. Proof: validation section below.

# Implementation
- Added French catalog and language selector.
- Exposed current GP track traits and forecast in league state.
- Added GP briefing and directive helper text.
- Added deterministic minor `race_note` events to the simulation.
- Increased visible key moments from six to eight.
- Updated README, roadmap, changelog, playtest report, i18n contract, and Logics docs.

# Validation
- 2026-07-14: `npm run typecheck` passed.
- 2026-07-14: `npm test` passed.
- 2026-07-14: `npm run lint` passed.
- 2026-07-14: `logics-manager i18n validate` passed.
- 2026-07-14: `npm run build` passed.
- 2026-07-14: `npm run test:e2e` passed.
- 2026-07-14: `logics-manager flow validate req_025_add_guided_race_weekend_experience` passed.
- 2026-07-14: `logics-manager flow validate-closeout task_026_add_guided_race_weekend_experience` passed.
- 2026-07-14: final `npm run logics:validate` passed with 0 warnings.

# Report
- Implementation complete.

# AI Context
- Summary: Implementation closeout for the guided race weekend UX slice.
- Keywords: task, i18n, french, guided-briefing, decision-hints, race-note, replay
- Use when: Reviewing files and validations for the post-playtest UX response.
- Skip when: Work is about economy, production deployment, or full visual replay.

# Links
- Request: `req_025_add_guided_race_weekend_experience`
- Roadmap(s): `road_001_cr_league_roadmap`
