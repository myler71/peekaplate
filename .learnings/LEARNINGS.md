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
