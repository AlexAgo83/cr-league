## road_002_cr_league_roadmap_v2 - CR League Roadmap v2
> Date: 2026-07-22
> Status: Accepted
> Related product: `prod_001_cr_league_product_brief`
> Related request: `req_033_over_engineering_cleanup_pass_1`, `req_034_personalized_race_recap`, `req_035_make_garage_inventory_cards_open_the_card_detail_modal`, `req_036_github_ci_render_blueprint_and_release_contract`, `req_037_starting_grid_modal_and_season_narrative`, `req_070_split_large_web_views_from_the_initial_bundle`, `req_071_modularize_the_large_web_layout_stylesheet`, `req_072_serve_large_web_artwork_as_webp`, `req_073_lazy_load_non_critical_web_artwork`, `req_074_audit_circuit_data_impact_before_optimizing_route_loading`, `req_075_extract_the_admin_panel_state_cluster_from_gameapp_into_a_hook`, `req_076_refresh_league_state_when_the_player_returns_to_the_tab`, `req_083_move_real_weather_detail_into_a_circuit_info_modal_and_improve_card_stat_badge_readability`, `req_084_differentiate_circuit_stats_and_make_bot_configurations_react_to_circuit_identity`, `req_085_repo_review_remediation_pass_6_json_column_race_locks_simulation_finishing_order_fidelity_destructive_op_guards_and_over_engineering_cleanup`, `req_086_gameplay_and_economy_integrity_comeback_payout_curve_unplayed_card_consumption_resolve_determinism_and_decision_validation`
> Reminder: Update status, milestone scope, linked refs, risks, and success signals when you edit this doc.
> Confidence: 90
> Non-semantic edit: 2026-07-19 release roadmap wording refresh.
> Semantic edit: 2026-07-20 added first-GP action clarity patch from AI/player playtest.
> Semantic edit: 2026-07-20 added repo review remediation pass 5 (req_058) under the legacy 0.4 planning labels; later completed before the 2026-07-21 0.4 line reset.
> Semantic edit: 2026-07-20 scaffolded 0.3.14 (req_060), 0.3.16 (req_059), and email-backed recovery (req_061) as ready-to-dev chains; req_061 later shipped before the 2026-07-21 0.4 line reset.
> Semantic edit: 2026-07-20 added 0.3.17 visibility-refetch patch and watchlist entries for view-screen tests and multiplayer freshness, from the v0.3.11 review follow-up.
> Semantic edit: 2026-07-20 added 0.3.18 replay-suspense and first-contact polish (req_062) plus a 0.5 first-win affordability note, from the AI playtest.
> Semantic edit: 2026-07-20 second playtest session: added 0.3.19 lap-scale coherence defect chain (req_063), extended req_062 with plan-lock safety, added bot-rivalry watchlist entry.
> Semantic edit: 2026-07-20 mobile playtest: scaffolded 0.3.20 modal hygiene + playback icons (req_064) and 0.3.21 home splash landing screen (req_065) as ready-to-dev chains; splash assets detoured and committed.
> Semantic edit: 2026-07-20 release prep: marked completed 0.3.14, 0.3.16, 0.3.18-0.3.21, and email-backed recovery work as shipped; marked then-pending 0.3 carry-over and support corpora as ready to dev.
> Semantic edit: 2026-07-20 release dependency triage: integrated compatible Dependabot maintenance and parked incompatible major migrations in the watchlist.
> Semantic edit: 2026-07-20 added 0.3.25 plan stat vocabulary alignment after post-release UI review.
> Semantic edit: 2026-07-21 closed the active 0.3 line at v0.3.26 and moved new performance, maintainability, and beta-readiness work into the 0.4 milestone.
> Semantic edit: 2026-07-21 split non-shipped 0.3 ideas into an explicit post-0.3 carry-over queue so the closed 0.3 line no longer hides pending work.
> Semantic edit: 2026-07-21 scaffolded league-state freshness on return (`req_076`) and kept dynamic objectives plus 0.5/0.6/1.0 themes explicitly unscaffolded until evidence warrants them.
> Semantic edit: 2026-07-21 audit_trial_2107: an AI playtest met the 0.5 card-economy evidence gate (dead cards, dominant cheap cluster), so scaffolded card economy rebalance (`req_081`) and opponent config comparison (`req_082`); sequenced stat differentiation to follow the card rebalance rather than scaffolding it now.
> Semantic edit: 2026-07-21 owner decision: HELD card economy rebalance (`req_081`) and coupled it with stat differentiation as one depth pass (tuning cards against the flat stat model would be invalidated once stats diverge); only opponent config comparison (`req_082`) proceeds now.
> Semantic edit: 2026-07-21 user playtest review: scaffolded race-weather/card-stat readability (`req_083`) and circuit-stat/bot-strategy differentiation (`req_084`); `req_084` is now the prerequisite before unblocking card economy.
> Semantic edit: 2026-07-22 refreshed 0.4/0.5 status after the shipped performance/readability chains and added the active integrity/remediation chains (`req_085`, `req_086`) as the next high-priority work.

