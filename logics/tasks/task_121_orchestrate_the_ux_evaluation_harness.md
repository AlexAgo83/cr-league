## task_121_orchestrate_the_ux_evaluation_harness - Orchestrate the UX evaluation harness
> From version: 0.4.6
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
- [ ] 1. Read req_119 first; this harness wraps that browser agent and its shared brain — do not fork a second UI driver or brain.
- [ ] 2. Add visual capture (screenshots + annotations, desktop + mobile) assembled into a reviewable playthrough under reports/.
- [ ] 3. Instrument friction (actions-per-task, dead-ends, console errors, mobile tap-target/overflow) and add axe-core as the first automated a11y pass, emitting a friction report.
- [ ] 4. Add the cold-start naive agent restricted to visible affordances and emit an onboarding funnel.
- [ ] 5. Wire npm scripts, keep it non-blocking in CI, reuse the seeded backend; run typecheck/test/lint/logics:validate and record proof at closeout.
- [ ] 6. Keep the harness to producing EVIDENCE; the UX opinion and any UI fixes are separate downstream steps.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_295_visual_playthrough_capture_screenshots_annotated_state_desktop_and_mobile`
- `item_296_friction_accessibility_instrumentation_with_axe_core`
- `item_297_cold_start_naive_agent_and_onboarding_funnel`

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
- Summary: Orchestrate the UX evaluation harness
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_120_ux_evaluation_harness_let_an_ai_judge_ui_ux_friction_and_onboarding_by_capturing_what_it_can_see_and_measure`
- Product brief(s): `prod_072_ai_ux_evaluation_product_brief`
- Architecture decision(s): (none yet)
