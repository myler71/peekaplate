# PeekaPlate

3D is the hook. The loop is the product.

PeekaPlate connects the menu a diner considered to a linked restaurant ticket, then helps the owner test one useful change. This repository follows the [V1 planning baseline](https://claude.ai/artifact/LUJ4ggBXpF7korJWbg4u8f), with implementation clarifications recorded in ADRs.

## Start locally

Install Node **24.16.0** and pnpm **11.25.0**, then:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

- Diner: http://127.0.0.1:5173
- Staff console: http://127.0.0.1:5174
- API liveness: http://127.0.0.1:8787/health

No cloud credentials are needed for these shells. Docker is needed only for database tests. Read [Contributing](CONTRIBUTING.md) for the checks and first PR.

## Repository map

```text
frontend/diner/      Vite + TypeScript; photo-first public menu
frontend/console/    React + Vite; staff workspace
backend/             Hono on Cloudflare Workers
packages/contracts/  Shared runtime schemas and TypeScript types
migrations/          Ordered, plain-SQL dbmate migrations
tests/               Real-Postgres and browser integration checks
scripts/             Small repository checks and local test tools
docs/                Architecture, decisions, delivery and context
```

Agent entry points are [AGENTS.md](AGENTS.md), [CONTEXT.md](docs/CONTEXT.md) and the [review skill](.agents/skills/peekaplate-review/SKILL.md). Claude and Codex role definitions live in their standard hidden agent folders.

## What exists today

Runnable staging shells, a health-only Worker, initial dish-exposure contracts, database foundations, tests, CI and grounded review guidance. **There is no live restaurant menu, authentication, event ingestion, publication command, POS adapter or Three.js viewer yet.** The [delivery plan](docs/delivery.md) orders those PRs and defines completion evidence. A schema or passing shell test does not complete L0 or the pilot.

Read the [architecture](docs/architecture.md), [ADR index](docs/adr/README.md), [operations runbook](docs/operations.md) and [research record](docs/research/README.md). Keep PRs small enough to review and complete enough to run.
