## road_002_cr_league_roadmap_v2 - CR League Roadmap v2
> Date: 2026-07-15
> Status: Accepted
> Related product: `prod_001_cr_league_product_brief`
> Related request: `req_033_over_engineering_cleanup_pass_1`, `req_034_personalized_race_recap`, `req_035_make_garage_inventory_cards_open_the_card_detail_modal`, `req_036_github_ci_render_blueprint_and_release_contract`, `req_037_starting_grid_modal_and_season_narrative`
> Reminder: Update status, milestone scope, linked refs, risks, and success signals when you edit this doc.
> Confidence: 90
> Non-semantic edit: 2026-07-18 release roadmap wording refresh.

# Summary
Plan CR League from the current playable prototype toward a stable private-league V1, replacing `road_001`'s closed milestone blocks with an open three-level scheme: `X.Y` is a stable theme, `X.Y.Z` is one feature drop (roughly one request chain). New features slot in as new patches under the nearest active theme — the roadmap absorbs ideas without renumbering.

Delivered-work history lives in `changelogs/`, not here: this document keeps goals, planned patches, and exit signals only.

# Versioning contract
- `X.Y` (minor) = a theme milestone. Stable, renamed or added only when the product direction changes.
- `X.Y.Z` (patch) = one shippable feature drop, normally one request chain. Added freely under the active theme; never requires renumbering siblings.
- Once `req_036`'s release contract is live, each shipped patch becomes a git tag `vX.Y.Z` and a `changelogs/CHANGELOGS_X_Y_Z.md` entry; before that, patch numbers are planning slots only.
- Insertion rule: a new feature idea = a new patch under the closest active theme. A new minor is created only for a genuinely new theme.
- Version labels are planning targets, not release promises.

# Current Position (2026-07-18)
- 0.1 (vertical slice) and 0.2 (private league prototype) are implemented; their detail is preserved in `road_001` and the specs.
- The prototype runs the full private-league loop: profiles, invite codes, qualifying, directives, resolution, animated replay, reports, seasons, garage with a 15-card economy, EN/FR, balance simulations.
- Five request chains are scaffolded, validated, and ready to dev with handoff context packs: `req_033` (code cleanup), `req_034` (personalized recap + GP identity), `req_035` (garage card consultation), `req_036` (CI, Render blueprint, release contract), `req_037` (starting grid + season narrative).
- Cross-chain sequencing is encoded in the request docs: `req_033` ships first (shared files and the logics-manager devDependency the CI needs); `req_034`/`req_035`/`req_037` follow on the web side; `req_036` is independent of the gameplay chains.
- Hosted environment, CI, release contract, and versioned release flow are now real. Still not real: automatic scheduler, full auth, and multi-person playtest evidence for the current balance.

# Milestones
## 0.1 - Playable vertical slice
- Status: Implemented. See `road_001` and `spec_016_implementation_roadmap` for the delivered detail.

## 0.2 - Private league prototype
- Status: Implemented. See `road_001` for the delivered detail.

## 0.3 - Playtest-ready loop
- Goal: Make the 3-GP private playtest loop feel designed, legible, and worth a tester's hour — and keep the codebase small enough to iterate fast.
- Status: Active.
- Planned patches:
  - 0.3.1 — Over-engineering cleanup: ~550 lines deleted/consolidated, single validation layer, honest data shapes. (`req_033`, ready to dev)
  - 0.3.2 — Garage card consultation: inventory cards open the read-only detail modal. (`req_035`, ready to dev)
  - 0.3.3 — Starting grid and season narrative: pre-launch grid recap, season champion celebration, palmares, season-grouped history. (`req_037`, ready to dev)
  - 0.3.4 — Personalized race recap: per-circuit GP identity, i18n interpolation, recap cards built from the player's race data. (`req_034`, ready to dev)
  - 0.3.5 — Visual identity and mobile polish. Shipped in `changelogs/CHANGELOGS_0_3_5.md`.
  - 0.3.6 — Cockpit/setup visual identity and release contract alignment. Shipped in `changelogs/CHANGELOGS_0_3_6.md`.
  - 0.3.7 — First-session setup polish: compact Profile/League choices, saved-league cell styling, bottom-centered notifications, clearer Race Desk copy. Shipped in `changelogs/CHANGELOGS_0_3_7.md`.
  - 0.3.8 — Race learning feedback: chrono report/history, setup suggestions, payoff recap, starter credits, and tire-prep wording. In progress in `changelogs/CHANGELOGS_0_3_8.md`.
  - 0.3.9+ — Open slots for playtest feedback.
- Exit signal:
  - 3 to 5 testers complete a 3-GP session on the polished loop;
  - feedback answers whether choices feel causal, recaps feel personal, and seasons feel like arcs;
  - the codebase carries no known dead weight from the audit.
- Linked docs: `req_032_redesign_the_cr_league_race_cockpit_v0`, `req_033_over_engineering_cleanup_pass_1`, `req_034_personalized_race_recap`, `req_035_make_garage_inventory_cards_open_the_card_detail_modal`, `req_037_starting_grid_modal_and_season_narrative`, `spec_016_implementation_roadmap`.

## 0.4 - Ship rails
- Goal: Make releases a one-gesture, verified operation: parallel CI on every change, a reproducible Render environment in the repo, and version tags that deploy themselves.
- Status: Implemented for the current release path.
- Planned patches:
  - 0.4.0 — CI, Render blueprint, and release contract: parallel test lanes, render.yaml (API + static web + Postgres), release-published deploy via Render hooks with CI gate and /health version verification. Shipped.
  - 0.4.x — Open slots: integration-test CI lane against real Postgres, beta league hardening, admin reset/support path, known-limits page for testers.
