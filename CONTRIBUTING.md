# Contributing

Read [architecture](docs/architecture.md) and [delivery](docs/delivery.md). Choose one ordered PR slice and state its observable outcome before coding. Branch from current `develop`, use a descriptive feature/fix branch, target `develop`, and open a draft PR early when coordination helps. Merge reviewed release candidates into `main`. Deploy an exact `main` commit to staging, verify it, then obtain human release sign-off before promoting that same commit to production with separate environment bindings. The Git branch named `staging` is not a deployment source. See [ADR 0012](docs/adr/0012-main-environment-promotion.md) and [repository migration](docs/repository-migration.md).

## Local checks

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm verify build
pnpm exec playwright install chromium
pnpm verify test:e2e
pnpm verify test:db
```

`pnpm check` runs formatting/lint, strict types, unit/script tests, context freshness and documentation links. Browser and Docker database tests are separate so a documentation edit need not start those services. CI selects the applicable expensive lanes and has one final `ci` check. Record durations before optimizing; target a warm ordinary PR under five minutes, not a guaranteed time.

Use `pnpm exec vitest run <test-path>` or `node --test <script-test>` while iterating. Format with `pnpm format`. Browser tests emit a compact report and save failure traces under ignored output folders. Do not paste full traces, page DOMs or real customer data into reviews.

`pnpm check` and `pnpm verify <check>...` stop at the first failed check and preserve its failure status. Locally they append sanitized observations to [errors.md](errors.md); CI writes an ignored temporary ledger and a persistent GitHub step summary. They record check name, time, exit status/signal and a validated run URL, never command output or environment values. Install/startup failures outside this runner require a manual sanitized entry. An observation is not a diagnosis: confirm the cause, link the correction and regression evidence, and review the entry before committing. CI never pushes error records or grants an agent human-review authority.

## Complete, reviewable PRs

- Describe the trigger and resulting behavior. Link the relevant ADR/acceptance criterion.
- Include callers, schema/contract changes, tests and necessary docs together. Do not hide unfinished behavior behind success responses or silent catch blocks.
- State exact verification results and material checks not run. Add a reproduction and UI evidence only when relevant.
- Update `docs/CONTEXT.md` for changed responsibilities, decisions or task handoffs. Then refresh source fingerprints; reviewers must check the summary, not just the hash.
- A changed architectural decision gets a new numbered ADR superseding the old one. Do not rewrite accepted history to disguise a deviation.
- Use new timestamped SQL migrations. Test from an empty DB and the previous deployed schema. Never run a destructive down migration against a shared environment.
- Keep runtime dependencies exact and the lockfile committed. Review dependency bot PRs like code; no automatic dependency merges.

Use the [review skill](.agents/skills/peekaplate-review/SKILL.md) or `review-coordinator` with the base/head SHAs. Authors fix findings; reviewers stay read-only. Resolve conversations and obtain a human approval with a review comment on the current commit before merging any PR, including dependency updates. The comment states what was reviewed, the verification considered and any remaining limitations. AI-written code and documentation are allowed; an agent or bot cannot supply the required human approval. The one-time repository bootstrap followed the owner's setup authorization; subsequent work uses this PR process.

## Dependency PR preparation

Routine updates arrive monthly, grouped into at most one open npm PR and one open Actions PR. Major version upgrades are planned manually; security updates have their own groups and can arrive sooner. No auto-merge.

A collaborator prepares each Dependabot PR before review: complete the normal PR template with factual impact and exact verification results, inspect release notes and the diff, then review affected context summaries and commit refreshed fingerprints when needed. An agent may help prepare these changes. Dependabot's generated release notes alone do not satisfy the template. CI intentionally remains red until the same documentation and code checks pass; there is no bot exemption. Record checks not yet run as `NOT RUN` with a reason, then use the actual CI results during review.

## Context handoff

`docs/CONTEXT.md` is one small JSON graph in Markdown. Update only affected nodes. Each node has real paths, ADR links, dependencies, implementation status and a source fingerprint. Keep the last ten handoffs; Git preserves earlier history. State completed work, evidence and the next concrete action. No chain-of-thought, entire transcripts or unverifiable model conclusions.

## Ownership and environment

CODEOWNERS routes review; it does not enforce it by itself. A repository administrator must enable required `ci`, human approval, dismissed stale approvals and conversation resolution. See [operations](docs/operations.md). Never commit credentials. Tests use isolated ephemeral services and synthetic data.
