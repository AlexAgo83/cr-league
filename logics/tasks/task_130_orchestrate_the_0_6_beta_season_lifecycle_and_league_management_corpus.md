## task_130_orchestrate_the_0_6_beta_season_lifecycle_and_league_management_corpus - Orchestrate the 0.6 beta season lifecycle and league management corpus
> From version: 0.5.2
> Schema version: 1.0
> Status: In Progress
> Understanding: 92
> Confidence: 94
> Progress: 82%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Non-semantic edit: Added execution-risk order and open-question approaches from owner follow-up; no status or implementation scope change.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Confirm the final 0.6 scope from the product brief and keep deferred ideas out of implementation unless explicitly pulled in.
- [x] 2. Implement the beta season lifecycle core before optional flavor items: `Quick beta` 3 GP, `Standard season` 6 GP default, no auto-resolve, neutral absent-player defaults, explicit next-season action, card/credit reset on season rollover.
- [x] 3. Add commissioner management, share controls, and one-reminder-per-season manual email reminders with minimal audit fields while preserving creator-only API access.
- [x] 4. Close the accessibility gate without redesigning the app.
- [x] 5. Improve race feedback, rival context, and contextual card guidance using deterministic data.
- [x] 6. Add lightweight team profiles and evaluate whether season economy continuity and variable shop mode should ship in this corpus or be deferred after design proof.
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
- Suggested wave commits: wave 1 closes lifecycle, commissioner, reminders, and accessibility; wave 2 closes feedback, rival, and card guidance; wave 3 closes profile, variable shop, and rollover rules only if still small.

# Open Questions and Proposed Approaches
- Scope size: this corpus is intentionally broad. Keep commits wave-sized and close each item with proof before taking optional slices.
- Presets: ship only `Quick beta` (3 GP) and `Standard season` (6 GP, default); no custom length yet.
- GP resolution: do not auto-resolve; expose normal commissioner resolve when all plans are ready and resolve-with-defaults when absent players remain.
- Absents: show one neutral default plan before resolution and mark default-plan use in the report. Use balanced setup, no card, and medium strategy.
- Season economy: preserve players, palmares, archived stats, and cosmetic/team identity; reset cards and credits in the first pass; defer capped credit carry-over unless beta says reset is too dry.
- Manual reminders: route through one owner-only API mutation, target pending human players only, return sent/skipped counts, store `reminderSentAt`, `reminderSentBy`, `reminderSeasonNumber`, `sentCount`, and `skippedCount`, and enforce a one-send-per-season cap in the API only after at least one email is sent.
- Commissioner authority: authorize in API transactions, not only in UI visibility. Commissioner means league creator only for 0.6.
- Commissioner UX: expose a creator-only `Direction de course` entry inside the existing league context. Build a polished game-native management surface, not a generic SaaS table. Current GP state, readiness groups, invite/share, `Relancer les retardataires`, and resolve actions should be visually organized around race operations. On mobile, use stacked sections unless an existing sticky action pattern is already available.
- Accessibility: make local, testable repairs; do not redesign except contrast.
- Rival: derive from nearest meaningful standings proximity, human or bot; use no-rival fallback for first race or ambiguous data; tie-break equal candidates by standings proximity, points gap, then stable team id.
- Card guidance: use `Utile ici`, `Situationnel`, and `Impact faible`; replace or map the existing `card_fit_recommended` / "Affinité haute" signal so the UI has one coherent advice system; avoid "best card" language, full rankings, hidden scoring explanations, numeric scores, and auto-pick.
- Variable shop: default off, advanced creation-time option labeled `Boutique variable à chaque GP`, deterministic frozen 6-card GP rotation, fixed shop remains baseline.
- Team profile: build an in-league profile from existing team/profile/stat data first, opened from standings and player/team cards; only expose safe existing name and livery/color edits; defer uploads, public internet pages, bios, and large cosmetic systems.
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
- 2026-07-28 validation: npm run logics:validate passed. logics-manager lint --require-status passed. logics-manager audit --group-by-doc passed with expected request AC traceability warnings because item_327 through item_333 remain open and the linked orchestration task is not Done.
- 2026-07-28 item_327 visual follow-up: report header classification wrapping was fixed by scoping report-podium text styles to direct children and keeping reward values inline. Browser UX evidence regenerated at reports/ux/report-next-action-browser/04-round-1-report-desktop.png and reports/ux/report-next-action-browser/04-round-1-report-mobile.png; both show the Next action card and compact header classification.

# Report
- 2026-07-27 handoff: first wave was partially delivered and committed. Season presets, no-auto-resolve/default-plan backend guard, next-season rollover reset, `Direction de course`, manual one-successful-reminder-per-season API/mail path, accessibility gate, and several UX papercuts were already in code.
- 2026-07-27 continuation: closed `item_324` and `item_325` by adding visible absent-human default-plan confirmation, default-plan report badges, reminder sent/skipped feedback, reminder locked-state coverage, and regenerated `Direction de course` desktop/mobile evidence.
- Evidence: `rtk npm run typecheck`; `rtk npm test -- --run apps/web/src/app/App.test.tsx apps/web/src/features/ReportView.test.tsx`; screenshots at `reports/ux/manual-review/race-direction-desktop.png` and `reports/ux/manual-review/race-direction-mobile.png`.
- Next wave: start `item_327`, `item_328`, and `item_329`; keep optional slices deferred unless pulled in explicitly.
- 2026-07-28 corpus closeout: intentionally kept item_327, item_328, item_329, item_330, item_331, item_332, and item_333 open as implementation-ready follow-up slices rather than marking unshipped work Done. Deferred-mode guardrail item_334 records reopen triggers for optional secondary objectives, arcade solo, quick play matchmaking, onboarding/tutorial rewrite, compact replay/highlights, automatic reminders, polling/SSE, bot replacement, and 1.0 hardening.
- 2026-07-28 item_327 delivered: race reports now expose a deterministic Next action card with a primary race reason, next-GP attempt guidance, and a card/setup hint. The recommendation uses race result, played-card trigger/miss, existing rival decision when present, and next circuit/weather context without adding auto-pick or generative advice.
- 2026-07-28 item_328 delivered: derived rival context now threads through standings, Plan pre-race guidance, and report action reasoning, with no mandatory rival selection and no first-race rival before meaningful points exist.
- 2026-07-28 item_329 delivered: contextual card guidance now replaces the old affinity labels across Plan and Garage, with deterministic reasons tied to weather, circuit traits, position pressure, chrono timing, and economy tradeoffs. Browser UX evidence covers Plan and Garage after fixing card-cell overlap and Plan ellipsis.
- 2026-07-28 item_330 delivered: standings rows now open an in-league team profile modal with livery identity, rank, points, credits, GP count, podiums, palmares count, recent form, current rival, and derived style. Tests cover profile rendering and unsafe team-name text rendering. Browser UX evidence covers mobile standings and team profile with zero axe violations at `reports/ux/team-profile-browser.md`; Palmarès mobile text alignment is scoped in CSS for completed-season rows.
- 2026-07-28 profile/garage follow-up: mobile standings and Palmarès livery plates now reserve enough room for title stars, and Garage inventory/shop card order uses availability first, then deterministic utility score. Locked inventory cards fade and move after usable cards.

# AI Context
- Summary: Orchestrate the 0.6 beta season lifecycle and league management corpus
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_129_0_6_beta_season_lifecycle_and_league_management_private_seasons_commissioner_tools_actionability_rivals_team_identity_and_optional_economy_variants`
- Product brief(s): `prod_081_0_6_beta_season_lifecycle_and_league_management_product_brief`
- Architecture decision(s): (none yet)
