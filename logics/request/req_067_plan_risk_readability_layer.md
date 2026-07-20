## req_067_plan_risk_readability_layer - Plan risk readability layer
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Plan comprehension and decision confidence
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Before the player sends a race plan, show a compact risk/readability summary for the current directive.
- Classify the plan as safe, risky, or high-upside using existing plan inputs, circuit traits, weather forecast, card choice, qualifying/grid context, and current league state.
- Explain the plan's main strength, main failure mode, and intended finishing band in short player-facing language.
- Keep the feature advisory only: it must not change simulation, plan locking, card consumption, or API payloads.
- Make the summary available on the plan screen and in the send-plan confirmation so the player sees it before committing.

# Context
- The current plan flow already has directive controls, circuit traits, weather forecast, card choice, qualifying state, and a send-plan confirmation. The new layer should derive from that existing state instead of introducing a new model.
- The result verdict pass (req_060) explains outcomes after the race. This request is the pre-race counterpart: what the player is trying to do and why it is safe/risky/high-upside before committing.
- Avoid a prediction engine. Use deterministic heuristics that are simple, testable, and stable enough to be explained in copy.
- The summary should reuse existing theme tokens and compact panel patterns. No modal redesign and no new charting or visual dependency.
- New i18n keys are expected for risk labels and short explanation copy in en/fr.

# Acceptance criteria
- AC1: The plan screen shows a compact risk/readability panel for the currently selected directive, with one of safe/risky/high-upside, one strength, one failure mode, and one intended finishing band.
- AC2: The send-plan confirmation repeats the same risk/readability summary before the player commits the directive.
- AC3: The heuristic reacts deterministically to at least approach, tire prep, pit strategy, selected card, forecast weather, circuit traits, and available qualifying/grid context.
- AC4: The feature changes no simulation results, no API contract, and no persisted directive shape.
- AC5: EN/FR copy is present and covered by i18n validation/tests where applicable.
- AC6: Unit tests cover representative safe, risky, and high-upside derivations; existing App/e2e plan flow tests still pass.
- AC7: npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, and npm run logics:validate pass after implementation.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_031_plan_risk_readability_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- logics/request/req_059_first_gp_action_clarity_one_recommended_cta_plan_recommendation_and_vocabulary_harmonization.md
- logics/request/req_060_result_verdict_pass_why_it_worked_why_it_failed_what_to_try_next.md
- apps/web/src/features/PlanView.tsx
- apps/web/src/features/DirectivePanel.tsx
- apps/web/src/app/raceFlow.ts
- apps/web/src/app/useRaceDerivations.ts
- apps/web/src/app/App.tsx
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- tests/e2e/private-league.spec.ts
- Roadmap 0.3.13: show a compact safe / risky / high-upside read before sending the plan, including where the setup is strong, where it can fail, and which finishing band it is trying to optimize.

# AI Context
- Summary: Plan risk readability layer
- Keywords: request-chain-scaffold, plan risk readability layer, development-ready
- Use when: You need to implement or review the scaffolded workflow for Plan risk readability layer.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_161_derive_deterministic_plan_risk_reads`
- `item_162_render_plan_risk_summary_before_commitment`
