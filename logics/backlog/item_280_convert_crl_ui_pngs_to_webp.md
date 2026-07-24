## item_280_convert_crl_ui_pngs_to_webp - Convert crl UI PNGs to WebP
> From version: 0.4.5
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100
> Complexity: Low
> Theme: Frontend performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Non-semantic edit: traceability repair only.

# Problem
- public/assets/crl totals ~14 MB of 250-500 KB PNGs (card/hero art) served via AssetImage.
- Individual Garage/Plan/Championship panels pull 300-500 KB PNGs where WebP would be ~50-80 KB.
- The repo already ships webp for some art, so the encoding path is proven.

# Scope
- In:
  - Convert the crl PNG set to WebP and update the AssetImage references/extensions.
  - Keep AssetImage's existing lazy/async decoding behavior.
  - Spot-check the Garage shop, plan header, and championship screens for visual parity.
- Out:
  - Redesigning any art or layout.
  - Changing AssetImage's loading strategy beyond the file extension.
  - Touching the car sprite assets (separate slice).

# Acceptance criteria
- AC1: The crl art is served as WebP with no visual regression.
- AC2: AssetImage lazy/async behavior is unchanged.
- AC3: Typecheck, lint, and the unit suite stay green.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: The crl art is served as WebP with no visual regression.
- request-AC9 -> This backlog slice. Proof: AC2: AssetImage lazy/async behavior is unchanged.
- request-AC3 -> This backlog slice. Evidence needed: The auth KDF no longer blocks the event loop — scryptSync is replaced by async crypto.scrypt on the request path — with auth behavior (hash format, verify results, legacy path) unchanged.
- request-AC4 -> This backlog slice. Evidence needed: Circuit route data is loaded on demand for the selected circuit; the eager circuit-routes chunk is off the first-paint critical path; the correct circuit still renders for every round.
- request-AC5 -> This backlog slice. Evidence needed: The GameApp shell is memoized so unrelated state changes no longer rebuild the admin view, overlays, and menus; adminView is not constructed for non-admins; rendered output and behavior are unchanged.
- request-AC6 -> This backlog slice. Evidence needed: getLeagueState is built at most once per mutation and its history query no longer fetches decisions/qualifyingRuns/forecast for past grand prixes; API responses are byte-identical to today.
- request-AC7 -> This backlog slice. Evidence needed: Per-team write loops in resolve, season rollover, and bot purchases are batched, reducing in-transaction round-trips, with identical resulting points/credits/state.
- request-AC8 -> This backlog slice. Evidence needed: simulateRace is computed before the write transaction opens; the transaction performs only validation and writes; race-integrity guarantees and simulation outputs are preserved verbatim.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_068_performance_pass_front_and_api_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_116_performance_pass_front_and_api`
- Primary task(s): `task_117_orchestrate_the_performance_pass`

# AI Context
- Summary: Convert crl UI PNGs to WebP
- Keywords: scaffolded-backlog, convert crl ui pngs to webp, implementation-ready
- Use when: Implementing the scaffolded slice for Convert crl UI PNGs to WebP.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Task `task_117_orchestrate_the_performance_pass` was finished via `logics-manager flow finish task` on 2026-07-24.
