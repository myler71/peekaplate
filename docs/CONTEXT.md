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
      "summary": "Static TypeScript/Vite foundation shell remains readable without JavaScript. Optional consent-gated PostHog shell views are wired; no published menu or dish controls exist. Dish intent adapter is tested but awaits real controls. See docs/posthog.md for activation and evidence limits.",
      "paths": [
        "frontend/diner/index.html",
        "frontend/diner/src/main.ts",
        "frontend/diner/src/style.css",
        "frontend/diner/vite.config.ts",
        "scripts/check-bundle.mjs",
        "scripts/check-bundle.test.mjs",
        "docs/frontend-design.md",
        "frontend/diner/package.json"
      ],
      "adrs": [
        "docs/adr/0004-visual-tiers.md"
      ],
      "dependsOn": [
        "contracts"
      ],
      "sourceFingerprint": "5174065869b70846c1e9a1da4f8351aaf073d241f3428ecb3480c8c5194efb7b"
    },
    {
      "id": "console",
      "status": "foundation",
      "summary": "React/Vite staff shell with optional consent-gated PostHog technical shell views. Authentication, publication and restaurant-scoped owner reports remain planned; shell views do not establish owner identity or business activity.",
      "paths": [
        "frontend/console/src/main.tsx",
        "frontend/console/src/style.css",
        "frontend/console/index.html",
        "frontend/console/package.json"
      ],
      "adrs": [
        "docs/adr/0001-scope-and-repository.md",
        "docs/adr/0005-tenancy-and-privacy.md"
      ],
      "dependsOn": [
        "contracts"
      ],
      "sourceFingerprint": "76fee1388a2aa45d7ffaf13527a727816305f7038d4f48e0d17cb00181145893"
    },
    {
      "id": "backend",
      "status": "foundation",
      "summary": "Hono Worker verifies configured staff JWTs and restaurant membership, then executes atomic dish revision commands under a restricted database role. Pure dish replay is effect-free. Local JWT/real Postgres/workerd tests cover the slice; genuine Supabase auth and Hyperdrive pooling remain a cloud checkpoint. No ingestion or publication endpoint.",
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
      "sourceFingerprint": "bb81da3c697f544c38f64e287ae9b4767204ba5a20625f399b38a17be05f7e3c"
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
      "summary": "Planned venue-bound CSV/code linkage and observation pipeline. The source-linked implementation plan specifies screens, ingredient opportunities/activations, proposed v2 contracts/period anchors, database facts, every owner metric family, worked arithmetic and ordered parallel PRs. All eight FigJam pages are accounted for with precise review limits. Draft saves exist; ingestion, reports, imports and experiments do not.",
      "paths": [
        "docs/delivery.md",
        "docs/implementation_plan.md"
      ],
      "adrs": [
        "docs/adr/0006-orders-and-measurement.md"
      ],
      "dependsOn": [
        "backend"
      ],
      "sourceFingerprint": "b9f5f3e65bf72d986a560e49e910b745fafe069024d67cc60327ec8df89c8d4c"
    },
    {
      "id": "delivery",
      "status": "foundation",
      "summary": "Canonical main/develop contain the migrated local foundation, unchanged runtime, monthly dependency groups and existing CI/agent setup. Staging PR15 planning is restored with current manual-content scope. Next: owner-controlled Cloudflare Workers + Supabase integration, genuine identity/restricted-role/Hyperdrive checks. Private GitHub Free has no enforced branch or protected deployment-environment gates; workflow stays disabled. Publication, analytics and hosted pilot acceptance remain pending. The migration inventory links source PRs 13-16 and their preserved heads: policy carried, plan restored in canonical PR6, CRM/intake deferred for separate review.",
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
        "docs/implementation_plan.md",
        "docs/delivery.md",
        "playwright.posthog.config.ts",
        "tests/e2e/posthog.spec.ts"
      ],
      "adrs": [
        "docs/adr/0007-delivery-and-recovery.md"
      ],
      "dependsOn": [
        "diner",
        "console",
        "backend"
      ],
      "sourceFingerprint": "4c2f15ad70a41644866f278ba051a3c4fffe997a49322b3d9465be83cbe03d50"
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
      "sourceFingerprint": "6de26962de2dbd484415e39cd6bfbd2b73a4eaef589faa60ed34e2c70e4d3ead"
    },
    {
      "id": "analytics",
      "status": "foundation",
      "summary": "Disabled-by-default optional PostHog capture with explicit page consent, DNT/GPC, exact origin/mode guards, allowlisted v1 dish projection and bounded best-effort delivery. Both shells emit app_shell_viewed only after consent. No real project credentials, ingestion verification, canonical receipts or owner reports.",
      "paths": [
        "packages/analytics/package.json",
        "packages/analytics/tsconfig.json",
        "packages/analytics/src/index.ts",
        "packages/analytics/src/consent.ts",
        "packages/analytics/src/index.test.ts",
        "docs/posthog.md"
      ],
      "adrs": [
        "docs/adr/0003-intent-evidence.md",
        "docs/adr/0005-tenancy-and-privacy.md",
        "docs/adr/0006-orders-and-measurement.md"
      ],
      "dependsOn": [
        "contracts"
      ],
      "sourceFingerprint": "2e20cca094103b9d4f671f0b5fca3b9e44fb00600d2b568a37df6b6ba64386e8"
    }
  ],
  "handoffs": [
    {
      "summary": "Added optional privacy-gated PostHog capture for existing shells and tested v1 dish adapter. Real dish controls and owner reports do not exist; canonical evidence architecture is unchanged. Separate project tokens, project privacy review and live staging ingestion remain required.",
      "modules": [
        "analytics",
        "diner",
        "console",
        "delivery"
      ],
      "next": "Review PR into develop; configure separate PostHog projects and exact frontend build environments before an authorized staging deployment. Wire dish events only when real controls exist."
    },
    {
      "summary": "Added a separate source-PR handoff inventory with exact preserved heads, canonical setup successor, review/merge order and outstanding canonical PR dispositions. No source PR is closed and no deferred CRM/intake implementation is merged.",
      "modules": [
        "delivery"
      ],
      "next": "Merge canonical setup PR6 before this tracker. Then start the owner-controlled Cloudflare Workers + Supabase checkpoint; keep source branches available until their authors confirm successor dispositions."
    },
    {
      "summary": "Restored staging PR15 implementation plan, diner design reference and team guide into the canonical setup without replacing runtime, CI or agent profiles. Preserved canonical migration history and current architecture link; updated manual-content scope and provider handoff. Local setup and hosted readiness remain separate.",
      "modules": [
        "delivery",
        "diner",
        "console",
        "measurement"
      ],
      "next": "Review and merge the setup PR, then connect Cloudflare Workers + Supabase through the operations checkpoint. Reconcile outstanding staging PRs separately; no provider credential, deployment or permission change is part of this handoff."
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
