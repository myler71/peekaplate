# CRM Integration Contracts & Tool Definitions

> **Status:** Specification · **Module:** `@peekaplate/contracts` / `crm-agentic` · **Version:** 1.0.0
> 
> This document specifies the canonical TypeScript/Zod schemas, entity mappings, and Model Context Protocol (MCP) tool contracts connecting PeekaPlate's agentic LLMs with external CRM systems (HubSpot, Salesforce, Attio).

---

## 1. CRM Entity Mapping Model

PeekaPlate's PostgreSQL data model is normalized around selective event sourcing and tenant isolation ([ADR 0002](../adr/0002-selective-event-sourcing.md), [ADR 0005](../adr/0005-tenancy-and-privacy.md)). The CRM system organizes data around accounts, pipelines, and customer support lifecycles.

The table below defines the bidirectional entity mapping:

| PeekaPlate Entity (PostgreSQL) | CRM Standard Object | CRM Entity Purpose & Fields |
| --- | --- | --- |
| `app_private.venues` | `Company` / `Account` | Restaurant business entity: `name`, `venue_id` (external ID), `address`, `status`, `current_tier` (T0/T1/T2), `pos_provider` (Toast, Square, etc.). |
| `app_private.staff_membership` | `Contact` | Authorized decision-maker: `name`, `email`, `role` (Owner, Head Chef, GM), `permission` (owner, editor, viewer). |
| Switchback Experiments / Readouts | `Deal` / `Opportunity` | Commercial rollout & pilot milestones: Deal stages (`Lead`, `Discovery`, `Menu Digitized`, `Pilot Active`, `QBR Completed`, `Closed Won`). |
| Outbox Performance Summaries | `Note` / `Timeline Engagement` | Automated executive readouts: Conversion lift, exposure sample size, confidence intervals, recommended menu adjustments. |
| Operational & POS Alerts | `Ticket` / `Case` | Technical service requests: POS webhook disconnects, dish code sync mismatch, 3D asset revision requests. |

---

## 2. MCP Tool Contracts (Zod Schemas)

All LLM tool calls are strongly typed. Input parameters and outputs are validated before and after execution using Zod. No untyped JSON is permitted in the agent runtime.

### 2.1 CRM Adapter Tool Schemas

