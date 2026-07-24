# CHANGELOGS 0.4.6

Maintainability and release-readiness pass.

## Backend

- Split the oversized leagues store into focused modules behind the unchanged `store.ts` public barrel.
- Kept `storeCore.ts` as a small compatibility barrel for existing imports.
- Centralized leagues route rule-error, guard, and not-found handling behind one helper.
- Extracted the shared body-guard object preamble into `asRecord`.

## Frontend

- Extracted the home splash, modal state, and static UI preference keys out of `App.tsx`.
- Centralized lap-time and gap second formatting through `formatSeconds`.

## Tests and Workflow

- Added API rule-violation coverage for invalid shop inputs and locked qualifying-card mismatch.
- Closed the 0.4 Logics workflow queue and settled the related product briefs.
- Updated README and roadmap to reflect the closed 0.4 state.

## Validation

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm test -- --coverage`
- `npm run balance:gate`
- `logics-manager lint --require-status`
- `logics-manager audit --group-by-doc`
