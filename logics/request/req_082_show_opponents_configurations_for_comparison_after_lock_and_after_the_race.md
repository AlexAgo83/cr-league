## req_082_show_opponents_configurations_for_comparison_after_lock_and_after_the_race - Show opponents' configurations for comparison after lock and after the race
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 88
> Complexity: High
> Theme: Competitive comparison
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.
> Non-semantic edit: 2026-07-21 repointed audit/playtest evidence references to tracked docs/audits copies.

# Needs
- Let a player see opponents' configurations (approach, preparation, pit strategy, card, and result) in a readable side-by-side comparison.
- Reveal opponent configurations only after the player's own plan is locked and after the race, never before lock, to preserve pre-race uncertainty.
- Keep the reveal an objective information display, never a recommendation, ranking of best setup, or suggested counter-strategy.
- Enforce the reveal rules at the API trust boundary so the client cannot obtain opponent plans earlier than allowed (ADR-004).
- Support EN/FR copy, keep it compact, and do not rely on color alone (ADR-006).
- Change no simulation behavior and add no new dependency.

# Context
- Today opponent setups are only abstract dot markers; the audit identifies this as the single clean unplanned gap and the most requested feature from the user review.
- This is a comparison and legibility feature rather than an economy rebalance, so it is not blocked by the 0.5 economy evidence gate, but it is a larger feature touching data exposure and the API trust boundary.
- The design pillars value comparison and objective information while forbidding recommendations and preserving uncertainty, so reveal timing is the key constraint.
- The decision data (approach, preparation, pit, card, classification) already exists server-side and is used post-race by recapPlanRead.

# Acceptance criteria
- AC1: After the player's plan is locked and after the race, the player can view each opponent's approach, preparation, pit strategy, card, and result in a readable comparison view.
- AC2: Opponent configurations are not obtainable before the player's own plan is locked; the API enforces this and does not return opponent plans earlier than allowed.
- AC3: The comparison is purely descriptive; no copy recommends, ranks as best, or suggests a counter-setup.
- AC4: The comparison is legible without color alone (ADR-006) and has EN/FR copy.
- AC5: No simulation behavior changes; the feature reads existing decision and classification data.
- AC6: Unit tests cover the reveal-timing rule (allowed after lock/after race, blocked before) and the view model; existing report/replay/qualifying flows still pass.
- AC7: npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, and npm run logics:validate pass after implementation.

# Delivery notes
- Public league state no longer exposes opponent decisions; player-scoped responses reveal opponents only after the player's plan is locked or the race is resolved.
- A dedicated opponent-config endpoint enforces the reveal rule and returns descriptive rows.
- The web comparison is reachable after lock on Drive and after the race in Report, with EN/FR copy and no recommendation framing.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_046_opponent_configuration_comparison_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/architecture/adr_004_data_security.md
- logics/architecture/adr_006_accessibility.md
- docs/audits/AUDIT_CR_LEAGUE.md
- apps/web/src/app/DriveView.tsx
- apps/web/src/features/replay/ReplayTower.tsx
- apps/web/src/features/ReportView.tsx
- apps/web/src/features/ResultView.tsx
- apps/web/src/app/helpers.ts
- apps/api/src/features/leagues
- apps/web/src/i18n/en.json
- apps/web/src/i18n/fr.json
- Current diagnostic: opponents' configurations are shown only as abstract dot markers (approach/prep/pit plus a card dot) in the qualifying leaderboard (DriveView ChronoPlanAsset) and replay tower (ReplayTower ReplayPlanAsset); they are never shown numerically or side by side.
- Current diagnostic: the only textual opponent comparison is the winner's setup in the report via recapPlanRead (helpers.ts:346-381); there is no field-wide config comparison.
- Product decision (audit TICKET-06): let the player compare opponents' configurations objectively, revealed only after the player's plan is locked and after the race, never before lock, to preserve pre-race uncertainty; the API decides what is revealed and when (ADR-004).

# AI Context
- Summary: Show opponents' configurations for comparison after lock and after the race
- Keywords: request-chain-scaffold, show opponents' configurations for comparison after lock and after the race, development-ready
- Use when: You need to implement or review the scaffolded workflow for Show opponents' configurations for comparison after lock and after the race.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_180_add_api_gated_opponent_config_reveal_and_a_comparison_view`
