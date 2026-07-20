## task_063_orchestrate_replay_suspense_and_first_contact_polish - Orchestrate replay suspense and first-contact polish
> From version: 0.3.11
> Schema version: 1.0
> Status: Done
> Understanding: 90
> Confidence: 85
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.
- Wave 1 sequencing: req_058/useReplayClock split has landed, so the payoff gate was implemented in current `ReplayView` around the existing clock state and `afterMapContent` boundary. req_060/report verdict is already present; the report shortcut is gated before it can reveal that content mid-replay.

# Plan
- [x] 1. Check the landing order against req_058 (ReplayView split) and req_060 (verdict block); rebase the payoff gating onto useReplayClock if the split has landed, otherwise implement on current ReplayView and note it for the split.
- [x] 2. Implement the payoff completion gate with its skip control and test.
- [x] 3. Land the first-contact fixes (one-click chrono, Enter submit, intro persistence) with their test updates.
- [x] 4. Fix the attempt labels and key-moment grouping with helper tests.
- [x] 5. Implement plan-lock safety (item_153): Send plan confirmation with plan summary and unused-card warning, visible locked state on the plan screen, carried-over-plan label, and the finished-GP reopen-on-summary behavior with a labeled replay exit (item_149 extension).
- [x] 6. Run typecheck, tests, build, lint, e2e, and Logics validation; record proof at closeout and mark roadmap patch 0.3.18 shipped when released.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_149_gate_the_race_payoff_on_replay_completion`
- `item_150_first_contact_frictions_one_click_chrono_enter_submits_intros_persist`
- `item_151_readability_papercuts_attempt_rank_labels_and_key_moment_variety`
- `item_153_replay_suspense_and_first_contact_polish_from_the_2026_07_20_ai_playtest`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> `ReplayView`/`ResultView` payoff gate. Proof: replay payoff and report shortcut stay hidden until completion or Skip to result; covered by `apps/web/src/app/App.test.tsx`.
- request-AC2 -> `raceActions.openQualifyingRun`. Proof: first chrono runs directly while attempts remain and confirmation stays for the last attempt; covered by `apps/web/src/app/App.test.tsx`.
- request-AC3 -> `SetupViews` forms. Proof: profile create/recover and league create/join submit through native form submit; covered by `apps/web/src/app/App.test.tsx` and `apps/web/src/app/App.profile.test.tsx`.
- request-AC4 -> league-scoped onboarding persistence. Proof: plain close stores scoped intro keys and reset clears them; covered by `apps/web/src/app/App.test.tsx`.
- request-AC5 -> chrono labels and report moments. Proof: chrono ranks render as `#` labels without race `P` badges, and key moments dedupe same displayed lap/event type while preferring variety; covered by `apps/web/src/app/App.test.tsx` and `apps/web/src/features/ReportView.test.tsx`.
- request-AC6 -> plan-lock safety. Proof: Send plan always confirms the selected approach/preparation/pit/card summary, warns on unused inventory card, shows a locked note after send, and labels carried-over plans for the first Plan visit only; covered by `apps/web/src/app/App.test.tsx`.
- request-AC7 -> replay return. Proof: normal reload/open of a resolved current GP lands on the finished summary with Replay one click away, explicit replay routes still open replay, and the replay exit has visible Back to circuit text; covered by `apps/web/src/app/App.test.tsx` and `apps/web/src/app/App.profile.test.tsx`.
- request-AC8 -> validation. Proof: `rtk npm run typecheck`, `rtk npm test`, `rtk npm run build`, `rtk npm run lint`, `rtk npm run test:e2e`, `rtk npm run logics:validate`, `rtk logics-manager lint --require-status`, and `rtk logics-manager audit --group-by-doc` passed after implementation; lint/audit keep known non-blocking warnings only.

# Validation
- `rtk npm run typecheck`: passed.
- `rtk npm test`: passed, 23 files passed, 1 skipped; 187 tests passed, 4 skipped.
- `rtk npm run build`: passed.
- `rtk npm run lint`: passed with the existing React Hooks warning in `apps/web/src/app/App.tsx`.
- `rtk npm run test:e2e`: passed, 4 Playwright tests.
- `rtk npm run logics:validate`: passed.
- `rtk logics-manager lint --require-status`: passed.
- `rtk logics-manager audit --group-by-doc`: passed with non-blocking warnings before task closeout.
- typecheck, unit tests, build, lint, e2e, logics validate, lint, and audit passed; audit warnings only concern unrelated future requests req_064 and req_065
- Finish workflow executed on 2026-07-20.
- Linked backlog/request close verification passed.

# Report
- Wave 1 implementation: gated `ReplayView` payoff content and report shortcut until replay completion or explicit skip; added EN/FR skip/result-locked copy.
- Wave 1 validation passed: `rtk npm run typecheck`; `rtk npm test -- apps/web/src/app/App.test.tsx apps/web/src/i18n/index.test.ts`.
- Wave 2 implementation: one-click chrono except final-attempt confirmation, native form submit semantics for setup forms, and league-scoped intro persistence on plain close.
- Wave 2 validation passed: `rtk npm run typecheck`; `rtk npm test -- apps/web/src/app/App.test.tsx apps/web/src/app/App.profile.test.tsx apps/web/src/i18n/index.test.ts`.
- Wave 3 implementation: chrono rows no longer use `PositionBadge`; report key moments deduplicate same displayed lap/event type and prefer type variety.
- Wave 3 validation passed: `rtk npm run typecheck`; `rtk npm test -- apps/web/src/features/ReportView.test.tsx apps/web/src/app/App.test.tsx apps/web/src/i18n/index.test.ts`.
- Wave 4 implementation: finished GPs loaded from normal app entry now land on the result summary, replay remains one click away, and the replay exit has visible Back to circuit text. Send plan always confirms with the selected approach/preparation/pit/card summary, plan lock is explicit on the plan screen, and carried-over plans are labeled on the first plan visit of the new GP only.
- Wave 4 validation passed: `rtk npm run typecheck`; `rtk npm test -- apps/web/src/app/App.test.tsx apps/web/src/app/App.profile.test.tsx apps/web/src/i18n/index.test.ts`.
- Closeout validation passed: `rtk npm run typecheck`; `rtk npm test`; `rtk npm run build`; `rtk npm run lint`; `rtk npm run test:e2e`; `rtk npm run logics:validate`; `rtk logics-manager lint --require-status`; `rtk logics-manager audit --group-by-doc`.
- Finished on 2026-07-20.
- Linked backlog item(s): `item_149_gate_the_race_payoff_on_replay_completion`, `item_150_first_contact_frictions_one_click_chrono_enter_submits_intros_persist`, `item_151_readability_papercuts_attempt_rank_labels_and_key_moment_variety`, `item_153_replay_suspense_and_first_contact_polish_from_the_2026_07_20_ai_playtest`
- Related request(s): `req_062_replay_suspense_and_first_contact_polish_from_the_2026_07_20_ai_playtest`

# AI Context
- Summary: Orchestrate replay suspense and first-contact polish
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_062_replay_suspense_and_first_contact_polish_from_the_2026_07_20_ai_playtest`
- Product brief(s): `prod_026_replay_suspense_and_first_contact_polish_product_brief`
- Architecture decision(s): (none yet)
