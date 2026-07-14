## task_032_orchestrate_visual_replay_v0 - Orchestrate visual replay V0
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Read the current `RaceResult` shape and web resolved-GP rendering before changing UI.
- [x] 2. Implement the smallest replay layout that uses existing classification and events.
- [x] 3. Add EN/FR copy and keep all visible text in the i18n catalogs.
- [x] 4. Validate with unit/e2e tests and visual screenshots for desktop and mobile.
- [x] 5. Update playtest docs, roadmap/spec notes, and close Logics with concrete proof.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_037_design_visual_replay_v0_contract_and_layout`
- `item_038_implement_visual_replay_panel_in_the_web_app`
- `item_039_capture_replay_v0_playtest_prompts_and_follow_up_risks`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC2 -> This task. Proof: `VisualReplay` renders player and field markers, lap progression, and race-event callouts from existing `RaceResult` data.
- request-AC3 -> This task. Proof: replay callouts prioritize player/major events while the existing race recap, key moments, and report remain rendered.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC5 -> This task. Proof: the implementation uses existing React and CSS only; no rendering engine dependency was added.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.

# Validation
- `npm test` passed.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed.
- `npm run test:e2e` passed.
- `logics-manager i18n validate` passed.
- `npm run logics:validate` passed before closeout.
- Desktop and mobile Playwright screenshots were inspected for the visual replay panel.
- npm test; npm run typecheck; npm run lint; npm run build; npm run test:e2e; logics-manager i18n validate; npm run logics:validate passed. Desktop and mobile Playwright screenshots inspected for the visual replay panel.
- Finish workflow executed on 2026-07-14.
- Linked backlog/request close verification passed.

# Report
- Implementation complete.
- Finished on 2026-07-14.
- Linked backlog item(s): `item_037_design_visual_replay_v0_contract_and_layout`, `item_038_implement_visual_replay_panel_in_the_web_app`, `item_039_capture_replay_v0_playtest_prompts_and_follow_up_risks`
- Related request(s): `req_031_add_first_visual_race_replay_from_event_timeline`

# AI Context
- Summary: Orchestrate visual replay V0
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_031_add_first_visual_race_replay_from_event_timeline`
- Product brief(s): `prod_002_visual_replay_v0_product_brief`
- Architecture decision(s): (none yet)
