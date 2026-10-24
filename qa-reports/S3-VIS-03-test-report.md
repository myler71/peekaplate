# S3-VIS-03 QA and verified fix report

Date: 2026-10-24
Tested commit: `13551752389f751ab6d51df418a64118efa6e2e0`
Branch: `feat/s3-vis-03-asset-delivery`
Pull request: [vivienk/peekaplate#25](https://github.com/vivienk/peekaplate/pull/25)
ClickUp: [86bcnfw7r](https://app.clickup.com/t/86bcnfw7r)

## Environment

| Item | Value |
|---|---|
| OS | Windows 10.0.26200, x64 |
| Python | 3.12.13 through `uv` |
| uv | 0.11.30 |
| Node.js | 24.16.0 |
| pnpm | 11.25.0 |
| Browser | Managed headless Chromium, 390x844 viewport, effective DPR 1.25 |
| Source data | Synthetic fixtures only; repository contains no image assets |

No real restaurant capture, approved layered sample, phone or screen reader was available. Those gates are recorded as `BLOCKED`, not inferred from synthetic results.

## Baseline at `1355175`

| Check | Result | Status |
|---|---|---|
| Python suite | 120 tests, 117 passed, 3 failed | `FAIL` |
| TypeScript unit tests | 56 Vitest tests passed | `PASS` |
| Script tests | 21 `node --test` tests passed | `PASS` |
| T0 700x700 JPEG | exit 0, 272,193 B of 400,000 | `PASS` |
| T0 create-only rerun | exit 2, manifest SHA-256 unchanged | `PASS` |
| T0 3000x4000 EXIF-6 JPEG | oriented 4000x3000, card 480x360, detail 1280x960 | `PASS` |
| T0 negatives | small budget, text input, timezone-less date and blank evidence all exit 2 with no output | `PASS` |
| Spatial negatives | revision mismatch, opaque non-background layer and oversized PNG all exit 2 with no output | `PASS` |
| Harness over `file://` | manifest fetch blocked, one retry, "Preview unavailable", fallback visible | `PASS` |
| Harness over HTTP | 3 layers, spatial and fallback visible, byte total matched manifest | `PASS` |
| Harness failure injection | layer, manifest and fallback failures reported expected errors and retries | `PASS` |

The three Python failures are `test_evaluation.test_private_output_preserves_existing_result`, `test_ingestion.test_private_report_cli_returns_incomplete_exit_code` and `test_ocr_space.test_valid_engine3_cache_avoids_another_request_even_without_key`. All assert `stat().st_mode & 0o777 == 0o600`; on this NTFS volume `os.chmod(path, 0o600)` reports `0o666` (`438 != 384`). The tests come from the stacked OCR commit `33057cc`, CI runs Ubuntu, and they were deliberately not modified.

## Confirmed defects and fixes

### D1 — spatial asset IDs ignored layer names and depths

Before the fix, `processing/src/peekaplate_processing/spatial.py:73-75` hashed only the T0 id, concatenated layer SHA-256 values, motion JSON and recipe version. Three distinct manifests produced the same synthetic id `t1_3dc672d50cc06e4178260637a0b3c3b2`: the default depths, rebalanced depths `0.55/0.7`, and `accent` renamed to `garnish`. A fresh output root therefore created a different bundle under the same id, while the original root refused it as already existing.

Fix: `processing/src/peekaplate_processing/spatial.py:73-78` builds a deterministic JSON signature containing each layer's `name`, `depth` and `sha256`, then hashes it with the T0 id, motion JSON and recipe version. Layer order remains part of the manifest identity.

### D2 — spatial manifests dropped capture evidence and rights confirmation

`processing/src/peekaplate_processing/schemas.py:264-265` required `capture_evidence` and `rights_confirmed: true` in `LayersInput`, but `SpatialManifest` had no corresponding fields and `spatial.py` never wrote them. The delivered artifact therefore lost the validation trace that T0 stores in `AssetManifest.source.capture_evidence`.

Fix: `processing/src/peekaplate_processing/schemas.py:315-316` makes both fields required in `SpatialManifest`, and `processing/src/peekaplate_processing/spatial.py:100-101` copies them from the validated layers input. No TypeScript consumer reads this manifest, and bundles are create-only, so no runtime migration is required.

## Regression evidence

Added to `processing/tests/test_spatial.py:156-177`:

- `test_asset_id_tracks_layer_names_and_depths`
- `test_manifest_records_capture_evidence_and_rights`

Red state before implementation, exactly two failures:

```text
FAIL: test_asset_id_tracks_layer_names_and_depths
AssertionError: 't1_97984284432d9a862cb34b4d1c5356f7' == 't1_97984284432d9a862cb34b4d1c5356f7'

ERROR: test_manifest_records_capture_evidence_and_rights
AttributeError: 'SpatialManifest' object has no attribute 'capture_evidence'
```

Green state after implementation:

```text
Ran 10 tests in 8.160s
OK
```

Full Python suite after the fixes:

```text
Ran 122 tests in 26.186s
FAILED (failures=3)
```

Only the same three Windows-only permission failures remain.

## Test matrix

| Case | Expected | Actual | Status | Evidence |
|---|---|---|---|---|
| T0 JPEG preparation | Ready bundle, source and variants hashed, review required | exit 0, 272,193 B, `needs_review`, `eligible=false` | `PASS` | Baseline manifest |
| T0 create-only rerun | Refuse without changing bytes | exit 2, manifest SHA-256 unchanged | `PASS` | Baseline rerun |
| T0 EXIF orientation | Orient before resizing | 4000x3000 source, 480x360 card, 1280x960 detail | `PASS` | Baseline manifest |
| T0 invalid budget/input/date/evidence | exit 2, no output directory | All four rejected before output | `PASS` | Baseline negative runs |
| Spatial revision mismatch | Reject, write nothing | exit 2, no output | `PASS` | `test_revision_mismatch_is_rejected` |
| Spatial opaque non-background layer | Reject, write nothing | exit 2, no output | `PASS` | `test_layer_dimensions_alpha_and_background_rules` |
| Spatial oversized PNG layers | Reject over budget | exit 2, no output | `PASS` | `test_motion_limits_and_budget_are_enforced` |
| D1 name/depth collision | Different names or depths produce different ids | Regression test failed before, passes after | `PASS` | `test_asset_id_tracks_layer_names_and_depths` |
| D2 provenance | Serialized manifest retains both validated fields | Regression test failed before, passes after | `PASS` | `test_manifest_records_capture_evidence_and_rights` |
| Fixed synthetic bundle | Reprocesses successfully | T0 `t0_ab4bb80d…`, T1 `t1_1170ed2e…` | `PASS` | `processing/work/qa-vis03/` |
| Harness over HTTP | 3 layers, fallback retained, byte total matches | `layersLoaded=3`, both visible, `48,823 == 48,823` | `PASS` | `harness-metrics-loaded.json` |
| Pointer/keyboard clamp | Yaw clamps at 3 degrees | `rotateY(3deg)` after pointer plus 40 `ArrowRight` | `PASS` | `clamped` value in browser run |
| `Home` reset | Zero both axes | `rotateX(0deg) rotateY(0deg)` | `PASS` | `reset` value in browser run |
| Missing layer | `layer_load_failed`, retry once, fallback visible | `layerRetries.subject=1`, fallback visible | `PASS` | `harness-metrics-layer-failure.json` |
| Missing manifest | One retry, fallback visible | `manifestRetries=1`, fallback visible | `PASS` | `harness-metrics-manifest-failure.json` |
| Missing fallback | `fallback_load_failed` | error recorded, fallback hidden | `PASS` | `harness-metrics-fallback-failure.json` |
| Failure recovery | Restoring each file restores the 3-layer preview | Every restore reloaded successfully | `PASS` | Browser reruns |
| TypeScript tests | All unit tests pass | 56 + 21 passed | `PASS` | `pnpm verify test` |
| Lint, typecheck, build | All tracked files pass | Biome, 5 typechecks, 3 builds passed | `PASS` | `pnpm verify lint typecheck test build` |
| Python suite | No new failures | 122 tests, 119 pass, same 3 NTFS failures | `FAIL` | Full suite output |
| Context/docs checks | Fresh context and valid local links | 10 modules, 10 handoffs; 41 Markdown files | `PASS` | `pnpm verify context:check docs:check` |
| PR body check | Valid when applicable | "not applicable to this event" | `PASS` | `pnpm verify pr:check` |
| PR mergeability | Clean against `develop` | GitHub reports `DIRTY` | `BLOCKED` | PR #25 metadata |

Biome also scans untracked generated `graphify-out/` JSON. That directory was moved outside the worktree only for the lint gate and restored byte-for-byte afterward; no repository file was changed for this workaround.

## Budget measurements

| Fixture | Total bytes | Budget | Status |
|---|---:|---:|---|
| T0 700x700 JPEG | 272,193 | 400,000 | `PASS` |
| T0 3000x4000 EXIF-6 JPEG | 330,054 | 400,000 | `PASS` |
| T0 fixed synthetic rerun | 36,855 | 400,000 | `PASS` |
| T1 PNG at detail-1280 | >400,000 before fallback; background 1,538 KiB, alpha subject 1,858 KiB | 400,000 | `FAIL` |
| T1 lossy WebP q82 recorded bundle | 369,408 (92.4%) | 400,000 | `PASS` |
| T1 fixed synthetic rerun | 48,823 | 400,000 | `PASS` |

The PNG result is a budget/product decision, not a validation defect: refusal is correct. The ADR 0004 ceiling is unreachable with lossless PNG layers at `detail-1280`; the recorded WebP q82 trial fits at 92.4%. PM and ADR owners must choose the accepted format/quality before a real sample is prepared.

## Harness evidence

The fixed bundle was served with `python -m http.server 8973 --bind 127.0.0.1`. Chromium was forced to `prefers-reduced-motion: no-preference` through CDP before reload because the headless default silently zeroes every transform.

Loaded metrics: `manifestFetchMs=15.8`, `firstRenderMs=64.2`, `layersLoaded=3`, `spatialVisible=true`, `fallbackVisible=true`, `spatialError=null`, `totalAssetBytes=48823`, `budgetBytes=400000`.

Evidence files, intentionally not committed:

- `processing/work/qa-vis03/harness-loaded.png`
- `processing/work/qa-vis03/harness-metrics-loaded.json`
- `processing/work/qa-vis03/harness-metrics-layer-failure.json`
- `processing/work/qa-vis03/harness-metrics-manifest-failure.json`
- `processing/work/qa-vis03/harness-metrics-fallback-failure.json`

The harness requires HTTP. Opening `harness.html` through `file://` blocks the manifest `fetch`; after one retry it shows "Preview unavailable" and retains the fallback. `processing/README.md:184-186` now documents this requirement.

## Independent code review

A separate read-only `reviewer` agent reviewed the complete working diff before commit. Verdict: `READY TO MERGE`. It found no critical or important issues. Its one minor note was that layer order forms part of the identity because it controls equal-depth paint order; `docs/asset-delivery.md:31-32` now states that the signature uses manifest order. The reviewer confirmed the two regression tests exercise the real bundle path, the new required schema fields have no TypeScript consumer, and no out-of-scope test was weakened.

## ClickUp acceptance checklist

| Acceptance criterion | Status | Evidence |
|---|---|---|
| Process sources with immutable source/revision references and processing state | `PASS` | T0 and T1 manifests carry source hashes, `source_t0`, dish/revision and ordered processing steps |
| Demonstrate one approved 2.5D sample when ready | `BLOCKED` | Only the labeled synthetic sample exists; no approved human-prepared capture |
| Failures retain approved T0 photo | `PASS` | Layer, manifest and fallback failure runs retain fallback where applicable |
| Measure mobile load/render cost against agreed budget | `BLOCKED` | Desktop headless Chromium only; no real-phone p75/p95 |
| Avoid fabricated food imagery and unapproved substitutes | `PASS` | Synthetic geometries explicitly labeled `SYNTHETIC FIXTURE`; no generated food |
| Verify missing images, failed downloads, rendering errors and retries | `PASS` | Three failure injections plus recovery runs |
| Publication eligibility requires human approval | `PASS` | Every generated manifest remains `needs_review`, `eligible=false` |
| Linked PR, CI/build and browser evidence | `PASS` | PR #25, local Python/TS/build/harness evidence in this report |
| Independent review by Sai (`@hemu77`) | `BLOCKED` | External reviewer has not completed review |
| Rebase after PR #24 and rerun CI | `BLOCKED` | Required order is #23 -> #24 -> #25; merge state is `DIRTY` |
| Real restaurant photo, phone measurement and VoiceOver/TalkBack | `BLOCKED` | No permitted capture or device available |
| S3-ARC-01, S3-DIN-03 and S3-RES-02 alignment | `BLOCKED` | Contract freeze and downstream integration remain open |
| PM acceptance, restaurant handoff and diner approval | `BLOCKED` | Vivien, Shirley and Adam sign-off outstanding |

## Blocked and not tested

`BLOCKED`:

- Real permitted restaurant photo and real layered sample.
- Real-phone startup, frame-time and thermal measurements; the recorded viewport used DPR 1.25, not a phone.
- VoiceOver and TalkBack verification.
- PNG-versus-WebP budget decision by PM/ADR owners.
- Rebase and conflict resolution against `develop`; this change must not rebase the stacked PR.
- External independent review and human publication approvals.

`NOT TESTED`:

- Production publication API, because S3-RES-02 is not built.
- Diner viewer integration, because S3-DIN-03 is separate.
- Full 3D rendering, which is outside S3-VIS-03.
- Production deployment and real-device network variability.

## Publication record

- Final code commit: `8fa4a0bf3a53443b7e9dce60731c6ae4fdc1c783`
- PR verification comment: https://github.com/vivienk/peekaplate/pull/25#issuecomment-6388963012
- ClickUp task `86bcnfw7r`: QA summary comment posted; status, assignee and merge state deliberately unchanged.
