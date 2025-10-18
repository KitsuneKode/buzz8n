# buzz8n

AI-powered workflow builder & runtime (n8n-style) built with Next.js, React Flow, and a modern TypeScript stack.

## Overview

- **Apps**: Web (Next.js), Server (Express), Worker
- **Packages**: Shared UI, common types/config, backend-common (Redis, config, logger), store (Prisma)
- **Language/Runtime**: TypeScript + Bun, Turbo monorepo
- **UI**: Tailwind + shadcn/ui + OKLCH color system
- **Canvas**: React Flow v12

## Monorepo Structure

```text
apps/
  web/           # Next.js app (marketing + dashboard)
  server/        # Express API & webhooks
  worker/        # Background worker (queue consumers)
packages/
  backend-common/
  common/
  store/         # Prisma client
  ui/            # Shared UI components
tests/           # Dedicated test app (Bun test runner)
```

## Getting Started

```bash
# Install (Bun)
bun install

# Dev all apps (web, server, worker)
bun run dev

# Dev single app
bun run dev:web
bun run dev:server
bun run dev:worker
```

Environment variables are required for server/worker (e.g., `DATABASE_URL`, `REDIS_URL`). See app-specific READMEs or `.env.example` if present.

## Testing Quick Start

Tests are centralized in the `tests/` app and run with Bun.

```bash
# All tests
bun run test:all

# Split targets
bun run test:web
bun run test:server
bun run test:packages

# CI-friendly (coverage)
bun run test:ci
```

See `TESTING.md` for structure, mocking strategy, and examples (dashboard flow tests, backend queue tests, utilities).

## Scripts

```bash
# Build all
bun run build

# Lint all
bun run lint

# Prisma (through apps)
bun run db:generate
bun run db:migrate
bun run db:studio

# Redis stream/group migrate (server)
bun run redis:migrate
```

## Key Tech

- Next.js 15, React 19
- React Flow v12
- Zustand for state
- Prisma ORM
- Redis streams (XADD/XREADGROUP)
- Tailwind v4 + shadcn/ui
- Bun + Turbo

## Contributing

Please read `CONTRIBUTING.md` for branch, commit, PR, and testing guidelines.
