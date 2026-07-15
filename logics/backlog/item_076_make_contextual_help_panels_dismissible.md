## item_076_make_contextual_help_panels_dismissible - Make contextual help panels dismissible
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Contextual help controls
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Race prep and Race replay explanatory panels are helpful on first use but become repeated clutter.
- Players currently cannot close these panels without losing the underlying feature.
- The close interaction must be small and clear without making the panels feel like modal dialogs.

# Scope
- In:
  - Add a compact close button to the Race prep panel in `App.tsx`.
  - Add a compact close button to the Race replay panel in `ReplayView.tsx`.
  - Persist each dismissal with its own stable localStorage key.
  - Hide dismissed panels on initial render and after reload.
  - Use localized accessible labels for the close controls.
  - Style the close button to fit existing `.race-context-panel` cards on desktop and mobile.
- Out:
  - Closing every panel in the application.
  - Replacing the panels with tooltips.
  - Adding animations or transitions beyond existing CSS conventions.
  - Changing the content or purpose of the Race prep and Race replay copy.

# Acceptance criteria
- AC1: Race prep can be closed and stays hidden after reload.
- AC2: Race replay can be closed and stays hidden after reload.
- AC3: Close buttons have accessible labels and keyboard focus styling.
- AC4: Closed panels do not leave awkward gaps or overlapping controls.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Race prep can be closed and stays hidden after reload.
- request-AC2 -> This backlog slice. Proof: AC2: Race replay can be closed and stays hidden after reload.
- request-AC3 -> This backlog slice. Proof: AC3: Close buttons have accessible labels and keyboard focus styling.
- request-AC5 -> This backlog slice. Proof: AC4: Closed panels do not leave awkward gaps or overlapping controls.
- request-AC9 -> This backlog slice. Proof: AC4: Closed panels do not leave awkward gaps or overlapping controls.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_011_dismissible_help_panels_and_ui_preferences_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_040_add_dismissible_help_panels_and_ui_preference_reset`
- Primary task(s): `task_041_orchestrate_dismissible_help_panels_and_ui_preference_reset`

# AI Context
- Summary: Make contextual help panels dismissible
- Keywords: scaffolded-backlog, make contextual help panels dismissible, implementation-ready
- Use when: Implementing the scaffolded slice for Make contextual help panels dismissible.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
