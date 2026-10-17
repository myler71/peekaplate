# 0010 — Canonical repository and release branches

Status: Proposed · 2026-10-17 · Owner: repository owner

## Decision

Under the owner's repository-reorganization request, use private `vivienk/peekaplate` for the core app and private `vivienk/peekaplate-marketing` for marketing. Preserve both histories through a two-parent import commit and reviewed merge-commit PRs. Integrate features on `develop`; release through separately approved PRs to `main`.

This proposal supersedes only ADR 0007's main-only staging branch selection: staging deployment is manual from protected `develop`, after protected environment setup, exact-head CI and explicit activation. Production requires separate resources, a protected main-only environment, parity evidence and human release sign-off. The imported workflow is disabled by an unset approval variable. No production workflow, provider resource, DNS change or archive operation is included.

## Consequences and verification

Private repository protection is blocked by the current GitHub plan. The PR 13-derived JSON policies do not activate rules. Human approval of this proposal, a supported plan, live rule readback and staging parity are prerequisites to production promotion. See [migration gates](../repository-migration.md) for source SHAs, open PRs, deployment inventory, rollback and archival conditions. Accepted prior ADR text remains intact.
