# Testing Guide

This document provides an overview of the test suite and how to run tests for the modified files.

## Overview

Comprehensive unit tests have been created for all files modified in the current branch, using Bun's built-in test runner (Jest-compatible API).

## Test Coverage

### Backend Tests (TypeScript/Node.js)

1. **packages/backend-common/src/redis/index.ts**
   - Location: `packages/backend-common/src/redis/__tests__/index.test.ts`
   - Coverage: RedisClient class with all methods (connect, xAdd, xReadGroup, xAck, cleanup)
   - Tests: Constructor variants, method parameters, error handling, integration scenarios

2. **packages/backend-common/src/redis/migrate.ts**
   - Location: `packages/backend-common/src/redis/__tests__/migrate.test.ts`
   - Coverage: Redis stream and consumer group creation
   - Tests: Successful migration, error handling, connection management

3. **packages/backend-common/src/types/queue.ts**
   - Location: `packages/backend-common/src/types/__tests__/queue.test.ts`
   - Coverage: EnqueueExecutionPayload type validation
   - Tests: Type correctness with various payload types (objects, arrays, primitives, null, undefined)

4. **apps/server/src/redis/enqueue.ts**
   - Location: `apps/server/src/redis/__tests__/enqueue.test.ts`
   - Coverage: enqueueExecution function
   - Tests: Valid payloads, empty payloads, complex nested objects, error handling, serialization

5. **apps/server/src/routers/webhook.ts**
   - Location: `apps/server/src/routers/__tests__/webhook.test.ts`
   - Coverage: Webhook router endpoint
   - Tests: Missing parameters, invalid methods, authentication, authorization, successful execution, error handling

### Frontend Tests (React/TypeScript)

6. **apps/web/lib/utils.ts**
   - Location: `apps/web/lib/__tests__/utils.test.ts`
   - Coverage: cn (className utility) function
   - Tests: Class merging, conditional classes, Tailwind class conflicts, various input types

7. **apps/web/components/shadcn-studio/button/copy-button.tsx**
   - Location: `apps/web/components/shadcn-studio/button/__tests__/copy-button.test.tsx`
   - Coverage: CopyButton React component
   - Tests: Rendering, clipboard operations, state management, error handling, accessibility

8. **apps/web/components/shadcn-studio/input/password-input.tsx**
   - Location: `apps/web/components/shadcn-studio/input/__tests__/password-input.test.tsx`
   - Coverage: InputPassword React component
   - Tests: Rendering, visibility toggle, readonly behavior, accessibility, edge cases

## Running Tests

### Run All Tests
```bash
bun test
```

### Run Specific Test File
```bash
bun test packages/backend-common/src/redis/__tests__/index.test.ts
```

### Run Tests in a Directory
```bash
bun test packages/backend-common/src/redis/__tests__/
```

### Run Tests with Coverage
```bash
bun test --coverage
```

### Run Tests in Watch Mode
```bash
bun test --watch
```

## Installing Dependencies

The tests use Bun's built-in test runner, but you'll need to install testing utilities for React components:

```bash
# For React component testing
bun add -d @testing-library/react @testing-library/dom @testing-library/user-event happy-dom
```

## Test Structure

All tests follow this structure:

```typescript
import { describe, test, expect, beforeEach, mock } from 'bun:test'

describe('Component/Function Name', () => {
  beforeEach(() => {
    // Setup before each test
  })

  test('should do something specific', () => {
    // Arrange
    const input = 'test'
    
    // Act
    const result = functionUnderTest(input)
    
    // Assert
    expect(result).toBe('expected')
  })
})
```

## Mocking Strategy

### Backend Mocks
- Redis client methods are mocked using `mock.module()`
- Logger functions are mocked to avoid console noise
- Database operations (Prisma) are mocked for isolation

### Frontend Mocks
- `navigator.clipboard` is mocked for clipboard tests
- React Testing Library provides DOM utilities
- Component dependencies are mocked where necessary

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

To add tests to CI/CD pipeline, add this to your workflow:

```yaml
- name: Run Tests
  run: bun test
```

## Troubleshooting

### Tests fail with import errors
- Ensure all dependencies are installed: `bun install`
- Check that tsconfig paths are configured correctly

### Mock.module() not working
- Ensure mocks are defined before imports
- Use dynamic imports: `await import()`

### React component tests fail
- Install @testing-library packages
- Add happy-dom or jsdom for DOM environment

### Type errors in tests
- Ensure @types/bun is installed
- Check that test files have proper imports

## Adding New Tests

When adding new tests:

1. Create a `__tests__` directory next to the file being tested
2. Name the test file `<filename>.test.ts` or `<filename>.test.tsx`
3. Import test utilities from `bun:test`
4. Follow existing test patterns in the codebase
5. Cover happy paths, edge cases, and error scenarios
6. Add appropriate mocks for external dependencies

## Performance Considerations

- Tests run in parallel by default with Bun
- Mock external dependencies to keep tests fast
- Avoid actual network calls or file system operations
- Use test isolation to prevent cascading failures

## Further Reading

- [Bun Test Runner Documentation](https://bun.sh/docs/cli/test)
- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest API Reference](https://jestjs.io/docs/api) (Bun is compatible)