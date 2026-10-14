# Local and staging operations

## What is configured

Node 24.16.0, pnpm 11.25.0, frozen lockfile, two Vite apps and a health-only Hono Worker. `backend/wrangler.jsonc` names the local and staging Worker. No Cloudflare account, Pages project, Hyperdrive, Queue, R2 bucket or Supabase project is provisioned by this commit. No data leaves the machine during application smoke tests; package installation and browser downloads contact their registries.

## Local development and tests

Run the [README commands](../README.md). Use separate terminals when working on one target:

```sh
pnpm --filter @peekaplate/diner dev
pnpm --filter @peekaplate/console dev
pnpm --filter @peekaplate/backend dev
```

`pnpm test:db` builds a PostgreSQL 16 test image with pgTAP, creates an isolated temporary Docker network/database, applies migrations twice, runs constraint tests, then removes its containers/network. The fixed test password belongs only to this disposable service, which exposes no host port. Never point this harness at a shared database. A Docker daemon and image downloads are required. Image tags are pinned to versions; they are not immutable digest pins.

`pnpm test:e2e` starts local apps itself. Install Chromium once with `pnpm exec playwright install chromium`. CI installs system dependencies too. Four tests cover no-JavaScript diner content, the console/real local Worker health path, and axe accessibility plus narrow-screen overflow on both shells. Traces are retained on failure; there is no routine DOM dump. They do not exercise a live restaurant, staff login, queue or GPU viewer. Use `pnpm verify test:e2e` and `pnpm verify test:db` to record failed-check observations as described in [contributing](../CONTRIBUTING.md#local-checks).

## Database change procedure

Use `YYYYMMDDHHMMSS_description.sql` for new dbmate migrations (the initial migration uses a shorter ordered timestamp). Keep `-- migrate:up` and `-- migrate:down` sections. Applied files are immutable. The initial down migration deliberately refuses destructive rollback; future repairs should roll forward.

Use a reviewed, pinned dbmate release (the harness uses 2.36.0) with a separate migration credential supplied through the environment, never a command argument or committed file. Apply to staging first with `dbmate --migrations-dir migrations up`. A runtime credential must not own tables or bypass RLS; do not use the migration owner or Supabase service-role key in the browser. Do not enable API access to `app_private`.

The first domain-write PR must define scoped runtime grants and test them using that exact non-owner role. Current FORCE RLS/default-deny storage is a foundation, not a complete authorization system. Before each release, test an upgrade from the last deployed schema as well as a fresh install. Back up before risky changes; restoration requires an operator decision and a rehearsed runbook.

## Staging activation checklist

The repository owner supplies real account values and enables controls before deployment:

1. Create a GitHub `staging` environment restricted to `main`, with the appropriate human approval. Add `CLOUDFLARE_API_TOKEN` as an environment secret and `CLOUDFLARE_ACCOUNT_ID` as an environment variable. Scope the token only to the intended account and required deployment resources.
2. Create two Cloudflare Pages projects using the repository root as install directory. Use `pnpm install --frozen-lockfile` followed by `pnpm --filter @peekaplate/diner build` or `pnpm --filter @peekaplate/console build`; outputs are `frontend/diner/dist` and `frontend/console/dist`. Disable automatic production promotion until review controls exist. The console shell contains no real staff data.
3. Deploy the health-only Worker from the reviewed `main` checkout using the manual staging workflow. Confirm `/health` and a rejected unknown route at the resulting URL. It has no database or ingest capability yet.
4. In the relevant feature PRs, create separate staging Postgres, Hyperdrive, private R2 and Queue/DLQ resources. Commit their non-secret binding IDs with the implementation and verify actual connections in staging. Keep migration credentials, runtime credentials and signing secrets separate. Follow [Cloudflare's Supabase/Hyperdrive guide](https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/postgres-database-providers/supabase/) for the chosen driver and transaction behavior.
5. Set budget notifications, retention/deletion ownership, backup destination and a named incident responder. Never infer these settings from an example file.

Production is a separate decision with separate credentials/resources. There is no production deployment workflow in this foundation.

## GitHub merge controls

A repository **administrator** must create a ruleset for `main`: require a pull request, at least one human approval, code-owner review, stale-approval dismissal, resolved conversations and the required check **`ci`** from GitHub Actions; block force-push and branch deletion. Avoid bypass actors except an explicitly controlled emergency role. Require branches to be current if concurrent merges can invalidate checks. The bootstrap account has push access but not administration, so these settings cannot be asserted by code or CODEOWNERS.

CI runs with read-only tokens and pinned action SHAs. PR bodies are read as data, never interpolated into shell commands. The final gate requires path selection and quality to succeed and every applicable integration lane to pass. Fork PRs receive no deployment credentials. Require a human approval with a review comment on the current commit for every PR, including AI-written and dependency changes. Native approval rules enforce approval; the reviewer and merger enforce the comment's content. No additional comment-check workflow or automatic approval is configured.

Each existing CI job has one purpose: `changes` selects relevant integration lanes; `quality` checks formatting, types, unit tests, builds and documentation; `database` tests migrations and database constraints; `browser` tests the diner/console smoke flows; `ci` is the single required aggregate check. Documentation checks run after code checks and builds, and still run after an earlier failure, so a missing PR section cannot hide a broken build. Database/browser jobs remain path-selected.

Dependabot checks routine versions on the first day of each month, with one open grouped minor/patch PR per ecosystem (npm and GitHub Actions). Major version upgrades require deliberate manual review, including runtime/type compatibility. Security updates remain independently triggered when enabled and grouped per ecosystem; version-update limits and semver ignore rules do not delay them. See [GitHub's configuration reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference) and [PR preparation](../CONTRIBUTING.md#dependency-pr-preparation). No auto-merge. The repository owner must confirm Dependabot alerts and security updates are enabled in Settings; these settings cannot be confirmed with the current non-admin account.

## Pilot recovery, before G3

Document and demonstrate: Queue retry and poison-message DLQ handling; create-only archive conflict quarantine; replay with network side effects disabled; independent backup of Postgres, approved assets/manifests and R2 evidence; restore reconciliation by ID and checksum; deletion requests reapplied after restoration. Measure the plan's content RPO ≤24 hours and restore RTO ≤4 hours. Until the drill exists, those are targets only.

For a failing release, stop promotion and preserve logs without secrets or raw diner data. Prefer restoring the prior application deployment and forward-fixing schema. Do not delete an event stream or silently acknowledge unarchived observations to clear an alert.
