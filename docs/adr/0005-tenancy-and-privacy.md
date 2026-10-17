# 0005 — Tenancy and privacy

Status: Accepted · 2026-10-13 · Owner: platform/product

## Context

Restaurant facts require approval. Sessions and POS linkage are pseudonymous, not automatically anonymous. This repository is public.

## Decision

Authenticate staff through Supabase Auth; verify venue membership and permission on the server. No browser-provided tenant can grant authority. Use restricted database roles, transaction-local tenant/actor context and RLS. Keep migration/owner credentials separate. Test Hyperdrive/Supabase TLS, connection mode, transaction-local context and absence of connection leakage with real staging roles before launch.

The initial schema denies ordinary access; test-only grants do not constitute runtime authorization. Do not expose raw generic append functions or service-role keys to clients. Event append, command results and outbox work carry tenant relationships enforced by constraints.

Keep public approved assets separate from private originals, POS files and evidence. Minimize event payloads and redact POS notes after extracting the code. A 30-day raw retention period is a proposal requiring venue/legal agreement. Withdrawal prevents new exposure; versioned historical evidence does not justify retaining personal data forever. Deletion procedures cover databases, archives, caches and restored backups, with an auditable exception path where needed.

## Consequences and verification

RLS is defense in depth, not a guarantee against privileged owners. Confirm role grants and authentication before using production data. Test cross-tenant reads/writes, expired/reused tokens, unauthorized replay/commands, withdrawal and delete/restore behavior. No real personal data or credentials in Git, test fixtures, agent memories or screenshots.
