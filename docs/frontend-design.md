# Frontend design handoff

The current direction is the [PeekaPlate Flow Prototype](https://claude.ai/artifact/LjkRVm78VioRB2FrVSauwJ), inspected October 14, 2026. It is a Claude prototype, not a Figma file or frozen design specification. The team is still designing it. The [architecture plan](https://claude.ai/artifact/LUJ4ggBXpF7korJWbg4u8f) and [visual-tier ADR](adr/0004-visual-tiers.md) govern behavior, truthfulness and performance.

Observed direction: QR entry, menu loading, category filters, a featured dish, photo-led cards with description/category/price and progressive browsing. The visible treatment uses a light cream/marble background, dark serif titles and warm brand accents. Sample food, prices and imagery are demonstration content; they are not approved venue data or evidence of asset rights.

The existing diner and console are clearly labelled foundation shells. They are not claimed to match the prototype. Do not copy the entire prototype into the application or build its unfinished screens during infrastructure work. No new UI framework, token package or image dependency is needed now.

For the first real diner slice, record the chosen screen/state and the source version or dated screenshot in the PR. Map it to `frontend/diner`; staff workflows belong to `frontend/console`. Start with approved assets and actual design tokens, then reuse local components/styles. If a Figma file arrives, record its frame/node and version instead of inferring them from this URL.

The same slice supplies mobile and desktop layout, loading/empty/error/unavailable states, keyboard focus, reduced motion, useful no-WebGL fallback, and a photo/text menu without analytics. A viewer failure must not remove the menu. Renderer code stays behind the tap-loaded boundary. Do not turn prototype timing, menus or simulated receipts into production claims.

Acceptance includes a bounded screenshot at the selected viewport and working interactions. The existing browser job checks shell accessibility and narrow-screen overflow; approved visual comparisons, real menu performance and real-phone assistive technology checks join the actual feature PR. No brittle pixel baseline is frozen against this evolving draft.
