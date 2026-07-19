## item_128_improve_circuit_catalog_and_maps - Improve circuit catalog and maps
> From version: 0.3.8
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100
> Complexity: Medium
> Theme: Circuits
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The circuit catalog is hard to scan because it follows internal declaration order instead of display names.
- Circuit entries show a thumbnail but cannot be opened for inspection.
- The catalog needs more European city variety, and Monaco routes need to look like road-following circuits rather than rough loops.

# Scope
- In:
  - Sort the championship circuit catalog by localized circuit name.
  - Let each circuit entry open a read-only map preview using the existing circuit map surface.
  - Add five European city circuits that are not already represented.
  - Add localized circuit names and country flag assets for the new cities.
  - Replace Monaco route points with audited road-like traces.
- Out:
  - unrelated sibling slices.
  - New runtime map dependencies.
  - Interactive race controls inside the catalog preview.

# Acceptance criteria
- AC1: The circuit catalog is sorted by localized circuit display name.
- AC2: Clicking a circuit entry opens a read-only map preview.
- AC3: Five new European city circuits are present and do not duplicate cities already in the catalog.
- AC4: Monaco and the new circuit routes pass `npm run audit:circuits`.
- AC5: Visible names and flags are available for EN/FR and all new country codes.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1.
- request-AC2 -> This backlog slice. Proof: AC2.
- request-AC3 -> This backlog slice. Proof: AC3.
- request-AC4 -> This backlog slice. Proof: AC4.
- request-AC5 -> This backlog slice. Proof: AC5.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `req_051_improve_circuit_catalog_and_maps`
- Primary task(s): `task_052_improve_circuit_catalog_and_maps`

# AI Context
- Summary: Sort and expand the circuit catalog with map previews.
- Keywords: circuits, catalog, maps, route audit, Monaco
- Use when: You need a bounded backlog item for Improve circuit catalog and maps.
- Skip when: The change should go straight to implementation detail.

# Priority
- Priority: Medium
- Rationale: User-visible catalog polish and data quality issue, but no production data migration.

# Tasks
- `task_052_improve_circuit_catalog_and_maps`

# Notes
- Generated locally by logics-manager.
- Delivered by `task_052_improve_circuit_catalog_and_maps`.
