# Changelogs

This directory stores curated release notes for CR League.

Rules:

- `package.json` is the source of truth for the current package version.
- Each release should have a matching file named `CHANGELOGS_X_Y_Z.md`.
- The filename must match version `vX.Y.Z`, replacing dots with underscores.
- Release notes must use this template:

```md
# CR League X.Y.Z
Release date: YYYY-MM-DD

## Added
- ...

## Changed
- ...

## Fixed
- ...
```

- Keep validation commands and internal release mechanics out of the changelog body.

Example:

- version `0.1.0` -> `changelogs/CHANGELOGS_0_1_0.md`
