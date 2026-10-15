# Frontend design handoff

Updated October 15, 2026. There are two surfaces with different access and design sources:

| Surface | Reference | Required entry |
| --- | --- | --- |
| Public diner menu, `frontend/diner/` | [Figma: The diner menu V1](https://www.figma.com/make/bSifEKu5rGS7t0JTvEcXt0/The-diner-menu-V1?code-node-id=0-6&p=f&t=4dpQxA2jzoNs34mQ-0&fullscreen=1) and the diner scope/taxonomy linked in the [implementation plan](implementation_plan.md) | QR/link opens the menu immediately; no diner login |
| Staff and owner console, `frontend/console/` | [Owner dashboard artifact](https://claude.ai/artifact/X8uwfdGP6CGttfrDGBnwpu) | Small **Restaurant owner? Sign in** link at the top of the diner menu; private routes require server-verified identity and restaurant membership |

The earlier [Claude diner flow](https://claude.ai/artifact/LjkRVm78VioRB2FrVSauwJ) is historical design context. Figma is the known current diner reference, with further design in progress. No separate GitHub `team_docs` location was identified. A fresh Figma preview inspection on October 15 stopped at account terms acceptance, so no frame-by-frame visual verification is claimed here. The owner-entry link is current product direction, not a claim about an existing Figma control.

The [architecture plan](https://claude.ai/artifact/LUJ4ggBXpF7korJWbg4u8f), [visual-tier ADR](adr/0004-visual-tiers.md) and [implementation plan](implementation_plan.md) govern behavior, truthfulness, event meaning and performance. Design references do not authorize restaurant content, image rights, production metrics or a new framework.

The diner scope describes photo-led cards, category navigation, dish details, ingredient information, optional drag/tilt 2.5D and comparison/replacement. Portion measurement, nutrition/protein, reviews, ordering, diner accounts and full 3D/AR are outside that draft's initial scope; shortlist is proposed and waitlist is conditional. Comparing dishes is not measuring their physical portions. Resolve event/control definitions with product before instrumentation.

The 390px checklist is a starting review viewport. Confirm typography, colors, reusable components, spacing and responsive behavior in the selected design handoff; draft tokens are not final. Require useful loading/empty/error/unavailable states, clear photo fallback, keyboard focus/return behavior, reduced motion, sufficient touch targets and safe narrow-screen layout. Use the same states to define browser acceptance tests.

The repository currently contains foundation shells. The next dummy UI may use clearly labelled synthetic fixtures to exercise those states while backend publication and photo preparation progress. Start with a small representative set, then a 20-dish layout fixture; do not portray fake records as approved venue data. Connect to real content only through the approved publication contract.

Each UI PR records the chosen screen/state, source version or dated reference, interaction/event mapping and test evidence. Preserve actual publication and dish exposure references. Menu browsing must work without analytics or WebGL. Three.js remains behind an explicit tap-loaded boundary; viewer failure must not remove the photo/text menu. No live image generation is part of diner browsing.

Acceptance requires bounded screenshots at agreed viewports and working interactions. Existing browser tests cover shells, accessibility and overflow only; they do not establish a complete diner flow, owner authorization, real-phone performance or visual fidelity. Add relevant checks with the feature; do not freeze a brittle screenshot baseline against this evolving draft.
