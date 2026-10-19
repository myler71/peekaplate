# PeekaPlate

Canonical application repository: `vivienk/peekaplate` (private). Marketing lives in `vivienk/peekaplate-marketing`. Application migration and the initial staging deployment are complete; see the [migration and release checklist](docs/repository-migration.md) and [staging evidence](docs/operations.md#staging-deployment-record).

**3D is the hook. The loop is the product.**

PeekaPlate is a restaurant menu and measurement platform designed to connect diner menu exposure with linked order outcomes and controlled menu experiments. The [PeekaPlate Orchestration + V1 Team Plan](https://claude.ai/artifact/HxpC9aET7geEwkEpyG6wrt) defines the product scope; [Architecture Decision Records](docs/adr/README.md) define the accepted technical decisions.

The [team guide](docs/team_guide.md) explains the system and each tracked file's purpose in plain language, distinguishes working features from plans, and gives the next steps.

Staging links: [diner](https://peekaplate-diner-staging.pages.dev/) · [owner/staff console](https://peekaplate-console-staging.pages.dev/) · [API health](https://peekaplate-api-staging.vxkong.workers.dev/health). Existing names are retained. Both pages are starter shells; production is not configured. Start with the guide's [setup walkthrough](docs/team_guide.md#where-to-open-staging), then the [next-ticket sequence](docs/delivery.md#next-tickets-from-the-deployed-foundation).

## Implementation status

The repository contains diner and staff-console shells and a staff-command slice: signed staff-token verification, restaurant membership checks, and atomic dish-revision writes with tenant isolation. Staging hosts both shells and the API. Hosted acceptance with a genuine Supabase session verified authorized writes through Hyperdrive, retries, concurrent updates, cross-restaurant denial and membership revocation. A separate remote probe verified rollback and transaction-context reset. These are bounded synthetic checks, not pilot or production certification. Console login UI, menu publication, intent ingestion, POS integration and visual rendering are not implemented. Feature and pilot acceptance criteria are tracked in the [verification map](docs/verification.md).

## Technology and architecture

| Component | Technology | Current scope |
| --- | --- | --- |
| Diner frontend | TypeScript, Vite | Static shell with content available without JavaScript |
| Staff console | React, TypeScript, Vite | Application shell |
| Backend | Hono, TypeScript, Cloudflare Workers | Health and authenticated dish-revision commands; staging issuer and Hyperdrive configured |
| Shared contracts | Zod, TypeScript | Health, dish revision and initial dish-intent schemas |
| Database | PostgreSQL, SQL, dbmate | Private venues, staff memberships, dish projections, events, receipts and outbox; restricted runtime role |
| Processing and analysis | Python, uv, pytest | Accepted scope in [ADR 0001](docs/adr/0001-scope-and-repository.md); no job, package or runtime dependency implemented |

Frontends and backend share contracts. Frontends do not import backend internals or hold database credentials. Authorization belongs to the backend; venue authority must derive from verified identity and membership. Database policies support this boundary; they do not authenticate callers.

The accepted architecture separates two event paths:

- **Domain events:** selected content, approval, publication, availability and experiment workflows use PostgreSQL event streams. Authorized commands commit events, current projections, retry results and outbox work atomically. Replay rebuilds projections without external effects.
- **Diner observations:** a browser outbox sends stable event IDs to an ingest Worker. Queue acceptance precedes the client receipt; a consumer creates the R2 archive before indexing in PostgreSQL and acknowledging queue delivery. Exposure records identify the menu actually displayed. Unlinked order outcomes remain unknown.

Visual tiers are progressive enhancements: **T0** is the complete photo/text menu; **T1** adds shallow movement to reviewed photo cutouts; **T2** separates captured plating stages with limited viewpoints. Three.js is planned to load after an explicit tap. Menu access must survive analytics or viewer failure. The [frontend design reference](docs/frontend-design.md) records evolving design direction, not approved venue content or a completed visual specification.

Detailed boundaries, failure handling and deferred capabilities are documented in [architecture](docs/architecture.md) and the [ADRs](docs/adr/README.md).

## Repository structure

```text
frontend/diner/      Public diner application
frontend/console/    Staff application
backend/             Worker API
packages/contracts/  Shared runtime schemas and types
migrations/          Ordered SQL migrations
tests/               Database and browser integration tests
scripts/             Repository checks and local test tools
docs/                Architecture, decisions, delivery and context
```

## Local development

Prerequisites: Node **24.16.0** and pnpm **11.25.0**. The current applications require neither Python nor cloud credentials. Database tests additionally require Docker; browser tests require Playwright Chromium.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

| Service | Local address |
| --- | --- |
| Diner | http://127.0.0.1:5173 |
| Staff console | http://127.0.0.1:5174 |
| API health | http://127.0.0.1:8787/health |

For authenticated backend development, run the following instead of the unconfigured API process:

```sh
pnpm dev:backend
# In a second terminal:
pnpm local:demo
```

This starts a disposable Docker database, a loopback-only synthetic JWT issuer and the local Worker. The demo creates a dish revision through HTTP. Generated credentials stay in ignored `work/local-session.json` and expire after one hour; restart the local session to renew them. Ctrl+C removes the session database and credentials. No Supabase or Cloudflare account is required. See [operations](docs/operations.md) for the API contract and the cloud-integration checkpoint.

## Verification

| Command | Purpose |
| --- | --- |
| `pnpm check` | Formatting/lint, strict types, application/contract and repository-script tests, context freshness and local documentation links |
| `pnpm verify build` | Frontend builds, initial diner JavaScript budget and Worker deployment dry-run |
| `pnpm verify test:e2e` | Chromium shell/API flows, no-JavaScript content, accessibility and narrow-screen overflow |
| `pnpm verify test:db` | Migration upgrade, pgTAP policies and real Worker/JWT/PostgreSQL concurrency, rollback, retry and replay checks |

Install the browser once with `pnpm exec playwright install chromium`. Verification records sanitized failure observations in [errors.md](errors.md) locally and step summaries in CI. Resolution requires a confirmed cause and regression evidence. [Contributing](CONTRIBUTING.md) defines the complete verification and PR protocol.

## Agent-assisted development

Five paired role profiles are maintained in `.claude/agents/` and `.codex/agents/`:

| Role | Responsibility |
| --- | --- |
| `repo-guide` | Map a task to source, ADRs, dependencies and acceptance criteria |
| `task-builder` | Implement one assigned scope with tests and an explicit handoff |
| `review-coordinator` | Consolidate review evidence for one pinned base/head |
| `architecture-reviewer` | Review boundaries, authority, event semantics and ADR compliance |
| `correctness-reviewer` | Review execution paths, failures, retries and regression coverage |

[AGENTS.md](AGENTS.md) defines the work protocol. [CONTEXT.md](docs/CONTEXT.md) provides a source-linked module index; `pnpm context:show -- <module-id>` retrieves one module. The [review skill](.agents/skills/peekaplate-review/SKILL.md) defines evidence requirements and structured findings. Reviewers remain read-only; implementation assignments specify owned paths and dependencies.

The [prompt evaluation record](docs/research/reviewer-evaluation.md) includes configuration checks, five behavioral cases and the builder correction they identified. Native-client role discovery and tool restrictions remain unverified because the evaluation environment could not complete those checks. Profiles guide behavior; client permissions enforce access. Automated review supports the required human review and does not replace it.

## CI and deployment

CI uses five jobs with distinct responsibilities: `changes` selects integration checks, `quality` validates code/builds/documentation, `database` and `browser` test their integrations, and `ci` aggregates all applicable results. Database and browser checks are path-selected. Browser traces are retained on failure.

Routine npm and GitHub Actions dependency updates are grouped monthly, with one open version-update PR per ecosystem. Major upgrades are manual; enabled security updates can arrive sooner. AI-written and dependency PRs follow the same documentation, verification and human approval-with-comment requirements.

Both deployment environments use an exact `main` commit: deploy it to staging, verify it, then promote the same commit to production after human approval. Each environment requires separate resources and credentials; the `staging` Git branch is not a deployment source. The initial staging deployment used the authorized operator route and passed bounded hosted staff-command checks. The Actions workflow remains gated, and production deployment is not configured. See [ADR 0012](docs/adr/0012-main-environment-promotion.md) and [operations](docs/operations.md) for URLs, deployed revision, session-revocation limits and release controls.

Each contributor installs and authenticates their own Claude or Codex client and verifies its role/tool support. Native-client setup is separate from repository and cloud readiness.

## Project documentation

- [Delivery plan](docs/delivery.md): ordered feature slices, beginning with verified staff/venue authority and an atomic dish-revision command.
- [Verification map](docs/verification.md): existing evidence and feature acceptance requirements.
- [Contributing](CONTRIBUTING.md): complete PRs, dependency maintenance and context handoffs.
- [Research record](docs/research/README.md): the 65-repository pattern survey and adopted design choices.
