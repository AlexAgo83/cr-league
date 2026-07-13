## req_009_scaffold_cr_league_monorepo_foundation - Scaffold CR League monorepo foundation
> From version: 1.0.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Implementation
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Scaffold the CR League Wave 1 monorepo foundation.
- Create the minimal workspace structure for the chosen architecture: Vite React web app, Fastify API, shared package, and Prisma schema shell.
- Add baseline scripts and validation commands so later waves can build on a checked foundation.
- Avoid gameplay implementation in this wave.

# Context
- `adr_001_cr_league_v1_static_pwa_api_architecture` chooses static Vite React PWA + Fastify API + Prisma/Postgres.
- `spec_016_implementation_roadmap` defines Wave 1 as monorepo foundation only.
- This repository currently contains Logics docs but no application code.
- The scaffold should stay minimal and follow local sibling patterns such as `cp-wc-26` where useful.

# Acceptance criteria
- AC1: Root npm workspace exists with `apps/web`, `apps/api`, `packages/shared`, and `prisma`.
- AC2: Web app has a minimal Vite React shell.
- AC3: API app has a minimal Fastify server with `GET /health`.
- AC4: Shared package builds and exports baseline app metadata or types.
- AC5: Prisma schema shell and `.env.example` exist for PostgreSQL.
- AC6: Root scripts exist for dev, build, typecheck, test, and lint.
- AC7: Validation commands pass: install, typecheck, build, test, lint, Logics lint/audit.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)

# References
- `adr_001_cr_league_v1_static_pwa_api_architecture`
- `spec_016_implementation_roadmap`
- `spec_010_data_model_and_api_contract_v0`

# AI Context
- Summary: Draft a bounded request for scaffold cr league monorepo foundation.
- Keywords: monorepo, scaffold, vite, react, fastify, prisma, wave-1
- Use when: Reviewing or extending the initial CR League code foundation.
- Skip when: Implementing gameplay, simulation, or multiplayer features.

# Backlog
- `item_015_scaffold_cr_league_monorepo_foundation`
