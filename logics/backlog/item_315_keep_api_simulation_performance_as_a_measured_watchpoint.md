## item_315_keep_api_simulation_performance_as_a_measured_watchpoint - Keep API simulation performance as a measured watchpoint
> From version: 0.5.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Backend performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- perf:api currently shows low-millisecond simulation times, so API CPU is not the first bottleneck.
- The average race result JSON is around 111.85 KB, which may matter later if replay payload/network evidence changes.
- Premature API contract changes would risk gameplay and replay compatibility.

# Scope
- In:
  - Rerun npm run perf:api -- --cycles 100 after replay/build work to ensure no regression.
  - Record duration and JSON-size evidence in the task closeout.
  - Open a separate request only if API duration, memory, or payload size becomes a measured problem.
- Out:
  - Changing API contracts or replayTrace/result payload shape.
  - Database profiling.
  - Simulation algorithm changes.

# Acceptance criteria
- AC1: perf:api evidence is captured after the frontend performance changes.
- AC2: No API contract or simulation behavior changes are made in this pass.
- AC3: Any newly discovered API concern is documented as a follow-up instead of hidden inside replay cleanup.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: perf:api evidence is captured after the frontend performance changes.
- request-AC7 -> This backlog slice. Proof: AC2: No API contract or simulation behavior changes are made in this pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_077_runtime_performance_remediation_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_125_runtime_performance_remediation_from_manual_perf_smoke_evidence`
- Primary task(s): `task_126_orchestrate_runtime_performance_remediation`

# AI Context
- Summary: Keep API simulation performance as a measured watchpoint
- Keywords: scaffolded-backlog, keep api simulation performance as a measured watchpoint, implementation-ready
- Use when: Implementing the scaffolded slice for Keep API simulation performance as a measured watchpoint.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Low
- Rationale: Set by scaffold input or defaulted for grooming.
