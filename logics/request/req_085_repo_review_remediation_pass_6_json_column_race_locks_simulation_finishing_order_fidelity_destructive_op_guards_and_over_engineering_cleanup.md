## req_085_repo_review_remediation_pass_6_json_column_race_locks_simulation_finishing_order_fidelity_destructive_op_guards_and_over_engineering_cleanup - Repo review remediation pass 6: JSON-column race locks, simulation finishing-order fidelity, destructive-op guards, and over-engineering cleanup
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Repo review remediation
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Close the JSON-column read-modify-write races: serialize buyCard/sellCard, submitDecision, and joinLeagueByCode under row/table locks so concurrent requests cannot lose cards, write decisions onto a resolved Grand Prix, or push a league past maxPlayers, reusing the existing runWrite/lockGrandPrixRow machinery from passes 3-5.
- Restore simulation finishing-order fidelity: make Final Classification show real finishing intervals instead of +0.0s, keep elapsedTime discriminant so results track the score model instead of clamp noise, and evaluate card look-ahead on a consistent time snapshot.
- Guard destructive and authority-changing operations: deleteAdminUser must not delete a non-test profile without explicit confirmation, and requireAdminClaim must stop silently transferring league ownership.
- Stop the card directive badges from lying: derive APPROACH/PREPARATION/PIT badges from a single shared stat-delta descriptor that applyDecision also consumes, so hints can never drift from balance again.
- Delete the accumulated over-engineering the review surfaced: duplicated lap helper, dead ternary, fabricated qualifying timestamp, unused export, unmemoized translator closure, and a doubly-computed replay order.

# Context
- runWrite (persistence.ts:4-6) and lockGrandPrixRow (persistence.ts:8-11) already establish the transaction + FOR UPDATE row-lock pattern used by resolve/next-grand-prix/restart; these fixes extend that same pattern to the card and join paths. lockGrandPrixRow and $queryRaw are no-ops on the in-memory test DB, so a Postgres integration test (the lane added in pass 5, req_058) is the only place the lock is actually exercised — concurrency ACs must run there, not only against the memory DB.
- buyCard's updateMany already guards credits atomically with where credits >= totalPrice, but the cards value is a plain JS array built from an unlocked findUnique read; a lockTeamRow(tx, teamId) helper (SELECT id FROM "teams" WHERE id = ... FOR UPDATE, no-op when $queryRaw is absent) taken before the read makes the whole read-modify-write serial. sellCard has the same shape and gets the same lock.
- submitDecision reads status through getCurrentGrandPrix outside runWrite; the fix moves the raceDecision.upsert inside a runWrite that lockGrandPrixRow-locks the GP and re-reads status, rejecting with a 409 when the GP is already resolved. This mirrors how resolveCurrentGrandPrix already claims the GP under the lock.
- joinLeagueByCode counts teams then creates outside any lock; enforcing the cap inside a runWrite that locks the league row (SELECT id FROM "leagues" WHERE id = ... FOR UPDATE) and recounts closes the TOCTOU. Keep the unique-code retry behavior (retryUnique) intact.
- FinalClassification should compute intervals from finalTrace.times (absolute elapsed time per team, already populated) rather than finalTrace.gaps, which is structurally zero at the final trace point because trackProgress is clamped to 1 there. The leader row keeps showing absolute time; each following row shows the positive difference of consecutive times. No change to the trace format is needed.
- The segmentTime clamp saturates because base*0.72 is a hard floor and competitive deltas drive base - delta*0.16 below it, flattening elapsedTime. The lower-risk fix keeps the clamp for physical realism but makes classify (simulateRace.ts:920) tie-break on scores.score before elapsedTime, so the score model stays the source of truth and elapsedTime only refines within a score tier; validate order stability before/after with npm run balance:sim. Widening the clamp is the fallback if the tie-break alone does not restore spread.
- carAhead sorts on state.elapsedTime while the enclosing loop has already mutated elapsedTime for earlier states and not yet for later ones. Snapshot every state's elapsedTime into a Map before the card-effect loop and have carAhead read the snapshot, so all look-ahead comparisons see a single consistent frame. No card should change which car is 'ahead' based on loop iteration order.
- deleteAdminUser must reuse the guardrails cleanupAdminTestData already has: refuse when isTestProfile(email) is false unless the caller passes an explicit confirmation matching the profile email (type-to-confirm), keeping the operation irreversible-by-accident-proof. This is a store + admin route + admin UI change; keep it minimal.
- requireAdminClaim's fallback that reassigns ownerTeamId to the oldest human team (store.ts:1022,1026-1028) should be removed: a missing or non-human recorded owner means 'no active owner' and the action is rejected with 403, not silently transferred. An explicit ownership-transfer path is out of scope (YAGNI) until a real need exists. Note this narrows the pass-4 self-healing behavior deliberately; call it out at closeout.
- DirectivePanel's badge tables encode a fixed magnitude of 3 and omit pace, while applyDecision applies real per-axis deltas (e.g. prudent is pace-8/control+10/reliability+9/aggression-12). Extract the delta descriptors into a shared module both applyDecision and the panel import, and render badges from the signed deltas so the two can never diverge; snapshot tests on the badge output pin the mapping.
- Cleanup items are independent and low-risk: export lapForProgress from simulateRace and delete the lapDisplay.ts copy; collapse the identical-branch ternary in DriveView.tsx:468-476 to one button; delete the FNV-1a deterministicCreatedAt in qualifying.ts and use a fixed epoch (or drop createdAt from qualifying runs if unordered); delete the unused ensureProfileExists export; wrap tt in useMemo/useCallback keyed on locale in App.tsx; and skip the orderFromCars call for interior points in createDistanceReplayTracePoint since stabilizeReplayTraceOrders overwrites it.

