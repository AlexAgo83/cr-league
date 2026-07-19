## req_056_darken_circuit_detail_panel_background - Darken circuit detail panel background
> From version: 0.3.8
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Low
> Theme: Circuits
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Darken the background behind the circuit map in the Championship Circuits detail screen, remove the visible light frame/liseret around the detail map, and keep the close action as the usual X button.

# Context
- The circuit detail screen is rendered inside the Championship panel after clicking a circuit.
- The area behind the map should read as a dark panel rather than inheriting the lighter parent panel/map surface.

# Acceptance criteria
- AC1: The circuit detail screen has a dark background behind the map.
- AC2: The change is scoped to the circuit detail screen, not all circuit maps.
- AC3: The circuit detail map no longer shows a light frame/liseret around the map.
- AC4: The close action is rendered as the usual X button while keeping an accessible label.
- AC5: Focused validation passes.

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
- Summary: Darken the Championship circuit detail screen background behind the map.
- Keywords: championship, circuit detail, dark background, map panel
- Use when: You need context for the circuit detail panel background.
- Skip when: The change is unrelated to Championship Circuits styling.

# Backlog
- none
- `item_133_darken_circuit_detail_panel_background`
