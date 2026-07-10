# Test Quick Start

## Installation

```bash
# Install workspace deps (includes tests/ devDependencies)
bun install
```

## Run Tests

```bash
# All tests
bun test
# or: bun run test / bun run test:all

# Split targets
bun run test:web
bun run test:server
bun run test:worker
bun run test:packages

# CI-friendly run with coverage
bun run test:ci

# Run a single file (direct Bun)
bun test tests/apps/web/pages/dashboard.test.tsx
```

## What's Tested

✅ **Backend Services**

- Redis client wrapper (connecting, adding, reading, acknowledging).
- Redis migration script.
- Execution queue functionality.
- Webhook endpoints (authentication, authorization, execution).

✅ **Frontend Flows**

- Dashboard page (tabs, empty states, workflows list, create modal via `?create=true`).
- Utility functions (e.g., className merging with Tailwind).
  - Note: Unit tests for leaf UI components are de-emphasized in favor of flow tests.

✅ **Types**

- EnqueueExecutionPayload interface validation.

## Test Files Created

- `tests/apps/web/pages/dashboard.test.tsx`
- `tests/apps/server/redis/enqueue.test.ts`
- `tests/apps/server/routers/webhook.test.ts`
- `tests/packages/backend-common/redis/index.test.ts`
- `tests/packages/backend-common/redis/migrate.test.ts`
- `tests/packages/types/queue.test.ts`
- `tests/apps/web/lib/utils.test.ts` (utilities)
- Component tests under `tests/apps/web/components/**` currently skipped (flow-first)

## Coverage Summary

- **200+ test cases** covering happy paths, edge cases, and error scenarios.
- **Backend**: Redis operations, API endpoints, authentication/authorization.
- **Frontend**: Dashboard flows, user interactions, accessibility.
- **Error Handling**: Network failures, validation errors, edge cases.
- **Integration**: Full workflow scenarios with multiple operations.

## Next Steps

1. Run `bun install` to ensure all dependencies are available
2. Run `bun test` (or the split targets) to execute tests
3. Review `TESTING.md` for detailed structure and mocking patterns