# Acceptance criteria
- AC1: buyCard, sellCard, submitDecision, and joinLeagueByCode are serialized under row/table locks inside runWrite, with Postgres integration tests proving no card/credit loss under concurrent buys, no decision written onto a resolved Grand Prix, and no league exceeding maxPlayers under concurrent joins.
- AC2: Final Classification shows real per-team finishing intervals (no all-zero +0.0s), classify tie-breaks on scores.score so finishing order tracks the score model rather than clamp noise, and card look-ahead reads a consistent elapsedTime snapshot; balance:sim confirms order stability did not regress.
- AC3: deleteAdminUser refuses to delete a non-test profile without an explicit matching confirmation, and requireAdminClaim rejects with 403 when there is no valid recorded owner instead of transferring ownership; tests cover both.
- AC4: Approach, preparation, and pit badges in DirectivePanel are derived from a single shared stat-delta descriptor that applyDecision also consumes, include pace, and match the real deltas, pinned by a snapshot test.
- AC5: The duplicated lap helper, dead DriveView ternary, FNV-1a qualifying timestamp, unused ensureProfileExists export, and doubly-computed replay order are removed, and tt is memoized; behavior is unchanged and all existing tests pass.
- AC6: npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, and npm run logics:validate pass after implementation.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_049_repo_review_remediation_pass_6_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/request/req_058_repo_review_remediation_pass_5_account_security_api_trust_boundaries_web_decomposition_and_ci_hardening.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- apps/api/src/features/leagues/store.ts
- apps/api/src/features/leagues/persistence.ts
- apps/api/src/features/leagues/routes.ts
- apps/api/src/features/admin/store.ts
- packages/shared/src/simulation/simulateRace.ts
- apps/web/src/app/DriveView.tsx
- apps/web/src/app/lapDisplay.ts
- apps/web/src/app/App.tsx
- apps/web/src/features/DirectivePanel.tsx
- apps/api/src/features/leagues/qualifying.ts
- apps/api/src/features/leagues/utils.ts
- Full-repo review from 2026-07-21 on v0.3.26, after pass 5 (req_058) closed. Concurrency: buyCard (store.ts:401-413) and sellCard (store.ts:436-448) read the team.cards JSON array via an unlocked findUnique and write it back as a static JS value inside runWrite; the updateMany credits guard re-checks atomically but the cards array does not, so two concurrent buys both charge and both overwrite the array, losing one card and its credits. submitDecision (store.ts:518-560) checks GP status via getCurrentGrandPrix outside the transaction and upserts the decision with no GP lock and no status re-check, so a decision can land after resolveCurrentGrandPrix has snapshotted, marking a team ready on a resolved GP. joinLeagueByCode (store.ts:265-286) checks teams.length >= maxPlayers then creates a team with no league-row lock, a TOCTOU that lets concurrent joins exceed the cap. Simulation: FinalClassification (DriveView.tsx:391-405) derives intervals from finalTrace.gaps, but gaps at the final trace point is (leaderProgress - trackProgress) * raceDuration (simulateRace.ts:311) and every car's trackProgress is clamped to 1 at progress>=1 (simulateRace.ts:292), so all non-leader intervals render +0.0s. The segmentTime clamp [base*0.72, base*1.28] (simulateRace.ts:664-666) saturates for competitive deltas, so elapsedTime (the primary classify key, simulateRace.ts:920) stops tracking scores.score and finishing order collapses to sub-clamp noise. Card triggers calculated_attack/urban_draft evaluate carAhead (simulateRace.ts:797-815) inside the per-state loop where some states have the current segment applied and some do not, so the <=3s gap check mixes pre- and post-segment elapsedTime. Destructive ops: deleteAdminUser (admin/store.ts:58-61) permanently deletes any profile with no isTestProfile guard and no confirmation token, unlike its sibling cleanupAdminTestData which already gates on isTestProfile and ADMIN_TEST_DATA_CLEANUP_CONFIRMATION. requireAdminClaim (store.ts:1021-1028) silently reassigns and persists ownerTeamId to the oldest human team when the recorded owner is missing, transferring league-admin powers with no explicit action. Legibility: DirectivePanel APPROACH/PREPARATION/PIT_BADGES (DirectivePanel.tsx:74-88) hand-mirror applyDecision's stat deltas with a flat magnitude of 3 and drop pace, so player-facing hints have drifted from real balance. Over-engineering: lapDisplay.ts:5-7 is a verbatim copy of the unexported lapForProgress (simulateRace.ts:1064-1066); DriveView.tsx:468-476 has a dead ternary whose branches render an identical button; qualifying.ts:22-30 hand-rolls an FNV-1a hash to fabricate a fake createdAt nothing depends on temporally; utils.ts:98-102 ensureProfileExists is exported but never called; App.tsx tt is a fresh closure every render (App.tsx:61,111) threaded through the whole tree defeating downstream memoization; createDistanceReplayTracePoint computes order via orderFromCars for interior points (simulateRace.ts:300) that stabilizeReplayTraceOrders immediately overwrites.

# AI Context
- Summary: Repo review remediation pass 6: JSON-column race locks, simulation finishing-order fidelity, destructive-op guards, and over-engineering cleanup
- Keywords: request-chain-scaffold, repo review remediation pass 6: json-column race locks, simulation finishing-order fidelity, destructive-op guards, and over-engineering cleanup, development-ready
- Use when: You need to implement or review the scaffolded workflow for Repo review remediation pass 6: JSON-column race locks, simulation finishing-order fidelity, destructive-op guards, and over-engineering cleanup.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_185_lock_the_json_column_read_modify_write_paths`
- `item_186_restore_simulation_finishing_order_and_interval_fidelity`
- `item_187_guard_destructive_delete_and_league_admin_authority`
- `item_188_derive_plan_badges_from_a_single_shared_stat_delta_descriptor`
- `item_189_over_engineering_cleanup_sweep`
