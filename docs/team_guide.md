# PeekaPlate: team guide

Updated October 15, 2026.

PeekaPlate is meant to help a restaurant explain its food and learn how people use its menu. The team has been researching that idea and designing the experience. Sai started the code setup. We now have the project structure, checks for new code, and one tested way to save a staff member's draft dish change.

**We do not have a finished menu app yet.** The current design shows where the screens are going. The code so far provides the foundation those screens will use.

This guide starts with the product and progress, then follows the code behind one dish change. The complete file list, dated task board and test evidence are at the end for reference. The [implementation plan](implementation_plan.md) connects the latest team documents to the screens, tracking, food preparation and delivery order.

For the next sprint, start with the plan's [parallel-work and PR sequence](implementation_plan.md#9-delivery-flow-parallel-work-dependencies-and-the-next-pr). Design, a dummy menu, photo preparation and event definitions can progress together. Real tracking joins the published menu; owner reports join verified observations; order measures wait for validated order evidence. The plan includes the screen buttons first, then events, database records, every dashboard formula and a worked example.

## 1. What a restaurant should eventually be able to do

Imagine a restaurant wants to add Tomato Soup to its digital menu. This is an example, not a real restaurant record.

1. Someone supplies a real photo and accurate information about the soup.
2. Staff check the information, correct anything uncertain and approve the exact version diners will see.
3. A diner opens the menu through a link or QR code, reads about the soup and optionally explores a richer photo view.
4. PeekaPlate records useful actions, such as opening the soup's details.
5. The restaurant sees a simple explanation of those actions and can decide what to improve.

The last step needs care. Looking at a dish does not prove that someone ordered it. We must say what we observed and what we still do not know. Connecting browsing to actual orders is separate, later work that needs permission and reliable order data.

The team's core loop is **Menu → Visual Intelligence → Diner Intent → Demand Intelligence → Restaurant Action**. In practice, we first show the food, record observable actions and explain the evidence. Learning what people intended or what increased demand requires additional research and verified outcomes.

There are two experiences. **Figma is the diner menu; the Claude dashboard artifact is for owners.** A QR code or link opens the menu immediately, without diner login. A small **Restaurant owner? Sign in** link at the top leads to the private owner dashboard. Knowing that dashboard address does not grant access: the backend must check the signed-in person's current restaurant permission.

## 2. Where we are today

