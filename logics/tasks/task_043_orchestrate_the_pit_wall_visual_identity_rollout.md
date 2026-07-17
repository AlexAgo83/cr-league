## task_043_orchestrate_the_pit_wall_visual_identity_rollout - Orchestrate the Pit Wall visual identity rollout
> From version: 0.3.5
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
- [ ] 1. Read tokens.css, base.css, layout.css, index.html, CircuitMap.tsx, ChampionshipView.tsx, ReportView.tsx, GarageView.tsx, and the approved pitch reference before touching styles.
- [ ] 2. Land the foundation first: Pit Wall tokens, self-hosted Barlow/Barlow Condensed, type roles, chamfer utility; verify the app still builds and renders before any screen pass.
- [ ] 3. Run the asphalt pass on live surfaces (topbar, cockpit, plan editor, telemetry, buttons, circuit route recolor) as one reviewable CSS change set.
- [ ] 4. Run the chalk-paper pass on document surfaces (standings, report, garage) as a second change set.
- [ ] 5. Sweep for leftovers: old hex values, stray border-radius on themed panels, green/blue outside semantic use.
- [ ] 6. Capture before/after screenshots of the setup screen, race cockpit, plan editor, championship, and garage as closeout evidence.
- [ ] 7. Run typecheck, unit tests, build, and the Playwright e2e suite; record results in the task closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_085_pit_wall_foundation_tokens_self_hosted_type_chamfer_utility`
- `item_086_asphalt_pass_live_surfaces_cockpit_buttons_circuit_route`
- `item_087_chalk_paper_pass_standings_race_report_garage_sheets`

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
- Summary: Orchestrate the Pit Wall visual identity rollout
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_042_adopt_the_pit_wall_visual_identity_across_the_web_app`
- Product brief(s): `prod_013_pit_wall_visual_identity_product_brief`
- Architecture decision(s): (none yet)
