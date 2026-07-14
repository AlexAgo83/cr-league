## task_033_orchestrate_race_cockpit_redesign_v0 - Orchestrate race cockpit redesign V0
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 95
> Confidence: 90
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Read the current app layout, CSS, i18n catalogs, roadmap, product brief, and existing playtest notes before editing UI.
- [ ] 2. Define the cockpit information architecture and visual direction before changing components.
- [ ] 3. Refactor only the surfaces needed for the redesign, keeping state and API behavior stable.
- [ ] 4. Implement the cockpit, championship, garage, result, and replay presentation changes with EN/FR catalog coverage.
- [ ] 5. Run unit, typecheck, lint, build, e2e, i18n, Logics validation, and desktop/mobile visual QA.
- [ ] 6. Update playtest docs and close the Logics chain with concrete proof.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Execution direction
- Start with `item_040` and `item_041`: lock the screen model and CSS vocabulary before changing JSX structure.
- Then implement the primary loop through `item_042`, because Course and the dominant action define whether the redesign works.
- Implement `item_043` and `item_044` as support/payoff surfaces after the race desk is coherent.
- Keep `item_045` active throughout the UI work; every new visible label must land in EN and FR catalogs in the same wave as the component change.
- Use `item_046` to reduce `App.tsx` only where extraction helps the redesign. Do not create a generic design system.
- Finish with `item_047` visual QA and playtest prompts before closeout. A passing build without screenshots is not enough for this request.

# Backlog
- `item_040_define_the_cockpit_information_architecture`
- `item_041_establish_visual_direction_and_css_foundations`
- `item_042_rebuild_the_race_desk_around_one_clear_action`
- `item_043_redesign_championship_and_garage_as_supporting_panels`
- `item_044_make_result_and_replay_presentation_unambiguous`
- `item_045_audit_and_harden_i18n_for_redesigned_surfaces`
- `item_046_split_the_web_cockpit_into_practical_components`
- `item_047_validate_the_redesigned_cockpit_with_screenshots_and_playtest_prompts`

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
- Summary: Orchestrate race cockpit redesign V0
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_032_redesign_the_cr_league_race_cockpit_v0`
- Product brief(s): `prod_003_race_cockpit_redesign_v0_product_brief`
- Architecture decision(s): (none yet)
