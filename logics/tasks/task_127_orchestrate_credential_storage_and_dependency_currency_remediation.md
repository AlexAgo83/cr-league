## task_127_orchestrate_credential_storage_and_dependency_currency_remediation - Orchestrate credential storage and dependency currency remediation
> From version: 0.5.1
> Schema version: 1.0
> Status: In progress
> Understanding: 95
> Confidence: 90
> Progress: 60
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Read the review evidence in this request's references first, and treat the cleared findings as settled: carAssets is not duplicated, the recovery limiter is already bounded, reports/ is untracked, and image weight belongs to req_125. Do not re-investigate them.
- [ ] 2. Start with the credential item, which is the only finding with real blast radius. Map the full call path first: profiles.ts recover response, storeProfileSession in appStorage.ts, the replays in raceActions.ts and sessionActions.ts, and ensureProfileOwnership in utils.ts called from lifecycle.ts.
- [ ] 3. Design the replacement credential before writing code, and record the decision: how it is issued, how it is hashed at rest, how it is revoked, how recovery-code rotation invalidates it, and whether the legacy recovery-code proof path is kept for compatibility or removed as a documented break.
- [ ] 4. Implement the credential change with a Prisma migration if the schema needs one, then add the regression test asserting the plaintext code never reaches browser storage after a recover-and-reload cycle.
- [ ] 5. Verify the credential change through the Chromium e2e private-league flow plus manual checks of recover, create, join, rejoin, and league switching across a reload.
- [ ] 6. Apply the same storage decision to team claim codes, or record why their current sensitivity is acceptable.
- [ ] 7. Then take the dependency majors, one reviewable commit at a time, keeping the Prisma major separate from the build and lint tooling. Run the full suite after each, including the Postgres integration path for Prisma.
- [ ] 8. Take the App.tsx consolidation last and keep it bounded: group the navigation, modal, and panel-visibility state only, no new dependency, no behavior change, and stop there.
- [ ] 9. Close out with typecheck, lint, tests, coverage, build, Chromium e2e, and logics validation, recording coverage against the 89.37% statement baseline and noting anything deliberately deferred.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_316_replace_the_persisted_master_recovery_code_with_a_revocable_session_credential`
- `item_317_raise_dependency_majors_in_reviewable_steps_under_green_ci`
- `item_318_finish_the_residual_app_tsx_state_consolidation_left_by_item_303`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> `item_316_replace_the_persisted_master_recovery_code_with_a_revocable_session_credential`. Proof: deferred to closeout — automated test asserting no browser storage key holds the plaintext recovery code after a recover-and-reload cycle.
- request-AC2 -> `item_316_replace_the_persisted_master_recovery_code_with_a_revocable_session_credential`. Proof: deferred to closeout — Chromium e2e private-league run plus manual create/join/rejoin/switch checks across a reload.
- request-AC3 -> `item_316_replace_the_persisted_master_recovery_code_with_a_revocable_session_credential`. Proof: deferred to closeout — API tests covering issue, revoke, and rotation-invalidation of the replacement credential.
- request-AC4 -> `item_316_replace_the_persisted_master_recovery_code_with_a_revocable_session_credential`. Proof: deferred to closeout — claim-code storage decision recorded in the task report with its rationale.
- request-AC5 -> `item_316_replace_the_persisted_master_recovery_code_with_a_revocable_session_credential`. Proof: deferred to closeout — Prisma migration committed if the schema changes, and the client-compatibility decision recorded.
- request-AC6 -> `item_317_raise_dependency_majors_in_reviewable_steps_under_green_ci`. Proof: deferred to closeout — one commit per major with CI green, and deferred majors listed with reasons.
- request-AC7 -> `item_318_finish_the_residual_app_tsx_state_consolidation_left_by_item_303`. Proof: deferred to closeout — diff shows state consolidation only, with existing tests passing without semantic modification.
- request-AC8 -> This task. Proof: deferred to closeout — typecheck, lint, test, test:coverage, build, e2e chromium, and logics:validate results recorded against the 89.37% statement baseline.

# Validation
- Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:coverage`, `npm run build`.
- Run `npm run test:e2e -- --project=chromium` for the private-league flow.
- Run `npm audit --omit=dev --audit-level=high` after the dependency upgrades.
- Run `npm run logics:validate`.

# Report
- 2026-07-27 wave 1 complete: replaced persisted profile recovery proof with a revocable `sessionCredential` stored hashed server-side, and replaced locally stored team claim codes with hashed session claim tokens accepted through the existing `claimCode` request field for compatibility.
- Recovery-code reissue and admin reset now null profile and team session credential hashes, so old browser-held session proofs stop working after rotation.
- Legacy compatibility kept: existing clients may still present the recovery code or original team claim code, but new web storage strips `recoveryCode` and stores only session credentials.
- Prisma migration added: `20260727110000_add_profile_and_team_session_credentials`.
- Validation evidence: `npm run typecheck` OK; `npm run lint` OK; `npm test` OK with 350 passing / 7 skipped before the final storage test and targeted 62-test rerun OK after; `npm run test:coverage` OK at 89.4% statements against the 89.37% baseline; `npm run build` OK; `npm run test:e2e -- --project=chromium` OK, 4 passed; `npm audit --omit=dev --audit-level=high` OK, 0 vulnerabilities; `npm run logics:validate` OK with existing non-blocking warnings.
- 2026-07-27 wave 2 complete: upgraded `vite` to 8.1.5 and `@vitejs/plugin-react` to 6.0.4, and tightened `engines.node` to `^20.19.0 || >=22.12.0` to match Vite 8's runtime floor.
- Wave 2 validation evidence: `npm run typecheck` OK; `npm run lint` OK; `npm test` OK with 352 passing / 7 skipped; `npm run build` OK; `npm run test:e2e -- --project=chromium` OK, 4 passed; `npm audit --omit=dev --audit-level=high` OK, 0 vulnerabilities. Full dev audit still reports the ESLint/minimatch advisory, owned by the ESLint 10 group.
- 2026-07-27 wave 3 complete: upgraded `jsdom` to 29.1.1 and `@types/node` to 26.1.1. Declined `jsdom@30` because it requires Node `^22.22.2 || ^24.15.0 || >=26.0.0`, above the local Node 22.16.0 and the Vite 8 engine floor already recorded.
- Wave 3 validation evidence: `npm run typecheck` OK; `npm run lint` OK; `npm test` OK with 352 passing / 7 skipped; `npm run build` OK; `npm audit --omit=dev --audit-level=high` OK, 0 vulnerabilities.
- 2026-07-27 dependency deferrals: ESLint 10 is deferred because `eslint-plugin-jsx-a11y@6.10.2` latest declares peer support only through ESLint 9; forcing ESLint 10 would weaken or remove the a11y lint path. Prisma 7 is deferred because it requires moving datasource URL to `prisma.config.ts`, adding a PG adapter, updating every `PrismaClient` construction, and resolving Prisma 7 transaction/delegate typing changes across API and scripts; `prisma generate` reached that migration boundary, then the attempt was reverted before commit.
- Remaining in this task: Prisma 7 as a dedicated migration wave when adapter/type changes can be handled end to end, ESLint 10 when jsx-a11y supports it or an a11y-safe replacement is chosen, and residual `App.tsx` state consolidation.

# AI Context
- Summary: Orchestrate credential storage and dependency currency remediation
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_126_review_remediation_stop_persisting_the_master_recovery_credential_restore_dependency_currency_finish_app_tsx_state_consolidation`
- Product brief(s): `prod_078_credential_storage_and_dependency_currency_product_brief`
- Architecture decision(s): (none yet)
