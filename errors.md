# Error ledger

Consult this ledger before starting related work. Automatic records below cover only checks run through `node scripts/verify.mjs`; they record an observation, never a root cause.

For a confirmed issue, add a short sanitized entry with the cause, prevention, and regression check. Do not record output, logs, environment values, secrets, customer data, or private source material. Keep records append-only; maintainers may curate older entries.

## Confirmed prevention records

These records describe reproduced tooling defects fixed during foundation verification. They do not imply production incidents.

```json
{"id":"ERR-20261014-001","status":"resolved","area":"initial-bundle-gate","cause":"Initial imports absent from the bundle map were silently filtered out, allowing an unaccounted external import to escape budget inspection.","prevention":"Traverse every initial import and fail when its chunk cannot be accounted for.","sources":["scripts/check-bundle.mjs","scripts/check-bundle.test.mjs"],"regression":"External initial-import fixture fails closed; node --test scripts/check-bundle.test.mjs passed."}
```

```json
{"id":"ERR-20261014-002","status":"resolved","area":"database-test-diagnostics","cause":"The DB harness dropped stderr when a child process failed, concealing an invalid SQL fixture behind only an exit status.","prevention":"Include at most the last 2000 characters of child stderr in console diagnostics; never copy it into this ledger.","sources":["scripts/test-db.mjs","scripts/test-db.test.mjs"],"regression":"Bounded-diagnostic assertion passed; corrected fixture passed real Postgres tests."}
```

```json
{"id":"ERR-20261014-003","status":"resolved","area":"verification-runner","cause":"Direct shell-free pnpm.cmd launch fails on Windows; fresh CI also lacks the ignored work directory needed for its ledger.","prevention":"Use Node with the package manager's existing pnpm entry point, or a fixed allowlisted platform fallback. Create ledger and summary directories before append.","sources":["scripts/verify.mjs","scripts/verify.test.mjs"],"regression":"Real Windows named-check invocation and missing-directory recording tests passed. Signal, exit-code, safe-URL and no-output-capture tests passed."}
```

## Environment observations

These records describe local validation limits, not application failures.

```json
{"id":"ERR-20261014-004","status":"open","area":"native-agent-validation","observation":"An isolated Codex CLI evaluation could not load the five project agent types. A normally configured attempt stopped because the installed CLI 0.147.0 does not support the selected model. Claude Code 2.1.251 was not authenticated.","cause":"Client/model compatibility and missing Claude authentication block native validation; the separate agent-discovery failure has not been diagnosed.","prevention":"Verify client compatibility, authentication and actual named-role launch before claiming native integration works. Prompt-body evaluations must be labelled separately.","sources":["docs/research/reviewer-evaluation.md"],"resolutionRequired":"Repeat native named-role launch and tool-restriction checks in compatible authenticated clients; current prompt behavior tests do not close this observation."}
```

```json
{"id":"ERR-20261014-005","status":"resolved","area":"agent-patch-tool","cause":"The patch tool rejected a document replacement expressed as both delete and add operations for the same path; no files were changed by the rejected patch.","prevention":"Use a single update operation per existing file.","regression":"Both document replacements applied successfully as single update operations; git diff --check passed."}
```

```json
{"id":"ERR-20261014-006","status":"resolved","area":"windows-source-search","cause":"A wildcard supplied as an rg path operand was passed literally on Windows and rejected as an invalid path.","prevention":"Pass explicit paths or use rg --glob with an existing search root.","regression":"The same source query succeeded with explicit package paths and returned the expected development ports, build commands and migration tables."}
```

<!-- automatic observation; not root cause -->
```json
{"kind":"automatic-check-observation","check":"lint","timestamp":"2026-10-14T21:12:26.054Z","exitCode":1}
```

```json
{"id":"ERR-20261014-007","status":"resolved","area":"formatting","cause":"Two edited source files had not been formatted before the recorded check.","prevention":"Format changed files before the final recorded verification.","regression":"pnpm check passed after formatting; formatting remains enforced by CI."}
```

