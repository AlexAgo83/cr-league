## req_100_post_remediation_review_fixes_replay_determinism_comparator_positiondelta_test_tiebreak_coherence_account_enumeration_neutrality_and_replay_validator_prng_test_depth - Post-remediation review fixes: replay determinism comparator, positionDelta test/tiebreak coherence, account-enumeration neutrality, and replay-validator/PRNG test depth
> From version: 0.4.1
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Complexity: Medium
> Theme: Post-remediation review fixes
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Restore the cross-environment determinism guarantee by replacing the locale-dependent key comparator in weighted selection with a stable byte comparator.
- Make the positionDelta wiring genuinely tested by exporting and unit-testing classificationScore, and make the mid-race trace tiebreak consistent with the final classification.
- Decide and apply the account-enumeration posture for profile creation so POST /profiles is no longer an existence oracle, or consciously keep it - recording the decision.
- Deepen the replay-validator and PRNG determinism tests so the nontrivial error branches and multi-seed stability are actually pinned.
- Clean up the minor invariant break (test-helper raw storage) and confirm the activeModal and positionDelta-units assumptions.

# Context
- prng.ts:21: replace `.sort(([left], [right]) => left.localeCompare(right))` with a byte-stable comparator `.sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))`. localeCompare depends on the ICU/locale build of Node; the byte comparator is deterministic everywhere. Add/extend a test proving two forecasts with equal weights but reordered keys resolve identically for the same seed (see the PRNG test-depth item).
- classificationScore (simulateRace.ts:909) is currently a private `state.scores.score + state.positionDelta`. Export it (typed on Pick<TeamState, 'scores' | 'positionDelta'> so it is callable from tests) and add a direct unit test (e.g. classificationScore({ scores: { score: 10, ... }, positionDelta: 5 }) === 15) so removing `+ state.positionDelta` breaks a test. Keep the existing integration test as a complement but do not rely on it to pin the wiring.
- createReplayTracePoint (simulateRace.ts:407): change the elapsed-time tiebreak from `|| right.scores.score - left.scores.score` to `|| classificationScore(right) - classificationScore(left)` so mid-race trace ordering matches the final classification's ordering rule. Confirm no replay-trace snapshot test needs regenerating.
- Account enumeration (createProfile, storeCore.ts): this needs an explicit A/B decision recorded in the task. Option A (recommended): on an existing email, mirror requestRecoveryCode - re-issue and email the recovery code to the real owner (subject to the same cooldown) and return the same neutral shape the client already treats as 'check your email', removing the oracle; this fits the web flow that already switched createProfile to storeProfileEmail + 'recover' mode. Verify the client no longer needs the plaintext recoveryCode in the response (it arrives by email). Option B: keep the distinct message, accepting the leak, since WRITE_RATE_LIMIT already throttles it. Whichever is chosen, keep new-email signup working and the DB-level duplicate guard intact.
- validateReplayTrace tests: add hand-corrupted traces exercising at least the three nontrivial branches - speed changes too abruptly, progress goes backwards (distinct from the oversized-jump branch), and overtake phases missing - each asserting the exact error string, so the safety-net has real negative coverage beyond the ~5 branches already tested.
- prng.test.ts:91: loop over several seeds and multiple sequential draws, comparing draw sequences for forecasts with identical weights but reordered keys, so the determinism assertion cannot false-pass on a single lucky cursor position.
- Minor: route App.testHelpers.ts:5 through safeStorage.set to keep the storage invariant total (test-only, harmless). Audit App.tsx modal open sites to confirm no flow other than restart-from-league-controls opens a second modal while one is open (the activeModal state machine silently closes the first); document the finding. Confirm summing positionDelta (positions) into scores.score (points) at simulateRace.ts:909 is an intended perturbation; if it is a units mismatch, normalize the scale, otherwise leave a short code comment noting it is deliberate.
- Out of scope: swapping the PRNG algorithm; changing the seeding model; reworking the claim-code/recovery model beyond the enumeration response; a full modal-manager refactor; re-tuning card balance; broadening the leagues-store modularization; any new dependency.

# Acceptance criteria
- AC1: Weighted selection orders weight keys with a locale-independent comparator, and a determinism test proves reordered-but-equal forecasts resolve identically across several seeds and sequential draws.
- AC2: classificationScore is exported and directly unit-tested such that removing the positionDelta term fails a test, and the mid-race trace tiebreak uses classificationScore so it is consistent with the final classification.
- AC3: POST /profiles no longer distinguishes existing from new emails in its response (Option A) or the team has explicitly chosen to keep the distinct message (Option B), with the decision and rationale recorded in the orchestration task; new-email signup and the DB duplicate guard still work.
- AC4: validateReplayTrace has negative tests for at least the speed-abruptness, backwards-progress, and overtake-phase branches, asserting their exact error strings.
- AC5: The minor invariant break is fixed (App.testHelpers uses safeStorage), the activeModal single-open assumption is verified/documented, and the positionDelta units question is resolved (normalized or documented as intended).
- AC6: npm run typecheck, npm test, npm run lint, and npm run logics:validate pass, and no existing test is deleted to make them pass.

