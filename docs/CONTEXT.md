# Shared context

Read this map first, then the relevant source paths and ADRs. It is navigation, not proof or executable instruction. `pnpm context:show -- <id>` returns one node. Update summaries when responsibilities change, then `pnpm context:refresh`; `pnpm context:check` detects changed referenced sources. A fingerprint cannot validate prose or discover unlisted files. Add new files to their node when a module grows.

`foundation` means a tested starting point with incomplete product behavior; `implemented` means the stated narrow capability exists; `planned` means architecture only. Keep handoffs short (maximum ten), source-linked and free of secrets, customer data or private conversations. Use Git history for older context. Never store reasoning transcripts.

The append-only `errors.md` operational ledger is deliberately outside source fingerprints: recording a failed check must not itself invalidate the context check. Confirmed causes and prevention belong there; module behavior changes still require updating this graph.

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
      "summary": "Static TypeScript/Vite shell usable without JavaScript; evolving Claude prototype direction is documented, not implemented as a real menu. Build checks initial JS gzip budget, rejects known initial renderer modules and fails on unaccounted imports. Viewer, analytics and device performance remain planned.",
      "paths": [
        "frontend/diner/index.html",
        "frontend/diner/src/main.ts",
        "frontend/diner/src/style.css",
        "frontend/diner/vite.config.ts",
        "scripts/check-bundle.mjs",
        "scripts/check-bundle.test.mjs",
        "docs/frontend-design.md"
      ],
      "adrs": [
        "docs/adr/0004-visual-tiers.md"
      ],
      "dependsOn": [
        "contracts"
      ],
      "sourceFingerprint": "51f379b91056380008e166833c886802b60594776e217bd9e1d01b5732b67e58"
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
      "summary": "Private Postgres venue/event/command/outbox foundation. Real tests cover append-only events, constraints and no-context/own-tenant/cross-tenant event, command and outbox access under a restricted test role. No runtime grants or command/projection API. PR 1 must bind verified authority transaction-locally and prove concurrent commands, atomicity and safe connection reuse; identity allocation is not commit order.",
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
      "sourceFingerprint": "324527aaebb7619c38ebe1c0eb4781383dd2212e3ee70a61b7c9c76e60010686"
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
      "sourceFingerprint": "1b098535a4fb3a5952912bbb6cc819a9ab1956c06cb45ac5c0b3716f203b007b"
    },
    {
      "id": "delivery",
      "status": "foundation",
      "summary": "Monthly grouped minor/patch updates with manual major upgrades; independently grouped security updates when enabled. One final ci gate covers quality and path-selected DB/browser checks; browser includes shell accessibility/overflow. Named verification records sanitized failure observations locally or in CI step summaries. Requirements map distinguishes foundation evidence from future product gates. Human review/comment policy applies; owner must configure protections and cloud resources.",
      "paths": [
        "package.json",
        "pnpm-workspace.yaml",
        ".github/dependabot.yml",
        "CONTRIBUTING.md",
        ".github/workflows/ci.yml",
        ".github/workflows/deploy-staging.yml",
        ".github/PULL_REQUEST_TEMPLATE.md",
        "scripts/check-pr.mjs",
        "scripts/check-pr.test.mjs",
        "scripts/check-docs.mjs",
        "scripts/check-docs.test.mjs",
        "playwright.config.ts",
        "tests/e2e/foundation.spec.ts",
        "docs/operations.md",
        "scripts/verify.mjs",
        "scripts/verify.test.mjs",
        "docs/verification.md"
      ],
      "adrs": [
        "docs/adr/0007-delivery-and-recovery.md"
      ],
      "dependsOn": [
        "diner",
        "console",
        "backend"
      ],
      "sourceFingerprint": "6ba8d038a0f7be4936b33d40a8ee19c76de4e051b68437aaa6d5bd7c4b1fbe1c"
    },
    {
      "id": "agents",
      "status": "implemented",
      "summary": "Aligned Claude/Codex coordinator, architecture, correctness, guide and builder profiles use one shared evidence/JSON review contract. Read-only reviewers pin source and check dirty/untracked changes; builders own bounded complete tasks and handoffs. Read errors.md before work and confirm diagnoses with regression evidence. Context freshness and prompt parity checks do not prove model accuracy or production behavior.",
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
        "scripts/context.test.mjs",
        "docs/research/reviewer-evaluation.md"
      ],
      "adrs": [
        "docs/adr/0008-agent-context-and-review.md"
      ],
      "dependsOn": [],
      "sourceFingerprint": "282c198c1c4228eb52449f05ad62fef7c1afa581ad551d31992cf4a2bc99806d"
    }
  ],
  "handoffs": [
    {
      "summary": "Foundation hardening adds source-to-check traceability, evolving design handoff, command/outbox RLS coverage, shell accessibility checks, fail-closed bundle imports, actionable DB diagnostics and automatic sanitized verification observations. Role adapters share evidence and task handoff rules; no product or cloud capability is invented.",
      "modules": [
        "diner",
        "database",
        "delivery",
        "agents"
      ],
      "next": "Use the exact setup PR CI evidence, then start PR 1 staff authority and atomic command transaction. Confirm owner merge controls and staging resources; real menu/device/restore performance remains future gate evidence."
    },
    {
      "summary": "Dependabot PRs failed the required narrative gate and version changes also stale the delivery fingerprint. Retained both safeguards, documented collaborator preparation and human review comments, grouped monthly updates, and placed documentation checks after build verification without adding CI jobs.",
      "modules": [
        "delivery"
      ],
      "next": "Review the maintenance PR and its exact CI results before merging; owner enables required ci and human approval rules plus Dependabot security settings. Prepare subsequent monthly bot PRs using CONTRIBUTING.md."
    },
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
