## req_078_expose_card_trigger_conditions_and_relative_strength_in_plan_and_garage - Expose card trigger conditions and relative strength in plan and garage
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Race legibility
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.
> Non-semantic edit: 2026-07-21 repointed audit/playtest evidence references to tracked docs/audits copies.

# Needs
- Show, for every card, the exact condition under which its main effect triggers (race segment, weather requirement, or proximity threshold) in objective rule language.
- Show the relative strength of each card effect as a calibrated band (weak / medium / strong) plus its downside, derived from the card's real coded magnitude, without displaying raw numbers.
- Drive these labels from a single shared source of truth colocated with the card effects so the displayed condition and strength cannot drift from the simulation.
- Keep the presentation objective and never phrase it as a recommendation, a best card, or a best setting.
- Support EN/FR copy and keep the card UI compact; keep condition and strength legible without relying on color alone.
- Change no simulation behavior, no card magnitude, no economy, and add no new dependency.

# Context
- apps/web is a Vite React workspace with a small dependency set and plain CSS custom properties (ADR-005); ADR-006 requires that meaning is not conveyed by color alone.
- Card metadata today is split: prose promise and family in packages/shared cards/definitions.ts, direction-only badges in CardStatBadges.tsx, prices in economy/constants.ts, and the actual magnitudes and trigger conditions inline in simulateRace.ts.
- The design pillars (Decisions_Log) require objective information and preserved uncertainty: the game explains rules and consequences but never recommends a card, setting, or strategy.
- This is a readability change with no model change; it is a post-0.3 gameplay/legibility carry-over, not part of the 0.4 performance theme, and it does not depend on the 0.5 economy/card-depth evidence gate because it exposes existing rules rather than rebalancing them.

# Acceptance criteria
- AC1: Each card surfaces its trigger condition in objective terms (segment and/or weather and/or proximity threshold) wherever the card is inspected in plan and garage.
- AC2: Each card surfaces a relative strength band (weak / medium / strong) for its main effect and names its downside, without any raw numeric magnitude shown to the player.
- AC3: The condition and strength band are derived from a single shared descriptor colocated with the card effects in packages/shared, so UI labels and simulation behavior share one source; a unit test asserts every card has a descriptor consistent with its coded effect.
- AC4: No copy phrases any card as best, recommended, optimal, or as a suggested strategy; wording stays descriptive of the rule only.
- AC5: Condition and strength are legible without relying on color alone (ADR-006), with EN/FR copy present.
- AC6: No simulation behavior, card magnitude, price, or economy value changes.
- AC7: npm run typecheck, npm test, npm run build, npm run lint, and npm run logics:validate pass after implementation.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_042_race_legibility_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/architecture/adr_005_theme_design_system.md
- logics/architecture/adr_006_accessibility.md
- docs/audits/AUDIT_CR_LEAGUE.md
- packages/shared/src/cards/definitions.ts
- packages/shared/src/simulation/simulateRace.ts
- apps/web/src/features/CardStatBadges.tsx
- apps/web/src/features/GarageView.tsx
- apps/web/src/features/PlanView.tsx
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- Current diagnostic: card effects live as hardcoded magnitudes in simulateRace.ts applyDecision (lines 498-572) and maybeAddCardEvent (lines 709-811); e.g. rain_grip pays +26 score / +18 position if the mid segment is not dry and -4 / -2 otherwise, calculated_attack pays +24 only when the car ahead is within 3.0s.
- Current diagnostic: the player never sees these magnitudes or trigger conditions; the UI shows only direction-only badges (CardStatBadges.tsx:101-121, e.g. '+ Grip', '- Att.') plus one info tag and a prose promise in definitions.ts (e.g. 'Pays off if rain appears around mid-race').
- Product decision (audit TICKET-01): reveal each card's exact trigger condition (segment, weather requirement, proximity threshold) and a relative strength band (weak / medium / strong) and its downside, but NOT raw numeric magnitudes, to preserve uncertainty and the 'explain the rules, never the solution' pillar.

# AI Context
- Summary: Expose card trigger conditions and relative strength in plan and garage
- Keywords: request-chain-scaffold, expose card trigger conditions and relative strength in plan and garage, development-ready
- Use when: You need to implement or review the scaffolded workflow for Expose card trigger conditions and relative strength in plan and garage.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_176_add_a_shared_card_descriptor_condition_strength_band_and_surface_it_in_card_ui`
