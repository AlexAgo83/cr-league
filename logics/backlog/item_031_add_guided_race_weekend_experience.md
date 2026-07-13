## item_031_add_guided_race_weekend_experience - Add guided race weekend experience
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: High
> Theme: Playtest UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The private-league loop is technically playable, but testers still infer what to do and why.
- The race feels too mechanical because the replay has too few event beats.
- Local playtests benefit from French UI support.

# Scope
- In:
  - English/French UI switching;
  - GP briefing with next action, track, and forecast;
  - decision helper text for approach/preparation/card;
  - deterministic minor race-note events;
  - documentation and workflow closeout.
- Out:
  - full UI redesign;
  - economy progression;
  - inventory;
  - visual race map;
  - scheduler.

# Acceptance criteria
- AC1: The web UI can switch between English and French and persists the selected language locally.
- AC2: The race desk shows a guided GP briefing with next action, track traits, likely weather, and action guidance.
- AC3: Directive controls include concise hints explaining approach, preparation, and card tradeoffs.
- AC4: Race simulation emits deterministic minor replay events so reports feel less repetitive without changing race balance.
- AC5: README, roadmap, playtest report, i18n contract, and Logics workflow docs reflect the slice.
- AC6: Validation covers typecheck, unit/component tests, E2E, lint, build, i18n, Logics, and closeout.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: language selector and French catalog are in scope.
- request-AC2 -> This backlog slice. Proof: GP briefing is in scope.
- request-AC3 -> This backlog slice. Proof: directive helper text is in scope.
- request-AC4 -> This backlog slice. Proof: minor replay event variety is in scope.
- request-AC5 -> This backlog slice. Proof: docs and Logics updates are in scope.
- request-AC6 -> This backlog slice. Proof: validation evidence is in scope.

# Decision framing
- Product framing: Needed.
- Product signals: First playtest showed guidance and immersion are higher priority than deep economy.
- Product follow-up: Next slice should choose whether to deepen the race desk UI, add first progression hooks, or move toward card inventory.
- Architecture framing: Not needed.
- Architecture signals: This stays inside the existing React/Fastify/shared simulation architecture.
- Architecture follow-up: A larger i18n system can wait until more locales or runtime formatting complexity appears.

# Links
- Roadmap(s): `road_001_cr_league_roadmap`
- Request: `req_025_add_guided_race_weekend_experience`
- Primary task(s): `task_026_add_guided_race_weekend_experience`

# AI Context
- Summary: Backlog slice for the first guided race weekend UX pass.
- Keywords: backlog, playtest, guided-briefing, replay-flavor, french-i18n
- Use when: Reviewing or extending the post-playtest guidance/immersion slice.
- Skip when: The work is about production deployment, economy, or full visual replay.

# Priority
- Priority: High
- Rationale: The first playtest identified UX guidance and immersion as the main blockers.

# Notes
- Completed on 2026-07-14 through three implementation commits plus docs closeout.

# Tasks
- `task_026_add_guided_race_weekend_experience`
