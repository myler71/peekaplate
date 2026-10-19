# Repository migration and release gates

Status: application import and main promotion completed; PR #5 aligned the historical staging branch on October 18, 2026. The maintainer subsequently selected `main` as the source for both deployment environments in [ADR 0012](adr/0012-main-environment-promotion.md). Staging deployment remains pending; production cutover is not authorized. The original migration audit below is dated October 17 unless updated explicitly.

Continuation audit: source main advanced to `b40e3cae68ab1d78adf838a164fdd07c043027b2`. The migration branch merges all eight intervening commits without rewriting history; their net change updates five documentation links to the PeekaPlate Orchestration + V1 Team Plan. Runtime code remains identical to the original import. Owner-authenticated checks confirm private-repository rulesets and classic branch protection require a paid plan. The owner chooses GitHub Free and private repositories; use manual PR/CI review controls and leave branch enforcement explicitly inactive. No human reviews were present on the core import or source policy PR at that audit.

## Repository ownership and preserved history

- `vivienk/peekaplate`: private canonical application destination. `develop` integrates development work; reviewed release candidates merge into `main`. Both staging and production deploy the same tested `main` commit with separate bindings and approvals. The historical `staging` branch remains preserved but is not a deployment source. Branch contents alone do not establish a live deployment.
- `vivienk/peekaplate-marketing`: private independent marketing repository. Existing `main` and `staging` branches were copied without rewriting commits. The source is `ace0483e75c22dc5e07586b999350a60218bbf9d`; Netlify configuration, form handler, assets and Git history are retained.
- `vivienk/peekaplate_staging`: private historical application repository; keep it writable and unarchived during transition. Imported application main is `a9bb60a9f3caf7d0f9362c0c3f8732971ac8d380`. The import commit has both source tips as parents and exactly the application source tree, followed by the explicit migration configuration changes.
- Use a **merge commit**, never squash or rebase, for the import and initial release PR. Squashing/rebasing would disconnect source ancestry. Do not force-push existing main or staging branches.
- Full Git bundles preserve all advertised refs, including pull-request refs. Original branch and PR heads are also retained under `source-staging/` in the canonical repository. GitHub PR discussions, approvals, checks, issues and deployment records do not travel with Git; retain and link the source repository.

## Open staging PRs

These are unmerged work, not part of the imported runtime. Reconcile each current head and its base before opening a successor PR against canonical `develop`; do not treat source approval as approval of a changed migration diff.

