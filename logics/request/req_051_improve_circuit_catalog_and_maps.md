## req_051_improve_circuit_catalog_and_maps - Improve circuit catalog and maps
> From version: 0.3.8
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Circuits
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make the circuit catalog easier to scan, inspect, and trust by sorting the list, opening listed circuits on the map, adding five European city circuits, and replacing the rough Monaco traces.

# Context
- The championship Circuits tab currently lists circuits in internal declaration order.
- Circuit rows show only thumbnails; the full map exists in race flows but is not available from the catalog.
- New circuit data must avoid self-crossing traces, repeated loops, and suspicious segments according to `npm run audit:circuits`.

# Acceptance criteria
- AC1: Circuit entries are sorted by localized display name.
- AC2: Clicking a catalog circuit opens a read-only map preview without race controls.
- AC3: Five new European city circuits are added without duplicating existing cities.
- AC4: Monaco and new route traces are revised to prefer long straights and curves, with no crossings, u-turns, reverse reuse, or repeated loops in the circuit audit.
- AC5: EN/FR labels and country flags are complete for the added circuits.

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
- Summary: Draft a bounded request for improve circuit catalog and maps.
- Keywords: request-draft, logics-manager, python runtime, bundled CLI
- Use when: You need a new bounded request doc for the Logics workflow.
- Skip when: The work already has an existing request or should go straight to a backlog slice.

# Backlog
- `item_128_improve_circuit_catalog_and_maps`
