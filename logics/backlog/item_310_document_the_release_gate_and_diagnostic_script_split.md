## item_310_document_the_release_gate_and_diagnostic_script_split - Document the release gate and diagnostic script split
> From version: 0.5.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: Contributor documentation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- package.json declares 37 scripts and JSON cannot carry comments.
- Roughly 20 of them are diagnostic playtest, balance, generation, and audit tooling that never blocks a merge.
- A first-time contributor cannot tell which commands are mandatory without reading each script body.

# Scope
- In:
  - Add a short Scripts section to CONTRIBUTING.md.
  - Name the merge-gating scripts explicitly.
  - Name the release-only gate separately from the per-merge gate.
  - State that the remaining prefixes are on-demand diagnostics.
  - Confirm every script currently in package.json is covered by one of the stated groups.
- Out:
  - Renaming, removing, or reorganizing any npm script.
  - Documenting the internal behavior of each diagnostic tool.
  - Duplicating the release contract already documented in docs/release-contract.md.

# Acceptance criteria
- AC1: CONTRIBUTING.md has a Scripts section naming the merge gate.
- AC2: Release-only and diagnostic scripts are distinguished from the merge gate.
- AC3: Every script declared in package.json falls under a stated group.
- AC4: No script definition in package.json is modified.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: CONTRIBUTING.md has a Scripts section naming the merge gate.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_076_review_follow_up_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_124_trim_the_eager_web_bundle_and_document_script_and_skip_boundaries`
- Primary task(s): `task_125_orchestrate_the_review_follow_up`

# AI Context
- Summary: Document the release gate and diagnostic script split
- Keywords: scaffolded-backlog, document the release gate and diagnostic script split, implementation-ready
- Use when: Implementing the scaffolded slice for Document the release gate and diagnostic script split.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Validation
- 2026-07-27 validation: CONTRIBUTING.md now has a Scripts section naming the merge gate, release/pre-release checks, local maintenance commands, and on-demand diagnostic/generator prefixes. A package.json script coverage check reported scripts=43 and all scripts covered. package.json was not modified. npm run logics:validate OK with existing non-blocking warnings.
