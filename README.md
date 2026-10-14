# PeekaPlate

3D is the hook. The loop is the product.

PeekaPlate is being built to connect the menu a diner considered to a linked restaurant ticket, then help the owner test one useful change. This repository follows the [V1 planning baseline](https://claude.ai/artifact/LUJ4ggBXpF7korJWbg4u8f), with implementation decisions recorded in [ADRs](docs/adr/README.md).

**Current stage: repository foundation.** The local apps, health API, initial schemas and checks run. The restaurant product and cloud resources are still to be built and configured.

## What exists and what comes next

| Area | Implemented now | Planned work |
| --- | --- | --- |
| Diner | TypeScript/Vite shell readable without JavaScript; initial JS budget check | Approved photo/text menu, durable intent tracking, optional Three.js viewer |
| Staff console | React/Vite shell | Staff login, capture review, approval, publication and owner readouts |
| API | Hono Worker with `GET /health`; unknown routes return 404 | Verified venue authority, business commands, ingestion and POS integration |
| Database | Private venue/event/command/outbox tables, constraints and restricted-role tests | Runtime role, atomic command/projection transactions and replay |
| Delivery | Local tests, CI, manual health-Worker staging workflow and agent guidance | Owner-configured GitHub protections, cloud bindings, deployment and recovery drills |
| Python | No Python application, package or required local runtime yet | A processing/analysis job when its feature needs one, with `uv` and pytest |

Passing foundation checks does not establish authentication, production tenant isolation, durable ingestion, real-phone performance or pilot readiness. The [verification map](docs/verification.md) separates existing evidence from each future requirement.

## Languages and Python

The current web apps and API use **TypeScript**. Shared runtime schemas and types live in `packages/contracts`, so the browser and API can use the same payload definitions. This keeps the first web/API sprint on one application toolchain.

**Python is part of the extension plan, not excluded from the architecture.** [ADR 0001](docs/adr/0001-scope-and-repository.md) calls for `uv` and pytest with the first real Python processing or analysis job. Capture processing, image analysis or offline analysis may justify that job; none is implemented yet. A Python installation is therefore not needed to run today's application.

When that slice arrives, add its actual code, pinned Python version/dependencies, representative fixtures and pytest coverage together. Document its inputs, outputs and execution environment; select its CI checks only for relevant changes. Python-produced payloads must follow the shared contract and be validated at the boundary. The job's hosting is not selected by this foundation. We do not add an empty service or use pytest to duplicate the existing TypeScript test suite.

## Start locally

Install Node **24.16.0** and pnpm **11.25.0**, then:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

- Diner: http://127.0.0.1:5173
- Staff console: http://127.0.0.1:5174
- API liveness: http://127.0.0.1:8787/health

No cloud credentials or Python runtime are needed for these shells. Docker is needed only for database tests. Real staging deployment requires account resources and credentials; follow the [operations runbook](docs/operations.md).

## Verification and CI

```sh
pnpm check
pnpm verify build
pnpm exec playwright install chromium
pnpm verify test:e2e
pnpm verify test:db
```

| Check | What it verifies |
| --- | --- |
| `pnpm check` | Biome formatting/lint, strict types, Vitest application/contract tests, Node script tests, context freshness and local documentation links |
| `pnpm verify build` | Both frontend builds and a Worker deployment dry-run; does not deploy |
| `pnpm verify test:e2e` | Chromium shell/API flows, no-JS content, axe accessibility and narrow-screen overflow |
| `pnpm verify test:db` | Migrations and pgTAP assertions in isolated disposable PostgreSQL via Docker |
| Python job tests | pytest when a Python job is implemented; no Python test command exists yet |

CI has five jobs with distinct purposes: `changes` selects applicable integration lanes; `quality` checks code, builds and documentation; `database` and `browser` exercise those integrations; `ci` is the single aggregate gate. Database/browser jobs are path-selected. A warm ordinary PR targets under five minutes; this is a target, not a guarantee. Browser output stays compact, with traces retained on failure.

`pnpm check` and `pnpm verify` record sanitized failure observations in local [errors.md](errors.md), or a GitHub step summary in CI. Confirm the cause and add regression evidence before marking an issue resolved. Raw logs and secrets do not belong in the ledger; failures outside the runner require a manual entry. See [Contributing](CONTRIBUTING.md) for the complete check and PR workflow.

## Repository map

```text
frontend/diner/      Vite + TypeScript; public diner shell
frontend/console/    React + Vite; staff shell
backend/             TypeScript + Hono on Cloudflare Workers
packages/contracts/  Shared runtime schemas and TypeScript types
migrations/          Ordered, plain-SQL dbmate migrations
tests/               Real-Postgres and browser integration checks
scripts/             Small repository checks and local test tools
docs/                Architecture, decisions, delivery and context
```

Frontends import contracts, never backend internals or database credentials. New feature/job folders appear with their first implementation; the tree above shows current directories.

## Product and data model

The planned baseline is **T0**, a complete photo/text menu. **T1** adds shallow movement to reviewed photo cutouts. **T2** separates real captured plating stages with limited viewpoints. Three.js will load only after a tap; a viewer or analytics failure must leave the menu usable. No viewer is installed yet. The [design handoff](docs/frontend-design.md) records the evolving Claude prototype; it is not a frozen visual specification or approved venue content.

Business changes and diner observations follow separate planned paths:

- **Domain events:** selected content, approval, publication, availability and experiment workflows use Postgres event streams. An authorized command commits events, current projections, its retry result and outbox work in one transaction. Replay rebuilds projections without external effects.
- **Diner observations:** an IndexedDB outbox sends stable event IDs to an ingest Worker. The Worker acknowledges Queue acceptance; a consumer archives to R2 before indexing in Postgres and acknowledging queue delivery. Exposure records identify what the phone actually displayed. Unlinked order outcomes remain unknown.

These are accepted designs, not working endpoints. Venue authority must come from server-verified identity/membership and transaction-local context under a restricted runtime role. RLS tests alone do not authenticate a tenant. Details and failure cases belong in [architecture](docs/architecture.md) and the [ADRs](docs/adr/README.md).

## Working with agents and reviewers

Agent entry points are [AGENTS.md](AGENTS.md), [CONTEXT.md](docs/CONTEXT.md) and the [review skill](.agents/skills/peekaplate-review/SKILL.md). Claude and Codex role definitions live in their standard hidden agent folders.

Start a fresh agent session from this repository. Use `repo-guide` to map a task, `task-builder` for one assigned implementation slice, and `review-coordinator` to combine `architecture-reviewer` and `correctness-reviewer` findings. Give reviewers base/head SHAs; give builders responsibility and owned files. Runtime permissions remain controlled by your client.

For Claude's enforced coordinator type allowlist, launch `claude --agent review-coordinator` from the repository. The [official agent documentation](https://code.claude.com/docs/en/sub-agents#restrict-which-subagents-can-be-spawned) limits that allowlist to main-thread agents. For Codex, use the repo's named agent profiles or invoke `$peekaplate-review`. The [reviewer exercise](docs/research/reviewer-evaluation.md) records what was checked and its limits.

The context graph is a source-linked index, not proof that a feature works. Review findings require the governing requirement, source location, reachable failure and evidence. AI-written work follows the same code, documentation and review protocol. The normal merge policy requires human approval with a review comment on the current commit; agent output is labelled automated assistance.

## Delivery order and owner setup

Start with **staff authority and one atomic dish-revision command**. Then implement capture approval/publication, the real T0 menu and durable intent, ticket linkage and selected T1/T2 visuals, owner readouts, and pilot recovery. The [delivery plan](docs/delivery.md) specifies dependencies, owners and evidence; its numbered slices are a roadmap, not GitHub PR numbers.

The repository owner must configure main-branch protections, required `ci`, approval rules, staging credentials and cloud resources. These are not established by a checked-in workflow alone. Routine npm/Actions updates are grouped monthly, with at most one open version-update PR per ecosystem; major upgrades are manual, and security updates can arrive sooner when enabled. Dependency PRs still need normal documentation, checks and review.

The [65-repository research record](docs/research/README.md) explains the adopted patterns, including the lightweight context approach informed by Cognee. It is a bounded repository-pattern survey, not a full audit of 65 projects. Use [Contributing](CONTRIBUTING.md), [verification](docs/verification.md) and [operations](docs/operations.md) for implementation and release details.
