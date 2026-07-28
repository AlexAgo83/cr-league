## item_329_add_contextual_card_guidance_in_plan_and_garage - Add contextual card guidance in Plan and Garage
> From version: 0.5.2
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 96
> Progress: 100%
> Complexity: Medium
> Theme: Card readability
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Owner: codex

# Problem
- Players need to understand why a card is useful, neutral, or risky for the next race.
- The guidance should reduce opacity without replacing player judgment.
- Card advice must stay aligned with existing card effects and circuit/weather data.
- Owner decision: use exactly three French guidance labels first, `Utile ici`, `Situationnel`, and `Impact faible`; do not use "best card" language, full rankings, numeric scores, or hidden scoring explanations.
- Existing UI already has a card affinity concept (`card_fit_recommended`, shown in French as "Affinité haute"), so 0.6 guidance must reuse or replace it deliberately.

# Scope
- In:
  - Classify owned and purchasable cards against the next GP as `Utile ici`, `Situationnel`, or `Impact faible`.
  - Explain the classification with one short reason tied to circuit, weather, setup, position, or economy.
  - Reconcile the new labels with the existing affinity UI: either map "Affinité haute" to `Utile ici` or replace the old badge in the same UI pass.
  - Prefer simple per-card deterministic rules over an opaque global scoring model.
  - Show guidance in the Garage and where the player chooses a plan/card.
  - Keep the model deterministic and covered by tests.
- Out:
  - Auto-selecting cards.
  - Changing card effects as part of the guidance work.
  - Adding a new recommendation service or telemetry system.

# Acceptance criteria
- AC1: Each card visible to the player can display a contextual guidance label for the next GP.
- AC2: Guidance reuses or replaces the existing affinity badge so the player never sees two competing recommendation systems for the same card.
- AC3: Guidance avoids "best card" wording and never auto-picks or auto-submits a card.
- AC4: Guidance exposes `Utile ici`, `Situationnel`, and `Impact faible` labels with short reasons without presenting a full ordered ranking or numeric score.
- AC5: Tests cover weather cards, position/delta cards, economy cards, and no-card/low-impact cases.
- AC6: Browser playtest confirms card guidance is visible without layout overflow.

# AC Traceability
- request-AC7 -> This backlog slice. Proof: AC1: Each card visible to the player can display a contextual guidance label for the next GP.
- request-AC13 -> This backlog slice. Proof: AC6: Browser playtest confirms card guidance is visible without layout overflow.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed
- 2026-07-28 delivery: replaced visible card affinity copy with the three contextual labels Useful here, Situational, and Low impact / Utile ici, Situationnel, Impact faible. Guidance reuses cardFit, adds one short deterministic reason, and is shown in Plan card choice, Garage inventory/shop, and card modals without auto-pick or ranking copy.

# Links
- Product brief(s): `prod_081_0_6_beta_season_lifecycle_and_league_management_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_129_0_6_beta_season_lifecycle_and_league_management_private_seasons_commissioner_tools_actionability_rivals_team_identity_and_optional_economy_variants`
- Primary task(s): `task_130_orchestrate_the_0_6_beta_season_lifecycle_and_league_management_corpus`

# AI Context
- Summary: Add contextual card guidance in Plan and Garage
- Keywords: scaffolded-backlog, add contextual card guidance in plan and garage, implementation-ready
- Use when: Implementing the scaffolded slice for Add contextual card guidance in Plan and Garage.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Validation
- 2026-07-28 validation: targeted vitest helpers and DirectivePanel passed (33 tests); npm run typecheck passed; browser playtest rounds 2 passed with contextual card guidance scenario and UX PASS, 0 axe violations, no mobile body overflow, evidence in reports/playtest/card-guidance-browser.md and reports/ux/card-guidance-browser.md.
