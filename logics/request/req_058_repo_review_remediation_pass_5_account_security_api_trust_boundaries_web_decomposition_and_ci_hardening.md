## req_058_repo_review_remediation_pass_5_account_security_api_trust_boundaries_web_decomposition_and_ci_hardening - Repo review remediation pass 5: account security, API trust boundaries, web decomposition, and CI hardening
> From version: 0.3.11
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Repo review remediation
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make account recovery resistant to brute force: recovery codes of at least 16 random bytes, hashed with a slow salted KDF from the Node standard library (scrypt), and per-email/IP rate limiting on the recover endpoint, while existing legacy-hashed codes keep working until rotated.
- Close the API trust-boundary gaps: bind createDemoLeague and joinLeagueByCode to a proof of profile ownership instead of a bare profileId, stop returning the league invite code to non-members, compare the admin token in constant time, and only whitelist localhost CORS origins outside production.
- Make restartLeague atomic so a mid-sequence failure can never leave a league without a current Grand Prix.
- Decompose the two god components: extract domain hooks and view containers from the 1864-line App.tsx, fix its stale-closure mount effect, deduplicate the rejoin logic, and split ReplayView with the animation loop in a dedicated hook.
- Exercise the concurrency-critical store paths against real Postgres in CI, since the in-memory test DB silently no-ops transactions and row locks.
- Harden CI and tooling: automated dependency scanning, test coverage collection, react-hooks and jsx-a11y lint rules, a release health-check that fails the deploy on mismatch, an engines field, and a consistent reports/ gitignore policy.

# Context
- createRecoveryCode in utils.ts returns randomBytes(4).toString("hex") (32 bits) and hashRecoveryCode is a single unsalted SHA-256; routes.ts registers /profiles/recover with no throttling, so an attacker who knows an email can brute-force the code online, and a DB leak allows trivial offline cracking. Node's crypto.scrypt and timingSafeEqual cover the fix without new dependencies; a small in-memory fixed-window limiter is enough at this scale.
- Legacy compatibility matters: profiles already hold SHA-256 recovery hashes. Verification should try the new format first, fall back to the legacy hash, and re-issue or re-hash on successful recovery so old codes converge to the new format without a manual migration.
- createDemoLeague and joinLeagueByCode accept any profileId that exists (ensureProfileExists), so anyone who learns another player's cuid can attach teams to their account. The recovery flow already proves profile ownership; joining should require that proof (a profile-scoped token or the recovery claim) rather than the raw id.
- restartLeague in store.ts runs deleteMany decisions, deleteMany grand prixes, the league update, per-team updates, and the new GP create as separate awaited statements outside runWrite; a crash after the GP delete leaves getLeagueState with no grandPrixes[0] and the league is bricked. Wrapping the sequence in the existing runWrite helper matches the patterns passes 3 and 4 established.
- admin/routes.ts compares the admin token with !==; crypto.timingSafeEqual on equal-length buffers is the standard fix. app.ts always adds http://localhost:4873 and http://127.0.0.1:4873 to the CORS set, including on Render; these should be conditional on a non-production environment. getLeagueState returns league.code to any caller who knows the leagueId, exposing the join secret to spectators and ex-members.
- App.tsx concentrates ~55 useState, ~15 useEffect, every API mutation, and ~515 lines of JSX in one 1864-line component; the rejoin effect at line ~178 uses [] deps while closing over profileSession, savedClaims, run, and tt, and the rejoin POST logic is duplicated near-verbatim around lines 184 and 694. Seven separate *CommandClicked booleans track UI hints. The repo's eslint has no react-hooks plugin, which is why the stale closure survived review; adding the plugin is part of this pass and will police the decomposition.
- ReplayView.tsx is 1071 lines holding several sub-components, a requestAnimationFrame loop, ~10 state hooks, 6 refs, and manual pop-timer arrays; the clock logic belongs in a useReplayClock hook and the scrubber/tower/stage sub-components in their own files. Decomposition must not change replay behavior pinned by the existing ReplayView tests.
- testMemoryDb.ts implements $transaction as fn(db) and $queryRaw as a no-op, so the FOR UPDATE locks and transactional rollbacks added in passes 3 and 4 are never exercised by any test. The roadmap already reserves patch 0.4.2 for a real Postgres integration-test CI lane; this pass implements it with a postgres service container in CI and a small integration suite covering concurrent qualifying submissions, the resolve claim, and the credit-guarded buy path. The unit job currently exports DATABASE_URL without provisioning Postgres, which is misleading and should be resolved by this lane.
- CI gaps from the review: no Dependabot or npm audit despite SECURITY.md; no coverage collection so unit-test reach is invisible; eslint.config.js has only js.recommended and tseslint.recommended for a React app (no react-hooks, no jsx-a11y despite ADR-006); the deploy-release.yml health-poll ends in ::warning:: and lets a stuck Render deploy pass; package.json has no engines field while CI and Render pin Node 20; .gitignore ignores reports/ yet one playtest report is force-committed.
- Out of pattern-scope on purpose: the requireAdminClaim ownership self-healing flagged by the review is pass-4 intended behavior and stays; the qualifyingRuns JSON growth, Prisma string enums, and vitest node-environment split remain deferred watchlist items unless the integration lane makes one of them free to pick up.

