## task_038_orchestrate_starting_grid_and_season_narrative - Orchestrate starting grid and season narrative
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Read App.tsx (launch confirmation, qualifying leaderboard, modal patterns), ChampionshipView, store.ts buildParticipants and the rollover block, and the history rendering before writing code.
- [ ] 2. Confirm req_033 (cleanup) has shipped or coordinate on App.tsx/ChampionshipView/i18n files if running concurrently.
- [ ] 3. Ship the grid confirmation item first (smallest, independent).
- [ ] 4. Ship the season-standings helper with the champion modal and palmares next; the history grouping item consumes the same helper last.
- [ ] 5. Run typecheck, lint, unit tests, build, and e2e; verify FR copy and both modals in visual QA; record proof in the Logics closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_062_show_the_starting_grid_in_the_race_launch_confirmation`
- `item_063_derive_season_standings_and_celebrate_the_champion`
- `item_064_group_the_gp_history_by_season`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.

# Report
- Implementation complete.

# AI Context
- Summary: Orchestrate starting grid and season narrative
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_037_starting_grid_modal_and_season_narrative`
- Product brief(s): `prod_008_race_ceremony_and_season_narrative_product_brief`
- Architecture decision(s): (none yet)
