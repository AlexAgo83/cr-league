## task_032_orchestrate_visual_replay_v0 - Orchestrate visual replay V0
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
- [ ] 1. Read the current `RaceResult` shape and web resolved-GP rendering before changing UI.
- [ ] 2. Implement the smallest replay layout that uses existing classification and events.
- [ ] 3. Add EN/FR copy and keep all visible text in the i18n catalogs.
- [ ] 4. Validate with unit/e2e tests and visual screenshots for desktop and mobile.
- [ ] 5. Update playtest docs, roadmap/spec notes, and close Logics with concrete proof.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_037_design_visual_replay_v0_contract_and_layout`
- `item_038_implement_visual_replay_panel_in_the_web_app`
- `item_039_capture_replay_v0_playtest_prompts_and_follow_up_risks`

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
- Summary: Orchestrate visual replay V0
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_031_add_first_visual_race_replay_from_event_timeline`
- Product brief(s): `prod_002_visual_replay_v0_product_brief`
- Architecture decision(s): (none yet)
