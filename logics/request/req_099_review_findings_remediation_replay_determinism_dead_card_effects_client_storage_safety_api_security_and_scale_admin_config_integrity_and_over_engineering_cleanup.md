## req_099_review_findings_remediation_replay_determinism_dead_card_effects_client_storage_safety_api_security_and_scale_admin_config_integrity_and_over_engineering_cleanup - Review-findings remediation: replay determinism, dead card effects, client storage safety, API security and scale, admin config integrity, and over-engineering cleanup
> From version: 0.4.1
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Review-findings remediation
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Restore deterministic replay by making weighted random selection independent of object key order, and pin it with a determinism regression test on resolved weather.
- Resolve the dead positionDelta accumulator so card position-gain effects are either real (fed into classification) or removed, and validate the choice against balance simulation.
- Make the web client survive a browser with storage disabled or full by routing every localStorage access through one safe wrapper.
- Close two unauthenticated-surface security gaps: email header injection in normalizeEmail and account enumeration on POST /profiles.
- Protect the write API from abuse and the admin list endpoints from unbounded reads: add IP rate limiting to unauthenticated writes and push filtering/pagination into the database.
- Make ownerTeamId robust so removing an owner team cannot permanently lock the admin controls, and add the missing validateReplayTrace negative tests.
- Reduce accidental complexity: extract cosmetic replay-trace code out of the simulation core, delete dead exports, and collapse App.tsx's modal booleans into one state.

# Context
- prng.ts: in pickWeightedWithNext (:20) sort entries by key before the total/cursor walk (e.g. entries.sort(([a],[b]) => (a<b?-1:a>b?1:0))) so a forecast with reordered-but-equal keys consumes the same next() draw and returns the same key; the total<=0 fallback (:26) then also indexes a stable order. Keep the LCG as-is (its arithmetic is exact and deterministic); a stronger generator is out of scope for this pass.
- positionDelta: this needs an explicit gameplay decision recorded in the task, not a silent pick. Option A (cards should gain places): incorporate state.positionDelta into the classification sort key so the += writes at simulateRace.ts:855-902 actually change finishing order, then re-run npm run balance:sim and confirm the payout/standings curve stays sane. Option B (abandoned field): delete positionDelta from TeamState (:51), its two initializers (:668,:724), and the 12 += writes. Pick one, justify it in the task plan, and do not leave the field written-but-unread.
- appStorage.ts: add a small safeStorage helper ({get,set,remove} each wrapping localStorage in try/catch — get returns null on failure, set/remove swallow) and route the mount-time reads (loadPlayerClaims, loadProfileSession, loadProfileEmail, initial locale) and the effect writes (usePlanForm.ts:27, useAppNavigation.ts:51/55/59, ReplayView focus, season recap) through it. On read failure the existing null/empty fallbacks already take over, so no new UI branch is needed. No new dependency.
- utils.ts normalizeEmail (:78): replace the email.includes(' ') check with a control/whitespace rejection (/[\s\u0000-\u001f]/.test(email)) so tabs and newlines can never reach the mail transport header. Keep the existing length and @/domain checks.
- routes.ts POST /profiles (:35): return the same neutral response whether or not the email already has a profile, matching the constant-response pattern already used by the recovery endpoints; the real onboarding path does not depend on the distinct error, and this removes the enumeration oracle. Do not weaken the actual duplicate-guard in the DB write.
- Rate limiting: register @fastify/rate-limit (single official plugin, in-memory store) and apply an IP-based limit to the unauthenticated write routes (POST /leagues and the join/decision writes). Ponytail note in scope: in-memory limiter is fine for single-instance; a shared store is a later concern if the API scales horizontally. Do not rate-limit read routes or the already-limited recovery endpoints twice.
- admin/store.ts: push the q filter into a Prisma where (contains on email/name) and page/limit into skip/take on both findMany calls (:15 profiles, :106 leagues) instead of loading the full table and slicing in JS; keep the response shape identical.
- ownerTeamId: on removal of the human team that is a league's ownerTeamId, reassign ownerTeamId to the oldest remaining human team in that league so admin controls stay reachable; if none remains, leave it null and let requireAdminClaim (store.ts:1052) fall back to the oldest human claim rather than hard-403. Add an FK/onDelete consideration in schema.prisma only if it does not require a destructive migration in this pass — otherwise handle it in application code on the delete path.
- validateReplayTrace tests: add validateReplayTrace.test.ts feeding hand-corrupted traces (backwards progress, oversized single-frame jump, missing pit phase, wrong final order, out-of-range distance) and assert the specific error strings, so the replay safety-net has negative coverage instead of only toEqual([]).
- Over-engineering: move the cosmetic replay/trace helpers (createDistanceReplayTrace, applyVisualChronoGaps, annotateTrafficDefense, stabilizeReplayTraceOrders, annotateReplayOvertakes, buildReplayDirectorBeats) from simulateRace.ts into a new packages/shared/src/simulation/replayTrace.ts as a pure move (no behavior change, existing tests stay green); delete the unused normalizeRaceTraits and clampNumber exports from utils.ts; and replace App.tsx's ~10 mutually-exclusive modal booleans (:115-132) with a single activeModal discriminated-union state plus open/close helpers.
- Out of scope: swapping the PRNG algorithm; session auth/CSRF or changing the claim-code model; a distributed/Redis rate-limit store; migrating JSON columns to tables; a broad a11y pass; the single-source-of-truth refactor unifying score-based classification with time-based replay movement (track as a follow-up); adding any dependency other than @fastify/rate-limit.

