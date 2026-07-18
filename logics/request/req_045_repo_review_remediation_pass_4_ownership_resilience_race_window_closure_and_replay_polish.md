## req_045_repo_review_remediation_pass_4_ownership_resilience_race_window_closure_and_replay_polish - Repo review remediation pass 4: ownership resilience, race-window closure, and replay polish
> From version: 0.3.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Repo review remediation
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make league ownership resilient: fall back to the earliest human team when ownerTeamId is null or points at a missing team, so no league becomes permanently unadministrable.
- Close the remaining qualifying-runs lost-update window with a real row lock (SELECT FOR UPDATE) and move the resolve simulation's decision read inside the claiming transaction.
- Restore the positionChange invariant: report the real grid-to-finish delta and keep the narrative event delta out of it, so ReplayView's starting-grid reconstruction is a valid permutation.
- Polish the replay scrubber: user drag wins over the rAF loop during playback, overlay elements stop stealing pointer events, and assistive tech gets lap/time context via aria-valuetext.
- Fix the small correctness edges: pickWeighted must never return a zero-weight entry, livery colors are validated to hex at render, team name is trimmed at submit, modal overlay close requires the press to start on the overlay, focus restore guards against unmounted triggers, and league-config numeric inputs tolerate empty intermediate states.
- Land the deferred cleanups: deterministic risk-path tests (mechanical_scare and mechanic_save), a lookup table for the balance script's card delta, node vitest environment for shared tests, a single shared import path in scripts, API_PORT validation, and Render migrations moved to a pre-deploy step.

# Context
- Pass 3 (req_044) added ownerTeamId with a backfill to the earliest human team, but a league created without a human team, or whose owner team is later deleted, yields 403 for every caller on settings, resolve, next-grand-prix, and restart with no recovery path (store.ts requireAdminClaim).
- The pass-3 transactions re-read the GrandPrix row inside runWrite but Postgres Read Committed does not serialize two interactive transactions that both read then update the qualifyingRuns JSON column; the ponytail comment in store.ts names this ceiling explicitly. A raw SELECT ... FOR UPDATE on the GrandPrix row inside the existing transactions is the smallest fix; the dedicated QualifyingRun table remains the escalation path only if locking proves insufficient.
- resolveCurrentGrandPrix builds participants and calls simulateRace from raceState read before the claiming transaction, so a decision submitted in that window is persisted but not simulated; buyBotCards and the season points reset in startNextGrandPrix similarly operate on a pre-transaction team snapshot.
- simulateRace classify computes positionChange as standingsRank - position + state.positionDelta, where positionDelta accumulates arbitrary narrative card fudges; ReplayView derives the starting grid as position + positionChange, which is only a permutation when positionChange is the pure grid delta.
- The replay range input is imperatively driven: the rAF loop rewrites its value every frame, so grabbing the thumb during playback snaps back; .replay-weather and .replay-tick overlay the input without pointer-events none, creating dead zones; the input has an aria-label but no aria-valuetext.
- pickWeighted in prng.ts returns the current key when cursor <= 0, so a leading zero-weight entry is returned when next() yields exactly 0; the existing test's fixed seeds never produce 0 and give false confidence.
- The mechanical_scare (-12 score, -1 position) and fleet_maintenance mechanic_save branches in maybeAddRiskEvent are the most consequential untested game-logic paths.
- The API normalizes livery colors on write (isHexColor), but the web renders other players' livery values into CSS custom properties without its own validation; a forged non-hex value consumed by background: var(...) enables CSS-driven external resource loading. Client-side validation is defense in depth.
- Minor debt called out twice by reviews and deliberately deferred until now: render.yaml runs prisma migrate deploy inside buildCommand instead of preDeployCommand; vitest applies jsdom globally so pure-node shared tests pay its startup cost; scripts import shared both from source and via the workspace alias; config.ts accepts a NaN API_PORT; balance-simulations computes cardDelta via a ten-level nested ternary.

