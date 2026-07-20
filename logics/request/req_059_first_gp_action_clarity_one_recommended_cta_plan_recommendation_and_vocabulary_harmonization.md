## req_059_first_gp_action_clarity_one_recommended_cta_plan_recommendation_and_vocabulary_harmonization - First-GP action clarity: one recommended CTA, plan recommendation, and vocabulary harmonization
> From version: 0.3.11
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Complexity: Low
> Theme: First-session UX
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make the chrono CTA the single recommended action at the start of a Grand Prix: when the player has no plan and no qualifying attempt yet, only the New chrono button pulses; Edit plan and Send plan become recommended only after a first chrono exists.
- Add one compact circuit/weather recommendation line to the plan screen, derived from the circuit traits and the strongest forecast, so a first-time player knows what the track rewards before locking a plan.
- Harmonize the first-session vocabulary across EN and FR so league, championship, plan, chrono, and launch labels do not compete: align the EN chrono CTA with 'New chrono', keep FR consistent, and make rail, subscreen, and action labels use one term per concept.

# Context
- The prepare-state CTA cluster lives in App.tsx (race-phase-actions): Edit plan, New lap time (action_qualifying, onClick openQualifyingRun), Review lap time, and the primary Send plan command. The highlight-command class pulses on Edit plan when editPlanCommandClicked is false and on New lap time when qualifyingCommandClicked is false and qualifyingAttemptsUsed is 0, so both pulse at once on a fresh GP.
- The command-clicked booleans in App.tsx are being collapsed into a single structure by the pass-5 decomposition (req_058 item_137); this feature should build the new recommendation rule on whatever structure lands first and must not fork the logic. If req_058 has not shipped when this starts, apply the rule to the existing booleans and let the decomposition absorb it.
- PlanView receives circuitTraits ({grip, overtaking, energy}) but no weather; the strongest forecast is already computed in App.tsx as forecastPick via strongestForecast(leagueState.currentGrandPrix.forecast) with a circuit.likelyWeather fallback in CircuitMap. The chrono report already has a suggestion system (buildChronoReport / chronoReportSuggestion in raceFlow.ts, rendered in PlanView) including a weather-aware string, which is the pattern to mirror for the plan recommendation.
- Circuit trait labels and hints exist in i18n (circuit_grip/circuit_overtaking/circuit_energy with hint variants); weather labels exist as weather_dry/weather_light_rain/weather_heavy_rain. The recommendation line should compose from the dominant trait and the forecast, not introduce a new data model.
- Vocabulary today (EN): action_qualifying is 'New lap time' while FR is 'Nouveau chrono' and the playtest checklist plus the roadmap say 'New chrono'; the plan concept appears as rail_plan 'Plan', plan_subscreen_plan 'Plan', map_plan_config_title 'Current plan', action_submit_directive 'Send plan', action_edit_plan 'Edit plan', action_view_plan 'View plan'; the chrono concept splits across action_qualifying, action_qualifying_history 'Review lap time', action_launch_qualifying 'Run lap time', plan_subscreen_chrono 'Chrono report'; launch appears in action_launch_grand_prix 'Launch GP' and command_hint_prepare 'move into launch'.
- Behavior is pinned by App.test.tsx (exact race-phase-actions text including button order and labels, highlight-command toggling per CTA) and by the e2e spec (highlight lifecycle and the highlight-command-pulse animation); the i18n parity test fails if EN and FR keys diverge. Label changes must update these tests and the playtest checklist doc together.
- Only the recommendation rule and labels change: the desk phase machine (prepare/ready/resolved), the primary-command mapping, and the qualifying flow itself stay untouched.

# Acceptance criteria
- AC1: On a fresh Grand Prix with no submitted plan and zero qualifying attempts, exactly one CTA carries highlight-command: the New chrono button; after the first chrono attempt exists, the plan CTAs become the recommended path as today.
- AC2: The plan screen shows one compact recommendation line composed from the dominant circuit trait and the strongest forecast, present in EN and FR, and it does not duplicate the chrono report suggestion.
- AC3: The EN chrono CTA reads 'New chrono' and the league/championship/plan/chrono/launch vocabulary uses one term per concept across rail, subscreen, action, and hint keys in both locales, with the i18n parity test passing.
- AC4: App.test.tsx, the e2e highlight assertions, and the playtest checklist are updated to the new single-recommendation behavior and labels, and npm run typecheck, npm test, npm run build, npm run lint, and npm run test:e2e pass.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_023_first_gp_action_clarity_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- logics/request/req_047_polish_first_session_ux_after_playtest_findings.md
- docs/playtest/private-league-3gp-checklist.md
- apps/web/src/app/App.tsx
- apps/web/src/features/PlanView.tsx
- apps/web/src/features/CircuitMap.tsx
- apps/web/src/app/raceFlow.ts
- apps/web/src/app/circuits.ts
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- apps/web/src/app/App.test.tsx
- tests/e2e/private-league.spec.ts
- Roadmap patch 0.3.16, added 2026-07-20 from AI/player playtest findings: at the start of a GP the prepare-state cluster highlights Edit plan and New lap time simultaneously (App.tsx renders highlight-command on both when neither was clicked), the plan screen receives circuit traits but no weather forecast and offers no compact recommendation, and the first-session vocabulary competes: the chrono CTA is 'New lap time' in EN but 'Nouveau chrono' in FR while the roadmap and playtest checklist both say 'New chrono', and league/championship/plan/chrono/launch labels overlap across rail, subscreen, and action keys.

# AI Context
- Summary: First-GP action clarity: one recommended CTA, plan recommendation, and vocabulary harmonization
- Keywords: request-chain-scaffold, first-gp action clarity: one recommended cta, plan recommendation, and vocabulary harmonization, development-ready
- Use when: You need to implement or review the scaffolded workflow for First-GP action clarity: one recommended CTA, plan recommendation, and vocabulary harmonization.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_141_single_recommended_cta_at_grand_prix_start`
- `item_142_compact_circuit_and_weather_recommendation_on_the_plan_screen`
- `item_143_harmonize_first_session_vocabulary_in_en_and_fr`
