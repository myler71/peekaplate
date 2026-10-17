# 0006 — Orders and measurement

Status: Accepted · 2026-10-13 · Owner: data/product

## Context

Browsing alone cannot establish what a person ordered or why. One venue's POS workflow must be demonstrated before claiming linked outcomes.

## Decision

Start with one real item-level CSV adapter. Verify a code can be entered on a test ticket and survive export. Make imports idempotent; map item IDs explicitly; handle voids/refunds and quarantine ambiguous matches. Codes are venue-scoped, expiring and collision-checked. A ticket may include multiple people.

Unlinked sessions have unknown outcomes. Keep all-ticket and linked-ticket attach rates separate. Consideration initially means a dish open plus ten visible active seconds, or open plus portion/compare interaction. Hidden tabs pause dwell. Show missingness and linkage coverage; suppress cells below ten eligible sessions.

Use randomized balanced service-period blocks within weekday strata, one primary outcome and an analysis plan fixed before results. Report independent block counts. Predeclare availability handling; do not remove stockout periods just because the treatment increased demand. Early readouts remain directional. Record owner action, labor and willingness to pay separately from engagement.

## Consequences and verification

No causal sales-lift or “no company loss” promise. Use hand-calculated synthetic cases, reconciliation against a real permitted export, ambiguous/duplicate code cases and owner comprehension checks. Provisional scan/linkage thresholds trigger workflow investigation, not a statistically unsupported automatic business verdict.
