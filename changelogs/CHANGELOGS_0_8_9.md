# CR League 0.8.9
Release date: 2026-10-29

## Added
- No new features in this release.

## Changed
- Migrated to Prisma 7 and the PostgreSQL driver adapter. Database connections preserve the schema configured in `DATABASE_URL`, including for raw SQL; migration configuration now reads the URL from `prisma.config.ts`. This breaking dependency upgrade raises the Node.js requirement to `^22.22.2`. (#30)

## Fixed
- Resolved npm security alerts through dependency and lockfile updates, including a `deepmerge-ts` override. (6e2a6016e8041f93190a4e7f7de1c6aee1bfa3b9)

## Maintenance
- Upgraded Vitest and `@vitest/coverage-v8` together to 5.0.5, following the earlier Vitest 4.1.11 update. (#47, #29)
- Refreshed grouped runtime and development dependencies across four update batches. (#48, #44, #36, #32)
- Applied lockfile security updates from `npm audit fix`. (8146eafd43f50e03ac03dff3bad197295d9afddb)
- Upgraded dotenv from 17.4.2 to 18.0.8. (#42)
- Updated source-map-js from 1.2.1 to 1.2.2. (#45)
- Updated brace-expansion to address Dependabot security alert #26. (#40)
- Updated fast-uri and ip-address, including ip-address 10.7.3. (#38, #39)
- Upgraded nodemailer through versions 9.1.1 and 10.0.10. (#27, #35)
- Upgraded jsdom to 30.0.1. (#31)
