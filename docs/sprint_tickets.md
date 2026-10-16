# PeekaPlate sprint tickets

Proposed assignments and delivery order · October 16, 2026

**Target: a working, checked pilot in 15–20 calendar days from an agreed kickoff.** Use three five-day delivery sprints, then up to five days for the restaurant pilot, recovery checks and fixes. These are proposed tickets for team review. No ClickUp tasks or assignments have been changed.

The product loop stays **Menu → Visual Intelligence → Diner Intent → Demand Intelligence → Restaurant Action**. In everyday terms: show approved food information, record what diners actually do, turn those records into reliable summaries, and let the restaurant decide what to change.

The [implementation plan](implementation_plan.md) contains screen behavior, event definitions, formulas and examples. This pack turns that plan into work somebody can pick up, finish and hand to the next person. It incorporates Adam's updated [Taxonomy + Measurement Plan](https://app.clickup.com/90141746115/docs/2kydvry3-1494?view=open) and [Diner Scope](https://app.clickup.com/90141746115/docs/2kydvry3-1514?view=open), read in full on October 16. They remain drafts: differences requiring a team decision are recorded below.

## 1. What exists, and what delivery means

**Already in the repository:** project structure, local development, automated checks, agent guides, permission-checked staff draft saving, database transactions and tests. The diner and owner apps are shells. Research, designs and completed design tasks are useful inputs; they do not establish that publication, diner tracking or dashboards work in code. See the [team guide](team_guide.md).

**Day 15 target:** an integrated staging candidate. A reviewed dish can be published and withdrawn; the diner menu works; genuine UI actions reach the database reliably; an authorized owner sees correct reports and can record a reviewed action. Order-backed figures require the validated import and linking workflow. Approved photo fallback always works.

**By day 20:** the agreed pilot has been run, recovery and device checks have evidence, and the team has a readout and a clear next decision. A short pilot can establish usability, data quality and operating feasibility. It cannot promise enough diners or time to prove sales lift or statistically reliable improvement.

This schedule needs confirmed coding capacity, a participating restaurant, usable source material and protected provider access. **T01 must establish those commitments on day 1.** If they are missing, report the affected milestone immediately. A browsing demonstration is useful but is not completion of the accepted full pilot. Do not remove approval, tenant isolation, withdrawal, privacy, recovery or order-linking gates to meet a date.

The older plan has dated gates ending November 1, 2026. These relative days do not silently replace those dates. T01 records the actual kickoff, the day-20 deadline and how the existing G1–G4 dates fit; Vivien and Sai must agree any changed baseline before tickets are committed. A five-day calendar window does not imply five full workdays from every person.

### How to read and use a ticket

- **Proposed owner** coordinates the result. Their name is a recommendation, not an assignment they have accepted.
- **Reviewer** checks the result. An author cannot provide the only approval of their own work.
- **Window** is when the result is needed. Effort is a planning estimate, not a promise about availability.
- **Depends on** names the result needed before completion. A typed sample response or synthetic fixture can unblock preparation, but cannot replace final integration.
- **Done** lists evidence to attach: a decision, a file, a passing check or a demonstrated flow. A screenshot alone does not prove tracking or permissions.
- **Continue** links existing ClickUp work. Reuse or create an implementation child under that work; preserve completed research/design records. Do not reopen them just because code remains.

For viewing, GitHub's **Preview** shows the tables and links. Download the Markdown to keep a copy or open it in a Markdown editor. This pack uses tables and ordinary lists, so Discord's lack of diagram rendering does not hide the delivery order.

## 2. Staffing and the delivery calendar

