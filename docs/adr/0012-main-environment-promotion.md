# 0012 — Promote a main commit through staging and production

Status: Accepted · 2026-10-18 · Owner: repository owner

## Decision

The current maintainer explicitly requested that `main` supply both staging and production deployments. This supersedes the deployment branch selection in ADRs 0010 and 0011. It does not combine environments or authorize a production launch.

Reviewed feature PRs may continue to integrate on `develop`; release candidates merge into `main`. Deploy an exact `main` commit to staging, record its CI and hosted verification evidence, then obtain independent human release approval before deploying that same commit to production. A later `main` commit is a different candidate and needs its own staging evidence. The Git branch named `staging` is no longer a deployment source; retain it without deleting or rewriting history.

Staging and production keep separate Worker names, credentials, databases and storage. The existing Supabase project and `peekaplate-staging-postgres` Hyperdrive are the current staging candidate. Production database provisioning and production deployment automation remain unconfigured. Never point a future production Worker at the staging database.

## Release controls

The manual staging workflow accepts only `refs/heads/main` and remains disabled until its existing activation and environment controls are verified. Under the recorded private GitHub Free policy, use an owner-controlled deployment of a clean, reviewed exact commit with independent human approval; do not pretend that a variable or repository secret enforces that approval. No push-to-production automation is introduced.

Record the commit SHA, provider deployment/version ID, test results and reviewer for each environment. Promotion means deploying the tested commit with the destination environment's bindings, not deploying whatever happens to be the newest `main`. Application rollback uses an approved prior deployment; schema recovery follows the forward-migration and restore procedure.

See [operations](../operations.md) for verified resources and the remaining hosted checks.
