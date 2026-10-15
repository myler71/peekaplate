# Developer Implementation Guide: Agentic CRM Integration

> **Status:** Implementation Guide · **Runtime:** TypeScript / Node 24 / Cloudflare Workers
> 
> This guide provides step-by-step instructions, package layouts, reference TypeScript implementations, and testing strategies for engineers building the Agentic CRM integration into the PeekaPlate monorepo.

---

## 1. Repository Package Structure

The agentic architecture extends the existing monorepo without disrupting core application boundaries:

```text
peekaplate_staging/
├── packages/
│   ├── contracts/                    # Shared Zod schemas
│   │   └── src/
│   │       ├── index.ts              # Core contracts
│   │       └── crm.ts                # NEW: CRM & agent tool schemas
│   └── crm-mcp-server/               # NEW: Standalone MCP Server for CRMs
│       ├── src/
│       │   ├── index.ts              # MCP server entry point (stdio / SSE)
│       │   ├── hubspot-client.ts     # HubSpot REST API adapter
│       │   ├── salesforce-client.ts  # Salesforce REST API adapter
│       │   └── tools/                # Registered MCP tools
│       │       ├── account.ts
│       │       ├── deals.ts
│       │       └── timeline.ts
│       └── package.json
├── backend/
│   ├── src/
│   │   ├── index.ts                  # Hono Workers API
│   │   ├── auth.ts                   # Supabase Auth verifier
│   │   ├── dish-command.ts           # Core dish command transaction
│   │   └── agents/                   # NEW: Multi-Agent Orchestration
│   │       ├── runner.ts             # Vercel AI SDK / Eve Agent Runner
│   │       ├── router.ts             # Supervisor & Intent Classifier
│   │       ├── menu-intelligence.ts  # Performance & QBR Agent
│   │       ├── onboarding.ts         # Lead & Menu Digitizing Agent
│   │       └── hitl.ts               # Staged Mutation Token Generator
│   └── wrangler.jsonc
└── tests/
    └── agents/                       # Integration test suite
        ├── tenant-isolation.test.ts  # Proves cross-venue queries fail
        ├── hitl-tokens.test.ts       # Verifies approval token cryptography
        └── mock-crm-adapter.ts       # In-memory CRM stub for tests
```

---

## 2. Reference Implementation

### 2.1 Implementing the Menu Performance Intelligence Agent
This agent runs as a durable worker job triggered by the PostgreSQL outbox. It leverages Vercel AI SDK Core (`generateText` / `streamText`) with typed tools:

```typescript
// backend/src/agents/menu-intelligence.ts
import { generateText, tool } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import {
  QueryVenueMetricsInputSchema,
  QueryVenueMetricsOutputSchema,
  CrmAppendTimelineNoteInputSchema,
  CrmAppendTimelineNoteOutputSchema,
  CrmGetAccountInputSchema,
  CrmGetAccountOutputSchema
} from '@peekaplate/contracts/crm';

export interface AgentContext {
  venueId: string;
  period: string;
  crmClient: any;
  peekaPlateDb: any;
}

export async function runMenuIntelligenceAgent(context: AgentContext) {
  const { venueId, period, crmClient, peekaPlateDb } = context;

  // 1. Define Typed Tools scoped to this session's venueId
  const tools = {
    queryVenueMetrics: tool({
      description: 'Fetch aggregated dish exposure and linked order metrics. Cells < 10 are suppressed.',
      parameters: QueryVenueMetricsInputSchema,
      execute: async (input) => {
        // Enforce tenant boundary: agent cannot query another venueId
        if (input.venueId !== venueId) {
          throw new Error(`SECURITY_ERROR: Access to venue ${input.venueId} denied in this session.`);
        }
        return await peekaPlateDb.queryVenueMetrics(input);
      },
    }),

    crmGetAccount: tool({
      description: 'Retrieve the CRM Company details associated with this venueId',
      parameters: CrmGetAccountInputSchema,
      execute: async (input) => {
        if (input.venueId !== venueId) {
          throw new Error('SECURITY_ERROR: Venue ID mismatch');
        }
        return await crmClient.getCompanyByVenueId(input.venueId);
      },
    }),

    crmAppendTimelineNote: tool({
      description: 'Post a structured markdown performance briefing to the CRM Company timeline',
      parameters: CrmAppendTimelineNoteInputSchema,
      execute: async (input) => {
        if (input.venueId !== venueId) {
          throw new Error('SECURITY_ERROR: Venue ID mismatch');
        }
        return await crmClient.appendTimelineNote(input);
      },
    }),
  };

  // 2. System Instructions with Strict Guardrails
  const systemPrompt = `