**Research and design:** the team has worked on diner needs, restaurant interviews, journeys, screen designs, processing requirements and measurement ideas. [Rania's newly shared Figma Design file](https://www.figma.com/design/l7A9n8tACJic0FIhY49Zjw/PeekaPlate?node-id=0-1) is now the current diner visual reference. Its wireframe text and selected menu/detail/comparison frames were inspected in Brave through a PDF export; its Design System sections were inventoried. The older Make V1 added by Vivien remains historical context. The [owner dashboard artifact](https://claude.ai/artifact/X8uwfdGP6CGttfrDGBnwpu) describes the owner's screens. Neither is implemented here. The new design still needs final frame selection, functional ingredient behavior and several draft-copy/scope corrections listed in the plan.

**What the newer documents contribute:** the diner scope describes an anonymous photo-led menu with details, ingredients, optional 2.5D and comparison. The taxonomy describes what those actions could measure. Eirene's workflow and Shirley's supplements describe how source material becomes a reviewed dish. Both processing tasks are still recorded as in progress. The [plan's source review](implementation_plan.md#12-source-coverage-and-remaining-limits) covers all 34 exported Team Docs pages, the supplied scope/taxonomy files and the two processing attachments, with conflicts and access limits stated.

The newly accessible [FigJam planning board](https://www.figma.com/board/ZkbklvZUkAmhr9suuNTHxW/PeekaPlate?node-id=340-1234) also supplies a diner/owner/system/analytics workflow. Its Product Structure page was reviewed in Brave. It is separate from Rania's Design file; the other board pages and every prototype interaction have not been fully rechecked. The plan names those limits instead of calling the whole design finished.

**Food preparation:** the current proposal is a 20-dish batch from owner-supplied photos, using Astra/Claude/Codex to help prepare supported layers. This work has not started. Assets are prepared and reviewed ahead of time; diners will not wait for live image generation. Start with the ordinary photo menu (T0), then shallow photo movement (T1), then selected dishes with real plating-stage captures (T2). Full 3D is a separate feasibility question. Extra photos do not prove hidden ingredients or exact portion size.

**Code foundation:** the repository now has separate places for the diner app, staff app, server rules, database changes, tests and documentation. It also has instructions for coding assistants and checks that run when someone proposes a change.

**First working code flow:** a developer can use a local demo to submit a draft dish change. The backend checks a made-up test identity and its restaurant permission, saves the change and remembers the result. Each saved version of a dish is called a **revision**, like version history in a document. This work was reviewed and merged in [PR #9](https://github.com/vivienk/peekaplate_staging/pull/9).

“Local” means it runs in a development environment with made-up test identities and disposable data. It does not mean the team has a live online staging service. The shared cloud database, real staff sign-in and Cloudflare connections have not been configured.

| Part | What exists now | What still needs building |
| --- | --- | --- |
| Diner screen | A basic staging page | A real restaurant menu based on the design |
| Staff screen | A starter page | Sign-in, editing, review, approval and publishing screens |
| Saving a dish | Tested backend draft-save flow | Connecting it to the staff screen and real identity provider |
| Food visuals | Design direction and written rules | Reviewed assets and the optional interactive viewer |
| Diner tracking | Initial rules for event data | Collecting, storing and reporting actual browsing actions |
| Owner report | Research/design requirements | A report built from real, permitted evidence |

ClickUp's “Complete” status describes a task's recorded progress. It is not proof that a feature works in the code. For example, the approval-path task is marked complete, while approval and publication are still missing from this repository. That mismatch needs to be reconciled with the actual deliverable.

## 3. What “events” mean in PeekaPlate

An **event is a saved record that something happened**. It is not a calendar event, an AI agent or a message sent to the team.

There are two kinds here:

| Kind | Plain example | Why keep it? | Built yet? |
| --- | --- | --- | --- |
| A staff action that changes the product | An authorized person saved a new version of Tomato Soup | Know what changed and preserve its history | Yes, for draft dish revisions |
| An observation of diner behavior | A session opened Tomato Soup's details | Understand how the menu was used | No; the collection flow is planned |

### The events we save today

When the draft changes, the system keeps a record of the change and updates the current dish details. Keeping history this way is called **event sourcing**. We use it for selected changes where history matters; it is not a requirement to turn every setting into an event.

Four records work together when a dish is saved:

- **History:** what change happened. In the code, this is an event.
- **Current dish:** the latest details, ready to read. Developers call this a projection.
- **Saved result:** remembers that this particular request was already handled, so retrying it does not create another change. This is a command receipt.
- **Pending follow-up:** records work that may need delivering later. This is the outbox. The later delivery worker has not been built.

Those records are saved together. If one fails, none of that change should remain saved. This all-or-nothing operation is called a **transaction**.

History also lets us rebuild the current dish from previous changes. That is **replay**. Rebuilding must not send a notification or repeat an outside action. The current code tests rebuilding a dish's data; a complete operational recovery tool is still future work.

### The diner events we will add

Suppose a diner opens the soup details while their connection is unreliable. The future tracking flow needs to remember the observation, retry safely and avoid counting it twice. It must also identify the exact menu and dish version that person saw.

The plan is for the browser to send observations to a receiving service. Accepted observations wait in a **queue**, which holds work until it can be processed. A background consumer will save an archive in Cloudflare R2, then add searchable information to PostgreSQL, our database. Only then should it mark that queued work finished. Failed work needs a recovery path.

This flow is not running yet. A queue is not needed to save today's dish revision: that change is saved directly in the database transaction. Keeping the two paths separate prevents a browsing action from being mistaken for permission to change a restaurant's menu.

### How observations become an owner report

The reporting code will group valid observations into summaries: for example, soup openings, usable active viewing time, previews actually shown and comparisons. These summaries are also called projections or read models. The report reads those prepared results rather than asking the browser to calculate business figures from raw logs.

The owner signs in; the backend checks their restaurant access; the database returns only allowed summaries; the dashboard shows the result with its period, freshness and missing-data labels. Database row rules support that protection. A session is a visit, not a known person. Opening a dish is not ordering it. An absent order record stays **Unknown**, and very small report groups must be hidden under the privacy rules.

The [tracking sections of the plan](implementation_plan.md#4-what-an-event-is-and-how-it-reaches-a-dashboard) explain the pipelines, the proposed event names and every dashboard measure. The frontend can build dummy screens now, but real numbers need that working data path. Ask AI comes later; a prompt cannot replace restaurant access checks or reliable evidence.

## 4. Follow a dish change through the code

The **frontend** is the page someone sees. The **backend** is the code that checks requests and controls data changes. An **API** is the agreed way one program asks another to do something. A **database** keeps information after the request finishes.

The future staff page will ask the backend to save a dish. Today a developer's demo sends that request instead. There is no working staff form or real login screen yet.

The links below point to the merged code at `413be96`, so the line references stay stable as new code is added. A **function** is a named piece of code that performs a job; a **schema** states what information is allowed.

### A. Start a safe test environment

In [backend/local.mjs, `develop()` at line 43](https://github.com/vivienk/peekaplate_staging/blob/413be96/backend/local.mjs#L43), the developer tool starts a temporary database, a test identity service and the backend. [`demo()` at line 10](https://github.com/vivienk/peekaplate_staging/blob/413be96/backend/local.mjs#L10) sends the example dish request. These are development tools. They do not create real staff accounts or put a restaurant online.

### B. Check what was sent

[packages/contracts/src/index.ts, `CreateDishRevisionSchema` at line 68](https://github.com/vivienk/peekaplate_staging/blob/413be96/packages/contracts/src/index.ts#L68) defines the allowed request: a request ID, the version being edited, a name and a description. `DishRevisionScopeSchema` at line 66 checks restaurant/dish IDs; `DishRevisionSchema` at line 75 defines the result.

For example, a blank dish name should fail. Sending an extra field saying “give me editor permission” must not grant permission. This shared file keeps the browser and backend working from the same data rules.

### C. Receive the request and establish identity

[backend/src/index.ts, `createApp()` at line 57](https://github.com/vivienk/peekaplate_staging/blob/413be96/backend/src/index.ts#L57) sets up the backend. Its [dish route at line 75](https://github.com/vivienk/peekaplate_staging/blob/413be96/backend/src/index.ts#L75) receives requests to `POST /venues/:venueId/dishes/:dishId/revisions`. This address means “save a revision of this dish at this restaurant.” It checks the request and passes the verified person to the saving function.

[backend/src/auth.ts, `createStaffVerifier()` at line 35](https://github.com/vivienk/peekaplate_staging/blob/413be96/backend/src/auth.ts#L35) checks the signed identity token supplied with the request. A token is evidence from the configured identity provider about who is calling. Expired, incorrectly signed or unsuitable identities are rejected. The function returns the verified person's ID; it does not by itself grant restaurant access. `bearerToken()` at line 81 reads the token, and `trustedIssuer()` at line 89 checks the configured provider address.

### D. Check restaurant access, retries and competing edits

[backend/src/dish-command.ts, `createDishRevision()` at line 101](https://github.com/vivienk/peekaplate_staging/blob/413be96/backend/src/dish-command.ts#L101) does the main saving work. It first checks whether that person currently has permission to edit this restaurant. Knowing Restaurant A's ID does not let someone from Restaurant B edit it.

The [checks at lines 127–159](https://github.com/vivienk/peekaplate_staging/blob/413be96/backend/src/dish-command.ts#L127-L159) protect retries and simultaneous edits. Imagine two editors start with soup version 1. One saves version 2; the other's old version-1 request is rejected as a conflict instead of overwriting it. If the first editor repeats the identical request after a connection problem, the saved result comes back without creating version 3. Reusing the same request ID for different content also fails.

### E. Save the four records together

The [write section at lines 179–225](https://github.com/vivienk/peekaplate_staging/blob/413be96/backend/src/dish-command.ts#L179-L225) saves the history event, current dish, request result and pending follow-up described above. It commits them together, or rolls the change back if something fails. This prevents a dish from appearing saved while its history is missing.

The database has its own protection too. [migrations/20261014210000_staff_commands.sql](https://github.com/vivienk/peekaplate_staging/blob/413be96/migrations/20261014210000_staff_commands.sql#L2) creates `staff_membership` at line 2 and `dish_current` at line 10. The rules at [lines 22–35](https://github.com/vivienk/peekaplate_staging/blob/413be96/migrations/20261014210000_staff_commands.sql#L22-L35) restrict which rows an ordinary application connection can use. Developers call this row-level security, or RLS. The restricted database role starts at line 37. Actual cloud accounts still need their own permission checks before use.

### F. Return a result; rebuild history when needed

The successful request returns the saved draft revision. The [error handler in index.ts at line 105](https://github.com/vivienk/peekaplate_staging/blob/413be96/backend/src/index.ts#L105) returns controlled errors for identity, permission or version conflicts. Unexpected failures return a generic service error without exposing the database contents or token.

[dish-command.ts, `replayDish()` at line 82](https://github.com/vivienk/peekaplate_staging/blob/413be96/backend/src/dish-command.ts#L82) can rebuild current dish data from a valid sequence of past events. It rejects broken or mixed histories. It does not publish the dish or deliver the outbox work.

### G. Where the screens will connect

[frontend/console/src/main.tsx, lines 8–20](https://github.com/vivienk/peekaplate_staging/blob/413be96/frontend/console/src/main.tsx#L8-L20) currently shows the staff starter screen. This is where a future staff experience begins; it does not call the dish-saving route yet. [frontend/diner/index.html, lines 11–17](https://github.com/vivienk/peekaplate_staging/blob/413be96/frontend/diner/index.html#L11-L17) contains the diner staging message, which works without JavaScript. The real diner menu must read approved, published content once that flow is built.

To see what checks this behavior, start with [backend/src/dish.integration.ts](../backend/src/dish.integration.ts): it exercises the actual backend runtime and database together. The nearby `auth.test.ts` checks identities, `dish-command.test.ts` checks rebuilding history, and `tests/db/staff.sql` checks database permissions. These tests support the claims above; a filename alone is not proof that every possible case is covered.

The two frontend apps and backend share one repository, but they are separate programs. Sharing a folder does not force them onto one production server. The browser must never hold a database administrator password or decide who is allowed to edit a restaurant.

## 5. Why these tools, and where Python fits

The current browser and backend code use **TypeScript**, so they can share rules for requests and responses. **Hono** is the small routing library used by the backend. A **Cloudflare Worker** is where that backend is intended to run online; tests also exercise its runtime locally.

**PostgreSQL** stores the restaurant data and enforces database rules. **Supabase** is the provider in the accepted repository plan because it combines PostgreSQL with staff identity services. The October 14 project update says Vivien is still finalizing Supabase versus Neon. Confirm that decision before setting up accounts. If Neon is chosen, record the change and decide how staff identity will work too.

**Docker** runs a temporary PostgreSQL database for tests. It does not provide restaurant isolation by itself. The backend's permission checks and database rules do that. The Windows startup issue was recovered with Desktop 4.95 on October 14 after backing up the existing data. The local database tests and dish-save demo now pass; each contributor still needs a working Docker engine on their own machine.

**Python is part of the accepted plan for processing or analysis work.** When there is a real job to implement, it should come with its own environment and pytest tests. No Python service exists yet because that processing job has not been built. We have not added a second language just to create an empty folder.

### What T0, T1 and T2 mean

- **T0:** a normal, complete menu with real photos and text. This must work even when optional visuals or tracking fail.
- **T1:** limited movement of reviewed photo cutouts, giving a shallow sense of depth.
- **T2:** separate layers based on real captured plating stages, for selected dishes.

Three.js is the planned tool for drawing the optional interactive view in the browser. It is not a working feature yet. The first direction is photos/2.5D. Older tickets about generated 3D are research to reconcile with that direction; they do not permit inventing ingredients or unseen edible surfaces. The normal menu must remain available if the viewer fails.

## 6. How the current team work fits together

The [October 13 sprint recap](https://discord.com/channels/1556028660832673885/1556115536243589212/1559805887839731717) records these immediate handoffs:

| Person | Current handoff | What the next person needs from it |
| --- | --- | --- |
| Sai | Repository, coding-agent instructions and CI setup | A working starting point, clear checks and an explanation of what is ready |
| Shirley | Readiness plan and task classification | Prioritized risks, remaining questions and evidence needed before building |
| Amr and Rania | Design tokens, colors, typography and layouts | Shared screen designs, reusable style choices and loading/error/fallback states |
| Adam | Diner event taxonomy and measurement plan | Clear names for observations, when they occur and what each one means |
| Vivien | Third-party API list and setup coordination | Confirmed services, access requirements and selected sprint work |

Eirene, Shirley and Vivien also have ClickUp assignments around the dish-processing workflow. Their specifications should explain what comes from a trusted source, what may be uncertain and where a person must review it. Those are inputs to the implementation; they are not already-running AI services.

Keep using the latest prototype while the design system develops. The [design discussion](https://discord.com/channels/1556028660832673885/1556115291577126912) supports refining the existing structure and splitting work to avoid duplication. Accessible light/dark treatments and restaurant branding remain design and implementation work.

The full task snapshot below includes actual assignments and unassigned items. It does not give people new titles or silently assign new work. Sprint numbering, dates and selected scope still need to match the team's current agreement. One restaurant with three dishes appears as a candidate test slice, not a confirmed finished pilot.

## 7. What the checks and coding agents do

A **pull request**, or PR, is a proposed change to the shared code. Before it is merged, GitHub runs **CI**: automatic checks for problems such as invalid code, broken tests, stale documentation references or database rules that allow the wrong access.

The checks are split by purpose. Fast code checks run in the quality job. Relevant database changes also run real PostgreSQL tests; relevant browser changes run browser tests. One final result reports whether the required jobs passed. A documentation change should not needlessly run every browser and database test.

The draft-save tests cover wrong identities, access to another restaurant, revoked access, repeated requests, conflicting edits and partial failures. Passing these tests supports this particular local feature. It does not establish that the whole product, cloud setup or real-phone experience is ready.

Human review still matters, and the normal process requires a human review comment. Automated review must identify itself honestly. A specific authorization to merge the setup does not remove that rule from future work.

The coding-agent files give assistants five jobs: explain the repo, build one assigned change, review architecture, review correctness, or coordinate reviews. These are instruction files, not five services running by themselves. Selected prompt exercises were tested, including a corrected builder prompt; their behavior and client permissions still need checking in normal use.

Two files help continuity: `docs/CONTEXT.md` points an assistant to relevant code and decisions; `errors.md` records sanitized failures, fixes and prevention. Neither is an all-knowing memory. The error file automatically records failures only when checks run through the verification runner; other unexpected failures need a manual entry.

## 8. How to pick up a piece of work

First, connect the research and design deliverables to specific implementation tasks. For each task, record the intended result, the person taking it, the source design or requirement, and how the team will demonstrate completion. A research task may finish with findings. A coding task needs working behavior and relevant tests.

Link completed deliverables and PRs back to their ClickUp tickets during normal team updates, as discussed in the [general channel](https://discord.com/channels/1556028660832673885/1556028661570867252). Developers use `pnpm check` or `pnpm verify <check>` to record verification, then update the affected documentation and context entry. A check that was not run must remain marked NOT RUN.

The dependency plan is the final section of this guide. The commands and setup procedure are in [operations.md](operations.md). Do not start a later step just because a design task with a similar name is marked complete.

For the next demo, be precise about what can be shown: a tested draft-save backend, the current prototype, and the remaining steps connecting them. An online menu, staff sign-in and restaurant analytics should only be described as working after those flows exist and have been exercised.

## Reference: the project files

Start with the code walkthrough above. Open this list when you need to find a particular file; it covers all 99 tracked files at this handoff.

<details>
<summary>Open the complete file-by-file guide</summary>

The filename tells you where to look. The description explains what that file is responsible for. Files with `.test` contain checks; they are not features a restaurant uses. Configuration files tell tools how to run or check the project.

### Start here: project-wide files

| File | Purpose |
| --- | --- |
| [README.md](../README.md) | Public starting page: current capabilities, stack, commands, repository layout and limits |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | How a developer prepares, tests, documents and submits a complete change |
| [AGENTS.md](../AGENTS.md) | Shared rules for contributors and coding agents: authority, scope, evidence and handoffs |
| [CLAUDE.md](../CLAUDE.md) | Points Claude to the same project rules instead of maintaining a competing policy |
| [SECURITY.md](../SECURITY.md) | Security boundaries, private reporting guidance and safe handling of credentials/data |
| [errors.md](../errors.md) | Sanitized failure observations, confirmed causes, fixes and still-open limitations |
| [.learnings/LEARNINGS.md](../.learnings/LEARNINGS.md) | Reusable lessons about tooling and workflow; not a dump of chats or private data |
| [package.json](../package.json) | Root command list, runtime requirements and shared development tools |
| [pnpm-workspace.yaml](../pnpm-workspace.yaml) | Lists the applications/packages and controls dependency installation policy |
| [pnpm-lock.yaml](../pnpm-lock.yaml) | Records the exact dependency tree so installs are repeatable; generated by pnpm |
| [.node-version](../.node-version) | Tells local tools which Node version to use |
| [tsconfig.base.json](../tsconfig.base.json) | Shared strict TypeScript settings |
| [biome.json](../biome.json) | Formatting and import-organization configuration |
| [.editorconfig](../.editorconfig) | Consistent spacing, encoding and line endings across editors |
| [.gitattributes](../.gitattributes) | How Git handles text line endings and binary image files |
| [.gitignore](../.gitignore) | Keeps dependencies, generated output, local credentials and temporary work out of ordinary Git additions |
| [vitest.config.ts](../vitest.config.ts) | Selects fast application/contract/local-tool tests |
| [vitest.db.config.ts](../vitest.db.config.ts) | Selects the separate real database integration tests and their time limits |
| [playwright.config.ts](../playwright.config.ts) | Starts the local apps for browser tests and controls browser output/failure traces |

### Diner frontend: what the customer will open

| File | Purpose |
| --- | --- |
| [frontend/diner/index.html](../frontend/diner/index.html) | Current static staging message; the page content exists even without JavaScript |
| [frontend/diner/src/main.ts](../frontend/diner/src/main.ts) | Current JavaScript entry, which imports styling; future diner behavior belongs here or in modules it uses |
| [frontend/diner/src/style.css](../frontend/diner/src/style.css) | Diner shell appearance and layout |
| [frontend/diner/package.json](../frontend/diner/package.json) | Diner dependencies and its own development/build commands |
| [frontend/diner/tsconfig.json](../frontend/diner/tsconfig.json) | TypeScript settings for this app |
| [frontend/diner/vite.config.ts](../frontend/diner/vite.config.ts) | Diner build configuration, including the initial JavaScript size check |

### Staff console: what restaurant staff will use

| File | Purpose |
| --- | --- |
| [frontend/console/index.html](../frontend/console/index.html) | Browser page that hosts the React console |
| [frontend/console/src/main.tsx](../frontend/console/src/main.tsx) | Current React shell; no working login/edit/review screen yet |
| [frontend/console/src/style.css](../frontend/console/src/style.css) | Console shell appearance and layout |
| [frontend/console/package.json](../frontend/console/package.json) | Console dependencies and commands |
| [frontend/console/tsconfig.json](../frontend/console/tsconfig.json) | TypeScript settings for the console |
| [frontend/console/vite.config.ts](../frontend/console/vite.config.ts) | React/Vite build configuration |

### Backend: identity, permission and changes

| File | Purpose |
| --- | --- |
| [backend/src/index.ts](../backend/src/index.ts) | API entry: health route, dish-revision route, body checks, safe responses and database connection setup |
| [backend/src/index.test.ts](../backend/src/index.test.ts) | Fast HTTP tests for missing identity, invalid requests, size/media limits and configured behavior |
| [backend/src/auth.ts](../backend/src/auth.ts) | Verifies staff tokens using the configured issuer's public keys and returns a verified staff ID |
| [backend/src/auth.test.ts](../backend/src/auth.test.ts) | Tests signed tokens and rejects bad signatures, claims, expiry and unsupported identity cases |
| [backend/src/dish-command.ts](../backend/src/dish-command.ts) | Membership checks, conflict/retry handling, all-or-nothing writes and pure dish replay |
| [backend/src/dish-command.test.ts](../backend/src/dish-command.test.ts) | Fast replay tests, including malformed, mixed or broken event histories |
| [backend/src/dish.integration.ts](../backend/src/dish.integration.ts) | Actual Worker plus PostgreSQL tests, including concurrent edits, rollback and restaurant separation |
| [backend/local.mjs](../backend/local.mjs) | Starts the disposable local database, synthetic identity issuer and Worker; also runs the demo/check mode |
| [backend/local.test.mjs](../backend/local.test.mjs) | Reproduces failed Worker shutdown and checks that remaining cleanup is attempted |
| [backend/wrangler.jsonc](../backend/wrangler.jsonc) | Worker entry, runtime compatibility and local/staging names; hosted auth/database bindings are not supplied |
| [backend/package.json](../backend/package.json) | Backend dependencies and commands |
| [backend/tsconfig.json](../backend/tsconfig.json) | TypeScript settings for backend source |

### Shared contracts and database changes

| File | Purpose |
| --- | --- |
| [packages/contracts/src/index.ts](../packages/contracts/src/index.ts) | Allowed health, dish-command/result and initial diner-observation data shapes; rejects unexpected authority fields |
| [packages/contracts/src/index.test.ts](../packages/contracts/src/index.test.ts) | Checks valid and invalid contract examples |
| [packages/contracts/package.json](../packages/contracts/package.json) | Makes those definitions a shared workspace package |
| [packages/contracts/tsconfig.json](../packages/contracts/tsconfig.json) | TypeScript settings for shared definitions |
| [migrations/202610130001_foundation.sql](../migrations/202610130001_foundation.sql) | Creates the private schema, venues, event history, command receipts, outbox and initial row policies |
| [migrations/20261014210000_staff_commands.sql](../migrations/20261014210000_staff_commands.sql) | Adds staff memberships, current dish views, their policies and restricted runtime grants |

Applied migrations are history. Developers add a new forward migration to change an existing deployed database; they do not edit an old applied file or casually undo event history.

The six current tables have simple jobs: `venues` identifies restaurants; `staff_membership` connects people to permitted restaurant roles; `dish_current` holds the latest dish view; `es_event` holds business history; `es_command` remembers request results; `outbox` holds future delivery work.

### Repository checks and their regression tests

| File | Purpose |
| --- | --- |
| [scripts/check-bundle.mjs](../scripts/check-bundle.mjs) | Counts initially loaded diner JavaScript and rejects an oversized or unaccounted build; guards against loading the optional renderer immediately |
| [scripts/check-bundle.test.mjs](../scripts/check-bundle.test.mjs) | Checks shared chunks, lazy imports, missing imports and size failures |
| [scripts/check-docs.mjs](../scripts/check-docs.mjs) | Checks local Markdown links; does not fetch external pages or judge prose |
| [scripts/check-docs.test.mjs](../scripts/check-docs.test.mjs) | Checks good, broken and unsafe local links |
| [scripts/check-pr.mjs](../scripts/check-pr.mjs) | Requires a meaningful PR structure and stated verification results |
| [scripts/check-pr.test.mjs](../scripts/check-pr.test.mjs) | Rejects missing PR sections and unfinished template text |
| [scripts/context.mjs](../scripts/context.mjs) | Shows a module's context, validates references and refreshes source fingerprints |
| [scripts/context.test.mjs](../scripts/context.test.mjs) | Tests malformed graphs, stale sources and invalid paths |
| [scripts/test-db.mjs](../scripts/test-db.mjs) | Creates isolated Docker databases, applies migrations, runs SQL/Worker/local-flow checks and cleans up |
| [scripts/test-db.test.mjs](../scripts/test-db.test.mjs) | Checks failure reporting and whether SQL test counts/results are valid |
| [scripts/verify.mjs](../scripts/verify.mjs) | Runs the approved named checks and records sanitized failure observations |
| [scripts/verify.test.mjs](../scripts/verify.test.mjs) | Checks failure status, safe recording, directory creation and platform invocation |
| [tests/db/Dockerfile](../tests/db/Dockerfile) | Builds the PostgreSQL test image with pgTAP SQL-test support |
| [tests/db/foundation.sql](../tests/db/foundation.sql) | The 27 foundation database assertions |
| [tests/db/staff.sql](../tests/db/staff.sql) | The 16 staff-role and dish-policy assertions |
| [tests/e2e/foundation.spec.ts](../tests/e2e/foundation.spec.ts) | The four browser shell, accessibility/layout and API-health tests |

### GitHub collaboration and automation

| File | Purpose |
| --- | --- |
| [.github/CODEOWNERS](../.github/CODEOWNERS) | Names review owners; enforcement still depends on GitHub settings |
| [.github/PULL_REQUEST_TEMPLATE.md](../.github/PULL_REQUEST_TEMPLATE.md) | Prompts authors to explain outcome, contract changes, verification and deferred work |
| [.github/dependabot.yml](../.github/dependabot.yml) | Monthly grouped routine updates and separate security-update grouping |
| [.github/workflows/ci.yml](../.github/workflows/ci.yml) | The five purposeful CI jobs described above |
| [.github/workflows/deploy-staging.yml](../.github/workflows/deploy-staging.yml) | Manual main-branch Worker deployment using a staging environment and protected credentials |

### Agent files: who does which job

The `.claude` file is the Claude profile; the matching `.codex` file is the Codex profile. They describe the same responsibility in each client's format. These are instructions, not separately running employees or an automatic review service.

| Files | Responsibility |
| --- | --- |
| [.claude/agents/repo-guide.md](../.claude/agents/repo-guide.md), [.codex/agents/repo-guide.toml](../.codex/agents/repo-guide.toml) | Explain a code path, find relevant decisions and prepare a bounded task brief |
| [.claude/agents/task-builder.md](../.claude/agents/task-builder.md), [.codex/agents/task-builder.toml](../.codex/agents/task-builder.toml) | Implement an explicitly assigned slice, include its tests and hand off changes outside its ownership |
| [.claude/agents/architecture-reviewer.md](../.claude/agents/architecture-reviewer.md), [.codex/agents/architecture-reviewer.toml](../.codex/agents/architecture-reviewer.toml) | Check boundaries, restaurant authority and accepted architecture decisions |
| [.claude/agents/correctness-reviewer.md](../.claude/agents/correctness-reviewer.md), [.codex/agents/correctness-reviewer.toml](../.codex/agents/correctness-reviewer.toml) | Check reachable failures, retries and whether tests support the claims |
| [.claude/agents/review-coordinator.md](../.claude/agents/review-coordinator.md), [.codex/agents/review-coordinator.toml](../.codex/agents/review-coordinator.toml) | Keep reviewers on the same code version and reconcile their evidence |
| [.agents/skills/peekaplate-review/SKILL.md](../.agents/skills/peekaplate-review/SKILL.md) | Shared review method and structured result format used by those roles |

The profiles and selected prompt behaviors were evaluated. The builder initially exceeded its assigned scope in a plan, was corrected and passed a fresh retest. Native profile discovery and tool-permission enforcement in the separate Codex/Claude clients remain unverified. Agent instructions alone cannot enforce permissions or guarantee accuracy.

### Documentation and decisions

| File | Purpose |
| --- | --- |
| [docs/team_guide.md](team_guide.md) | This plain-language walkthrough and next-step guide |
| [docs/implementation_plan.md](implementation_plan.md) | Latest source reconciliation, diner/owner screens, events and metrics, 20-dish preparation, open decisions and ordered parallel work |
| [docs/architecture.md](architecture.md) | System boundaries, data flows and what remains unimplemented |
| [docs/delivery.md](delivery.md) | Ordered feature slices, dependencies, responsibilities and acceptance gates |
| [docs/operations.md](operations.md) | Local commands, API use, cloud setup, release controls and recovery work |
| [docs/verification.md](verification.md) | Connects product/architecture requirements to existing and future test evidence |
| [docs/frontend-design.md](frontend-design.md) | Records the evolving design reference and what the real UI must eventually demonstrate |
| [docs/CONTEXT.md](CONTEXT.md) | Small JSON knowledge map: modules, source paths, dependencies, status, fingerprints and recent handoffs |
| [docs/research/README.md](research/README.md) | The 65-repository pattern survey, sources, adopted ideas and research limits |
| [docs/research/reviewer-evaluation.md](research/reviewer-evaluation.md) | What was actually tested about agent profiles, observed failures and remaining client limits |
| [docs/adr/README.md](adr/README.md) | Index of accepted architecture decisions |
| [docs/adr/0001-scope-and-repository.md](adr/0001-scope-and-repository.md) | Repository boundaries, current tools and when Python belongs |
| [docs/adr/0002-selective-event-sourcing.md](adr/0002-selective-event-sourcing.md) | Which business changes need history, atomic commands, safe retries and replay |
| [docs/adr/0003-intent-evidence.md](adr/0003-intent-evidence.md) | Future diner observations, acceptance receipts, archive ordering and recovery |
| [docs/adr/0004-visual-tiers.md](adr/0004-visual-tiers.md) | T0/T1/T2, truthful food capture, optional rendering and performance/accessibility budgets |
| [docs/adr/0005-tenancy-and-privacy.md](adr/0005-tenancy-and-privacy.md) | Identity, restaurant separation, restricted roles and data retention/deletion responsibilities |
| [docs/adr/0006-orders-and-measurement.md](adr/0006-orders-and-measurement.md) | POS linkage and what the evidence can reasonably tell the owner |
| [docs/adr/0007-delivery-and-recovery.md](adr/0007-delivery-and-recovery.md) | Environments, delivery safeguards, backups and recovery expectations |
| [docs/adr/0008-agent-context-and-review.md](adr/0008-agent-context-and-review.md) | Small source-linked memory, independent review roles and evidence requirements |

### Generated local files are different

`node_modules/` contains installed dependencies. `dist/` contains built output. `.wrangler/` contains local Worker tooling state. `work/local-session.json` holds a short-lived synthetic local session, and other `work/` files are temporary. Browser output goes into ignored report/test-result directories. These are not source files to hand-edit or commit.

Local `.env` and `.dev.vars` files may hold credentials and are ignored. A `.gitignore` rule is useful hygiene, not a guarantee that someone cannot accidentally publish a secret.
</details>

## Reference: the ClickUp task snapshot

Read on October 14, 2026: all 24 top-level tasks and seven sprint-scope subtasks. At the end of the review the [board](https://app.clickup.com/90141746115/v/b/t/90141746115) showed 12 To do, 4 In progress and 8 Complete top-level tasks. Statuses changed during the review, so use ClickUp for the current position. “Unassigned” means the assignee field was empty.

<details>
<summary>Open tasks, recorded assignments and what each contributes</summary>

| ClickUp task |Status | Assigned people | What it contributes |
| --- | --- | --- | --- |
| [Define Sprint Goals + candidate Sprint Backlog](https://app.clickup.com/t/90141746115/86bcex5hb) | In progress | Vivien Kong | Candidate small restaurant/dish workflow and boundaries; planning must select the actual sprint commitment |
| [Sprint 2 Planning](https://app.clickup.com/t/90141746115/86bchxfk2) | To do | Unassigned | Review evidence, carryover, dates, capacity and acceptance criteria |
| [Refine candidate Sprint 1 PBIs + engineering acceptance criteria](https://app.clickup.com/t/90141746115/86bcex5x3) | To do | Vivien Kong | Turn the product idea into one specified flow with inputs, outputs, failures and tests |
| [Run restaurant validation outreach + survey tracking](https://app.clickup.com/t/90141746115/86bcex5wq) | To do | Unassigned | Operator outreach and response tracking; the description asks for team participation |
| [Run lightweight diner + restaurant discovery](https://app.clickup.com/t/90141746115/86bcex99b) | To do | Vivien Kong, Shirley Rosario | Interview findings and assumptions that should change the backlog |
| [Define diner JTBD + behavior hypotheses](https://app.clickup.com/t/90141746115/86bcex5rr) | Complete | Adam H | Explain diners' needs and testable behavior hypotheses; observations are not proof of intent |
| [Map the end-to-end PeekaPlate product system](https://app.clickup.com/t/90141746115/86bcex5qb) | Complete | Vivien Kong | Map content, processing, review, diner experience and measurement; this is a system specification |
| [Create current-state + future-state diner journey map](https://app.clickup.com/t/90141746115/86bcex99f) | Complete | Rania, Amr Hussien | Separate researched behavior from proposed improvements |
| [Create end-to-end diner UX flow](https://app.clickup.com/t/90141746115/86bcex5t5) | Complete | Amr Hussien | Define browsing, dish details, exploration and fallback states |
| [Design clickable interactive menu MVP](https://app.clickup.com/t/90141746115/86bcex5te) | Complete | Amr Hussien | Prototype the core diner path for testing and engineering handoff |
| [Interactive Diner Experience](https://app.clickup.com/t/90141746115/86bcexf9r) | Complete | Rania, Adam H, Amr Hussien | Describe dish interactions; the repository's diner is still a shell |
| [Restaurant owner receives a lightweight summary / report](https://app.clickup.com/t/90141746115/86bcexfw4) | Complete | Amr Hussien, Rania | Specify report content and useful actions; no live report is implemented here |
| [Refine prototype layout + finalize brand palette](https://app.clickup.com/t/90141746115/86bchyk6t) | To do | Amr Hussien, Rania | Refine the existing structure and accessible palette with Vivien's review |
| [Recreate prototype in shared Figma + establish design system](https://app.clickup.com/t/90141746115/86bchyk6w) | To do | Rania, Amr Hussien | Prepare editable shared screens, reusable styles/components and a complete diner screen |
| [Map the complete diner and owner flows](https://app.clickup.com/t/90141746115/86bchyk71) | To do | Amr Hussien, Rania | Connect screens, review/approval, owner actions, failures and tracking points |
| [Design Agent MVP + human-review workflow](https://app.clickup.com/t/90141746115/86bcex9a1) | In progress | Eirene Woo, Shirley Rosario, Vivien Kong | Specify source-to-draft processing, confidence, correction and human review |
| [Specify multimodal dish-processing pipeline](https://app.clickup.com/t/90141746115/86bcex5tt) | In progress | Eirene Woo, Shirley Rosario, Vivien Kong | Define source fields, structured outputs, validation and fallback; not a running pipeline |
| [Define AI evaluation rubric + guardrails](https://app.clickup.com/t/90141746115/86bcex5vm) | To do | Unassigned | Define accuracy, severity, confidence and mandatory human-review rules |
| [Implement minimum human-review / approval path](https://app.clickup.com/t/90141746115/86bcexenj) | Complete | Sai Hemanth Kilaru | Board status requires reconciliation: the repo creates draft revisions, but does not implement approval or publication |
| [Implement 2D → 3D / spatial dish generation slice](https://app.clickup.com/t/90141746115/86bcexezr) | To do | Vivien Kong, Adam H | Investigate asset feasibility, quality and fallback; older generation wording needs alignment with the visual ADR |
| [Define diner behavior event taxonomy + measurement plan](https://app.clickup.com/t/90141746115/86bcex5w6) | In progress | Adam H | Define event names, fields and what can be measured versus inferred |
| [Behavioral events capture](https://app.clickup.com/t/90141746115/86bcexfnc) | To do | Eirene Woo, Vivien Kong | Specify event properties and funnels; the ingest/queue/archive path still needs implementation |
| [Agent analyzes event data and identifies basic patterns](https://app.clickup.com/t/90141746115/86bcexfrx) | To do | Eirene Woo, Vivien Kong, Shirley Rosario | Specify allowed signals, patterns and uncertainty; no analysis agent runs in this repo |
| [Create technical risk + QA readiness plan](https://app.clickup.com/t/90141746115/86bcex5wx) | To do | Vivien Kong, Shirley Rosario | Prioritize latency, cost, truthful output, device performance and event-reliability risks |

JTBD means “jobs to be done”: what a diner is trying to accomplish. PBI means “product backlog item”: a proposed piece of product work. Adam H and Amr Hussien are separate people; matching initials on board cards are not reliable identification.

The seven subtasks below refine the sprint goal. They are additional scope work, not seven extra implemented features.

| Scope subtask | Status | Assigned people | Decision needed |
| --- | --- | --- | --- |
| [Agent Workflow + Orchestration](https://app.clickup.com/t/90141746115/86bcexdce) | In progress | Eirene Woo, Shirley Rosario, Vivien Kong | Inputs, outputs, step sequence, states, handoffs and failures |
| [Users Review + Approval](https://app.clickup.com/t/90141746115/86bcexkyh) | To do | Unassigned | What needs review and the exact approval boundary before publication |
| [Spatial Generation](https://app.clickup.com/t/90141746115/86bcexkyy) | To do | Unassigned | Eligible representations, asset format, quality bar and fallback |
| [Diner Experience](https://app.clickup.com/t/90141746115/86bcexkzb) | To do | Unassigned | Minimum journey and loading/error/fallback states |
| [Behavioral Instrumentation](https://app.clickup.com/t/90141746115/86bcexkzx) | To do | Shirley Rosario, Eirene Woo, Vivien Kong | Minimum observations and fields, distinct from inferred intent |
| [Restaurant Intelligence](https://app.clickup.com/t/90141746115/86bcexm04) | To do | Eirene Woo, Vivien Kong | Allowed aggregated signals and interpretations without causal overclaims |
| [Owner Insight / Report](https://app.clickup.com/t/90141746115/86bcexm0h) | To do | Unassigned | Example report, supporting evidence, limitations and useful next actions |
</details>

## Reference: verification and remaining limits

<details>
<summary>Open the exact test evidence and CI explanation</summary>

PR #9 merged into `main` at `413be96`. Its final reviewed commit `fc08808` passed [PR CI run 38642140834](https://github.com/vivienk/peekaplate_staging/actions/runs/38642140834), and the merged commit passed [main CI run 38642528971](https://github.com/vivienk/peekaplate_staging/actions/runs/38642528971). The ClickUp/Discord additions to this guide are a subsequent documentation update, not additional runtime functionality.

| Evidence | What it establishes | What it does not establish |
| --- | --- | --- |
| 35 application, contract and local-tool tests | Tested parsing, token checks, HTTP behavior, replay rules and shutdown-error cleanup | Every possible input or hosted provider behavior |
| 21 repository-script tests | Tested bundle, documentation, PR, context, database-output and verification-runner safeguards, including pnpm launcher compatibility | That every written explanation is factually correct |
| 43 SQL assertions | Tested schema constraints, restricted-role behavior and row policies | Correct permissions for accounts not yet created at the provider |
| 13 real Worker/PostgreSQL cases | Signed local tokens, atomic writes, concurrency, retry conflicts, rollback, revocation and replay | Real Supabase login or Hyperdrive pooling |
| Local CLI smoke flow on Windows and Linux | Actual local setup, demo command and normal cleanup path | Hosted identity, database pooling or other contributors' machine setup |
| Four browser tests | Shell visibility, no-JavaScript diner content, accessibility scans, narrow layout and health behavior | A completed menu, login, order flow or real-phone viewer |
| Builds and bundle check | Apps build, Worker bundles, initial diner JavaScript stays within its configured budget | Real diner loading speed on a phone/network |
| Independent review | Architecture and correctness reviewers examined a fixed code version and rechecked fixes | Infallibility or automatic permission to deploy |

Review caught a mismatched SQL test count and a shutdown failure that skipped cleanup. Both were corrected. The cleanup test failed before its fix and passed afterward.

### Why there are five CI jobs

| Job | Specific purpose |
| --- | --- |
| `changes` | Decide whether changed paths need database and browser tests |
| `quality` | Check formatting/imports, types, unit/script tests, builds, context, document links and the PR explanation |
| `database` | Test migrations, SQL policies, real Worker/database behavior and the local demo |
| `browser` | Exercise the existing browser shells and their accessibility/layout checks |
| `ci` | Give one final result that fails if a required job failed |

The database and browser jobs run when relevant files change. The current Biome setup enforces formatting/import organization; it is not a broad security or correctness ruleset. Types, tests and review serve different purposes.

Routine dependency updates are monthly and grouped, with at most one open version-update PR per ecosystem. Security updates can arrive sooner. No automatic dependency merge is configured. A past full passing run took about 72 seconds of runner time, excluding the GitHub queue; that is a measurement, not a timing guarantee.
</details>

The repository survey covered 65 public projects' metadata and folder patterns. It was not 65 complete code or security audits. The [research notes](research/README.md) explain what was adopted and why.

Real Supabase authentication, managed database permissions, Hyperdrive connection reuse and hosted latency remain unverified. GitHub review enforcement depends on repository settings; a policy file alone does not enable it. A separate security workbench scan failed without a verdict on an earlier snapshot, so it is not passing evidence for this release. The reviewed code and tests are separate evidence.

The earlier board review covered descriptions, assignments and scope subtasks. The earlier Discord review covered recent visible messages in general, design, daily-updates, product and dev; the last two contained no messages at that time. The October 15 update additionally reviewed the full exported Team Docs tree, the supplied scope/taxonomy files and the two processing-task attachments. It did not audit every external citation, full chat history or embedded visual. Private conversation text and personal details are not reproduced. Workspace links may require access.

## What needs to happen next: order and parallel work

The [implementation plan](implementation_plan.md) is the current detailed planning handoff. It reconciles the team drafts with the accepted [architecture artifact](https://claude.ai/artifact/LUJ4ggBXpF7korJWbg4u8f) and [delivery gates](delivery.md). The sequence below is the short version; these are delivery steps, not GitHub PR numbers.

### Start these pieces together

| Work | Concrete first handoff | What it can run alongside |
| --- | --- | --- |
| Diner design and dummy UI | Menu opens directly; owner sign-in link at top; dish details, comparison, photo/2.5D states and visible failure handling | Backend publication, local tracking and asset preparation. Use synthetic fixtures until approved content exists. |
| Event definitions | Agree each control's event, opening/attempt IDs, timing and comparison meaning; reconcile the old contract names | UI work and synthetic report examples. No real collection before its authority and exposure checks work. |
| Dish preparation | Collect rights-cleared photos/source facts; test a small complete sample, then prepare the proposed 20-dish batch | UI and backend work. T2 needs real plating-stage captures; failed spatial preparation can keep an approved original photo. |
| Staff review and publication | Save source revisions, review the exact content/assets, approve and separately publish; support withdrawal | Diner layout and local event components. Model output never publishes itself. |
| Owner report layout | Dummy overview, six dish tabs, reports, menu and actions with clear unavailable/unknown states | Tracking and calculation fixtures. Real reports wait for verified records. |
| Venue and test preparation | Confirm participation, photo rights, export/code feasibility and concrete acceptance cases | All engineering lanes. Integrated recovery and real-phone checks happen after the connected flow exists. |

The interests document can guide a proposed split: Adam for diner/measurement definitions; Amr and Rania for agreed design handoffs; Eirene and Shirley for processing requirements, evaluation and QA; Vivien for venue/product coordination; Sai for the existing code foundation. Confirm each task and availability in ClickUp. This is not a new assignment, and interest in a topic does not establish an implementation owner.

Before coding the processing automation, settle who can approve/publish, the incomplete ingredient/allergen policy, OCR/URL scope for this sprint, and finite retry/input limits. Before collecting observations, freeze event names, active-time and session rules, eligibility and metric definitions. The plan lists each conflict and its sources so it does not get resolved differently in separate PRs.

### Connect and accept the flows in order

| Step | Observable result | Dependency |
| --- | --- | --- |
| 0–1: Foundation and safe staff changes | Local shells, tests and authorized draft-save flow | Present locally. Real identity/database/provider acceptance is still pending. |
| 2: Approved publication | Exact reviewed dish content/assets become a published photo/text menu; withdrawal works | Existing command/permission rules and agreed review policy |
| 3: Menu and durable observations | Diner sees approved content; accepted observations survive retry without duplicate counts | Publication and exact exposure references. Layout/collector development can start earlier with fixtures. |
| 4: Order linkage | One permitted ticket export connects eligible sessions to items; unmatched outcomes stay unknown | Real observations plus a demonstrated venue/code/export workflow |
| 5: Optional T1, then selected T2 | Reviewed richer views work with keyboard/reduced motion and photo fallback | Approved assets and real exposure tracking; can run alongside step 4 |
| 6: Owner readout and action | Secure, reconciled metrics with coverage and unknowns; owner records one decision | Observations for browsing measures; verified linkage for outcome measures. A browsing-only demo can happen earlier with orders unavailable. |
| 7: Pilot release and recovery | The venue can operate the loop and recover from interruption | Required flows, real-provider verification, restoration, device/accessibility checks and a named operator |

Do not wait for 3D to build the ordinary menu or evidence path. Do not call a mocked dashboard a working report. An observation-only demonstration is useful, but it does not satisfy the accepted outcome-linked pilot gate.

### Dates, decisions and the cloud boundary

The source artifact targets G1 October 19, G2 October 24, G3 October 28, G4 October 29 and readout November 1, 2026. Capture was planned for October 20–22, with October 23 for recapture. These are original targets, not a fresh commitment. Reconfirm them against current staffing, the 20-dish proposal, source material, expanded processing scope and cloud readiness.

- **G1:** truthful content, capture rules and approved T0 material.
- **G2:** defined menu-to-ticket demonstration and measured optional visuals on target phones.
- **G3:** interruption, duplicates, restore and side-effect-free replay demonstrated.
- **G4:** named venue/operator, permissions, retention/privacy wording and runbook.
- **Readout:** explain observed evidence, sample, linkage coverage and limitations; record a useful owner action without promising causal growth.

The $375 cash target excludes labor and is not a current vendor quote. Full 3D/AR, glasses, CRM/SMS and extra POS integrations are outside this launch path. Add Python only with a concrete processing job and its tests. Keep Ask AI separate from the first flow; prompt instructions need server-side authorization and evidence controls before live use.

**Continue locally, then stop at the credential checkpoint.** No Cloudflare or database API keys are needed for synthetic UI, local commands and local queue/storage tests. Real sign-in, managed database roles, pooled connections, hosted Queue/R2 and staging must be verified once the provider decision and protected credentials are available. Do not place credentials in Git, documentation or chat.

The immediate connected slice is **capture → review → approval → publication → public menu read**, while the diner dummy UI, event contract and photo preparation proceed in parallel. The [full plan](implementation_plan.md#9-delivery-flow-parallel-work-dependencies-and-the-next-pr) defines the handoffs and evidence needed to join them. It includes all eight FigJam pages in its source record, exact metric formulas and a worked menu-to-report rehearsal. The team’s original documents remain linked; unresolved product choices are labelled proposals.
