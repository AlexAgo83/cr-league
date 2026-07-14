## task_029_improve_race_recap_readability - Improve race recap readability
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_034_improve_race_recap_readability`

# Acceptance criteria
- AC1: A resolved GP shows a player race recap panel.
- AC2: The recap includes key difference, player directive, and next-GP takeaway.
- AC3: The timeline shows player/major events before ambience notes.
- AC4: Event labels distinguish key events from track notes.
- AC5: Unit/e2e tests cover the recap.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Use `python3 -m logics_manager flow progress task task_029_improve_race_recap_readability.md --progress <n>%` during multi-wave work.
- Run `python3 -m logics_manager flow finish task task_029_improve_race_recap_readability.md` after implementation.
- npm run typecheck passed; npm test passed; npm run lint passed; npm run build passed; npm run test:e2e passed; logics-manager i18n validate passed; npm run logics:validate passed.
- Finish workflow executed on 2026-07-14.
- Linked backlog/request close verification passed.

# Report
- Added a player-focused race recap panel to resolved GP output.
- Added key difference, player directive, and next-GP takeaway copy derived from existing result/decision data.
- Prioritized player and major events in the timeline and labeled key events vs track notes.
- Updated EN/FR copy and unit/e2e coverage.
- Finished on 2026-07-14.
- Linked backlog item(s): `item_034_improve_race_recap_readability`
- Related request(s): `req_028_improve_race_recap_readability`

# AI Context
- Summary: Implement improve race recap readability.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_028_improve_race_recap_readability`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Proof: `recap-panel` in `apps/web/src/app/App.tsx`.
- request-AC2 -> This task. Proof: `result_difference`, `result_your_directive`, and `result_next_lesson` sections.
- request-AC3 -> This task. Proof: result timeline combines `playerEvents`, `majorEvents`, then `ambienceEvents`.
- request-AC4 -> This task. Proof: `event_major`/`event_ambience` labels and `player-event` styling.
- request-AC5 -> This task. Proof: EN/FR keys, Vitest assertions, and Playwright assertions.
