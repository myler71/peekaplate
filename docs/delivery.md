# Delivery plan

The foundation is PR 0. It establishes a place to build and verify PeekaPlate; it does not claim the pilot is complete. The product line stays: **3D is the hook. The loop is the product.**

## The first sprint

One venue, one useful owner decision, a complete T0 menu and carefully selected T1/T2 dishes. T0 means normal photos and text. T1 adds shallow movement to reviewed photo cutouts. T2 separates real captured plating stages; it does not invent ingredients or unseen food. See [visual tiers](adr/0004-visual-tiers.md).

The source plan's gates are G1 October 19, G2 October 24, G3 October 28, G4 October 29 and readout November 1, 2026. Its cash budget is $375 with labor separate. These are planning constraints, not guarantees. The tech lead must rebaseline dates and vendor costs if a gate is missed; do not remove safety or evidence requirements to keep a date.

## PR order and acceptance

Keep each slice complete. Split an oversized slice into independently testable PRs while retaining the dependency order. The listed roles are responsibilities for the team to assign, not invented staff names.

| PR | Owner / depends on | Observable outcome | Required evidence |
| --- | --- | --- | --- |
| 0 · Repository foundation | Tech lead | Diner/console shells, health Worker, initial contracts, private schema, CI and agent guidance run locally | Unit/script tests, real Postgres constraints, browser smoke, build, context and links |
| 1 · Staff authority and command transaction | Backend lead / 0 | Authorized staff can create a dish revision using expected version and a stable command ID; live projection, receipt and outbox commit together | Real DB concurrent writers; cross-venue deny; stale version; crash rollback; identical retry; conflicting command ID; revoked actor retry |
| 2 · Capture, review and publication | Product + backend / 1 | Reviewer approves immutable capture/manifest; only approved revisions publish a hash-addressed T0 menu; withdrawal changes availability | Unauthorized approval denied; approve/publish race; immutable hashes; unavailable/offline behavior; replay causes no uploads or notifications |
| 3 · T0 diner and durable intent | Frontend + backend / 2 | Diner browses without WebGL/analytics; actual exposure is recorded; offline IDs survive reload and delete only after accepted receipts | Airplane/reload/reconnect; partial receipts; Queue failure; duplicate/conflicting IDs; create-only archive before index; DLQ recovery; retention/deletion |
| 4 · Ticket linkage and POS adapter | Data lead / 3 | Short-lived venue-bound redeem code links one session to its ticket; repeat import is idempotent | Cross-venue code rejected; expiry/collision; duplicate tickets; void/refund/timezone cases; unlinked outcomes stay unknown |
| 5 · T1 then selected T2 | Visual lead / 2; exposure via 3 | Tap loads Three.js 0.183.x behind `mount / update / dispose`; reviewed visual and fallback work on target phones | Initial graph excludes viewer; T0 JS ≤150 KB gzip; T1 incremental code+assets ≤400 KB; reduced motion, keyboard, WebGL loss, dispose/reopen, visual sign-off |
| 6 · Owner readout and experiment | Data + product / 4 | Owner sees linkage coverage and supported comparisons, then schedules one frozen blocked-switchback intervention | Assignment/exposure consistency; no individual attribution; unknowns explicit; cells under 10 sessions suppressed; uncertainty and carryover checks |
| 7 · Pilot release and recovery | Release lead / 3–6 | Named venue can complete the loop, recover from interruption and restore evidence | G3 restore/outage drill; independent backup; replay side-effect test; receipts/IDs/checksums reconcile; deletion reapplied; named alert responder |

PRs 4 and 5 may run in parallel after their prerequisites. Avoid a second database, graph service, Rust service or Python test layer for this TypeScript application. Add a pinned `uv` Python job and pytest only when a real capture-processing job lands with its own tests.

PR 1's local implementation provides the staff-token boundary, membership authorization and dish command transaction. Its release gate remains open until the same tests are verified with real Supabase identities, migration/runtime roles and the deployed Hyperdrive connection mode. Local JWT fixtures do not represent a working staff login or hosted session-revocation check. No cloud credentials are needed for the local slice.

PR 1 must establish the complete tenant boundary: verify the session and active venue membership server-side, derive actor/venue/permissions there, then bind context inside the command transaction with transaction-local settings. Browser venue fields cannot grant authority. Use separate migration and runtime credentials; the runtime role must not own tables, be superuser or bypass RLS. Test missing/invalid identity, forged venue fields, cross-venue reads/writes, revoked membership on retry, and context reset after commit/rollback and pooled connection reuse using the deployed connection mode. Caller-set PostgreSQL settings alone do not authenticate a tenant: untrusted clients must never obtain that SQL role or an arbitrary-SQL endpoint.

## Gate decisions

- **G1:** capture and truthfulness rules signed off; approved T0 content exists. No generated edible surfaces.
- **G2:** core menu-to-ticket path demonstrated; selected visuals meet measured device and payload limits. Switch optional visuals off if they fail.
- **G3:** interruption, duplicate delivery, restoration and replay drills pass. Broken tenant isolation, approval, withdrawal or linkage blocks the pilot.
- **G4:** venue, operator, retention, consent wording and runbook ready. Record known limitations and who can stop the pilot.
- **Readout:** show observed sample and linkage coverage. Do not claim causal lift from a convenience comparison or treat a ticket as proof of an individual's intent.

## Evidence ledger

Each PR records exact commands and results in the PR template. Keep run URLs there rather than copying volatile green badges into architecture docs. A shell test proves the shell; a schema test proves its tested constraints. Neither proves authentication, ingestion, replay, phone performance or production readiness.

`ci` is the stable required-check name. Quality checks always run; database and browser lanes are selected by changed paths. A warm ordinary PR aims for under five minutes; measure hosted runs before adding caches or a monorepo task runner. CI cannot judge whether prose is truthful, so documentation/context checks complement human review.
