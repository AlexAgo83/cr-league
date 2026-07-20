## item_149_gate_the_race_payoff_on_replay_completion - Gate the race payoff on replay completion
> From version: 0.3.11
> Schema version: 1.0
> Status: Ready
> Understanding: 90
> Confidence: 85
> Progress: 0
> Complexity: Low
> Theme: Replay suspense
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The payoff banner with the final position, points, and credits renders under the live replay from lap 2, spoiling the outcome the replay exists to dramatize.
- Returning to a finished Grand Prix auto-plays the replay from the start on every visit (re-spoiling included), and the only exit is an unlabeled × whose meaning (Back to circuit) exists only as an aria-label.

# Scope
- In:
  - Track replay completion in the replay clock state and gate afterMapContent (and any other final-order reveal on the replay tab) on completed-or-skipped.
  - Add an explicit skip-to-result control for players who do not want to watch; skipping counts as completion.
  - Verify the report tab access path does not silently spoil mid-replay, and decide its gating consistently.
  - Coordinate with req_058 item_138: the completion flag belongs in useReplayClock once that split lands.
  - Add a test for hidden-while-playing and visible-after-completion.
  - Once a replay has been completed or skipped, returning to that Grand Prix lands on the finished summary (classification and actions) with the replay one click away, instead of auto-playing it; persist the seen state with the same mechanism as the completion flag.
  - Give the replay exit control a visible label (Back to circuit), not only an aria-label.
- Out:
  - Changing the payoff panel's content or styling.
  - Replay pacing or auto-play behavior.

# Acceptance criteria
- AC1: No final classification or payoff is visible while the replay plays.
- AC2: Completion or explicit skip reveals the payoff as today.
- AC3: A test pins the gating.
- AC4: A finished GP reopens on its summary, not an auto-playing replay, and the replay exit has a visible label.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: No final classification or payoff is visible while the replay plays.
- request-AC7 -> This backlog slice. Proof: AC4: A finished GP reopens on its summary, not an auto-playing replay, and the replay exit has a visible label.
- request-AC8 -> This backlog slice. Proof: AC2: Completion or explicit skip reveals the payoff as today.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_026_replay_suspense_and_first_contact_polish_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_062_replay_suspense_and_first_contact_polish_from_the_2026_07_20_ai_playtest`
- Primary task(s): `task_063_orchestrate_replay_suspense_and_first_contact_polish`

# AI Context
- Summary: Gate the race payoff on replay completion
- Keywords: scaffolded-backlog, gate the race payoff on replay completion, implementation-ready
- Use when: Implementing the scaffolded slice for Gate the race payoff on replay completion.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
