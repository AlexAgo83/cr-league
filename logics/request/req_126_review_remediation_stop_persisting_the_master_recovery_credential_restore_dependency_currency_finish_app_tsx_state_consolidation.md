## req_126_review_remediation_stop_persisting_the_master_recovery_credential_restore_dependency_currency_finish_app_tsx_state_consolidation - Review remediation: stop persisting the master recovery credential, restore dependency currency, finish App.tsx state consolidation
> From version: 0.5.1
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Security and maintainability
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Stop keeping the master profile recovery credential and team claim codes in plaintext browser storage, without breaking the flows that currently replay the recovery code as proof of ownership.
- Keep every existing player flow working across reloads: recover profile, create league, join league, rejoin a saved team, and switch between saved leagues.
- Bring the toolchain and runtime dependencies back to current majors with green CI, in reviewable steps rather than one sweeping bump.
- Finish the residual App.tsx state consolidation left over from item_303, as a pure refactor with no behavior change.
- Do not re-open work already owned by other requests: shipped image weight belongs to req_125 and eager bundle trimming belongs to req_124.

# Context
- This corpus comes from a whole-repo review. The repo is in good health: typecheck, lint, and production audit are clean, 349 tests pass, and coverage is around 89% statements. The findings below are the ones that survived verification against the code.
- The credential finding is the only one with real blast radius. The server side is already correct: recovery codes are stored as scrypt hashes and compared with timingSafeEqual, and there is a per-email and per-IP recovery limiter. The problem is entirely on the client, where the plaintext code is written to localStorage and never rotated.
- A naive fix does not work. The stored recoveryCode is replayed on writes through ensureProfileOwnership, so simply stripping it from storage would break league creation and join. The credential needs a replacement that is revocable and separable from the recovery code itself.
- The claim codes carried in the same stored payload are lower value than the recovery code but are still per-team access secrets, so they deserve the same treatment as whatever design is chosen.
- Dependency currency is preventive, not urgent. Nothing is flagged vulnerable today, but prisma, vite, and eslint are each a major behind, and the gap compounds. Prisma 7 in particular touches generated client code and migrations, so it should be isolated from the tooling bumps.
- The App.tsx item is deliberately low priority. item_303 already did the structural split and is Done; what remains is 25 useState in one component and a wide GameViews prop surface. It should be scoped as a bounded cleanup, not a second decomposition project.

