## req_003_decide_cr_league_v1_application_architecture - Decide CR League V1 application architecture
> From version: 1.0.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Architecture
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Capture the V1 application architecture decision for CR League before implementation begins.
- Compare the two realistic options discussed: a Next.js fullstack application versus a static PWA with a dedicated backend API.
- Ground the decision in nearby project patterns already used in sibling repositories, especially `cp-wc-26` and `PoleApp`.
- Document database, deployment, authentication, monorepo shape, and first implementation implications.

# Context
- CR League currently contains product and gameplay planning docs but no application code.
- The product needs a rich client-side game experience, server-authoritative race simulation, private leagues, Postgres persistence, and cheap hosting.
- The user has access to PostgreSQL and can use a dedicated schema for this project.
- Nearby projects show two established patterns: Next.js plus Prisma/Postgres for `PoleApp`, and Vite static web plus Fastify API plus Prisma/Postgres for `cp-wc-26`.
- CR League's lazy race resolution resembles `cp-wc-26` lazy sync more than a server-rendered application.

# Acceptance criteria
- AC1: An architecture decision record documents the chosen V1 stack and why it fits CR League.
- AC2: The ADR compares Next.js fullstack against static PWA plus dedicated API.
- AC3: The ADR documents database, deployment, authentication, monorepo layout, and implementation implications.
- AC4: The ADR names explicit non-goals and conditions that would justify revisiting the decision.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)

# References
- `prod_001_cr_league_product_brief`
- `spec_003_mvp_vertical_slice`
- `spec_007_technical_architecture_v1`
- Sibling project inspection: `../cp-wc-26`, `../PoleApp`, `../emberwake`, `../fleet-sim`

# AI Context
- Summary: Draft a bounded request for decide cr league v1 application architecture.
- Keywords: architecture, pwa, fastify, prisma, postgres, render, monorepo
- Use when: Choosing or implementing the CR League V1 stack.
- Skip when: Working on gameplay tuning that does not affect application architecture.

# Backlog
- `item_009_decide_cr_league_v1_application_architecture`
