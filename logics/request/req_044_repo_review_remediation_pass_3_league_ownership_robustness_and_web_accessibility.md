## req_044_repo_review_remediation_pass_3_league_ownership_robustness_and_web_accessibility - Repo review remediation pass 3: league ownership, robustness, and web accessibility
> From version: 0.3.6
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Repo review remediation
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Introduce a real league owner (League.ownerTeamId) so league-level mutations require the owner's claim, not any member's claim.
- Validate approach, preparation, cardId, and rivalTeamId on the persisted submitDecision path with the same rules already applied to /simulation/preview, and cap the preview participants array.
- Make the concurrent write paths safe: transactional qualifyingRuns append, idempotent bot fill, and idempotent transactional startNextGrandPrix.
- Fix scripts/balance-simulations.ts imports and bring scripts/ under the typecheck build so such breakage is caught by CI.
- Give web modals native focus management (focus on open, Escape to close, focus restore) and replace the replay scrubber with a native range input; clamp league-config numeric inputs before submit.
- Add focused tests for the deterministic PRNG and the credit/points reward math.

# Context
- req_041 hardened the atomic money paths (buyCard, resolveCurrentGrandPrix) with guarded updateMany writes; those patterns are good and should be reused.
- req_043 added requireAdminClaim, but it delegates to requireTeamClaim, so any human team in a league can call settings, resolve, next-grand-prix, and restart. The schema has no owner concept yet.
- submitDecision stores approach and preparation as raw strings (store.ts around line 581) while /simulation/preview validates them against APPROACHES and PREPARATIONS; the persisted path is the one that feeds real league scoring.
- submitQualifyingRun and ensureBotQualifyingRuns do read-modify-write on the qualifyingRuns JSON column without a transaction, so overlapping submissions silently drop runs; fillLeagueWithBots can double-create bots and 500 on the unique constraint; startNextGrandPrix is neither idempotent nor transactional.
- tsconfig.json project references cover only packages/shared, apps/api, and apps/web; scripts/balance-simulations.ts imports CARD_PRICES and createPrng which packages/shared/src/index.ts does not export, and nothing catches it.
- The web app has no focus management: modals declare role=dialog aria-modal but have no Escape handling, focus trap, or focus restore; the replay scrubber is a click-only div with aria-hidden; league-config numeric inputs submit 0 or NaN when cleared.
- The shared PRNG and the reward math in classify (fleet sponsorship bonus, economy mode top-4 bonus) have no unit tests despite being balance-affecting.

# Acceptance criteria
- AC1: League has an ownerTeamId set at creation to the first human team, and settings, resolve, next-grand-prix, and restart reject any non-owner claim with 403 while the owner's existing web flows keep working.
- AC2: submitDecision rejects invalid approach, preparation, cardId, and rivalTeamId values with 400 using the same allowed sets as /simulation/preview, and /simulation/preview rejects participants arrays larger than the maximum league size.
- AC3: Concurrent qualifying submissions cannot lose runs (transactional append), duplicate bot fill cannot 500 (first writer wins, second is a no-op), and startNextGrandPrix claims the transition with a guarded conditional write inside one transaction so double calls and mid-way failures leave consistent state.
- AC4: scripts/balance-simulations.ts compiles and runs against the real shared exports, and npm run typecheck covers scripts/.
- AC5: Modals focus their dialog on open, close on Escape, restore focus on close via one small shared component with no new dependency; the replay scrubber is a native range input that is keyboard and screen-reader operable; league-config numeric fields clamp to their min/max before submit.
- AC6: Unit tests cover PRNG determinism and weighted-pick edge cases, and assert exact credits/points for the sponsorship and economy-mode reward branches.
- AC7: npm run typecheck, npm test, npm run build, npm run lint, and npm run logics:validate pass after implementation.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_015_repo_review_remediation_pass_3_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/request/req_041_api_integrity_hardening_from_repo_review.md
- logics/request/req_043_api_surface_follow_up_hardening.md
- apps/api/src/features/leagues/routes.ts
- apps/api/src/features/leagues/store.ts
- apps/api/src/features/simulation/routes.ts
- apps/api/src/app.test.ts
- apps/web/src/app/App.tsx
- apps/web/src/features/ReplayView.tsx
- apps/web/src/features/GarageView.tsx
- packages/shared/src/index.ts
- packages/shared/src/simulation/prng.ts
- packages/shared/src/simulation/simulateRace.ts
- scripts/balance-simulations.ts
- prisma/schema.prisma
- tsconfig.json
- Full-repo review from 2026-07-18: the req_043 admin proof accepted any team claim, so every league member can restart or resolve a league; the persisted decision path skips the enum validation added to /simulation/preview; qualifyingRuns, bot fill, and next-grand-prix have lost-update or duplicate-write races; scripts/ is outside the typecheck build and balance-simulations.ts imports symbols that shared does not export; web modals lack focus management and the replay scrubber is keyboard-inaccessible.

# AI Context
- Summary: Repo review remediation pass 3: league ownership, robustness, and web accessibility
- Keywords: request-chain-scaffold, repo review remediation pass 3: league ownership, robustness, and web accessibility, development-ready
- Use when: You need to implement or review the scaffolded workflow for Repo review remediation pass 3: league ownership, robustness, and web accessibility.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_092_add_league_owner_and_gate_admin_mutations_on_it`
- `item_093_validate_persisted_decisions_and_cap_preview_participants`
- `item_094_make_concurrent_league_write_paths_safe`
- `item_095_fix_balance_script_imports_and_typecheck_scripts_directory`
- `item_096_web_accessibility_and_numeric_input_clamping`
- `item_097_test_prng_determinism_and_reward_math`
