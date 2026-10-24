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
      "summary": "Strict health, staff dish-revision command/result and initial dish-intent schemas. HTTP command authority fields are rejected; ingest and broader diner events remain planned. Team analytics query/response schemas enforce bounded dates/results and allowlisted diagnostic fields.",
      "paths": [
        "packages/contracts/src/index.ts",
        "packages/contracts/src/index.test.ts"
      ],
      "adrs": [
        "docs/adr/0003-intent-evidence.md",
        "docs/adr/0015-integration-contracts-and-owner-evidence.md"
      ],
      "dependsOn": [],
      "sourceFingerprint": "17b4bf0b98b5808aa805cf10b4ad7763069bdde6194a2a5614cdeb422f0868e9"
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
      "sourceFingerprint": "277a8be5e4b45ef41eba68d87907024a6aa89c030677e64af388f97f6d5f5221"
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
      "summary": "Hono Worker verifies staff JWTs and restaurant membership for atomic draft revisions. Dated hosted staff identity/isolation/retry/concurrency evidence remains valid. Staging/local-only analytics GET endpoints verify individual GitHub identity and current collaboration; server project, seven-day/100-row bounds and redaction are enforced. Main afe45db deployed through protected run 39907285014; hosted collaborator reads returned 200, invalid/missing credentials 401 and invalid queries 400. Two user-run October 23 outsider checks returned GitHub 200 and Worker 403/403 forbidden. Controlled collaborator removal remains pending; production is untested. No ingestion or publication endpoint; JWT logout revocation remains expiry-bounded.",
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
        "backend/package.json",
        "backend/src/team-analytics.ts",
        "backend/src/team-analytics.test.ts",
        "backend/src/team-auth.ts",
        "backend/src/team-auth.test.ts"
      ],
      "adrs": [
        "docs/adr/0002-selective-event-sourcing.md",
        "docs/adr/0003-intent-evidence.md",
        "docs/adr/0005-tenancy-and-privacy.md",
        "docs/adr/0014-team-analytics-access.md"
      ],
      "dependsOn": [
        "contracts",
        "database"
      ],
      "sourceFingerprint": "92f22213bceebd5fb3a213a5a135dc4ebc35532f191e73ffc157d646f0b8b551"
    },
    {
      "id": "database",
      "status": "foundation",
      "summary": "Private Postgres venue/event/command/outbox, actor-scoped memberships and tenant-scoped projections remain protected by forced RLS. Local tests cover schema upgrade, atomic commands and connection reuse; hosted staff checks are recorded separately. Private PostHog export remains append-only with eight raw copies/four deduplicated synthetic events. October 22 read-only audit confirms migration 20261021130000 and history, sole staging scope 675372, restricted security-definer ownership/execution and denied browser/runtime raw access. Runtime cannot read scope directly; exporter has no application-schema access. Physical hosted pool reuse and restore remain unverified.",
      "paths": [
        "migrations/202610130001_foundation.sql",
        "tests/db/foundation.sql",
        "tests/db/Dockerfile",
        "scripts/test-db.mjs",
        "scripts/test-db.test.mjs",
        "migrations/20261014210000_staff_commands.sql",
        "tests/db/staff.sql",
        "migrations/20261020070000_posthog_exports.sql",
        "tests/db/posthog.sql",
        "migrations/20261021130000_team_analytics.sql",
        "tests/db/team-analytics.sql"
      ],
      "adrs": [
        "docs/adr/0002-selective-event-sourcing.md",
        "docs/adr/0005-tenancy-and-privacy.md",
        "docs/adr/0013-posthog-export-boundary.md",
        "docs/adr/0014-team-analytics-access.md"
      ],
      "dependsOn": [],
      "sourceFingerprint": "fccd1d02035493216fcb1fae4fb672e25ec554da17005a27354ae2a4f975f7f8"
    },
    {
      "id": "measurement",
      "status": "planned",
      "summary": "Venue-bound redeem codes will link sessions to POS tickets. Unknown linkage stays unknown. Planned owner readout reports coverage and suppresses cells under ten sessions; frozen blocked-switchback assignment precedes causal claims. No POS or experiment implementation exists.",
      "paths": [
        "docs/delivery.md",
        "docs/implementation_plan.md"
      ],
      "adrs": [
        "docs/adr/0006-orders-and-measurement.md",
        "docs/adr/0015-integration-contracts-and-owner-evidence.md"
      ],
      "dependsOn": [
        "backend"
      ],
      "sourceFingerprint": "5fc2bb2fddca8d87f6d03aab9cf8e1922e1d921d9c66d2eee027e5cba8fdf853"
    },
    {
      "id": "delivery",
      "status": "foundation",
      "summary": "Main supplies staging and later production under ADR 0012. Protected manual run 39907285014 deployed main afe45db after eligible hemu77 approved vivienk without administrator bypass; flag is true, main-only controls remain and administrator bypass is allowed. Worker version 5922a293-6893-47fd-8bc5-a20f0afd8d0b; 14 hosted HTTP checks and eleven database assertions passed. Restricted uncached Hyperdrive and hourly PostHog export are verified within dated scopes. Token scope/January 20 2027 expiry are operator-confirmed. October 23 user-run evidence closes outsider 403 denial; controlled collaborator removal remains pending. Pages retain their separate PostHog release. R2 is private/unbound; ingestion, product UI, pilot/load/recovery and production remain separate work.",
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
        "docs/adr/0012-main-environment-promotion.md",
        "docs/implementation_plan.md",
        "docs/delivery.md",
        "playwright.posthog.config.ts",
        "tests/e2e/posthog.spec.ts"
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
      "sourceFingerprint": "cbed674dc23d0e1bc81a246bdd5834fcd9cb60b74c7adf752045af320b6d9192"
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
      "summary": "Consented synthetic staging shell capture and restricted hourly PostHog export are verified; dish controls remain unconnected. Repeated exports retained eight raw copies/four deduplicated events. The collaborator-authorized API returns redacted diagnostics, not owner reports. The Node/GitHub CLI checker has progress, timeouts and no token prompt. Two user-run October 23 checks verified a valid outsider identity (200) and both endpoint denials (403 forbidden), including a fresh-clone repeat; sanitized evidence is in operations.md. Controlled collaborator-removal acceptance and production remain untested. Canonical owner facts and reporting remain planned.",
      "paths": [
        "packages/analytics/package.json",
        "packages/analytics/tsconfig.json",
        "packages/analytics/src/index.ts",
        "packages/analytics/src/consent.ts",
        "packages/analytics/src/index.test.ts",
        "docs/posthog.md",
        "docs/posthog-export.md",
        "docs/team-data-access.md",
        "scripts/verify-team-access.mjs",
        "scripts/verify-team-access.test.mjs"
      ],
      "adrs": [
        "docs/adr/0003-intent-evidence.md",
        "docs/adr/0005-tenancy-and-privacy.md",
        "docs/adr/0006-orders-and-measurement.md",
        "docs/adr/0013-posthog-export-boundary.md",
        "docs/adr/0014-team-analytics-access.md",
        "docs/adr/0015-integration-contracts-and-owner-evidence.md"
      ],
      "dependsOn": [
        "contracts"
      ],
      "sourceFingerprint": "1dd5e77257b699965de953a06b67cae41efa432a18b804d92f6e69d68988d8e0"
    },
    {
      "id": "processing",
      "status": "foundation",
      "summary": "Local PDF/image acquisition uses an injectable OCRProvider restricted to validated OCR.space Engine 3-compatible results. Incompatible OCR fails its segment and preserves later native pages. LLM extraction retains needs_review drafts and evidence. Shared Unicode fixtures check spans; combined integration, separate verification and quality acceptance remain pending.",
      "paths": [
        "processing/.gitignore",
        "processing/.python-version",
        "processing/README.md",
        "processing/pyproject.toml",
        "processing/src/peekaplate_processing/__init__.py",
        "processing/src/peekaplate_processing/check_llm.py",
        "processing/src/peekaplate_processing/errors.py",
        "processing/src/peekaplate_processing/extract_menus.py",
        "processing/src/peekaplate_processing/images.py",
        "processing/src/peekaplate_processing/model_cache.py",
        "processing/src/peekaplate_processing/ocr_regions.py",
        "processing/src/peekaplate_processing/ocr_space.py",
        "processing/src/peekaplate_processing/pdf.py",
        "processing/src/peekaplate_processing/run_pipeline.py",
        "processing/src/peekaplate_processing/schemas.py",
        "processing/src/peekaplate_processing/sources.py",
        "processing/src/peekaplate_processing/storage.py",
        "processing/src/peekaplate_processing/workflow.py",
        "processing/tests/fixture_factory.py",
        "processing/tests/test_ocr_regions.py",
        "processing/tests/test_ocr_space.py",
        "processing/tests/test_pdf_images.py",
        "processing/tests/test_schemas.py",
        "processing/tests/test_workflow.py",
        "processing/uv.lock",
        "docs/ocr-delivery.md",
        "processing/tests/fixtures/source-spans.json",
        "processing/tests/test_handoff.py",
        "scripts/processing-handoff.test.mjs",
        "processing/src/peekaplate_processing/ocr.py",
        "processing/tests/test_ocr_provider.py",
        "test-data/README.md"
      ],
      "adrs": [
        "docs/adr/0001-scope-and-repository.md",
        "docs/adr/0005-tenancy-and-privacy.md"
      ],
      "dependsOn": [],
      "sourceFingerprint": "929fb3bbb31657ffe307c3d5040770955f5ecd7d488af3f0ea329ed0bb05f119"
    }
  ],
  "handoffs": [
    {
      "summary": "Validate integer OCREngine=3 before accepting injected OCR text for images and PDFs. Regressions reject incompatible/missing settings and preserve later native pages. Keep the existing evidence schema/default provider. VIS-01 owns error:null to omitted mapping; reported mocked adapter tests still need links and tested commits.",
      "modules": [
        "processing",
        "delivery"
      ],
      "next": "Sai re-review and current-head CI; Teeyansh links isolated integration evidence and covers null/omitted error mapping in VIS-01. Accuracy evaluation and PM acceptance remain open."
    },
    {
      "summary": "Proposed ADR 0015 for S3-ARC-01, revised after Sai's review: owner metrics only from ADR 0003 canonical facts; POST /observations with a Bearer menu token and accepted/retry/rejected receipts (accepted = durable Queue acceptance), terminal rejected items, uncertain sends retried and in-batch duplicates defined; canonical app_private.observation_index/conflict; D1 ten sessions, D6 observation.v2, D7 session-based rates and D8 timing recorded; ingest limits agreed with Zhiliang (25 items/32 KiB, 24 h age, 5 min skew, per-jti 60/min burst 10, HTTP and reason codes, token claims); D3/D4 scope from matrix v0.1d; bounded 400/413 handling; remaining work split into the Save/UI acceptance decision and owned implementation/release prerequisites; owners Zhiliang (ingest), Teeyansh (consumer), Jeffin (migrations/views), Louis (reports). No contract, migration or collector code changed. Final technical review reconciled develop activation prerequisites; the ADR remains Proposed pending Save/UI confirmation.",
      "modules": [
        "contracts",
        "measurement",
        "analytics"
      ],
      "next": "Harshita confirms the Save/UI transitions, persistence, unsave/Undo, unavailable-storage behaviour and any Saved limit; Adam accepts, then record ADR acceptance. Owners deliver the listed contracts, ingest, consumer, migrations/views, report API, protected bindings, menu token, retention/consent and hosted validation through later PRs."
    },
    {
      "summary": "Reconciled main into the PR 27 release branch, preserving October 22 staging controls, verified PostHog export history, team analytics access documentation and both error-ledger histories. Runtime, contracts, migrations and deployment workflow are unchanged from the reviewed develop release. Corrected the team-access activation checklist so migration/history, token permissions and final review/CI are explicit prerequisites to enabling the flag. Final guide cleanup distinguishes the enabled hourly export from the pending team inspection API and links its activation checklist; PR verification metadata is refreshed for the final candidate.",
      "modules": [
        "delivery",
        "analytics"
      ],
      "next": "Review the reconciled PR 27 release after local checks. Read-only hosted audit confirmed migration 20261021130000 is absent; apply and record its forward migration through the database procedure before deployment. Operator OAuth is valid but does not verify GitHub-held tokens. Keep the activation flag off until protected credential/release checks, then deploy reviewed main and run hosted access acceptance."
    },
    {
      "summary": "Recorded the October 22 staging environment settings: exact main branch restriction saved, required reviewers and prevent self-review enabled, administrator bypass allowed, and expected variable/secret names present. Updated stale environment-availability guidance. No secret values, activation flag, workflow code or deployment changed.",
      "modules": [
        "delivery"
      ],
      "next": "Review this documentation PR. Before Actions activation, verify credential permissions, intended staging bindings and the independent approval process; the settings observation is not a successful workflow or deployment test."
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
      "summary": "PRs 14/15 released hosted PostHog consented shell capture at main 2a135fa, verified by live synthetic capture and provider readback. Added private export landing migration, conflict-aware deduplication view and least-privilege tests. pnpm check and test:db pass; technical/security review found no supported defect and guide review corrections are applied. Hosted migration applied with explicit access approval; tables and effective role boundaries verified. Export connection created; first run failed TLS verification and schedule is paused. User reported correction requires project Admin access. No rows transferred; no bypass attempted.",
      "modules": [
        "analytics",
        "database",
        "delivery"
      ],
      "next": "Vivien must correct the connection or grant project Admin access. Complete the connection with the official Supabase CA, verify a bounded export and duplicate-safe retry, then resume schedule. Do not claim transfer success from backfill wrapper completion alone."
    },
    {
      "summary": "PR #33 added the first-party staging denial checker. Harshita then helped run the valid outsider check twice, including from a fresh develop clone: GitHub identity 200 and both routes 403 forbidden. The maintainer supplied sanitized reports at 2026-10-24T05:52:32.802Z and 06:07:16.871Z (October 23 Phoenix). Recorded request IDs and updated README, team guide, access runbook, operations and context; no runtime, credential, grant, migration or deployment changed. Earlier collaborator 200 and invalid-token 401 evidence remains distinct.",
      "modules": [
        "analytics"
      ],
      "next": "Collaborators can continue tickets using their own GitHub identity and the bounded staging API. An authorized operator still needs the separate disposable collaborator-removal test before full hosted access acceptance. Production, real menu ingestion and owner-report delivery remain separate work; do not infer their readiness from this check."
    }
  ]
}
```
