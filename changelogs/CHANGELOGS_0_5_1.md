# CR League 0.5.1
Release date: 2026-07-27

## Added
- Added new rounds across Africa and Oceania: Auckland, Wellington, Melbourne, Brisbane, Perth, Cairo, Nairobi, Kigali, Dakar, Tunis, Casablanca, Accra, Addis Ababa, Lagos, and Maputo.
- Added country flags and region mappings for the newly introduced countries.

## Changed
- None.

## Fixed
- Expanded the city-circuit corpus after `v0.5.0`, including Bastia plus additional European, African, and Oceanian rounds.
- Added and verified world-region coverage for the new countries and tightened late-circuit gameplay categories.
- Fixed local dev host defaults so browser assets, service worker cache cleanup, and API calls consistently use the IPv4 localhost path.
- Fixed the Playwright private-league mock to cover both `localhost` and `127.0.0.1`, restoring the CI E2E lane after the dev host hardening.
- Added extra European city circuits including Bastia.
- Regenerated circuit water-review evidence and rechecked new layouts visually.
