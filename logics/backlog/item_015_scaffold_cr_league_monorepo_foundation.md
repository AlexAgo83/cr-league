## item_015_scaffold_cr_league_monorepo_foundation - Scaffold CR League monorepo foundation
> From version: 1.0.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- CR League needs a minimal, validated code foundation before simulation and gameplay work can begin.
- The scaffold must support the chosen PWA/API/shared/Prisma architecture without over-building.

# Scope
- In:
  - root npm workspace.
  - `apps/web` Vite React TypeScript shell.
  - `apps/api` Fastify TypeScript shell with `/health`.
  - `packages/shared` TypeScript package.
  - `prisma/schema.prisma` shell.
  - `.env.example`.
  - baseline scripts and validation.
- Out:
  - gameplay simulation.
  - real database migrations.
  - auth.
  - private multiplayer.
  - Render deployment config.
  - polished UI.

# Acceptance criteria
- AC1: Workspace layout exists as documented.
- AC2: Web, API, and shared packages build.
- AC3: API exposes a health response.
- AC4: Root validation commands pass.
- AC5: No gameplay scope is introduced.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: workspace layout is in scope.
- request-AC2 -> This backlog slice. Proof: web shell is in scope.
- request-AC3 -> This backlog slice. Proof: API health endpoint is in scope.
- request-AC4 -> This backlog slice. Proof: shared package is in scope.
- request-AC5 -> This backlog slice. Proof: Prisma shell and `.env.example` are in scope.
- request-AC6 -> This backlog slice. Proof: root scripts are in scope.
- request-AC7 -> This backlog slice. Proof: validation is recorded on the linked task.

# Decision framing
- Product framing: Not needed
- Architecture framing: Required; this implements the selected app shape.

# Links
- Product brief(s): `prod_001_cr_league_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_009_scaffold_cr_league_monorepo_foundation`
- Primary task(s): `task_010_scaffold_cr_league_monorepo_foundation`

# AI Context
- Summary: Scaffold CR League monorepo foundation
- Keywords: backlog, promote, slice, scaffold cr league monorepo foundation
- Use when: You need a bounded backlog item for Scaffold CR League monorepo foundation.
- Skip when: The change should go straight to implementation detail.

# Priority
- Priority: High
- Rationale: This is the first code wave and enables all later implementation work.

# Notes
- Generated locally by logics-manager.
- Task `task_010_scaffold_cr_league_monorepo_foundation` was finished via `logics-manager flow finish task` on 2026-07-13.

# Tasks
- `task_010_scaffold_cr_league_monorepo_foundation`
