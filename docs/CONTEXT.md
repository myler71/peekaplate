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
      "summary": "Strict health, staff dish-revision command/result and initial dish-intent schemas. HTTP command authority fields are rejected; ingest and broader diner events remain planned.",
      "paths": [
        "packages/contracts/src/index.ts",
        "packages/contracts/src/index.test.ts"
      ],
      "adrs": [
        "docs/adr/0003-intent-evidence.md"
      ],
      "dependsOn": [],
      "sourceFingerprint": "802e422cbe5d2c067e0933be29976bde9777e35bc2fc8799c6e7feefa2952725"
    },
    {
      "id": "diner",
      "status": "foundation",
      "summary": "Static TypeScript/Vite shell usable without JavaScript. The supplied prototype is confirmed as latest design progress; shared Figma/tokens and flows are separately tracked, not implemented here. Build checks initial JS gzip budget and renderer boundaries. Viewer, analytics and device performance remain planned.",
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
      "sourceFingerprint": "c53513cb5494ecdb2e7da3a001ae30bf6a2decdabaf2e11d7b80a992a427de07"
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
      "summary": "Hono Worker verifies configured staff JWTs and current restaurant membership, then executes atomic dish revisions under a restricted database role. Staging API uses the Supabase issuer and uncached Hyperdrive. Bounded hosted tests passed genuine login, authorized writes, retries/concurrency, cross-restaurant denial and membership revocation; remote probes verified transaction-context reset and rollback. JWT logout revocation is bounded by expiry, not immediate. No ingestion or publication endpoint.",
      "paths": [
        "backend/src/index.ts",
        "backend/src/index.test.ts",
        "backend/wrangler.jsonc",
        "backend/src/auth.ts",
        "backend/src/auth.test.ts",
        "backend/src/dish-command.ts",
        "backend/src/dish-command.test.ts",
        "backend/src/dish.integration.ts",
        "backend/local.mjs",
        "backend/local.test.mjs",
        "backend/package.json"
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
      "sourceFingerprint": "3919fa1e39fd43702f4ea6ccecef4804c79d0347b74ad89d113b8e29cdb7c13d"
    },
    {
      "id": "database",
      "status": "foundation",
      "summary": "Private Postgres venue/event/command/outbox, actor-scoped memberships and tenant-scoped dish projections. Runtime grants cannot modify membership; share locks serialize revocation. Forward migration validates safe existing runtime-role attributes. Tests cover prior-schema upgrade, RLS, atomic commands and direct connection reuse; managed-provider role/pool verification remains required.",
      "paths": [
        "migrations/202610130001_foundation.sql",
        "tests/db/foundation.sql",
        "tests/db/Dockerfile",
        "scripts/test-db.mjs",
        "scripts/test-db.test.mjs",
        "migrations/20261014210000_staff_commands.sql",
        "tests/db/staff.sql"
      ],
      "adrs": [
        "docs/adr/0002-selective-event-sourcing.md",
        "docs/adr/0005-tenancy-and-privacy.md"
      ],
      "dependsOn": [],
      "sourceFingerprint": "59f97389cbaa95e02e355b4aaad030f9decd1701006f69fc09d83efcecbe487e"
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
      "sourceFingerprint": "b2504bcecd4c5e6a3656b827ee05529bdfb831b6b4b810abaa3723b783c011f0"
    },
    {
      "id": "delivery",
      "status": "foundation",
      "summary": "Main supplies both environments under ADR 0012. API and both Pages shells are deployed to staging from bb56cef. CI, live smoke checks and bounded hosted staff-command acceptance passed, including genuine Supabase login, retries/concurrency, cross-restaurant denial, membership revocation and remote rollback/context-reset probes. Logout blocks refresh but issued JWTs remain valid until expiry. Login UI and pilot/load/recovery checks remain pending; production is unconfigured. Existing R2 staging assets are private and unbound. Actions remains gated; private GitHub Free controls remain manual.",
      "paths": [
        "README.md",
        "SECURITY.md",
        "docs/team_guide.md",
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
        "docs/verification.md",
        "vitest.db.config.ts",
        ".github/main-ruleset.json",
        ".github/develop-ruleset.json",
        "docs/repository-migration.md",
        "docs/adr/0010-canonical-repository-and-release-branches.md",
        "docs/adr/README.md",
        "docs/adr/0011-staging-environment-branch.md",
        "docs/adr/0012-main-environment-promotion.md"
      ],
      "adrs": [
        "docs/adr/0007-delivery-and-recovery.md",
        "docs/adr/0012-main-environment-promotion.md"
      ],
      "dependsOn": [
        "diner",
        "console",
        "backend"
      ],
      "sourceFingerprint": "15e7a430689ddc3f634960808b3fd0feffb2a492646d52b0d75fc3c767288263"
    },
    {
      "id": "agents",
      "status": "implemented",
      "summary": "Paired Claude/Codex review roles share an evidence/JSON review contract; repo-guide returns task briefs and task-builder returns implementation handoffs. Five bounded behavior cases met expectations after correcting and retesting builder ownership/verification instructions. Native role discovery and tool enforcement remain unverified due to client/environment limits. Builders hand off dependencies outside ownership and source fingerprint updates. Prompt parity and these cases do not prove general model accuracy.",
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
      "sourceFingerprint": "615c2bdb3e4c90550c42f3723804c7f69b2bcd6669f3ad97ad22f5174263e235"
    }
  ],
  "handoffs": [
    {
      "summary": "PR #10 merged at bb56cef and API/Pages shells were deployed from that main revision. Hosted tests passed genuine Supabase login, atomic writes, retries/concurrency, cross-restaurant denial and membership revocation. Remote Hyperdrive probes passed context reset and rollback after an injected outbox failure. Logout rejected refresh but accepted the existing JWT until membership removal. Test membership was removed and ephemeral harnesses stopped. R2 staging is private; no paid upgrade or production deployment.",
      "modules": [
        "delivery",
        "backend"
      ],
      "next": "Implement staff login UI and review/approval/immutable publication before diner exposure and ingestion. Design, manual assets and event-contract review can proceed in parallel. Before a real pilot, resolve session-lifetime policy, representative latency/load, recovery and cost/incident ownership. Production needs separate resources and release approval."
    },
    {
      "summary": "Updated deployment selection to main for both environments per the maintainer's explicit instruction. Configured verified non-secret staging account, issuer and Hyperdrive bindings. Provider audit found existing Supabase migrations, forced RLS, restricted staging login, an ES256 public key and uncached Hyperdrive; no duplicate database branch was created. Hosted request behavior remains unverified.",
      "modules": [
        "delivery",
        "backend"
      ],
      "next": "Review and test the staging configuration, run hosted identity and tenant-isolation checks, and record deployment evidence. Production requires separate resources and human release approval for the same tested main SHA."
    },
    {
      "summary": "Aligned staging to application history through PR #5 and corrected manual deployment selection from develop to staging, including CI push coverage and release documentation. Provider inspection confirmed no Hyperdrive, Pages project or staging Worker; D1 resources do not replace PostgreSQL.",
      "modules": [
        "delivery"
      ],
      "next": "Configure the isolated staging Supabase/auth/Hyperdrive and frontend/API connections, supply scoped GitHub deployment credentials, then verify the deployed staging flow before activation or production promotion."
    },
    {
      "summary": "Prepared history-preserving core import, marketing split, develop CI, PR 13-derived ruleset proposals and disabled staging deployment gate. Reconciled all eight later source commits through b40e3ca, retaining their history and five updated planning links. Application runtime and backend bindings are unchanged. Owner chooses private GitHub Free; branch rules remain inactive and manual PR/CI gates apply.",
      "modules": [
        "delivery"
      ],
      "next": "Obtain independent human review; reconcile open source PRs and establish provider parity before release or archival. Apply manual PR/CI gates because private branch enforcement is unavailable on the selected free plan."
    },
    {
      "summary": "Recovered Windows Docker after checksummed offline disk backups and an official Desktop 4.95 upgrade. Real testing exposed a pnpm.mjs launcher rejection; the DB harness now invokes installed Vitest directly, with a failing-then-passing launcher regression. All 43 SQL assertions, 13 Worker/Postgres cases and local startup/demo/cleanup passed on Windows. Contributor Claude/Codex setup is independently owned.",
      "modules": [
        "database",
        "delivery"
      ],
      "next": "Finish exact-head review and CI for the local recovery PR. Keep the GitHub protection policy in a separate owner-action PR; stop before Cloudflare/Supabase integration until protected credentials are supplied."
    },
    {
      "summary": "Corrected the design hyperlink in docs/team_guide.md to the owner-supplied Figma Make diner-menu V1 URL. No design or runtime behavior changed.",
      "modules": [
        "delivery"
      ],
      "next": "Use the linked Figma Make diner-menu V1 as the referenced design handoff."
    },
    {
      "summary": "Updated the final team_guide plan from the dated Team Interests & Responsibilities document. Proposed bounded contributions and explicit handoffs, distinguished preferences from confirmed assignments, and kept reported capacity and unfilled engineering work visible. Existing delivery dependencies and runtime behavior are unchanged.",
      "modules": [
        "delivery"
      ],
      "next": "Confirm each selected task and current availability with its contributor, record the agreement in ClickUp, then follow the existing publication/exposure/linkage prerequisites and protected cloud-access checkpoint."
    },
    {
      "summary": "Rewrote team_guide around a plain-language dish example, two event types and a function/line-linked code walkthrough. File, task and test inventories are expandable references; the final artifact-aligned plan separates parallel preparation from integration prerequisites. Includes 24 ClickUp tasks, seven scope subtasks and current design progress, distinct from implemented code. PR 9 merged at 413be96 with successful main CI. No runtime or external board/chat changes.",
      "modules": [
        "delivery",
        "diner"
      ],
      "next": "Confirm the provider decision and sprint scope with linked deliverables, reconcile the completed approval ticket with missing approval/publication code, recover local Docker and stop at the protected cloud-credential checkpoint before hosted integration."
    },
    {
      "summary": "Added a plain-language team guide covering the product, current local command flow, every tracked file, verification, research and agent limits, and ordered next steps. Corrected the stale health-only security overview. Runtime behavior is unchanged.",
      "modules": [
        "delivery"
      ],
      "next": "Complete documentation review and exact-head CI, merge PR 9 under the owner instruction, then resolve local Docker readiness and the real Supabase/Hyperdrive credential-bound checks."
    },
    {
      "summary": "Implemented the local PR 1 staff/dish command slice: strict contracts, signed JWT verification, current membership authorization, atomic events/projection/receipt/outbox, effect-free replay and local Worker/Postgres tooling. Cloud provisioning and live-provider checks remain explicitly blocked on credentials; no cloud resources created.",
      "modules": [
        "contracts",
        "backend",
        "database",
        "delivery"
      ],
      "next": "PR 9 has passing Linux CI for 43 SQL assertions, 13 Worker/Postgres integration tests, the local CLI flow and 4 browser checks, plus 35 unit and 20 script tests. Two independent review lanes closed their findings. Obtain human review on the current head. Windows Docker still needs restart/readiness verification; real Supabase identity, provider roles and Hyperdrive pooling are the next credential boundary."
    }
  ]
}
```
