# Test Quick Start

## Installation

```bash
# Install testing dependencies for React components
bun add -d @testing-library/react @testing-library/dom happy-dom
```

## Run Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test apps/server/src/redis/__tests__/enqueue.test.ts

# Run with coverage
bun test --coverage

# Watch mode
bun test --watch
```

## What's Tested

✅ **Backend Services**
- Redis client wrapper (connecting, adding, reading, acknowledging).
- Redis migration script.
- Execution queue functionality.
- Webhook endpoints (authentication, authorization, execution).

✅ **Frontend Components**
- Copy button (copying, clipboard operations, UI states).
- Password input (visibility toggle, accessibility).
- Utility functions (className merging with Tailwind).

✅ **Types**
- EnqueueExecutionPayload interface validation.

## Test Files Created

- `packages/backend-common/src/redis/__tests__/index.test.ts`
- `packages/backend-common/src/redis/__tests__/migrate.test.ts`
- `packages/backend-common/src/types/__tests__/queue.test.ts`
- `apps/server/src/redis/__tests__/enqueue.test.ts`
- `apps/server/src/routers/__tests__/webhook.test.ts`
- `apps/web/lib/__tests__/utils.test.ts`
- `apps/web/components/shadcn-studio/button/__tests__/copy-button.test.tsx`
- `apps/web/components/shadcn-studio/input/__tests__/password-input.test.tsx`

## Coverage Summary

- **200+ test cases** covering happy paths, edge cases, and error scenarios.
- **Backend**: Redis operations, API endpoints, authentication/authorization.
- **Frontend**: React components, user interactions, accessibility.
- **Error Handling**: Network failures, validation errors, edge cases.
- **Integration**: Full workflow scenarios with multiple operations.

## Next Steps

1. Run `bun install` to ensure all dependencies are available
2. Install testing-library packages: `bun add -d @testing-library/react @testing-library/dom happy-dom`
3. Run `bun test` to execute all tests
4. Review TESTING.md for detailed documentation