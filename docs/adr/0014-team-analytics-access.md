# 0014 — Individual team access to staging analytics

Status: Accepted · 2026-10-21 · Owner: platform

## Context

Contributors need to inspect the PostHog copy in Supabase without sharing integration or database credentials. The maintainer explicitly requested a common Cloudflare API with individual permissions. ADR 0013 forbids direct application-runtime analytics access and owner use of these raw observations.

## Decision

Keep the existing Supabase Auth verifier and restricted Hyperdrive binding. Add staging/local-only GET endpoints for safe event fields and technical event counts. Require a database-managed `(actor_id, project_id)` reader grant checked on every request. The configured server project and staging filter are authoritative; GitHub collaborator or PostHog membership is not an application grant.

Narrowly extend ADR 0013: the application runtime may execute a fixed security-definer function in a separate private schema, but gets no analytics-schema usage, raw table/view SELECT or access to the grants table. The function's non-login owner can read only the required grants/view, has no restaurant access, cannot create objects and uses a fixed search path. It filters the authorized project/environment, caps date windows/results and constructs an allowlisted response. Keep Hyperdrive query caching disabled. Grant changes apply to subsequent requests, not an already-running snapshot.

The API returns no visitor identity, IP, person data, free text or arbitrary properties. It is internal diagnostic access over staging observations, not restaurant-authorized owner reporting. No provider administration proxy, arbitrary query endpoint, shared privileged API key, new service or separate database is introduced. Existing domain commands and the accepted durable diner-evidence pipeline remain unchanged. Routine CI uses synthetic local fixtures; deployment credentials belong in protected GitHub environment secrets and provider bindings.

## Consequences

Teammates require individual Supabase Auth accounts and explicit internal reader grants. PostHog project membership remains useful for inspecting capture before hourly export. Current API data is delayed and incomplete optional analytics; diagnostic event counts do not establish visits, orders or business metrics. Owner API authorization and metric thresholds remain separate decisions/work.

## Verification

HTTP tests reject unauthenticated sessions, client-selected authority, duplicate parameters, broad ranges and production routes. PostgreSQL and real local Worker tests cover project isolation, duplicates, field redaction, bounded results, denied direct access and revocation. Hosted activation requires migration/deployment and synthetic positive/negative tests; local results alone do not prove it. See [team data access](../team-data-access.md).
