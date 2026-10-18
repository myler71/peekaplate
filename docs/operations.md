# Local and staging operations

Repository transition: [migration and release checklist](repository-migration.md) records current repository, branch and deployment gates. The application is in canonical `main` and `develop`. The staging workflow accepts only `develop` and requires `STAGING_DEPLOYMENT_APPROVED=true`; leave that variable unset. Production deployment remains unconfigured. The Git branch named `staging` is not proof of a hosted staging service.

## What is configured

Node 24.16.0, pnpm 11.25.0, frozen lockfile, two Vite apps and a Hono Worker with health and authenticated dish commands. `backend/wrangler.jsonc` names the local and staging Worker but supplies no hosted auth or database bindings. No Cloudflare account, Pages project, Hyperdrive, Queue, R2 bucket or Supabase project is provisioned. Application fixtures use synthetic data; package and image downloads contact their registries.

## Local development and tests

Run the [README commands](../README.md). Use separate terminals when working on one target:

```sh
pnpm --filter @peekaplate/diner dev
pnpm --filter @peekaplate/console dev
pnpm --filter @peekaplate/backend dev
```

`pnpm verify test:db` builds a PostgreSQL 16 test image with pgTAP and creates a temporary Docker network/database. It installs the previous schema, preserves a synthetic venue through the forward migration, confirms a second `up` has no pending migration, runs SQL policies, then exercises the real local Worker with signed JWTs and restricted database credentials. Tests include concurrent writers, duplicate/conflicting commands, revoked membership, rollback, replay and physical connection reuse. Cleanup removes the harness container, its volumes and network. The random database host port binds only to `127.0.0.1`; credentials are disposable fixtures. Never point this harness at a shared database. A Docker daemon and image downloads are required. Image tags are pinned to versions, not immutable digests.

`pnpm dev:backend` uses that disposable database setup with a loopback JWKS service and the actual Worker. It writes a synthetic owner session to ignored `work/local-session.json`; the private signing key stays in memory. Run `pnpm local:demo` in another terminal to create a dish revision. Stop with Ctrl+C; local data is intentionally discarded. Do not run it alongside the plain backend dev process on port 8787. A forcibly terminated process can leave its uniquely named `peekaplate-db-*` container/network and session file; inspect ownership before removing those exact resources. Restart after the one-hour fixture token expires.

### Windows Docker startup recovery

