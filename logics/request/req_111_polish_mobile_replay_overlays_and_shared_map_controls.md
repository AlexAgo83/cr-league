## req_111_polish_mobile_replay_overlays_and_shared_map_controls - Polish mobile replay overlays and shared map controls
> From version: 0.4.3
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Replay mobile ergonomics
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Keep the replay information panel and its Info button usable on mobile.
- Merge driver gaps into the race-follow panel and remove the separate gaps panel.
- Expose the stats chevron in replays and share its expanded state with the standard map.

# Context
- On mobile, the 118 px info panel became static inside a 162 px container while its absolute Info button still used the container as its positioning reference.
- Replay gaps and race-follow copy occupy two panels despite belonging to the same live context.
- `DriveView` owns a local stats state, while replay maps always render traits expanded.

# Acceptance criteria
- AC1: At 390 px, the Info button remains inside a readable information panel.
- AC2: Driver gaps, without position, render at the upper-right of the race-follow panel and the separate gaps panel is removed.
- AC3: Standard and replay maps expose the same stats chevron and use one persisted expanded state.
- AC4: Desktop/mobile rendering, focused tests, full tests, typecheck, lint, build, and Logics validation pass.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `apps/web/src/styles/responsive.css`
- `apps/web/src/features/replay/ReplayStageOverlay.tsx`
- `apps/web/src/app/DriveView.tsx`
- `apps/web/src/features/ReplayView.tsx`

# AI Context
- Summary: Draft a bounded request for polish mobile replay overlays and shared map controls.
- Keywords: request-draft, logics-manager, python runtime, bundled CLI
- Use when: You need a new bounded request doc for the Logics workflow.
- Skip when: The work already has an existing request or should go straight to a backlog slice.

# Backlog
- `item_269_polish_mobile_replay_overlays_and_shared_map_controls`
