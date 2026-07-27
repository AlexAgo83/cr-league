## item_314_review_largest_image_payloads_for_cheap_measured_reductions - Review largest image payloads for cheap measured reductions
> From version: 0.5.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Asset delivery performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- perf:bundle shows images dominate dist size: roughly 10.66 MB out of 14.29 MB.
- The largest current image is finish-flag.png around 1393 KB, followed by other large gameplay/UI artwork.
- Blind conversion can duplicate assets or degrade visuals, so this must be measurement-led and narrow.

# Scope
- In:
  - Review the top image payloads from perf:bundle and identify obvious candidates for WebP conversion, resizing, or removal if unused.
  - For each changed asset, record before/after file size and verify representative flows do not show broken images.
  - Prefer existing asset patterns and static files; do not add a permanent image pipeline dependency.
- Out:
  - Converting every image.
  - Introducing AVIF/CDN/responsive image infrastructure.
  - Regenerating artwork content or redesigning screens.

# Acceptance criteria
- AC1: At least the largest image payloads are reviewed with recorded keep/change rationale.
- AC2: Any changed asset has before/after size evidence and no broken image requests in representative app flows.
- AC3: perf:bundle shows the updated size after changes.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: At least the largest image payloads are reviewed with recorded keep/change rationale.
- request-AC7 -> This backlog slice. Proof: AC2: Any changed asset has before/after size evidence and no broken image requests in representative app flows.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_077_runtime_performance_remediation_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_125_runtime_performance_remediation_from_manual_perf_smoke_evidence`
- Primary task(s): `task_126_orchestrate_runtime_performance_remediation`

# AI Context
- Summary: Review largest image payloads for cheap measured reductions
- Keywords: scaffolded-backlog, review largest image payloads for cheap measured reductions, implementation-ready
- Use when: Implementing the scaffolded slice for Review largest image payloads for cheap measured reductions.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
