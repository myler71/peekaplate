# Frontend design handoff

Updated October 15, 2026. There are two surfaces with different access and design sources:

| Surface | Reference | Required entry |
| --- | --- | --- |
| Public diner menu, `frontend/diner/` | [Rania's Figma Design: PeekaPlate](https://www.figma.com/design/l7A9n8tACJic0FIhY49Zjw/PeekaPlate?node-id=0-1) and the diner scope/taxonomy linked in the [implementation plan](implementation_plan.md) | QR/link opens the menu immediately; no diner login |
| Staff and owner console, `frontend/console/` | [Owner dashboard artifact](https://claude.ai/artifact/X8uwfdGP6CGttfrDGBnwpu) | Small **Restaurant owner? Sign in** link at the top of the diner menu; private routes require server-verified identity and restaurant membership |

The current visual handoff is Rania's newly shared Design file, inspected in Brave on October 15. Its 64-page Wireframe PDF export was text-inspected, with menu/detail/comparison frames rendered for visual checks; its Design System page contains colors, typography, spacing, buttons, radii, shadows and mobile-component sections. Confirm the selected final frame set and token values before implementation acceptance. The earlier [Make diner-menu V1](https://www.figma.com/make/bSifEKu5rGS7t0JTvEcXt0/The-diner-menu-V1?code-node-id=0-6) came from Vivien's [commit `36052d3`](https://github.com/vivienk/peekaplate_staging/commit/36052d3823c58d30e9576b97d98df321bc42a8ac); it and the [Claude diner flow](https://claude.ai/artifact/LjkRVm78VioRB2FrVSauwJ) remain historical context. The old Make terms limit does not mean the new Design file is inaccessible.

The separate [FigJam planning board](https://www.figma.com/board/ZkbklvZUkAmhr9suuNTHxW/PeekaPlate?node-id=340-1234) is now accessible. Its Product Structure (Workflow) page was read in Brave on October 15. The [implementation plan](implementation_plan.md#screen-by-screen-build-contract) maps its DIN/OWN screens and buttons to the proposed behavior. This written workflow is separate from Rania's actual Design frames and is not verification of all eight FigJam pages.

Both the board and new Design frames describe ingredient chips/tiles as visual-only; the current request adds a real, keyboard-accessible ingredient panel. Track visible approved ingredient controls separately from deliberate activations so ingredient rates have a valid denominator. Keep direct QR-to-menu entry, remove the estimated-protein comparison row, and distinguish viewer request, actual display, technical failure and displayed photo fallback. The owner's review/publish steps and some action transitions remain proposed or missing in the prototype; their server-authorized behavior must be implemented explicitly.

The [architecture plan](https://claude.ai/artifact/LUJ4ggBXpF7korJWbg4u8f), [visual-tier ADR](adr/0004-visual-tiers.md) and [implementation plan](implementation_plan.md) govern behavior, truthfulness, event meaning and performance. Design references do not authorize restaurant content, image rights, production metrics or a new framework.

The diner scope describes photo-led cards, category navigation, dish details, ingredient information, optional drag/tilt 2.5D and comparison/replacement. Portion measurement, nutrition/protein, reviews, ordering, diner accounts and full 3D/AR are outside that draft's initial scope; shortlist is proposed and waitlist is conditional. Comparing dishes is not measuring their physical portions. Resolve event/control definitions with product before instrumentation.

The 390px checklist is a starting review viewport. Confirm typography, colors, reusable components, spacing and responsive behavior in the selected design handoff; draft tokens are not final. Require useful loading/empty/error/unavailable states, clear photo fallback, keyboard focus/return behavior, reduced motion, sufficient touch targets and safe narrow-screen layout. Use the same states to define browser acceptance tests.

The repository currently contains foundation shells. The next dummy UI may use clearly labelled synthetic fixtures to exercise those states while backend publication and photo preparation progress. Start with a small representative set, then a 20-dish layout fixture; do not portray fake records as approved venue data. Connect to real content only through the approved publication contract.

Each UI PR records the chosen screen/state, source version or dated reference, interaction/event mapping and test evidence. Preserve actual publication and dish exposure references. Menu browsing must work without analytics or WebGL. Three.js remains behind an explicit tap-loaded boundary; viewer failure must not remove the photo/text menu. No live image generation is part of diner browsing.

Acceptance requires bounded screenshots at agreed viewports and working interactions. Existing browser tests cover shells, accessibility and overflow only; they do not establish a complete diner flow, owner authorization, real-phone performance or visual fidelity. Add relevant checks with the feature; do not freeze a brittle screenshot baseline against this evolving draft.

The inspected new frames also contain draft differences: an estimated-protein comparison row, a mandatory-entry mock, Booking headers and inconsistent dish-description/ingredient variants. Resolve these against the agreed scope and approved content. A booking header does not authorize a booking feature. Keep the requested owner-entry link and actual ingredient-panel interactions as explicit design additions. The detailed crosswalk is in the implementation plan.
