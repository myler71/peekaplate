# PeekaPlate Agentic CRM Architecture

> **The Loop is the Product.**  
> PeekaPlate is a restaurant menu and measurement platform designed to connect diner menu exposure with verified POS ticket outcomes and controlled menu experiments. This documentation suite defines the **Agentic Architecture connecting Large Language Models (LLMs) to CRM systems** (HubSpot, Salesforce, Attio), enabling autonomous commercial onboarding, performance intelligence reporting, and proactive restaurant support while guaranteeing strict multi-tenant isolation and diner privacy.

---

## Documentation Index

| Document | Purpose | Primary Audience |
| --- | --- | --- |
| **[ADR 0009: Agentic CRM Integration](../adr/0009-agentic-crm-integration.md)** | Canonical Architecture Decision Record defining boundaries, decisions, consequences, and acceptance criteria. | Architects, Tech Leads |
| **[Architecture Specification](architecture-specification.md)** | End-to-end technical specification: multi-agent topology, Model Context Protocol (MCP) servers, LLM gateways, and durable execution. | Backend & Platform Engineers |
| **[CRM Integration Contracts](crm-integration-contracts.md)** | Zod schemas, entity mappings (PostgreSQL $\leftrightarrow$ CRM), and typed MCP tool definitions. | Full-stack & AI Engineers |
| **[Agent Workflows & State Machines](agent-workflows-and-state-machines.md)** | Execution lifecycles, state machine diagrams, and sequence flows for Onboarding, Menu Intelligence, and Support. | Workflow & Integration Leads |
| **[Security, Tenancy & HITL Governance](security-tenancy-and-hitl.md)** | Tenant isolation (ADR 0005), diner privacy shields (ADR 0006), small-cell suppression, and cryptographic approval tokens. | Security & Privacy Engineers |
| **[Developer Implementation Guide](developer-implementation-guide.md)** | Monorepo layout, working TypeScript code (Vercel AI SDK, Hono ingress, HITL generator), test suites, and rollout roadmap. | Contributing Developers |
| **[Interactive Architecture Diagram](architecture-diagram.html)** | Standalone, interactive HTML/SVG architecture diagram delivered via Archify. | All Stakeholders |

---

## System Overview & Topology

