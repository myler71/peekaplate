# OCR and LLM draft extraction review handoff

Task: [S3-VIS-02 — Evaluate OCR and extract evidence-linked dish fields](https://app.clickup.com/t/86bcnfw5g).
Mohammad owns OCR; Teeyansh owns ingestion integration, Zhiliang criteria,
Uneeza evaluation preparation and Sai independent validation.

## Included implementation

Use `processing/`. PyMuPDF reads each PDF page; 20 or more non-whitespace
characters retain native text, while shorter pages render through OCR.space,
including pages without embedded raster images. Images use the same bounded,
oriented preparation. Reports retain original source bytes/hash, page identities,
native text, extraction method, available word regions, warnings and failures.

LangGraph dispatches numbered text batches to ChatOpenAI for strict dish-schema
extraction. Python merges results and attaches source spans. Unsupported names
or page citations reject the dish; unsupported optional fields become null with
review warnings. Candidate-cache hits are revalidated. All dishes remain
`needs_review`; the separate LLM verification node is pending.

`python -m peekaplate_processing.extract_menus` acquires page text without LLM
calls. `python -m peekaplate_processing.run_pipeline` performs extraction.
The focused suite has 82 deterministic fixture/mocked-provider tests; the
source handoff passed them locally. CI runs the frozen dependencies, tests and
wheel/sdist build. Check the PR for exact commands and current execution results.

## Integration review requested

- Agree one versioned TypeScript/Python contract with S3-VIS-01 and S3-VIS-04.
  The Python `SourceSpan` uses `segment_id`, zero-based `start` and exclusive
  `end`; reports store `drafts` and `evidence` separately, linked by draft index.
- Resolve image/OCR method names, decimal-string/null handling, immutable source
  registry references and Python-code-point versus JavaScript-UTF-16 offsets.
- Preserve failed-page state, page/image coordinate spaces and source text.
  Page-level evidence does not establish a correct dish/price association.
- Route accepted future application changes through existing backend authority
  and human review. This package has no Worker endpoint, database writes,
  content approval or publication integration.

## Acceptance still required

The saved private Denny's run produced 113 drafts from 34 usable pages out of 35;
page 10 failed, and the run was incomplete. It is not a field-accuracy benchmark.
The user reports a successful MiniMax Flash synthetic check; this is distinct
from a new full-menu benchmark. Private PDFs, saved OCR, conversations, `.env`,
installed dependencies and generated run artifacts are excluded from this PR.

Before acceptance, provide permitted representative inputs and reviewed ground
truth for rotation, blur, low contrast, missing fields and multi-column layouts;
agree field-level thresholds with Zhiliang; export reproducible expected/actual
results and errors to Uneeza; obtain Sai's independent validation and Vivien's
PM acceptance. A naturally mixed native/scanned menu is still to be verified.
Existing deterministic tests exercise native, image-only and fallback routing.

Performance profiling/refinements and another live full-menu run are deferred
to the next session. This draft is for implementation and integration review;
its test count does not satisfy the task's quality acceptance criteria.