If Docker fails before the Linux engine starts with an inaccessible `dockerInference` or `engine.sock` file, check the installed Desktop version and current [Docker release notes](https://docs.docker.com/desktop/release-notes/) first. Docker's maintainer reports a fix in 4.92 and later in [the startup incident](https://github.com/docker/desktop-feedback/issues/460). Repeated socket-directory renames are not a durable repair.

Quit Docker and confirm its WSL distribution is stopped before making an offline backup of the existing Docker disk files at the configured data location. Verify the backup checksums, then use the official installer to upgrade in the existing installation mode. Preserve the data directory; do not factory-reset, unregister the WSL distribution or prune volumes as a startup workaround. The [Windows installation guide](https://docs.docker.com/desktop/setup/install/windows-install/) distinguishes per-user and machine-wide installs.

After the upgrade, `docker version` must report both client and server, and `docker info` must reach the Linux engine. Then run `pnpm verify test:db`; it also checks the local startup/demo/cleanup flow. An installer success or a running window alone does not close the incident. Keep the backup until existing workloads and the project test run are verified. Record the actual version and test outcome in the PR and `errors.md`; do not commit machine backups or diagnostic logs.

## Staff command contract

`POST /venues/{venueId}/dishes/{dishId}/revisions` requires `Authorization: Bearer <staff JWT>` and `Content-Type: application/json`:

```json
{"commandId":"00000000-0000-4000-8000-000000000001","expectedVersion":0,"name":"Example dish","description":"Example description"}
```

The venue in the URL selects a resource; only verified staff membership grants access. Owner/editor memberships may write; viewers cannot. The strict body rejects actor, role and tenant fields. Names are trimmed and limited to 160 characters, descriptions to 4000, and the HTTP body to 16 KiB. Version zero creates the first revision. Later commands carry the last observed version. A successful command returns HTTP 200 with `dishId`, `revisionId`, `version`, `name` and `description`; an identical authorized retry returns the same result. Reusing the command ID for different content or a different dish returns 409, as does a stale expected version. Missing/invalid identity returns 401, insufficient membership 403, invalid JSON/schema 400, wrong content type 415 and an oversized body 413. Missing service configuration or temporary dependency failure returns a sanitized 503. Retry temporary failures with the same command ID and body.

Hosted verification requires a configured `AUTH_ISSUER` ending in `/auth/v1`, HTTPS JWKS, audience/role `authenticated`, an expiry, a UUID subject and RS256/ES256 signatures. Anonymous sessions are rejected. The `APP_ENV=local` option permits only loopback HTTP issuers and selects `LOCAL_DATABASE_URL`; neither setting belongs in staging. Hosted connections use the `HYPERDRIVE` binding. Logs contain a generated request ID and failure category, never bearer tokens or database row errors. `/health` remains liveness only and does not report database readiness. `/events` remains unavailable.

`pnpm test:e2e` starts local apps itself. Install Chromium once with `pnpm exec playwright install chromium`. CI installs system dependencies too. Four tests cover no-JavaScript diner content, the console/real local Worker health path, and axe accessibility plus narrow-screen overflow on both shells. Traces are retained on failure; there is no routine DOM dump. They do not exercise a live restaurant, staff login, queue or GPU viewer. Use `pnpm verify test:e2e` and `pnpm verify test:db` to record failed-check observations as described in [contributing](../CONTRIBUTING.md#local-checks).

## Database change procedure

Use `YYYYMMDDHHMMSS_description.sql` for new dbmate migrations (the initial migration uses a shorter ordered timestamp). Keep `-- migrate:up` and `-- migrate:down` sections. Applied files are immutable. The initial down migration deliberately refuses destructive rollback; future repairs should roll forward.

Use a reviewed, pinned dbmate release (the harness uses 2.36.0) with a separate migration credential supplied through the environment, never a command argument or committed file. Apply to staging first with `dbmate --migrations-dir migrations up`. A runtime credential must not own tables or bypass RLS; do not use the migration owner or Supabase service-role key in the browser. Do not enable API access to `app_private`.

The staff migration creates the `peekaplate_runtime` group role and narrow table/column grants. A separately provisioned login receives that role; never use the migration owner for requests. The local harness verifies the role's restrictions, but the actual managed-provider login still needs inspection. Before each release, test an upgrade from the last deployed schema as well as a fresh install. Back up before risky changes; restoration requires an operator decision and a rehearsed runbook.

## Cloud-integration checkpoint

**This is the next engineering step after repository setup.** The current Worker already runs locally; the task is to connect and verify it on Cloudflare with Supabase, not create a second backend. Local design, synthetic UI, event definitions and manual dish preparation can continue alongside it.

The owner supplies an authorized Cloudflare session or narrowly scoped deployment token and an isolated Supabase staging project. Use asymmetric signing keys, a separate migration credential and a restricted runtime database login. Keep secrets in the operator's local secret store or provider settings, never chat, fixtures, Git or frontend `VITE_*` variables. A Supabase API key is not a staff session JWT.

Under private GitHub Free, environment secrets/variables and deployment-branch restrictions are unavailable; private required environment reviewers are also unavailable on Free/Pro/Team. See [GitHub's environment capabilities](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments). The existing Actions workflow stays disabled. Do not substitute repository secrets or an approval variable and call that enforced review. For this phase use an owner-controlled deployment from a clean, reviewed exact commit, with passing CI and an independent human sign-off recorded on the PR. This is a manual process and remains bypassable by a person holding provider access.

| Order | Work | Evidence before proceeding |
| --- | --- | --- |
| 1 | Confirm `develop` as the integration/deployment source; record acceptance of the branch/process exception described in proposed ADR 0010 | Named operator and independent reviewer; exact commit and CI run; explicit human approval. Merely merging the Git branch named `staging` does not change the workflow target. |
| 2 | Create isolated Supabase staging and apply the existing migrations with the migration credential | Fresh schema/upgrade evidence; runtime login has only the intended role and cannot bypass RLS or change memberships. Use synthetic restaurant/staff fixtures. |
| 3 | Configure genuine Supabase authentication and Cloudflare Hyperdrive | Actual HTTPS `AUTH_ISSUER`, matching JWKS/signatures, real `HYPERDRIVE` binding and query caching disabled for authority/command queries. Never set `APP_ENV=local` or `LOCAL_DATABASE_URL` in staging. Commit only verified non-secret resource identifiers in a reviewed provider-integration PR. |
| 4 | Owner deploys the reviewed Worker using local/provider-held access | Build and Worker dry-run pass, then actual deployed `/health` and the staff command endpoint are tested. `/health` alone proves only liveness. Record provider deployment ID and commit. |
| 5 | Verify hosted authorization and database behavior | Genuine login, cross-restaurant denial, role/membership revocation, conflict/retry/concurrency/rollback and pooled-context isolation tests pass. Record measured latency and failure behavior. |
| 6 | Continue publication, diner observations and dashboard features in dependency order | Approved publication precedes real observations; Queue/R2 resources arrive with a tested ingest consumer, not empty bindings. Real aggregates follow verified observations. |

No provider values, resources or credentials are supplied by this setup PR. The credential handoff is the boundary for the next task. Before later automated deployments, separately review an available enforcement mechanism and its permissions; do not activate the existing workflow until its documented environment gates can actually be satisfied.

Before declaring PR 1 cloud-ready: confirm migration execution under the actual non-superuser provider role; provision synthetic staff membership; verify genuine login tokens and session/membership revocation semantics; connect Hyperdrive to Supabase's direct Postgres endpoint using a restricted runtime login; disable Hyperdrive query caching for authority and command paths; repeat isolation/retry/concurrency/rollback tests through that deployed connection mode. Measure latency and prove transaction context resets across pooled requests. Local connection reuse is evidence for application logic, not proof of a hosted pool. Supabase remains the accepted provider under ADR 0005; a Neon switch needs an explicit decision and equivalent auth integration evidence.

## Later Actions-based staging activation

This checklist is conditional on an account/control model that supports the required environment restrictions and independent approval. It is **not available under the current private GitHub Free choice**. Use the owner-controlled checkpoint above now; keep this workflow disabled. If capabilities change, verify them rather than assuming a paid upgrade alone supplies private required reviewers.

The repository owner supplies real account values and enables controls before automated deployment:

1. Create a GitHub `staging` environment restricted to `develop`, with the appropriate human approval. Add `CLOUDFLARE_API_TOKEN` as an environment secret and `CLOUDFLARE_ACCOUNT_ID` as an environment variable. Scope the token only to the intended account and required deployment resources.
2. Create two Cloudflare Pages projects using the repository root as install directory. Use `pnpm install --frozen-lockfile` followed by `pnpm --filter @peekaplate/diner build` or `pnpm --filter @peekaplate/console build`; outputs are `frontend/diner/dist` and `frontend/console/dist`. Disable automatic production promotion until review controls exist. The console shell contains no real staff data.
3. Deploy the Worker from the reviewed `develop` checkout using the manual staging workflow. Confirm `/health`, a rejected unknown route and fail-closed staff routes until real bindings are configured. Ingest is not implemented.
4. In the relevant feature PRs, create separate staging Postgres, Hyperdrive, private R2 and Queue/DLQ resources. Commit their non-secret binding IDs with the implementation and verify actual connections in staging. Keep migration credentials, runtime credentials and signing secrets separate. Follow [Cloudflare's Supabase/Hyperdrive guide](https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/postgres-database-providers/supabase/) for the chosen driver and transaction behavior.
5. Set budget notifications, retention/deletion ownership, backup destination and a named incident responder. Never infer these settings from an example file.

Production is a separate decision with separate credentials/resources. There is no production deployment workflow in this foundation.

## GitHub merge controls

The current owner chooses GitHub Free and private repositories. GitHub does not enable branch protection/rulesets for these private repos on this plan, so `main` and `develop` remain unenforced. The ruleset files below are retained for a future plan change, not presented as active policy. For now, keep write access limited; require reviewed PRs, passing `ci`, and an independent human approval comment before merges; preserve migration/release history with merge commits. These are team process controls, not GitHub enforcement, and admins can bypass them. Protect production credentials in provider settings and keep production promotion behind explicit human release sign-off. Configuration files and CODEOWNERS do not establish enforcement.

CI runs with read-only tokens and pinned action SHAs. PR bodies are read as data, never interpolated into shell commands. The final gate requires path selection and quality to succeed and every applicable integration lane to pass. Fork PRs receive no deployment credentials. Require a human approval with a review comment on the current commit for every PR, including AI-written and dependency changes. Native approval rules enforce approval; the reviewer and merger enforce the comment's content. No additional comment-check workflow or automatic approval is configured.

Each existing CI job has one purpose: `changes` selects relevant integration lanes; `quality` checks formatting, types, unit tests, builds and documentation; `database` tests migrations and database constraints; `browser` tests the diner/console smoke flows; `ci` is the single required aggregate check. Documentation checks run after code checks and builds, and still run after an earlier failure, so a missing PR section cannot hide a broken build. Database/browser jobs remain path-selected.

Dependabot checks routine versions on the first day of each month, with one open grouped minor/patch PR per ecosystem (npm and GitHub Actions). Major version upgrades require deliberate manual review, including runtime/type compatibility. Security updates remain independently triggered when enabled and grouped per ecosystem; version-update limits and semver ignore rules do not delay them. See [GitHub's configuration reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference) and [PR preparation](../CONTRIBUTING.md#dependency-pr-preparation). No auto-merge. The repository owner must confirm Dependabot alerts and security updates are enabled in Settings; their live activation is not part of this migration audit.

## Pilot recovery, before G3

Document and demonstrate: Queue retry and poison-message DLQ handling; create-only archive conflict quarantine; replay with network side effects disabled; independent backup of Postgres, approved assets/manifests and R2 evidence; restore reconciliation by ID and checksum; deletion requests reapplied after restoration. Measure the plan's content RPO ≤24 hours and restore RTO ≤4 hours. Until the drill exists, those are targets only.

For a failing release, stop promotion and preserve logs without secrets or raw diner data. Prefer restoring the prior application deployment and forward-fixing schema. Do not delete an event stream or silently acknowledge unarchived observations to clear an alert.
