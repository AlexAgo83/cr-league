## req_055_align_circuit_detail_close_action - Align circuit detail close action
> From version: 0.3.8
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Low
> Theme: Circuits
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- In the Championship Circuits detail screen, the close action should be fixed in the top-right of the panel header, visually aligned to the right of the circuit title.

# Context
- Circuit detail currently uses an in-panel map screen after clicking a circuit.
- The close/return action was shown as a standalone button above the map, which did not match the requested header placement.

# Acceptance criteria
- AC1: The circuit detail screen shows the circuit city/name in a header.
- AC2: The close button is aligned to the top-right of that header.
- AC3: The map does not duplicate the title below the custom header.
- AC4: Focused validation passes.

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
- Summary: Align the circuit detail close action with the circuit title in the Championship Circuits view.
- Keywords: championship, circuit detail, close button, panel header
- Use when: You need context for the circuit detail header layout.
- Skip when: The change is unrelated to Championship Circuits detail layout.

# Backlog
- none
- `item_132_align_circuit_detail_close_action`