# Summary
Plan CR League from the current playable prototype toward a stable private-league V1, replacing `road_001`'s closed milestone blocks with an open three-level scheme: `X.Y` is a stable theme, `X.Y.Z` is one feature drop (roughly one request chain). New features slot in as new patches under the nearest active theme — the roadmap absorbs ideas without renumbering.

Delivered-work history lives in `changelogs/`, not here: this document keeps goals, planned patches, and exit signals only.

# Versioning contract
- `X.Y` (minor) = a theme milestone. Stable, renamed or added only when the product direction changes.
- `X.Y.Z` (patch) = one shippable feature drop, normally one request chain. Added freely under the active theme; never requires renumbering siblings.
- Once `req_036`'s release contract is live, each shipped patch becomes a git tag `vX.Y.Z` and a `changelogs/CHANGELOGS_X_Y_Z.md` entry; before that, patch numbers are planning slots only.
- Insertion rule: a new feature idea = a new patch under the closest active theme. A new minor is created only for a genuinely new theme.
- Version labels are planning targets, not release promises.

# Current Position (2026-07-22)
- 0.1 (vertical slice) and 0.2 (private league prototype) are implemented; their detail is preserved in `road_001` and the specs.
- The prototype runs the full private-league loop: profiles, invite codes, qualifying, directives, resolution, animated replay, reports, seasons, garage with a 15-card economy, EN/FR, balance simulations.
- The 0.3 playtest-ready loop line has shipped through `v0.3.26`: the hosted app, CI/release flow, map/replay/report polish, mobile fixes, garage presentation, chrono/plan clarity, home splash, and production health evidence are real.
- The 0.4 ship-rails line has delivered the main performance, maintainability, support, and readability chains: non-winning success feedback, web view code-splitting, stylesheet modularization, WebP artwork delivery, lazy artwork loading, circuit route loading audit, GameApp admin-panel hook extraction, league-state freshness on return, race weather/card-stat readability, and circuit-stat/bot-strategy differentiation are all marked Done in Logics.
- Two high-priority implementation chains are now active at the 0.4/0.5 boundary: `req_085` / `task_086` for repo review remediation pass 6, and `req_086` / `task_087` for gameplay/economy integrity.
- Still not real: automatic scheduler, full auth, dynamic objectives, broad beta operations evidence, multi-person playtest evidence for the current balance, and the held card economy rebalance after the integrity/stat-differentiation baseline.

# Milestones
## 0.1 - Playable vertical slice
- Status: Implemented. See `road_001` and `spec_016_implementation_roadmap` for the delivered detail.

## 0.2 - Private league prototype
- Status: Implemented. See `road_001` for the delivered detail.

