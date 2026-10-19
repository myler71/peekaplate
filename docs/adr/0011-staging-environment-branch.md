# 0011 — Deploy staging from the staging branch

Status: Accepted · 2026-10-18 · Owner: repository owner

## Decision

The owner explicitly clarified that `staging` is the staging environment and `develop` is development, then authorized the correction. This supersedes ADR 0010's develop-based staging deployment selection only.

Integrate features on `develop`, promote reviewed application commits to `staging` for staging validation, and release validated commits to `main` through a separate release PR. The manual staging Worker workflow accepts only `refs/heads/staging`; CI includes pushes to staging. PR #5 restores the application tree on staging while preserving history.

## Consequences and verification

The staging deployment activation variable and isolated provider requirements remain in force. This correction does not activate deployment, apply migrations, change production routing or archive repositories. Cloudflare account access and D1 resources exist, but the current backend requires PostgreSQL via Hyperdrive and configured staff authentication. The October 18 audit found no Hyperdrive configuration, Pages project or staging Worker, and no GitHub deployment credentials.

Before activation, configure and verify isolated Supabase/PostgreSQL, staff auth, Hyperdrive, frontend/API connections and a staging URL. A passing health check alone does not prove database readiness. See [operations](../operations.md).