# Acceptance criteria
- AC1: Weighted selection is independent of weights object key order; two semantically-equal weather forecasts with keys inserted in different orders produce identical resolved weather for the same seed, proven by a determinism regression test.
- AC2: positionDelta is no longer written-but-unread — either it feeds classification (with balance:sim confirming the standings/payout curve) or the field and its writes are deleted — and the chosen option and rationale are recorded in the orchestration task.
- AC3: All localStorage access in apps/web goes through a safe wrapper; the app starts and operates without throwing when localStorage getItem/setItem throw (disabled or quota-exceeded), verified by a test that stubs a throwing storage.
- AC4: normalizeEmail rejects any control/whitespace character so no tab/newline can reach the mail header, and POST /profiles returns a neutral response that no longer reveals whether an email is already registered.
- AC5: Unauthenticated write routes are IP rate-limited, and the admin profile/league list endpoints filter and paginate at the database level (where/skip/take) rather than loading whole tables into memory.
- AC6: Removing a league's owner human team no longer permanently 403s resolve/next-grand-prix/restart (ownerTeamId is reassigned or falls back to another human claim), and validateReplayTrace has negative tests asserting its specific error strings.
- AC7: Cosmetic replay-trace generation lives in its own module out of the simulation core, the dead normalizeRaceTraits/clampNumber exports are gone, and App.tsx's mutually-exclusive dialogs use a single activeModal state.
- AC8: npm run typecheck, npm test, npm run build, npm run lint, and npm run logics:validate all pass, and no existing test is deleted to make them pass.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_062_review_findings_remediation_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- packages/shared/src/simulation/prng.ts
- packages/shared/src/simulation/simulateRace.ts
- packages/shared/src/simulation/validateReplayTrace.ts
- apps/api/src/features/leagues/utils.ts
- apps/api/src/features/leagues/routes.ts
- apps/api/src/features/leagues/store.ts
- apps/api/src/features/admin/store.ts
- apps/api/src/app.ts
- apps/web/src/app/appStorage.ts
- apps/web/src/app/App.tsx
- apps/web/src/app/usePlanForm.ts
- apps/web/src/app/useAppNavigation.ts
- prisma/schema.prisma
- Repo review sweep on 2026-07-23 (HEAD c7bc165, release 0.4.1) run by three parallel reviewers over the API backend, the shared simulation core, and the web frontend. Baseline is healthy: typecheck, eslint, and 272 vitest tests pass; .env is untracked; admin auth is fail-closed with a timing-safe token compare; money paths use FOR UPDATE locks. No Critical issues. Findings worth fixing: (1) DETERMINISM: pickWeightedWithNext (prng.ts:20-38) walks Object.entries(weights), so a semantically-equal weather forecast with keys in a different insertion order yields different weather for the same seed, breaking the deterministic replay the game is built on. (2) GAMEPLAY: TeamState.positionDelta (simulateRace.ts:51) is written by 12 card branches (:855-902 via += ) but never read; classification sorts by scores.score (:332,:442) so cards advertising position gains have zero effect on finishing order. Requires a gameplay decision: either feed positionDelta into the sort key (cards should move you up) or delete the dead field. (3) CLIENT: every localStorage read/write in apps/web is unguarded; reads run at mount (appStorage.ts loadPlayerClaims:79, loadProfileSession:83) so a browser with storage disabled (SecurityError) white-screens the app at startup, and writes in effects (usePlanForm.ts:27, useAppNavigation.ts:51) throw on QuotaExceededError mid-interaction. (4) SECURITY: normalizeEmail (utils.ts:78-87) only rejects literal spaces (email.includes(' ')), letting tabs/newlines through into nodemailer sendMail({to}) as a header-injection surface. (5) SECURITY: POST /profiles (routes.ts:35) returns a distinct 'email already has a profile' error while recovery endpoints are deliberately constant-response, leaking which emails are registered, unauthenticated and unratelimited. (6) SCALE/ABUSE: no rate limiting on unauthenticated write routes (POST /leagues creates a league + team + GP + N bots, plus joins/decisions); only recovery has a limiter, so a script can exhaust the DB. (7) SCALE: admin list endpoints (admin/store.ts:15 profiles, :106 leagues) findMany the whole table then filter/paginate in JS; q/page/limit do no DB-level narrowing. (8) DATA MODEL: ownerTeamId has no FK/onDelete (schema.prisma) and requireAdminClaim (store.ts:1052) requires a human team whose id equals ownerTeamId, so if that owner team is ever removed, resolve/next-grand-prix/restart 403 forever. (9) TESTS: validateReplayTrace has zero negative tests (every caller asserts toEqual([])), so its ~30 error branches never run and the replay safety-net can silently rot. Over-engineering cleanup: ~500 of 1207 lines in simulateRace.ts are cosmetic replay/trace/director-beat generation entangled with the core loop (extract to replayTrace.ts); normalizeRaceTraits and clampNumber in utils.ts are exported with no non-test callers (delete); App.tsx models ~10 mutually-exclusive dialogs as separate useState booleans (:115-132) that could collapse to one activeModal discriminated union. This corpus is written to be executed end-to-end by another AI agent.

# AI Context
- Summary: Review-findings remediation: replay determinism, dead card effects, client storage safety, API security and scale, admin config integrity, and over-engineering cleanup
- Keywords: request-chain-scaffold, review-findings remediation: replay determinism, dead card effects, client storage safety, api security and scale, admin config integrity, and over-engineering cleanup, development-ready
- Use when: You need to implement or review the scaffolded workflow for Review-findings remediation: replay determinism, dead card effects, client storage safety, API security and scale, admin config integrity, and over-engineering cleanup.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_235_restore_deterministic_weighted_selection_and_pin_it_with_a_test`
- `item_236_resolve_the_dead_positiondelta_card_effect_accumulator`
- `item_237_make_web_client_storage_access_crash_safe`
- `item_238_close_email_header_injection_and_account_enumeration`
- `item_239_rate_limit_unauthenticated_writes_and_bound_admin_reads`
- `item_240_owner_team_resilience_and_replay_validator_negative_tests`
- `item_241_over_engineering_cleanup_extract_replay_trace_delete_dead_exports_unify_modal_state`