```typescript
import { z } from 'zod';

const uuid = z.string().uuid().transform((v) => v.toLowerCase());
const postgresText = z.string().refine((v) => !v.includes('\u0000'), 'NUL byte is rejected');

// ============================================================================
// 1. CRM Account Lookup
// ============================================================================
export const CrmGetAccountInputSchema = z.strictObject({
  venueId: uuid.describe('The PeekaPlate internal UUID for the restaurant venue'),
});

export const CrmGetAccountOutputSchema = z.strictObject({
  crmAccountId: z.string().min(1),
  venueId: uuid,
  companyName: z.string().min(1),
  lifecycleStage: z.enum(['lead', 'opportunity', 'customer', 'churned']),
  posProvider: z.enum(['toast', 'square', 'clover', 'aloha', 'lightspeed', 'other', 'unknown']),
  activeTier: z.enum(['T0', 'T1', 'T2']),
  ownerEmail: z.string().email(),
  lastContactedAt: z.string().datetime().nullable(),
});

export type CrmGetAccountInput = z.infer<typeof CrmGetAccountInputSchema>;
export type CrmGetAccountOutput = z.infer<typeof CrmGetAccountOutputSchema>;

// ============================================================================
// 2. CRM Deal Stage Progression
// ============================================================================
export const CrmUpdateDealStageInputSchema = z.strictObject({
  crmAccountId: z.string().min(1),
  venueId: uuid,
  stage: z.enum([
    'lead_qualified',
    'menu_digitized',
    'pos_connected',
    'visuals_approved',
    'pilot_live',
    'qbr_delivered',
    'contract_renewed',
    'churn_risk'
  ]),
  notes: postgresText.max(2000).describe('Agent justification for stage movement'),
});

export const CrmUpdateDealStageOutputSchema = z.strictObject({
  dealId: z.string().min(1),
  previousStage: z.string(),
  newStage: z.string(),
  updatedAt: z.string().datetime(),
  status: z.literal('success'),
});

// ============================================================================
// 3. CRM Timeline Engagement / QBR Note
// ============================================================================
export const CrmAppendTimelineNoteInputSchema = z.strictObject({
  crmAccountId: z.string().min(1),
  venueId: uuid,
  title: postgresText.min(3).max(140).describe('Concise headline, e.g. "Weekly Menu Lift Summary"'),
  bodyMarkdown: postgresText.max(10000).describe('Structured markdown report for the restaurant operator'),
  category: z.enum(['menu_intelligence', 'pos_health', 'support_resolution', 'onboarding_audit']),
  metricHighlights: z.array(z.strictObject({
    dishName: z.string().min(1).max(160),
    sampleSize: z.number().int().min(10).describe('Small cells <10 must be suppressed before calling tool'),
    observedLiftPercent: z.number(),
    confidenceIntervalLower: z.number(),
    confidenceIntervalUpper: z.number(),
  })).max(10).optional(),
});

export const CrmAppendTimelineNoteOutputSchema = z.strictObject({
  engagementId: z.string().min(1),
  createdAt: z.string().datetime(),
  status: z.literal('created'),
});

// ============================================================================
// 4. CRM Support Ticket Creation & Triage
// ============================================================================
export const CrmCreateTicketInputSchema = z.strictObject({
  venueId: uuid,
  contactEmail: z.string().email(),
  subject: postgresText.min(5).max(200),
  description: postgresText.min(10).max(5000),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.enum(['pos_sync', 'dish_revision', 'visual_quality', 'billing', 'general']),
});

export const CrmCreateTicketOutputSchema = z.strictObject({
  ticketId: z.string().min(1),
  ticketNumber: z.string(),
  status: z.enum(['open', 'in_progress', 'waiting_on_customer', 'resolved']),
  assignedAgent: z.literal('agent_support_concierge'),
  createdAt: z.string().datetime(),
});
```

---

### 2.2 PeekaPlate Internal Service Tool Schemas

These tools allow the LLM to safely read projections and stage mutations without accessing PostgreSQL directly.

```typescript
// ============================================================================
// 5. Query Venue Metrics (Empirical Loop & Switchback)
// ============================================================================
export const QueryVenueMetricsInputSchema = z.strictObject({
  venueId: uuid,
  startDate: z.string().date(),
  endDate: z.string().date(),
  minSampleSize: z.number().int().min(10).default(10).describe('Mandatory cell suppression threshold'),
});

export const DishMetricReadoutSchema = z.strictObject({
  dishId: uuid,
  dishName: z.string(),
  currentTier: z.enum(['T0', 'T1', 'T2']),
  totalExposures: z.number().int().min(10),
  linkedOrders: z.number().int().nonnegative(),
  conversionRate: z.number().min(0).max(1),
  baselineConversionRate: z.number().min(0).max(1),
  liftPercent: z.number(),
  isStatisticallySignificant: z.boolean(),
  suppressedDueToLowVolume: z.boolean(),
});

export const QueryVenueMetricsOutputSchema = z.strictObject({
  venueId: uuid,
  periodStart: z.string().date(),
  periodEnd: z.string().date(),
  overallLinkageCoveragePercent: z.number().min(0).max(100),
  dishes: z.array(DishMetricReadoutSchema),
  unlinkedOrdersCount: z.number().int().nonnegative(),
});

// ============================================================================
// 6. Inspect POS Sync Health
// ============================================================================
export const InspectPosSyncHealthInputSchema = z.strictObject({
  venueId: uuid,
});

export const InspectPosSyncHealthOutputSchema = z.strictObject({
  venueId: uuid,
  posProvider: z.enum(['toast', 'square', 'clover', 'aloha', 'lightspeed']),
  connectionStatus: z.enum(['healthy', 'degraded', 'offline']),
  lastWebhookReceivedAt: z.string().datetime().nullable(),
  failedSyncEventsLast24h: z.number().int().nonnegative(),
  recentErrors: z.array(z.strictObject({
    timestamp: z.string().datetime(),
    errorCode: z.string(),
    description: z.string(),
    affectedDishCode: z.string().nullable(),
  })).max(5),
  recommendation: z.string(),
});

// ============================================================================
// 7. Human-in-the-Loop (HITL) Staged Dish Revision Proposal
// ============================================================================
export const StageDishRevisionDraftInputSchema = z.strictObject({
  venueId: uuid,
  dishId: uuid,
  expectedVersion: z.number().int().nonnegative(),
  proposedName: postgresText.min(1).max(160),
  proposedDescription: postgresText.max(4000),
  reasonForRevision: z.string().max(500),
});

export const StageDishRevisionDraftOutputSchema = z.strictObject({
  proposalId: uuid,
  venueId: uuid,
  dishId: uuid,
  expectedVersion: z.number().int().nonnegative(),
  hmacApprovalToken: z.string().min(32),
  expiresAt: z.string().datetime(),
  reviewUrl: z.string().url(),
  status: z.literal('pending_human_review'),
});
```

