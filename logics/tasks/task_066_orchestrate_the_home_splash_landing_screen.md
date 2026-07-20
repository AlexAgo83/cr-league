## task_066_orchestrate_the_home_splash_landing_screen - Orchestrate the home splash landing screen
> From version: 0.3.11
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 70%
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
- [ ] 5. Keep the root-path change additive to rebase cleanly against Codex's shell decomposition.
- [ ] 6. Run typecheck, tests, build, lint, e2e, and Logics validation; record proof at closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_157_gate_a_home_splash_on_the_start_url_with_deep_link_bypass`
- `item_158_build_the_splash_layout_header_covering_background_floating_titles_press_start`

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
- 2026-07-20 wave 1 targeted proof: `rtk npm run typecheck` passed; `rtk npm test -- apps/web/src/app/App.test.tsx apps/web/src/app/App.profile.test.tsx apps/web/src/app/routes.test.ts apps/web/src/i18n/index.test.ts` passed (52 tests); `rtk npm run test:e2e` passed (4 tests).

# Report
- Wave 1 implemented: root-only home splash gate, deep-link bypass, Profile-style header reuse, cover background, animated CR/League title assets with reduced-motion guard, themed PRESS START, language carry-through, and e2e splash assertions.

# AI Context
- Summary: Orchestrate the home splash landing screen
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_065_home_splash_landing_screen_with_floating_title_and_press_start`
- Product brief(s): `prod_029_home_splash_landing_screen_product_brief`
- Architecture decision(s): (none yet)
