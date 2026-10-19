# Repository migration and release gates

Status: proposed in the migration PR; no merge or production cutover authorized. Audit: 2026-10-17 America/Los_Angeles.

Continuation audit: source main advanced to `b40e3cae68ab1d78adf838a164fdd07c043027b2`. The migration branch merges all eight intervening commits without rewriting history; their net change updates five documentation links to the PeekaPlate Orchestration + V1 Team Plan. Runtime code remains identical to the original import. Owner-authenticated checks confirm private-repository rulesets and classic branch protection require a paid plan. The owner chooses GitHub Free and private repositories; use manual PR/CI review controls and leave branch enforcement explicitly inactive. No human reviews were present on the core import or source policy PR at that audit.

## Repository ownership and preserved history

- `vivienk/peekaplate`: private canonical application destination, explicitly approved by the owner. `main` remains the existing marketing commit until a separate release PR is approved. `develop` begins at that same commit and receives this reviewed import first; it is not a live QA deployment yet.
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

Feature/fix PRs target `develop`; the existing fail-closed `ci` job runs for all PRs and pushes to `main`/`develop`. A release PR promotes a tested commit to `main`. Require one human code-owner approval independent of the latest pusher, dismiss stale reviews, resolve conversations, require up-to-date `ci` from GitHub Actions app 15368, and prohibit branch deletion/force pushes with no bypass actors. Human review comments must state scope and evidence; native rules cannot judge their substance.

Importable policies are [.github/main-ruleset.json](../.github/main-ruleset.json) and [.github/develop-ruleset.json](../.github/develop-ruleset.json), derived from source PR 13. **Files do not activate protection.** The owner chooses GitHub Free and private repositories; live branch enforcement is unavailable under that choice. Retain the policy files as a future option, but do not make a paid upgrade or public visibility a migration prerequisite. Until then, use process controls: keep write access limited, require a reviewed PR and passing CI before merge, require a human approval comment, use merge commits for history-preserving imports/releases, and protect production credentials in the hosting provider. These controls are not GitHub-enforced and an admin can bypass them. State that limitation wherever release readiness is reported.

CODEOWNERS names `hemu77` and `vivienk`; both currently have canonical write/admin access. Source-only collaborators are `eirene-woo`, `YACIINE105`, `myler71`, `amrhucien`, and `adamhelwa`. Confirm least-privilege access and migrate their work before ending source-repository activity. No new permission grants are included.

## Deployment inventory and target separation

| Target | Current evidence | Required next action |
| --- | --- | --- |
| Marketing production: `peekaplate.io` | Netlify site `2a45397f-0ef5-4263-abf6-7c398df669fb`, published deploy `6acdf72965b85f12fb5e68ee`, published 2026-10-13T09:17:38.738Z. Build source is Netlify-managed `kongfusion-x/peekaplate`, main; it is not GitHub `vivienk/peekaplate`. | Eight site assets match production SHA-1 checksums; the listed netlify.toml artifact differs and its deploy-URL fetch returns 404, so configuration parity remains unresolved. Form submission and email behavior still require verification. Retain the deployed artifact and history, then obtain explicit approval before reconnecting to `peekaplate-marketing`. |
| Core staging | No GitHub environments, secret names, variable names or deployment records found in either source repo. Worker config names `peekaplate-api-staging`; hosted auth/database bindings are absent. | Create protected `staging`, restrict it to develop, use separate provider resources and scoped secrets, validate real identity/database paths, then enable the manual workflow variable. |
| Core production: intended restaurant console `peekaplate.app` | Intended address only; no ownership, DNS, live app or production binding verified. No production workflow is supplied. | Choose approved console/diner/API routing, configure isolated production resources and protected main-only environment with independent release reviewer and self-review prevention, verify parity and rollback, then obtain explicit launch approval. |

The inherited staging workflow moves from main to develop and remains disabled unless the **repository variable** `STAGING_DEPLOYMENT_APPROVED=true`. It retains its existing `pnpm check` and build checks. Before enabling it, verify exact-head hosted CI, environment reviewer enforcement, approved provider values and resource separation. Do not set the variable merely to test the workflow. [Proposed ADR 0010](adr/0010-canonical-repository-and-release-branches.md) changes ADR 0007's branch selection under the owner's migration request; production release controls remain required. Existing backend config is unchanged and no production environment is invented.

Marketing requires the protected `PORKBUN_SMTP_PASSWORD` Functions variable; do not copy secret values into Git or reports. Netlify Forms, submissions, domain settings, function environment values and historical deploys stay on the existing Netlify site. The only observed canonical webhook is an active ClickUp integration; do not copy its signed URL or secret to another repo. Reconfigure integrations explicitly after review.

## Required acceptance and rollback

1. Verify full bundles, exact marketing branch SHAs, application tree equality at the import commit, and ancestor reachability from the migration head. Re-fetch before merge and reconcile source commits that landed after this audit.
2. Pass exact-head hosted CI, including applicable database/browser lanes; record local test limits separately. Obtain independent human review of this import and the ruleset policies.
3. Keep the repositories private on GitHub Free. Confirm collaborators and review ownership. Apply the manual PR/CI process above; GitHub does not enforce protected branches under this plan. Migration and release PRs must use merge commits.
4. Before staging QA, merge a separately reviewed workflow-only bootstrap PR that registers the same disabled `.github/workflows/deploy-staging.yml` on default `main`; it contains no application replacement. [GitHub requires manual-dispatch workflows on the default branch](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow). This breaks the otherwise circular staging-before-release dependency. Dispatch with ref `develop` only after the import is merged and all protection/provider gates are satisfied; main dispatch skips the deployment job. Keep the repository activation variable unset until then. Merge import into develop; test the real staged diner/console/API, identity, tenant boundaries, DB migrations, assets, forms and relevant workflows with isolated resources. Confirm existing production marketing content and email behavior independently.
5. Open a develop-to-main release PR only after parity evidence and release sign-off. Keep production auto-deploy disconnected until launch approval; merging source code is not deployment approval.
6. Preserve current Netlify site/deploy IDs, DNS records and provider settings for rollback. A Git revert of the import does not restore provider configuration or databases. Restore the previous deployment if necessary; use forward database repairs and backups.
7. Before archiving staging: reconcile all refs/open PRs/issues, retain review links, verify migrated checks/secrets/integrations/permissions, resolve provider dependencies, verify staging/production parity, and obtain explicit archival approval. No deletion or archival is authorized by this PR.
