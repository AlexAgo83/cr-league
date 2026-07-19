## req_052_add_osm_street_circuit_generator - Add OSM street circuit generator
> From version: 0.3.8
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Circuits
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Operators need a repeatable way to generate a ready-to-use city circuit from a city or address without hand-drawing geometry.
- Generated circuits must follow cartography streets, ignore one-way restrictions for gameplay, and still pass the existing local circuit audit rules.
- The seven newly added city circuits must be regenerated through the tool so their provenance is reproducible.

# Context
- Previous hand-authored city additions were visually plausible but not grounded in a routing/cartography API.
- The game already has `scripts/audit-circuits.mjs` for geometric validation: closed route, bounded segment length, no crossings, no direct u-turns, and minimal route reuse.
- Public cartography APIs can be unstable, so the generator needs bounded retries/fallbacks rather than relying on one endpoint.

# Acceptance criteria
- AC1: A CLI can generate a circuit from a place name or explicit latitude/longitude.
- AC2: The generator uses street/routing API data instead of freehand coordinate drawing.
- AC3: Generated routes are audited with the same closure, segment, crossing, u-turn, reverse-reuse, and repeat-reuse rules as shipped circuits.
- AC4: The CLI can write a selected generated route into `apps/web/src/app/circuits.ts` and update laps in `packages/shared/src/domain/circuits.ts`.
- AC5: The two Monaco circuits plus London, Brussels, Prague, Copenhagen, and Stockholm are regenerated through the tool and pass `npm run audit:circuits`.
- AC6: The implementation is documented in Logics and exposed as an npm script for repeat use.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `logics_manager/flow.py`
- `logics_manager/assist.py`
- `tests/python/test_logics_manager_cli.py`

# AI Context
- Summary: Add a reusable cartography-backed circuit generator and regenerate the seven recent city circuits with it.
- Keywords: circuits, OSM, Overpass, OSRM, generated routes, audit-circuits
- Use when: You need context for generating or validating street-following city circuits.
- Skip when: The work is unrelated to circuit geometry or the circuit catalog.

# Backlog
- none
- `item_129_add_osm_street_circuit_generator`
