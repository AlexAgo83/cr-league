## task_130_orchestrate_the_0_6_beta_season_lifecycle_and_league_management_corpus - Orchestrate the 0.6 beta season lifecycle and league management corpus
> From version: 0.5.2
> Schema version: 1.0
> Status: Done
> Understanding: 92
> Confidence: 94
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Non-semantic edit: Added execution-risk order and open-question approaches from owner follow-up; no status or implementation scope change.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Confirm the final 0.6 scope from the product brief and keep deferred ideas out of implementation unless explicitly pulled in.
- [x] 2. Implement the beta season lifecycle core before optional flavor items: `Quick beta` 3 GP, `Standard season` 6 GP default, no auto-resolve, neutral absent-player defaults, explicit next-season action, point reset on season rollover while credits and garage cards persist.
- [x] 3. Add commissioner management, share controls, and one-reminder-per-season manual email reminders with minimal audit fields while preserving creator-only API access.
- [x] 4. Close the accessibility gate without redesigning the app.
- [x] 5. Improve race feedback, rival context, and contextual card guidance using deterministic data.
- [x] 6. Add lightweight team profiles and evaluate whether season economy continuity and variable shop mode should ship in this corpus or be deferred after design proof.
- [x] 7. Prototype the deterministic race-engineer assistant only if the core beta flow plus card guidance remain insufficient after observation. Decision: skipped — item_329 card guidance is judged sufficient; item_333 archived with a reopen trigger.
- [x] 8. Update roadmap/deferred decisions, run relevant tests and browser evidence, run npm run logics:validate, and commit.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

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
- Season economy: preserve players, palmares, archived stats, cosmetic/team identity, credits, and garage cards; reset points only at season rollover.
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
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.
- request-AC2 -> `item_325`. Proof: creator-only `Direction de course` screen shipped with readiness groups, invite/share, resolve actions, and visible absent-player defaults; browser evidence at `reports/ux/manual-review/race-direction-desktop.png` and `race-direction-mobile.png`.
- request-AC3 -> `item_325`. Proof: manual owner-triggered reminder API capped to one successful send per season, with sent/skipped counts and audit fields; covered by API tests, no automatic/scheduled reminder path exists.
- request-AC5 -> `item_327`. Proof: race reports expose a deterministic Next action card driven by race result, played-card trigger, rival decision, and next circuit/weather; browser evidence at `reports/ux/report-next-action-browser/04-round-1-report-desktop.png` and `-mobile.png`.
- request-AC7 -> `item_329`. Proof: Plan/Garage card guidance uses `Utile ici`/`Situationnel`/`Impact faible` deterministic reasons replacing the old affinity labels; browser UX evidence covers Plan and Garage.
- request-AC9 -> `item_331`. Proof: opt-in `variableShop` league flag (default off) with a deterministic 6-card shop frozen per GP (`variableShopCardIds`/`GrandPrix.shopCardIds`); fixed shop unchanged for default leagues; covered by a dedicated API integration test and a live browser click-through (checkbox unchecked by default, league created successfully with it enabled).
- request-AC10 -> `item_324`/`item_332`. Proof: season rollover preserves players, palmares, archived stats, credits, and garage cards while resetting points only, covered by API tests across top/middle/bottom teams; the capped credit carry-over variant is explicitly deferred on `item_332` (Archived, decision + reopen trigger recorded).
- request-AC11 -> `item_333`. Proof: `item_333` is Archived per its own scope's condition (skip if card guidance makes the Plan screen readable enough); `item_329` shipped and was judged sufficient; decision + reopen trigger recorded on the backlog doc.
- request-AC12 -> `item_334`. Proof: deferred ideas and reopen triggers (secondary objectives, arcade solo, quick play, onboarding rewrite, compact replay, automatic reminders, polling/SSE, bot replacement, 1.0 hardening) recorded in `item_334` and synced into `road_002`.
- request-AC13 -> This task. Proof: `npm run logics:validate` (lint + audit) passes; `npx tsc --build`, `npx eslint .`, and the relevant vitest suites (API + web, 250+ tests) pass; browser UX evidence regenerated for each UI-touching wave (`Direction de course`, report Next action, Plan/Garage card guidance, team profile, variable shop).

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- 2026-07-28 validation: npm run logics:validate passed. logics-manager lint --require-status passed. logics-manager audit --group-by-doc passed with expected request AC traceability warnings while the linked orchestration task is not Done.
- 2026-07-28 item_327 visual follow-up: report header classification wrapping was fixed by scoping report-podium text styles to direct children and keeping reward values inline. Browser UX evidence regenerated at reports/ux/report-next-action-browser/04-round-1-report-desktop.png and reports/ux/report-next-action-browser/04-round-1-report-mobile.png; both show the Next action card and compact header classification.
- 2026-07-28 handoff validation: `rtk logics-manager lint --require-status` passed, `rtk logics-manager audit --group-by-doc` passed with the expected open-task AC warnings, `rtk npm run typecheck` passed, `rtk npm test -- --run apps/api/src/app.test.ts apps/web/src/app/helpers.test.ts apps/web/src/app/App.test.tsx apps/web/src/features/ChampionshipView.test.ts` passed with 106 tests, and `git diff --check` passed.
- Finish workflow executed on 2026-07-28.
- Linked backlog/request close verification passed.

