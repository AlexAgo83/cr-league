## req_128_ai_alpha_seasons_evidence_run_stress_the_season_loop_with_headless_and_browser_agents_before_0_6 - AI alpha seasons evidence run: stress the season loop with headless and browser agents before 0.6
> From version: 0.5.1
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Complexity: Medium
> Theme: Alpha evidence
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Run a large AI-only alpha season campaign before opening the 0.6 beta-season lifecycle, so the next product move is based on evidence rather than roadmap momentum.
- Use both headless simulation agents and real-browser Playwright agents: headless for scale, browser for real UI/friction/onboarding evidence.
- Emit durable markdown and JSON reports that another AI can inspect without rerunning the whole campaign.
- End with a decision matrix: proceed to 0.6 beta-season lifecycle, open a narrow 0.5 economy/card follow-up, open a UX/friction follow-up, or fix stability before beta.

# Context
- The roadmap now says 0.4 is closed, the first narrow 0.5 economy follow-up is done, and the next planned move is 0.6 beta-season lifecycle unless new evidence exposes an economy or UX defect.
- Existing scripts already cover the needed surfaces: playtest:ai for headless multi-season agent campaigns, playtest:replayability for dominance/fun/suspense analytics, balance:gate for a quick economy guard, playtest:browser for real UI traversal, playtest:ux for visual/friction evidence, and playtest:ux:cold-start for onboarding evidence.
- This corpus should not implement product features. It should orchestrate the run, collect evidence, summarize risks, and decide what corpus should be opened next.
- Browser evidence is intentionally smaller than headless evidence. It validates real UI flow, tap/click/friction, screenshots, and cold-start comprehension rather than producing balance statistics.

# Acceptance criteria
- AC1: The campaign defines exact commands, report paths, sample sizes, and pass/fail thresholds for the headless, replayability, balance, browser, UX, and cold-start runs.
- AC2: Headless evidence includes AI seasons, replayability/fun analytics, and balance gate results with reports written under reports/playtest or docs/audits.
- AC3: Browser evidence includes at least one real UI playtest smoke, one UX/friction playthrough report, and one cold-start onboarding report using Playwright Chromium.
- AC4: The final decision report classifies findings into proceed-to-0.6, economy/card follow-up, UX/friction follow-up, or stability bugfix, with reasons and linked report paths.
- AC5: No gameplay, economy, simulation, UI, or infrastructure code is changed unless a blocking test-run issue prevents collecting evidence; any such fix must be separately justified.
- AC6: npm run logics:validate passes after the corpus is generated and again at closeout.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_080_ai_alpha_seasons_evidence_run_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- logics/specs/spec_016_implementation_roadmap.md
- logics/specs/spec_005_economy_v1.md
- logics/request/req_119_browser_driven_ai_playtest_an_agent_that_plays_the_real_ui_like_a_human_decisions_from_the_shared_playtest_brain.md
- logics/request/req_120_ux_evaluation_harness_let_an_ai_judge_ui_ux_friction_and_onboarding_by_capturing_what_it_can_see_and_measure.md
- logics/request/req_121_replayability_and_fun_analytics_measure_outcome_variety_strategy_dominance_and_emotional_arc_across_many_ai_seasons.md
- logics/request/req_127_card_price_and_role_baseline_follow_up_validate_weak_card_affordability_before_0_5_economy_expansion.md
- scripts/ai-playtest.ts
- scripts/browser-playtest.ts
- scripts/browser-fun-score.ts
- scripts/replayability-analytics.ts
- scripts/balance-simulations.ts
- scripts/playtestBrain.ts
- reports/playtest/replayability-analytics.md
- docs/audits/card-price-role-baseline-2026-07-27.md
- Playwright Chromium is installed locally as of 2026-07-27 and a browser smoke passed with: npm run playtest:browser -- --rounds 1 --profiles sprinter --report reports/playtest/browser-playtest-install-smoke.md.

# AI Context
- Summary: AI alpha seasons evidence run: stress the season loop with headless and browser agents before 0.6
- Keywords: request-chain-scaffold, ai alpha seasons evidence run: stress the season loop with headless and browser agents before 0.6, development-ready
- Use when: You need to implement or review the scaffolded workflow for AI alpha seasons evidence run: stress the season loop with headless and browser agents before 0.6.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_321_run_the_headless_ai_alpha_season_campaign`
- `item_322_run_browser_ai_alpha_sessions_for_ui_friction_and_cold_start`
- `item_323_write_the_alpha_seasons_decision_package`

# Report
- Completed on 2026-07-27 through `task_129_orchestrate_the_ai_alpha_seasons_evidence_run`.
- Decision package: `docs/audits/ai-alpha-seasons-decision-2026-07-27.md`.
- Outcome: proceed to the 0.6 beta-season lifecycle corpus.
- Evidence paths:
  - `reports/playtest/alpha-seasons/headless-ai-playtest.md`
  - `reports/playtest/alpha-seasons/headless-ai-playtest.json`
  - `reports/playtest/alpha-seasons/replayability.md`
  - `reports/playtest/alpha-seasons/replayability.json`
  - `reports/playtest/alpha-seasons/balance-gate.txt`
  - `reports/playtest/alpha-seasons/browser-fun-score.md`
  - `reports/playtest/alpha-seasons/browser-ux-smoke.md`
  - `reports/playtest/alpha-seasons/browser-playthrough.md`
  - `reports/playtest/alpha-seasons/cold-start-funnel.md`
- No gameplay, economy, simulation, UI, or infrastructure code was changed for this evidence run.
