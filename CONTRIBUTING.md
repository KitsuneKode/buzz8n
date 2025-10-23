# Contributing to buzz8n

Thank you for your interest in contributing! This document outlines how to develop, test, and submit changes to the project.

## Project Setup

- **Runtime**: Bun + TypeScript
- **Monorepo**: Turbo with workspaces under `apps/`, `packages/`, and `tests/`
- **Apps**: `web` (Next.js), `server` (Express), `worker`
- **Packages**: `backend-common`, `common`, `store` (Prisma), `ui`

```bash
# Install dependencies (root)
bun install

# Run all apps in dev
bun run dev

# Run a single app
bun run dev:web
bun run dev:server
bun run dev:worker
```

## Branch & Commit

- **Branch naming**: `feat/<scope>-<short-desc>`, `fix/<scope>-<short-desc>`, `chore/<scope>-<short-desc>`
- **Commit style**: Conventional Commits are encouraged (e.g., `feat(dashboard): add executions tab`)
- **PR scope**: Keep PRs focused and reasonably small; include a summary of changes and screenshots for UI changes

## Code Style

- **TypeScript**: strict mode across apps/packages
- **Imports**: organized (Prettier + import sorting)
- **Linting**: run `bun run lint` before pushing
- **Formatting**: run `bun run format` (if available) prior to committing

## Testing

All tests are centralized in the `tests/` app and executed with Bun.

```bash
# Run the entire suite
bun run test:all

# Targeted runs
bun run test:web
bun run test:server
bun run test:packages

# CI coverage
bun run test:ci
```

### What to test

- **Flows first**: Prefer integration-style tests of the dashboard and primary user journeys (tabs, empty states, list rendering, actions)
- **Backend behavior**: Queue/Redis, webhook routing, and config utilities
- **Utilities**: Small pure helpers where beneficial
- Avoid deep component unit tests unless the component contains complex logic not covered by flows

### Adding tests

- Place tests under `tests/` mirroring the domain structure
  - Web flows: `tests/apps/web/pages/*.test.tsx`
  - Server behavior: `tests/apps/server/**/*.test.ts`
  - Packages: `tests/packages/**/*.test.ts`
- Name files `<subject>.test.ts` or `.test.tsx`
- Import from `bun:test`
- Use Testing Library for React flows; the DOM is provided by `happy-dom` via Bun preload

### Mocking

- **Next.js**: `mock.module('next/navigation', ...)` to control `useSearchParams`, etc.
- **TanStack Query**: mock `useSuspenseQuery` return values to avoid providers
- **Zustand**: mock stores to control UI state
- **Server**: mock Redis, Prisma, and loggers

See `tests/apps/web/pages/dashboard.test.tsx` and `tests/apps/server/*` for examples.

## Pull Requests

- Ensure the branch is up-to-date with `main`
- Ensure tests pass locally
- Include a concise description, testing notes, and screenshots (for UI)
- If you introduce new environment variables, document them in the relevant app README

## Issue Reporting

- Use the provided templates (if available)
- Include clear steps to reproduce and expected behavior
- Attach logs or screenshots when helpful

## Code Review Guidelines

- Focus on clarity, correctness, and maintainability
- Validate test coverage for new or changed logic
- Prefer incremental improvements over large rewrites

---

Thanks again for contributing to buzz8n!