# Acceptance criteria
- AC1: The plaintext master recovery code is no longer written to browser storage. After recovering a profile and reloading the page, no storage key contains the recovery code, verified by an automated check.
- AC2: Ownership-proving writes still succeed after a reload without re-entering the recovery code: create league, join league, rejoin a saved team, and switch saved leagues all pass.
- AC3: Whatever replacement credential is introduced is stored hashed at rest server-side, is revocable, and is invalidated when the recovery code is rotated through the recovery flow.
- AC4: Team claim codes receive the same storage treatment as the recovery code, or the corpus documents why they are acceptable to keep at their current sensitivity.
- AC5: The API keeps a compatible path for existing clients during the transition, or the change is documented as a deliberate breaking change with the migration note recorded.
- AC6: Dependency majors are raised in separate reviewable commits with the full CI suite green after each, and any deliberately deferred major has a recorded reason.
- AC7: App.tsx state consolidation is a pure refactor: no player-visible behavior change, all existing tests pass unmodified except for mechanical import or fixture updates.
- AC8: npm run typecheck, npm run lint, npm test, npm run test:coverage, npm run build, npm run test:e2e -- --project=chromium, and npm run logics:validate all pass, with coverage no lower than the 89.37% statement baseline.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_078_credential_storage_and_dependency_currency_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- SECURITY.md
- apps/web/src/app/appStorage.ts
- apps/web/src/app/profileActions.ts
- apps/web/src/app/sessionActions.ts
- apps/web/src/app/raceActions.ts
- apps/web/src/app/App.tsx
- apps/web/src/app/GameViews.tsx
- apps/api/src/features/leagues/profiles.ts
- apps/api/src/features/leagues/utils.ts
- apps/api/src/features/leagues/routes.ts
- apps/api/src/features/leagues/lifecycle.ts
- packages/shared/src/domain/league.ts
- prisma/schema.prisma
- logics/backlog/item_303_decompose_the_god_modules_lifecycle_ts_and_app_tsx.md
- Repo review evidence: typecheck, lint, and npm audit --omit=dev are clean; 349 unit tests pass in about 12s; coverage is 89.37% statements, 80.39% branches, 92.07% lines; source is about 36k lines against about 9.3k lines of tests.
- Review evidence: POST /profiles/recover returns the plaintext recoveryCode in its response body (profiles.ts around line 85), and the web client persists the whole ProfileSession object to localStorage under cr-league-profile-session (appStorage.ts storeProfileSession, called from profileActions.ts around line 101). That payload contains the master recoveryCode plus every team claimCode in plaintext.
- Review evidence: the persisted recoveryCode is not display-only. It is replayed as a bearer credential on subsequent writes in raceActions.ts around lines 72 and 100 and sessionActions.ts around line 106, and verified server-side by ensureProfileOwnership in apps/api/src/features/leagues/utils.ts, which is called from lifecycle.ts around lines 48 and 119. Removing it from storage without a replacement credential breaks league creation and join flows.
- Review evidence: the recovery code never rotates on its own. hashRecoveryCode uses scrypt with timingSafeEqual server-side, so the database side is sound; the exposure is purely the plaintext copy held in browser storage for the lifetime of the profile.
- Review evidence: npm outdated reports several majors behind: prisma and @prisma/client 6.19.3 versus 7.9.0, vite 7.3.6 versus 8.1.5, eslint and @eslint/js 9.39.5 versus 10.x, jsdom 27.4.0 versus 29.1.1, @types/node 24.13.3 versus 26.1.1, @vitejs/plugin-react 5.2.0 versus 6.0.4. None are currently flagged vulnerable by npm audit.
- Review evidence: App.tsx is 779 lines with 25 useState declarations and hands about 53 props to GameViews.tsx. item_303 already split lifecycle.ts and extracted per-domain hooks and is marked Done at 0.4.6, so this is residual consolidation, not a fresh decomposition.
- Reviewed and explicitly out of scope: apps/api/src/features/leagues/carAssets.ts, apps/web/src/features/carAssets.ts, and packages/shared/src/economy/carAssets.ts are not duplicated logic. Shared owns the ids and prices, the API file is the purchase use case, the web file is render geometry, and both import from shared.
- Reviewed and explicitly out of scope: createRecoveryLimiter in routes.ts around line 224 already prunes expired buckets on every take, so it is memory-bounded. Only an O(n) prune per request remains, which is not worth changing at current traffic.
- Reviewed and explicitly out of scope: reports/ is gitignored and git ls-files reports/ returns nothing, so the perf report artifacts are local residue only.
- Reviewed and explicitly out of scope: the shipped image payload, including assets/crl/finish-flag.png at about 1393 KB, is already owned by req_125 runtime performance remediation.

# AI Context
- Summary: Review remediation: stop persisting the master recovery credential, restore dependency currency, finish App.tsx state consolidation
- Keywords: request-chain-scaffold, review remediation: stop persisting the master recovery credential, restore dependency currency, finish app.tsx state consolidation, development-ready
- Use when: You need to implement or review the scaffolded workflow for Review remediation: stop persisting the master recovery credential, restore dependency currency, finish App.tsx state consolidation.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_316_replace_the_persisted_master_recovery_code_with_a_revocable_session_credential`
- `item_317_raise_dependency_majors_in_reviewable_steps_under_green_ci`
- `item_318_finish_the_residual_app_tsx_state_consolidation_left_by_item_303`