# Acceptance criteria
- AC1: Recovery codes are generated from at least 16 random bytes, stored with a salted scrypt hash, verified in constant time, legacy SHA-256 codes still verify and are upgraded on successful use, and /profiles/recover enforces a per-email and per-IP rate limit with tests covering lockout and legacy upgrade.
- AC2: createDemoLeague and joinLeagueByCode require proof of profile ownership and reject a bare profileId belonging to someone else; league reads only include the invite code for the owner or members; tests cover the rejection and the code visibility rules.
- AC3: restartLeague executes atomically inside runWrite so an injected mid-sequence failure leaves the previous league state intact, with a test proving no league can end up without a current Grand Prix.
- AC4: The admin token comparison is constant-time and localhost CORS origins are absent from the production origin set, verified by tests or config assertions.
- AC5: App.tsx drops below ~700 lines by extracting domain hooks (league, profile, admin, plan form) and view containers, the rejoin effect has correct dependencies or an explicit mount guard, the rejoin logic exists once, the seven command-clicked booleans collapse into one structure, and all existing web tests still pass.
- AC6: ReplayView.tsx is split into a useReplayClock hook and separate scrubber/tower/stage files with no behavior change pinned by the existing replay tests.
- AC7: A CI lane runs integration tests against a real Postgres service covering concurrent qualifying submissions, the resolve transition claim, and the credit-guarded card purchase; the unit lane no longer advertises an unused DATABASE_URL.
- AC8: CI gains dependency scanning (Dependabot config plus an npm audit gate), vitest coverage collection surfaced in CI, eslint enforces react-hooks and jsx-a11y rules with the codebase passing, the release workflow fails on a health-version mismatch, package.json declares engines, and the reports/ gitignore policy is consistent.
- AC9: npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, and npm run logics:validate pass after implementation.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_022_repo_review_remediation_pass_5_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/request/req_045_repo_review_remediation_pass_4_ownership_resilience_race_window_closure_and_replay_polish.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- apps/api/src/features/leagues/utils.ts
- apps/api/src/features/leagues/routes.ts
- apps/api/src/features/leagues/store.ts
- apps/api/src/features/admin/routes.ts
- apps/api/src/app.ts
- apps/api/src/testMemoryDb.ts
- apps/web/src/app/App.tsx
- apps/web/src/features/ReplayView.tsx
- eslint.config.js
- vitest.config.ts
- .github/workflows/ci.yml
- .github/workflows/deploy-release.yml
- package.json
- .gitignore
- Full-repo review from 2026-07-20 on v0.3.11, after pass 4 (req_045) closed: recovery codes are 4 random bytes hashed with unsalted single-round SHA-256 and /profiles/recover has no rate limiting, making brute-force account takeover feasible; createDemoLeague and joinLeagueByCode trust any existing profileId from the request body; restartLeague runs its delete/update/create sequence as separate statements outside runWrite and a mid-sequence failure leaves the league with no current Grand Prix; the admin token is compared with !== leaking timing; localhost origins stay CORS-whitelisted in production; GET /leagues/:leagueId returns the invite code to any reader; App.tsx is 1864 lines with ~55 useState and a mount effect closing over stale state; ReplayView.tsx is 1071 lines with an inline rAF loop; the concurrency machinery (FOR UPDATE locks, transactional claims) is only ever exercised against an in-memory test DB with no-op $transaction/$queryRaw; CI has no dependency scanning, no coverage collection, no react-hooks or jsx-a11y lint rules, sets DATABASE_URL in the unit job without provisioning Postgres, and the release health-check mismatch ends in a warning instead of failing the deploy.

# AI Context
- Summary: Repo review remediation pass 5: account security, API trust boundaries, web decomposition, and CI hardening
- Keywords: request-chain-scaffold, repo review remediation pass 5: account security, api trust boundaries, web decomposition, and ci hardening, development-ready
- Use when: You need to implement or review the scaffolded workflow for Repo review remediation pass 5: account security, API trust boundaries, web decomposition, and CI hardening.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_135_brute_force_resistant_account_recovery`
- `item_136_api_trust_boundary_and_atomicity_fixes`
- `item_137_decompose_app_tsx_into_domain_hooks_and_views`
- `item_138_split_replayview_and_extract_the_replay_clock`
- `item_139_postgres_integration_test_ci_lane_for_concurrent_store_paths`
- `item_140_ci_lint_and_release_gate_hardening`