---

## 3. Bidirectional Event Contracts

### 3.1 Outbox Event: `crm.sync.venue_metrics_ready`
Emitted by PostgreSQL's `app_private.outbox` whenever a switchback block completes or weekly metric aggregation finishes:

```json
{
  "eventId": "e9b1d34c-687f-4f28-a3f2-8924b1238910",
  "topic": "crm.sync.venue_metrics_ready",
  "tenantId": "c0a80123-0000-0000-0000-000000000001",
  "payload": {
    "venueId": "c0a80123-0000-0000-0000-000000000001",
    "period": "2026-W41",
    "totalExposures": 1840,
    "linkedOrders": 612,
    "topPerformingDish": "Truffle Gnocchi (T1)",
    "observedLift": "+14.2%"
  },
  "createdAt": "2026-10-15T08:00:00Z"
}
```

### 3.2 Inbound CRM Webhook Event: `crm.webhook.deal_updated`
Received from HubSpot / Salesforce upon deal stage transition:

```json
{
  "webhookId": "wh_78a6c810-38f2",
  "source": "hubspot",
  "eventType": "deal.propertyChange",
  "propertyName": "dealstage",
  "propertyValue": "menu_digitized",
  "crmAccountId": "hs_company_98234",
  "externalVenueId": "c0a80123-0000-0000-0000-000000000001",
  "occurredAt": "2026-10-15T09:15:00Z",
  "signature": "sha256=a7f43b8c..."
}
```

---

## 4. Error Handling and Idempotency Policy

1. **Idempotency Keys:** Every mutation tool call (`CrmUpdateDealStage`, `CrmAppendTimelineNote`, `CrmCreateTicket`) accepts or calculates a deterministic SHA-256 idempotency key:
   $$\text{idempotency\_key} = \text{SHA256}(\text{venue\_id} + \text{action\_type} + \text{source\_event\_id})$$
2. **Standard Error Payloads:** Tool failures must return structured errors rather than throwing unhandled exceptions:
   ```json
   {
     "error": {
       "code": "VENUE_TENANT_MISMATCH",
       "message": "The requested entity does not belong to the authenticated venue tenant",
       "retryable": false
     }
   }
   ```
3. **Rate Limiting & Backoff:** The CRM MCP server implements a token bucket rate limiter conforming to CRM provider limits (e.g., HubSpot 100 requests / 10 seconds), returning HTTP 429 with `Retry-After` headers.