## 0.3 - Playtest-ready loop
- Goal: Make the 3-GP private playtest loop feel designed, legible, and worth a tester's hour — and keep the codebase small enough to iterate fast.
- Status: Closed for the current release line at `v0.3.26`; only critical hotfixes should reopen 0.3.x.
- Patch history and deferred slots:
  - 0.3.1 — Over-engineering cleanup: ~550 lines deleted/consolidated, single validation layer, honest data shapes. Shipped through `req_033`.
  - 0.3.2 — Garage card consultation: inventory cards open the read-only detail modal. Shipped through `req_035`.
  - 0.3.3 — Starting grid and season narrative: pre-launch grid recap, season champion celebration, palmares, season-grouped history. Shipped through `req_037`.
  - 0.3.4 — Personalized race recap: per-circuit GP identity, i18n interpolation, recap cards built from the player's race data. Shipped through `req_034`.
  - 0.3.5 — Visual identity and mobile polish. Shipped in `changelogs/CHANGELOGS_0_3_5.md`.
  - 0.3.6 — Cockpit/setup visual identity and release contract alignment. Shipped in `changelogs/CHANGELOGS_0_3_6.md`.
  - 0.3.7 — First-session setup polish: compact Profile/League choices, saved-league cell styling, bottom-centered notifications, clearer Race Desk copy. Shipped in `changelogs/CHANGELOGS_0_3_7.md`.
  - 0.3.8 — Race learning feedback: chrono report/history, setup suggestions, payoff recap, starter credits, and tire-prep wording. Shipped in `changelogs/CHANGELOGS_0_3_8.md`.
  - 0.3.9 — Navigation/admin/circuit polish: URL-backed cockpit routes, secured admin console, generated city circuits, randomized calendars, comeback credits, and playtest simulation. Shipped in `changelogs/CHANGELOGS_0_3_9.md`.
  - 0.3.10 — Replay and playtest polish: pit strategy, replay readability, loading feedback, global circuit catalogue, and report guidance. Shipped.
  - 0.3.11 — Balance/playtest release: AI playtest balance, report guidance, replay payoff placement, and gap badge polish. Shipped in `changelogs/CHANGELOGS_0_3_11.md`.
  - 0.3.12 — Dynamic race objectives: deferred from the 0.3 line; tracked in the post-0.3 playtest-loop carry-over queue below.
  - 0.3.13 — Plan risk/readability layer: show a compact `safe / risky / high-upside` read before sending the plan, including where the setup is strong, where it can fail, and which finishing band it is trying to optimize. Shipped through `req_067` / `task_068`.
  - 0.3.14 — Result verdict pass: add a direct `why this worked / why this failed / try this next` summary to reports so players understand the outcome in seconds before reading detailed phases. Shipped.
  - 0.3.15 — Non-winning success feedback: deferred from the 0.3 line, then shipped later through `req_068` / `task_069`.
  - 0.3.16 — First-GP action clarity: make `New chrono` the only recommended CTA at the start of a GP, add one compact circuit/weather recommendation in the plan, and harmonize first-session vocabulary so league, championship, plan, chrono, and launch labels do not compete. Shipped.
  - 0.3.17 — League-state freshness on return: deferred from the 0.3 line, then shipped later through `req_076` / `task_077`. Real-time polling/SSE stays a 0.6 decision.
  - 0.3.18 — Replay suspense and first-contact polish: hide the race payoff until the replay finishes or is explicitly skipped, one-click chrono with attempts visible, Enter submits setup forms, intros persist per league once seen, attempt-rank labels stop mimicking race positions, and key moments deduplicate. From the 2026-07-20 AI playtest; extended same day with plan-lock safety (send confirmation with card warning, visible locked state, carried-over-plan label) and finished-GP reopen-on-summary. Shipped.
  - 0.3.19 — Lap-scale coherence: displayed lap numbers (key moments, recap, callouts, markers) must match the circuit's announced lap count — the second playtest saw a 3-lap GP report moments from laps 5, 8, and 10. Boundary rescale, simulation untouched. Shipped.
  - 0.3.20 — Mobile modal hygiene and playback icons: lock background scroll behind modals (only the dialog scrolls), make the launch-Grand-Prix confirmation modal compact enough to stay inside a phone viewport on both axes, and replace the emoji pause/play control with a themed inline SVG icon. UI polish only, no gameplay change. From the 2026-07-20 mobile playtest. Shipped.
  - 0.3.21 — Home splash landing screen: a branded front door shown only at the start URL (deep links bypass it) with a Profile-style header, a height-fit background, floating `CR` and `League` transparent title art, and a `PRESS START` button that enters the game unchanged. First brand/first-contact surface; kept as a 0.3 patch rather than a new minor. Shipped.
  - 0.3.22 — Post-playtest clarity and release hardening: result verdicts, first-GP action clarity, replay suspense, lap-scale labels, mobile modal polish, branded splash, compatible Dependabot updates, and release health-gate fixes. Shipped in `changelogs/CHANGELOGS_0_3_22.md`.
  - 0.3.23 — Post-release UI polish: main cockpit copy is now `Stand`, profile and join-league validation errors stay inline, emailed recovery codes use a readable 12-character format, mobile modals are full-screen with bottom-pinned actions and compact launch-GP grid cells, plan card choices collapse to one column on phones, replay controls use stable SVG icons, topbar branding uses the splash title assets without ratio distortion, and send-plan/chrono confirmations reuse the styled current-plan summary. Shipped in `changelogs/CHANGELOGS_0_3_23.md`.
  - 0.3.24 — Setup background and trait-color polish: removes the setup page background assets behind Profile/League setup, unifies Grip/Attack/Energy stat colors across map and Plan screens, and colors the active directive step summary by category. Shipped in `changelogs/CHANGELOGS_0_3_24.md`.
  - 0.3.25 — Plan stat vocabulary alignment: Plan now uses the same Adhérence/Attaque/Endurance names, hints, and stat-color mapping as the Course/Replay stats panels; Attaque moves to blue while Approche and Prépa pneus get distinct category accents; Course/Replay stat badges show signed setup values instead of raw config counts. Shipped.
  - 0.3.26 — Map, chrono, replay, garage, and release polish: completed the post-release UI pass across Plan/GP/Chrono map panels, final classification/report entry points, garage presentation, race replay visuals, mobile layout fixes, copy polish, CI fixes, and release evidence. Shipped in `changelogs/CHANGELOGS_0_3_26.md`.
