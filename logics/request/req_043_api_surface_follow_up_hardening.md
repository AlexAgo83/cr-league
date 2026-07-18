## req_043_api_surface_follow_up_hardening - API surface follow-up hardening
> From version: 0.3.5
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: API surface hardening
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Add a minimal league administration authority check to settings, resolve, next-grand-prix, and restart endpoints.
- Keep test output readable by making Fastify logging configurable and disabled in injected tests.
- Harden /simulation/preview input validation enough that malformed enums, forecasts, and participants return 400 instead of reaching simulateRace.
- Document and test the current localStorage secret boundary so future agents do not accidentally treat claimCode or recoveryCode as secure authentication.
- Coordinate with req_041 so team ownership and league administration use the smallest compatible proof model rather than two competing auth designs.

# Context
- req_041 covers team-scoped claimCode checks, atomic Grand Prix resolution, atomic card purchases, create-league errors, crypto codes, and lint reproducibility.
- The remaining authority gap is league-level: /leagues/:leagueId/settings, /resolve, /next-grand-prix, and /restart currently accept only leagueId and no owner/admin proof.
- There is no full account or session system; profiles and team claims are prototype persistence aids. The lazy solution should reuse existing profileId/team claim data before inventing new auth.
- Fastify is constructed with logger: true in buildApp, so npm test passes but emits noisy request logs.
- /simulation/preview currently checks seed, grandPrixName, trait strings, forecast truthiness, and participant count only; it does not validate trait enum values, forecast weights, decision values, participant fields, or card/rival shape.
- The web stores profile session and player claims in localStorage. That is acceptable for the prototype only if the boundary is explicit and tests protect against accidental broad localStorage clearing.

# Acceptance criteria
- AC1: League-level mutations require a minimal admin proof tied to the league creator or an existing human team claim; missing or wrong proof cannot change league settings, resolve a GP, advance a GP, or restart a league.
- AC2: The chosen admin proof model is documented in code/tests and does not add JWT, OAuth, server sessions, or a new auth dependency.
- AC3: buildApp accepts a logger option or test-friendly dependency flag, and API tests run without Fastify request logs unless explicitly enabled.
- AC4: /simulation/preview rejects malformed RaceInput values for trait enums, forecast numbers, participant shape, and decision values with 400.
- AC5: Valid demo preview and valid custom preview payloads still return RaceResult unchanged.
- AC6: A short docs note or Logics closeout note states that claimCode/recoveryCode in localStorage are prototype secrets, with the upgrade path to server sessions when the game needs real account security.
- AC7: Tests cover admin proof rejection, quiet test logging, invalid simulation preview payloads, and localStorage boundary safety.
- AC8: npm run typecheck, npm test, npm run build, npm run logics:validate, and npm run lint pass after implementation.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_014_api_surface_follow_up_hardening_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/request/req_041_api_integrity_hardening_from_repo_review.md
- logics/tasks/task_042_orchestrate_api_integrity_hardening.md
- apps/api/src/app.ts
- apps/api/src/features/leagues/routes.ts
- apps/api/src/features/leagues/store.ts
- apps/api/src/features/simulation/routes.ts
- apps/api/src/app.test.ts
- apps/web/src/app/App.tsx
- apps/web/src/app/types.ts
- packages/shared/src/domain/race.ts
- packages/shared/src/simulation/simulateRace.ts
- Review follow-up from 2026-07-17: league-level mutations are not authority-gated, Fastify logs make test output noisy, /simulation/preview validates only the shallow RaceInput shape, and claim/recovery secrets are stored client-side in localStorage by prototype design.

# AI Context
- Summary: API surface follow-up hardening
- Keywords: request-chain-scaffold, api surface follow-up hardening, development-ready
- Use when: You need to implement or review the scaffolded workflow for API surface follow-up hardening.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_088_add_minimal_admin_proof_to_league_level_mutations`
- `item_089_make_fastify_logging_configurable_for_tests`
- `item_090_harden_simulation_preview_input_validation`
- `item_091_document_prototype_localstorage_secret_boundary`