# Acceptance criteria
- AC1: requireAdminClaim falls back to the earliest-created human team when league.ownerTeamId is null or references a team that no longer exists, persists that fallback as the new owner, and a league can never 403 every member; covered by tests for the null and dangling cases.
- AC2: submitQualifyingRun and ensureBotQualifyingRuns lock the GrandPrix row (SELECT ... FOR UPDATE or equivalent) inside their transactions when running on real Postgres, the attempt limit holds under concurrent submissions, and the memory-db test path keeps working unchanged.
- AC3: resolveCurrentGrandPrix reads decisions and simulates inside the claiming transaction (or re-validates that no decision changed before committing), and startNextGrandPrix re-reads teams inside its transaction for bot purchases and the season points reset.
- AC4: classification positionChange equals standingsRank minus final position exactly, narrative deltas move to a separate field if still needed, ReplayView's reconstructed starting grid is always a valid permutation, and a test locks the invariant.
- AC5: dragging the replay scrubber during playback wins over the animation loop, weather icons and ticks have pointer-events none, the range input exposes aria-valuetext with lap/time context, and the seek markers keep working.
- AC6: pickWeighted never returns an entry whose effective weight is zero (with a test that forces cursor 0), livery colors are validated to a hex pattern at render, team name updates submit trimmed values, the modal only closes when the pointer press started on the overlay, focus restore falls back safely when the trigger is gone, and clearing a league-config numeric field no longer collapses to 0 while typing.
- AC7: deterministic tests cover a forced mechanical_scare and a forced mechanic_save; the balance script's card delta is a lookup table; shared package tests run under the node environment; scripts import shared through a single path; API_PORT falls back to the default on NaN; render.yaml applies migrations in preDeployCommand.
- AC8: npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, and npm run logics:validate pass after implementation.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_016_repo_review_remediation_pass_4_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/request/req_044_repo_review_remediation_pass_3_league_ownership_robustness_and_web_accessibility.md
- logics/tasks/task_045_orchestrate_repo_review_remediation_pass_3.md
- apps/api/src/features/leagues/store.ts
- apps/api/src/config.ts
- apps/web/src/features/ReplayView.tsx
- apps/web/src/features/Modal.tsx
- apps/web/src/features/GarageView.tsx
- apps/web/src/features/LiveryPlate.tsx
- apps/web/src/app/App.tsx
- apps/web/src/styles/layout.css
- packages/shared/src/simulation/simulateRace.ts
- packages/shared/src/simulation/prng.ts
- scripts/balance-simulations.ts
- vitest.config.ts
- render.yaml
- Second full-repo review from 2026-07-18, after pass 3 (commit 99d7f11) was verified sound with zero high-severity findings: a league whose ownerTeamId is null or dangling is permanently unadministrable; the transactional re-reads shrank but did not close the qualifyingRuns lost-update window because rows are never locked under Read Committed; resolveCurrentGrandPrix simulates from state read outside the claiming transaction; positionChange mixes the narrative positionDelta into the real grid-to-finish delta and ReplayView reconstructs the starting grid from it; the replay scrubber fights the rAF loop while playing and weather/tick overlays create pointer dead zones; pickWeighted can return a zero-weight entry when the PRNG yields exactly 0; the mechanical_scare/mechanic_save risk branch has no dedicated test; livery colors from other players are injected into CSS variables unvalidated on the client.

# AI Context
- Summary: Repo review remediation pass 4: ownership resilience, race-window closure, and replay polish
- Keywords: request-chain-scaffold, repo review remediation pass 4: ownership resilience, race-window closure, and replay polish, development-ready
- Use when: You need to implement or review the scaffolded workflow for Repo review remediation pass 4: ownership resilience, race-window closure, and replay polish.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_098_self_healing_league_ownership`
- `item_099_row_locks_and_in_transaction_reads_for_league_writes`
- `item_100_restore_the_positionchange_invariant`
- `item_101_replay_scrubber_interaction_polish`
- `item_102_small_correctness_edges_across_web_and_shared`
- `item_103_deferred_debt_sweep_risk_path_tests_script_and_config_cleanups`
