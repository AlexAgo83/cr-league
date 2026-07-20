## item_142_compact_circuit_and_weather_recommendation_on_the_plan_screen - Compact circuit and weather recommendation on the plan screen
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Progress: 100%
> Complexity: Low
> Theme: First-session UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- PlanView receives circuit traits but no forecast and offers no guidance, so first-time players lock plans without reading what the track rewards.
- The trait hints exist only on the desk map panel, not where the plan decision is made.

# Scope
- In:
  - Pass the strongest forecast (already computed as forecastPick in App.tsx) into PlanView.
  - Add one recommendation line composed from the dominant trait (grip/overtaking/energy) and the forecast, mirroring the chronoReportSuggestion pattern in raceFlow.ts as a pure helper with unit tests.
  - Add the EN and FR strings with the existing interpolation style; keep the line to a single sentence.
  - Render it once on the plan subscreen, visually consistent with the existing chrono suggestion block.
- Out:
  - Weather probability displays or forecast redesign.
  - Per-card or per-approach recommendations (roadmap 0.3.13 risk/readability layer).

# Acceptance criteria
- AC1: The plan subscreen shows one trait+weather recommendation sentence in both locales.
- AC2: The composing helper is pure and unit-tested across trait dominance and all three weather values.
- AC3: The chrono report suggestion is not duplicated or displaced.

# Implementation Notes
- 2026-07-20 wave 2: added `buildPlanRecommendation()` in `raceFlow.ts`, deriving the strongest circuit stat and normalized forecast into one localized recommendation sentence.
- `GameViews` now passes `forecastPick` to `PlanView`; `PlanView` builds the sentence and `DirectivePanel` renders it once in the directive briefing header, leaving the chrono report panel untouched.
- Added EN/FR recommendation keys for the wrapper sentence, each dominant stat, and dry/light-rain/heavy-rain forecast advice.

# Validation
- 2026-07-20 targeted: `rtk npm run typecheck`; `rtk npm run lint`; `rtk npm test -- apps/web/src/app/raceFlow.test.ts apps/web/src/app/App.test.tsx apps/web/src/i18n/index.test.ts`.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: The plan subscreen shows one trait+weather recommendation sentence in both locales.
- request-AC4 -> This backlog slice. Proof: AC2: The composing helper is pure and unit-tested across trait dominance and all three weather values.
- request-AC3 -> This backlog slice. Evidence needed: The EN chrono CTA reads 'New chrono' and the league/championship/plan/chrono/launch vocabulary uses one term per concept across rail, subscreen, action, and hint keys in both locales, with the i18n parity test passing.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_023_first_gp_action_clarity_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_059_first_gp_action_clarity_one_recommended_cta_plan_recommendation_and_vocabulary_harmonization`
- Primary task(s): `task_060_orchestrate_first_gp_action_clarity`

# AI Context
- Summary: Compact circuit and weather recommendation on the plan screen
- Keywords: scaffolded-backlog, compact circuit and weather recommendation on the plan screen, implementation-ready
- Use when: Implementing the scaffolded slice for Compact circuit and weather recommendation on the plan screen.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_060_orchestrate_first_gp_action_clarity`

# Notes
- Task `task_060_orchestrate_first_gp_action_clarity` was finished via `logics-manager flow finish task` on 2026-07-20.
