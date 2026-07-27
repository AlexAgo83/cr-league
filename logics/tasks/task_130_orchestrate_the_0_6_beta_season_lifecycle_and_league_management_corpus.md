## task_130_orchestrate_the_0_6_beta_season_lifecycle_and_league_management_corpus - Orchestrate the 0.6 beta season lifecycle and league management corpus
> From version: 0.5.2
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 92%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Non-semantic edit: Added execution-risk order and open-question approaches from owner follow-up; no status or implementation scope change.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Confirm the final 0.6 scope from the product brief and keep deferred ideas out of implementation unless explicitly pulled in.
- [ ] 2. Implement the beta season lifecycle core before optional flavor items: `Quick beta` 3 GP, `Standard season` 6 GP default, no auto-resolve, visible absent-player defaults, card/credit reset on season rollover.
- [ ] 3. Add commissioner management, share controls, and one-reminder-per-season manual email reminders while preserving creator-only API access.
- [ ] 4. Close the accessibility gate without redesigning the app.
- [ ] 5. Improve race feedback, rival context, and contextual card guidance using deterministic data.
- [ ] 6. Add lightweight team profiles and evaluate whether season economy continuity and variable shop mode should ship in this corpus or be deferred after design proof.
- [ ] 7. Prototype the deterministic race-engineer assistant only if the core beta flow plus card guidance remain insufficient after observation.
- [ ] 8. Update roadmap/deferred decisions, run relevant tests and browser evidence, run npm run logics:validate, and commit.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Execution Risk Order
- Must ship first: `item_324` season lifecycle core, `item_325` commissioner management/manual reminders, and `item_326` accessibility gate.
- Should ship next if the core remains stable: `item_327` action feedback, `item_328` rival thread, and `item_329` contextual card guidance.
- Ship only after design proof or explicit pull-in: `item_330` team profiles, `item_331` optional variable shop, `item_332` season economy continuity, and `item_333` deterministic race-engineer recommendations.
- Guardrail: `item_334` should stay visible throughout the task so deferred ideas do not leak into the implementation wave.

# Open Questions and Proposed Approaches
- Scope size: this corpus is intentionally broad. Keep commits wave-sized and close each item with proof before taking optional slices.
- Presets: ship only `Quick beta` (3 GP) and `Standard season` (6 GP, default); no custom length yet.
- GP resolution: do not auto-resolve; expose normal commissioner resolve when all plans are ready and resolve-with-defaults when absent players remain.
- Absents: show default plans before resolution and mark default-plan use in the report.
- Season economy: preserve players, palmares, archived stats, and cosmetic/team identity; reset cards and credits in the first pass; defer capped credit carry-over unless beta says reset is too dry.
- Manual reminders: route through one owner-only API mutation, target pending human players only, return sent/skipped counts, and enforce a one-send-per-season cap in the API only after at least one email is sent.
- Commissioner authority: authorize in API transactions, not only in UI visibility.
- Accessibility: make local, testable repairs; do not redesign except contrast.
- Rival: derive from nearest meaningful standings proximity, human or bot; use no-rival fallback for first race or ambiguous data.
- Card guidance: use `Useful here`, `Situational`, and `Low impact`; avoid "best card" language and never auto-pick.
- Variable shop: default off, creation-time option, deterministic 6-card GP rotation, fixed shop remains baseline.
- Team profile: build an in-league profile from existing team/profile/stat data first; defer uploads, public internet pages, and large cosmetic systems.
- Race engineer: defer until card guidance is observed; if pulled in, use deterministic `Safe points`, `Attack`, and `Weather read` profiles, no auto-submit, no generative dependency.
- Deferred modes: keep objectives, arcade solo, quick play, onboarding rewrite, compact replay, automatic reminders, polling/SSE, and 1.0 hardening out unless scope changes.

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
- Summary: Orchestrate the 0.6 beta season lifecycle and league management corpus
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_129_0_6_beta_season_lifecycle_and_league_management_private_seasons_commissioner_tools_actionability_rivals_team_identity_and_optional_economy_variants`
- Product brief(s): `prod_081_0_6_beta_season_lifecycle_and_league_management_product_brief`
- Architecture decision(s): (none yet)
