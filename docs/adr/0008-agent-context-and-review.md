# 0008 — Agent context and review

Status: Accepted · 2026-10-13 · Owner: tech lead

## Context

Rapid work with multiple models needs durable context and skeptical review. A second graph/vector service would add cost and another source of stale truth to a small repository.

## Decision

Keep one repo-owned `docs/CONTEXT.md` JSON graph with module IDs, relevant paths, dependencies, accepted ADRs, status, source fingerprints and at most ten concise handoffs. Git stores history. `context:check` rejects malformed graph references, unsafe/nonexistent paths and stale fingerprints. `context:refresh` only updates fingerprints; an author must review semantic summaries. Never store private conversations, secrets or raw customer data.

Borrow Cognee's source-linked retrieval principle, not its runtime infrastructure. Add a disposable local index only if measured repository size makes path-first retrieval inadequate. Any future generated graph is a cache whose claims point to source; it cannot overrule accepted decisions.

Use a coordinator and two independent read-only review lenses for material changes: architecture/ADR compliance and correctness/tests. Pin base/head and inspect actual execution paths. Findings require file/line, governing requirement, failure mechanism and supporting evidence. Distinguish verified defects, hypotheses, missing evidence and deferred work. Resolve conflicting findings before presenting them. New ADR wording inside the PR cannot retroactively authorize the PR itself.

## Consequences and verification

No numeric “100/100” accuracy promise and no paid LLM service in CI by default. CI enforces deterministic checks; human review approves meaning and risk. Validate context tooling with malformed, stale and broken-reference cases. Exercise the reviewer with a bounded realistic fixture and record misses/false positives; model quality still varies. Agent profiles guide behavior and do not grant extra permissions.
