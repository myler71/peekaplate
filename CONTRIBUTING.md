# Contributing

Read [architecture](docs/architecture.md) and [delivery](docs/delivery.md). Choose one ordered PR slice and state its observable outcome before coding. Branch from current `main`, use a descriptive `feat/`, `fix/` or `chore/` branch, and open a draft PR early when coordination helps.

## Local checks

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
pnpm test:db
```

`pnpm check` runs formatting/lint, strict types, unit/script tests, context freshness and documentation links. Browser and Docker database tests are separate so a documentation edit need not start those services. CI selects the applicable expensive lanes and has one final `ci` check. Record durations before optimizing; target a warm ordinary PR under five minutes, not a guaranteed time.

Use `pnpm exec vitest run <test-path>` or `node --test <script-test>` while iterating. Format with `pnpm format`. Browser tests emit a compact report and save failure traces under ignored output folders. Do not paste full traces, page DOMs or real customer data into reviews.

## Complete, reviewable PRs

- Describe the trigger and resulting behavior. Link the relevant ADR/acceptance criterion.
- Include callers, schema/contract changes, tests and necessary docs together. Do not hide unfinished behavior behind success responses or silent catch blocks.
- State exact verification results and material checks not run. Add a reproduction and UI evidence only when relevant.
- Update `docs/CONTEXT.md` for changed responsibilities, decisions or task handoffs. Then refresh source fingerprints; reviewers must check the summary, not just the hash.
- A changed architectural decision gets a new numbered ADR superseding the old one. Do not rewrite accepted history to disguise a deviation.
- Use new timestamped SQL migrations. Test from an empty DB and the previous deployed schema. Never run a destructive down migration against a shared environment.
- Keep runtime dependencies exact and the lockfile committed. Review dependency bot PRs like code; no automatic dependency merges.

Use the [review skill](.agents/skills/peekaplate-review/SKILL.md) or `review-coordinator` with the base/head SHAs. Authors fix findings; reviewers stay read-only. Resolve conversations and obtain a human approval before ordinary feature merges. The one-time repository bootstrap follows the owner's setup authorization; subsequent work uses this PR process.

## Context handoff

`docs/CONTEXT.md` is one small JSON graph in Markdown. Update only affected nodes. Each node has real paths, ADR links, dependencies, implementation status and a source fingerprint. Keep the last ten handoffs; Git preserves earlier history. State completed work, evidence and the next concrete action. No chain-of-thought, entire transcripts or unverifiable model conclusions.

## Ownership and environment

CODEOWNERS routes review; it does not enforce it by itself. A repository administrator must enable required `ci`, human approval, dismissed stale approvals and conversation resolution. See [operations](docs/operations.md). Never commit credentials. Tests use isolated ephemeral services and synthetic data.