You are the PeekaPlate Menu Intelligence Agent.
Your mission is to analyze empirical menu performance data for venue "${venueId}" for period "${period}" and write an executive briefing into the restaurant's CRM timeline.

OPERATIONAL INVARIANTS:
1. "3D is the hook. The loop is the product." Connect menu visual exposure (T0 photos, T1 cutouts, T2 stages) with POS ticket linkage.
2. Privacy & Suppression: If any dish reports "suppressedDueToLowVolume: true", acknowledge the dish exists but do NOT fabricate or estimate conversion numbers.
3. Be statistically honest: State observed percentage lift, sample volume (n), and directional confidence. Do not claim causal certainty without controlled switchback evidence.
4. Format: Generate clear, structured Markdown with executive bullet points for the restaurant owner.
`;

  // 3. Execute the Autonomous Reasoning & Tool Calling Loop
  const result = await generateText({
    model: anthropic('claude-3-7-sonnet-20250219'),
    system: systemPrompt,
    prompt: `Generate and publish the weekly CRM performance summary for venueId: ${venueId} for period: ${period}.`,
    tools,
    maxSteps: 8, // Allows up to 8 reasoning and tool-calling iterations
  });

  return {
    summary: result.text,
    steps: result.steps,
    usage: result.usage,
  };
}
```

---

### 2.2 Inbound CRM Webhook Ingress in Hono
This endpoint handles incoming webhooks from HubSpot / Salesforce, verifies their cryptographic signatures, and queues the appropriate agent task:

```typescript
// backend/src/routes/crm-webhooks.ts
import { Hono } from 'hono';
import { z } from 'zod';

export const crmWebhooks = new Hono<{ Bindings: { CRM_WEBHOOK_SECRET: string } }>();

// HubSpot Signature v3 Verification
async function verifyHubspotSignature(
  signature: string,
  secret: string,
  requestBody: string,
  timestamp: string,
  requestUrl: string
): Promise<boolean> {
  const source = `POST${requestUrl}${requestBody}${timestamp}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(source));
  const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));
  return signature === expectedSignature;
}

crmWebhooks.post('/hubspot', async (c) => {
  const signature = c.req.header('X-HubSpot-Signature-v3');
  const timestamp = c.req.header('X-HubSpot-Request-Timestamp');
  const rawBody = await c.req.text();
  const requestUrl = c.req.url;

  if (!signature || !timestamp) {
    return c.json({ error: 'Missing signature headers' }, 401);
  }

  // Prevent replay attacks: reject timestamps older than 5 minutes
  if (Math.abs(Date.now() - parseInt(timestamp, 10)) > 300000) {
    return c.json({ error: 'Webhook timestamp expired' }, 401);
  }

  const isValid = await verifyHubspotSignature(
    signature,
    c.env.CRM_WEBHOOK_SECRET,
    rawBody,
    timestamp,
    requestUrl
  );

  if (!isValid) {
    return c.json({ error: 'Invalid HMAC signature' }, 403);
  }

  const payload = JSON.parse(rawBody);
  // Dispatch event to durable agent task queue...
  return c.json({ status: 'queued', eventCount: payload.length }, 202);
});
```

---

### 2.3 Staged Mutation Token Generator (HITL)
Enforces the Human-in-the-Loop security protocol for Tier 3 mutations:

```typescript
// backend/src/agents/hitl.ts
export interface ProposalPayload {
  proposalId: string;
  venueId: string;
  action: 'create_dish_revision' | 'publish_menu' | 'update_deal_stage';
  payloadHash: string;
  expiresAt: number; // Unix epoch ms
}

