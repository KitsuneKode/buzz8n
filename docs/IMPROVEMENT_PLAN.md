# buzz8n Incremental Improvement Plan

Goal: make the monorepo **more complete, accurate, and usable**.

## Principles

1. **Security before features**
2. **One source of truth** (React Query / Zod / env)
3. **Fail closed** where practical
4. Prefer focused PRs; Phase 0–3 currently ship on `cursor/incremental-hardening-920a` for delivery speed

## Status overview

| Phase | Status |
| ----- | ------ |
| 0 Foundation (security, worker, CI, frontend) | Done |
| 1 Completeness (OpenAPI, DLQ, soft-delete, stubs, tests) | Done |
| 2 Operability (CD, metrics, secretlint/audit, E2E smoke) | Done |
| 3 Polish (UI skeleton, fonts, READMEs, seed docs) | Done |

## Phase 0 — Done

Encryption, JWT expiry, list redaction, marketing fixes, worker delConsumer, CI tests, apiClient, health ready, schema uniqueness, GitGuardian-safe secrets.

## Phase 1 — Done

- OpenAPI + Swagger UI at `/api/v1/docs`
- Request IDs + `apiError` on routers
- Soft-delete workflows (`archived`)
- XAUTOCLAIM reclaim + DLQ + retries (max 3)
- Fixed triggerType payload parsing
- OAuth providers hidden from picker until backend exists
- DAG + apiError unit tests

## Phase 2 — Done

- `.github/workflows/deploy.yml` (GHCR build/push)
- Dependabot
- Worker Docker runs `redis:migrate` before start
- `/metrics` Prometheus text exposition
- secretlint + bun audit CI jobs
- Playwright smoke specs (`bun run test:e2e` after `test:e2e:install`)

## Phase 3 — Done

- `Skeleton` in `@buzz8n/ui`; dashboard loading uses it
- Font tokens aligned (no Geist Mono as sans)
- Package READMEs rewritten; `SEED.md` matches seed behavior
- Removed stray `monospace` body class

## Remaining optional follow-ups

- Full Playwright journey with seeded auth (needs running stack)
- Better Auth / real OAuth
- OpenTelemetry / Sentry
- Implement remaining palette node types (`formSubmission`, etc.)
- Split mega-branch into historical topic PRs if desired for review
