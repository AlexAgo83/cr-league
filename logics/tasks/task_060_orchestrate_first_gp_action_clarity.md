## task_060_orchestrate_first_gp_action_clarity - Orchestrate first-GP action clarity
> From version: 0.3.11
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
- [x] 1. Check whether req_058 item_137 (App.tsx decomposition and command-clicked collapse) has landed; build the highlight rule on the current structure either way and note the coordination in the closeout.
- [x] 2. Implement the single-recommendation highlight rule with its unit and e2e test updates.
- [x] 3. Add the plan recommendation helper and PlanView line with EN/FR strings and helper tests.
- [x] 4. Run the vocabulary audit, apply the renames in both locales, and update the pinned-label tests and playtest checklist in the same change.
- [x] 5. Run typecheck, tests, build, lint, e2e, and Logics validation; record proof at closeout and mark roadmap patch 0.3.16 shipped when released.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_141_single_recommended_cta_at_grand_prix_start`
- `item_142_compact_circuit_and_weather_recommendation_on_the_plan_screen`
- `item_143_harmonize_first_session_vocabulary_in_en_and_fr`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.
- request-AC2 -> This task. Proof: `buildPlanRecommendation()` composes dominant circuit trait plus strongest forecast, `PlanView` renders it once in the directive briefing header, EN/FR keys are present, and `raceFlow.test.ts` plus `App.test.tsx` cover helper output and screen rendering.
- request-AC3 -> This task. Proof: EN chrono actions now read `New chrono`, `Review chrono`, and `Run chrono`; visible lap-time copy was harmonized to chrono labels, `team_missing` now reads phase-appropriate no-plan wording, and `apps/web/src/i18n/index.test.ts` passed.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- Passed: rtk npm run typecheck; rtk npm run lint; rtk npm test; rtk npm run build; rtk npm run test:e2e; rtk npm run logics:validate; rtk logics-manager lint --require-status; rtk logics-manager audit --legacy-cutoff-version 1.1.0 --group-by-doc.
- Finish workflow executed on 2026-07-20.
- Linked backlog/request close verification passed.

# Report
- 2026-07-20 wave 1: req_058 item_137 had already landed, so this wave built on the extracted app-shell/session action structure. Implemented the fresh-GP single-CTA highlight rule for item_141 and started the EN chrono label rename for item_143.
- Targeted validation passed for typecheck, lint, App/i18n unit tests, and the first-click e2e spec. Full validation remains pending until item_142 and the remaining item_143 audit are complete.
- 2026-07-20 wave 2: implemented the item_142 plan recommendation helper, EN/FR strings, prop flow into `PlanView`, header rendering in `DirectivePanel`, helper tests across all forecast values, a FR localization test, and an App render assertion.
- 2026-07-20 wave 3: completed the visible first-session chrono vocabulary sweep and changed the championship team status from `missing` to phase-appropriate no-plan wording. Targeted typecheck, lint, App/raceFlow/i18n/ReplayView tests passed.
- 2026-07-20 closeout: full validation passed after stabilizing the e2e create-league helper to suppress non-target onboarding before league launch. Proof: `rtk npm run typecheck`; `rtk npm run lint`; `rtk npm test`; `rtk npm run build`; `rtk npm run test:e2e`; `rtk npm run logics:validate`; `rtk logics-manager lint --require-status`; `rtk logics-manager audit --legacy-cutoff-version 1.1.0 --group-by-doc`.
- Finished on 2026-07-20.
- Linked backlog item(s): `item_141_single_recommended_cta_at_grand_prix_start`, `item_142_compact_circuit_and_weather_recommendation_on_the_plan_screen`, `item_143_harmonize_first_session_vocabulary_in_en_and_fr`
- Related request(s): `req_059_first_gp_action_clarity_one_recommended_cta_plan_recommendation_and_vocabulary_harmonization`

# AI Context
- Summary: Orchestrate first-GP action clarity
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_059_first_gp_action_clarity_one_recommended_cta_plan_recommendation_and_vocabulary_harmonization`
- Product brief(s): `prod_023_first_gp_action_clarity_product_brief`
- Architecture decision(s): (none yet)
