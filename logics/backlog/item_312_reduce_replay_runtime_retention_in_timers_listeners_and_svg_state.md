## item_312_reduce_replay_runtime_retention_in_timers_listeners_and_svg_state - Reduce replay runtime retention in timers, listeners, and SVG state
> From version: 0.5.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Runtime performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- perf:replay -- --cycles 3 shows materially more retained heap, DOM nodes, and listeners than the normal GP loop.
- Replay has several likely retention points: requestAnimationFrame loops, setTimeout queues, connector SVG measurement, replay camera/focus state, speed menu state, and restart/pause interactions.
- The player-facing replay experience is central to CR League, so optimization must preserve behavior rather than remove features.

# Scope
- In:
  - Run npm run perf:replay -- --cycles 10 and record a before baseline JSON/Markdown.
  - Inspect ReplayView.tsx, replay/useReplayClock.ts, replay/ReplayStageOverlay.tsx, and CircuitMap.tsx for missing cleanup, stale closures, repeated listener/timer setup, or retained DOM-producing state.
  - Patch the smallest shared cleanup points: cancel animation frames, clear timers, bound transient replay state on restart/exit, and avoid accumulating SVG/overlay nodes or event listeners.
  - Rerun perf:replay -- --cycles 10 and perf:compare against the before JSON.
  - Run the private-league Chromium e2e flow to confirm replay controls and navigation still work.
- Out:
  - Replay redesign, animation removal, or disabling focus/speed/restart features.
  - Changing simulation trace generation or race result schema.
  - PWA install/update listener work unless the perf tools prove it is part of replay growth.

# Acceptance criteria
- AC1: After-run perf:replay has lower retained heap, DOM node, and/or listener growth than the before baseline, or any remaining growth is explained with evidence.
- AC2: perf:compare reports better or stable for the targeted replay metrics.
- AC3: Replay pause/play, restart, speed selection, focus driver, Back to stand, and report access still work in e2e/manual checks.
- AC4: typecheck, lint, tests, build, Chromium e2e, and logics validation pass.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: After-run perf:replay has lower retained heap, DOM node, and/or listener growth than the before baseline, or any remaining growth is explained with evidence.
- request-AC2 -> This backlog slice. Proof: AC2: perf:compare reports better or stable for the targeted replay metrics.
- request-AC3 -> This backlog slice. Proof: AC3: Replay pause/play, restart, speed selection, focus driver, Back to stand, and report access still work in e2e/manual checks.
- request-AC7 -> This backlog slice. Proof: AC4: typecheck, lint, tests, build, Chromium e2e, and logics validation pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_077_runtime_performance_remediation_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_125_runtime_performance_remediation_from_manual_perf_smoke_evidence`
- Primary task(s): `task_126_orchestrate_runtime_performance_remediation`

# AI Context
- Summary: Reduce replay runtime retention in timers, listeners, and SVG state
- Keywords: scaffolded-backlog, reduce replay runtime retention in timers, listeners, and svg state, implementation-ready
- Use when: Implementing the scaffolded slice for Reduce replay runtime retention in timers, listeners, and SVG state.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
