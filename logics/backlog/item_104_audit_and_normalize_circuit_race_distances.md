## item_104_audit_and_normalize_circuit_race_distances - Audit and normalize circuit race distances
> From version: 0.3.6
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Circuit pacing
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Circuit routes currently have very different display lengths, and configured laps do not compensate enough.
- Replay duration and perceived race scale can differ by circuit in ways that feel accidental rather than like track identity.
- Manual lap tweaks are risky because route geometry lives in the web app while lap identities also exist in shared domain data.

# Scope
- In:
  - Add a small repo command or script that imports current circuits and reports route length, configured laps, total display distance, recommended laps, and target-band status.
  - Choose and document a target perceived total-distance band for normal circuits, based on current route measurements and replay readability.
  - Adjust lap counts, replay scaling constants, or both so the rotation feels comparable without making every circuit identical.
  - Keep `packages/shared/src/domain/circuits.ts` and `apps/web/src/app/circuits.ts` aligned after any lap-count change.
  - Add unit coverage for the normalization helper or audit output where practical.
- Out:
  - Changing circuit route geometry for aesthetic reasons only.
  - Adding a map provider or external distance service.
  - Changing circuit traits unless a documented coupling requires it.
  - Changing race rewards, season scoring, or league progression.

# Acceptance criteria
- AC1: A repeatable command prints every circuit with route length, laps, total distance, recommended laps, and status.
- AC2: The shortest and longest current circuits are explicitly covered by the audit output.
- AC3: Configured race distances land in the selected target band or list an intentional exception with rationale.
- AC4: Shared circuit identities and web route circuits expose the same lap count for each rotation entry.
- AC5: Tests fail if future circuit data drifts outside the accepted band without updating the contract.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: A repeatable command prints every circuit with route length, laps, total distance, recommended laps, and status.
- request-AC2 -> This backlog slice. Proof: AC2: The shortest and longest current circuits are explicitly covered by the audit output.
- request-AC6 -> This backlog slice. Proof: AC3: Configured race distances land in the selected target band or list an intentional exception with rationale.
- request-AC7 -> This backlog slice. Proof: AC4: Shared circuit identities and web route circuits expose the same lap count for each rotation entry.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_017_coherent_race_replay_and_simulation_realism_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_046_make_race_simulation_and_replay_feel_coherent_across_circuits`
- Primary task(s): `task_047_orchestrate_coherent_replay_realism_and_circuit_normalization`

# AI Context
- Summary: Audit and normalize circuit race distances
- Keywords: scaffolded-backlog, audit and normalize circuit race distances, implementation-ready
- Use when: Implementing the scaffolded slice for Audit and normalize circuit race distances.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
