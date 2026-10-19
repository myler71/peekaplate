# 0004 — Visual tiers

Status: Accepted · 2026-10-13 · Owner: frontend/graphics

## Context

Capture determines what a visual can truthfully show. The final plan chooses Three.js for a shared T1/T2 scene, while the useful menu must remain lightweight.

## Decision

T0 is static captured photography plus approved facts. T1 uses shallow reviewed cutout cards, restrained ±3° movement. T2 uses real, locked-camera plating stages with limited angles and a video/static fallback. T3/AR is future work.

Introduce Three.js `0.183.x` through one dynamic import when the first viewer slice is implemented; verify and pin the exact patch then. Expose `mount(element, manifest)`, `update(state)` and `dispose()`. Manifests are serializable and renderer-independent. One active canvas; pause offscreen; dispose textures, geometries, materials and renderer. Keep the photo during loading, failure and context loss. Support keyboard and reduced motion.

The initial JS budget is 150 KB gzip with no renderer in the entry graph. T1 adds at most 400 KB including compressed code, manifest and textures. Measure the actual pinned build; the external artifact's 121 KB result is not this repository's measurement. Define T2 budget at G1. Record phone/browser, network profile and timing distributions.

No invented edible surfaces or uncalibrated “actual size” claim. Use a measured plate reference. Verify model/checkpoint licenses before processing captures; the viewer choice does not authorize an ML dependency.

## Consequences and verification

The scaffold deliberately has no unused Three.js dependency or fake viewer. CI checks the actual T0 build budget. The viewer PR adds lifecycle/fallback tests and incremental asset accounting. Real-phone p75 startup, p95 frame time, VoiceOver/TalkBack and captured-dish review remain manual gates.
