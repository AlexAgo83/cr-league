## task_066_orchestrate_the_home_splash_landing_screen - Orchestrate the home splash landing screen
> From version: 0.3.11
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
- [x] 1. Define the single start-URL gate aligned with parseAppRoute and add the thin additive 'entered' wrapper around the app root render.
- [x] 2. Compose the splash header from SetupTopbar + LanguageSwitcher and lay out the covering background with the two overlaid title assets.
- [x] 3. Add independent float keyframes for CR and League with a prefers-reduced-motion off-switch; style PRESS START from existing theme tokens and add en/fr labels.
- [x] 4. Wire PRESS START to enter the default screen unchanged; add the show/bypass/dismiss render test.
- [x] 5. Keep the root-path change additive to rebase cleanly against Codex's shell decomposition.
- [x] 6. Run typecheck, tests, build, lint, e2e, and Logics validation; record proof at closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_157_gate_a_home_splash_on_the_start_url_with_deep_link_bypass`
- `item_158_build_the_splash_layout_header_covering_background_floating_titles_press_start`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> `item_157_gate_a_home_splash_on_the_start_url_with_deep_link_bypass`, `item_158_build_the_splash_layout_header_covering_background_floating_titles_press_start`. Proof: root `/` renders `HomeSplash` with `SetupTopbar`, `LanguageSwitcher`, cover background, and overlaid CR/League title images; unit and e2e tests assert root visibility and no horizontal scroll.
- request-AC2 -> `item_158_build_the_splash_layout_header_covering_background_floating_titles_press_start`. Proof: `.home-splash-title-cr` and `.home-splash-title-league` use independent CSS keyframes with different timings/phases, and `prefers-reduced-motion: reduce` disables both animations.
- request-AC3 -> `item_157_gate_a_home_splash_on_the_start_url_with_deep_link_bypass`, `item_158_build_the_splash_layout_header_covering_background_floating_titles_press_start`. Proof: PRESS START flips the in-memory `entered` flag and renders the unchanged app body; tests assert the default create-profile screen appears.
- request-AC4 -> `item_157_gate_a_home_splash_on_the_start_url_with_deep_link_bypass`. Proof: `isStartPath()` only accepts root/empty paths, and tests assert `/garage` bypasses the splash.
- request-AC5 -> `item_158_build_the_splash_layout_header_covering_background_floating_titles_press_start`. Proof: splash language switch writes `cr-league-language`, updates splash labels, and the app reads the same locale after PRESS START; unit test covers French carry-through.
- request-AC6 -> This task. Proof: `rtk npm run typecheck`, `rtk npm test`, `rtk npm run build`, `rtk npm run lint`, `rtk npm run test:e2e`, and `rtk npm run logics:validate` passed after implementation.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- 2026-07-20 wave 1 targeted proof: `rtk npm run typecheck` passed; `rtk npm test -- apps/web/src/app/App.test.tsx apps/web/src/app/App.profile.test.tsx apps/web/src/app/routes.test.ts apps/web/src/i18n/index.test.ts` passed (52 tests); `rtk npm run test:e2e` passed (4 tests).
- 2026-07-20 full proof: `rtk npm test` passed (199 tests, 4 skipped); `rtk npm run build` passed; `rtk npm run lint` passed with the existing App.tsx React Hooks warning; `rtk npm run logics:validate` passed with only deferred req_065 warnings before closeout.
- command: `rtk npm run logics:validate` | result: passed: lint ok, audit ok | date: 2026-07-20
- Finish workflow executed on 2026-07-20.
- Linked backlog/request close verification passed.

# Report
- Wave 1 implemented: root-only home splash gate, deep-link bypass, Profile-style header reuse, cover background, animated CR/League title assets with reduced-motion guard, themed PRESS START, language carry-through, and e2e splash assertions.
- Finished on 2026-07-20.
- Linked backlog item(s): `item_157_gate_a_home_splash_on_the_start_url_with_deep_link_bypass`, `item_158_build_the_splash_layout_header_covering_background_floating_titles_press_start`
- Related request(s): `req_065_home_splash_landing_screen_with_floating_title_and_press_start`

# AI Context
- Summary: Orchestrate the home splash landing screen
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_065_home_splash_landing_screen_with_floating_title_and_press_start`
- Product brief(s): `prod_029_home_splash_landing_screen_product_brief`
- Architecture decision(s): (none yet)
