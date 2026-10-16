# Engineering learnings

## LRN-20261013-001 · Tool configuration must match installed major version

**Logged**: 2026-10-14T06:58:00Z
**Priority**: medium
**Status**: resolved
**Area**: tooling
**Category**: knowledge_gap

pnpm 11 reads workspace settings from `pnpm-workspace.yaml`; `.npmrc` is limited to registry/auth settings. Use the `allowBuilds` map for approved dependency install scripts. Older `onlyBuiltDependencies` guidance and `.npmrc` engine/save settings did not establish the intended policy. The committed configuration was corrected and frozen installation verified.

For future major upgrades, inspect the installed schema/current official docs before copying prior configuration. Keep dependency-script approvals narrow and explicit.

Related files: `pnpm-workspace.yaml`, `pnpm-lock.yaml`.

## LRN-20261013-002 · Review the actual subprocess arguments

**Logged**: 2026-10-14T06:58:00Z
**Priority**: medium
**Status**: resolved
**Area**: review
**Category**: best_practice

A review incorrectly inferred a destructive dbmate command from the diagnostic label “reapply migrations.” The actual argument array ended in `up` on both calls. Resolve variables and inspect executable arguments before reporting a verified tool behavior. The label now says “confirm migrations are already applied,” and the reviewer exercise retains this negative control.

Related files: `scripts/test-db.mjs`, `docs/research/reviewer-evaluation.md`.

## LRN-20261014-001 · Diagnose automated PR failures without bypassing the protocol

**Logged**: 2026-10-14T07:25:00Z
**Priority**: medium
**Status**: resolved
**Area**: infra
**Category**: correction

Dependabot's generated body did not satisfy the required PR sections, and its action-version changes also invalidated the delivery context fingerprint. The early metadata failure prevented code checks from running, obscuring independent results. Keep the same documentation/context requirements for automated and human-authored PRs; a collaborator can prepare the missing evidence. Run code/build checks before metadata and expose documentation failures independently inside the existing quality job. Human approval with a review comment remains a merge responsibility, without a duplicate CI workflow.

Related files: `.github/workflows/ci.yml`, `.github/dependabot.yml`, `CONTRIBUTING.md`.

## LRN-20261014-002 · Distinguish deferred tooling from excluded architecture

**Logged**: 2026-10-14
**Priority**: medium
**Status**: resolved
**Area**: docs
**Category**: correction

An onboarding page that lists only the installed stack can imply that a planned language or processing stage has been rejected. State current prerequisites, the accepted extension path and its implementation trigger in the README. Link the owning ADR rather than leaving this distinction only in a delivery document. Keep planned work clearly separate from runnable commands and existing capabilities.

Related files: `README.md`, `docs/adr/0001-scope-and-repository.md`.

## LRN-20261014-003 · Separate planning status from implementation evidence

**Logged**: 2026-10-14
**Priority**: medium
**Status**: resolved
**Area**: docs
**Category**: correction

A task titled “implement” or marked complete may represent research or a design deliverable. Record the task's actual assignment and dated status separately from verified repository behavior. Use confirmed design progress as the current reference even when its handoff ticket is still open. Reconcile mismatches explicitly; do not invent staffing titles or credit planned features as working code.

Follow-up, October 15: when a contributor says a design reference was updated in the repository, inspect recent commits and the affected document before requesting another URL. A loosely named document is not evidence that the source is missing. Record the commit provenance separately from whether the external design can currently be opened.

Source-coverage follow-up: a multi-page design board needs a per-page record distinguishing full text review, visual inspection, empty pages and inaccessible content. Listing page names is not reviewing them. Preserve conflicting draft versions and their provenance; resolve their implementation impact explicitly rather than silently selecting whichever version was read last.

Related files: `docs/team_guide.md`, `docs/frontend-design.md`.

## LRN-20261015-001 · Validate diagrams in their target renderer

**Logged**: 2026-10-15
**Priority**: medium
**Status**: resolved
**Area**: docs
**Category**: correction

An implementation-plan diagram passed document-link and arithmetic checks but failed on GitHub because Mermaid treats an unescaped semicolon as a statement separator. Verify rendered diagrams separately from prose, links and example calculations. The failing GitHub revision and corrected render of all three diagrams are recorded in `errors.md` as ERR-20261015-008. Commit-pinned URLs remain immutable; use a branch URL when readers need later corrections at the same address.

Related file: `docs/implementation_plan.md`. Fix: `dc7e430`.
