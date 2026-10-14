# 0002 — Selective event sourcing

Status: Accepted · 2026-10-13 · Owner: Sai

## Context

The final plan makes reconstruction of content, approvals, publication, availability and experiment state a requirement. Accounts, settings, sessions and POS rows remain relational. Diner observations are a separate evidence stream.

## Decision

Use plain Postgres event streams keyed by tenant and stream. Append at an expected stream version with a unique constraint; conflicts produce 409. Store schema versions and explicit upcasters. A command result is idempotent within tenant/actor/command identity; reuse with a different request fingerprint is rejected, not silently accepted. Authorize retries too.

Append events, update live projections, record the command result and insert outbox work in one transaction. Publication checks exact revision rights and both approvals atomically; locking or validated version checks cover concurrent withdrawal/approval changes. Domain-specific commands own invariants; a generic append API is not sufficient authorization.

Replay uses pure reducers under a stable database snapshot and writes only replacement projections. No outbox, email, cache refresh or processing jobs. Preserve old-event compatibility and stable ordering within each stream. Explicitly coordinate cross-stream invariants.

**Implementation clarification:** `global_position` identity allocation is not commit order. A fixed polling delay cannot prevent missing a late commit. Claim durable pending outbox rows with leases/processed state and `FOR UPDATE SKIP LOCKED`; never advance an irreversible async cursor solely to the greatest identity seen. Choose a proven commit-order mechanism before adding other async projections.

`menu_as_of` reconstructs committed server state with documented time semantics; it does not replace exposure records for actual diner views. `recorded_at` alone is not a commit timestamp. Define and test the temporal boundary before exposing this query; do not promise exact wall-clock visibility from `now()` or sequence order.

## Consequences

More testing than CRUD is required. There is no credible fixed “300 lines” guarantee. Initial migrations are storage foundations; publish commands/projections are the next slice. Event history is immutable in ordinary paths; privacy-sensitive payloads must be minimized and governed by ADR 0005.

## Verification

Restricted-role tenant tests; duplicate/version conflicts; reused-command payload conflict; two concurrent publishes; withdrawal race; rollback-on-failure; replay equals live projection; v1 upcast fixtures; replay creates zero effects; delayed-commit async work is eventually processed. No production claim until these are implemented and pass.
