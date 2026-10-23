# 0015 — Integration contracts and owner-evidence boundary

Status: Proposed · 2026-10-21 · Owner: Jeffin (S3-ARC-01) · Approver: Sai · PM boundary approval: Adam, Shirley, Vivien

Relates to [0002](0002-selective-event-sourcing.md), [0003](0003-intent-evidence.md), [0005](0005-tenancy-and-privacy.md), [0006](0006-orders-and-measurement.md), [0013](0013-posthog-export-boundary.md) and [0014](0014-team-analytics-access.md). It supersedes none of them.

## Context

Sprint 3 work needs shared, versioned data shapes before it can integrate: diner screens (S3-DIN-01/02), publication APIs (S3-RES-02), menu ingestion (S3-VIS-01), event capture (S3-DATA-01) and owner reporting (S3-DATA-02). The S3-DATA-01 event-field matrix v0.1a proposes event meanings and fields and lists the decisions this record must settle.

`packages/contracts` defines the staff dish-revision command/result, a v1 diner event limited to `dish_open` and `portion_compare`, and the team analytics query/response. `packages/analytics` sends consented, privacy-filtered `app_shell_viewed` observations directly to PostHog; its dish-event capture has no caller and makes bounded at-most-once attempts. ADR 0013 copies those observations hourly into `analytics_private.posthog_events`, and ADR 0014 lets collaborators inspect that copy. Neither provides restaurant-authorized evidence. No canonical observation endpoint, outbox, observation tables or owner-report API exist. The staging Worker has no Queue or R2 binding, and no menu token can be issued until publication exists (S3-RES-02).

Draft work disagrees with accepted decisions: a report query uses five sessions instead of ADR 0006's ten, and a direct backend → Supabase ingestion route is proposed instead of ADR 0003's Queue and R2 boundary.

## Decision

**Contracts.** `packages/contracts` owns strict, versioned Zod schemas for six integration contracts: dish draft, source evidence (URL/PDF/photo), review and publication, approved asset, diner observation and owner report. Each includes its missing, rejected, withdrawn, loading and error states where they apply. A breaking change adds a new version; it never relabels an existing one. Unknown fields are rejected. No contract field grants restaurant authority. Each contract ships with valid examples and negative tests.

**Owner evidence.** Owner-facing metrics come only from validated canonical facts on the ADR 0003 path: browser outbox → ingest Worker → Queue receipt → R2 archive → canonical Supabase facts → backend membership check → owner report. A direct backend → Supabase route that skips Queue or R2 is not adopted; proposing it requires a superseding ADR that restates durability and recovery. The ADR 0013 export remains internal reconciliation only: the canonical path never writes to it and owner reports never read it.

**Event identity.** As in ADR 0003, the transport key is `(venue_id, event_id)`. The browser creates `event_id` once per observation and keeps it and the payload on every retry. `venue_id` is derived on the server from the signed menu token, never accepted from the browser. The same key with the same canonical checksum is a retry; the same key with a different payload is quarantined, never overwritten. Semantic keys prevent double counting of one opening, activation, comparison version or opportunity. Genuine repeated actions receive new action identities. When a consented PostHog copy is sent, it carries the same `event_id`, so reconciliation compares ID sets. PostHog's `(team_id, uuid)` collapse only removes repeated export copies; it does not prove browser-action idempotency.

**Storage (names proposed).** Canonical observations go to new tables in the existing private `app_private` schema, created by forward migrations, protected by RLS and written only by the restricted runtime role. Proposed names: `app_private.observation_index`, keyed by `(venue_id, event_id)` with checksum, schema version, type, authorized references, client `occurred_at`, server `received_at`, R2 archive key and disposition; `app_private.observation_conflict` for quarantined conflicting reuse; and typed fact tables named `app_private.observation_<family>_fact` once D3 fixes the event families. Owner reports read bounded views over those facts, never the raw index. Nothing is created or changed by hand in a hosted database.

**Privacy and reporting.** Keep ADR 0006's floor: suppress behavioral cells below ten eligible sessions, including totals, filters, differences and drill-downs that could reconstruct them. Lowering the floor requires a superseding ADR with a privacy rationale and accountable approval. Payloads exclude names, emails, full URLs, raw table labels, search text, fingerprints and credentials. PostHog receives only properties approved in the event-field matrix, behind the existing consent and Do Not Track/Global Privacy Control checks. Owner reports are served by the backend after verifying current restaurant membership. Analytics and collection failure never block the menu. Viewing, saving, comparing or opening ingredients is recorded as interest, never as an order or causal proof.

**Versioning (D6).** New controls use `observation.v2`, whose event semantics Adam approved; this record provides the architecture approval. Historical v1 records (`dish_open`, `portion_compare`) stay distinct and are not relabelled, and no observation is sent twice under two versions.

**Route and receipt (proposed; agreed by Jeffin and Zhiliang, pending Sai).** The ingest route is `POST /observations`. It is named for observations rather than events because AGENTS.md keeps staff domain events (`app_private.es_event`) and PostHog events separate from diner intent observations.

The menu token travels only as `Authorization: Bearer <menu_token>`, never in the JSON body or URL. The Worker verifies it and derives `venue_id` and the authorized publication context from it; a browser-supplied venue value never grants authority.

