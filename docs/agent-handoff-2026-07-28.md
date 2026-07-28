# Agent Handoff - 2026-07-28

## Current State
- Latest commits:
  - `e85072f` preserves credits across season rollover.
  - `3c70f15` preserves garage cards across season rollover.
  - `68a6119` sorts Garage inventory/shop cards by availability first, then deterministic utility.
  - `9d61ff8` adds in-league team profile modals from standings.
  - `a082667`, `746945e`, and `79a52d7` delivered contextual card guidance, derived rivals, and actionable report guidance.
- Active Logics workflow: `req_129` / `task_130` for the 0.6 beta season lifecycle and league management corpus.
- `logics-manager status` reports 5 open workflow docs and no detected next action. The open work is optional/evidence-gated, not a blocker for the delivered 0.6 core.

## Delivered
- `item_324` through `item_330` are delivered: season presets, explicit season-end/next-season flow, commissioner `Direction de course`, manual one-send-per-season reminders, accessibility fixes, report next-action guidance, derived rival context, contextual card guidance, and in-league team profiles.
- Season rollover now resets championship points only. Players, palmares, archived season stats, livery/team identity, credits, and garage cards persist.
- Championship/Garage UI follow-ups landed during the handoff run: board-style switches, dark standings/palmares/history surfaces, mobile standings/palmares/profile fixes, profile stars, card modal contrast, card-cell layout fixes, inventory/shop sort, and unavailable-card ordering.

## Remaining 0.6 Work
- `item_331` optional variable shop stays deferred unless tester evidence shows the fixed shop is too flat or predictable.
- `item_332` is effectively reframed: the baseline continuity rule is now preserve credits and garage cards; only future cap/anti-snowball work should reopen it, and only with balance evidence.
- `item_333` deterministic race engineer stays deferred unless Plan/card guidance remains unclear in playtest.
- Do not add automatic reminders, polling/SSE, deadline auto-resolution, bot replacement, public matchmaking, compact replay, tutorial rewrite, or broad card tuning without new evidence.

## Validation To Re-run
- Last run on 2026-07-28: Logics lint OK, audit OK with expected `req_129` AC traceability warnings while `task_130` is not Done, typecheck OK, targeted API/web tests OK (106 passed), and `git diff --check` OK.
- `rtk logics-manager lint --require-status`
- `rtk logics-manager audit --group-by-doc`
- `rtk npm run typecheck`
- `rtk npm test -- --run apps/api/src/app.test.ts apps/web/src/app/helpers.test.ts apps/web/src/app/App.test.tsx apps/web/src/features/ChampionshipView.test.ts`
- `rtk npm run playtest:browser -- --rounds 2 --report reports/playtest/team-profile-browser.md --ux-report reports/ux/team-profile-browser.md --ux-assets reports/ux/team-profile-browser`

## Watchouts
- `logics-manager flow progress task` can mutate sibling item indicators. If used, verify `item_331`, `item_332`, and `item_333` remain Ready/0 unless they are deliberately started.
- If final-season standings look odd after a 3-GP browser run, investigate that view directly; the latest profile evidence used the normal standings/profile route.
