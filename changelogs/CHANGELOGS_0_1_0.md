# CHANGELOGS 0.1.0

Initial foundation release notes for CR League.

## Highlights

- Defined the CR League product, gameplay, theme, responsive UX, architecture, and implementation roadmap through Logics.
- Scaffolded the Wave 1 monorepo foundation.
- Added repository governance docs.

## Engineering

- Added npm workspace structure.
- Added Vite React web shell under `apps/web`.
- Added Fastify API shell under `apps/api`.
- Added shared TypeScript package under `packages/shared`.
- Added Prisma/PostgreSQL schema shell under `prisma`.
- Added TypeScript, ESLint, Vitest, and validation scripts.

## Validation

- `npm run typecheck`
- `npm run build`
- `npm test`
- `npm run lint`
- `npm run logics:validate`