- Exit signal:
  - 3 to 5 testers complete a 3-GP session on the polished loop;
  - feedback answers whether choices feel causal, recaps feel personal, and seasons feel like arcs;
  - the codebase carries no known dead weight from the audit.
- Linked docs: `req_032_redesign_the_cr_league_race_cockpit_v0`, `req_033_over_engineering_cleanup_pass_1`, `req_034_personalized_race_recap`, `req_035_make_garage_inventory_cards_open_the_card_detail_modal`, `req_037_starting_grid_modal_and_season_narrative`, `spec_016_implementation_roadmap`.

## Post-0.3 playtest-loop carry-over queue
- Purpose: keep useful 0.3 gameplay/readability ideas visible after the active 0.3 release line is closed, without forcing them into the 0.4 performance/support theme.
- Dynamic race objectives: open a fresh request only after 3-to-5 tester evidence shows players need explicit side goals to understand non-winning success. Candidate future slot: 0.5 if tied to light rewards/economy, otherwise 0.6 beta-feedback patch.
- Non-winning success feedback is no longer pending: `req_068` / `task_069` are Done, so future comprehension work should be new evidence-backed follow-up, not the old 0.3.15 slot.
- League-state freshness on return is no longer pending: `req_076` / `task_077` are Done; keep polling/SSE deferred to 0.6 unless beta evidence proves realtime is necessary.
- Plan risk/readability is no longer pending: `req_067` / `task_068` are Done, so future work here should be new follow-up evidence, not the old 0.3.13 slot.

