# 0007 — Delivery and recovery

Status: Accepted · 2026-10-13 · Owner: release lead

## Decision

Use local, staging and production as separate targets. This repo initially configures only a health-only staging Worker and buildable Pages apps. Resource creation, secrets, production, queues and scheduled backup jobs require actual account IDs, retention/access settings and a tested implementation; never use made-up bindings.

Apply ordered SQL migrations with dbmate, with a separate migration credential. Test fresh install and upgrade from the prior deployed state. Published migrations are immutable; forward repair is preferred. Back up before risky changes. No automatic destructive rollback.

PR CI uses exact dependencies, frozen lockfile, pinned action SHAs, read-only token permissions and cancellation of superseded runs. Secret-bearing deployment runs only from reviewed `main` through the staging environment. A final gate fails closed if path selection or any required lane fails.

For the pilot, copy Postgres data, approved captures/manifests and R2 evidence to an independent backup. Test restoration and replay without side effects; reconcile IDs/checksums and apply deletions again. Targets are content RPO ≤24 h and restore RTO ≤4 h, subject to measured drills. Alert on Queue/DLQ age, archive lag and operational failure; name a responder.

## Consequences and verification

An optional viewer can stay off. Broken approval, tenant isolation, withdrawal or outcome-linking blocks a live pilot. Deployment configuration is not proof a resource exists. Local checks, hosted CI, staging connection verification and G3 outage/restore drills are separate evidence. See [operations](../operations.md).
