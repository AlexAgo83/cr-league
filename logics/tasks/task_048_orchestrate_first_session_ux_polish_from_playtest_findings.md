## task_048_orchestrate_first_session_ux_polish_from_playtest_findings - Orchestrate first-session UX polish from playtest findings
> From version: 0.3.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex-work4

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Read `App.tsx`, notification CSS, Race mobile layout CSS, qualifying state flow, `ReplayView.tsx`, onboarding copy, i18n files, and current App/e2e tests before editing.
- [x] 2. Fix notification lifecycle and placement first, because stale stacked toasts distort every other playtest screen.
- [x] 3. Polish mobile Race guidance once notification overlap is removed, keeping the circuit prominent while making step instructions readable.
- [x] 4. Replace automatic qualifying replay with the compact result flow, then keep explicit replay review working.
- [x] 5. Add the deterministic replay grid-start beat in the existing replay presentation layer without changing simulation truth.
- [x] 6. Update onboarding copy/CTA hierarchy while preserving profile recovery and saved-league flows.
- [x] 7. Run focused tests after each wave, then the full gate: typecheck, lint, unit tests, build, e2e, i18n validation, and Logics validation.
- [x] 8. Record playtest proof with desktop/mobile screenshots or e2e observations for the five user-facing fixes.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_108_replace_stale_notification_stacking_with_command_lifecycle_feedback`
- `item_109_make_mobile_race_guidance_readable_without_shrinking_the_circuit`
- `item_110_replace_automatic_chrono_replay_with_a_compact_qualifying_result_flow`
- `item_111_add_a_readable_staged_grid_start_beat_to_race_replay`
- `item_112_lead_onboarding_with_the_league_promise_before_profile_mechanics`

# Definition of Done (DoD)
- [x] Notification lifecycle replacement is implemented and verified before other UX polish work.
- [x] Mobile Race guidance is readable and accessible at 390px width.
- [x] Qualifying runs land on a compact result state by default and still support explicit replay review.
- [x] Replay starts with a deterministic readable grid-start beat without changing race truth.
- [x] Onboarding leads with the racing-league promise while preserving profile recovery and saved-league flows.
- [x] Playtest proof covers desktop and mobile for the five user-facing fixes.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `pushNotification` now keeps one transient command notification, replaces stale pending text with success, auto-dismisses success after 4s, and keeps errors persistent/dismissible; covered by `App.test.tsx`.
- request-AC2 -> This task. Proof: notification stack moved to top of authenticated app, setup shell remains bottom-scoped, and e2e replay layout separation passed.
- request-AC3 -> This task. Proof: mobile `.map-workflow-panel` uses a one-column readable bottom sheet at 390px with normal wrapping; `test:e2e` records mobile drive screenshots.
- request-AC4 -> This task. Proof: qualifying now shows `qualifying-result-panel` by default with rank/attempt/lap/actions, while `Review lap time` explicitly opens `ReplayView`; covered by `App.test.tsx`.
- request-AC5 -> This task. Proof: replay uses deterministic `gridStartCarProgress`/`applyGridStart` presentation only; covered by `ReplayView.test.ts`.
- request-AC6 -> This task. Proof: onboarding copy now leads with private championship promise while profile creation/recovery flows remain covered by existing App tests.
- request-AC7 -> This task. Proof: notifications retain live region and close labels, modals keep labelled actions, mobile guidance remains text-readable, and duplicate replay result/circuit actions have distinct accessible names.
- request-AC8 -> This task. Proof: focused coverage in `App.test.tsx` and `ReplayView.test.ts` covers notification lifecycle, qualifying result flow, onboarding copy, and grid-start determinism.
- request-AC9 -> This task. Proof: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`, `logics-manager i18n validate`, and `npm run logics:validate` passed.
- request-AC10 -> This task. Proof: Playwright e2e records desktop/mobile drive and replay layout screenshots/observations under `test-results/`.

# Validation
- Run `npm run typecheck`.
- Run `npm run lint`.
- Run `npm test`.
- Run `npm run build`.
- Run `npm run test:e2e`.
- Run `logics-manager i18n validate`.
- Run `npm run logics:validate`.
- Validation passed: npm run typecheck, npm run lint, npm test, npm run build, npm run test:e2e, logics-manager i18n validate, npm run logics:validate.
- Finish workflow executed on 2026-07-18.
- Linked backlog/request close verification passed.

# Report
- Delivered in commits `0ada1c5`, `6e201e9`, and the final closeout commit. Notifications no longer stack stale command states; Race mobile guidance wraps at readable size; qualifying opens on a compact result summary; onboarding leads with the league promise; replay grid-start staging is supplied by the replay spectacle layer. Full validation passed.
- Finished on 2026-07-18.
- Linked backlog item(s): `item_108_replace_stale_notification_stacking_with_command_lifecycle_feedback`, `item_109_make_mobile_race_guidance_readable_without_shrinking_the_circuit`, `item_110_replace_automatic_chrono_replay_with_a_compact_qualifying_result_flow`, `item_111_add_a_readable_staged_grid_start_beat_to_race_replay`, `item_112_lead_onboarding_with_the_league_promise_before_profile_mechanics`
- Related request(s): `req_047_polish_first_session_ux_after_playtest_findings`

# AI Context
- Summary: Orchestrate first-session UX polish from playtest findings
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_047_polish_first_session_ux_after_playtest_findings`
- Product brief(s): `prod_018_first_session_ux_polish_product_brief`
- Architecture decision(s): (none yet)
