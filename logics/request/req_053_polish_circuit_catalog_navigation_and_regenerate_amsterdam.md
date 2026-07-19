## req_053_polish_circuit_catalog_navigation_and_regenerate_amsterdam - Polish circuit catalog navigation and regenerate Amsterdam
> From version: 0.3.8
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Circuits
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Regenerate Amsterdam Canal Loop through the cartography-backed circuit generator.
- Improve the Championship section so users return to the last sub-screen they opened.
- Make circuit catalog clicks open an in-panel map screen instead of a modal.
- Highlight the current season round badge when its circuit appears in the Circuits grid.

# Context
- The circuit generator added in `task_053_add_osm_street_circuit_generator` can produce audited street-following routes and write them into the catalog.
- The Garage screen already persists its sub-screen with a small `localStorage` preference; Championship should follow that local pattern.
- Circuit preview in the catalog currently uses a modal, but the requested behavior is a real screen inside the Circuits section.

# Acceptance criteria
- AC1: Amsterdam Canal Loop is regenerated with the circuit generator and still passes the circuit audit.
- AC2: Championship remembers the last selected sub-screen across leaving/re-entering the Championship view.
- AC3: Reset UI preferences clears the remembered Championship sub-screen.
- AC4: Clicking a circuit in the Circuits sub-screen opens a map screen in the panel, not a modal.
- AC5: The circuit map screen has no race controls and can return to the Circuits grid.
- AC6: The current round badge in the Circuits grid has a distinct visual effect.
- AC7: Focused tests cover the UI behavior and validation passes.

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
- Summary: Polish Championship circuit catalog navigation and regenerate Amsterdam Canal Loop.
- Keywords: championship, circuits, Amsterdam, localStorage, circuit map, current round badge
- Use when: You need context for the Championship Circuits UX or Amsterdam Canal Loop route update.
- Skip when: The change is unrelated to circuit catalog navigation.

# Backlog
- none
- `item_130_polish_circuit_catalog_navigation_and_regenerate_amsterdam`
