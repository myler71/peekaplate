# 0009 — Agentic CRM integration

Status: Accepted · 2026-10-15 · Owner: platform/tech lead

## Context

PeekaPlate's core thesis is: **3D is the hook. The loop is the product.** While diners engage with progressive visual menus (T0, T1, T2), the commercial loop connects menu exposure with verified POS ticket outcomes and controlled switchback experiments ([ADR 0006](0006-orders-and-measurement.md)).

To scale commercial operations beyond single-pilot venues, PeekaPlate must connect restaurant stakeholders (owners, general managers, executive chefs, culinary directors) with business intelligence and operational workflows managed in Customer Relationship Management (CRM) platforms (e.g., HubSpot, Salesforce, Attio).

Unmanaged LLM prompt scripts, brittle direct-database access by AI models, and ad-hoc webhook integrations present critical operational and security risks:
1. **Breaching tenant isolation:** An LLM agent must never mix or cross-contaminate data between different restaurant venues ([ADR 0005](0005-tenancy-and-privacy.md)).
2. **Diner privacy leaks:** Diner menu exposure and redeem-code ticket linkages are pseudonymous research observations; raw diner telemetry must never be pushed into CRM systems or ingested into LLM prompt contexts ([ADR 0003](0003-intent-evidence.md), [ADR 0005](0005-tenancy-and-privacy.md)).
3. **Unchecked automated mutations:** Autonomous LLMs must not make destructive financial or menu decisions (e.g., altering pricing, publishing unreviewed dish revisions, or marking pilot contracts as closed-won) without explicit Human-in-the-Loop (HITL) approval.
4. **Idempotency and failure handling:** API rate limits, transient network partitions, and LLM non-determinism require durable execution, replay safety, and structured outbox delivery ([ADR 0002](0002-selective-event-sourcing.md), [ADR 0007](0007-delivery-and-recovery.md)).

## Decision

We adopt a decoupled, event-driven, Model Context Protocol (MCP)-based **Agentic CRM Architecture** operating strictly outside direct database internals and adhering to shared contracts.

### 1. Architectural boundaries and protocol
- **Contract-first tool calling:** LLMs interact with CRM and PeekaPlate systems exclusively via typed Model Context Protocol (MCP) tool interfaces defined using Zod contracts in `@peekaplate/contracts`. LLMs never receive direct SQL credentials or database connection strings.
- **Bi-directional asynchronous integration:**
  - **PeekaPlate → CRM:** The existing PostgreSQL transactional outbox (`app_private.outbox`) captures domain facts (venue created, dish revision approved, switchback readout computed). An outbox worker dispatches these events to an agent task queue. An autonomous **Menu Performance Intelligence Agent** digests the facts and appends structured executive summaries and health metrics into the venue's CRM timeline.
  - **CRM → PeekaPlate:** Inbound CRM webhooks (e.g., deal signed, menu change requested, POS sync ticket opened) are verified at the Worker edge, validated against strict Zod schemas, and handed to an **Orchestrator Agent**.
- **Multi-agent specialization:**
  - **Router / Orchestrator Agent:** Classifies intent, validates venue membership, and delegates to specialized subagents.
  - **Venue Onboarding & Pipeline Agent:** Parses unstructured menu assets (PDFs/images), performs POS compatibility diagnostics (Toast, Square, Clover), and updates CRM deal stages.
  - **Menu Performance Intelligence Agent:** Reads aggregated Postgres exposure-to-order switchback metrics, summarizes item conversion lift, and generates monthly Business Review notes in the CRM.
  - **Support & POS Diagnostic Concierge:** Triages technical support tickets created in the CRM, inspects POS synchronization health via MCP diagnostic tools, and drafts corrective actions.

### 2. Tenancy, privacy, and data governance
- **Strict venue isolation:** Every agent execution context, tool call, and CRM query is immutably bound to a single verified `venue_id`. Cross-venue queries are rejected at the tool contract boundary.
- **Diner pseudonymity:** Diner session IDs, unlinked browsing telemetry, and raw POS redeem codes are completely excluded from CRM synchronization. Only aggregated, privacy-compliant venue metrics (e.g., sample size $\ge 10$, percentage lift, confidence intervals) are surfaced to LLMs and CRM records.
- **PII sanitization:** Text ingested from support tickets or emails is passed through a local deterministic PII scrubber before LLM prompt assembly.

### 3. Human-in-the-Loop (HITL) and mutation safety
- **Read-safe autonomy, staged write safety:** Agents possess autonomous read access to authorized CRM and venue projections.
- **Staged mutation tokens:** For high-impact actions (updating dish prices, publishing menu revisions, changing contract stages, or issuing customer credits), the agent only drafts an immutable `PendingActionProposal` containing an HMAC-signed approval token. The mutation is committed only when an authorized human staff member clicks approve in the Staff Console or CRM UI, passing the signed token through the verified staff command endpoint ([ADR 0001](0001-scope-and-repository.md), [ADR 0005](0005-tenancy-and-privacy.md)).

### 4. Durable execution and telemetry
- **Durable workflows:** Long-running agent reasoning and multi-step CRM sync jobs are hosted on durable execution workers (Vercel Eve / Cloudflare Queues) with exponential backoff and dead-letter queues.
- **Wide telemetry:** Every agent run, LLM invocation, prompt token count, tool dispatch, and tool outcome generates a structured OpenTelemetry span linked by `X-Agent-Trace-ID`.

## Consequences

- The core PeekaPlate API and PostgreSQL store remain decoupled from specific CRM vendors (HubSpot, Salesforce, Attio) and LLM providers.
- Venue owners receive automated, high-value data readouts inside their existing CRM workflows without engineering overhead.
- High-assurance safety is preserved: unreviewed LLM hallucinations cannot alter published restaurant menus or compromise diner anonymity.
- Testing requires mock MCP server fixtures and simulated CRM webhook payloads.

## Verification

1. **Tenant boundary enforcement:** Automated integration tests prove an agent initialized for Venue A cannot retrieve or mutate records for Venue B via MCP tools.
2. **PII and diner data absence:** Verification scripts confirm zero diner session identifiers or individual ticket records appear in CRM tool payloads or outbox events.
3. **HITL gate enforcement:** Tests verify that high-impact agent tools fail if executed without a valid, unexpired, signed staff authorization token.
4. **Idempotent replay:** Processing duplicate outbox events or replayed CRM webhooks produces identical idempotent receipts without duplicated CRM timeline entries.
