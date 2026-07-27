## req_129_0_6_beta_season_lifecycle_and_league_management_private_seasons_commissioner_tools_actionability_rivals_team_identity_and_optional_economy_variants - 0.6 beta season lifecycle and league management: private seasons, commissioner tools, actionability, rivals, team identity, and optional economy variants
> From version: 0.5.2
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 88%
> Complexity: High
> Theme: 0.6 beta season lifecycle
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Open the first 0.6 corpus now that the AI alpha seasons evidence cleared the pre-0.6 gate.
- Make private beta seasons playable and administrable without relying on operator intervention outside the app.
- Keep the next wave focused on the current visual identity: only accessibility and contrast fixes may affect visuals.
- Turn race outcomes, rival pressure, and card choices into clearer next actions without adding mandatory objectives or an automatic AI player.
- Explore team identity, optional shop variety, and light season-economy continuity in bounded slices that can be shipped or deferred independently.

# Context
- The user explicitly approved the 0.6 lifecycle direction, commissioner-style league management, manual reminders, actionable race feedback, a clear rival concept, contextual card guidance, team profile personalization, optional variable shop mode, and an immersive race-engineer assistant concept.
- The user explicitly rejected automatic mail reminders, replay compact/highlight changes for now, public matchmaking for now, and mandatory secondary objectives for the first 0.6 pass.
- The user clarified that manual email reminders should be limited to one send per season for the first implementation.
- The alpha decision package found no stability blocker but identified accessibility debt and profile dominance monitoring as 0.6 gates.
- Existing product specs already mention rivals, league cadence, reports, profiles, and responsive UX; this corpus should reuse those concepts rather than inventing a new game layer.
- This request is intentionally broad, but each backlog item must stay independently shippable and should not require delivering every exploratory idea before the beta-season lifecycle is useful.

# Acceptance criteria
- AC1: Private beta season lifecycle supports clear season presets, a full multi-GP loop, season completion, and a restart/next-season path without manual database work.
- AC2: The league creator has a commissioner management screen that shows player readiness, pending plans, invite/share affordances, and controlled resolve/reminder actions.
- AC3: Reminder email behavior is manual, commissioner-triggered, and initially capped to one reminder send per season; there are no automatic scheduled reminders, notification daemons, or polling/SSE scope in this corpus.
- AC4: Accessibility fixes address the alpha-reported issues without a visual redesign, except for contrast changes needed to pass the gate.
- AC5: Race reports and next-GP surfaces produce more actionable advice using deterministic race/circuit/card data.
- AC6: Rival selection or derivation creates a visible, non-mandatory rivalry thread in standings, pre-race context, and race reports.
- AC7: Card guidance explains which owned or purchasable cards are useful, neutral, or risky for the next race without choosing automatically for the player.
- AC8: Team identity work adds a lightweight in-league public team profile and basic customization using existing profile/team data before deeper cosmetics.
- AC9: Variable shop mode is available only as a league-creation option, defaults off, is visible to players, and remains deterministic/testable.
- AC10: Light season-economy continuity is either implemented with explicit caps and anti-snowball rules or deferred with a documented decision; broad card-economy expansion remains out of scope.
- AC11: The race-engineer assistant concept is framed as deterministic profile recommendations and explanation, not generative autopilot; any implementation remains optional and reversible.
- AC12: Deferred ideas are explicitly recorded: optional secondary objectives, onboarding/tutorial rewrite, compact replay/highlights, arcade solo, quick play matchmaking, automatic reminders, polling/SSE, and 1.0 hardening.
- AC13: Validation includes npm run logics:validate plus the relevant local gates for touched surfaces; browser UX evidence must be regenerated if UI flow or accessibility changes are made.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_081_0_6_beta_season_lifecycle_and_league_management_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- docs/audits/ai-alpha-seasons-decision-2026-07-27.md
- logics/specs/spec_001_grand_prix_core_loop_and_simulation_v1.md
- logics/specs/spec_004_race_report_and_replay_ux.md
- logics/specs/spec_006_league_cadence_and_absence_rules.md
- logics/specs/spec_010_data_model_and_api_contract_v0.md
- logics/specs/spec_013_product_critique_and_gameplay_refinements.md
- logics/specs/spec_015_device_targets_and_responsive_ux.md
- logics/specs/spec_016_implementation_roadmap.md
- docs/beta-known-limits.md
- docs/beta-support-runbook.md
- docs/runtime-configuration.md
- docs/playtest/private-league-3gp-checklist.md
- scripts/browser-playtest.ts
- scripts/browser-fun-score.ts
- scripts/replayability-analytics.ts
- scripts/balance-simulations.ts
- reports/playtest/alpha-seasons/ artifacts are generated locally and summarized in docs/audits/ai-alpha-seasons-decision-2026-07-27.md.

# AI Context
- Summary: 0.6 beta season lifecycle and league management: private seasons, commissioner tools, actionability, rivals, team identity, and optional economy variants
- Keywords: request-chain-scaffold, 0.6 beta season lifecycle and league management: private seasons, commissioner tools, actionability, rivals, team identity, and optional economy variants, development-ready
- Use when: You need to implement or review the scaffolded workflow for 0.6 beta season lifecycle and league management: private seasons, commissioner tools, actionability, rivals, team identity, and optional economy variants.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_324_build_the_beta_season_lifecycle_core`
- `item_325_add_commissioner_league_management_with_manual_reminders_and_share_controls`
- `item_326_close_the_beta_accessibility_gate_without_redesigning_the_app`
- `item_327_make_post_race_feedback_more_actionable_and_connect_it_to_the_next_grand_prix`
- `item_328_introduce_a_non_mandatory_rival_thread_across_standings_and_reports`
- `item_329_add_contextual_card_guidance_in_plan_and_garage`
- `item_330_add_lightweight_team_identity_and_public_in_league_team_profiles`
- `item_331_add_an_optional_variable_shop_mode_at_league_creation`
- `item_332_define_the_lightweight_season_economy_continuity_rule`
- `item_333_prototype_deterministic_race_engineer_profile_recommendations`
- `item_334_record_deferred_modes_and_non_goals_so_0_6_stays_focused`
