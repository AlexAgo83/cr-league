# CHANGELOGS 0.3.28

Canonical race geometry, track zones, admin hardening, and car asset automation.

Covers work shipped after `0.3.27`.

## Highlights

- Fixed simulation fidelity and replay performance issues from the latest remediation pass.
- Added canonical race-track geometry and zone data so race simulation, replay maps, and reports share the same spatial source.
- Hardened admin status/privacy flows and replaced a technical profile error modal with friendlier user-facing copy.
- Enriched the AI playtest balance runner with canonical zones and additional balance simulation support.
- Added an automated car asset cutout, light-point detection, and regeneration pipeline with side-wheel hub refinements.

## Engineering

- Updated package versions to `0.3.28` across root, web, API, and shared workspaces.
- Kept internal workspace dependency versions aligned with `0.3.28`.
- Added Logics corpus updates for post-remediation hardening, pit-stop alignment, canonical race-track geometry, admin hardening, canonical zones, AI playtest balance, and leagues store modularization.

## Validation

- `npm run lint`
- `npm run test`
- `npm run build`