```svg
<svg viewBox="0 0 960 480" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
  <!-- Styles using CSS Variables mapped to reader theme -->
  <style>
    .box { fill: var(--surface, #1e293b); stroke: var(--border, #334155); stroke-width: 1.5; rx: 8; }
    .box-accent { fill: var(--surface, #1e293b); stroke: var(--accent, #3b82f6); stroke-width: 2; rx: 8; }
    .box-warn { fill: var(--surface, #1e293b); stroke: var(--warning, #f59e0b); stroke-width: 1.5; rx: 8; }
    .box-sec { fill: var(--surface, #1e293b); stroke: var(--error, #ef4444); stroke-width: 1.5; rx: 8; }
    .box-success { fill: var(--surface, #1e293b); stroke: var(--success, #10b981); stroke-width: 1.5; rx: 8; }
    .text-title { font-size: 13px; font-weight: 700; fill: var(--fg, #f8fafc); }
    .text-sub { font-size: 11px; fill: var(--muted, #94a3b8); }
    .arrow { stroke: var(--border, #64748b); stroke-width: 1.5; marker-end: url(#arrowhead); fill: none; }
    .arrow-accent { stroke: var(--accent, #3b82f6); stroke-width: 2; marker-end: url(#arrowhead-accent); fill: none; }
    .boundary { fill: none; stroke: var(--border, #475569); stroke-width: 1; stroke-dasharray: 4 4; rx: 12; }
    .boundary-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; fill: var(--muted, #94a3b8); }
  </style>

  <defs>
    <marker id="arrowhead" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
      <polygon points="0 0, 7 2.5, 0 5" fill="var(--border, #64748b)" />
    </marker>
    <marker id="arrowhead-accent" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
      <polygon points="0 0, 7 2.5, 0 5" fill="var(--accent, #3b82f6)" />
    </marker>
  </defs>

  <!-- Group 1: External Touchpoints -->
  <rect x="20" y="30" width="180" height="420" class="boundary" />
  <text x="35" y="55" class="boundary-label">External Actors</text>
  
  <rect x="35" y="80" width="150" height="60" class="box" />
  <text x="50" y="105" class="text-title">Restaurant Owners</text>
  <text x="50" y="125" class="text-sub">Console / Email</text>

  <rect x="35" y="210" width="150" height="60" class="box" />
  <text x="50" y="235" class="text-title">Inbound Leads</text>
  <text x="50" y="255" class="text-sub">Web Forms / Menus</text>

  <rect x="35" y="340" width="150" height="60" class="box" />
  <text x="50" y="365" class="text-title">POS & Support</text>
  <text x="50" y="385" class="text-sub">Toast/Square Webhooks</text>

  <!-- Connectors from Actors to Ingress -->
  <path d="M 185 110 L 235 220" class="arrow" />
  <path d="M 185 240 L 235 240" class="arrow" />
  <path d="M 185 370 L 235 260" class="arrow" />

  <!-- Ingress / Edge Gateway -->
  <rect x="240" y="195" width="130" height="90" class="box-warn" />
  <text x="255" y="225" class="text-title">Hono Edge API</text>
  <text x="255" y="245" class="text-sub">• HMAC Verification</text>
  <text x="255" y="265" class="text-sub">• Auth & Rate Limits</text>

  <path d="M 370 240 L 420 240" class="arrow-accent" />

  <!-- Multi-Agent Orchestration Box -->
  <rect x="425" y="30" width="240" height="420" class="boundary" />
  <text x="440" y="55" class="boundary-label">Multi-Agent Engine</text>

  <rect x="445" y="80" width="200" height="65" class="box-accent" />
  <text x="460" y="105" class="text-title">Supervisor / Router</text>
  <text x="460" y="125" class="text-sub">Tenant Binding & Intent</text>

  <rect x="445" y="175" width="200" height="65" class="box" />
  <text x="460" y="200" class="text-title">Onboarding Agent</text>
  <text x="460" y="220" class="text-sub">Menu Parsing & POS Check</text>

  <rect x="445" y="265" width="200" height="65" class="box-success" />
  <text x="460" y="290" class="text-title">Menu Intelligence</text>
  <text x="460" y="310" class="text-sub">Empirical Lift & QBR Notes</text>

  <rect x="445" y="355" width="200" height="65" class="box" />
  <text x="460" y="380" class="text-title">Support Concierge</text>
  <text x="460" y="400" class="text-sub">POS Triage & Staged Fixes</text>

  <!-- Supervisor routing lines -->
  <path d="M 545 145 L 545 175" class="arrow" />
  <path d="M 645 112 Q 675 112 675 297 L 645 297" class="arrow" />
  <path d="M 645 112 Q 695 112 695 387 L 645 387" class="arrow" />

  <!-- Connections to Right Systems -->
  <path d="M 645 207 L 725 150" class="arrow" />
  <path d="M 645 297 L 725 180" class="arrow-accent" />
  <path d="M 645 387 L 725 350" class="arrow" />

  <!-- Group 3: Core Platforms & CRMs -->
  <rect x="715" y="30" width="225" height="420" class="boundary" />
  <text x="730" y="55" class="boundary-label">Integration & Data</text>

  <rect x="735" y="80" width="185" height="110" class="box" />
  <text x="750" y="105" class="text-title">CRM MCP Server</text>
  <text x="750" y="125" class="text-sub">• HubSpot / Salesforce</text>
  <text x="750" y="145" class="text-sub">• Companies & Deals</text>
  <text x="750" y="165" class="text-sub">• Timeline Engagements</text>

  <rect x="735" y="220" width="185" height="100" class="box-sec" />
  <text x="750" y="245" class="text-title">HITL Staging Engine</text>
  <text x="750" y="265" class="text-sub">• HMAC Approval Tokens</text>
  <text x="750" y="285" class="text-sub">• 48h Expiry / Single Use</text>
  <text x="750" y="305" class="text-sub">• Staff Sign-off Gate</text>

  <rect x="735" y="345" width="185" height="85" class="box-success" />
  <text x="750" y="370" class="text-title">PeekaPlate Core DB</text>
  <text x="750" y="390" class="text-sub">• Postgres (RLS isolated)</text>
  <text x="750" y="410" class="text-sub">• es_event + outbox</text>
</svg>
```

---

## Core Invariants

1. **Strict Venue Tenancy (ADR 0005):** Every agent turn, MCP query, and CRM update is bound to a single verified `venue_id`. Row-Level Security (`SET LOCAL app.tenant_id`) enforces this at the PostgreSQL layer.
2. **Diner Privacy Guarantee (ADR 0006):** Diners are pseudonymous. Individual browsing sessions, redeem codes, and raw POS ticket payloads are quarantined within PeekaPlate. Only aggregated metrics ($n \ge 10$) are surfaced to LLMs and CRM records.
3. **Staged Mutations for High-Impact Actions:** Autonomous LLMs can read data and draft reports. However, publishing dish revisions, altering menu pricing, or transitioning commercial deal stages to `Closed Won` requires an HMAC-signed approval token verified by an authorized human staff member.
4. **Idempotent Outbox Synchronization (ADR 0002):** PeekaPlate domain events flow through the PostgreSQL transactional outbox. Retries, replays, and network interruptions produce identical CRM outcomes without duplicated timeline notes.
