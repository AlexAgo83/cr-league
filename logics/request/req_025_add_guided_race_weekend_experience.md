## req_025_add_guided_race_weekend_experience - Add guided race weekend experience
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Complexity: High
> Theme: Playtest UX
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Respond to the first private-league technical playtest feedback.
- Move the prototype from a functional race form toward a guided race weekend desk:
  - clearer next action;
  - visible pre-GP context;
  - decision hints that explain tradeoffs;
  - more replay variety;
  - French UI support for local playtests.

# Context
- Playtest report: `docs/playtest/results/2026-07-14-private-league-technical-playtest.md`.
- Main finding: the technical loop works, but the product lacks guidance, immersion, and race liveliness.
- This request stays thin and does not attempt full economy, visual track replay, or production scheduling.

# Acceptance criteria
- AC1: The web UI can switch between English and French and persists the selected language locally.
- AC2: The race desk shows a guided GP briefing with next action, track traits, likely weather, and action guidance.
- AC3: Directive controls include concise hints explaining approach, preparation, and card tradeoffs.
- AC4: Race simulation emits deterministic minor replay events so reports feel less repetitive without changing race balance.
- AC5: README, roadmap, playtest report, i18n contract, and Logics workflow docs reflect the slice.
- AC6: Validation covers typecheck, unit/component tests, E2E, lint, build, i18n, Logics, and closeout.

# AC Traceability
- AC1 -> `task_026_add_guided_race_weekend_experience`. Proof: `apps/web/src/i18n/fr.json`, `apps/web/src/i18n/index.ts`, `apps/web/src/app/App.tsx`, and language-switch test.
- AC2 -> `task_026_add_guided_race_weekend_experience`. Proof: `apps/api/src/features/leagues/store.ts` exposes track/forecast and `App.tsx` renders the briefing.
- AC3 -> `task_026_add_guided_race_weekend_experience`. Proof: directive hint keys and `App.tsx` control helper text.
- AC4 -> `task_026_add_guided_race_weekend_experience`. Proof: `RaceEventType` includes `race_note` and simulation tests assert deterministic flavor events.
- AC5 -> `task_026_add_guided_race_weekend_experience`. Proof: README, roadmap, playtest report, i18n contract, and this workflow chain.
- AC6 -> `task_026_add_guided_race_weekend_experience`. Proof: task validation log dated 2026-07-14.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Scope
- In:
  - French UI catalog and language selector;
  - GP briefing and decision hints;
  - deterministic minor replay notes;
  - docs and Logics updates.
- Out:
  - full economy/card inventory;
  - visual track replay;
  - backend scheduling/notifications;
  - polished final art direction.

# Companion docs
- Roadmap(s): `road_001_cr_league_roadmap`
- Playtest report: `2026-07-14-private-league-technical-playtest`

# AI Context
- Summary: Thin guided race weekend slice after the first private-league technical playtest.
- Keywords: playtest, guidance, briefing, decision-hints, replay-flavor, french, i18n
- Use when: Reviewing the first UX/immersion response after the private-league playtest.
- Skip when: Work is about deep economy, production auth, scheduler, or full visual replay.

# Backlog
- `item_031_add_guided_race_weekend_experience`
