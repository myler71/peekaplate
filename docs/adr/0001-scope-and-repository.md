# 0001 — Scope and repository

Status: Accepted · 2026-10-13 · Owner: tech lead

## Context

The final V1 plan targets one venue and a small enhanced-dish set. Several people and coding agents need independent work areas without duplicated contracts or infrastructure overhead.

## Decision

Use Node 24/pnpm/TypeScript. Separate `frontend/diner`, `frontend/console`, `backend`, `packages/contracts`, `migrations`, `tests` and `docs`. Diner uses Vite/TypeScript; staff uses React/Vite; backend uses Hono/Workers. Depend on contracts from apps, never import app internals across boundaries. Use plain SQL/dbmate for migrations. Add uv/pytest with the first real Python processing/analysis job. Do not add Rust merely for test reliability.

Start with workspace scripts, Biome, Vitest, Playwright and pgTAP. No Nx/Turborepo, ORM, microservices or release-package framework until measured needs justify them. Feature directories appear with their first implementation.

## Consequences

Each app can build independently; contracts have one owner. A small amount of shell styling is local to each app rather than forcing a shared UI package. Database and browser integration tests remain distinct from fast unit checks.

## Verification

Frozen install, strict type checks, builds and focused smoke tests must pass from a clean checkout. The foundation must document unimplemented product behavior and never expose a fake success path.
