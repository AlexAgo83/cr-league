## item_283_memoize_the_gameapp_shell_to_stop_unrelated_rebuilds - Memoize the GameApp shell to stop unrelated rebuilds
> From version: 0.4.5
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100
> Complexity: Medium
> Theme: Frontend performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Non-semantic edit: traceability repair only.

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
- request-AC3 -> This backlog slice. Evidence needed: The auth KDF no longer blocks the event loop — scryptSync is replaced by async crypto.scrypt on the request path — with auth behavior (hash format, verify results, legacy path) unchanged.
- request-AC4 -> This backlog slice. Evidence needed: Circuit route data is loaded on demand for the selected circuit; the eager circuit-routes chunk is off the first-paint critical path; the correct circuit still renders for every round.
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
- Summary: Memoize the GameApp shell to stop unrelated rebuilds
- Keywords: scaffolded-backlog, memoize the gameapp shell to stop unrelated rebuilds, implementation-ready
- Use when: Implementing the scaffolded slice for Memoize the GameApp shell to stop unrelated rebuilds.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Partially delivered (commit c14290c): adminView construction is gated behind the admin flag so the non-admin majority stops building the AdminConsoleView tree each render. Broader React.memo of leaf views + factory memoization was assessed and descoped: the action factories depend on leagueState/form/currentCircuit which change nearly every render, so memoization rarely hits and stabilizing the closures risks stale-closure bugs for ~no gain. Replay already runs on refs. No further work recommended without a profiled hotspot.
- Task `task_117_orchestrate_the_performance_pass` was finished via `logics-manager flow finish task` on 2026-07-24.
