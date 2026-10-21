# Menu processing and OCR evaluation

Adapted from the existing ingestion implementation at commit `28b91d0` in
[staging PR 16](https://github.com/vivienk/peekaplate_staging/pull/16); original
authorship is retained in `pyproject.toml`. Application work targets `develop`
in the canonical `vivienk/peekaplate` repository.

Python 3.12+ and frozen uv dependencies are required for ingestion:

```sh
uv sync --project processing --frozen
uv run --project processing --frozen python -m unittest discover -s processing/tests
```

The CLI accepts local PDFs, menu photos, UTF-8 text and public static menu URLs.
It preserves source snapshots, page/segment text, draft spans and errors. Usable
native PDF text avoids OCR; scanned/image-bearing pages use OCR.space Engine 3.
Deterministic layout parsing rejects ambiguous layouts. Optional configured AI
extraction already exists, but supported text/table layouts require no LLM.

Create a private `processing/.env` from the blank-key example. Register your own
`OCR_SPACE_API_KEY` with [OCR.space](https://ocr.space/ocrapi); keep it outside
version control and browser configuration. From `processing`:

```sh
uv run --frozen python -m peekaplate_processing.extract_menus \
  --input /path/to/permitted-menu.pdf --output work/menu-report-001.json
```

For a credential-free dry run use `--input tests/fixtures/menu.txt`. Output is a
versioned report object with a `drafts` array, not an array alone. Drafts remain
`needs_review`. Exit codes: 0 complete, 2 incomplete, 1 failed. Choose a fresh
output filename. Extraction success does not mean correct facts or publication.

Source inputs/reports belong in ignored private storage; a report contains the
original source snapshot. Do not commit restaurant menus/photos without permission.
Menu images are text evidence, not verified photographs of actual plated dishes.

## Source regions

OCR requests now explicitly request overlays. Reports retain literal word boxes,
uploaded-byte hashes, upload dimensions and page identifiers. Coordinates refer
to uploaded-image pixels after EXIF orientation and resizing. Map using recorded
dimensions when inspecting the original. Engine 3 boxes are approximate.
Absent/malformed overlays are explicitly `unavailable`/`invalid`; page text
remains available. Overlay requests cost time; settings participate in cache keys.

OCR JPEG uploads are bounded at 950,000 bytes, with a 20-page local PDF job bound.
These implementation limits are not a free-throughput promise. Check current
[OCR.space quotas](https://ocr.space/ocrapi) before live runs. No automatic vendor
switch, paid upgrade or generated food imagery is included.

## Frozen field evaluation

`evaluate_menu.py` uses only the standard library and never calls a provider.
Human reviewers align expected dishes to `evidence[].draft_id`; name matching
would conceal name errors. Null alignment means missed dish; unmatched
predictions count as extras. Freeze each report hash and renew alignment when
reports change. Keep a held-out set and cases for readable/scanned PDF,
rotation, blur, low contrast, multi-column layout, missing fields and failed pages.

A private dataset manifest has `schema_version: 1`, `dataset_version`,
`environment` (`fixture`, `local` or `staging`), named `reviewer`,
`reviewed_at`, and `cases[]`. Each case contains `id`, `conditions[]`,
`report_path` relative to the dataset directory, `report_sha256`,
`source_sha256`, and `expected[]`. Each expected dish contains a unique `id`,
`match_draft_id` (or null), and `fields` labelling all six of `name`,
`description`, `category`, `price_amount`, `price_currency` and `ingredients`.
Use null for unknown facts, decimal strings for prices, and distinct ingredient
strings only when explicitly declared. Do not label absent ingredients as [].

```sh
python3 evaluate_menu.py --dataset work/dataset-v1.json --output work/errors-v1.json
```

Output includes expected/actual errors, per-field counts, missed/extra dishes,
source-span/snapshot errors (including followed menu documents), extraction/model versions, frozen report/dataset hashes, environment and source-condition groups.
Text scoring uses NFC/casefold/whitespace normalization; prices use decimal
equality; ingredient order is ignored. Totals include unknown labels, so inspect
unsupported/missing counts and dish detection separately. Structural provenance
does not establish semantic support. Tests contain synthetic labels only.

Zhiliang approves criteria/thresholds; Uneeza receives reproducible outputs;
Sai independently validates. `acceptance` remains unassessed. Fixture tests do
not measure real menu OCR accuracy or supply their sign-off.

## Delivery boundary

See [the task plan](../docs/ocr-delivery.md). Ingestion/review integration,
backend tenant authority, human approval/publication and diner rendering remain
separate work. The inherited Python draft is not the TypeScript staff payload.
`declared_allergens` remains absent from this inherited schema; adding it
requires the agreed evidence/review contract, never image-based inference.

EasyOCR's Python library and the hosted `easyocr.org` API are distinct services.
Neither is added here. Comparing providers requires the exact service, credentials
and the same reviewed corpus; no pricing/performance equivalence is assumed.
