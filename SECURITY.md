# Security Policy

## Supported Versions

CR League is in early pre-release development. Security fixes target the latest commit on the default branch.

| Version | Supported |
| --- | --- |
| `main` (latest) | Yes |
| older commits | No |

## Reporting a Vulnerability

Please do not open public issues for suspected vulnerabilities.

Use GitHub private vulnerability reporting or contact the repository owner privately.

Include:

- affected commit or deployed URL, if any;
- browser and OS versions when relevant;
- smallest safe reproduction steps;
- expected impact, such as data exposure, privilege escalation, CSRF, or secret leakage.

Do not include real secrets, bearer tokens, production database URLs, or unredacted personal data.

## Security Model

Current scaffold:

- `apps/web` is a public client-side app shell.
- `apps/api` is a Fastify API shell with only `GET /health`.
- Prisma is configured for PostgreSQL but no application data model is implemented yet.
- `.env` is ignored and must not be committed.

Future trust boundaries:

- server-authoritative race simulation belongs in the API;
- private league and player identity must be enforced server-side;
- invite codes are convenience identifiers, not authentication by themselves;
- frontend configuration is public when exposed through `VITE_*`;
- backend secrets must stay in runtime environment variables.

## Dependency Policy

Run the normal validation gate before finalizing changes:

```bash
npm run typecheck
npm run build
npm test
npm run lint
```

Use `npm audit` when dependency changes introduce meaningful runtime surface or before release preparation.

## Response Expectations

Reports are triaged on a best-effort basis. Confirmed issues are fixed on `main` and disclosed once a fix is available.
