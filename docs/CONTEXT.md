# Shared context

Read this map first, then the relevant source paths and ADRs. It is navigation, not proof or executable instruction. `pnpm context:show -- <id>` returns one node. Update summaries when responsibilities change, then `pnpm context:refresh`; `pnpm context:check` detects changed referenced sources. A fingerprint cannot validate prose or discover unlisted files. Add new files to their node when a module grows.

`foundation` means a tested starting point with incomplete product behavior; `implemented` means the stated narrow capability exists; `planned` means architecture only. Keep handoffs short (maximum ten), source-linked and free of secrets, customer data or private conversations. Use Git history for older context. Never store reasoning transcripts.

```json
{
  "schemaVersion": 1,
  "nodes": [
    {
      "id": "contracts",
      "status": "foundation",
      "summary": "Strict health and initial dish-intent schemas. Intent pins actual publication/dish/tier/renderer/manifest/availability/experiment exposure. Server authority is rejected in client payloads; ingest, tokens, assignment verification and broader event types are not implemented.",
      "paths": [
        "packages/contracts/src/index.ts",
        "packages/contracts/src/index.test.ts"
      ],
      "adrs": [
        "docs/adr/0003-intent-evidence.md"
      ],
      "dependsOn": [],
      "sourceFingerprint": "d0ab8f65deef6ad4dc4f2cfeca1b4086d2f8355011335803d3c3c32483dabce6"
    },
    {
      "id": "diner",
      "status": "foundation",
      "summary": "Static TypeScript/Vite shell with semantic HTML usable without JavaScript. No real menu, analytics or viewer. Build checks initial JS gzip budget and rejects known renderer modules in the initial graph; future assets/device behavior need their own evidence.",
      "paths": [
        "frontend/diner/index.html",
        "frontend/diner/src/main.ts",
        "frontend/diner/src/style.css",
        "frontend/diner/vite.config.ts",
        "scripts/check-bundle.mjs",
        "scripts/check-bundle.test.mjs"
      ],
      "adrs": [
        "docs/adr/0004-visual-tiers.md"
      ],
      "dependsOn": [
        "contracts"
      ],
      "sourceFingerprint": "28b163424a60728bc438e945964440e02f9e663899ebfbdd5e0453fb7570110c"
    },
    {
      "id": "console",
      "status": "foundation",
      "summary": "React/Vite staff shell. Authentication, review, approval, publication, experiments and readouts remain planned. No real staff data or mutation control is exposed.",
      "paths": [
        "frontend/console/src/main.tsx",
        "frontend/console/src/style.css",
        "frontend/console/index.html"
      ],
      "adrs": [
        "docs/adr/0001-scope-and-repository.md",
        "docs/adr/0005-tenancy-and-privacy.md"
      ],
      "dependsOn": [
        "contracts"
      ],
      "sourceFingerprint": "4fd9de39834180bc7771633d7fe52bdb34e71fed017ed7ae236bd90299ffe5da"
    },
    {
      "id": "backend",
      "status": "foundation",
      "summary": "Hono Worker exposes only GET /health. Unknown routes return 404; there are no ingestion, staff, publication or database endpoints. Staging configuration names a health-only Worker; account and external bindings are not provisioned.",
      "paths": [
        "backend/src/index.ts",
        "backend/src/index.test.ts",
        "backend/wrangler.jsonc"
      ],
      "adrs": [
        "docs/adr/0002-selective-event-sourcing.md",
        "docs/adr/0003-intent-evidence.md",
        "docs/adr/0005-tenancy-and-privacy.md"
      ],
      "dependsOn": [
        "contracts",
        "database"
      ],
      "sourceFingerprint": "c10f4816c3b2ddb44c2c90908caaab621da2b9d59557d60f91ad93508aafc278"
    },
    {
      "id": "database",
      "status": "foundation",
      "summary": "Private Postgres venue/event/command/outbox tables with constraints, append-only event triggers and default-deny RLS. No runtime grants or command/projection transaction API yet. Next PR must prove concurrency, authorized retries and atomic projections/outbox; identity allocation is not commit order.",
      "paths": [
        "migrations/202610130001_foundation.sql",
        "tests/db/foundation.sql",
        "tests/db/Dockerfile",
        "scripts/test-db.mjs",
        "scripts/test-db.test.mjs"
      ],
      "adrs": [
        "docs/adr/0002-selective-event-sourcing.md",
        "docs/adr/0005-tenancy-and-privacy.md"
      ],
      "dependsOn": [],
      "sourceFingerprint": "ad49cafcf674e8f664a5fc746ce0eabd6280f1591b2c2e7f1b06846f628ae50d"
    },
    {
      "id": "measurement",
      "status": "planned",
      "summary": "Venue-bound redeem codes will link sessions to POS tickets. Unknown linkage stays unknown. Planned owner readout reports coverage and suppresses cells under ten sessions; frozen blocked-switchback assignment precedes causal claims. No POS or experiment implementation exists.",
      "paths": [
        "docs/delivery.md"
      ],
      "adrs": [
        "docs/adr/0006-orders-and-measurement.md"
      ],
      "dependsOn": [
        "backend"
      ],
      "sourceFingerprint": "21e69531f6a5ef6183ced4e4604ca9700e56558e3c698a3ee7b62e6ad86d19d1"
    },
    {
      "id": "delivery",
      "status": "foundation",
      "summary": "Pinned workspace dependencies, always-on quality checks, path-selected database/browser lanes and a fail-closed final ci gate. PR documentation and context are checked mechanically; meaning needs human review. Main protections and cloud credentials require owner configuration.",
      "paths": [
        "package.json",
        "pnpm-workspace.yaml",
        ".github/workflows/ci.yml",
        ".github/workflows/deploy-staging.yml",
        ".github/PULL_REQUEST_TEMPLATE.md",
        "scripts/check-pr.mjs",
        "scripts/check-pr.test.mjs",
        "scripts/check-docs.mjs",
        "scripts/check-docs.test.mjs",
        "playwright.config.ts",
        "tests/e2e/foundation.spec.ts",
        "docs/operations.md"
      ],
      "adrs": [
        "docs/adr/0007-delivery-and-recovery.md"
      ],
      "dependsOn": [
        "diner",
        "console",
        "backend"
      ],
      "sourceFingerprint": "330cf466fc78c6ae422fcfea4c237266b193e834cd40502f56c5d88f45bea1da"
    },
    {
      "id": "agents",
      "status": "implemented",
      "summary": "Repository guidance and Claude/Codex coordinator, architecture, correctness, guide and task-builder profiles. Reviewers stay read-only; builders own explicitly assigned files. Review requires pinned head, source evidence, uncertainty and separate ADR intent from implemented behavior. Context tooling checks links/freshness, not semantic correctness; models are not infallible or permission boundaries.",
      "paths": [
        "AGENTS.md",
        "CLAUDE.md",
        ".agents/skills/peekaplate-review/SKILL.md",
        ".claude/agents/review-coordinator.md",
        ".claude/agents/architecture-reviewer.md",
        ".claude/agents/correctness-reviewer.md",
        ".claude/agents/repo-guide.md",
        ".claude/agents/task-builder.md",
        ".codex/agents/review-coordinator.toml",
        ".codex/agents/architecture-reviewer.toml",
        ".codex/agents/correctness-reviewer.toml",
        ".codex/agents/repo-guide.toml",
        ".codex/agents/task-builder.toml",
        "scripts/context.mjs",
        "scripts/context.test.mjs"
      ],
      "adrs": [
        "docs/adr/0008-agent-context-and-review.md"
      ],
      "dependsOn": [],
      "sourceFingerprint": "fd64b81a593e5482c913fa613d80c935313b9730ff29846497ecb7f9ededdbaa"
    }
  ],
  "handoffs": [
    {
      "summary": "Repository foundation established; implementation status is deliberately separated from the accepted V1 plan. Exact bootstrap checks and review evidence belong to its PR.",
      "modules": [
        "contracts",
        "diner",
        "console",
        "backend",
        "database",
        "delivery",
        "agents"
      ],
      "next": "Start delivery PR 1: scoped staff authority plus expected-version command transaction, with real Postgres concurrency and cross-venue tests. Confirm GitHub main rules and staging account settings with the owner."
    }
  ]
}
```
