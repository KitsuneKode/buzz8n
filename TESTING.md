# Testing Guide

This guide explains how tests are organized and how to run them in the buzz8n monorepo.

## Overview

We use Bun's built-in test runner across a dedicated tests app located at `tests/`.
Tests are grouped by domain (apps, packages) and focus primarily on end-to-end style
UI flows (e.g., the dashboard) and backend behavior with mocks for external systems.

## Quick Start

Run from the repo root:

```bash
bun install

# Run the entire test suite
bun test
# or: bun run test / bun run test:all

# Run only web tests
bun run test:web

# Run only server tests
bun run test:server

# Run only worker tests
bun run test:worker

# Run only package tests
bun run test:packages

# CI-friendly run with coverage
bun run test:ci
```

To run a single file with Bun directly:

```bash
bun test tests/apps/web/pages/dashboard.test.tsx
```

## Structure

All tests live under the dedicated tests app:

```text
tests/
  apps/
    web/
      pages/           # integration-focused UI flow tests
      lib/             # small utility tests
      components/      # only when necessary; prefer flows
    server/
      routers/         # express/router-level tests
      redis/           # queue/enqueue behavior tests
  packages/
    backend-common/
    types/
```

## What we test

- **Dashboard flows**: Tabs, query params, empty states, list rendering, action
  buttons.
- **Backend behavior**: Redis client, queue enqueuing, webhook logic (with external
  systems mocked).
- **Utilities**: Small pure functions (e.g., `cn`).

We avoid deeply testing individual UI components unless a component encapsulates
complex logic that cannot be validated via the flow.

## Environment & Tooling

- **Runner**: Bun (`bun:test` API)
- **DOM**: `happy-dom` via `bunfig.toml` preload (`tests/setup/test-env.ts`)
- **React testing**: `@testing-library/react`
- **Module aliases**: configured in `tests/tsconfig.json` to mirror app aliases

## Mocking Strategy

- **Next.js**: mock `next/navigation` (e.g., `useSearchParams`) with `mock.module()`
- **TanStack Query**: mock `useSuspenseQuery` to return `{ data, isLoading }` without
  providers
- **Zustand stores**: mock store modules to return controlled state/actions
- **Server deps**: mock Redis, Prisma, and loggers

Example:

```ts
mock.module('next/navigation', () => ({
  useSearchParams: () => ({ get: (k) => (k === 'create' ? 'true' : null) }),
}))

mock.module('@tanstack/react-query', () => ({
  useSuspenseQuery: () => ({ data: [], isLoading: false }),
}))
```

## Installing Dependencies

The tests app declares required devDependencies. From the repo root:

```bash
bun install
```

## Authoring Tests

We favor the AAA pattern and clear naming:

```typescript
import { describe, test, expect, beforeEach, mock } from 'bun:test'

describe('Dashboard flow', () => {
  beforeEach(() => {
    // Setup before each test
  })

  test('should do something specific', () => {
    // Arrange
    const state = {}

    // Act
    // render(...)

    // Assert
    expect(true).toBe(true)
  })
})
```

## Examples

See examples under `tests/apps/web/pages/` and `tests/apps/server/` for practical
mocks and patterns.

## Test Scenarios Covered

### Happy Path Tests

- Valid inputs produce expected outputs
- Normal user interactions work correctly
- Standard workflows complete successfully

### Edge Cases

- Empty inputs
- Null/undefined values
- Large inputs (1000+ character strings)
- Special characters and Unicode
- Boundary conditions

### Error Handling

- Network failures
- Database errors
- Invalid input validation
- Authentication/authorization failures
- Resource cleanup on errors

### Accessibility Tests

- ARIA labels are correct
- Screen reader text is present
- Keyboard navigation works
- Focus management is proper

## Best Practices

1. **Test Isolation**: Each test is independent and doesn't affect others
2. **Clear Naming**: Test names describe what is being tested
3. **Arrange-Act-Assert**: Tests follow the AAA pattern
4. **Mock External Dependencies**: External services are mocked
5. **Clean Up**: Resources are cleaned up after tests
6. **Readable Assertions**: Use specific, clear assertion messages

## Continuous Integration

Add the test step to CI/CD workflows:

```yaml
- name: Run Tests
  run: bun run test:ci
```

## Troubleshooting

### Tests fail with import errors

- Ensure all dependencies are installed: `bun install`
- Check that tsconfig paths are configured correctly

### Mock.module() not working

- Ensure mocks are defined before imports
- Use dynamic imports: `await import()`

### React component tests fail

- Ensure `happy-dom` preload is configured in `bunfig.toml`
- Ensure `@testing-library/*` packages are installed via `bun install`

### Type errors in tests

- Ensure @types/bun is installed
- Check that test files have proper imports

## Adding New Tests

Add tests under `tests/` mirroring the domain structure:

- **Web flows**: `tests/apps/web/pages/*.test.tsx`
- **Server behavior**: `tests/apps/server/**.test.ts`
- **Packages**: `tests/packages/**.test.ts`

Name test files as `<subject>.test.ts` or `.test.tsx`. Import from `bun:test`. Prefer
flow tests over isolated component tests.

## Performance Considerations

- Tests run in parallel by default with Bun
- Mock external dependencies to keep tests fast
- Avoid actual network calls or file system operations
- Use test isolation to prevent cascading failures

## Further Reading

- [Bun Test Runner Documentation](https://bun.sh/docs/cli/test)
- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest API Reference](https://jestjs.io/docs/api) (Bun-compatible)
