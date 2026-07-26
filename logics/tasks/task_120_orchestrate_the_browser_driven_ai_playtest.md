## task_120_orchestrate_the_browser_driven_ai_playtest - Orchestrate the browser-driven AI playtest
> From version: 0.4.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Read ai-playtest.ts and simulate-playtest.ts first; this reuses their personas and heuristics rather than inventing new ones.
- [ ] 2. Extract the shared playtest brain (decisions + personas + fun/frustration) into one module and refactor both headless tools onto it with no behavior change.
- [ ] 3. Build the Playwright agent that binds a persona to the brain and plays the real UI loop end-to-end against a real backend with a deterministic seeded league, reusing the e2e selector vocabulary.
- [ ] 4. Instrument the run with the fun/frustration report under reports/playtest/ and UI failure capture (screenshot on failure); wire the npm script.
- [ ] 5. Run typecheck, test, lint, the existing playtest:ai/playtest:simulate, and logics:validate; record proof at closeout.
- [ ] 6. Prefer role/label selectors and reading on-screen state over poking the API; note any action that had to bypass the UI and why.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_292_extract_the_shared_playtest_brain_decisions_fun_frustration_into_one_module`
- `item_293_build_the_playwright_browser_agent_that_plays_the_real_ui_from_the_shared_brain`
- `item_294_instrument_the_browser_run_fun_frustration_report_ui_failure_capture_npm_wiring`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `scripts/playtestBrain.ts` now owns personas, decision helpers, card-buying helpers, and fun/frustration scoring; `scripts/ai-playtest.ts` and `scripts/simulate-playtest.ts` import it and no longer define duplicate decision/scoring functions.
- request-AC2 -> This task. Proof: `npm run playtest:browser -- --rounds 2 --report reports/playtest/browser-playtest-smoke.md` played the real web UI through league creation, Plan choices, Send plan, Launch GP/replay, Garage card buy, Next GP, and Championship with choices produced by the shared brain.
- request-AC3 -> This task. Proof: `scripts/browser-playtest.ts` starts or reuses the real API and web servers and documents its local profile-seed path; only profile session setup bypasses the UI because local email recovery has no browser-visible delivery channel.
- request-AC4 -> This task. Proof: the browser report includes round outcomes, shared fun/frustration metrics, UI console/page failures, and screenshot-on-failure capture under `reports/playtest/`.
- request-AC5 -> This task. Proof: `npm run typecheck`, `npm test`, `npm run build`, `npm run lint`, `npm run logics:validate`, `npm run playtest:ai -- --agents 6 --seasons 1 --rounds 2 --league-size 3 --report reports/playtest/brain-refactor-ai-smoke.md`, `npm run playtest:simulate -- --players 3 --rounds 1`, and `npm run playtest:browser -- --rounds 2 --report reports/playtest/browser-playtest-smoke.md` passed.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- 2026-07-26: `npm run typecheck`, `npm test`, `npm run build`, `npm run lint`, `npm run logics:validate`, `npm run playtest:ai -- --agents 6 --seasons 1 --rounds 2 --league-size 3 --report reports/playtest/brain-refactor-ai-smoke.md`, `npm run playtest:simulate -- --players 3 --rounds 1`, and `npm run playtest:browser -- --rounds 2 --report reports/playtest/browser-playtest-smoke.md` passed.
- Finish workflow executed on 2026-07-26.
- Linked backlog/request close verification passed.

# Report
- 2026-07-26: started the browser playtest corpus and completed the first shared-brain wave. Added `scripts/playtestBrain.ts` as the single source for the 14 playtest personas, headless decision heuristics, multiplayer-store decision helpers, card-buying choices, and fun/frustration scoring. Refactored `scripts/ai-playtest.ts` and `scripts/simulate-playtest.ts` to consume it, and restored `simulate-playtest` compatibility with current profile ownership by propagating recovery codes from `createProfile` into league creation/join. Proof so far: `npm run typecheck`, `npm run lint`, `npm run playtest:ai -- --agents 6 --seasons 1 --rounds 2 --league-size 3 --report reports/playtest/brain-refactor-ai-smoke.md`, and `npm run playtest:simulate -- --players 3 --rounds 1`.
- 2026-07-26: added `scripts/browser-playtest.ts` and `npm run playtest:browser`. The runner starts/reuses real API + web servers, seeds only the profile session because local email recovery has no browser-visible delivery channel, then uses browser UI actions for league creation, plan choice from the shared brain, plan submission, GP launch/replay, Garage card buy, next GP, and Championship return. It emits `reports/playtest/browser-playtest-smoke.md` with fun/frustration metrics plus UI failure capture. Smoke proof: `npm run playtest:browser -- --rounds 2 --report reports/playtest/browser-playtest-smoke.md` passed with no UI failures.
- Finished on 2026-07-26.
- Linked backlog item(s): `item_292_extract_the_shared_playtest_brain_decisions_fun_frustration_into_one_module`, `item_293_build_the_playwright_browser_agent_that_plays_the_real_ui_from_the_shared_brain`, `item_294_instrument_the_browser_run_fun_frustration_report_ui_failure_capture_npm_wiring`
- Related request(s): `req_119_browser_driven_ai_playtest_an_agent_that_plays_the_real_ui_like_a_human_decisions_from_the_shared_playtest_brain`

# AI Context
- Summary: Orchestrate the browser-driven AI playtest
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_119_browser_driven_ai_playtest_an_agent_that_plays_the_real_ui_like_a_human_decisions_from_the_shared_playtest_brain`
- Product brief(s): `prod_071_ai_playtest_surfaces_product_brief`
- Architecture decision(s): (none yet)
