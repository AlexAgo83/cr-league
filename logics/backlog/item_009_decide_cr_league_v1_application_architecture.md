## item_009_decide_cr_league_v1_application_architecture - Decide CR League V1 application architecture
> From version: 1.0.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Architecture
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Implementation should not start until the project chooses a stack and deployment shape.
- CR League has a rich client-side game surface and a backend simulation/persistence requirement, so the wrong architecture could create avoidable cost or complexity.

# Scope
- In:
  - Choose the V1 app shape.
  - Compare Next.js fullstack with static PWA plus dedicated backend.
  - Document database and schema approach.
  - Document deployment approach.
  - Document auth posture for prototype and MVP.
  - Document implementation consequences and revisit triggers.
- Out:
  - scaffolding code.
  - final production hardening.
  - detailed table-by-table Prisma schema.
  - full auth implementation.
  - deployment credentials.

# Acceptance criteria
- AC1: `adr_001_cr_league_v1_static_pwa_api_architecture` contains the architecture decision.
- AC2: The ADR documents alternatives, rationale, consequences, and revisit conditions.
- AC3: The ADR remains aligned with the product brief and V1 technical spec.
- AC4: Logics validation passes.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: ADR captures the chosen V1 stack.
- request-AC2 -> This backlog slice. Proof: ADR compares Next.js fullstack with static PWA plus dedicated API.
- request-AC3 -> This backlog slice. Proof: ADR covers database, deployment, authentication, monorepo shape, and implementation implications.
- request-AC4 -> This backlog slice. Proof: ADR includes non-goals and revisit triggers.

# Decision framing
- Product framing: Required; the client experience should support replay, PWA use, and asynchronous leagues.
- Architecture framing: Required.

# Links
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_003_decide_cr_league_v1_application_architecture`
- Primary task(s): `task_004_decide_cr_league_v1_application_architecture`

# AI Context
- Summary: Decide CR League V1 application architecture
- Keywords: backlog, promote, slice, decide cr league v1 application architecture
- Use when: You need a bounded backlog item for Decide CR League V1 application architecture.
- Skip when: The change should go straight to implementation detail.

# Priority
- Priority: High
- Rationale: The stack decision gates the first implementation backlog.

# Notes
- Generated locally by logics-manager.
- Task `task_004_decide_cr_league_v1_application_architecture` was finished via `logics-manager flow finish task` on 2026-07-13.

# Tasks
- `task_004_decide_cr_league_v1_application_architecture`
