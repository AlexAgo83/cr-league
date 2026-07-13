## spec_007_technical_architecture_v1 - Technical Architecture V1
> From version: 1.0.0
> Schema version: 1.0
> Status: Draft
> Understanding: 80%
> Confidence: 70%
> Related request: `req_002_define_cr_league_v1_planning_specs`
> Related backlog: `item_008_define_cr_league_v1_planning_specs`
> Related task: `task_003_define_cr_league_v1_planning_specs`
> Related product: `prod_001_cr_league_product_brief`

# Purpose
Define a low-cost technical direction for V1.

This is not a final architecture decision. It is a pragmatic target for the first implementation.

# Architecture Principles
- Web app first.
- Server-side authoritative simulation.
- Persist race inputs and outputs.
- Use seedable deterministic simulation.
- Lazy race resolution for scheduled multiplayer races.
- Avoid always-on workers in V1.
- Keep deployment compatible with low-cost hosting that may sleep.

# Recommended Shape
Frontend:

- single web app;
- responsive desktop/mobile layout;
- replay rendered client-side from stored event timeline.

Backend:

- minimal HTTP API;
- simulation runs server-side;
- race resolution endpoint is idempotent;
- invite code generation server-side.

Database:

- relational storage preferred for leagues, teams, races, decisions, events, cards, and standings;
- PostgreSQL is a strong default for deployed multiplayer;
- SQLite can be acceptable for a local solo prototype.

# Core Entities
- User or player identity.
- Team.
- League.
- League membership.
- Season.
- Grand Prix.
- Race entry.
- Race decision.
- Race result.
- Race event.
- Card definition.
- Card inventory item.
- Credit ledger or balance.

# Race Resolution
Required behavior:

- check if race is due;
- lock or transactionally mark race as resolving;
- load all submitted decisions;
- apply defaults for missing decisions;
- run simulation with stored seed;
- persist result and event timeline;
- update standings, credits, and inventory;
- mark race resolved.

Idempotency:

- if race is already resolved, return stored result;
- concurrent requests must not double-award credits or consume cards twice.

# Authentication
V1 options:

- lightweight account system;
- magic link;
- anonymous local prototype identity;
- invite-code plus device/session identity for earliest private tests.

Recommendation:

- prototype can start without full auth;
- multiplayer MVP needs stable identity before real private leagues.

# Invite Codes
- short human-readable code;
- generated server-side;
- unique among active leagues;
- not security-critical by itself;
- joining should still attach a player/team identity.

# Non-goals
- No microservices.
- No always-on race worker requirement.
- No real-time multiplayer infrastructure.
- No public ranking scale work.
- No payment system.
- No native mobile app.

# Open Questions
- Which stack will be used for the actual implementation?
- Is the first prototype local-only or deployed?
- Should auth be introduced before or after solo vertical slice?
- Should replay event storage be JSON blob or normalized table?
