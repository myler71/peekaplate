# PR previews

A PR preview is a temporary copy of the diner and console pages built from one pull request. Design, product and QA reviewers can open it in a browser without running the code locally.

## For reviewers

1. Open the pull request on GitHub.
2. Find the **Preview** comment posted by `github-actions[bot]`. It links to both apps:
   - Diner: `https://pr-<number>.peekaplate-diner-preview.pages.dev`
   - Console: `https://pr-<number>.peekaplate-console-preview.pages.dev`
3. Each new push to the PR rebuilds the preview and updates the same comment. Check that its commit matches the latest PR commit before reviewing.
4. Report findings as PR review comments, with the link, browser and screen size.

No comment means one of these:

- the PR changes no files under `frontend/`, `packages/` or the workspace/lockfile;
- it comes from a fork, which receives no deployment credentials;
- previews are switched off (see [Setup](#setup));
- the **PR preview** check failed. Open it from the PR's checks list.

## What a preview is and is not

| A preview is | A preview is not |
| --- | --- |
| The built static pages from the PR's latest commit | Connected to the API, database, Queue or R2 |
| A way to review layout, tokens, copy and accessibility | Evidence that staging or production works |
| Public to anyone who has the link, and hidden from search engines | Suitable for real restaurant or diner data |

Analytics are disabled in every preview build. The PostHog consent code also refuses origins other than its configured staging origin, so nothing is sent from a preview.

## How it works

[`.github/workflows/preview.yml`](../.github/workflows/preview.yml) has three jobs:

- **build** runs for same-repository PRs. It installs dependencies, builds both apps with analytics disabled and uploads the files as a three-day artifact. It has no deployment credentials.
- **deploy** runs no PR code. It downloads the built files and uploads them with Wrangler to the dedicated `peekaplate-diner-preview` and `peekaplate-console-preview` Pages projects, using the branch alias `pr-<number>`. It checks that both links return 200, then posts or updates the PR comment.
- **cleanup** runs when the PR closes or merges. It deletes every deployment for that PR's branch alias from both projects and marks the comment as removed.

The normal **CI** workflow remains the required build and test check. **PR preview** is separate and not required, so a credentials or provider outage cannot block merges.

## Isolation

- Preview projects are separate from `peekaplate-diner-staging` and `peekaplate-console-staging`. They have no production deployment.
- The `preview` GitHub environment holds its own `CLOUDFLARE_PREVIEW_API_TOKEN`. It needs only Cloudflare Pages edit permission, never the staging Worker, Hyperdrive, Queue or R2 token.
- The build job, which runs PR code, cannot read that token. Fork PRs never run the deploy job.
- No Supabase, PostHog or GitHub team token is given to previews.

Limitation: a Cloudflare Pages token is account-wide, so it could also edit the staging Pages projects. Use a dedicated token only in the `preview` environment, and rotate it if it might have leaked. A PR author with write access can also change this workflow, so reviewers must check workflow changes like any other code.

## Retention

- When a PR closes or merges, its preview deployments are deleted.
- Built artifacts expire after three days.
- If cleanup fails, run **PR preview** manually from the Actions tab and enter the PR number. Its `cleanup` job deletes that PR's deployments.
- Review both preview projects monthly in the Cloudflare dashboard and delete deployments whose PRs are closed.

## Setup

An administrator with Cloudflare and GitHub access does this once. No step changes staging.

1. Create two Cloudflare Pages Direct Upload projects named `peekaplate-diner-preview` and `peekaplate-console-preview`. Set the production branch to `unused-production` so a PR branch never becomes production.
2. Create a Cloudflare API token with **Account → Cloudflare Pages → Edit** only.
3. In GitHub, create an environment named `preview`. Add the secret `CLOUDFLARE_PREVIEW_API_TOKEN` and the variable `CLOUDFLARE_ACCOUNT_ID`. Do not add required reviewers, or every push will wait for approval.
4. Add the repository variable `PREVIEW_DEPLOYMENT_ENABLED` with the value `true`. Set it to anything else to switch previews off.

## First validation: PR #37

PR #37 (design tokens) is the first validation case:

1. Merge this workflow into `develop`. A `pull_request` workflow runs from the PR's base branch, so PR #37 must target `develop` (its review already asks for this).
2. Push a commit to PR #37 or close and reopen it.
3. Confirm the **PR preview** check passes, the comment shows both links, and both pages load with the PR's tokens.
4. Record the run link, commit and result in [operations](operations.md).
5. After PR #37 closes, confirm the cleanup job deleted its deployments and the links stop working.
