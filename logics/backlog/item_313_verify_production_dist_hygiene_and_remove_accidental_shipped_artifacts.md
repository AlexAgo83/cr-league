## item_313_verify_production_dist_hygiene_and_remove_accidental_shipped_artifacts - Verify production dist hygiene and remove accidental shipped artifacts
> From version: 0.5.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Build performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- perf:bundle reports apps/web/dist contains categories such as tsbuildinfo, source maps, TS, and test JS in the local dist scan.
- Some entries may be local build residue or copied artifacts rather than production-served files; this must be verified before changing build config.
- Broad eager bundle splitting is already covered by req_124, so this item should stay focused on accidental output hygiene.

# Scope
- In:
  - Run a clean production build from a clean dist directory and rerun npm run perf:bundle.
  - Identify whether any test JS, TS source, source maps, or tsbuildinfo files are actually inside apps/web/dist after the clean build.
  - If accidental artifacts are present, fix the smallest build/config issue that emits them or clean them from production output.
  - Document if the earlier artifacts were only stale local residue and not reproducible.
- Out:
  - Large code-splitting work already tracked by req_124.
  - Changing TypeScript project architecture beyond what is needed to stop accidental output.
  - Adding a new bundle analyzer dependency.

# Acceptance criteria
- AC1: A clean-build perf:bundle report is captured.
- AC2: No accidental test/source/tsbuildinfo files remain in production dist, or the report documents that they were not reproducible.
- AC3: npm run build and npm run perf:bundle pass after the cleanup.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: A clean-build perf:bundle report is captured.
- request-AC7 -> This backlog slice. Proof: AC2: No accidental test/source/tsbuildinfo files remain in production dist, or the report documents that they were not reproducible.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_077_runtime_performance_remediation_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_125_runtime_performance_remediation_from_manual_perf_smoke_evidence`
- Primary task(s): `task_126_orchestrate_runtime_performance_remediation`

# AI Context
- Summary: Verify production dist hygiene and remove accidental shipped artifacts
- Keywords: scaffolded-backlog, verify production dist hygiene and remove accidental shipped artifacts, implementation-ready
- Use when: Implementing the scaffolded slice for Verify production dist hygiene and remove accidental shipped artifacts.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
