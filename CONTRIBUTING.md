# Contributing

CR League is developed with an explicit `logics/` workflow and small scoped delivery slices.

## Ground Rules

- Keep changes focused on the active request, backlog item, or task.
- Do not bypass existing product briefs, specs, ADRs, or Logics workflow docs silently.
- Do not commit secrets, local `.env` files, generated caches, or local database dumps.
- Treat future `VITE_*` values as public frontend configuration.
- Prefer small implementation waves over broad rewrites.
- Keep gameplay scope out of foundation tasks unless the active task explicitly includes it.

## Local Setup

```bash
npm install
npm run dev:web
npm run dev:api
```

Local configuration starts from:

```bash
cp .env.example .env
```

Use a dedicated PostgreSQL schema when database work begins:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=cr_league"
```

Never use `schema=public` for this project.

## Expected Workflow

1. Start from an existing Logics task when possible.
2. If the change is new in scope, create or update the relevant request/backlog/task docs first.
3. Implement the smallest coherent slice.
4. Run validation.
5. Commit once per completed task or equivalent scoped slice.

## Validation

Run before finalizing code changes:

```bash
npm run typecheck
npm run build
npm test
npm run lint
npm run logics:validate
```

UI-facing changes that add or alter a player flow must extend the e2e spec
(`tests/e2e/private-league.spec.ts`) for that flow — e2e coverage grows with
the product, not as a separate effort.

For docs-only changes, at minimum run:

```bash
npm run logics:validate
```

## Documentation Expectations

Update documentation when a change affects:

- setup or validation commands;
- environment variables;
- runtime behavior;
- architecture boundaries;
- gameplay contracts;
- deployment or release process.

Likely files:

- `README.md`
- `CONTRIBUTING.md`
- `.env.example`
- `changelogs/CHANGELOGS_X_Y_Z.md`
- relevant docs under `logics/`

## Release Notes

For release work:

- keep `package.json` as the version source of truth;
- add or update the matching file under `changelogs/`;
- use `CHANGELOGS_X_Y_Z.md` for version `vX.Y.Z`.

## License

By contributing to this repository, you agree that your contribution may be distributed under the terms described in [LICENSE](LICENSE).