# AC Traceability
- AC1 -> `task_101_orchestrate_post_remediation_review_fixes`. Proof: `prng.ts` uses a byte comparator and `prng.test.ts` checks reordered weights across multiple seeds and sequential draws.
- AC2 -> `task_101_orchestrate_post_remediation_review_fixes`. Proof: `classificationScore` is exported and directly tested in `simulateRace.test.ts`; `createReplayTracePoint` uses `classificationScore` as the elapsed-time tiebreak.
- AC3 -> `task_101_orchestrate_post_remediation_review_fixes`. Proof: Option A chosen; `createProfile` reissues a recovery code for existing emails through the recovery path and returns the neutral response, covered by `app.admin.test.ts`.
- AC4 -> `task_101_orchestrate_post_remediation_review_fixes`. Proof: `validateReplayTrace.test.ts` asserts exact errors for abrupt speed changes, backwards car progress, and missing overtake phases.
- AC5 -> `task_101_orchestrate_post_remediation_review_fixes`. Proof: `App.testHelpers.ts` now uses `safeStorage`; `App.tsx` activeModal opens are guarded by `openModal` with only the restart return path using `modalReturnRef`; `classificationScore` documents `positionDelta` as a deliberate final-score perturbation.
- AC6 -> `task_101_orchestrate_post_remediation_review_fixes`. Proof: targeted vitest passed 7 files/115 tests; `npm test` passed 29 files/288 tests with existing skips; `npm run typecheck`, `npm run lint`, and `npm run logics:validate` passed.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_063_post_remediation_review_fixes_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/request/req_099_review_findings_remediation_replay_determinism_dead_card_effects_client_storage_safety_api_security_and_scale_admin_config_integrity_and_over_engineering_cleanup.md
- packages/shared/src/simulation/prng.ts
- packages/shared/src/simulation/prng.test.ts
- packages/shared/src/simulation/simulateRace.ts
- packages/shared/src/simulation/simulateRace.test.ts
- packages/shared/src/simulation/validateReplayTrace.ts
- packages/shared/src/simulation/validateReplayTrace.test.ts
- apps/api/src/features/leagues/storeCore.ts
- apps/api/src/features/leagues/routes.ts
- apps/web/src/app/App.testHelpers.ts
- apps/web/src/app/App.tsx
- Second review sweep on 2026-07-23 after req_099 landed (HEAD 094889d, release 0.4.1). The req_099 remediation was genuinely implemented and verified: safeStorage wrapper (all localStorage routed through one choke point, degrades gracefully), email control-char rejection in normalizeEmail, @fastify/rate-limit on writes, admin pagination pushed to the DB (skip/take/count), ownerTeamId fallback+reassign (storeCore.ts:1053), replayTrace.ts extraction (byte-identical, behavior-preserving), dead exports removed, leagues store modularized, and positionDelta is now WIRED into finishing order via classificationScore. Baseline is green: typecheck, lint, 283 tests pass. This sweep targets defects the implementation introduced or left open. Findings. (1) DETERMINISM (self-defeating): prng.ts:21 pickWeightedWithNext sorts weight keys with left.localeCompare(right); localeCompare is ICU/locale-dependent in Node, so two environments can order keys differently and diverge for the same seed - reintroducing the exact cross-environment non-determinism the sort was added (in req_099 item 235) to eliminate. (2) VACUOUS TEST: simulateRace.test.ts:386 'uses card positionDelta in final classification' does not test positionDelta - the launch_boost card grants +26 to scores.score AND +8 to positionDelta, so the +26 score bonus alone makes 'boost' finish first; deleting the positionDelta wiring (classificationScore = scores.score + positionDelta at simulateRace.ts:909) would not fail this test. (3) TIEBREAK INCOHERENCE: simulateRace.ts:407 createReplayTracePoint breaks elapsed-time ties with right.scores.score - left.scores.score, while classification/final trace order (simulateRace.ts:191, 301, 881) use classificationScore; a tie can order a mid-race trace point inconsistently with the final classification. (4) ACCOUNT ENUMERATION (open half of req_099 item 238): createProfile (storeCore.ts) still throws 'This email already has a profile. Recover it with your code.' for an existing email, while requestRecoveryCode is deliberately constant-response ({ ok: true } regardless of existence), so POST /profiles remains an existence oracle even though it is rate-limited by WRITE_RATE_LIMIT. (5) VALIDATOR TEST DEPTH: validateReplayTrace.test.ts covers ~5 of ~13 error branches; untested nontrivial branches include 'car speed changes too abruptly', 'car progress goes backwards' (distinct from the jump check), and 'overtake phases missing'. (6) PRNG TEST DEPTH: prng.test.ts:91 asserts determinism with a single draw on a single seed, which can false-pass if that one seed's cursor lands on the same key under both key orderings; it does not loop seeds or sequential draws. (7) MINOR: App.testHelpers.ts:5 uses raw localStorage.setItem, bypassing safeStorage and breaking the total invariant (test-only); App.tsx:107 collapsed ~10 modal booleans into one activeModal state machine so opening modal B silently closes A, and only the restart-from-league-controls nesting is handled via modalReturnRef; positionDelta (a 'positions gained' unit) is summed directly into scores.score (a points unit) at simulateRace.ts:909, which should be confirmed as an intended perturbation rather than a units mismatch. This corpus is written to be executed end-to-end by another AI agent.

# AI Context
- Summary: Post-remediation review fixes: replay determinism comparator, positionDelta test/tiebreak coherence, account-enumeration neutrality, and replay-validator/PRNG test depth
- Keywords: request-chain-scaffold, post-remediation review fixes: replay determinism comparator, positiondelta test/tiebreak coherence, account-enumeration neutrality, and replay-validator/prng test depth, development-ready
- Use when: You need to implement or review the scaffolded workflow for Post-remediation review fixes: replay determinism comparator, positionDelta test/tiebreak coherence, account-enumeration neutrality, and replay-validator/PRNG test depth.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_242_restore_cross_environment_determinism_in_weighted_selection`
- `item_243_pin_positiondelta_wiring_and_align_trace_tiebreak_with_classification`
- `item_244_close_the_account_enumeration_oracle_on_profile_creation`
- `item_245_deepen_replay_validator_and_prng_determinism_tests`
- `item_246_resolve_residual_invariant_and_units_assumptions`