# Report
- 2026-07-27 handoff: first wave was partially delivered and committed. Season presets, no-auto-resolve/default-plan backend guard, next-season rollover reset, `Direction de course`, manual one-successful-reminder-per-season API/mail path, accessibility gate, and several UX papercuts were already in code.
- 2026-07-27 continuation: closed `item_324` and `item_325` by adding visible absent-human default-plan confirmation, default-plan report badges, reminder sent/skipped feedback, reminder locked-state coverage, and regenerated `Direction de course` desktop/mobile evidence.
- Evidence: `rtk npm run typecheck`; `rtk npm test -- --run apps/web/src/app/App.test.tsx apps/web/src/features/ReportView.test.tsx`; screenshots at `reports/ux/manual-review/race-direction-desktop.png` and `reports/ux/manual-review/race-direction-mobile.png`.
- Next wave status: `item_327`, `item_328`, `item_329`, and `item_330` are now delivered; keep remaining optional slices deferred unless pulled in explicitly.
- 2026-07-28 corpus closeout: intentionally kept `item_331`, `item_332`, and `item_333` as optional/evidence-gated follow-up slices rather than marking unshipped work Done. Deferred-mode guardrail item_334 records reopen triggers for optional secondary objectives, arcade solo, quick play matchmaking, onboarding/tutorial rewrite, compact replay/highlights, automatic reminders, polling/SSE, bot replacement, and 1.0 hardening.
- 2026-07-28 item_327 delivered: race reports now expose a deterministic Next action card with a primary race reason, next-GP attempt guidance, and a card/setup hint. The recommendation uses race result, played-card trigger/miss, existing rival decision when present, and next circuit/weather context without adding auto-pick or generative advice.
- 2026-07-28 item_328 delivered: derived rival context now threads through standings, Plan pre-race guidance, and report action reasoning, with no mandatory rival selection and no first-race rival before meaningful points exist.
- 2026-07-28 item_329 delivered: contextual card guidance now replaces the old affinity labels across Plan and Garage, with deterministic reasons tied to weather, circuit traits, position pressure, chrono timing, and economy tradeoffs. Browser UX evidence covers Plan and Garage after fixing card-cell overlap and Plan ellipsis.
- 2026-07-28 item_330 delivered: standings rows now open an in-league team profile modal with livery identity, rank, points, credits, GP count, podiums, palmares count, recent form, current rival, and derived style. Tests cover profile rendering and unsafe team-name text rendering. Browser UX evidence covers mobile standings and team profile with zero axe violations at `reports/ux/team-profile-browser.md`; Palmarès mobile text alignment is scoped in CSS for completed-season rows.
- 2026-07-28 profile/garage follow-up: mobile standings and Palmarès livery plates now reserve enough room for title stars, and Garage inventory/shop card order uses availability first, then deterministic utility score. Locked inventory cards fade and move after usable cards.
- 2026-07-28 season economy follow-up: season rollover no longer deletes garage cards or resets credits; API coverage now verifies a player-owned card and credit balance survive the transition to season 2 while points still reset.
- 2026-07-28 item_331 delivered: added an opt-in variable shop mode (League.variableShop, default off) with a deterministic 6-card-per-GP selection frozen on GrandPrix.shopCardIds via the existing seeded-shuffle pattern; fixed-shop leagues are unchanged. UI adds a Variable shop every GP checkbox next to Fill with bots. Verified live in a browser click-through (session-injected league creation, checkbox rendered unchecked by default, league created successfully with it checked, no console errors) plus a new API integration test covering fixed vs variable shop, freeze-on-reread, and rotation on next-grand-prix.
- 2026-07-28 item_332/item_333 closed as Archived, not Done: item_332's non-optional baseline (preserve credits/garage cards, reset points) was already covered by item_324's rollover rule, and its own scope deferred the capped credit carry-over variant as a later evidence-gated follow-up. item_333's own scope said to skip the race-engineer assistant if item_329 contextual card guidance made the Plan screen readable enough; item_329 shipped and was judged sufficient. Both carry documented decision notes and reopen triggers on their backlog docs; roadmap road_002 synced accordingly.
- Finished on 2026-07-28.
- Linked backlog item(s): `item_324_build_the_beta_season_lifecycle_core`, `item_325_add_commissioner_league_management_with_manual_reminders_and_share_controls`, `item_326_close_the_beta_accessibility_gate_without_redesigning_the_app`, `item_327_make_post_race_feedback_more_actionable_and_connect_it_to_the_next_grand_prix`, `item_328_introduce_a_non_mandatory_rival_thread_across_standings_and_reports`, `item_329_add_contextual_card_guidance_in_plan_and_garage`, `item_330_add_lightweight_team_identity_and_public_in_league_team_profiles`, `item_331_add_an_optional_variable_shop_mode_at_league_creation`, `item_332_define_the_lightweight_season_economy_continuity_rule`, `item_333_prototype_deterministic_race_engineer_profile_recommendations`, `item_334_record_deferred_modes_and_non_goals_so_0_6_stays_focused`
- Related request(s): `req_129_0_6_beta_season_lifecycle_and_league_management_private_seasons_commissioner_tools_actionability_rivals_team_identity_and_optional_economy_variants`

# AI Context
- Summary: Orchestrate the 0.6 beta season lifecycle and league management corpus
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_129_0_6_beta_season_lifecycle_and_league_management_private_seasons_commissioner_tools_actionability_rivals_team_identity_and_optional_economy_variants`
- Product brief(s): `prod_081_0_6_beta_season_lifecycle_and_league_management_product_brief`
- Architecture decision(s): (none yet)