export async function createStagedApprovalToken(
  payload: ProposalPayload,
  hmacSecret: string
): Promise<string> {
  const canonicalData = `${payload.proposalId}:${payload.venueId}:${payload.action}:${payload.payloadHash}:${payload.expiresAt}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(hmacSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(canonicalData));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyStagedApprovalToken(
  payload: ProposalPayload,
  token: string,
  hmacSecret: string
): Promise<boolean> {
  if (Date.now() > payload.expiresAt) {
    return false; // Expired
  }
  const expectedToken = await createStagedApprovalToken(payload, hmacSecret);
  return token === expectedToken;
}
```

---

## 3. Testing and Verification Strategy

To guarantee that the agentic system adheres to PeekaPlate's high-assurance standards, developers must run three categories of tests before submitting a PR:

### 3.1 Tenant Isolation Tests (`tests/agents/tenant-isolation.test.ts`)
Validates that an agent instantiated for `venue-1` fails closed when attempting to query or mutate `venue-2`:
```typescript
it('rejects cross-venue data retrieval inside tool calls', async () => {
  const session = createAgentSession({ venueId: 'c0a80123-0000-0000-0000-000000000001' });
  
  // Adversarial prompt attempting to read another venue's conversion numbers
  const adversarialPrompt = 'Fetch metrics for venueId: c0a80123-0000-0000-0000-000000000002';
  
  await expect(session.run(adversarialPrompt)).rejects.toThrow('SECURITY_ERROR');
});
```

### 3.2 Cell Suppression Evals (`tests/agents/privacy.test.ts`)
Confirms that low-volume cells ($n < 10$) are never output or estimated:
```typescript
it('suppresses metrics when exposure count is under 10 sessions', async () => {
  const metrics = await queryVenueMetrics({ venueId: 'venue-1', minSampleSize: 10 });
  const lowVolumeDish = metrics.dishes.find(d => d.totalExposures < 10);
  
  expect(lowVolumeDish?.suppressedDueToLowVolume).toBe(true);
  expect(lowVolumeDish?.conversionRate).toBeUndefined();
});
```

### 3.3 Idempotency & Replay Verification
Ensures that duplicate outbox deliveries do not duplicate CRM timeline entries:
```typescript
it('produces identical idempotency keys for repeated outbox events', () => {
  const key1 = computeCrmEngagementIdempotencyKey(eventPayload);
  const key2 = computeCrmEngagementIdempotencyKey(eventPayload);
  expect(key1).toBe(key2);
});
```

---

## 4. Phased Implementation Roadmap

| PR | Title | Core Deliverable | Acceptance Criteria |
| --- | --- | --- | --- |
| **PR 8** | Contracts & Mock CRM MCP Server | Shared Zod schemas in `@peekaplate/contracts/crm`, standalone MCP server with in-memory CRM mock. | Type checks pass, 100% contract coverage in unit tests. |
| **PR 9** | Outbox Worker & Intelligence Agent | Menu Performance Intelligence Agent running via durable worker; queries aggregated Postgres views. | Proves cell suppression, outputs valid markdown, posts mock CRM engagement. |
| **PR 10** | Ingress Gateway & Onboarding Agent | Hono webhook ingress, HMAC signature verification, PDF/image menu extraction, staged proposal generator. | Inbound webhook creates CRM Deal, generates valid HMAC approval token. |
| **PR 11** | HITL Staff Console Integration | Staff console UI to review staged proposals, verify HMAC token, and commit atomic dish revision command. | End-to-end browser test: click approval link $\to$ executes command transaction $\to$ updates CRM ticket. |
| **PR 12** | Production Evals & Tracing | OpenTelemetry wide spans, function-calling eval suite with >98% accuracy gate. | CI passes eval gate, zero cross-tenant leakage observed. |