## 0.4 - Ship rails
- Goal: Make the hosted beta loop fast, maintainable, observable, and supportable: verified releases stay intact, initial payload and artwork cost shrink, large frontend surfaces become easier to work on, and admin/support paths are hardened for invited testers.
- Status: Active; the original ship-rails performance/maintainability queue is mostly delivered, and the remaining 0.4 focus is integrity hardening before beta.
- Already-delivered foundation: CI/release contract, hosted release health checks, email-backed profile recovery, repo review remediation pass 5, beta support hardening, non-winning success feedback, web view code-splitting, stylesheet modularization, WebP artwork delivery, lazy artwork loading, circuit route loading audit, GameApp admin-panel hook extraction, and league-state freshness on return are complete through earlier request chains (`req_036`, `req_061`, `req_058`, `req_069`, `req_068`, `req_070`-`req_076`).
- Delivered or active patches:
  - 0.4.0 — Asset payload optimization and roadmap transition: optimized the large PNG artwork set, established `v0.3.26` as the end of the active 0.3 line, and starts 0.4 as the performance/maintainability/beta-readiness release line. Delivered locally; release tagging/deploy proof still follows the release workflow.
  - 0.4.1 — Lazy artwork loading: default reusable artwork images to lazy loading and async decoding, with an eager escape hatch for true first-screen assets. Done through `req_073` / `task_074`.
  - 0.4.2 — Web view code-splitting: lazy-load secondary views such as garage, championship, report, and replay to reduce the initial JS chunk without changing navigation. Done through `req_070` / `task_071`.
  - 0.4.3 — WebP artwork delivery: generate and serve WebP variants for the largest remaining artwork where measured savings justify the conversion. Done through `req_072` / `task_073`.
  - 0.4.4 — GameApp admin-panel hook extraction: move the admin-panel state cluster out of the main app component to reduce frontend maintenance risk. Done through `req_075` / `task_076`.
  - 0.4.5 — Web stylesheet modularization: extract bounded feature CSS from the monolithic layout stylesheet without visual redesign. Done through `req_071` / `task_072`.
  - 0.4.6 — Circuit route loading audit: measure detailed circuit route data cost and lazy-load route geometry only if the byte savings justify the async complexity. Done through `req_074` / `task_075`.
  - 0.4.7 — League-state freshness on return: silently refetch the active league when the player returns to a visible tab, without polling or realtime infrastructure. Done through `req_076` / `task_077`.
  - 0.4.8 — Race weather and card stat readability: move resolved weather phase detail behind a circuit info modal, wrap card stat badges cleanly, and expose stat explanations on badge hover/focus. Done through `req_083` / `task_084`.
  - 0.4.9 — Repo review remediation pass 6: close JSON-column race locks, restore simulation finishing-order fidelity, guard destructive/admin authority changes, derive plan badges from shared stat deltas, and delete the surfaced over-engineering. Active through `req_085` / `task_086`.
- Exit signal:
  - publishing a GitHub Release vX.Y.Z is the only deploy path and ends with production /health reporting that version;
  - the initial web payload and largest artwork costs are measured and materially lower than the 0.3.26 baseline;
  - large web surfaces have clear ownership boundaries for future AI/dev work;
  - a small invited group can play on the hosted environment without local dev tooling or manual support.
- Linked docs: `req_036_github_ci_render_blueprint_and_release_contract`, `req_058_repo_review_remediation_pass_5_account_security_api_trust_boundaries_web_decomposition_and_ci_hardening`, `req_069_beta_support_hardening`, `req_070_split_large_web_views_from_the_initial_bundle`, `req_071_modularize_the_large_web_layout_stylesheet`, `req_072_serve_large_web_artwork_as_webp`, `req_073_lazy_load_non_critical_web_artwork`, `req_074_audit_circuit_data_impact_before_optimizing_route_loading`, `req_075_extract_the_admin_panel_state_cluster_from_gameapp_into_a_hook`, `req_076_refresh_league_state_when_the_player_returns_to_the_tab`, `req_083_move_real_weather_detail_into_a_circuit_info_modal_and_improve_card_stat_badge_readability`, `req_085_repo_review_remediation_pass_6_json_column_race_locks_simulation_finishing_order_fidelity_destructive_op_guards_and_over_engineering_cleanup`, `adr_001_cr_league_v1_static_pwa_api_architecture`, `adr_004_data_security`.

