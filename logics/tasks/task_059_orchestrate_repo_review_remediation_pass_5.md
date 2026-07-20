## task_059_orchestrate_repo_review_remediation_pass_5 - Orchestrate repo review remediation pass 5
> From version: 0.3.11
> Schema version: 1.0
> Status: In progress
> Understanding: 96
> Confidence: 90
> Progress: 99
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Read req_045 and its orchestration task first; this pass extends the same store patterns (runWrite, guarded updateMany, memory-db compatibility) and must not regress pass-4 behavior.
- [ ] 2. Land the API items first: recovery hardening (new code format, scrypt, rate limiter, legacy upgrade), then trust-boundary and restartLeague atomicity fixes, keeping the in-memory suite green.
- [ ] 3. Add the eslint react-hooks and jsx-a11y plugins before touching the web code so the decomposition is policed by the new rules from the start.
- [ ] 4. Decompose App.tsx into domain hooks and view containers, fix the rejoin effect, dedupe rejoin, collapse command-clicked state, swap window.confirm for the Modal; then split ReplayView with useReplayClock.
- [ ] 5. Build the Postgres integration suite and its CI job (services: postgres, migrate deploy, concurrency scenarios including the restart rollback), and clean the unit lane's DATABASE_URL.
- [ ] 6. Finish the infra sweep: Dependabot, npm audit gate, vitest coverage in CI, release health-check hard-fail, engines field, reports/ gitignore policy.
- [ ] 7. Run typecheck, tests, build, lint, e2e, and Logics validation; record proof at closeout and update the roadmap patch statuses.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_135_brute_force_resistant_account_recovery`
- `item_136_api_trust_boundary_and_atomicity_fixes`
- `item_137_decompose_app_tsx_into_domain_hooks_and_views`
- `item_138_split_replayview_and_extract_the_replay_clock`
- `item_139_postgres_integration_test_ci_lane_for_concurrent_store_paths`
- `item_140_ci_lint_and_release_gate_hardening`

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
- 2026-07-20 wave 22 full validation: rtk npm test passed (21 files, 172 tests), rtk npm run build passed, and rtk npm run logics:validate passed with 0 blocking issues.
- 2026-07-20 wave 23 targeted validation: rtk npm run typecheck, rtk npm run lint, and rtk npm test -- apps/web/src/app/App.test.tsx apps/web/src/app/App.profile.test.tsx passed after plan-form and race-derivation extraction.

# Report
- Implementation complete.
- 2026-07-20 wave 1: implemented item_135 recovery hardening baseline: 16-byte recovery codes, salted scrypt hash format with legacy SHA-256 upgrade, in-process email/IP limiter on /profiles/recover, admin reset using the shared generator, and API tests for length, legacy upgrade, and 429 lockout. Targeted verification: rtk npm test -- apps/api/src/app.admin.test.ts; rtk npm run typecheck; rtk npm run lint.
- 2026-07-20 wave 2: implemented part of item_136: localhost CORS is only whitelisted for local WEB_ORIGIN, admin bearer token uses timingSafeEqual, public league reads return league.code as null while claimed/admin responses keep the invite code, and restartLeague now performs its delete/update/create reset sequence inside runWrite. Remaining item_136 work: replace bare profileId trust for create/join with a profile-ownership proof contract.
- 2026-07-20 wave 3: completed the remaining API identity part of item_136 by requiring recoveryCode proof whenever createDemoLeague or joinLeagueByCode receives a profileId. Successful profile recovery now returns the submitted recovery code so recovered local sessions can keep proving profile ownership. Web create/join payloads pass the stored recovery code; API tests cover bare/wrong profile proof rejection.
- 2026-07-20 wave 4: implemented the first CI/release hardening slice from item_140: package.json now declares Node >=20, Dependabot monitors npm and GitHub Actions, CI quality runs npm audit --audit-level=high, the previous global DATABASE_URL placeholder was removed from unit CI, and deploy-release now fails if API health never reports the release version and commit. Remaining item_140 work: coverage surfacing, react-hooks/jsx-a11y lint rules, and reports/ policy.
- 2026-07-20 wave 5: completed the remaining item_140 lint/coverage/report-policy slice: added eslint-plugin-react-hooks and eslint-plugin-jsx-a11y, enabled hooks rules and jsx-a11y recommended checks, fixed the surfaced alt/backdrop issues, configured Vitest V8 coverage with text/json-summary output, CI unit lanes now run with --coverage, and .gitignore now ignores generated coverage plus local report artifacts while keeping the committed playtest report explicit.
- 2026-07-20 wave 6: implemented item_139 Postgres integration lane. Added apps/api/src/app.postgres.test.ts gated by POSTGRES_INTEGRATION=1, covering real Postgres row-lock serialization for concurrent qualifying, single-winner resolve transition claim, and credit-guarded concurrent card purchase. CI now runs a postgres:16 service, migrate deploy, and the integration spec with DATABASE_URL schema=cr_league. Local proof used a temporary docker postgres on port 55432; migrations and the 3-test integration spec passed.
- 2026-07-20 wave 7: started item_137 App.tsx decomposition/hook cleanup. Collapsed seven command-clicked booleans into a typed commandClicks map, centralized reset/mark helpers, deduplicated /leagues/rejoin through rejoinClaim, and changed automatic rejoin to use an initial local-storage snapshot so the react-hooks stale-closure warning is gone without repeated background rejoins. Targeted proof: App.test.tsx and App.profile.test.tsx pass; lint now has only ReplayView hook warnings.
- 2026-07-20 wave 8: started item_138 ReplayView split by extracting the playback clock into apps/web/src/features/replay/useReplayClock.ts. The hook now owns SMIL rAF playback, play/pause/speed state, seek/restart, live lap/segment updates, and position-pop timer cleanup; ReplayView consumes the hook state and callbacks. Lint is now clean with the previous ReplayView exhaustive-deps warnings removed. Remaining item_138 work: move scrubber/tower/stage sub-components and reduce ReplayView.tsx toward composition size.
- 2026-07-20 wave 9: continued item_138 by moving the replay timing tower and scrubber/timeline rendering into apps/web/src/features/replay/ReplayTower.tsx and ReplayProgress.tsx. ReplayView now delegates tower livery/delta rendering and progress input/weather/director markers to focused components; replay folder files stay under 400 lines and ReplayView.tsx is reduced to 941 lines. Remaining item_138 work: extract the larger replay stage/overlay composition and continue reducing ReplayView toward a composition file.
- 2026-07-20 wave 10: continued item_138 by extracting the replay stage overlay into apps/web/src/features/replay/ReplayStageOverlay.tsx. ReplayView now passes precomputed director, moment, player-focus, tower, and timeline props into a presentation component; the stage controls, map info stack, active moment card, director panel, focus panel, tower slot, and replay progress bar are no longer inline. ReplayView.tsx is now 815 lines and all replay/ files remain under 400 lines. Remaining: one final pass to reduce ReplayView's derived-data section before closing item_138.
- 2026-07-20 wave 11: continued item_137 by replacing the restartLeague window.confirm with a RestartConfirmModal, extracting SeasonRecapModal and LeagueControlsModal into apps/web/src/app/AppModals.tsx, updating the App test to confirm restart through the dialog, and deleting empty apps/web/src/lib and apps/web/src/ui .gitkeep placeholders. Targeted proof: rtk npm run typecheck, rtk npm run lint, and rtk npm test -- apps/web/src/app/App.test.tsx apps/web/src/app/App.profile.test.tsx passed. Remaining item_137 work: larger App.tsx decomposition toward the <700-line AC.
- 2026-07-20 wave 12: continued item_137 by moving the simple App modals into AppModals.tsx: profile code, logout, preferences reset, technical error, directive confirm, qualifying confirm, next Grand Prix confirm, and admin delete. App.tsx is now 1714 lines; AppModals.tsx is 286 lines. Targeted proof: rtk npm run typecheck, rtk npm run lint, and App/App.profile tests passed. Remaining: App.tsx still needs larger view/domain extraction to satisfy the <700-line AC.
- 2026-07-20 wave 13: continued item_137 by extracting the drive screen JSX into apps/web/src/app/DriveView.tsx while keeping App as the state/mutation owner. DriveView contains the qualifying replay, circuit map overlay, qualifying times, final classification, and drive action controls; App.tsx is now 1496 lines and DriveView.tsx is 389 lines. Targeted proof: rtk npm run typecheck, rtk npm run lint, and App/App.profile tests passed.
- 2026-07-20 wave 14: continued item_137 by extracting the non-drive view selector into apps/web/src/app/GameViews.tsx. Result, plan, championship, garage, admin, and changelog rendering now sit behind a single presentation wrapper while App remains the state/mutation owner. App.tsx is now 1468 lines and GameViews.tsx is 190 lines. Targeted proof: rtk npm run typecheck, rtk npm run lint, and App/App.profile tests passed.
- 2026-07-20 wave 15: continued item_137 by moving the launch Grand Prix confirmation modal into AppModals.tsx as ResolveGrandPrixConfirmModal. The starting-grid preview and confirm action now live with the other App modal presentations; App.tsx is 1437 lines and AppModals.tsx is 365 lines. Targeted proof: rtk npm run typecheck, rtk npm run lint, and App/App.profile tests passed.
- 2026-07-20 wave 16: continued item_137 by extracting the profile/league setup gate into apps/web/src/app/SetupGate.tsx. SetupGate now owns the no-profile and no-league presentation paths while App keeps the handlers and state. App.tsx is 1410 lines and SetupGate.tsx is 134 lines. Targeted proof: rtk npm run typecheck, rtk npm run lint, and App/App.profile tests passed.
- 2026-07-20 wave 17: continued item_137 by extracting league/team race mutations into apps/web/src/app/leagueMutations.ts. App still owns UI state, run(), profile/admin flows, and modal open/close wrappers, while update settings, resolve, next GP, card buy/sell, livery/name update, and restart state mutation moved out. App.tsx is now 1301 lines and leagueMutations.ts is 206 lines. Targeted proof: rtk npm run typecheck, rtk npm run lint, and App/App.profile tests passed.
- 2026-07-20 wave 18: continued item_137 by extracting admin API actions into apps/web/src/app/adminActions.ts. Admin console open/refresh, recovery reset, user delete, and league inspect now live outside App while App keeps admin state and presentation wiring. App.tsx is now 1237 lines and adminActions.ts is 116 lines. Targeted proof: rtk npm run typecheck, rtk npm run lint, and App/App.profile tests passed.
- 2026-07-20 wave 19: continued item_137 by extracting profile create/recovery actions into apps/web/src/app/profileActions.ts. Profile form validation, profile API error mapping, session storage, and recovered-claims storage moved out; App keeps rejoin and admin-status probing because they depend on current league state and hook timing. App.tsx is now 1184 lines and profileActions.ts is 95 lines. Targeted proof: rtk npm run typecheck, rtk npm run lint, and App/App.profile tests passed.
- 2026-07-20 wave 20: continued item_137 by extracting app chrome into apps/web/src/app/AppChrome.tsx. LanguageSwitcher, ProfileMenu, SetupTopbar, and GameTopbar now own the topbar/profile-menu JSX while App keeps navigation and modal callbacks. App.tsx is now 1084 lines and AppChrome.tsx is 181 lines. Targeted proof: rtk npm run typecheck, rtk npm run lint, and App/App.profile tests passed.
- 2026-07-20 wave 21: continued item_137 by extracting notification and overlay assembly into AppChrome.tsx and apps/web/src/app/AppOverlays.tsx. NotificationStack now owns toast rendering; AppOverlays owns profile/error/directive/qualifying/next-GP/season/settings/restart/onboarding/admin-delete modal composition. App.tsx is now 1042 lines and AppOverlays.tsx is 166 lines. Targeted proof: rtk npm run typecheck, rtk npm run lint, and App/App.profile tests passed.
- 2026-07-20 wave 22: continued item_137 by extracting local player-claim helpers into apps/web/src/app/claimHelpers.ts. rememberPlayerClaim, withCurrentPlayer, and withoutPlayerClaim now own claim persistence/restoration while App keeps the rejoin side effect and stale-error handling. App.tsx is now 1034 lines and claimHelpers.ts is 22 lines. Targeted proof: rtk npm run typecheck, rtk npm run lint, and App/App.profile/helpers tests passed.
- 2026-07-20 wave 23: continued item_137 by extracting persisted plan-form state into apps/web/src/app/usePlanForm.ts and race-derived view-model calculations into apps/web/src/app/useRaceDerivations.ts. App.tsx is now 968 lines; the new files are 39 and 127 lines. Targeted proof: rtk npm run typecheck, rtk npm run lint, and App/App.profile tests passed. Remaining item_137 work: App.tsx still needs a larger app shell/controller split to reach the ~700-line AC.

# AI Context
- Summary: Orchestrate repo review remediation pass 5
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_058_repo_review_remediation_pass_5_account_security_api_trust_boundaries_web_decomposition_and_ci_hardening`
- Product brief(s): `prod_022_repo_review_remediation_pass_5_product_brief`
- Architecture decision(s): (none yet)
