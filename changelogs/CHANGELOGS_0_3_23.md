# CHANGELOGS 0.3.23

Post-release UI polish and recovery hardening.

Covers work shipped after `0.3.22`.

## Highlights

- Renamed the main cockpit screen to `Stand` across the app copy.
- Kept profile and join-league validation errors inline instead of showing the technical error modal.
- Shortened emailed profile recovery codes to a readable 12-character format.
- Made mobile modals full-screen, with bottom-pinned actions and compact launch-GP grid cells.
- Reused the styled current-plan summary in send-plan and chrono confirmations.
- Improved mobile plan cards by letting choices collapse to one column.
- Replaced client-dependent replay emoji controls with stable SVG icons.
- Used the CR and League splash title assets in the topbar brand without distorting their ratios.

## Engineering

- Updated package versions to `0.3.23` across root, web, API, and shared workspaces.
- Kept internal workspace dependency versions aligned with `0.3.23`.
- Updated the roadmap follow-up line for the post-0.3.22 UI polish wave.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run logics:validate`
