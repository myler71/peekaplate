# 0010 — Canonical repository and release branches

Status: Proposed · 2026-10-17 · Owner: repository owner

Deployment branch selection superseded by [ADR 0012](0012-main-environment-promotion.md). Historical migration choices below are retained for traceability.

## Decision

Under the owner's repository-reorganization request, use private `vivienk/peekaplate` for the core app and private `vivienk/peekaplate-marketing` for marketing. Preserve both histories through a two-parent import commit and reviewed merge-commit PRs. Integrate features on `develop`; release through separately approved PRs to `main`.

This proposal supersedes only ADR 0007's main-only staging branch selection: staging deployment is manual from `develop`, after environment setup, exact-head CI and explicit activation. The owner chooses GitHub Free and private repositories, so branch protection is not available; reviewed PRs and CI remain process controls. Production requires separate resources, parity evidence and human release sign-off. The imported workflow is disabled by an unset approval variable. No production workflow, provider resource, DNS change or archive operation is included.

## Consequences and verification

The PR 13-derived JSON policies do not activate rules. Under the selected free/private setup, use manual review and CI gates with limited write access; acknowledge that GitHub cannot enforce them and an administrator can bypass the process. Staging/production parity and human release approval remain prerequisites to production promotion. See [migration gates](../repository-migration.md) for source SHAs, open PRs, deployment inventory, rollback and archival conditions. Accepted prior ADR text remains intact.
