## task_129_orchestrate_the_ai_alpha_seasons_evidence_run - Orchestrate the AI alpha seasons evidence run
> From version: 0.5.1
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 90%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Prepare report paths under reports/playtest/alpha-seasons/ so outputs do not overwrite the latest standard reports.
- [x] 2. Run headless AI seasons first, then replayability analytics and balance gate; record key metrics.
- [x] 3. Run browser playtest, UX playthrough, and cold-start reports with Playwright Chromium; record blocker/follow-up findings.
- [x] 4. Write the alpha decision package with one recommended next move.
- [x] 5. Run npm run logics:validate, close the corpus, and commit the evidence/docs.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_321_run_the_headless_ai_alpha_season_campaign`
- `item_322_run_browser_ai_alpha_sessions_for_ui_friction_and_cold_start`
- `item_323_write_the_alpha_seasons_decision_package`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `docs/audits/ai-alpha-seasons-decision-2026-07-27.md` records exact commands, report paths, sample sizes, and pass/fail thresholds.
- request-AC2 -> This task. Proof: headless AI, replayability, and balance outputs are recorded in `reports/playtest/alpha-seasons/` and summarized in the decision package.
- request-AC3 -> This task. Proof: browser fun score, UX playthrough, and cold-start reports were generated with Playwright Chromium and linked in the decision package.
- request-AC4 -> This task. Proof: the decision package classifies proceed-to-0.6, economy/card follow-up, UX/friction follow-up, and stability alternatives.
- request-AC5 -> This task. Proof: the evidence run changed only docs/Logics closeout files; no gameplay, economy, simulation, UI, or infrastructure code was changed.
- request-AC6 -> This task. Proof: `npm run logics:validate` passes at closeout.

# Validation
- 2026-07-27 evidence commands:
  - `npx tsx scripts/ai-playtest.ts --agents 84 --seasons 6 --rounds 6 --league-size 6 --report reports/playtest/alpha-seasons/headless-ai-playtest.md --json reports/playtest/alpha-seasons/headless-ai-playtest.json` OK.
  - `npx tsx scripts/replayability-analytics.ts --seasons 24 --rounds 6 --agents 14 --report reports/playtest/alpha-seasons/replayability.md --json reports/playtest/alpha-seasons/replayability.json` OK.
  - `npm run balance:gate` OK.
  - `npx tsx scripts/browser-fun-score.ts --rounds 2 --profiles sprinter,rain-reader,banker,closer --report reports/playtest/alpha-seasons/browser-fun-score.md --runs-dir reports/playtest/alpha-seasons/browser-fun-score-runs` OK.
  - `npx tsx scripts/browser-playtest.ts --rounds 2 --profile sprinter --report reports/playtest/alpha-seasons/browser-ux-smoke.md --ux-report reports/playtest/alpha-seasons/browser-playthrough.md --ux-assets reports/playtest/alpha-seasons/browser-playthrough-assets` OK.
  - `npx tsx scripts/browser-playtest.ts --rounds 1 --profile sprinter --report reports/playtest/alpha-seasons/browser-cold-start-smoke.md --cold-start-report reports/playtest/alpha-seasons/cold-start-funnel.md` OK.
- `npm run logics:validate` OK after closeout edits.

# Report
- Evidence run completed on 2026-07-27.
- Decision package: `docs/audits/ai-alpha-seasons-decision-2026-07-27.md`.
- Recommended next move: proceed to the 0.6 beta-season lifecycle corpus.
- Follow-up gates for 0.6: fix or explicitly triage the UX accessibility findings, and keep profile dominance as a beta-season watchpoint before any further card/economy tuning.

# AI Context
- Summary: Orchestrate the AI alpha seasons evidence run
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_128_ai_alpha_seasons_evidence_run_stress_the_season_loop_with_headless_and_browser_agents_before_0_6`
- Product brief(s): `prod_080_ai_alpha_seasons_evidence_run_product_brief`
- Architecture decision(s): (none yet)
