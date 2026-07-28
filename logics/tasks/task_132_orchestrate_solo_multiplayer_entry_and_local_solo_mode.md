## task_132_orchestrate_solo_multiplayer_entry_and_local_solo_mode - Orchestrate Solo / Multiplayer entry and local solo mode
> From version: 0.6.1
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
- [ ] 1. Audit the current setup/profile/league gates and choose the smallest routing/state shape for an explicit app mode: none, solo, or multiplayer.
- [ ] 2. Add the Solo / Multiplayer setup screen, keeping the existing LeagueSetupView as the Multiplayer sublevel and preserving admin/changelog exceptions.
- [ ] 3. Implement a local solo LeagueState factory and dedicated storage helpers with no overlap with multiplayer profile or claim keys.
- [ ] 4. Introduce a small action boundary so solo actions mutate local state while multiplayer keeps using api().
- [ ] 5. Wire the first solo loop through plan, qualifying, directive lock, resolve, replay/report, next Grand Prix, garage, livery, and team name updates.
- [ ] 6. Add clear en/fr copy, a local solo indicator, and a confirmed solo reset command.
- [ ] 7. Add focused tests for setup hierarchy, multiplayer regression, solo no-fetch behavior, solo persistence, and reset/logout isolation.
- [ ] 8. Run web typecheck, focused Vitest suites, web build, and Logics validation; record any deliberately deferred work in the closeout notes.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_347_introduce_the_solo_multiplayer_setup_hierarchy`
- `item_348_build_local_solo_state_persistence_and_action_adapter`
- `item_349_polish_solo_multiplayer_affordances_and_reset_safety`

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
- Summary: Orchestrate Solo / Multiplayer entry and local solo mode
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_131_solo_and_multiplayer_entry_split_with_local_solo_mode`
- Product brief(s): `prod_083_solo_multiplayer_entry_and_local_solo_mode_product_brief`
- Architecture decision(s): (none yet)
