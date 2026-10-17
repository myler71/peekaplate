# 0003 — Intent evidence

Status: Accepted · 2026-10-13 · Owner: platform

## Context

Mobile sessions can disappear and queues deliver at least once. Metrics need reproducible observations tied to exact content, not generic click counts.

## Decision

Use a bounded IndexedDB outbox. Event IDs survive retries; session sequence distinguishes local order. Ingest derives tenant authority from a server-issued short-lived token, validates schema/references/rate/size/age, then acknowledges only after Queue accepts. Receipts list accepted IDs explicitly. Permanent rejections are separate from retryable failure.

The consumer creates the R2 archive first, inserts idempotent rows second, then ACKs. Same key/ID and checksum is a retry; different payload is quarantined and alerted. Do not overwrite evidence. Preserve a failed batch in DLQ and alert on its age and remaining configured retention.

Pin publication hash, dish revision, displayed tier, renderer/manifest version, availability version and experiment assignment. Add server `received_at` separately from client `occurred_at`. Define late-arrival and clock-skew policies before G1. Initial contracts cover `dish_open` and `portion_compare` only; new event types require bounded typed payloads, not arbitrary properties.

## Consequences

Accepted events are recoverable within tested retention/recovery limits. Browser data may still disappear before acceptance. Signed tokens establish issuance, not proof of human activity. T0 menu behavior never waits for analytics.

## Verification

Lost receipt, repeated send, partial receipt, quota failure, offline return, schema rejection, R2 failure, checksum conflict, DB outage, consumer crash and DLQ replay tests. Compare accepted event-ID sets and checksums after recovery, not just counts.