## 0.5 - Economy and card depth
- Goal: Add enough card and currency depth for repeated sessions without burying the casual player.
- Status: Opening; the card-economy evidence gate is met (audit_trial_2107 AI playtest). Opponent config comparison (`req_082`) and circuit-stat/bot-strategy differentiation (`req_084`) are Done; card economy rebalance (`req_081`) remains HELD until the integrity fixes and fresh baseline are in place.
- Scope to slice into patches when requests exist: card acquisition variety (draft/sell only after fixed-shop playtest evidence), season rollover economy with partial credit carry-over capped around 25-35%, cosmetic-only champion rewards with a clear palmares/history home, inventory cap tuning only if max 5 cards frustrates or encourages hoarding, catch-up mechanisms that help low-ranked players without making first place feel random, balance telemetry from real playtests, economy rules documented before broadening the card list.
- Completed prerequisite depth pass — circuit stat differentiation and bot strategy (`req_084`): Grip, Attack, and Endurance now create more distinct setup pressure, and bot setup variation reacts to circuit identity.
- Active integrity prerequisite — gameplay and economy integrity (`req_086`): make payouts monotonic, stop unchosen human cards from being auto-consumed, derive race resolution from stored circuit identity, reject self-rivals, prune limiter buckets, add the Team.profileId index, and clean bot-card write hygiene before card economy tuning resumes.
- Held and coupled — card economy (`req_081`) after `req_084` and `req_086`: owner decision 2026-07-21 still stands. Rebalancing cards before the differentiated stat model and integrity baseline settle would tune the wrong game. Unblock only after `req_086` lands with a fresh AI-playtest/balance baseline; then rebalance cards against the differentiated, monotonic economy model.
- Corpus policy: keep scaffolding 0.5 work as small evidence-backed chains (not one broad economy corpus); each new 0.5 chain still needs its own playtest/balance evidence before it opens, as `req_082` did.
- Exit signal: players earn and spend across multiple GPs, card choices create visible replay/report moments, and bottom-table players have comeback options while leaders still feel rewarded.
- Linked docs: `req_081_rebalance_card_economy_to_remove_dead_cards_and_redundant_duplicates`, `req_082_show_opponents_configurations_for_comparison_after_lock_and_after_the_race`, `req_084_differentiate_circuit_stats_and_make_bot_configurations_react_to_circuit_identity`, `req_086_gameplay_and_economy_integrity_comeback_payout_curve_unplayed_card_consumption_resolve_determinism_and_decision_validation`, `item_004_design_and_implement_the_v1_card_and_inventory_system`, `item_005_define_balancing_and_retention_mechanics_for_social_leagues`, `spec_001_grand_prix_core_loop_and_simulation_v1`.

