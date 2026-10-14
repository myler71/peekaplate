# Repository research record

Observed October 13, 2026 (America/Phoenix; activity timestamps below are UTC). **65 distinct public repositories** were surveyed through primary GitHub metadata and root/default-branch structure. This is a bounded pattern survey, not a security audit or a claim that every project is trending. Nine candidates were selected from the [GitHub Trending daily page](https://github.com/trending); successfully inspected candidates are marked below. Rankings change. No repository was cloned or installed merely because it was popular.

## Decisions for PeekaPlate

- Keep pnpm workspaces and separate frontend/backend/contracts, borrowing the clear boundaries visible in Vite, Hono and mature monorepos. Skip Nx/Turbo until measured CI warrants them.
- Keep one SQL migration history and real PostgreSQL tests. An ORM, service mesh or extra language would not improve this foundation.
- Adopt source-linked context and scoped agent roles. Cognee separates ingestion, graph/retrieval and examples; here the same useful principle becomes a small versioned JSON map with source paths and fingerprints. Skip a hosted graph/vector memory service until retrieval scale justifies it.
- Keep deterministic CI, bounded browser output and failure traces. Models help review evidence but cannot be the sole required quality gate.
- Prefer complete vertical PR slices, exact contract/test evidence and human ownership. The privately inspected i-detect-admin supplied generic workflow ideas only; no private source, documents or fixtures were copied.
- Three.js remains a lazy optional viewer behind a stable interface. The baseline 0.183.x exists; the latest upstream development version is not a reason to change the approved compatibility target.

## Source inventory

Activity is repository push time, not proof of quality or compatibility. Layout observations support the choices above; large-project folder counts were not copied.

| Repository | Latest observed push (UTC) | Layout/pattern considered | Daily trending sample |
| --- | --- | --- | --- |
| [pnpm/pnpm](https://github.com/pnpm/pnpm) | 2026-10-14T05:23:02Z | pnpm-workspace.yaml, CONTRIBUTING.md, CODEOWNERS, CI/test workflows — Explicit workspace and ownership; avoid its release/benchmark scope. | Not claimed |
| [vercel/turborepo](https://github.com/vercel/turborepo) | 2026-10-14T06:02:50Z | turbo.json, pnpm-workspace.yaml, CODEOWNERS, lint/test workflows — Task caching is optional until CI is slow. | Not claimed |
| [nrwl/nx](https://github.com/nrwl/nx) | 2026-10-14T05:58:38Z | nx.json, pnpm-workspace.yaml, PR template, CI/e2e workflows — Separate ordinary CI from expensive matrices. | Not claimed |
| [changesets/changesets](https://github.com/changesets/changesets) | 2026-10-11T15:56:50Z | pnpm-workspace.yaml, CODEOWNERS, CI/publish — Use only for publishable independently versioned packages. | Not claimed |
| [vitejs/vite](https://github.com/vitejs/vite) | 2026-10-14T03:58:28Z | pnpm-workspace.yaml, CONTRIBUTING.md, PR template, CI — Fits separate static TS and React apps. | Not claimed |
| [biomejs/biome](https://github.com/biomejs/biome) | 2026-10-14T05:56:37Z | pnpm-workspace.yaml, CODEOWNERS, PR template, PR workflows — Keep lint/format feedback fast and separate. | Not claimed |
| [eslint/eslint](https://github.com/eslint/eslint) | 2026-10-14T05:32:31Z | CONTRIBUTING.md, CODEOWNERS, PR template, CI — Small governance artifacts work without a monorepo runner. | Not claimed |
| [vitest-dev/vitest](https://github.com/vitest-dev/vitest) | 2026-10-13T19:50:12Z | pnpm-workspace.yaml, CONTRIBUTING.md, PR template, CI — Keep normal CI distinct from ecosystem/release tasks. | Not claimed |
| [honojs/hono](https://github.com/honojs/hono) | 2026-10-13T08:18:13Z | pnpm-workspace.yaml, core CI, adapter CI — Deployment-target checks can be isolated. | Not claimed |
| [prisma/orm](https://github.com/prisma/orm) | 2026-10-14T06:04:40Z | pnpm-workspace.yaml, turbo.json, CODEOWNERS, CI/integration — Keep orchestration separate from integration tests; use plain SQL here. | Not claimed |
| [trpc/trpc](https://github.com/trpc/trpc) | 2026-10-11T22:16:15Z | pnpm-workspace.yaml, turbo.json, CODEOWNERS, lint/release — One root works for shared contracts. | Not claimed |
| [supabase/supabase](https://github.com/supabase/supabase) | 2026-10-14T06:10:21Z | pnpm-workspace.yaml, CODEOWNERS, typecheck, PR validation — Retain a dedicated typecheck lane. | Not claimed |
| [calcom/cal.diy](https://github.com/calcom/cal.diy) | 2026-09-26T07:48:40Z | turbo.json, CODEOWNERS, PR template, migration/typecheck workflows — Make schema checks explicit. | Not claimed |
| [directus/directus](https://github.com/directus/directus) | 2026-10-13T09:37:13Z | pnpm-workspace.yaml, CODEOWNERS, changeset/check/e2e workflows — Add release/preview automation only when needed. | Not claimed |
| [strapi/strapi](https://github.com/strapi/strapi) | 2026-10-14T05:47:25Z | nx.json, CONTRIBUTING.md, PR template, checks/tests — Avoid orchestration before scale demands it. | Not claimed |
| [medusajs/medusa](https://github.com/medusajs/medusa) | 2026-10-13T09:00:51Z | turbo.json, CONTRIBUTING.md, database test workflow — Give database behavior a dedicated CI step. | Not claimed |
| [payloadcms/payload](https://github.com/payloadcms/payload) | 2026-10-14T04:19:09Z | pnpm-workspace.yaml, turbo.json, CODEOWNERS, PR template — Root ownership plus one main workflow is enough initially. | Not claimed |
| [redwoodjs/graphql](https://github.com/redwoodjs/graphql) | 2026-10-05T15:25:26Z | nx.json, CONTRIBUTING.md, simple CI workflow — Keep simple CI named and remove superseded automation. | Not claimed |
| [n8n-io/n8n](https://github.com/n8n-io/n8n) | 2026-10-14T06:15:14Z | pnpm-workspace.yaml, turbo.json, CONTRIBUTING.md, reusable CI quality/unit workflows — Split reusable lanes only after bootstrap. | Not claimed |
| [nestjs/nest](https://github.com/nestjs/nest) | 2026-10-13T21:34:17Z | CONTRIBUTING.md, PR template, security/PR guard workflows — Contributor and PR validation patterns do not require a monorepo tool. | Not claimed |
| [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) | 2026-10-14T05:57:06Z | Wrangler/Workers tooling monorepo — Wrangler/Workers tooling monorepo | Not claimed |
| [cloudflare/workerd](https://github.com/cloudflare/workerd) | 2026-10-14T04:57:56Z | Worker runtime source under src/workerd — Worker runtime source under src/workerd | Not claimed |
| [cloudflare/miniflare](https://github.com/cloudflare/miniflare) | 2025-03-13T11:28:31Z | Local Workers simulator packages — Local Workers simulator packages | Not claimed |
| [cloudflare/agents](https://github.com/cloudflare/agents) | 2026-10-13T17:59:22Z | Workers-oriented packages/agents — Workers-oriented packages/agents | Not claimed |
| [mrdoob/three.js](https://github.com/mrdoob/three.js) | 2026-10-14T03:45:26Z | ESM exports plus unit/E2E test trees — ESM exports plus unit/E2E test trees | Not claimed |
| [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) | 2026-10-14T04:12:14Z | React renderer package monorepo — React renderer package monorepo | Not claimed |
| [pmndrs/drei](https://github.com/pmndrs/drei) | 2026-10-05T19:35:53Z | R3F helper source tree — R3F helper source tree | Not claimed |
| [pmndrs/react-three-rapier](https://github.com/pmndrs/react-three-rapier) | 2026-10-12T05:06:24Z | R3F physics binding packages — R3F physics binding packages | Not claimed |
| [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing) | 2026-10-05T14:53:02Z | Three post-processing source — Three post-processing source | Not claimed |
| [microsoft/playwright](https://github.com/microsoft/playwright) | 2026-10-14T02:57:02Z | Browser automation packages — Browser automation packages | Not claimed |
| [theory/pgtap](https://github.com/theory/pgtap) | 2026-09-27T18:41:26Z | SQL-native Postgres tests — SQL-native Postgres tests | Not claimed |
| [drizzle-team/drizzle-orm](https://github.com/drizzle-team/drizzle-orm) | 2026-10-13T16:41:02Z | Migration tooling beside TS packages — Migration tooling beside TS packages | Not claimed |
| [cloudflare/wrangler-action](https://github.com/cloudflare/wrangler-action) | 2026-09-28T23:23:57Z | Wrangler deployment Action — Wrangler deployment Action | Not claimed |
| [cloudflare/terraform-provider-cloudflare](https://github.com/cloudflare/terraform-provider-cloudflare) | 2026-10-13T18:45:20Z | Cloudflare IaC provider — Cloudflare IaC provider | Not claimed |
| [pulumi/pulumi](https://github.com/pulumi/pulumi) | 2026-10-14T00:21:00Z | Multi-language IaC SDK — Multi-language IaC SDK | Not claimed |
| [actions/runner](https://github.com/actions/runner) | 2026-10-13T20:15:31Z | Hosted/self-hosted CI runner source — Hosted/self-hosted CI runner source | Not claimed |
| [topoteretes/cognee](https://github.com/topoteretes/cognee) | main 2026-10-13T15:20:39Z | runnable examples split into guides, demos, and cookbooks — runnable examples split into guides, demos, and cookbooks | Not claimed |
| [mem0ai/mem0](https://github.com/mem0ai/mem0) | main 2026-10-12T16:28:27Z | memory API with docs, examples, and integrations — memory API with docs, examples, and integrations | Not claimed |
| [tigerless-labs/agent-memory](https://github.com/tigerless-labs/agent-memory) | main 2026-10-12T15:50:41Z | Markdown source of truth; local index as disposable cache; path-first retrieval — Markdown source of truth; local index as disposable cache; path-first retrieval | Not claimed |
| [microsoft/semantic-kernel](https://github.com/microsoft/semantic-kernel) | main 2026-10-13T15:03:40Z | multi-language packages, docs, examples — multi-language packages, docs, examples | Not claimed |
| [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) | main 2026-10-14T00:47:19Z | library/docs/examples boundary and explicit graph state — library/docs/examples boundary and explicit graph state | Not claimed |
| [langchain-ai/langchain](https://github.com/langchain-ai/langchain) | master 2026-10-13T13:30:57Z | monorepo libraries, docs, templates, integrations — monorepo libraries, docs, templates, integrations | Not claimed |
| [run-llama/llama_index](https://github.com/run-llama/llama_index) | main 2026-10-12T19:28:17Z | core, integrations, docs, examples — core, integrations, docs, examples | Not claimed |
| [deepset-ai/haystack](https://github.com/deepset-ai/haystack) | main 2026-10-14T06:07:00Z | components/pipelines with docs and tests — components/pipelines with docs and tests | Not claimed |
| [danswer-ai/danswer](https://github.com/danswer-ai/danswer) | main 2026-10-14T02:30:10Z | backend/web/deployment separation and connector docs — backend/web/deployment separation and connector docs | Not claimed |
| [Qodo-AI/pr-agent](https://github.com/Qodo-AI/pr-agent) | main 2026-10-11T20:25:17Z | command/config driven PR review — command/config driven PR review | Not claimed |
| [OpenHands/OpenHands](https://github.com/OpenHands/OpenHands) | main 2026-10-14T04:15:50Z | application, frontend, docs, tests separation — application, frontend, docs, tests separation | Not claimed |
| [microsoft/markitdown](https://github.com/microsoft/markitdown) | main 2026-10-04T03:59:49Z | format conversion packages with tests — format conversion packages with tests | Not claimed |
| [neuml/txtai](https://github.com/neuml/txtai) | master 2026-10-13T17:05:52Z | source, docs, examples, tests for semantic retrieval — source, docs, examples, tests for semantic retrieval | Not claimed |
| [pydantic/pydantic-ai](https://github.com/pydantic/pydantic-ai) | main 2026-10-14T02:05:14Z | typed agent contracts, docs, tests — typed agent contracts, docs, tests | Not claimed |
| [openai/openai-agents-python](https://github.com/openai/openai-agents-python) | main 2026-10-14T00:53:44Z | src/docs/examples/tests separation — src/docs/examples/tests separation | Not claimed |
| [codelion/optillm](https://github.com/codelion/optillm) | main 2026-10-11T16:03:21Z | optional model-routing boundary — optional model-routing boundary | Not claimed |
| [microsoft/graphrag](https://github.com/microsoft/graphrag) | main 2026-10-08T18:24:13Z | documented indexing/query evidence stages — documented indexing/query evidence stages | Not claimed |
| [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) | main 2026-10-14T04:46:47Z | agent/task abstractions with docs/tests — agent/task abstractions with docs/tests | Not claimed |
| [microsoft/agent-framework](https://github.com/microsoft/agent-framework) | main 2026-10-13T14:05:02Z | runtime orchestration separated from application records — runtime orchestration separated from application records | Not claimed |
| [google/adk-python](https://github.com/google/adk-python) | main 2026-10-14T05:40:16Z | source/docs/samples/tests for agent contracts — source/docs/samples/tests for agent contracts | Not claimed |
| [morluto/rea](https://github.com/morluto/rea) | 2026-10-14T06:39:47Z | .agents, AGENTS.md, CONTRIBUTING.md, README.md, docs, package-lock.json, package.json, src — Trend sample inspected for layout only; no additional runtime dependency adopted. | Yes |
| [bilawalsidhu/gods-eye-view](https://github.com/bilawalsidhu/gods-eye-view) | 2026-10-14T02:06:22Z | .agents, CONTRIBUTING.md, README.md, TESTING.md, docs, package-lock.json, package.json, src — Trend sample inspected for layout only; no additional runtime dependency adopted. | Yes |
| [debpalash/VoiceStudio](https://github.com/debpalash/VoiceStudio) | 2026-10-14T06:24:17Z | .agents, AGENTS.md, README.md, README_CN.md, README_JA.md, conftest.py, docs, package.json — Trend sample inspected for layout only; no additional runtime dependency adopted. | Yes |
| [mksglu/context-mode](https://github.com/mksglu/context-mode) | 2026-10-14T01:57:23Z | .agents, CONTRIBUTING.md, README.md, docs, package.json, skills, src, tests — Trend sample inspected for layout only; no additional runtime dependency adopted. | Yes |
| [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design) | 2026-10-13T21:48:36Z | .agents, CONTRIBUTING.md, README.md, docs, skills — Trend sample inspected for layout only; no additional runtime dependency adopted. | Yes |
| [vercel-labs/skills](https://github.com/vercel-labs/skills) | 2026-10-09T17:54:47Z | AGENTS.md, README.md, package.json, skills, src, tests — Trend sample inspected for layout only; no additional runtime dependency adopted. | Yes |
| [lyogavin/airllm](https://github.com/lyogavin/airllm) | 2026-10-14T06:21:01Z | README.md, README_ja.md — Trend sample inspected for layout only; no additional runtime dependency adopted. | Yes |
| [storytold/artcraft](https://github.com/storytold/artcraft) | 2026-10-11T13:47:59Z | AGENTS.md, Cargo.lock, Cargo.toml, README.md, _docs, docs, test_data — Trend sample inspected for layout only; no additional runtime dependency adopted. | Yes |
| [xtool-org/xtool](https://github.com/xtool-org/xtool) | 2026-10-14T04:44:37Z | AGENTS.md, CONTRIBUTING.md, Package.resolved, Package.swift, README.md, Tests, integration-tests — Trend sample inspected for layout only; no additional runtime dependency adopted. | Yes |

## Limits

This breadth meets the requested 50–100 project survey, not 50–100 deep code reviews. Tooling choices were checked against current official documentation and the actual installed versions; licenses and complete supply chains were not audited for every surveyed project. No code from the survey was vendored. Revisit these choices when there is measured pain, not to chase a ranking.
