# CR League 0.4.6
Release date: 2026-07-24

## Added
- None.

## Changed
- Split the oversized leagues store into focused modules behind the unchanged `store.ts` public barrel.
- Kept `storeCore.ts` as a small compatibility barrel for existing imports.
- Centralized leagues route rule-error, guard, and not-found handling behind one helper.
- Extracted the shared body-guard object preamble into `asRecord`.
- Extracted the home splash, modal state, and static UI preference keys out of `App.tsx`.
- Centralized lap-time and gap second formatting through `formatSeconds`.
- Updated README and roadmap to reflect the closed 0.4 state.

## Fixed
- Added API rule-violation coverage for invalid shop inputs and locked qualifying-card mismatch.
- Closed the 0.4 Logics workflow queue and settled the related product briefs.
