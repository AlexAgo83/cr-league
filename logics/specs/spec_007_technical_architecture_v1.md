## spec_007_technical_architecture_v1 - Technical Architecture V1
> From version: 1.0.0
> Schema version: 1.0
> Status: Settled
> Understanding: 95%
> Confidence: 90
> Related request: `req_002_define_cr_league_v1_planning_specs`
> Related backlog: `item_008_define_cr_league_v1_planning_specs`
> Related task: `task_003_define_cr_league_v1_planning_specs`
> Related product: `prod_001_cr_league_product_brief`

# Purpose
Define a low-cost technical direction for V1.

This spec records the V1 implementation that now exists in the repository and stays aligned with the accepted ADRs.

# Current Status
Settled for the current V1/playtest architecture. CR League now runs as a Vite React web app, Fastify API, Prisma/PostgreSQL data layer, Render deployment, and GitHub release workflow.

Still not covered here: automated deadline scheduling, reminders, full auth, live operations tooling, and production backup/support procedures. Those remain future product/ops work, not blockers for this architecture spec.

# Architecture Principles
- Web app first.
- Server-side authoritative simulation.
- Persist race inputs and outputs.
- Use seedable deterministic simulation.
- Lazy race resolution through guarded API calls.
- Avoid always-on workers in V1.
- Keep deployment compatible with low-cost hosting that may sleep.

# Implemented Shape
Frontend:

- Vite React app under `apps/web`;
- responsive desktop/mobile cockpit, garage, championship, replay, and report views;
- replay rendered client-side from stored `RaceResult.replayTrace` and events;
- localized English/French copy from app-owned i18n catalogs.

Backend:

- Fastify API under `apps/api`;
- simulation runs server-side from shared package code;
- claim-code protected league/team/admin actions;
- profile creation/recovery with recovery code hash;
- guarded race resolution, next-GP transition, card buying, qualifying, livery, and team-name endpoints.

Database:

- Prisma schema under `prisma/schema.prisma`;
- PostgreSQL deployment with schema-scoped `DATABASE_URL`;
- JSON fields for cards, livery, qualifying runs, forecast, and race result;
- relational rows for profiles, leagues, teams, grand prix, and race decisions.

Deployment:

- Render Blueprint with separate API and static web services;
- migrations run through API `preDeployCommand`;
- Render auto deploy is disabled;
- GitHub release workflow calls Render deploy hooks and checks API health/version.

# Core Entities
- Profile.
- Team.
- League.
- Grand Prix.
- Race decision.
- Race result.
- Race event.
- Card definition.
- Card inventory as team JSON.
- Credits and points as team balances.

# Race Resolution
Implemented behavior:

- validate admin team claim;
- optionally fill bot teams;
- generate missing bot qualifying runs;
- lock the current Grand Prix row on Postgres;
- load all submitted decisions;
- apply defaults for missing decisions;
- run simulation with stored seed;
- persist result, event timeline, and replay trace;
- update standings, credits, and consumed cards;
- mark race resolved.

Idempotency:

- concurrent resolve calls are claimed through guarded `updateMany`;
- concurrent next-GP calls are claimed through the `(leagueId, season, round)` unique constraint;
- qualifying JSON updates lock the Grand Prix row on real Postgres before appending runs.

# Authentication
Implemented V1 identity:

- anonymous local player claims stored client-side;
- team claim code required for team actions;
- owner team claim required for admin actions;
- optional profile with email and recovery code for cross-device league recovery.

Non-goal for this spec: OAuth, magic links, password login, roles beyond owner/member, and admin back office.

# Invite Codes
- short human-readable code;
- generated server-side;
- unique among active leagues;
- not security-critical by itself;
- joining should still attach a player/team identity.

# Operations
- Local validation is `npm run typecheck`, `npm test`, `npm run build`, `npm run lint`, `npm run test:e2e`, and `npm run logics:validate`.
- Release readiness is tracked by Logics release evidence, not by chat memory.
- Production runtime secrets stay in Render.
- The repository intentionally contains no `.env` or production secret values.

# Non-goals
- No microservices.
- No always-on race worker requirement.
- No real-time multiplayer infrastructure.
- No public ranking scale work.
- No payment system.
- No native mobile app.

# Follow-up Work Outside This Spec
- Implement automatic deadline resolution if cadence stops being manual/admin-driven.
- Add reminders/notifications once real playtest behavior proves the need.
- Define backup/restore and support runbooks before broader beta.
- Revisit normalized replay/event storage only if JSON result payloads become a measured bottleneck.
