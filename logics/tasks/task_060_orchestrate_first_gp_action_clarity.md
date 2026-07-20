## task_060_orchestrate_first_gp_action_clarity - Orchestrate first-GP action clarity
> From version: 0.3.11
> Schema version: 1.0
> Status: In progress
> Understanding: 92
> Confidence: 85
> Progress: 35
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Check whether req_058 item_137 (App.tsx decomposition and command-clicked collapse) has landed; build the highlight rule on the current structure either way and note the coordination in the closeout.
- [ ] 2. Implement the single-recommendation highlight rule with its unit and e2e test updates.
- [ ] 3. Add the plan recommendation helper and PlanView line with EN/FR strings and helper tests.
- [ ] 4. Run the vocabulary audit, apply the renames in both locales, and update the pinned-label tests and playtest checklist in the same change.
- [ ] 5. Run typecheck, tests, build, lint, e2e, and Logics validation; record proof at closeout and mark roadmap patch 0.3.16 shipped when released.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_141_single_recommended_cta_at_grand_prix_start`
- `item_142_compact_circuit_and_weather_recommendation_on_the_plan_screen`
- `item_143_harmonize_first_session_vocabulary_in_en_and_fr`

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
- 2026-07-20 wave 1: req_058 item_137 had already landed, so this wave built on the extracted app-shell/session action structure. Implemented the fresh-GP single-CTA highlight rule for item_141 and started the EN chrono label rename for item_143.
- Targeted validation passed for typecheck, lint, App/i18n unit tests, and the first-click e2e spec. Full validation remains pending until item_142 and the remaining item_143 audit are complete.

# AI Context
- Summary: Orchestrate first-GP action clarity
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_059_first_gp_action_clarity_one_recommended_cta_plan_recommendation_and_vocabulary_harmonization`
- Product brief(s): `prod_023_first_gp_action_clarity_product_brief`
- Architecture decision(s): (none yet)
