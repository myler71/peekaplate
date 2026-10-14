# PeekaPlate: team guide

Updated October 14, 2026. This guide covers the repository foundation and the local staff-command work in [PR #9](https://github.com/vivienk/peekaplate_staging/pull/9). The PR records its merge status, review and CI results. This is an explanation of the current code, not a replacement for the accepted [architecture decisions](adr/README.md).

## 1. What we are building

PeekaPlate helps a restaurant show its food clearly and learn what happens after people browse its menu. The intended loop is:

1. Staff capture real food and prepare accurate dish information.
2. Reviewers approve the exact content that diners may see.
3. Diners open the menu, with optional richer views for selected dishes.
4. The system records which version of the menu was actually shown.
5. Where a valid link exists, restaurant order data connects a browsing session to a ticket.
6. The owner uses that evidence to make and evaluate a menu decision.

**“3D is the hook. The loop is the product.”** Attractive food views matter, but the useful outcome is an informed restaurant decision. A dish view alone does not prove a sale, an individual's order, or a sales increase.

The first pilot targets one venue and a small set of enhanced dishes. It is not a finished platform yet.

## 2. What has actually been done

| Stage | What was completed | What it gives the team |
| --- | --- | --- |
| Architecture | Eight accepted decision records covering the stack, events, evidence, visuals, privacy, orders, delivery and agents | A shared explanation of why the system is organized this way |
| Repository foundation | Separate diner, staff console, backend, shared contracts, migrations, tests and documentation | Places to work independently without mixing browser code with database authority |
| Engineering safeguards | Reproducible dependency versions, CI, PR template, ownership guidance, monthly dependency updates, context and error records | Repeatable checks and a consistent handoff process |
| Research | A recorded survey of 65 public repositories' metadata and folder patterns | Ideas selected for this project's size; not 65 full code or security audits |
| Agent assistance | Five paired Codex/Claude profiles and selected prompt-behavior evaluations | Defined jobs for navigation, implementation and independent review |
| Local backend feature | Staff-token verification, restaurant membership checks and dish-revision commands | A real request can create a dish revision safely in a disposable local database |
| Verification | Unit, database, Worker, local-demo and browser checks, with independent review fixes | Evidence for the implemented local scope |

The public diner is currently a staging message. The staff console is a React shell. Neither screen connects to the dish-editing command yet. There is no finished login screen, real published menu, analytics ingestion, POS adapter or Three.js viewer.

No Cloudflare or Supabase resources were provisioned for this work. Merging the code does not deploy it: staging deployment has a separate manual workflow.

## 3. The few technical words worth knowing

| Word | Plain meaning here |
| --- | --- |
| Repository / repo | The shared project folder and its recorded change history |
| Frontend | The pages a diner or staff member sees in their browser |
| Backend / API | The server code that receives requests, checks permission and changes data |
| Worker | Cloudflare's way of running our backend code; its real runtime also runs locally for tests |
| Contract | A shared rule for what a request or response is allowed to contain |
| Database | The organized, lasting store of restaurant information |
| Tenant / venue | One restaurant's boundary in the system; a tenant ID identifies that boundary |
| Authentication | Checking who a caller is |
| Authorization | Checking what that caller may do at a particular restaurant |
| JWT | A signed identity token; checking its signature is part of authentication |
| Migration | A numbered set of instructions that changes the database structure |
| Transaction | A group of database changes that all succeed together or are all undone |
| Event | A recorded fact that something happened, such as a dish revision being created |
| Projection | A convenient current view built from history, such as the latest dish details |
| Receipt / idempotency | A saved result that lets the same request be retried without doing the work twice |
| Outbox | A database list of work to deliver later; adding a row does not mean a consumer has delivered it |
| Replay | Reading past events to rebuild a view without sending notifications or creating new work |
| RLS | Database rules that limit which restaurant's rows an ordinary application connection can access |
| PR | A proposed code change, reviewed before it joins the main branch |
| CI | Automatic checks that GitHub runs on proposed changes |
| ADR | A short written record of an important architecture decision and its reasons |

## 4. How the pieces fit together

```text
Diner browser                 Staff browser
frontend/diner                frontend/console
         \                    /
          Shared data rules: packages/contracts
                         |
              Backend: Cloudflare Worker
              identity -> permission -> command
                         |
                    PostgreSQL
              restaurant-specific information
```

This is the intended application arrangement. Today the browser apps are shells, and the working command is exercised by the local demo and tests.

The apps live in one repository so they can share data definitions and one review process. They are separate applications and local processes. Sharing a repository or laptop does not require them to share one production server.

Planned hosted responsibilities are Cloudflare Pages for the browser apps, Workers for the API, Supabase for PostgreSQL and staff identity, and Hyperdrive for the Worker-to-database connection. Queues and R2 belong to later evidence-processing work. Vercel and Dokploy have not been configured.

Docker currently runs disposable local PostgreSQL databases. It is a development/test tool here. It is not the restaurant-isolation mechanism, and it is not a decision to host the production database on a laptop.

## 5. Follow one real operation: create a dish revision

Imagine an editor submits “Tomato Soup” for Restaurant A.

1. `backend/src/index.ts` receives the request. Shared contracts check its IDs, text and version fields.
2. `backend/src/auth.ts` verifies the signed staff token against the configured identity provider's public keys. A caller cannot select a different key source through their token.
3. `backend/src/dish-command.ts` asks the database whether that person is currently an owner or editor of Restaurant A. Putting Restaurant A's ID in a URL does not grant access.
4. The command checks its request ID. If this person already sent the identical command to this restaurant, it returns the saved result. Reusing that ID for different content is rejected.
5. It checks the dish version. If two editors both start from the same old version, one change can succeed and the other receives a conflict instead of silently overwriting it.
6. One database transaction stores four things: the event, the latest dish view, the retry receipt and the outbox row. If any write fails, the whole change rolls back.
7. The API returns the new dish revision. The current local demo prints it; a future console screen will show it to staff.

The API route is `POST /venues/{venueId}/dishes/{dishId}/revisions`. A first revision uses expected version `0`. Successful creation and an identical authorized retry return HTTP `200`. Invalid identity returns `401`; missing permission returns `403`; stale versions or conflicting reuse return `409`.

A dish revision is a draft content change. Creating it does **not** approve or publish a menu. Those commands are a later feature.

### What protects Restaurant A from Restaurant B?

The backend verifies identity, checks current restaurant membership and sets restaurant/actor context only inside the transaction. A restricted database role and RLS provide another layer of protection. That context must disappear when the transaction ends so a reused connection does not carry one restaurant into the next request.

Tests cover rejected cross-restaurant access, revoked membership, read-only staff and context reset. Database owner accounts can bypass ordinary restrictions; the actual hosted migration and runtime accounts must still be configured and tested separately.

## 6. How events are tracked

There are two different paths. Keeping them separate prevents a browsing observation from being treated like an authorized business change.

| Path | Example | Current position |
| --- | --- | --- |
| Business history | “An authorized editor created dish revision 2” | Implemented for dish revisions in PostgreSQL |
| Diner observations | “This session opened this dish from this published menu” | Initial data rules exist; collection and storage flow are not implemented |

The implemented business path writes to `es_event`, updates `dish_current`, records the result in `es_command` and adds work to `outbox`. The outbox has no delivery worker yet. A pure dish replay function can reconstruct the tested current dish view from its stored events; a full operational rebuild tool is still future work.

The planned diner path is: browser keeps unsent observations -> ingest Worker validates them -> Queue accepts them -> browser receives accepted IDs -> consumer creates an R2 archive -> consumer indexes them in PostgreSQL -> queue message is acknowledged. Retries keep the same event IDs. Failed work needs recovery handling.

That future flow must record the exact publication and dish version shown. We do not currently have PostHog, a live analytics dashboard, or an `/events` ingestion endpoint. `/events` deliberately returns `404`.

## 7. Why these choices were made

| Choice | Reason in ordinary words |
| --- | --- |
| TypeScript across the current apps | The browser and backend can share data definitions, and the team maintains one application language |
| A small Hono Worker | Enough routing for the present API without creating a large server framework or several services |
| PostgreSQL and plain SQL migrations | Clear data rules, transactions and directly tested restaurant boundaries |
| Selective event sourcing | Preserve history where reconstruction matters; ordinary settings and accounts do not all need event streams |
| Supabase | The accepted plan combines PostgreSQL and staff identity; Neon would need an explicit replacement decision and equivalent identity/integration checks |
| Local Docker tests | Exercise an actual database while keeping test data disposable and separate from real restaurant information |
| Python later | It is accepted for a real processing/analysis job, with uv and pytest; no such job exists yet |
| Vitest, pgTAP and Playwright now | Test TypeScript logic, database behavior and browser behavior with tools appropriate to each |
| No Rust service or extra orchestration framework | No current requirement justifies another service, language or task system |
| Repository-owned context | A small source-linked map helps agents find the right files without adding another database or memory service |

### T0, T1 and T2

**T0** is the complete ordinary menu: real photos and text. It must remain useful when optional features fail.

**T1** adds shallow movement to reviewed photo cutouts. It creates a sense of depth with limited movement; it does not prove a fully captured 3D dish.

**T2** separates real captured plating stages into layers. It supports selected views without inventing ingredients or unseen edible surfaces.

Three.js is planned for the optional viewer, loaded after a tap. It is not installed as a working diner feature. Start with T0, then selected T1/T2 dishes whose assets, performance and truthfulness pass review.

The supplied design link is an evolving Claude prototype, not a confirmed Figma file. Its direction is recorded in [frontend-design.md](frontend-design.md). The existing shells do not yet implement that design.

## 8. What “tested” means right now

The implementation at `abb9252` passed [CI run 38640316602](https://github.com/vivienk/peekaplate_staging/actions/runs/38640316602). The guide and accompanying documentation corrections are a later documentation-only addition to the same PR; use its latest CI run for the final reviewed commit.

| Evidence | What it establishes | What it does not establish |
| --- | --- | --- |
| 35 application, contract and local-tool tests | Tested parsing, token checks, HTTP behavior, replay rules and shutdown-error cleanup | Every possible input or hosted provider behavior |
| 20 repository-script tests | Tested bundle, documentation, PR, context, database-output and verification-runner safeguards | That every written explanation is factually correct |
| 43 SQL assertions | Tested schema constraints, restricted-role behavior and row policies | Correct permissions for accounts not yet created at the provider |
| 13 real Worker/PostgreSQL cases | Signed local tokens, atomic writes, concurrency, retry conflicts, rollback, revocation and replay | Real Supabase login or Hyperdrive pooling |
| Local CLI smoke flow on Linux | Actual local setup, demo command and normal cleanup path | Recovery of this Windows machine's Docker installation |
| Four browser tests | Shell visibility, no-JavaScript diner content, accessibility scans, narrow layout and health behavior | A completed menu, login, order flow or real-phone viewer |
| Builds and bundle check | Apps build, Worker bundles, initial diner JavaScript stays within its configured budget | Real diner loading speed on a phone/network |
| Independent review | Architecture and correctness reviewers examined a fixed code version and rechecked fixes | Infallibility or automatic permission to deploy |

Review caught a mismatched SQL test count and a shutdown failure that skipped cleanup. Both were corrected. The cleanup test failed before its fix and passed afterward.

### Why there are five CI jobs

| Job | Specific purpose |
| --- | --- |
| `changes` | Decide whether changed paths need database and browser tests |
| `quality` | Check formatting/imports, types, unit/script tests, builds, context, document links and the PR explanation |
| `database` | Test migrations, SQL policies, real Worker/database behavior and the local demo |
| `browser` | Exercise the existing browser shells and their accessibility/layout checks |
| `ci` | Give one final result that fails if a required job failed |

The database and browser jobs run when relevant files change. The current Biome setup enforces formatting/import organization; it is not a broad security or correctness ruleset. Types, tests and review serve different purposes.

Routine dependency updates are monthly and grouped, with at most one open version-update PR per ecosystem. Security updates can arrive sooner. No automatic dependency merge is configured. A past full passing run took about 72 seconds of runner time, excluding the GitHub queue; that is a measurement, not a timing guarantee.

## 9. File-by-file walkthrough

These tables cover the tracked project files at this handoff, including this guide. Files generated by installation, builds or local sessions are explained afterward. The path is where a developer or agent should go; the description explains why it exists.

### Start here: project-wide files

| File | Purpose |
| --- | --- |
| [README.md](../README.md) | Public starting page: current capabilities, stack, commands, repository layout and limits |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | How a developer prepares, tests, documents and submits a complete change |
| [AGENTS.md](../AGENTS.md) | Shared rules for contributors and coding agents: authority, scope, evidence and handoffs |
| [CLAUDE.md](../CLAUDE.md) | Points Claude to the same project rules instead of maintaining a competing policy |
| [SECURITY.md](../SECURITY.md) | Security boundaries, private reporting guidance and safe handling of credentials/data |
| [errors.md](../errors.md) | Sanitized failure observations, confirmed causes, fixes and still-open limitations |
| [.learnings/LEARNINGS.md](../.learnings/LEARNINGS.md) | Reusable lessons about tooling and workflow; not a dump of chats or private data |
| [package.json](../package.json) | Root command list, runtime requirements and shared development tools |
| [pnpm-workspace.yaml](../pnpm-workspace.yaml) | Lists the applications/packages and controls dependency installation policy |
| [pnpm-lock.yaml](../pnpm-lock.yaml) | Records the exact dependency tree so installs are repeatable; generated by pnpm |
| [.node-version](../.node-version) | Tells local tools which Node version to use |
| [tsconfig.base.json](../tsconfig.base.json) | Shared strict TypeScript settings |
| [biome.json](../biome.json) | Formatting and import-organization configuration |
| [.editorconfig](../.editorconfig) | Consistent spacing, encoding and line endings across editors |
| [.gitattributes](../.gitattributes) | How Git handles text line endings and binary image files |
| [.gitignore](../.gitignore) | Keeps dependencies, generated output, local credentials and temporary work out of ordinary Git additions |
| [vitest.config.ts](../vitest.config.ts) | Selects fast application/contract/local-tool tests |
| [vitest.db.config.ts](../vitest.db.config.ts) | Selects the separate real database integration tests and their time limits |
| [playwright.config.ts](../playwright.config.ts) | Starts the local apps for browser tests and controls browser output/failure traces |

### Diner frontend: what the customer will open

| File | Purpose |
| --- | --- |
| [frontend/diner/index.html](../frontend/diner/index.html) | Current static staging message; the page content exists even without JavaScript |
| [frontend/diner/src/main.ts](../frontend/diner/src/main.ts) | Current JavaScript entry, which imports styling; future diner behavior belongs here or in modules it uses |
| [frontend/diner/src/style.css](../frontend/diner/src/style.css) | Diner shell appearance and layout |
| [frontend/diner/package.json](../frontend/diner/package.json) | Diner dependencies and its own development/build commands |
| [frontend/diner/tsconfig.json](../frontend/diner/tsconfig.json) | TypeScript settings for this app |
| [frontend/diner/vite.config.ts](../frontend/diner/vite.config.ts) | Diner build configuration, including the initial JavaScript size check |

### Staff console: what restaurant staff will use

| File | Purpose |
| --- | --- |
| [frontend/console/index.html](../frontend/console/index.html) | Browser page that hosts the React console |
| [frontend/console/src/main.tsx](../frontend/console/src/main.tsx) | Current React shell; no working login/edit/review screen yet |
| [frontend/console/src/style.css](../frontend/console/src/style.css) | Console shell appearance and layout |
| [frontend/console/package.json](../frontend/console/package.json) | Console dependencies and commands |
| [frontend/console/tsconfig.json](../frontend/console/tsconfig.json) | TypeScript settings for the console |
| [frontend/console/vite.config.ts](../frontend/console/vite.config.ts) | React/Vite build configuration |

### Backend: identity, permission and changes

| File | Purpose |
| --- | --- |
| [backend/src/index.ts](../backend/src/index.ts) | API entry: health route, dish-revision route, body checks, safe responses and database connection setup |
| [backend/src/index.test.ts](../backend/src/index.test.ts) | Fast HTTP tests for missing identity, invalid requests, size/media limits and configured behavior |
| [backend/src/auth.ts](../backend/src/auth.ts) | Verifies staff tokens using the configured issuer's public keys and returns a verified staff ID |
| [backend/src/auth.test.ts](../backend/src/auth.test.ts) | Tests signed tokens and rejects bad signatures, claims, expiry and unsupported identity cases |
| [backend/src/dish-command.ts](../backend/src/dish-command.ts) | Membership checks, conflict/retry handling, all-or-nothing writes and pure dish replay |
| [backend/src/dish-command.test.ts](../backend/src/dish-command.test.ts) | Fast replay tests, including malformed, mixed or broken event histories |
| [backend/src/dish.integration.ts](../backend/src/dish.integration.ts) | Actual Worker plus PostgreSQL tests, including concurrent edits, rollback and restaurant separation |
| [backend/local.mjs](../backend/local.mjs) | Starts the disposable local database, synthetic identity issuer and Worker; also runs the demo/check mode |
| [backend/local.test.mjs](../backend/local.test.mjs) | Reproduces failed Worker shutdown and checks that remaining cleanup is attempted |
| [backend/wrangler.jsonc](../backend/wrangler.jsonc) | Worker entry, runtime compatibility and local/staging names; hosted auth/database bindings are not supplied |
| [backend/package.json](../backend/package.json) | Backend dependencies and commands |
| [backend/tsconfig.json](../backend/tsconfig.json) | TypeScript settings for backend source |

### Shared contracts and database changes

| File | Purpose |
| --- | --- |
| [packages/contracts/src/index.ts](../packages/contracts/src/index.ts) | Allowed health, dish-command/result and initial diner-observation data shapes; rejects unexpected authority fields |
| [packages/contracts/src/index.test.ts](../packages/contracts/src/index.test.ts) | Checks valid and invalid contract examples |
| [packages/contracts/package.json](../packages/contracts/package.json) | Makes those definitions a shared workspace package |
| [packages/contracts/tsconfig.json](../packages/contracts/tsconfig.json) | TypeScript settings for shared definitions |
| [migrations/202610130001_foundation.sql](../migrations/202610130001_foundation.sql) | Creates the private schema, venues, event history, command receipts, outbox and initial row policies |
| [migrations/20261014210000_staff_commands.sql](../migrations/20261014210000_staff_commands.sql) | Adds staff memberships, current dish views, their policies and restricted runtime grants |

Applied migrations are history. Developers add a new forward migration to change an existing deployed database; they do not edit an old applied file or casually undo event history.

The six current tables have simple jobs: `venues` identifies restaurants; `staff_membership` connects people to permitted restaurant roles; `dish_current` holds the latest dish view; `es_event` holds business history; `es_command` remembers request results; `outbox` holds future delivery work.

### Repository checks and their regression tests

| File | Purpose |
| --- | --- |
| [scripts/check-bundle.mjs](../scripts/check-bundle.mjs) | Counts initially loaded diner JavaScript and rejects an oversized or unaccounted build; guards against loading the optional renderer immediately |
| [scripts/check-bundle.test.mjs](../scripts/check-bundle.test.mjs) | Checks shared chunks, lazy imports, missing imports and size failures |
| [scripts/check-docs.mjs](../scripts/check-docs.mjs) | Checks local Markdown links; does not fetch external pages or judge prose |
| [scripts/check-docs.test.mjs](../scripts/check-docs.test.mjs) | Checks good, broken and unsafe local links |
| [scripts/check-pr.mjs](../scripts/check-pr.mjs) | Requires a meaningful PR structure and stated verification results |
| [scripts/check-pr.test.mjs](../scripts/check-pr.test.mjs) | Rejects missing PR sections and unfinished template text |
| [scripts/context.mjs](../scripts/context.mjs) | Shows a module's context, validates references and refreshes source fingerprints |
| [scripts/context.test.mjs](../scripts/context.test.mjs) | Tests malformed graphs, stale sources and invalid paths |
| [scripts/test-db.mjs](../scripts/test-db.mjs) | Creates isolated Docker databases, applies migrations, runs SQL/Worker/local-flow checks and cleans up |
| [scripts/test-db.test.mjs](../scripts/test-db.test.mjs) | Checks failure reporting and whether SQL test counts/results are valid |
| [scripts/verify.mjs](../scripts/verify.mjs) | Runs the approved named checks and records sanitized failure observations |
| [scripts/verify.test.mjs](../scripts/verify.test.mjs) | Checks failure status, safe recording, directory creation and platform invocation |
| [tests/db/Dockerfile](../tests/db/Dockerfile) | Builds the PostgreSQL test image with pgTAP SQL-test support |
| [tests/db/foundation.sql](../tests/db/foundation.sql) | The 27 foundation database assertions |
| [tests/db/staff.sql](../tests/db/staff.sql) | The 16 staff-role and dish-policy assertions |
| [tests/e2e/foundation.spec.ts](../tests/e2e/foundation.spec.ts) | The four browser shell, accessibility/layout and API-health tests |

### GitHub collaboration and automation

| File | Purpose |
| --- | --- |
| [.github/CODEOWNERS](../.github/CODEOWNERS) | Names review owners; enforcement still depends on GitHub settings |
| [.github/PULL_REQUEST_TEMPLATE.md](../.github/PULL_REQUEST_TEMPLATE.md) | Prompts authors to explain outcome, contract changes, verification and deferred work |
| [.github/dependabot.yml](../.github/dependabot.yml) | Monthly grouped routine updates and separate security-update grouping |
| [.github/workflows/ci.yml](../.github/workflows/ci.yml) | The five purposeful CI jobs described above |
| [.github/workflows/deploy-staging.yml](../.github/workflows/deploy-staging.yml) | Manual main-branch Worker deployment using a staging environment and protected credentials |

### Agent files: who does which job

The `.claude` file is the Claude profile; the matching `.codex` file is the Codex profile. They describe the same responsibility in each client's format. These are instructions, not separately running employees or an automatic review service.

| Files | Responsibility |
| --- | --- |
| [.claude/agents/repo-guide.md](../.claude/agents/repo-guide.md), [.codex/agents/repo-guide.toml](../.codex/agents/repo-guide.toml) | Explain a code path, find relevant decisions and prepare a bounded task brief |
| [.claude/agents/task-builder.md](../.claude/agents/task-builder.md), [.codex/agents/task-builder.toml](../.codex/agents/task-builder.toml) | Implement an explicitly assigned slice, include its tests and hand off changes outside its ownership |
| [.claude/agents/architecture-reviewer.md](../.claude/agents/architecture-reviewer.md), [.codex/agents/architecture-reviewer.toml](../.codex/agents/architecture-reviewer.toml) | Check boundaries, restaurant authority and accepted architecture decisions |
| [.claude/agents/correctness-reviewer.md](../.claude/agents/correctness-reviewer.md), [.codex/agents/correctness-reviewer.toml](../.codex/agents/correctness-reviewer.toml) | Check reachable failures, retries and whether tests support the claims |
| [.claude/agents/review-coordinator.md](../.claude/agents/review-coordinator.md), [.codex/agents/review-coordinator.toml](../.codex/agents/review-coordinator.toml) | Keep reviewers on the same code version and reconcile their evidence |
| [.agents/skills/peekaplate-review/SKILL.md](../.agents/skills/peekaplate-review/SKILL.md) | Shared review method and structured result format used by those roles |

The profiles and selected prompt behaviors were evaluated. The builder initially exceeded its assigned scope in a plan, was corrected and passed a fresh retest. Native profile discovery and tool-permission enforcement in the separate Codex/Claude clients remain unverified. Agent instructions alone cannot enforce permissions or guarantee accuracy.

### Documentation and decisions

| File | Purpose |
| --- | --- |
| [docs/team_guide.md](team_guide.md) | This plain-language walkthrough and next-step guide |
| [docs/architecture.md](architecture.md) | System boundaries, data flows and what remains unimplemented |
| [docs/delivery.md](delivery.md) | Ordered feature slices, dependencies, responsibilities and acceptance gates |
| [docs/operations.md](operations.md) | Local commands, API use, cloud setup, release controls and recovery work |
| [docs/verification.md](verification.md) | Connects product/architecture requirements to existing and future test evidence |
| [docs/frontend-design.md](frontend-design.md) | Records the evolving design reference and what the real UI must eventually demonstrate |
| [docs/CONTEXT.md](CONTEXT.md) | Small JSON knowledge map: modules, source paths, dependencies, status, fingerprints and recent handoffs |
| [docs/research/README.md](research/README.md) | The 65-repository pattern survey, sources, adopted ideas and research limits |
| [docs/research/reviewer-evaluation.md](research/reviewer-evaluation.md) | What was actually tested about agent profiles, observed failures and remaining client limits |
| [docs/adr/README.md](adr/README.md) | Index of accepted architecture decisions |
| [docs/adr/0001-scope-and-repository.md](adr/0001-scope-and-repository.md) | Repository boundaries, current tools and when Python belongs |
| [docs/adr/0002-selective-event-sourcing.md](adr/0002-selective-event-sourcing.md) | Which business changes need history, atomic commands, safe retries and replay |
| [docs/adr/0003-intent-evidence.md](adr/0003-intent-evidence.md) | Future diner observations, acceptance receipts, archive ordering and recovery |
| [docs/adr/0004-visual-tiers.md](adr/0004-visual-tiers.md) | T0/T1/T2, truthful food capture, optional rendering and performance/accessibility budgets |
| [docs/adr/0005-tenancy-and-privacy.md](adr/0005-tenancy-and-privacy.md) | Identity, restaurant separation, restricted roles and data retention/deletion responsibilities |
| [docs/adr/0006-orders-and-measurement.md](adr/0006-orders-and-measurement.md) | POS linkage and what the evidence can reasonably tell the owner |
| [docs/adr/0007-delivery-and-recovery.md](adr/0007-delivery-and-recovery.md) | Environments, delivery safeguards, backups and recovery expectations |
| [docs/adr/0008-agent-context-and-review.md](adr/0008-agent-context-and-review.md) | Small source-linked memory, independent review roles and evidence requirements |

### Generated local files are different

`node_modules/` contains installed dependencies. `dist/` contains built output. `.wrangler/` contains local Worker tooling state. `work/local-session.json` holds a short-lived synthetic local session, and other `work/` files are temporary. Browser output goes into ignored report/test-result directories. These are not source files to hand-edit or commit.

Local `.env` and `.dev.vars` files may hold credentials and are ignored. A `.gitignore` rule is useful hygiene, not a guarantee that someone cannot accidentally publish a secret.

## 10. How the team should work day to day

1. Pick one outcome from [delivery.md](delivery.md), such as “an authorized reviewer can approve this exact captured revision.” Name an owner and the evidence that will show it works.
2. Have the repo guide or developer identify the relevant files, contracts and ADRs. Give the builder clear file ownership and dependencies.
3. Implement the whole small flow, including request rules, caller changes, database changes and tests where needed.
4. Run the relevant checks. Use `pnpm check` and `pnpm verify <check>` for recorded results. A check that was not run stays marked **NOT RUN**.
5. Update affected documentation and the context node. Run `pnpm context:refresh`; inspect the written summary too, because a refreshed fingerprint cannot make false prose true.
6. Open a PR with exact results. Review the same code version from architecture and correctness perspectives when the change warrants both.
7. Follow the normal human approval-with-comment process before merging. A specific owner-authorized merge does not silently replace that standing policy for future PRs.

The lead should ask for a demonstration, test evidence and remaining limits. A green check cannot answer whether a dish is accurately represented, whether a venue granted permission, or whether a business interpretation is justified.

The context map is an index, not an all-knowing memory. `pnpm context:show -- backend` finds the backend's relevant files. The model still verifies claims against source and tests. Error recording covers checks run through the verification runner; unexpected failures outside it need a sanitized manual record. Neither file automatically discovers every mistake.

## 11. What to do next, in order

| Order | Owner to assign | Concrete work | Evidence to require |
| --- | --- | --- | --- |
| 1 | Local development owner | Recover Windows Docker after saving work and restarting; check `docker version` and `docker info`, then rerun the local backend demo | Engine is reachable and the demo creates a synthetic revision |
| 2 | Tech lead / account owner | Supply staging access through protected configuration: Cloudflare account/scoped token and a Supabase staging project; prepare separate migration/runtime credentials | Named owners, least-privilege access and no secrets in Git or chat |
| 3 | Backend/platform lead | Verify real Supabase identity and membership, migrations under the real provider role, and the restricted connection through Hyperdrive | Real-provider isolation, retry, concurrency, rollback, revocation semantics and pooled-context checks; measured latency |
| 4 | Product/design + backend/frontend leads | Finish the relevant staff screens and PR 2 capture, review and publication flow using approved assets | Reviewers approve exact revisions; unauthorized approval and publication races fail; published T0 content is reproducible |
| 5 | Frontend + backend leads | Build the real T0 diner and durable observation flow in PR 3 | Useful menu without analytics/WebGL; offline/retry/partial receipt and archive-recovery tests |
| 6 | Data and visual leads | Build ticket linkage in PR 4 and selected T1/T2 in PR 5 after their prerequisites | Correct permitted POS mapping; truthful visual assets, payload budgets and real-phone checks |
| 7 | Product/data/release leads | Owner readout, controlled experiment and pilot recovery in PRs 6–7 | Understandable evidence, explicit unknowns, backup/restore drill and operational ownership |

PRs 4 and 5 can progress in parallel once their respective prerequisites are ready. The exact acceptance criteria stay in `docs/delivery.md`; do not remove a safety or evidence requirement to protect a date. The original pilot dates need the lead's review against actual progress.

The immediate cloud step is **staff identity and the database connection**. Queue/R2 event ingestion comes with the diner-evidence feature. There is no reason to provision every planned service before the code that uses it exists.

Developers can continue local feature work without cloud credentials, but cannot claim hosted readiness until the real-provider checks pass. No cloud deployment or credentials were used for the completed local slice.

## 12. Current limits the lead should keep visible

- Windows Docker recovery is still open. Linux CI passed; that does not repair a local Windows installation. Images and volumes were preserved during diagnosis.
- Real Supabase authentication, managed database roles, Hyperdrive connection reuse and hosted latency are unverified. Synthetic local identities are not a working staff sign-in product.
- GitHub branch-protection/admin settings are an owner responsibility. CODEOWNERS and written policy do not prove enforcement is enabled.
- The separate security workbench scan captured an earlier snapshot and was marked failed without a verdict. The independent pinned code reviews and auth/tenant tests are separate evidence; there is no completed security-tool certificate.
- The 65-repository research was a bounded layout/pattern survey. It was not a complete license, security or supply-chain audit of every project.
- Agent profiles have selected behavior evidence, but native client discovery and tool restrictions remain unverified.
- Publication, approvals, live diner analytics, order linkage, visuals, deletion/restore drills and the owner readout remain feature work. Their documented designs are not implemented behavior.

For a short team update: **the repository and first local backend flow are ready to build on; the customer and staff product screens, real cloud integration and full restaurant measurement loop remain the next work.**