## 0.6 - Live beta season
- Goal: Run a real beta season long enough to validate cadence, replay comprehension, economy pressure, and return behavior.
- Status: Planned (renumbered from road_001's 0.7; same intent).
- Scope to slice into patches when requests exist: beta season lifecycle, playtest and season presets (3 GP for quick tests, 6 GP for default leagues), async cadence V1 (all-ready resolution by default, deadline resolution, lightly visible absent-player defaults, force-resolve or pause only if playtest ops needs them, bot replacement after repeated absences only if leagues stall), feedback capture across GP cycles, balance tweaks from observed behavior, notifications/reminders only if usage proves the need.
- Corpus policy: the first 0.6 corpus should be beta season lifecycle once 0.4 is stable; do not pre-scaffold polling/SSE, reminders, or bot replacement without beta evidence.
- Exit signal: beta players complete a short season with enough feedback to decide what belongs in 1.0; remaining 1.0 work is known, not guessed.
- Linked docs: `prod_001_cr_league_product_brief`, `spec_016_implementation_roadmap`.

## 1.0 - Private league V1
- Goal: Ship a stable private-league experience that can run cheaply and be shared with non-gamer colleagues.
- Status: Post-beta target.
- Scope: production hardening of the 0.4 rails, league lifecycle completeness, accessibility and i18n baseline, operational docs (configuration, smoke, backups, known limits), minimal abuse/security guardrails for invite-code leagues.
- Corpus policy: keep 1.0 as a product target, not an implementation corpus, until the 0.6 beta produces enough evidence to define the remaining release blockers.
- Exit signal: a private league runs a full short championship without manual database intervention; validation and smoke gates are repeatable from a clean environment; the cost model stays hobby-compatible.
- Linked docs: `adr_001_cr_league_v1_static_pwa_api_architecture`, `adr_004_data_security`, `adr_006_accessibility`, `adr_007_i18n`, `adr_008_testing_quality`, `spec_016_implementation_roadmap`.

# Sequencing
- Finish `task_086` / `req_085` first: it protects core write paths, admin authority, simulation fidelity, and player-facing stat truthfulness.
- Then finish `task_087` / `req_086`: it protects the economy curve, default-resolve card behavior, deterministic resolution, and decision validation.
- After both integrity chains are green, run the fresh AI-playtest/balance baseline before unholding `req_081` card economy rebalance.
- Keep release validation explicit: use `logics-manager release status|plan|validate` and record evidence before claiming any 0.4.x release readiness.
- Do not start 1.0 hardening until the 0.6 beta has produced real usage.

# Watchlist
- Car wear or team condition persistence stays out of the roadmap until playtesters say Grand Prix lack continuity between races; season rollover economy is the lighter continuity bet first.
- Full auth stays out of scope while private beta can operate with email-backed recovery codes and claim-protected teams.
- Notifications and reminders stay conditional in 0.6; add them only if beta players forget to return for scheduled preparation.
- Random, draft, or hybrid card acquisition belongs in 0.5 only after real playtest evidence shows the fixed shop is too flat or too predictable.
- First-win affordability (0.5): the 2026-07-20 playtest ended a winning first GP with 330 credits while the most visible Recommended card cost 500; when tuning the 0.5 economy, check that at least one Recommended card is reachable after a first win.
- Bot rivalry: the 2026-07-20 playtest won both GPs playing naively and the GP1 pole-sitter finished P7 in GP2 — bots do not sustain a rival narrative. Do nothing yet; if the human 3-GP exit playtest shows a naive player winning the championship without losing a single GP, open a bot-rivalry chain (circuit-fit card play — already observed once — and a steadier bot hierarchy for nameable rivals). Measure with playtest:ai and balance:sim first.
- Keep 2D replay as the default; add better animation/callouts before considering 3D, and only consider 3D after the loop is proven.
- Keep visual regression, file-size linting, test sharding, and normalized replay/event tables out until CI, layout stability, or admin/debug needs make the current setup painful.
- Watch qualifying impact in playtests: if pole wins too often, soften grid advantage or increase overtaking windows before changing the whole qualifying model.
- Keep admin accident recovery minimal: prefer confirmation, runbooks, and test-data cleanup before adding undo/reset-recent-action tooling.
- JSON-column inventory/decision writes are now known risk areas; keep new card/team mutations on the row-lock/runWrite pattern from `req_085`.
- Economy tuning is blocked by integrity, not just by taste: payouts must be monotonic and default-resolve must not spend unchosen human cards before card prices/roles are retuned.
- Post-0.3 carry-over discipline: do not silently append gameplay/readability work back into 0.3.x; promote it from the carry-over queue into 0.5, 0.6, or a focused hotfix only when evidence justifies it.
- No-corpus discipline: dynamic race objectives, broad 0.5 economy/card depth, 0.6 live beta season, and 1.0 V1 remain unscaffolded by design until their evidence gates are met.

- After the existing coverage lane from `req_058` identifies weak screens, add render/interaction tests for the 2-3 weakest game screens (PlanView, GarageView, ResultView first) as a backlog item on an existing chain — not a dedicated corpus.
- Keep `submitDecision`'s repeated full-state reloads as-is until the existing Postgres integration lane measures a real cost; the fix (thread loaded state through) is mechanical when justified.
- Dependabot major migrations parked after 0.3.22 release triage: ESLint 10 needs jsx-a11y peer support or replacement, `@vitejs/plugin-react` 6 should move with Vite 8, and Prisma 7 needs datasource/client configuration migration. Do not force these into a patch release without a focused migration chain.

# Next Recommended Requests
- Continue `task_086` / `req_085` first. It is High priority because concurrent writes and authority/destructive-operation guards protect data integrity.
- Continue `task_087` / `req_086` next. It is High priority because payout inversion, unplayed-card consumption, request-body-driven race resolution, and self-rival decisions directly affect game fairness.
- After those two chains are Done, rerun playtest/balance evidence and decide whether to unhold `req_081` card economy rebalance.
- Keep dynamic race objectives, beta cadence, polling/SSE, and 1.0 hardening unscaffolded until their evidence gates are met.

# Risks
- Building the card economy before the current integrity fixes and repeated-GP playtest truth would tune the wrong game.
- Async cadence can feel dead if the next action and deadline are not obvious.
- A richer replay becomes expensive if it drifts toward real-time simulation before deterministic playback proves the need.
- Patch slots make it easy to accept scope: the insertion rule adds features to themes, it does not remove the need to say no.
- Version labels are planning targets, not release promises.

# References
- Product brief(s): `prod_001_cr_league_product_brief`
- Superseded roadmap: `road_001_cr_league_roadmap` (kept for 0.1/0.2 delivered detail)
- Implementation roadmap spec: `spec_016_implementation_roadmap`
- Request(s): `req_033_over_engineering_cleanup_pass_1`, `req_034_personalized_race_recap`, `req_035_make_garage_inventory_cards_open_the_card_detail_modal`, `req_036_github_ci_render_blueprint_and_release_contract`, `req_037_starting_grid_modal_and_season_narrative`, `req_058_repo_review_remediation_pass_5_account_security_api_trust_boundaries_web_decomposition_and_ci_hardening`, `req_059_first_gp_action_clarity_one_recommended_cta_plan_recommendation_and_vocabulary_harmonization`, `req_060_result_verdict_pass_why_it_worked_why_it_failed_what_to_try_next`, `req_061_email_backed_profile_recovery_send_codes_on_creation_and_self_service_re_issue`, `req_062_replay_suspense_and_first_contact_polish_from_the_2026_07_20_ai_playtest`, `req_063_lap_scale_coherence_displayed_lap_numbers_must_match_the_circuit_s_lap_count`, `req_064_mobile_modal_hygiene_and_real_playback_icons`, `req_065_home_splash_landing_screen_with_floating_title_and_press_start`, `req_066_post_splash_playtest_polish_mobile_header_and_root_shell_cleanup`, `req_067_plan_risk_readability_layer`, `req_068_non_winning_success_feedback`, `req_069_beta_support_hardening`, `req_070_split_large_web_views_from_the_initial_bundle`, `req_071_modularize_the_large_web_layout_stylesheet`, `req_072_serve_large_web_artwork_as_webp`, `req_073_lazy_load_non_critical_web_artwork`, `req_074_audit_circuit_data_impact_before_optimizing_route_loading`, `req_075_extract_the_admin_panel_state_cluster_from_gameapp_into_a_hook`, `req_076_refresh_league_state_when_the_player_returns_to_the_tab`, `req_083_move_real_weather_detail_into_a_circuit_info_modal_and_improve_card_stat_badge_readability`, `req_084_differentiate_circuit_stats_and_make_bot_configurations_react_to_circuit_identity`, `req_085_repo_review_remediation_pass_6_json_column_race_locks_simulation_finishing_order_fidelity_destructive_op_guards_and_over_engineering_cleanup`, `req_086_gameplay_and_economy_integrity_comeback_payout_curve_unplayed_card_consumption_resolve_determinism_and_decision_validation`
- Backlog item(s): (tracked per request chain)
- Task(s): `task_034_orchestrate_over_engineering_cleanup_pass_1`, `task_035_orchestrate_personalized_race_recap`, `task_036_orchestrate_garage_inventory_card_consultation`, `task_037_orchestrate_ci_render_blueprint_and_release_contract`, `task_038_orchestrate_starting_grid_and_season_narrative`, `task_059_orchestrate_repo_review_remediation_pass_5`, `task_060_orchestrate_first_gp_action_clarity`, `task_061_orchestrate_result_verdict_pass`, `task_062_orchestrate_email_backed_profile_recovery`, `task_063_orchestrate_replay_suspense_and_first_contact_polish`, `task_064_orchestrate_lap_scale_coherence_fix`, `task_065_orchestrate_mobile_modal_hygiene_and_playback_icons`, `task_066_orchestrate_the_home_splash_landing_screen`, `task_067_orchestrate_post_splash_playtest_polish`, `task_068_orchestrate_plan_risk_readability_layer`, `task_069_orchestrate_non_winning_success_feedback`, `task_070_orchestrate_beta_support_hardening`, `task_071_orchestrate_web_view_code_splitting`, `task_072_orchestrate_web_stylesheet_modularization`, `task_073_orchestrate_webp_artwork_conversion`, `task_074_orchestrate_lazy_artwork_loading`, `task_075_orchestrate_circuit_route_loading_audit`, `task_076_orchestrate_gameapp_admin_panel_hook_extraction`, `task_077_orchestrate_league_state_freshness_on_return`, `task_086_orchestrate_repo_review_remediation_pass_6`, `task_087_orchestrate_gameplay_and_economy_integrity_fixes`

# AI Context
- Summary: Release-level roadmap for CR League with a three-level version scheme (theme minors, feature-drop patches) from playable prototype to private league V1.
- Keywords: roadmap, milestones, versions, patches, release-plan, private-league, playtest, ship-rails
- Use when: Planning or sequencing CR League product increments, or deciding where a new feature idea slots in.
- Skip when: You need execution details for a single backlog item or task.