The [team interests document](https://app.clickup.com/90141746115/v/dc/2kydvry3-94/2kydvry3-434) was rechecked on October 16; agreed responsibilities were still blank. The proposals below follow recorded interests and existing task ownership, without assuming software experience or available hours.

| Person | Proposed contribution | Confirmation needed at T01 |
| --- | --- | --- |
| Vivien | Scope, restaurant participation, source permissions, access and release decisions | Which decisions and restaurant handoffs she can complete by each gate |
| Sai | Publication/backend foundation, CSV linking, viewer integration and provider setup; technical integration review | Enough protected implementation and review time; cannot absorb all other coding lanes |
| Eirene | Processing rules, owner evidence and measurement; **invitation** to own collector/report backend implementation | Accept the lane after a paired setup/test/change exercise; backend interest is not proof of readiness |
| Shirley | QA and requirements; **invitation** to own diner/owner UI implementation | Accept the lane after a paired setup/test/change exercise; keep independent review on her own changes |
| Adam | Diner meanings, measurement reconciliation, study protocol and readout | Agree review windows and the evidence needed for each metric; not automatically the analytics developer |
| Rania | Selected diner frames, components, interaction and accessibility handoff | Agree the limited frame set and review slots; no assumption that design ownership includes coding |
| Amr | Owner screens, visual asset trial and design/usability review | Sequence asset preparation and owner design; confirm the amount of asset work actually achievable |

**Capacity check:** the schedule below assumes three accepted coding lanes: Sai, Eirene and Shirley, or explicitly named replacements. Reserve roughly one fifth of each coding lane's time for reviews, integration and fixes. Estimates below must fit the remaining available time. On day 1, Eirene and Shirley each pair on setup, run a relevant existing test and explain a small reviewable change before accepting an implementation ticket. This is a readiness check, not a test of their job title. If a lane is not ready or available, assign confirmed support or replan with the team on day 1. AI tools can assist work; they are not an extra confirmed engineer.

The labels A/B/C below avoid renaming the existing ClickUp lists called Sprint 1 and Sprint 2.

| Window | Main work running together | Required result at the end |
| --- | --- | --- |
| **A · days 1–5** | T01–T06 decisions, diner design, venue feasibility and sample assets; T07 publication; T08 sample diner UI; T09 local collector preparation; T11 owner design begins | One approved T0 dish can be opened and withdrawn locally. The diner works with the agreed sample contract. Event meanings and staffing are fixed. Venue/order feasibility is known. |
| **B · days 6–10** | T09–T10 real event path; T12 metric/API work; T13 CSV/linking; T14 study protocol; T15 viewer starts; T16 content batch; T17 owner UI starts | Actual diner actions produce checked database facts. Import/linking works with synthetic records. The first authorized report agrees with expected numbers. |
| **C · days 11–15** | T15–T18 viewer, content, owner UI and reviewed actions; T19 integrated local check; T20 protected cloud checkpoint | Local flow passes before hosted setup. Staging candidate has real provider checks underway/completed as scheduled, with unresolved release blockers visible. |
| **Release · days 16–20** | T21 recovery/security evidence; T22 device/operator checks; T23 pilot; T24 readout and fixes | G3/G4 evidence, pilot observations, remaining risks and next decision recorded. Day 20 is the end of this commitment, not the start of an unbounded backlog. |

**Critical chain:** T01/T02 → T07 → T08 connected menu → T10 real observations → T12 → T17/T18 → T19 → T20 → T21/T22 → T23 → T24. T04 fixes the meanings used by T09/T10/T12. T05 → T13 supplies order evidence. T05 → T06 → T15/T16 supplies approved food assets. Preparation can overlap; acceptance cannot skip those joins.

**Coding lane reservations:** Sai: T07 days 2–5, T13 days 6–8, T15 days 9–11, T19 integration day 13, T20 days 14–15. Eirene: T09 days 3–6, T12 days 7–10, T18 days 11–13. Shirley: T08 days 3–5, T10 days 6–8, T17 days 9–12, T19 day 13. These are sequencing proposals; T01 checks effort, reviews and actual availability. Day-13 local acceptance is a gate, not permission to rush an incomplete slice into staging.

**At day 2**, escalate missing venue/source/export feasibility. **At day 5**, compare actual effort with the remaining capacity. **At day 10**, freeze pilot scope and verify that provider owners are ready to grant access at T20. Prepare account/access arrangements earlier, but do not provision or request secrets until the local checkpoint passes. If the critical chain slips, show the consequence that day and agree a smaller optional scope or a changed commitment. Do not spend the release buffer adding features.

## 3. Decisions from Adam's updated documents

These are concrete inputs to T03/T04/T05, not reasons to repeat Adam's research. Preserve the source names in the mapping. The accepted ADRs and the reviewed implementation contract remain the engineering baseline until a decision is recorded.

| Updated draft says | Ticket decision / proposed treatment |
| --- | --- |
| Detail opening is a consideration signal; the implementation plan requires 10 seconds of active detail time or a valid linked comparison for its qualified measure | **T04:** keep `dish_detail_opened` as the observable action. Label simple opens and **qualified considered dishes** separately; confirm whether both are wanted. Do not rename every open into qualified consideration. |
| Proposed active-time idle cutoff is 10 seconds; current plan proposes 30 seconds | **T04:** Adam and engineering select one rule/version, with worked pause/background/resume examples. Distinguish idle cutoff, the 10-second consideration threshold and the 30-minute visit timeout. They are three different things. |
| Ingredient chips may toggle a visual element on/off; current plan expects a useful information panel | **T03/T04:** confirm the selected design's actual effect with Rania/Amr. Record ingredient ID, approved list revision, opening, deliberate activation and resulting state. Retain the source name `ingredient_viewed`; adapt payload/acceptance to the approved control. Never infer allergy or preference. |
| `spatial_view_started` means loaded and shown, but its status list also includes failure/fallback | **T04:** map successful source records to `spatial_view_shown`, never to a request. A separate request fact is a proposed addition. Give first frame, interaction, failure and actual photo fallback distinct meanings and attempt IDs. A failed load cannot count as a preview shown. |
| `dish_compared` includes start and swap; `dish_revisited` is derived | **T04/T10:** map `swap` to the agreed replacement action and keep comparison ID/pair version. Count start, replacement, dish participation and pair separately. Derive revisits from valid openings, not duplicate deliveries. |
| Stable event IDs, internal-traffic markers and some context are optional proposals | **T04/T09:** stable event identity is mandatory for retries. The server decides restaurant authority and internal/test classification; a browser flag cannot establish trust. Preserve actual publication/exposure references. |
| Server receive time can help when device clocks disagree; page hiding appears among visit-end reasons | **T04:** preserve client occurrence, server receipt, producer sequence and semantic references. Late/offline receipt is not interaction order. Page hiding ends active timing, not necessarily the visit; define resumption and inactivity consistently. |
| Visit-level visual engagement, preview adoption, comparison/revisit rates, dishes-opened/considered distribution, session shape, dish signal coverage and audited event validity are proposed | **T04/T12/T14:** map each source row to an exact retained formula, separately labelled refinement or explicit deferral. Define aligned visit cohorts, distribution buckets and coverage denominator. Visit-based rates do not inherit opening-based formulas. Manual audit validity is separate from server submission validity. |
| Shortlist is proposed; it is device-only with nothing sent to the restaurant, but owner saved metrics are also suggested | **T01:** leave shortlist outside this delivery baseline. If approved later, resolve the data-sharing contradiction and revise scope/measurement before adding events or an owner metric. |
| No order-linking method is selected in the prototype; table/time/staff confirmation are candidates | **T05/T13:** show Adam the accepted [ADR 0006](adr/0006-orders-and-measurement.md) proposal: one item CSV and an explicit venue-bound code. Validate it with the restaurant. Do not implement inferred table/time matching. If infeasible, report a full-pilot blocker and keep outcomes unknown. |
| Scope includes approved photos/text/ingredients, comparison, mobile QR and 2.5D fallback; full 3D, portion inference and protein estimates are out | **T03/T06/T15:** preserve this scope. T0 supports every eligible dish; T1 is the first optional enhancement. T2 only follows real plating-stage evidence and an agreed budget. No fabricated food surfaces. |
| Taxonomy text refers to sections 7/8 absent from the supplied export | **T04:** ask Adam to repair the references or supply the missing section if one is intended. The pack covers all text actually supplied; it does not invent missing requirements. |

The shortlist, waitlist-specific integration, full 3D/AR, inferred nutrition/portion sizes, diner accounts, live ordering, reviews/social proof, personalization and Ask AI are **not hidden commitments**. Waitlist entry can be reconsidered only if the restaurant already has a compatible flow. Manual structured intake is the proposed first path; OCR/PDF/authorized-URL automation requires an explicit D5 capacity decision, not a new platform by default.

## 4. Tickets for delivery sprint A

### T01 — Agree the delivery commitment and who owns each result

**Type:** decision/planning. **Proposed owner:** Vivien. **Support:** Sai and every proposed contributor. **Reviewer:** each contributor confirms their own commitment; Sai checks the integration plan. **Window/effort:** day 1, one short planning session plus the paired readiness exercises. **Depends on:** none.

**Do:** select the actual kickoff/deadline, confirm the three coding lanes, available review time, restaurant contact and scope. Keep optional additions outside the commitment. Map this pack to the existing ClickUp lists without replacing past work. Check the existing dated G1–G4 baseline and explicitly record any change.

**Done:** a compact commitment table records accepted owner, backup, capacity, calendar dates and dependencies for each selected ticket. Eirene/Shirley coding invitations are accepted with paired setup/test evidence or replaced/replanned. Missing capacity has an owner and a decision that day. D5 manual-first intake and the deferred shortlist/AI scope are explicitly accepted or revised with equivalent capacity removed.

**Continue:** [sprint goals](https://app.clickup.com/t/90141746115/86bcex5hb), [Sprint 2 planning](https://app.clickup.com/t/90141746115/86bchxfk2), [refine PBIs](https://app.clickup.com/t/90141746115/86bcex5x3). **Reference:** implementation plan §9, D1–D8 and this pack §2. **Handoff:** agreed commitments to all ticket owners.

### T02 — Set the rules for reviewing and publishing a dish

**Type:** requirements/decision. **Proposed owner:** Eirene. **Support:** Shirley and Vivien; Sai checks feasibility. **Reviewer:** Vivien and the restaurant's authorized content approver. **Window/effort:** days 1–2, about one focused day. **Depends on:** T01; venue-specific wording joins T05.

**Do:** consolidate the existing processing and human-review documents into one approval checklist: required content, rights/provenance, missing ingredient/allergen handling (P06), final approver/delegation (O04), revision states, exact content/photo/visual bundle, withdrawal, offline publication age and retention/deletion proposal. Choose manual structured input first unless D5 explicitly funds bounded acquisition automation. A model proposes candidates; it never approves or publishes.

**Done:** every uncertain field has a permitted state and reviewer action. Empty allergen data does not mean allergen-free. Drafts remain private; late asset jobs cannot replace approved content. The permission/transition table and rejected examples are enough for T07 tests. Thirty-day raw retention remains a proposal until approved. Restaurant policy not yet agreed is recorded as a release blocker, not waived by synthetic tests.

**Continue:** [agent/human-review workflow](https://app.clickup.com/t/90141746115/86bcex9a1), [multimodal scope](https://app.clickup.com/t/90141746115/86bcex5tt), [review/approval scope](https://app.clickup.com/t/90141746115/86bcexkyh). **Reference:** plan §§7–9, D3–D5; [ADR 0002](adr/0002-selective-event-sourcing.md), [ADR 0005](adr/0005-tenancy-and-privacy.md). **Handoff:** checklist and accepted state/permission table to T07/T16.

### T03 — Hand over the exact diner screens and button behavior

**Type:** design. **Proposed owner:** Rania. **Support:** Amr and Adam. **Reviewer:** Shirley for buildability and Adam for behavior meaning. **Window/effort:** days 1–3, one to two focused days. **Depends on:** T01; finalize event-facing behavior with T04.

**Do:** select frames from the [current diner Figma](https://www.figma.com/design/l7A9n8tACJic0FIhY49Zjw/PeekaPlate?node-id=0-1) and annotate direct menu entry, category selection, dish open/back, ingredient action, preview request/close, compare pick/start/replace/cancel and the small owner sign-in link. Define mobile, keyboard/focus, reduced-motion, loading, unavailable and photo-fallback states. Remove unverified protein numbers. Resolve the ingredient panel/toggle question before developers encode it.

**Done:** a button/state table says what the person sees, what changes, which event is proposed and when no event should fire. Compare cancellation does not count as comparison. Fast taps work before visibility timers complete. A disabled viewer or failed analytics cannot prevent reading the menu. No diner login is introduced. Include the source frame links and any intentional departure from them.

**Continue:** [shared design system](https://app.clickup.com/t/90141746115/86bchyk6w), [complete flows](https://app.clickup.com/t/90141746115/86bchyk71); consume the completed [interactive diner design](https://app.clickup.com/t/90141746115/86bcexf9r), do not recreate it. **Reference:** plan §3 and [frontend design](frontend-design.md). **Handoff:** selected frames/state table to T08/T10/T15.

### T04 — Agree what each event and dashboard number means

**Type:** measurement/contract decision. **Proposed owner:** Adam. **Support:** Eirene and Sai; Rania/Amr for controls. **Reviewer:** Eirene for implementation mapping, Vivien for scope. **Window/effort:** days 1–3, one to two focused days. **Depends on:** T01; works alongside T03.

**Do:** reconcile every row in §3 of this pack with Adam's updated taxonomy. Produce one versioned source-event → application-event → stored fact → metric table. Freeze visibility, timing, visit expiry, comparison versions, ingredient opportunities, actual offers, internal traffic, late data, timezone/period and privacy rules. Repair the missing source references. Reuse plan §§5–6 rather than writing a competing dictionary.

**Done:** each metric has its display label, unit, exact numerator/denominator, eligible group, period, missing/suppressed behavior and a worked example. Explicitly distinguish opens/qualified consideration, visits/openings/attempts, audited validity/submission validity, and order quantities/tickets/linked visits. Include a five-second, un-compared opening: it counts as an opened dish but not qualified consideration. Map every source metric row, including session-based engagement/adoption/comparison/revisit rates and session-shape distributions. All owner-artifact metrics in §6 are marked implement, conditional on source evidence, or explicitly deferred by decision. A screenshot of sample numbers is not a formula. Version the accepted differences and update the implementation plan with those decisions before code depends on them.

**Continue:** [taxonomy and metrics](https://app.clickup.com/t/90141746115/86bcex5w6); build on the completed [diner JTBD](https://app.clickup.com/t/90141746115/86bcex5rr). **Reference:** both updated Adam links above, plan §§5–6, D2, [ADR 0003](adr/0003-intent-evidence.md), [ADR 0006](adr/0006-orders-and-measurement.md). **Handoff:** signed-off definition version and sample cases to T09/T10/T12/T14.

### T05 — Confirm the restaurant can supply photos, facts and order evidence

**Type:** venue research/feasibility. **Proposed owner:** Vivien. **Support:** Adam for questions, Sai for export/code feasibility. **Reviewer:** restaurant representative confirms their actual process; Sai records engineering implications. **Window/effort:** days 1–3, about one day of preparation/review plus external response time. **Depends on:** none; use T02 policy draft.

**Do:** obtain permission and a named contact; confirm the menu/dish list, source rights, approved facts, useful photo angles and representative stage captures if T2 is considered. Check whether one item-level CSV export and a simple code-redemption step can be performed reliably. Agree what constitutes complete source coverage, corrections and the business timezone. Do not place restaurant/customer records in this public repository.

**Done:** a permitted, sanitized schema/example and a documented code workflow establish feasibility, or a specific blocker is escalated by day 2. No table/time inference. Photo rights and content approver are known. Pilot dates, staff help and paper/standard-menu fallback have a responsible contact. Lack of a restaurant reply remains blocked, not “research complete.”

**Continue:** [restaurant outreach](https://app.clickup.com/t/90141746115/86bcex5wq), [discovery](https://app.clickup.com/t/90141746115/86bcex99b). **Reference:** plan §§7/9 D6, Adam Scope §6, ADR 0006. **Handoff:** permitted inputs to T06/T13/T16 and pilot arrangement to T22/T23.

### T06 — Prove the food-photo preparation process on a small sample

**Type:** visual feasibility/preparation. **Proposed owner:** Amr. **Support:** Vivien for source access, Eirene for processing records. **Reviewer:** Shirley for the checklist and the restaurant approver for food accuracy. **Window/effort:** days 3–5, one to two focused days. **Depends on:** T02/T05 for real assets; labelled synthetic fixtures can test packaging beforehand.

**Do:** take three varied dishes through T0 photo/text preparation and a bounded T1 photo-layer trial. Record capture/source IDs, rights, tool/settings, manifest/hashes, time, cost, failures and fallback. Test T2 only when real plating stages are captured; otherwise record it as unavailable. AI may assist photo-grounded preparation, not invent unseen food.

**Done:** reviewed sample bundles and a repeatable checklist exist; the measured effort supports or rejects scaling to 20. No portion/actual-size claim without verified measurement. T1 respects its 400 KB incremental budget; any T2 work has an explicitly fixed G1 budget before acceptance. Missing real source evidence prevents calling this a completed real-asset trial.

**Continue:** [2D-to-3D feasibility](https://app.clickup.com/t/90141746115/86bcexezr), [spatial scope](https://app.clickup.com/t/90141746115/86bcexkyy). **Reference:** plan §7, [ADR 0004](adr/0004-visual-tiers.md), Adam Scope §3. **Handoff:** approved sample manifest and measured effort to T15/T16.

### T07 — Publish one approved dish and make withdrawal work

**Type:** implementation · P1. **Proposed owner:** Sai. **Reviewer:** Eirene for policy, an independently confirmed technical reviewer for code. **Window/effort:** days 2–5, about three focused days plus review. **Depends on:** T02 accepted rules; synthetic content is sufficient for local work.

**Do:** extend existing draft commands with review/approve/publish/withdraw and an anonymous public-menu read. Own shared publication contracts, backend domain changes, forward migrations and their tests. Publish only the exact approved content/asset/fallback bundle. Supply T08 a typed public response and fixture early. Include the minimal staff controls needed to exercise this workflow; coordinate console ownership with T17.

**Done:** an authorized reviewer publishes a synthetic dish, an anonymous visitor sees only active approved content, and withdrawal blocks fresh reads under the agreed offline policy. Tests prove stale versions, safe retries, cross-venue denial, unauthorized approval, private drafts, atomic event/projection/outbox changes and replay without side effects. Check both fresh DB and upgrade. Existing draft-save permission is not treated as publication permission.

**Continue:** add an implementation child linked to the completed [minimum approval path](https://app.clickup.com/t/90141746115/86bcexenj), retaining its original completion record. **Reference:** plan P1; ADRs 0002/0005. **Handoff:** tested endpoint, fixture and staff flow to T08/T09/T16.

### T08 — Build the usable diner menu, then connect published content

**Type:** implementation · P2. **Proposed owner:** Shirley, conditional on T01 readiness/acceptance. **Support:** Rania and Amr. **Reviewer:** Sai for integration, Adam for observable behavior. **Window/effort:** days 3–5, about two focused days plus review. **Depends on:** T03 and T07 response contract; final connection waits for T07.

**Do:** implement the agreed menu/details/ingredients/compare flow in `frontend/diner/` using explicit synthetic data first. Add the owner entry and a safe owner-shell destination. Keep dish IDs and UI state stable so T10 can observe meaningful actions. Connect the published-menu response before completing the ticket; no random dashboard data or live generation.

**Done:** QR/link opens a useful menu directly; approved content is displayed; empty/loading/error/withdrawn states work. Keyboard/focus and narrow screens work. Compare start/replace/cancel behave as designed. The menu remains usable when analytics or WebGL is unavailable. Browser evidence demonstrates the public read integration; dummy-only screens remain a partial result. Initial diner JavaScript stays within 150 KB gzip.

**Continue:** implementation child of [diner scope](https://app.clickup.com/t/90141746115/86bcexkzb), linked to T03's completed design inputs. **Reference:** plan §3/P2, frontend design. **Handoff:** working controls to T10 and optional renderer mount point to T15.

### T09 — Accept events safely and carry them into the database

**Type:** implementation · P3 backend. **Proposed owner:** Eirene, conditional on T01 readiness/acceptance. **Reviewer:** Sai; Adam checks accepted event meanings. **Window/effort:** days 3–6, about three focused days plus review. **Depends on:** T04 contract; T07 publication references for final integration.

**Do:** own observation schemas, scoped ingest authority, accepted-ID receipts, local Queue/R2 consumer and fact migrations/tests. Reuse current Worker/Postgres boundaries. Validate bounded payloads and publication/venue references server-side. Return receipts only after the defined durable queue handoff. Consumer archives to create-only R2 before idempotent database indexing and acknowledges individual queue messages after completion.

**Done:** tests cover valid/invalid/oversized data, expired or wrong-scope tokens, duplicate IDs, conflicting payloads, partial/lost acknowledgement, retries, archive-before-index order, crash recovery, poison messages and recovery queue handling. A durable pending-work mechanism handles late commits; a numeric sequence is not assumed to be commit order. Replaying accepted evidence does not double counts or trigger external side effects. Logs/errors contain no raw sensitive payloads. Local mocks/emulation are labelled; managed-provider proof belongs to T20/T21.

**Continue:** [behavior capture](https://app.clickup.com/t/90141746115/86bcexfnc), [instrumentation scope](https://app.clickup.com/t/90141746115/86bcexkzx). **Reference:** plan §§4–5/P3; ADRs 0003/0005. **Handoff:** real receipts and indexed synthetic facts to T10/T12.

## 5. Tickets for delivery sprint B

### T10 — Record real menu actions without slowing the diner

**Type:** implementation · P3 browser. **Proposed owner:** Shirley, subject to T01. **Support:** Adam and Rania. **Reviewer:** Eirene for contract/delivery and Sai for independent integration review. **Window/effort:** days 6–8, about two focused days plus review. **Depends on:** T03/T04/T08; T09 for final acknowledgement tests.

**Do:** wire events to actual displayed UI changes, not every render or raw pointer move. Include usable menu, card exposure, detail opening/closing/timing, ingredient action, preview lifecycle, compare start/replacement and category selection if retained. Derive revisits/visit end under the agreed rules. Implement a bounded reload-safe browser buffer, receipts and retry policy; preserve event IDs and original references.

**Done:** an end-to-end interaction script verifies one action creates the intended fact. Test fast taps, offscreen cards, repeated ingredient taps, background/idle/resume, comparison cancel/swap, reload/offline, lost/partial acknowledgements, buffer expiry/overflow and duplicate handlers. Missing timing stays incomplete, not zero. No raw search text, inferred allergy, physical QR-scan claim or diner identity. The menu keeps working during capture failure. Viewer-specific events are tested with controlled outcomes now and real T15 integration later.

**Continue:** behavior-capture/instrumentation links in T09. **Reference:** plan §5/P3, accepted T04 version. **Handoff:** real event stream and browser fixtures to T12/T19.

### T11 — Make the owner screens and actions unambiguous

**Type:** design/product decision. **Proposed owner:** Amr. **Support:** Rania for shared components, Eirene for evidence, Vivien for decisions. **Reviewer:** Adam for meaning and Shirley for implementation. **Window/effort:** days 4–7, about two focused days, sequenced around T06. **Depends on:** T01; finalize against T04 metric names.

**Do:** use the [owner artifact](https://claude.ai/artifact/X8uwfdGP6CGttfrDGBnwpu) and FigJam Owner Flow V3 to select the report, overview/tabs, dish detail, ingredient evidence, menu management and action states. Resolve D8: first/returning view, setup/Add Dish priority, report cadence/channel/readiness/reviewer, read status, human-selected suggestions, plan/dismiss/undo/complete behavior, permissions, feedback and operational units. Keep deterministic reviewed reports ahead of later AI chat.

**Done:** every displayed metric maps to T04; states for no data, unknown orders, low samples, stale/partial data and denied access are drawn and labelled. Draft actions cannot publish a menu. Feedback scale/meaning and completion criteria are defined. The selected release scope covers the artifact's metric families; decorative mock values are labelled samples, never presented as measured results.

**Continue:** [owner summary design](https://app.clickup.com/t/90141746115/86bcexfw4), [layout/palette](https://app.clickup.com/t/90141746115/86bchyk6t), [owner-summary scope](https://app.clickup.com/t/90141746115/86bcexm0h). Preserve existing completed design credit. **Reference:** plan §3 owner flow, §6, D8. **Handoff:** screen/state/action contract to T12/T17/T18.

### T12 — Calculate the metrics once and protect every report

**Type:** implementation · P4 backend. **Proposed owner:** Eirene, subject to T01. **Support:** Adam for worked cases. **Reviewer:** Sai for tenant/rebuild correctness and Adam for arithmetic. **Window/effort:** days 7–10, about three focused days plus review. **Depends on:** T04/T09; actual T10 data and T13 orders join before full acceptance.

**Do:** build typed fact queries/projections and the owner report API. A projection is a reusable summary built from recorded facts, such as dish-open counts; it can be rebuilt when late facts arrive. Use one calculation per metric and reuse it in cards, tables, charts and reports. Own report contracts/backend/migrations; coordinate shared-contract edits with T09/T13, never parallel-write the same file.

**Done:** every metric family in §8 below has a formula test, source/coverage rule and display status. Reuse the plan's 20-visit example, then add shuffled/late/repeated/conflicting facts, wrong links, timezone/midnight and zero-denominator cases. Preserve report versions when late evidence updates totals. Server authorization, current membership, transaction-local RLS and database-role tests deny cross-restaurant reports, cached responses and drill-downs. Fewer than ten contributing sessions suppress behavioral cells and complementary totals; this is a privacy rule, not proof of statistical strength. No browser tenant field grants access. Synthetic examples and missing-source states are both tested.

**Continue:** [intelligence scope](https://app.clickup.com/t/90141746115/86bcexm04), taxonomy work in T04. **Reference:** plan §§4/6/P4; ADRs 0005/0006. **Handoff:** response/fixture, reconciliation tests and safe evidence references to T17/T18.

### T13 — Import verified orders and link only what can be proven

**Type:** implementation · P5 order path. **Proposed owner:** Sai. **Support:** Vivien for export process, Adam for measurement. **Reviewer:** Eirene for evidence rules and an independent technical reviewer for authorization/import behavior. **Window/effort:** days 6–8, about two focused days plus review. **Depends on:** T05 confirmed workflow and T04 units; synthetic implementation can begin before real data access.

**Do:** implement one agreed item-level CSV adapter and explicit venue-bound, short-lived code issuance/redemption. Preserve source identity, business timestamp, dish mapping, correction history and completeness evidence. Restrict who may import or redeem; separate all-record order totals from visits with a verified link. Store permitted real files privately, never as public fixtures.

**Done:** tests cover exact re-import, corrected quantities, void/refund, unmapped dish, incomplete export, duplicate/expired/ambiguous/cross-venue code, unauthorized use and timezone boundaries. Unmatched visits stay unknown; they do not become “did not order.” Source order/ticket coverage and linked-visit coverage use separately stated units and denominators. Demonstrate the restaurant's actual export/code procedure before the full pilot; a synthetic importer alone is not venue feasibility.

**Continue:** a new implementation child linked to [behavior capture](https://app.clickup.com/t/90141746115/86bcexfnc) and venue feasibility T05; no live POS integration. **Reference:** plan §6 order dictionary/P5; ADR 0006. **Handoff:** corrected order facts and linkage/coverage evidence to T12/T19/T23.

### T14 — Write the pilot test script and freeze the comparison method

**Type:** research/measurement preparation. **Proposed owner:** Adam. **Support:** Vivien and Eirene. **Reviewer:** Shirley for reproducibility and Sai for implementability. **Window/effort:** days 6–9, about one to two focused days. **Depends on:** T04/T05 and T06 findings.

**Do:** define what the pilot can answer, recruitment/permission, internal-test exclusion, questions, manual observation/audit sheet and stop conditions. Follow the accepted experiment design: randomized balanced service-period blocks within weekday groups, one primary outcome and a frozen intervention, with actual assignment/exposure recorded. In plain words, agree which comparable service periods show each condition before the results arrive. Specify photo-only control, schedule, carryover/contamination and stockout handling, independent block counts and how shared phones/groups affect interpretation. Set the minimum evidence/uncertainty rule before seeing outcomes; do not choose it afterward to make a result look positive. Supply the exact configuration and exposure requirements to T18; a study document alone does not implement assignment.

**Done:** another person can follow the script and reproduce the counts. Diner task success, ingredient clarity, preview behavior, timing coverage, audited event validity, order-linkage completeness and owner usefulness have defined evidence. Compare recorded events with observed actions in a small audit; accepted submissions alone do not prove capture completeness. No claim of reduced waste, greater confidence or increased orders follows automatically from browsing. If the short pilot is too small for the experiment, report that limitation and the operational findings separately.

**Continue:** [diner JTBD](https://app.clickup.com/t/90141746115/86bcex5rr), [taxonomy/measurement](https://app.clickup.com/t/90141746115/86bcex5w6), [AI/evaluation guardrails](https://app.clickup.com/t/90141746115/86bcex5vm); do not redo completed research. **Reference:** Adam Taxonomy §6, plan §6 and [delivery gates](delivery.md). **Handoff:** frozen protocol and audit examples to T19/T23/T24.

### T15 — Add the optional photo-based viewer with a reliable fallback

**Type:** implementation · P5 viewer. **Proposed owner:** Sai. **Support:** Amr and Rania. **Reviewer:** Shirley for devices/failure behavior and Eirene for source provenance. **Window/effort:** days 9–11, about two focused days plus review. **Depends on:** T06/T07/T08; coordinate the T10 event hooks.

**Do:** tap-load the reviewed T1 asset bundle through the existing renderer boundary (`mount / update / dispose`), one active canvas, bounded movement, pause/release offscreen and reduced-motion/keyboard support. Use only the published approved bundle and fallback. Keep T2 gated on real stage capture and fixed budget; it is not a requirement to make 20 full 3D models.

**Done:** real supported assets produce request/first-frame/interacted/failure/fallback facts with the correct attempt. No WebGL, slow network, context loss, unavailable asset, navigation and repeated open/close leave the photo/menu usable without leaks. Budgets pass and target-device evidence is attached in T22. New generated output cannot silently upgrade a published dish. If optional viewer acceptance fails, disable it and label the delivered experience T0; do not claim the 2.5D experiment ran.

**Continue:** spatial/visual tasks in T06. **Reference:** plan §7/P5, ADR 0004. **Handoff:** tested renderer and outcomes to T19/T22.

### T16 — Prepare and approve the restaurant's delivery batch

**Type:** content/visual preparation. **Proposed owner:** Amr. **Support:** Vivien for restaurant coordination; Eirene for source/manifest records. **Reviewer:** the authorized restaurant approver; Shirley checks completeness. **Window/effort:** days 6–12, bounded batches; estimate after T06 rather than promising a fixed number of spatial models. **Depends on:** T02/T05/T06; publication uses T07.

**Do:** work toward 20 eligible dishes with approved T0 photos, names, prices, descriptions and declared ingredients under the chosen policy. Expand T1 only where the measured preparation process succeeds; T2 only with supported capture. Keep source rights, revisions, exact manifests, reviewer decisions and retry/effort records. Coordinate with Amr's T11 design time; if capacity does not fit, T01/day-5 replanning must name assistance or adjust the explicitly approved batch.

**Done:** each dish is either approved/published as an exact bundle or has a named missing item and owner. Never fill gaps with inferred ingredients, nutrition or invented layers. The menu accurately reflects the eligible approved batch. A batch smaller than the proposed 20 needs a recorded scope decision; do not silently call it complete. Failed enhancements retain approved T0.

**Continue:** [multimodal preparation](https://app.clickup.com/t/90141746115/86bcex5tt), [orchestration scope](https://app.clickup.com/t/90141746115/86bcexdce), spatial task in T06. **Reference:** plan §§7–8. **Handoff:** approved batch and unresolved-content list to T19/T22/T23.

## 6. Tickets for delivery sprint C

### T17 — Connect the owner dashboard to real protected reports

**Type:** implementation · P4 frontend. **Proposed owner:** Shirley, subject to T01. **Support:** Amr and Adam. **Reviewer:** Sai for access/integration, Eirene for report consistency. **Window/effort:** days 9–12, about three focused days plus review. **Depends on:** T11 and T12 response contract; acceptance waits for real T12/T13 data or truthful missing states.

**Do:** build the owner sign-in/session boundary and selected dashboard screens in `frontend/console/`. Use the same metric response for overview, tabs, tables, dish detail, ingredients and evidence. Implement approved filters, period labels and capability-based controls. Local synthetic authentication can support development; real Supabase identity belongs to T20. Coordinate staff-menu controls with T07.

**Done:** the same scope/version gives identical numbers everywhere. All §8 families are present in their agreed location with sample size, coverage, freshness and units. Unknown/no-data/suppressed/partial/stale states are understandable, not 0 or fake sample values. Unauthorized/expired access and another restaurant's URL reveal no data. Ingredient details are visible in the approved placement. Browser tests use fixture-backed expected values plus the real local API, not screenshots alone.

**Continue:** owner-summary/intelligence tasks in T11/T12. **Reference:** plan §3 owner screens, §6/P4. **Handoff:** working owner readout to T18/T19.

### T18 — Let the owner review a report and record an action

**Type:** implementation · P6. **Proposed owner:** Eirene, subject to T01. **Support:** Shirley for console integration, Vivien for reviewer/cadence decisions. **Reviewer:** Sai for transitions and Adam for claims. **Window/effort:** days 11–13, about two to three focused days plus review; schedule Shirley's integration after T17 and confirm capacity at day 10. **Depends on:** T11 D8 decisions, T12/T14/T17; T13 for any order-backed claim.

**Do:** implement immutable report/evidence snapshots, human-reviewed suggestion selection and the agreed plan/dismiss/undo/complete transitions. Record permissions, expected versions, completion evidence, feedback scale/reason and read/review state as defined at D8. Add the minimal authorized, versioned experiment configuration from T14 and serve the assigned approved variant, recording actual exposure separately from assignment. Reuse domain commands and exact publication bundles; no general experimentation platform. Use the agreed in-app/manual delivery route unless an external channel is explicitly approved. No AI service is required.

**Done:** an owner can understand one evidence-backed suggestion, plan or dismiss it and reverse/complete it only according to the state table. Old reports retain their reviewed evidence even when new facts arrive. Drill-downs enforce the same privacy rules. Planning an action cannot publish a dish; a menu change still passes review/publication. Missing/stale/suppressed evidence withholds unsupported recommendations. Conflicting edits, retries, revoked access and failed report generation are tested. Test frozen schedule/version, authorized changes, correct period assignment, unavailable-variant fallback and assignment-versus-actual-exposure consistency; no unapproved content is shown by an experiment.

**Continue:** [owner-summary scope](https://app.clickup.com/t/90141746115/86bcexm0h), [agent-pattern research](https://app.clickup.com/t/90141746115/86bcexfrx) as an input, not a requirement to build an agent framework. **Reference:** plan P6/D8 and §10 deferred AI boundary. **Handoff:** reviewed report/action flow to T19/T23.

### T19 — Check the whole local journey before requesting cloud access

**Type:** integration/verification. **Proposed owner:** Shirley coordinates the evidence. **Support:** all implementers. **Reviewer:** Adam checks observed behavior; Sai/Eirene independently review each other's backend changes; a different reviewer checks Shirley's authored UI. **Window/effort:** day 13, about one focused day plus fixes; reserve day-14 contingency only by showing the effect on T20. **Depends on:** T07–T10/T12–T13/T15–T18 integrated and T14 protocol.

**Do:** run the plan's smallest complete journey: review/publish a synthetic dish → open it → use an ingredient control → compare → deliver events → archive/index/rebuild → see the expected owner report → record an action → withdraw. Run a separate dataset with at least ten eligible sessions to test permitted behavioral rendering; the tiny case must stay suppressed. Include explicit order linking and unmatched outcomes.

**Done:** duplicate/late/offline delivery leaves correct totals; another restaurant is denied; owner and staff changes respect authority; rebuild does not repeat side effects. Existing quality, real disposable-Postgres and browser lanes pass on a pinned revision. Record exact commands/results and unresolved failures in the normal verification ledger; update context/docs with code. Independent reviews close their supported findings. No local failure is renamed a provider limitation. Real cloud behavior is still **not tested** here.

**Continue:** [QA/readiness](https://app.clickup.com/t/90141746115/86bcex5wx). **Reference:** plan §9 end-to-end test and [verification](verification.md). **Handoff:** local evidence bundle and remaining provider-only checks to T20.

### T20 — Pass the protected provider checkpoint and connect staging

**Type:** access/deployment integration · P7. **Proposed owner:** Sai. **Support:** Vivien/authorized account owners. **Reviewer:** an independent technical reviewer plus the environment owner for access. **Window/effort:** days 14–15, about one to two focused days plus provider waiting time. **Depends on:** T19 passes; D7 provider choice/access and accepted D4 policy.

**Do:** stop and obtain protected Cloudflare and selected database access at this checkpoint. Supabase is the accepted Auth/database baseline unless a separate decision changes it. Provision only the agreed staging resources and least-privilege bindings. Deploy reviewed main through the protected environment; migrations use their separate credential. Do not put tokens, account secrets or private data in chat, Markdown or `VITE_*`.

**Done:** actual Auth/JWKS, current membership/revocation, TLS/runtime DB role and pooled-connection reuse checks pass. Real Worker/Queue/R2 and owner/diner staging endpoints complete the journey. Anonymous reads and private reports have correct access/cache boundaries. Local success and a deploy configuration alone do not satisfy this ticket. Missing access blocks hosted acceptance and the release date visibly; it does not block earlier local work.

**Continue:** child of QA/readiness. **Reference:** [operations](operations.md) and [ADR 0007](adr/0007-delivery-and-recovery.md). **Handoff:** staging URLs, protected runbook references and exact provider evidence to T21/T22. No credentials belong in the handoff.

## 7. Release window tickets

### T21 — Prove failures, backups and recovery are manageable

**Type:** operational/security verification. **Proposed owner:** Sai. **Support:** Eirene. **Reviewer:** Shirley witnesses the drill and checks the record; independent technical review covers author-owned changes. **Window/effort:** days 16–17, about one focused day plus the timed restore drill/fixes. **Depends on:** T20 and accepted retention/deletion policy.

**Do:** test managed queue/archive/database failures, pending work, recovery queue replay, expired authority and membership revocation. Restore Postgres, approved captures/manifests and archived evidence from the independent backup; reconcile IDs/checksums, apply deletions again and rebuild summaries without external side effects. Verify alerts and name a responder.

**Done:** G3 has measured evidence against content RPO ≤24 hours and restore RTO ≤4 hours, not a configured-but-untested backup. The runbook says who responds, how to disable the optional viewer, stop bad publication and recover safely. Fresh install/upgrade and restoration preserve tenant boundaries. Failed targets block release until fixed or the commitment is explicitly changed; do not waive them in a status note.

**Continue:** QA/readiness. **Reference:** ADR 0007, plan G3, operations. **Handoff:** recovery record and responder checklist to T23.

### T22 — Check real phones, approved content and the restaurant handoff

**Type:** usability/device/operational verification. **Proposed owner:** Shirley. **Support:** Rania, Amr, Adam and Vivien. **Reviewer:** Adam leads independent checks of Shirley's UI; restaurant staff confirm operating instructions. **Window/effort:** days 15–17, about one to two focused days across agreed testers. **Depends on:** T16/T20; planning/test scripts can begin from T03/T14.

**Do:** test target phones and slower connections, accessibility, loading, photo fallback and repeated viewer open/close. Review every published dish's rights/content and QR destination. Confirm staff can approve/withdraw, view permitted reports, handle order codes and use the standard/paper menu when required. Freeze the real latency/device acceptance thresholds before collecting final results.

**Done:** measured load/interaction/bundle results and defects are attached; a desktop screenshot is not mobile performance evidence. Privacy/retention wording, restaurant operator, fallback menu and support/runbook are agreed for G4. Unsupported visuals remain off. Only the accepted real content batch is exposed; fake orders and test visits are excluded from pilot reports.

**Continue:** QA/readiness and diner/owner design review tasks. **Reference:** plan G2/G4, frontend design, ADRs 0004/0005/0007. **Handoff:** go/no-go record to T23.

### T23 — Run the bounded restaurant pilot and check the records daily

**Type:** pilot execution. **Proposed owner:** Vivien. **Support:** Adam conducts the study, Shirley logs issues, Sai/Eirene respond to technical problems. **Reviewer:** restaurant operator confirms the run; Adam/Eirene reconcile measurement. **Window/effort:** days 18–19, scheduled sessions plus daily checks. **Depends on:** T14/T20–T22 and all release gates; no blocker bypass.

**Do:** run the frozen protocol with the accepted menu/control conditions. Check event capture, archived/indexed completeness, timing coverage, eligible samples, order import/linkage and operator feedback. Keep internal tests separate. Log issues with evidence and owner; stop affected functionality if approval, access, withdrawal, privacy or truthful measurement fails.

**Done:** actual participation and limitations are recorded, not assumed. The dashboard reconciles to permitted source records, links and defined cohorts; unmatched outcomes remain unknown. Staff can act on a reviewed report. Insufficient participation means insufficient outcome evidence, not pilot success on sales. If a prerequisite misses the window, report the specific unfinished gate and obtain a revised commitment rather than presenting a demo as the full pilot.

**Continue:** venue/discovery and QA/readiness tasks. **Reference:** T14 protocol, plan G1–G4. **Handoff:** sanitized aggregate evidence, issue list and owner feedback to T24; no private records in the repository.

### T24 — Explain what worked, close the sprint and order the next work

**Type:** analysis/readout. **Proposed owner:** Adam. **Support:** Eirene for calculations, Sai for technical limits, Vivien for decisions. **Reviewer:** Shirley checks traceability; Vivien accepts next priorities. **Window/effort:** day 20, about one focused day. **Depends on:** T23 evidence and T21/T22 results.

**Do:** compare observed results with the questions and definitions frozen in T14/T04. Summarize usability, capture/audit quality, coverage, latency/recovery, asset preparation effort and owner usefulness. Separate observed behavior, verified outcomes and hypotheses. State which accepted ticket deliverables are complete, blocked or intentionally deferred.

**Done:** a concise readout links each claim to an aggregate/report version or check. The team agrees fixes and the next ranked tickets. Unknowns, low samples and delayed outcomes remain visible; no invented confidence, revenue or waste claim. Update the implementation plan, team guide and context to match actual code. Unfinished committed work is not silently relabelled “later.”

**Continue:** measurement, sprint planning and QA/readiness tasks. **Reference:** plan §6/§9 and T14. **Handoff:** reviewed readout and next decision to the team.

## 8. Coverage check before tickets are copied into ClickUp

The implementation plan remains the exact formula reference. T04 records accepted changes from Adam's updated draft; T12 implements those formulas, and T17 displays them. This avoids three slightly different definitions in separate tickets.

| Required output / metric family | Owner tickets | Evidence required |
| --- | --- | --- |
| Diner entry, cards, details, ingredients, compare, category controls and owner link | T03/T08/T10 | Selected design → actual control → valid event or explicit no-event rule |
| Menu visits/entry source, dish opens, first/repeat opens, reach/open rate, consideration mean/distribution | T04/T10/T12/T17 | Eligible visit/opening/exposure cohorts; exact labels and linked examples |
| Active-time averages, coverage, all-dish comparison, period deltas, daily/four-week trends | T04/T10/T12/T17 | Final timing, weighted aggregation, local-period boundaries, comparable baseline and missingness |
| Preview requests/shown/interacted/failure/photo fallback, opening shares, visit adoption and load success | T04/T09/T10/T12/T15/T17 | Attempt lifecycle, actual historical offer, distinct units, pending outcomes and target-device evidence |
| Comparisons, replacements, participation, pairs, compared-opening share, revisits | T04/T10/T12/T17 | Pair versions and same-visit/dish/opening links; retries never count as behavior |
| Ingredient activations, used openings, opportunities, rate and ingredient visitors | T03/T04/T10/T12/T17 | Approved ingredient identity/list revision; correct control effect; repeated taps vs distinct openings |
| Verified order units/tickets, dish/source coverage, linked visits, unknown outcomes and conditional conversion | T04/T05/T12/T13/T17 | Complete/corrected permitted source, explicit link and separately labelled denominators |
| Content readiness/asset coverage, operational job success/retries/time/cost and freshness | T02/T06/T11/T12/T16/T17 | Actual job/attempt records and approved operational units; manual work labelled manual; no made-up automation metrics |
| Report readiness/read state, evidence, human-selected suggestions, action states/undo/completion and feedback | T11/T12/T17/T18 | D8 contract, immutable snapshot, safe evidence access, transition/permission tests |
| Event submission validity, manually audited validity, capture completeness, usable signal/dish coverage | T04/T09/T12/T14/T19/T24 | Clearly separate operational counters, manual audit denominator and missing-before-submission limits |
| Photo truth/rights, 20-dish batch, T0 fallback and bounded T1/T2 | T02/T05/T06/T15/T16/T22 | Approved exact bundle, measured effort/budgets; scope decision for a smaller batch |
| Staff/owner authority, tenant isolation, privacy, withdrawal, retention, restore and real cloud behavior | T02/T07/T09/T12/T13/T19/T20/T21 | Local tests plus independent managed-provider and recovery evidence; no mock-to-production claim |
| Pilot design, implemented assignment/exposure, operator readiness, measured study and honest readout | T05/T14/T18/T22/T23/T24 | Frozen randomized balanced blocks, permitted variants, gates, actual sample/limitations and evidence-linked findings |

### Delivery rules for every implementation ticket

Use the existing folders and contracts described in plan §11. Make a complete behavior slice, not a PR per folder. At pickup, confirm owned paths, callers, tests and migrations; shared files need a single writer or an explicit handoff. Applied migrations are immutable. Keep fixture data synthetic and source rights/private records outside the public repo.

Each PR links its ticket and relevant ADR, explains behavior and limits, adds the necessary tests/docs, updates the affected `docs/CONTEXT.md` node and records verification through the existing runner. Run the narrow relevant check first, then required repository checks. Use the existing quality/database/browser lanes and aggregate CI result; do not create a new CI job for every ticket. Agent reviewers help, but the required independent human review with a comment still applies. AI-assisted code follows the same checks.

For a research/design ticket, attach the selected source/decision, examples, remaining unknowns and named recipient. For code, attach a runnable demonstration plus exact **PASS / FAIL / NOT RUN** commands on the reviewed revision. For a release ticket, attach evidence from the real service/device/restaurant involved. “Done” never means merely that a document, prompt or configuration exists.

### Source and review limits

This pack uses the full updated Adam exports, the existing implementation plan's reviewed source inventory, the October 16 live interests page and a bounded board/workflow status recheck. It does not claim that every earlier ClickUp task or every Figma frame was freshly reopened today. Existing task links are continuation suggestions; their current status and assignees must be confirmed when T01 copies the accepted pack into ClickUp. The two updated Adam documents supersede their older draft attachments for this reconciliation, while accepted ADR differences remain explicit.

The pack proposes work and acceptance tests; it does not claim those future tests have passed or that owners have accepted assignments. The day-20 goal depends on the day-1 capacity decision and the documented venue/provider gates. No new deployment, live assignment or team message is authorized by reading this pack.
