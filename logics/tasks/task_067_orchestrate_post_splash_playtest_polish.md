## task_067_orchestrate_post_splash_playtest_polish - Orchestrate post-splash playtest polish
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
- [x] 1. Capture the current 360px/390px splash header layout and desktop background framing, then define the smallest scoped CSS adjustment.
- [x] 2. Apply splash-only mobile header compacting and desktop height-fit background blending; extend e2e coverage for no overflow, visible language controls, and desktop framing.
- [x] 3. Centralize locale initialization/change handling between the splash wrapper and entered app without changing the persisted language key.
- [x] 4. Fix the App.tsx React Hooks exhaustive-deps warning while preserving onboarding tests.
- [x] 5. Run typecheck, tests, build, lint, e2e, and Logics validation; record proof at closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_159_compact_the_splash_header_on_narrow_mobile`
- `item_160_clean_up_app_root_locale_ownership_and_hooks_warning`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> `item_159_compact_the_splash_header_on_narrow_mobile`. Proof: splash-scoped mobile CSS hides the nonessential language label, tightens header spacing, and e2e asserts no overflow/header bounds at 390px.
- request-AC2 -> `item_159_compact_the_splash_header_on_narrow_mobile`. Proof: desktop still uses `SetupTopbar` + `LanguageSwitcher`, and the language switcher remains visible in the desktop e2e splash path.
- request-AC3 -> `item_159_compact_the_splash_header_on_narrow_mobile`. Proof: desktop `.home-splash-background` now uses `object-fit: contain`, with a blurred cover layer behind it to blend side fill; e2e asserts desktop `contain` and full-height background bounds.
- request-AC4 -> `item_160_clean_up_app_root_locale_ownership_and_hooks_warning`. Proof: `App` owns locale state via one `initialLocale()` path and passes locale/change handling into the entered app body.
- request-AC5 -> `item_160_clean_up_app_root_locale_ownership_and_hooks_warning`. Proof: onboarding helpers are stable callbacks declared in the onboarding effect dependencies; `rtk npm run lint` passes with no App.tsx warning.
- request-AC6 -> This task. Proof: App/profile/i18n targeted tests and private-league e2e flow passed after the root shell and splash CSS changes.
- request-AC7 -> This task. Proof: `rtk npm run typecheck`, `rtk npm test`, `rtk npm run build`, `rtk npm run lint`, `rtk npm run test:e2e`, and `rtk npm run logics:validate` passed after implementation.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.
- 2026-07-20 wave 1 targeted proof: `rtk npm run typecheck` passed; `rtk npm test -- apps/web/src/app/App.test.tsx apps/web/src/app/App.profile.test.tsx apps/web/src/app/routes.test.ts apps/web/src/i18n/index.test.ts` passed (52 tests); `rtk npm run lint` passed with no warnings; `rtk npm run test:e2e` passed (4 tests).
- 2026-07-20 full proof: `rtk npm test` passed (199 tests, 4 skipped); `rtk npm run build` passed; `rtk npm run logics:validate` passed before closeout with only deferred request traceability warnings.
- command: `rtk npm run logics:validate` | result: passed: lint ok, audit ok | date: 2026-07-20
- Finish workflow executed on 2026-07-20.
- Linked backlog/request close verification passed.

# Report
- Wave 1 implemented: desktop splash background fits by height with blended side fill, mobile splash header is compacted with scoped CSS, locale ownership is centralized in App, and the App.tsx Hooks warning is removed.
- Finished on 2026-07-20.
- Linked backlog item(s): `item_159_compact_the_splash_header_on_narrow_mobile`, `item_160_clean_up_app_root_locale_ownership_and_hooks_warning`
- Related request(s): `req_066_post_splash_playtest_polish_mobile_header_and_root_shell_cleanup`

# AI Context
- Summary: Orchestrate post-splash playtest polish
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_066_post_splash_playtest_polish_mobile_header_and_root_shell_cleanup`
- Product brief(s): `prod_030_post_splash_playtest_polish_product_brief`
- Architecture decision(s): (none yet)