The body is a strict, bounded batch of `observation.v2` items. Each item has `schema_version`, `event_id`, `session_id`, `producer_id`, `local_sequence`, `occurred_at`, `type`, publication and content references, and only its type's fields. The response holds one receipt entry per item:

- `accepted` only after the Queue has accepted the item. An identical retry of a previously accepted item is also `accepted`, with `reason_code=duplicate_same_payload`.
- `retry` for a Queue outage or other transient failure. The browser keeps the item and resends the same `event_id` and payload.
- `rejected` with a bounded reason code for permanent failures, which are never retried. The same `event_id` with a changed canonical payload is `rejected` with `reason_code=event_id_conflict`, and the item is quarantined.

The browser removes only accepted IDs from its outbox. A partial failure returns mixed entries, never a blanket success. A timeout leaves the browser uncertain but safe to retry.

The endpoint can return `duplicate_same_payload` or `event_id_conflict` only when it already knows the earlier copy. A retry that arrives before the Queue consumer has indexed the first copy may be accepted and queued again, so these reason codes are best effort. The consumer is the final guarantee: it drops identical repeats and quarantines conflicting reuse in `app_private.observation_conflict`. The tests that expect `POST /events` to return 404 are replaced by tests of this route when it is implemented.

**Infrastructure.** Reuse the existing private staging R2 bucket for the archive. Create and bind a staging Queue with a dead-letter queue. Bindings, secrets and the menu-token signing key are configured by authorized operators through the protected setup, never committed to Git. The menu token cannot be issued until publication exists (S3-RES-02).

**Ownership.**

- **Ingest endpoint: Zhiliang (S3-DATA-01), approved by Sai.** Scope is the HTTP ingestion boundary only:
  - request and schema validation;
  - server-authorized venue context;
  - `(venue_id, event_id)` handling, plus duplicate and conflicting-reuse behavior;
  - consent and privacy checks;
  - receipts.

  It feeds the Queue and never writes to the ADR 0013 export tables.
- **Queue consumer: Teeyansh.** Archive to R2 first with a create-only key, then write the index and facts idempotently, then acknowledge the Queue. Failed batches go to the dead-letter queue.
- **Review:** Jeffin and Sai review the architecture and security of both.
- **Still open:** owners for the canonical migrations/tables and the owner-report API.

**Merge order.** This ADR and the contracts merge first. Then diner controls (S3-DIN-02) and capture (S3-DATA-01), followed by live reporting (S3-DATA-02). Fixture, metric and layout work may continue in parallel against labelled synthetic data.

## Open decisions before acceptance

Numbers refer to the S3-DATA-01 event-field matrix v0.1c.

1. **D3 — P0 events and triggers.** Recommended: the matrix's candidate list, with `dish_compared` replacing `portion_compare`. Adam confirms triggers; Vivien confirms scope.
2. **D4 — Save scope.** Whether dish Save is P0 and whether selection is a separate event.
3. **D7 — Opened versus engaged.** Whether these are separate metrics, and their definitions.
4. **D8 — Timing rules.** Whether to freeze the 30-minute visit, 30-second idle pause and five-second checkpoints.
5. **Table names.** Confirm or change the proposed `app_private.observation_*` names, and the fact families after D3.
6. **Retention.** ADR 0005's 30-day raw retention is still a proposal; the PostHog project and its Supabase copy must follow the agreed period and deletion procedure.
7. **Consent for real diners.** Staging uses per-page opt-in. The pilot policy needs PM approval.
8. **Route and receipt limits** (raised by Zhiliang). Before the contract freezes, decide and test:
   - the batch-size and body limits;
   - event age and clock-skew limits;
   - HTTP success and error status codes;
   - behaviour when only part of a batch reaches the Queue;
   - the menu-token claims;
   - where the consent check sits on this path.
9. **Protected setup.** Sai and Vivien complete the GitHub secrets and workflow access, then create the Queue and bind it with R2.
10. **Remaining owners** for the canonical migrations/tables and the owner-report API, with reviewer hours recorded per PR.

## Consequences

Owner metrics stay restaurant-scoped and reproducible, while the team keeps PostHog for exploratory analysis. The Worker, Queue, R2 and Postgres path must still be built; PostHog does not replace it. Real collection and live reports wait for this ADR to be accepted, but synthetic work does not. Two destinations mean two retention and deletion responsibilities.

## Verification

Contracts: valid and invalid examples for all six, including unknown fields and injected authority. Observations: a Queue send failure returns `retry`, never `accepted`; an identical retry returns `accepted` with `duplicate_same_payload`; a changed payload returns `rejected` with `event_id_conflict`; a body or header venue is ignored in favour of the token; repeated send, partial receipt, offline reload, same ID with a different payload (quarantined), forged venue (rejected), and consent off or analytics disabled (no PostHog request; menu still usable). Consumer: a crash after the R2 write but before the acknowledgement creates no duplicate rows, and failed batches reach the dead-letter queue. False successes: pointer-down, render-only, failed detail, picker cancel and failed comparison produce no success event. Reconciliation: for a synthetic run, accepted canonical event IDs match the consented PostHog copy. Reports: a nine-session cell is suppressed and a ten-session cell shown, suppressed cells cannot be reconstructed, another restaurant's data is denied and withdrawn content is not shown as current. Publication: unauthorized approval fails and two concurrent publishes cannot both succeed.