```json
{"id":"ERR-20261014-008","status":"open","area":"windows-docker-startup","observation":"Docker Desktop fails before the Linux engine starts, while initializing an AF_UNIX inference socket. Preserving and recreating only the runtime socket directories did not restore startup.","cause":"The error matches Docker Desktop reports on Windows build 26200; the underlying operating-system cause is not independently proven.","prevention":"Preserve images and volumes; avoid factory resets, pruning or guessed setting changes. Validate docker version and docker info after a controlled Windows restart before running database checks.","sources":["https://github.com/docker/desktop-feedback/issues/527","https://github.com/docker/desktop-feedback/issues/460"],"resolutionRequired":"Restart Windows when work is saved, then verify engine readiness. Linux CI can independently validate the repository database suite."}
```

```json
{"id":"ERR-20261014-009","status":"open","area":"staff-database-test-plan","cause":"The staff SQL fixture declared 17 assertions but emitted 16. The harness correctly failed the mismatch after all emitted assertions passed.","prevention":"Keep the TAP plan synchronized with the assertion count and retain strict plan validation.","sources":["tests/db/staff.sql","scripts/test-db.test.mjs"],"resolutionRequired":"Rerun pnpm verify test:db after correcting the plan to 16; first failing run: https://github.com/vivienk/peekaplate_staging/actions/runs/38639083060."}
```

```json
{"id":"ERR-20261014-010","status":"resolved","area":"shell-quoting","cause":"A nested PowerShell command used double quoting around script variables, allowing the outer shell to expand them before execution.","prevention":"Use single-quoted PowerShell command text with correctly escaped embedded quotes, or a saved script; preserve literal variables until the intended shell reads them.","regression":"Targeted process and configuration inspection succeeded with literal script variables; no application source change was needed."}
```

```json
{"id":"ERR-20261014-011","status":"open","area":"security-review-snapshot","cause":"The security workbench captured a working-tree snapshot before implementation was finalized. Its immutable revision contract no longer matched the reviewed implementation, and the available context update cannot re-pin it.","prevention":"Start durable security scans only after pinning the completed change; never report an obsolete snapshot as a passing review of new code.","resolutionRequired":"The obsolete scan was marked failed with no verdict. Independent pinned architecture and correctness/security review is recorded separately in the PR; a fresh workbench scan requires a subsequent explicit scan task."}
```

```json
{"id":"ERR-20261014-012","status":"resolved","area":"local-resource-cleanup","cause":"A rejected Worker shutdown skipped database and session-file cleanup while the re-entry guard suppressed later cleanup attempts.","prevention":"Protect independent cleanup steps with finally blocks so an earlier rejection cannot bypass them.","sources":["backend/local.mjs","backend/local.test.mjs"],"regression":"The injected Worker-stop failure test failed on the original path because database cleanup was never called; the corrected path must attempt both database removal and session unlink."}
```

```json
{"kind":"resolution","resolves":"ERR-20261014-009","status":"resolved","evidence":"pnpm verify test:db passed: 27 foundation plus 16 staff SQL assertions, 13 real Worker/PostgreSQL integration tests and the local startup/demo path.","run":"https://github.com/vivienk/peekaplate_staging/actions/runs/38639809572"}
```

```json
{"kind":"verification","references":"ERR-20261014-012","evidence":"pnpm check passed with the rejecting-Worker-stop regression test; Linux CI also completed the actual local startup/demo/cleanup path.","run":"https://github.com/vivienk/peekaplate_staging/actions/runs/38639809572"}
```

```json
{"id":"ERR-20261014-013","status":"resolved","area":"security-documentation","cause":"SECURITY.md still described a health-only scaffold after the staff command and restricted runtime role were implemented.","prevention":"Include the security overview when updating implemented trust boundaries; link it in the delivery context node.","sources":["SECURITY.md","backend/src/index.ts","docs/CONTEXT.md"],"regression":"The overview now separates implemented local identity/membership/transaction controls from unverified hosted-provider behavior; documentation and context checks validate its references."}
```