| Source PR | Audit head | Disposition |
| --- | --- | --- |
| [13](https://github.com/vivienk/peekaplate_staging/pull/13) | a9ee2727d8ab1076d0bf0d32e25c7f1356584a94 | Main ruleset JSON copied semantically unchanged; develop variant changes only name/ref. Source PR remains open; reconcile after review. |
| [14](https://github.com/vivienk/peekaplate_staging/pull/14) | 49c540f594444ae8bb197bd3d831624a4cb8f0df | Preserve CRM architecture branch; review separately. |
| [15](https://github.com/vivienk/peekaplate_staging/pull/15) | 6027d7f9b67c0dccdbf8886010cd28e48bc451bf | Preserve planning branch; review separately. |
| [16](https://github.com/vivienk/peekaplate_staging/pull/16) | 28b91d0af895401fcf145d56e7f28fef258ca0be | Preserve menu ingestion branch; review separately. |

## Branch and approval policy

Feature/fix PRs target `develop`; the existing fail-closed `ci` job runs for all PRs and pushes to `main`/`develop`/`staging`. Merge reviewed release candidates into `main`, test the exact commit in the staging environment, then promote that same commit to production after independent human release approval. Never substitute a newer untested main tip. The desired protection rules require one human code-owner approval independent of the latest pusher, dismiss stale reviews, resolve conversations, require up-to-date `ci` from GitHub Actions app 15368, and prohibit deletion/force pushes with no bypass actors. Their enforcement limitations are described below. Human review comments must state scope and evidence.

Importable policies are [.github/main-ruleset.json](../.github/main-ruleset.json) and [.github/develop-ruleset.json](../.github/develop-ruleset.json), derived from source PR 13. **Files do not activate protection.** The owner chooses GitHub Free and private repositories; live branch enforcement is unavailable under that choice. Retain the policy files as a future option, but do not make a paid upgrade or public visibility a migration prerequisite. Until then, use process controls: keep write access limited, require a reviewed PR and passing CI before merge, require a human approval comment, use merge commits for history-preserving imports/releases, and protect production credentials in the hosting provider. These controls are not GitHub-enforced and an admin can bypass them. State that limitation wherever release readiness is reported.

CODEOWNERS names `hemu77` and `vivienk`; both currently have canonical write/admin access. Source-only collaborators are `eirene-woo`, `YACIINE105`, `myler71`, `amrhucien`, and `adamhelwa`. Confirm least-privilege access and migrate their work before ending source-repository activity. No new permission grants are included.

## Deployment inventory and target separation

| Target | Current evidence | Required next action |
| --- | --- | --- |
| Marketing production: `peekaplate.io` | Netlify site `2a45397f-0ef5-4263-abf6-7c398df669fb`, published deploy `6acdf72965b85f12fb5e68ee`, published 2026-10-13T09:17:38.738Z. Build source is Netlify-managed `kongfusion-x/peekaplate`, main; it is not GitHub `vivienk/peekaplate`. | Eight site assets match production SHA-1 checksums; the listed netlify.toml artifact differs and its deploy-URL fetch returns 404, so configuration parity remains unresolved. Form submission and email behavior still require verification. Retain the deployed artifact and history, then obtain explicit approval before reconnecting to `peekaplate-marketing`. |
| Core staging | Existing Supabase project and Hyperdrive inspected; both migration versions and restricted runtime-role metadata verified. No Worker or Pages deployment observed. See [operations](operations.md) for resource IDs and evidence limits. | Use a reviewed exact `main` commit. Configure and test genuine identity/database paths with existing staging resources. Keep Actions disabled until environment controls are available; use the approved operator route otherwise. |
| Core production: intended restaurant console `peekaplate.app` | Intended address only; no ownership, DNS, live app or production binding verified. No production workflow is supplied. | Choose approved console/diner/API routing, configure isolated production resources and protected main-only environment with independent release reviewer and self-review prevention, verify parity and rollback, then obtain explicit launch approval. |

The staging workflow now targets `main` under [ADR 0012](adr/0012-main-environment-promotion.md) and remains disabled unless the **repository variable** `STAGING_DEPLOYMENT_APPROVED=true`. Its existing checks and build remain. Before enabling it, verify exact-head hosted CI, environment reviewer enforcement, provider bindings and resource separation. Do not set the variable merely to test the workflow or substitute repository secrets for unavailable approval enforcement. Production release controls remain required; no production deployment workflow is supplied.

Marketing requires the protected `PORKBUN_SMTP_PASSWORD` Functions variable; do not copy secret values into Git or reports. Netlify Forms, submissions, domain settings, function environment values and historical deploys stay on the existing Netlify site. The only observed canonical webhook is an active ClickUp integration; do not copy its signed URL or secret to another repo. Reconfigure integrations explicitly after review.

## Required acceptance and rollback

1. Verify full bundles, exact marketing branch SHAs, application tree equality at the import commit, and ancestor reachability from the migration head. Re-fetch before merge and reconcile source commits that landed after this audit.
2. Pass exact-head hosted CI, including applicable database/browser lanes; record local test limits separately. Obtain independent human review of this import and the ruleset policies.
3. Keep the repositories private on GitHub Free. Confirm collaborators and review ownership. Apply the manual PR/CI process above; GitHub does not enforce protected branches under this plan. Migration and release PRs must use merge commits.
4. The manual staging workflow is registered on default `main`; only a `main` dispatch may deploy once all provider and approval gates are satisfied. Keep the activation variable unset until then. Record the exact deployed SHA and test the staged diner/console/API, identity, tenant boundaries, migrations and assets. Confirm production marketing behavior independently.
5. Promote the same staging-verified `main` SHA to production only after release sign-off, using separate production resources. Keep production auto-deploy disconnected until launch approval; merging source code is not deployment approval.
6. Preserve current Netlify site/deploy IDs, DNS records and provider settings for rollback. A Git revert of the import does not restore provider configuration or databases. Restore the previous deployment if necessary; use forward database repairs and backups.
7. Before archiving staging: reconcile all refs/open PRs/issues, retain review links, verify migrated checks/secrets/integrations/permissions, resolve provider dependencies, verify staging/production parity, and obtain explicit archival approval. No deletion or archival is authorized by this PR.
