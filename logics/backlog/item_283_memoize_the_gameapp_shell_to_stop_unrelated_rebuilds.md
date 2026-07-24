## item_283_memoize_the_gameapp_shell_to_stop_unrelated_rebuilds - Memoize the GameApp shell to stop unrelated rebuilds
> From version: 0.4.5
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 40
> Complexity: Medium
> Theme: Frontend performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- There is no React.memo anywhere in src; GameApp (App.tsx:102) rebuilds action factories (305/326/339/380) and commonOverlays (620), adminView (702), setupTopbar (615), profileMenu (769) on every state change.
- adminView/AdminConsoleView and overlay modals are constructed even for non-admins and when no modal is open.
- Any keystroke/click reconciles the whole shell because nothing downstream is memoized.

# Scope
- In:
  - Wrap the leaf views (AdminConsoleView, AppOverlays, DriveView, ChampionshipView, ProfileMenu) in React.memo.
  - useMemo/useCallback the action-factory results and the commonOverlays/adminView/setupTopbar trees so unrelated state changes do not rebuild them.
  - Gate adminView construction behind the admin condition.
- Out:
  - Changing the per-frame replay loop (already imperative — must not be touched).
  - Introducing a state-management library or restructuring GameApp's state.
  - Changing any rendered output or behavior.

# Acceptance criteria
- AC1: Unrelated state changes no longer rebuild the admin view, overlays, or menus.
- AC2: adminView is not constructed for non-admins; rendered output and behavior are unchanged, proven by the App tests.
- AC3: Typecheck, lint, and the unit suite stay green.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: Unrelated state changes no longer rebuild the admin view, overlays, or menus.
- request-AC9 -> This backlog slice. Proof: AC2: adminView is not constructed for non-admins; rendered output and behavior are unchanged, proven by the App tests.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_068_performance_pass_front_and_api_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_116_performance_pass_front_and_api`
- Primary task(s): `task_117_orchestrate_the_performance_pass`

# AI Context
- Summary: Memoize the GameApp shell to stop unrelated rebuilds
- Keywords: scaffolded-backlog, memoize the gameapp shell to stop unrelated rebuilds, implementation-ready
- Use when: Implementing the scaffolded slice for Memoize the GameApp shell to stop unrelated rebuilds.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Partially delivered (commit c14290c): adminView construction is gated behind the admin flag so the non-admin majority stops building the AdminConsoleView tree each render. Broader React.memo of leaf views + factory memoization was assessed and descoped: the action factories depend on leagueState/form/currentCircuit which change nearly every render, so memoization rarely hits and stabilizing the closures risks stale-closure bugs for ~no gain. Replay already runs on refs. No further work recommended without a profiled hotspot.