- Exit signal:
  - publishing a GitHub Release vX.Y.Z is the only deploy path and ends with production /health reporting that version;
  - a small invited group can play on the hosted environment without local dev tooling.
- Linked docs: `req_036_github_ci_render_blueprint_and_release_contract`, `adr_001_cr_league_v1_static_pwa_api_architecture`, `adr_004_data_security`.

## 0.5 - Economy and card depth
- Goal: Add enough card and currency depth for repeated sessions without burying the casual player.
- Status: Planned; balance kit and 15-card catalogue already exist (see `road_001` 0.4 for the delivered foundation).
- Scope to slice into patches when requests exist: card acquisition variety (draft/sell), catch-up mechanisms that help low-ranked players without making first place feel random, balance telemetry from real playtests, economy rules documented before broadening the card list.
- Exit signal: players earn and spend across multiple GPs, card choices create visible replay/report moments, and bottom-table players have comeback options while leaders still feel rewarded.
- Linked docs: `item_004_design_and_implement_the_v1_card_and_inventory_system`, `item_005_define_balancing_and_retention_mechanics_for_social_leagues`, `spec_001_grand_prix_core_loop_and_simulation_v1`.

## 0.6 - Live beta season
- Goal: Run a real beta season long enough to validate cadence, replay comprehension, economy pressure, and return behavior.
- Status: Planned (renumbered from road_001's 0.7; same intent).
- Scope to slice into patches when requests exist: beta season lifecycle, feedback capture across GP cycles, balance tweaks from observed behavior, notifications/reminders only if usage proves the need.
- Exit signal: beta players complete a short season with enough feedback to decide what belongs in 1.0; remaining 1.0 work is known, not guessed.
- Linked docs: `prod_001_cr_league_product_brief`, `spec_016_implementation_roadmap`.

## 1.0 - Private league V1
- Goal: Ship a stable private-league experience that can run cheaply and be shared with non-gamer colleagues.
- Status: Post-beta target.
- Scope: production hardening of the 0.4 rails, league lifecycle completeness, accessibility and i18n baseline, operational docs (configuration, smoke, backups, known limits), minimal abuse/security guardrails for invite-code leagues.
- Exit signal: a private league runs a full short championship without manual database intervention; validation and smoke gates are repeatable from a clean environment; the cost model stays hobby-compatible.
- Linked docs: `adr_001_cr_league_v1_static_pwa_api_architecture`, `adr_004_data_security`, `adr_006_accessibility`, `adr_007_i18n`, `adr_008_testing_quality`, `spec_016_implementation_roadmap`.

# Sequencing
- 0.3.1 (`req_033`) ships first: it deletes code every other chain would otherwise conflict with and adds the logics-manager devDependency the CI needs.
- 0.4.0 (`req_036`) can run in parallel with the remaining 0.3.x gameplay patches — different files, independent teams.
- Within 0.3.x, `req_035` and `req_037` precede `req_034` only by convenience (smaller first); all three are sequenced after `req_033` in their request docs.
- Do not start 0.5 economy depth until 0.3.x playtest feedback exists; do not start 1.0 hardening until the 0.6 beta has produced real usage.

# Next Recommended Requests
- Dev the five ready chains in the encoded order; push main to GitHub before handing off (`req_036` workflows only exist on GitHub).
- After 0.3.x ships: run the 3-to-5 tester session and turn its feedback into 0.3.5+ patches or 0.5 slices.
- After 0.4.0 ships: cut the first tagged release and validate the full release contract end to end.

# Risks
- Building the card economy before repeated-GP playtest truth would tune the wrong game.
- Async cadence can feel dead if the next action and deadline are not obvious.
- A richer replay becomes expensive if it drifts toward real-time simulation before deterministic playback proves the need.
- Patch slots make it easy to accept scope: the insertion rule adds features to themes, it does not remove the need to say no.
- Version labels are planning targets, not release promises.

# References
- Product brief(s): `prod_001_cr_league_product_brief`
- Superseded roadmap: `road_001_cr_league_roadmap` (kept for 0.1/0.2 delivered detail)
- Implementation roadmap spec: `spec_016_implementation_roadmap`
- Request(s): `req_033_over_engineering_cleanup_pass_1`, `req_034_personalized_race_recap`, `req_035_make_garage_inventory_cards_open_the_card_detail_modal`, `req_036_github_ci_render_blueprint_and_release_contract`, `req_037_starting_grid_modal_and_season_narrative`
- Backlog item(s): (tracked per request chain)
- Task(s): `task_034_orchestrate_over_engineering_cleanup_pass_1`, `task_035_orchestrate_personalized_race_recap`, `task_036_orchestrate_garage_inventory_card_consultation`, `task_037_orchestrate_ci_render_blueprint_and_release_contract`, `task_038_orchestrate_starting_grid_and_season_narrative`

# AI Context
- Summary: Release-level roadmap for CR League with a three-level version scheme (theme minors, feature-drop patches) from playable prototype to private league V1.
- Keywords: roadmap, milestones, versions, patches, release-plan, private-league, playtest, ship-rails
- Use when: Planning or sequencing CR League product increments, or deciding where a new feature idea slots in.
- Skip when: You need execution details for a single backlog item or task.
