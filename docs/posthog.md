# Optional PostHog product analytics

This integration is disabled until an operator supplies a real project token, host, environment and exact frontend origin. It is a best-effort internal product-analytics channel, **not** the durable observation receipt or owner reporting source under [ADR 0003](adr/0003-intent-evidence.md). It never changes staff commands, database events, outbox processing or replay. Do not run both a browser mirror and future server mirror for the same action.

## What exists and what does not

Both current screens are placeholders. After a visitor explicitly opts in, the real screen emits `app_shell_viewed` with `surface=diner` or `surface=console`. This new technical event is not `menu_viewed`, a signed-in owner, a restaurant visit or a sale. The React effect cleans up on unmount/StrictMode remount. No analytics runs before opt-in; missing configuration hides the optional control entirely.

The shared `captureDishIntent(input)` adapter validates the existing strict v1 `DishIntentEventSchema` and preserves `dish_open` and `portion_compare`. It is tested but has **no dish-control caller yet**, because those controls do not exist. When adding a real control, use the analytics instance returned by `mountAnalyticsConsent`; call `captureDishIntent` after the actual display/interaction with its pinned exposure contract. Never call it for shell renders, mere button-down, fixture menus or generic comparisons. Console callers cannot submit diner events.

The [implementation plan](implementation_plan.md#5-proposed-event-contract-exactly-what-to-record) proposes broader v2 events. Menu/card exposures, ingredients, saves, comparison replacement, viewer lifecycle and owner report actions remain unwired until their controls, strict schemas and triggers are reviewed. Historical portion events cannot be renamed into generic comparison events. No two names for one action.

## Privacy and failure behavior

- Consent is off initially and exists only in page memory; reloading requires a fresh choice. No cookie, localStorage, sessionStorage, fingerprint or cross-device identity is created. A random page-scoped ID is generated only when capture starts. Withdrawal aborts pending requests and discards identity; already transmitted events cannot be unsent.
- DNT and GPC prevent capture and are checked for every attempt. A newly observed privacy signal revokes consent. PostHog receives the network connection IP even though the payload sets `$ip=null` and disables GeoIP; configure project-level IP discard before enabling. Do not describe this as completely anonymous transport.
- Only explicit capture API requests are made. No JavaScript SDK, autocapture, replay, heatmaps, automatic pageviews, identity/account properties, remote settings, feature flags, DOM text, query strings or referrer enrichment. Requests omit credentials/referrers and reject redirects.
- Properties are constructed from an allowlist. The adapter excludes the evidence session ID, timestamps, arbitrary renderer strings, experiment arm/block text and all unknown properties. This deliberately loses evidence context and cannot replace the complete canonical event. PostHog person-profile processing is disabled.
- Four in-flight requests maximum, a three-second timeout, 500 attempts per page and at-most-once attempts per dish event ID. Failure returns a bounded result; no retries, persistent queue, console payload logs or blocking UI. Lost events, reloads, opt-outs, blockers and capped traffic mean counts are incomplete. `sent` means HTTP success, not verified ingestion or a durable evidence receipt.

## Separate staging and production configuration

Create two PostHog projects: PeekaPlate Staging and PeekaPlate Production. Copy each **public project ingestion token** (`phc_…`) from project settings; never put a personal API key, project secret, database key or service-role key in `VITE_*`. Public ingestion tokens are intentionally included in browser bundles. No genuine token is committed or fabricated here.

Start from each frontend's `.env.example`. Supply build-time values independently for diner and console:

| Variable | Staging | Production |
| --- | --- | --- |
| `VITE_POSTHOG_ENABLED` | `true` only after privacy review | `true` only after release approval |
| `VITE_POSTHOG_ENVIRONMENT` | `staging` | `production` |
| `VITE_POSTHOG_KEY` | staging project's ingestion token | different production project's ingestion token |
| `VITE_POSTHOG_HOST` | `https://us.i.posthog.com` or `https://eu.i.posthog.com` | host for the chosen production region |
| `VITE_POSTHOG_ALLOWED_ORIGIN` | exact staging origin, no trailing slash | exact approved production origin |
| Vite build mode | `staging` | `production` |

The environment must match Vite's mode; origin must match exactly. A production bundle on a preview/staging/local origin fails closed unless an operator deliberately misconfigures its allowed origin. Region is explicit; unsupported/self-hosted hosts fail closed. Deployment labels from a hosting provider do not determine analytics environment. Keep each token in its own build environment; never reuse the staging token in production. Runtime cannot verify which PostHog project owns a token: check the project name in PostHog before release.

For an approved staging build, inject values into the build process or an ignored `frontend/<app>/.env.staging.local`, then run:

```sh
pnpm --filter @peekaplate/diner exec vite build --mode staging
pnpm --filter @peekaplate/console exec vite build --mode staging
```

Production uses `--mode production` with separately supplied values. The ordinary `pnpm build` remains safe with analytics disabled when no values are provided. These are static Vite builds: setting provider runtime variables **after** uploading assets cannot change tracking; rebuild and upload the reviewed artifacts. To disable, set `VITE_POSTHOG_ENABLED=false`, rebuild and redeploy both surfaces. Do not enable the existing Worker deployment workflow for this frontend-only integration.

## Current environment audit (October 19, 2026)

Read-only GitHub inspection found `main`, `develop` and `staging` diverged, with no enforced protection on those branches, no Actions environments, and no repository variable/secret entries. This PR starts from `develop` per CONTRIBUTING and changes none of those branch refs or provider resources. Reconcile release branches through a separate reviewed release PR. Main's newer operations document records existing directly uploaded staging deployments; this task independently confirmed HTTP success for:

- [Diner staging](https://peekaplate-diner-staging.pages.dev/): foundation message, no published menu.
- [Console staging](https://peekaplate-console-staging.pages.dev/): staff shell and asset references.
- [API health](https://peekaplate-api-staging.vxkong.workers.dev/health): foundation health response.

The frontend allowed origins are those two Pages origins respectively. No production application URL or production project credentials were verified. The marketing domain is not the core diner app. PR 13 separately proposes Python/PostHog documentation; reconcile its “not installed” wording after this implementation merges. This PR does not include or supersede that contributor's Python work.

## Manual PostHog workspace steps and validation

1. An organization administrator creates/selects the two projects and chooses their data region. Provide project access to internal analysts only, with least privilege. No PostHog connector or project credentials were available for this task.
2. In each project's privacy settings, enable **Discard client IP data**, confirm GeoIP is unnecessary, and keep replay/autocapture and person-profile enrichment off. Agree retention and deletion ownership before enabling; the architecture's 30-day proposal is not an approved retention policy. Update the site's privacy notice for PostHog, opt-in, region, retention and deletion handling.
3. Set the real public tokens and hosts in separate build environments as above, then rebuild a reviewed commit. Keep query/personal API credentials server-only if a future authorized reporting service needs them; this integration needs no query credential.
4. On staging, inspect browser Network and PostHog Live events together. Before consent: zero requests. Opt in: one `app_shell_viewed`, correct `surface`, `environment=staging`, no URLs/account fields and no person profile. Reload: no automatic capture. Opt out: no subsequent capture. DNT/GPC: no capture. Block the host: the screen remains usable. Confirm no event appears in the production project.
5. When real dish controls ship, repeat known actions with pinned approved references and verify one v1 event per actual interaction. Never use synthetic fixtures against production. Confirm client caps, blockers and opt-in missingness in any analysis.

Tests intercept a clearly labelled synthetic project token; they do not establish real PostHog ingestion, workspace settings, retention or dashboard creation. Those remain manual acceptance gates.

## Internal analysis versus owner analytics

Create an internal “Integration health” dashboard in staging with event count of `app_shell_viewed`, broken down by `surface` and filtered to `environment=staging`. Label it **opted-in placeholder page views**, not unique diners/owners. The generated distinct ID measures a page lifetime, not a visit or person. Repeat capture after toggling consent can add another technical view.

Once real dish callers exist, exploratory counts of `dish_open` and `portion_compare` can be broken down by `dish_revision_hash` and displayed tier. These are client observations, not verified restaurant facts, consideration rates or orders. Do not expose PostHog shared dashboards to restaurant owners or use client fields as tenant authority. The public ingestion API can be spoofed.

A production owner dashboard still requires server-verified venue access, validated evidence, agreed metric denominators and minimum-ten-eligible-session suppression from [ADR 0006](adr/0006-orders-and-measurement.md). No owner report/query endpoint or dashboard is claimed here. Ingredient rates, saves, order linkage, revenue and causal lift cannot be calculated from this slice.

References: [PostHog capture API](https://posthog.com/docs/api/capture), [anonymous events](https://posthog.com/docs/data/anonymous-vs-identified-events), [IP storage controls](https://posthog.com/docs/privacy/data-storage).
