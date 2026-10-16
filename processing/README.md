# PeekaPlate processing

Python 3.12+ menu-text extraction and draft validation. Local parsing and a
configurable AI mode produce private drafts. Backend integration remains planned.

Run commands from this directory:

```sh
uv sync
uv run python -m unittest discover -s tests
```

`DishDraft` is exported from `peekaplate_processing`:

```python
from peekaplate_processing import DishDraft

draft=DishDraft(
    name="Tomato Soup",
    source_id="synthetic-menu-1",
    source_text="Tomato Soup — tomatoes, onion, basil — 8.50 CAD",
    price_amount="8.50",
    price_currency="CAD",
    ingredients=["tomatoes", "onion", "basil"],
)

draft_json=draft.model_dump_json(indent=2)
```

Name, source ID and supporting source text are required. Description, category,
price, currency, ingredients and mapped image ID default to `None` when unknown.
The pipeline attaches source/image references and verifies their provenance.
Missing ingredients do not become an empty list or an allergen-safety claim.

Prices use finite, nonnegative `Decimal` values. Currency checks enforce three
uppercase letters; they do not verify a real currency code or infer one from a
symbol. A known amount can remain paired with an unknown currency. Add a review
warning when the source is ambiguous.

Provided strings are trimmed, required values and list entries cannot be blank,
and unexpected fields are rejected. Each draft has its own review-warning list.
The status remains `needs_review`; normal attribute assignments are validated.
Validation checks structure, not whether the extracted statements match a source.

This is a processing draft, not the current TypeScript API payload. Review,
approval and publication remain authorized backend commands. Allergen fields
remain deferred until the team agrees their contract and review policy.

Extract the synthetic menu without an API key:

```sh
uv run python -m peekaplate_processing.extract_menus \
    --input tests/fixtures/menu.txt \
    --output work/drafts.json
```

The output is a JSON array of validated dishes. Decimal prices are strings, so
`8.50` keeps its precision, and unknown values become JSON `null`. Every result
remains `needs_review`. Output directories are created as needed. Saving is atomic
and refuses existing files; choose a new output name for another extraction.
The CLI checks existing output before making a potentially billed AI request.

Local mode accepts blank-line-separated records. Start each record with either
`Dish name — 8.50 CAD` or `Name: Dish name` for an unpriced dish. Price headers
also support spaced `-`, `–` or `|` separators, optional inline descriptions, a
currency code before the amount, and `$`, `€` or `£` prefixes. Symbols alone do
not establish a currency code. Amounts must use a decimal point, not a comma.
Additional lines use `Category:`, `Description:`, `Ingredients:` or `Price:`.
Separate declared ingredients with commas or semicolons. Duplicate fields,
unrecognized lines and unsupported prices stop extraction rather than dropping
records. For example:

```text
Tomato Soup — 8.50 CAD
Category: Starters
Description: Slow-cooked tomato soup.
Ingredients: tomatoes, onion, basil

Name: Chef's Special
Description: Ask your server about today's special.
```

The Python entry points are:

```python
from peekaplate_processing.extract_menus import extract_menus, save_drafts

drafts=extract_menus(menu_text, source_id="synthetic-menu-1")
save_drafts(drafts, "work/drafts.json")
```

The caller supplies source identity. If `--source-id` is omitted, the CLI uses
`sha256:<hash of the UTF-8 input text>`. Each dish retains a supporting source
excerpt. Local parsing never infers an ingredient list from a description.

For freer text, choose AI mode and configure your provider:

```sh
export MENU_AI_API_URL="https://your-provider.example/v1/chat/completions"
export MENU_AI_MODEL="your-model"

uv run python -m peekaplate_processing.extract_menus \
    --mode ai \
    --input tests/fixtures/menu.txt \
    --output work/ai-drafts.json
```

Replace the endpoint and model placeholders. If authentication is required, set
`MENU_AI_API_KEY` in your environment; it is not a command-line flag or output
field. `--api-url` and `--model` can override their environment settings. A local
provider may use loopback HTTP; remote endpoints require HTTPS. Redirects and
URLs with embedded username/password credentials are rejected.

The provider must support the Chat Completions JSON-object request/response
format, including `max_tokens`. The implementation follows the
[official OpenAI API reference](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create)
and its [JSON-mode guidance](https://developers.openai.com/api/docs/guides/structured-outputs).
JSON mode does not establish schema adherence, so returned items are validated
locally. Compatibility with a specific provider must be checked when selected.

AI output must contain only `{"dishes": [...]}`. The model proposes food fields
and verbatim source excerpts; it cannot set source IDs, images, approval or
publication state. Excerpts must occur in the input, and supplied names,
descriptions, categories, ingredients, amounts and currency codes need literal
support in their excerpts. These checks do not prove correct dish association,
ingredient completeness or factual safety. Human verification remains required.
Word boundaries prevent partial-word evidence matches, and an empty extracted
ingredient list becomes unknown (`null`) with a review warning.

Both modes accept at most 100,000 characters and 100 dishes. AI responses are
limited to 1 MiB. AI requests use a 30-second timeout by default, configurable
with `--timeout` up to 120 seconds, and make one attempt. Provider errors,
refusals, truncated JSON and unsupported fields stop processing without saving
partial drafts. No automatic fallback or repeated model request is performed.

The tests cover both modes, including mocked provider transport and error
responses. No live provider/model was selected or called during verification.
OCR, PDF acquisition, image mapping, durable background jobs and backend review
integration remain separate work. OCR output can feed this extractor as UTF-8 text.
