<!-- markdownlint-disable MD009 MD013 MD022 MD032 MD060 -->

# buzz8n Quality Upgrade to 9.5+ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise Architecture, Security, Reliability, Test Coverage, DevEx/CI, and Code Quality from the Jul 2026 audit grades to **≥ 9.5 / 10** using Bun-first practices, production-grade DAG execution, and hardened auth/secrets.

**Architecture:** Keep the existing monorepo boundaries (`web` / `server` / `worker` / `ws-server` + shared packages). Fix correctness and security in place first, then harden the Redis stream consumer and DAG executor for multi-worker scale, then make CI/tests the gate that keeps the bar. Prefer Bun APIs (`Bun.password`, `Bun.CryptoHasher` / Web Crypto, `bun:test`, `Bun.serve` for ws-server already) over Node equivalents. Do **not** rewrite Express → `Bun.serve` in this plan (large migration); document it as a follow-up once quality gates are green.

**Tech Stack:** Bun 1.2+, TypeScript strict, Turborepo, Express 5 (server), Prisma 6 + PostgreSQL, Redis streams + pub/sub, Next.js 15, Zod, `bun:test` + happy-dom.

**Baseline (audit):** Architecture B+ · Security D+ · Reliability C · Tests D · DevEx/CI C+ · Code quality B−

**Target:** every area ≥ 9.5, with measurable exit criteria per phase.

---

## Scorecard → Exit Criteria

| Area          | Now | Target | Done when                                                                                                          |
| ------------- | --- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| Architecture  | B+  | 9.5    | Clear package boundaries; typed queue payloads; DAG module split; no silent schema drift                           |
| Security      | D+  | 9.5    | Encrypted credentials, expiring JWTs, ownership checks, honest marketing copy, CSRF-safe cookies                   |
| Reliability   | C   | 9.5    | Multi-worker safe shutdown, DLQ, webhook body forwarding, working error middleware, fail-closed rate limits option |
| Test coverage | D   | 9.5    | Root `bun test` green; CI test job required; DAG/auth/webhook/credential ownership covered                         |
| DevEx / CI    | C+  | 9.5    | `.env.example`, aligned scripts, web in `check-types`, secretlint in CI, frozen lockfile green                     |
| Code quality  | B−  | 9.5    | No debug `console.log` in hot paths; no `any` in new code; ESLint clean; error handler correct                     |

---

## File Map (create / modify)

### Security & auth

- Create: `packages/backend-common/src/crypto/credentials.ts` — encrypt/decrypt credential JSON
- Create: `packages/backend-common/src/crypto/index.ts`
- Modify: `apps/server/src/routers/auth.ts` — JWT `expiresIn`, uniform sign-in errors
- Modify: `apps/server/src/routers/credential.ts` — encrypt on write, redact on list
- Modify: `apps/worker/src/nodes/telegram/send.ts`, `email/resend.ts`, `ai-agent/agent.ts` — decrypt + `userId` scope
- Modify: `apps/worker/src/nodes/index.ts` — pass `userId` into runners
- Modify: `apps/web/components/landing/SmartFAQ.tsx` — remove false SOC2 / encryption claims
- Modify: `packages/store/prisma/schema.prisma` — optional `dataEncrypted` flag or keep opaque `Json` of ciphertext envelope

### Webhook & API correctness

- Modify: `apps/server/src/routers/webhook.ts` — forward body/headers/query/method
- Modify: `packages/backend-common/src/types/` (queue payload types) — typed trigger payload
- Modify: `apps/worker/src/processor/index.ts` — parse trigger payload into `ctx.$json.body`
- Modify: `apps/server/src/index.ts` — fix 404 splat + middleware order
- Modify: `apps/server/src/middlewares/error-handler-middleware.ts` — 4-arg Express signature
- Modify: `apps/server/src/middlewares/rate-limiter-middleware.ts` — `webhookPath` key; document fail-open vs fail-closed

### DAG & worker reliability

- Create: `apps/worker/src/processor/graph.ts` — `collectReachableFrom`, `buildGraph`, `validateDAG`, `initialReady` (extract from `dag.ts`)
- Create: `apps/worker/src/processor/execution-log.ts` — `nodeResultToExecutionLog`
- Modify: `apps/worker/src/processor/dag.ts` — keep `executeGraphConcurrent` only; import graph helpers
- Modify: `apps/worker/src/index.ts` — `xGroupDelConsumer` + pending reclaim; never `xGroupDestroy` in multi-worker
- Create: `packages/backend-common/src/redis/dlq.ts` — dead-letter stream helpers
- Modify: `packages/backend-common/src/redis/index.ts` — `xClaim` / pending helpers; DLQ `xAdd`

### Bun / DevEx / CI

- Create: `.env.example` — all required vars
- Modify: `apps/web/package.json` — add `check-types` alias
- Modify: `package.json` — fix `test` / `test:all`; ensure `tests` workspace resolves
- Modify: `bunfig.toml` — test preload that works from root
- Modify: `.github/workflows/ci.yml` — re-enable tests; add secretlint; keep `--frozen-lockfile`
- Modify: `README.md`, `CONTRIBUTING.md`, `TESTING.md`, `TEST_QUICK_START.md` — script names match root

### Tests

- Create: `tests/apps/worker/processor/dag.test.ts`
- Create: `tests/apps/worker/processor/graph.test.ts`
- Create: `tests/apps/server/routers/auth.test.ts`
- Create: `tests/apps/server/routers/webhook-payload.test.ts`
- Create: `tests/packages/backend-common/crypto/credentials.test.ts`
- Modify: `tests/package.json` — deps/scripts so root turbo can find `@buzz8n/tests`
- Modify: `tests/setup/test-env.ts` — remove Vitest `vi` reference; guard happy-dom for non-DOM tests

---

## Phase 0 — Unblock quality gates (DevEx → 9.5 foundation)

### Task 0.1: Wire `@buzz8n/tests` into the Bun workspace

**Files:**

- Modify: `package.json` (workspaces already include `tests/*` — verify why package is missing from `bun pm ls`)
- Modify: `tests/package.json`
- Modify: `bun.lock` (via `bun install`)

- [ ] **Step 1: Diagnose why `@buzz8n/tests` is not linked**

Run from `/workspace`:

```bash
bun pm ls 2>&1 | rg tests || true
cat tests/package.json
cat tests/.gitignore
```

Expected: package name is `@buzz8n/tests` but it does not appear under workspace packages (audit finding). Common causes: empty/invalid package, ignored by install, or install run without workspaces resolving `tests/*`.

- [ ] **Step 2: Ensure `tests/package.json` is a valid workspace package**

Confirm `tests/package.json` contains at least:

```json
{
  "name": "@buzz8n/tests",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "bun test",
    "test:all": "bun test",
    "test:web": "bun test apps/web",
    "test:server": "bun test apps/server",
    "test:worker": "bun test apps/worker",
    "test:packages": "bun test packages",
    "test:ci": "bun test --coverage"
  }
}
```

Remove the broken `"test": "bun test tests"` path (that filter matches nothing when cwd is already `tests/`).

- [ ] **Step 3: Hoist test DOM deps so root preload works**

Add to **root** `package.json` `devDependencies` (Bun workspace hoist):

```json
"happy-dom": "^14.12.3",
"@testing-library/react": "^16.0.0",
"@testing-library/dom": "^10.0.0",
"@testing-library/user-event": "^14.5.2"
```

Keep the same deps in `tests/package.json` for local clarity.

- [ ] **Step 4: Fix root scripts**

In root `package.json`:

```json
"test": "bun test",
"test:all": "bun test",
"test:ci": "bun test --coverage",
"test:web": "bun test tests/apps/web",
"test:server": "bun test tests/apps/server",
"test:worker": "bun test tests/apps/worker",
"test:packages": "bun test tests/packages"
```

Prefer direct `bun test` over `turbo run test -F @buzz8n/tests` until turbo package discovery is confirmed. Optionally keep turbo wrappers once `@buzz8n/tests` shows in `bun pm ls`.

- [ ] **Step 5: Fix `tests/setup/test-env.ts`**

Replace Vitest leftover with Bun-safe noop:

```typescript
import { Window } from 'happy-dom'

const window = new Window()
globalThis.window = window as unknown as Window & typeof globalThis
globalThis.document = window.document as unknown as Document
globalThis.navigator = window.navigator as unknown as Navigator

if (!globalThis.navigator.clipboard) {
  Object.defineProperty(globalThis.navigator, 'clipboard', {
    value: {
      writeText: async () => {},
      readText: async () => '',
    },
  })
}
```

Do **not** reference `vi`.

- [ ] **Step 6: Install and verify**

```bash
bun install
bun pm ls | rg '@buzz8n/tests'
bun test
```

Expected: `@buzz8n/tests` listed; tests run without `Cannot find package 'happy-dom'`. Some failures may remain (webhook tests) — fix in Phase 2/4.

- [ ] **Step 7: Commit**

```bash
git add package.json tests/package.json tests/setup/test-env.ts bun.lock bunfig.toml
git commit -m "chore(tests): wire @buzz8n/tests workspace and fix bun test preload"
```

---

### Task 0.2: Align web `check-types` with Turbo

**Files:**

- Modify: `apps/web/package.json`

- [ ] **Step 1: Add script alias**

```json
"check-types": "tsc --noEmit",
"typecheck": "tsc --noEmit"
```

Keep `typecheck` for local habit; Turbo uses `check-types`.

- [ ] **Step 2: Verify**

```bash
bun run check-types
```

Expected: `@buzz8n/web` included in turbo graph and passes.

- [ ] **Step 3: Commit**

```bash
git add apps/web/package.json
git commit -m "chore(web): add check-types script for turbo CI"
```

---

### Task 0.3: Add `.env.example` and document required vars

**Files:**

- Create: `.env.example`
- Modify: `README.md` (short “Environment” section pointing to `.env.example`)

- [ ] **Step 1: Create `.env.example`**

```bash
# Shared
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/buzz8n
REDIS_URL=redis://localhost:6379

# Auth / crypto
JWT_SECRET=change-me-to-a-long-random-string
CREDENTIALS_ENCRYPTION_KEY=change-me-32-byte-base64-or-hex

# Server / WS
PORT=8080
ALLOWED_ORIGINS=http://localhost:3000
# Cookie domain: leave empty in local; set in prod
COOKIE_DOMAIN=localhost

# Web (Next.js)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WEBHOOK_URL=http://localhost:8080/webhook/
NEXT_PUBLIC_WS_URL=ws://localhost:8082
```

- [ ] **Step 2: Commit**

```bash
git add .env.example README.md
git commit -m "docs: add .env.example for all required services"
```

---

### Task 0.4: Re-enable CI tests + secretlint

**Files:**

- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Uncomment and harden the `test` job**

```yaml
test:
  name: Test
  runs-on: ubuntu-latest
  needs: [lint, typecheck]
  steps:
    - uses: actions/checkout@v5
      with:
        fetch-depth: 0
        filter: blob:none
    - uses: oven-sh/setup-bun@v2
      with:
        bun-version: 1.2.23
    - run: bun install --frozen-lockfile
    - run: bun db:generate
    - run: bun run test:ci
```

Pin Bun to `packageManager` version (`1.2.23`), not `latest`.

- [ ] **Step 2: Add secretlint job (or step on lint)**

```yaml
secretlint:
  name: Secret lint
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v5
    - uses: oven-sh/setup-bun@v2
      with:
        bun-version: 1.2.23
    - run: bun install --frozen-lockfile
    - run: bun run lint:secrets
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: re-enable tests and add secretlint gate"
```

---

## Phase 1 — Security → 9.5

### Task 1.1: Credential encryption helpers (Bun Web Crypto)

**Files:**

- Create: `packages/backend-common/src/crypto/credentials.ts`
- Create: `packages/backend-common/src/crypto/index.ts`
- Modify: `packages/backend-common/src/index.ts` (re-export)
- Modify: `packages/backend-common/src/utils/config.ts` (or equivalent) — require `CREDENTIALS_ENCRYPTION_KEY`
- Test: `tests/packages/backend-common/crypto/credentials.test.ts`

**Design:** Store an envelope in `Credential.data`:

```typescript
type CredentialEnvelope = {
  v: 1
  alg: 'AES-GCM'
  iv: string // base64
  ciphertext: string // base64
}
```

Use Web Crypto (`crypto.subtle`) — available in Bun without `"use node"`. Derive a 256-bit key from `CREDENTIALS_ENCRYPTION_KEY` via SHA-256 of the secret string (or accept raw 32-byte base64).

- [ ] **Step 1: Write failing tests**

```typescript
import { encryptCredentialData, decryptCredentialData } from '@buzz8n/backend-common/crypto'
import { describe, expect, test } from 'bun:test'

describe('credential crypto', () => {
  test('round-trips a telegram bot token payload', async () => {
    const plain = { botToken: '123:ABC' }
    const envelope = await encryptCredentialData(plain)
    expect(envelope.v).toBe(1)
    expect(envelope.ciphertext).not.toContain('ABC')
    const out = await decryptCredentialData(envelope)
    expect(out).toEqual(plain)
  })

  test('rejects tampered ciphertext', async () => {
    const envelope = await encryptCredentialData({ botToken: 'x' })
    envelope.ciphertext = envelope.ciphertext.slice(0, -4) + 'xxxx'
    await expect(decryptCredentialData(envelope)).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
bun test tests/packages/backend-common/crypto/credentials.test.ts
```

- [ ] **Step 3: Implement**

```typescript
// packages/backend-common/src/crypto/credentials.ts
export type CredentialEnvelope = {
  v: 1
  alg: 'AES-GCM'
  iv: string
  ciphertext: string
}

function getKeyBytes(): Uint8Array {
  const secret = process.env.CREDENTIALS_ENCRYPTION_KEY
  if (!secret) throw new Error('CREDENTIALS_ENCRYPTION_KEY is required')
  return new Uint8Array(Bun.CryptoHasher.hash('sha256', secret, 'buffer'))
}

async function importKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', getKeyBytes(), 'AES-GCM', false, ['encrypt', 'decrypt'])
}

export async function encryptCredentialData(
  data: Record<string, unknown>,
): Promise<CredentialEnvelope> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await importKey()
  const encoded = new TextEncoder().encode(JSON.stringify(data))
  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  return {
    v: 1,
    alg: 'AES-GCM',
    iv: Buffer.from(iv).toString('base64'),
    ciphertext: Buffer.from(cipherBuf).toString('base64'),
  }
}

export async function decryptCredentialData(
  envelope: CredentialEnvelope,
): Promise<Record<string, unknown>> {
  if (envelope.v !== 1 || envelope.alg !== 'AES-GCM') {
    throw new Error('Unsupported credential envelope')
  }
  const key = await importKey()
  const iv = Buffer.from(envelope.iv, 'base64')
  const ciphertext = Buffer.from(envelope.ciphertext, 'base64')
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
  return JSON.parse(new TextDecoder().decode(plainBuf)) as Record<string, unknown>
}

export function isCredentialEnvelope(value: unknown): value is CredentialEnvelope {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as CredentialEnvelope).v === 1 &&
    (value as CredentialEnvelope).alg === 'AES-GCM'
  )
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
CREDENTIALS_ENCRYPTION_KEY=test-key bun test tests/packages/backend-common/crypto/credentials.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add packages/backend-common/src/crypto tests/packages/backend-common/crypto
git commit -m "feat(security): AES-GCM credential envelope helpers"
```

---

### Task 1.2: Encrypt on credential write; redact on list

**Files:**

- Modify: `apps/server/src/routers/credential.ts`
- Modify: worker node files to decrypt before use

- [ ] **Step 1: On `POST /credential`, encrypt before insert**

```typescript
const envelope = await encryptCredentialData(data as Record<string, unknown>)
const credential = await prisma.credential.create({
  data: {
    data: envelope,
    title,
    platform,
    userId: req.user!.userId,
  },
  select: { id: true, title: true, platform: true, createdAt: true },
})
```

Never return `data` on create/list.

- [ ] **Step 2: On `GET /credential`, stop selecting `data`**

```typescript
select: {
  id: true,
  platform: true,
  title: true,
  createdAt: true,
},
```

- [ ] **Step 3: Migration strategy for existing plaintext rows**

Add one-shot script `packages/store/prisma/scripts/encrypt-credentials.ts`:

```typescript
// For each credential where !isCredentialEnvelope(data):
//   encrypt and prisma.credential.update
```

Run manually in staging before prod. Document in `SEED.md` / CONTRIBUTING.

- [ ] **Step 4: Worker decrypt + ownership**

In each node runner:

```typescript
const credential = await prisma.credential.findFirst({
  where: { id: credentialId, userId, archived: false },
})
if (!credential) throw new Error('Credential not found')
const raw = credential.data
const plain = isCredentialEnvelope(raw)
  ? await decryptCredentialData(raw)
  : (raw as Record<string, unknown>) // temporary plaintext fallback during migration
```

Thread `userId` from `processResponse` → `runNode` → runners via `ExecContext`:

```typescript
export type ExecContext = {
  userId: string
  // ...existing fields
}
```

Set `userId` from `execution.userId` in `processor/index.ts`.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(security): encrypt credentials at rest and scope worker lookups by userId"
```

---

### Task 1.3: Expiring JWTs + uniform auth errors (Bun password already OK)

**Files:**

- Modify: `apps/server/src/routers/auth.ts`
- Modify: config to expose `JWT_EXPIRES_IN` (default `7d`)

- [ ] **Step 1: Sign with expiry**

```typescript
const token = jwt.sign({ email, userId }, JWT_SECRET!, {
  expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
})
```

- [ ] **Step 2: Uniform sign-in failure message**

```typescript
if (!user || !(await Password.verify(password, user.password_hash))) {
  res.status(401).json({ error: 'Invalid email or password' })
  return
}
```

Use Bun’s `password` API (already in use) — do not switch to `bcrypt` npm package.

- [ ] **Step 3: Cookie domain from env**

```typescript
domain: process.env.COOKIE_DOMAIN || undefined,
```

Remove hardcoded `buzz8n.kitsunelabs.xyz`.

- [ ] **Step 4: Auth unit tests**

```typescript
// tests/apps/server/routers/auth.test.ts
// - signup validation 422
// - signin unknown user returns same 401 body as bad password
// - JWT payload includes exp
```

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(auth): JWT expiry, uniform errors, env cookie domain"
```

---

### Task 1.4: Honest security marketing copy

**Files:**

- Modify: `apps/web/components/landing/SmartFAQ.tsx`

- [ ] **Step 1: Replace false claims**

```typescript
answer:
  'Credentials are encrypted at rest with AES-GCM. Traffic uses HTTPS in production. We do not train models on your workflow data. Formal compliance certifications are not claimed in this open-source build.',
```

- [ ] **Step 2: Commit**

```bash
git commit -m "fix(web): align security FAQ with actual controls"
```

---

### Task 1.5: Frontend middleware — treat missing/empty cookie only; rely on API for validity

**Files:**

- Modify: `apps/web/middleware.ts`

Edge middleware cannot easily verify JWT without exposing `JWT_SECRET` to the Edge bundle. Keep presence check, but:

- Include `/signup` in matcher redirects when already “authenticated”
- Document that **server** JWT verify is the source of truth
- Optionally add a lightweight `/api/v1/me` gate on dashboard layout (client) that signs out on 401

- [ ] **Step 1: Expand matcher + signup redirect**

```typescript
export const config = {
  matcher: ['/signin', '/signup', '/dashboard', '/workflow/:path*'],
}
```

- [ ] **Step 2: Commit**

```bash
git commit -m "fix(web): tighten auth middleware matcher for signup"
```

---

## Phase 2 — Reliability & DAG → 9.5

### Task 2.1: Fix Express error handler and 404 route

**Files:**

- Modify: `apps/server/src/middlewares/error-handler-middleware.ts`
- Modify: `apps/server/src/index.ts`

- [ ] **Step 1: Four-parameter error middleware**

```typescript
import type { ErrorRequestHandler } from 'express'

export const errorHandlerMiddleware: ErrorRequestHandler = (error, req, res, _next) => {
  logger.error(`Error on Route : ${req.originalUrl}`, {
    message: error.message,
    stack: error.stack,
  })
  if (res.headersSent) return
  res.status(500).json({ error: 'Internal Server Error' })
}
```

- [ ] **Step 2: Fix catch-all and middleware order**

```typescript
app.get('/health', rateLimitMiddleware.api, (_, res) => {
  res.status(200).send('OK')
})

routers.forEach((router) => app.use('/api/v1', rateLimitMiddleware.api, router))
app.use(webhookRouter)

app.use((req, res) => {
  logger.info(`[404] ${req.method} ${req.originalUrl}`)
  res.status(404).json({ error: 'Not Found' })
})

app.use(errorHandlerMiddleware)
```

Prefer a final middleware without a broken `'{/*splat}'` literal. If using Express 5 path-to-regexp splat, verify against installed Express version with a quick smoke test.

- [ ] **Step 3: Commit**

```bash
git commit -m "fix(server): restore Express error handler and 404 fallback"
```

---

### Task 2.2: Webhook payload forwarding

**Files:**

- Modify: `packages/backend-common/src/types/` (enqueue payload)
- Modify: `apps/server/src/routers/webhook.ts`
- Modify: `apps/worker/src/processor/index.ts`
- Test: `tests/apps/server/routers/webhook-payload.test.ts`

- [ ] **Step 1: Define typed trigger data**

```typescript
export type WebhookTriggerData = {
  triggerType: 'webhook'
  method: string
  path: string
  headers: Record<string, string>
  query: Record<string, string>
  body: unknown
}

export type ManualTriggerData = {
  triggerType: 'manualTrigger'
  body?: unknown
}
```

- [ ] **Step 2: Enqueue full request context**

```typescript
await enqueueExecution({
  executionId: execution.id,
  workflowId: webhook.workflowId,
  data: {
    triggerType: 'webhook',
    method: req.method,
    path: webhookPath,
    headers: Object.fromEntries(
      Object.entries(req.headers).filter(
        ([k]) => !['authorization', 'cookie'].includes(k.toLowerCase()),
      ),
    ) as Record<string, string>,
    query: req.query as Record<string, string>,
    body: req.body,
  },
})
```

Strip `authorization` / `cookie` from forwarded headers so secrets do not land in execution logs.

- [ ] **Step 3: Worker sets `ctx.$json.body` from trigger body**

```typescript
const triggerData = typeof data === 'string' ? JSON.parse(data) : data

const ctx: ExecContext = {
  userId: execution.userId,
  $json: {
    body: triggerData?.body ?? triggerData,
    trigger: triggerData,
    executionId,
    workflowId,
  },
  $node: {},
  logs: [],
}
```

Fix the existing fragile `JSON.parse(data as unknown as string)` double-parse path — `enqueue` already stringifies once; `xReadGroup` may return strings. Normalize in one helper:

```typescript
function parseQueueData<T>(data: unknown): T {
  if (typeof data === 'string') return JSON.parse(data) as T
  return data as T
}
```

- [ ] **Step 4: Tests**

Assert webhook handler passes `body` into `enqueueExecution` mock.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(webhook): forward sanitized request payload into executions"
```

---

### Task 2.3: Fix webhook rate-limit key + policy

**Files:**

- Modify: `apps/server/src/middlewares/rate-limiter-middleware.ts`

- [ ] **Step 1: Use correct param**

```typescript
if (type === 'webhook') {
  return `rate:webhook:${req.params.webhookPath ?? req.ip}`
}
```

- [ ] **Step 2: Make fail-open explicit via env**

```typescript
const FAIL_OPEN = process.env.RATE_LIMIT_FAIL_OPEN !== 'false'
// default true for availability; set RATE_LIMIT_FAIL_OPEN=false in prod if preferred
if (error) {
  if (!FAIL_OPEN) {
    return { allowed: false, remaining: 0, resetTime: now + config.windowMs }
  }
  return { allowed: true, remaining: config.maxRequests, resetTime: now + config.windowMs }
}
```

Document in `.env.example`.

- [ ] **Step 3: Commit**

```bash
git commit -m "fix(server): webhook rate-limit key and configurable fail policy"
```

---

### Task 2.4: Split DAG module + harden executor

**Files:**

- Create: `apps/worker/src/processor/graph.ts`
- Create: `apps/worker/src/processor/execution-log.ts`
- Modify: `apps/worker/src/processor/dag.ts`
- Test: `tests/apps/worker/processor/graph.test.ts`
- Test: `tests/apps/worker/processor/dag.test.ts`

**DAG best practices to enforce:**

1. **Validate before execute** — `validateDAG` always runs (already).
2. **Execute only reachable subgraph** from trigger (already).
3. **Bounded concurrency** — keep `maxConcurrency` (default 4); make configurable via env `DAG_MAX_CONCURRENCY`.
4. **Deterministic ready queue** — sort ready ids for stable ordering in tests.
5. **No `console.log` in executor** — use `logger` only.
6. **Always persist final execution status** even on fail-fast (already via `endExecutionSetStatus`).
7. **Idempotent node logging** — stable log ids (`${executionId}:${nodeId}:${attempt}`) instead of `Date.now()`-only ids where possible.
8. **Template isolation** — Mustache render with `escape` disabled only for known safe fields; never pass entire secrets into `$json` logs.

- [ ] **Step 1: Extract pure graph functions to `graph.ts`**

Move `TRIGGER_TYPES`, `collectReachableFrom`, `buildGraph`, `validateDAG`, `initialReady` unchanged. Export them.

- [ ] **Step 2: Graph unit tests (TDD)**

```typescript
import {
  buildGraph,
  validateDAG,
  collectReachableFrom,
} from '../../../../apps/worker/src/processor/graph'
import { describe, expect, test } from 'bun:test'

test('detects a cycle', () => {
  const nodes = [{ id: 'a' }, { id: 'b' }]
  const edges = [
    { id: '1', source: 'a', target: 'b' },
    { id: '2', source: 'b', target: 'a' },
  ]
  const allowed = new Set(['a', 'b'])
  const { children, indegree } = buildGraph(nodes, edges, allowed)
  expect(() => validateDAG(children, indegree)).toThrow(/Cycle/)
})

test('collectReachableFrom does not follow reverse edges', () => {
  const edges = [
    { id: '1', source: 't', target: 'a' },
    { id: '2', source: 'x', target: 'a' },
  ]
  expect([...collectReachableFrom('t', edges)].sort()).toEqual(['a', 't'])
})
```

- [ ] **Step 3: Executor tests with fake `runNode`**

```typescript
test('runs independent branches concurrently up to maxConcurrency', async () => {
  // diamond or fan-out graph; assert order constraints and completed.size
})

test('failFast stops scheduling new nodes after failure', async () => {
  // node B throws; C depending on B never runs
})
```

- [ ] **Step 4: Remove `console.log(failureLog)` from `dag.ts`**

- [ ] **Step 5: Commit**

```bash
git commit -m "refactor(worker): split DAG graph helpers and add executor tests"
```

---

### Task 2.5: Multi-worker safe shutdown + DLQ

**Files:**

- Modify: `apps/worker/src/index.ts`
- Modify: `packages/backend-common/src/redis/index.ts`
- Create: `packages/backend-common/src/redis/dlq.ts`

- [ ] **Step 1: Replace destroy with consumer delete**

```typescript
async function shutdown() {
  logger.info('Shutting down gracefully…')
  try {
    // Claim/finish in-flight handled by finally xAck in processResponse
    await redis.xGroupDelConsumer({ consumer: REDIS_CONSUMER })
    await redis.cleanup()
  } catch (err) {
    logger.warn('Redis cleanup failed:', err)
  }
}
```

- [ ] **Step 2: DLQ for poison messages**

When JSON parse fails or schema validation fails permanently:

```typescript
await redis.xAdd({
  streamKey: 'workflow:execution:dlq',
  payload: {
    originalId: id,
    reason: 'invalid_payload',
    payload: typeof message === 'string' ? message : JSON.stringify(message),
    at: String(Date.now()),
  },
})
await redis.xAck({ messageID: id })
```

- [ ] **Step 3: Optional pending reclaim loop**

On startup, `XPENDING` + `XCLAIM` messages idle > N ms for this group (Bun interval). Keep simple: reclaim idle > 60s.

- [ ] **Step 4: Commit**

```bash
git commit -m "fix(worker): multi-worker shutdown and execution DLQ"
```

---

## Phase 3 — Bun practices pass

### Task 3.1: Prefer Bun APIs in hot paths (incremental)

**Rules for this repo (encode in `.cursor/rules` or CONTRIBUTING):**

| Prefer                                    | Avoid                                     |
| ----------------------------------------- | ----------------------------------------- |
| `bun test`                                | jest/vitest                               |
| `bun install` / frozen lockfile in CI     | npm/yarn                                  |
| `Bun.password`                            | `bcrypt` package                          |
| `Bun.CryptoHasher` / `crypto.subtle`      | node `crypto` in new code when equivalent |
| `Bun.serve` WebSocket (ws-server already) | `ws` package                              |
| Winston/logger                            | `console.log` in apps                     |
| Zod parse at boundaries                   | `as any` casts                            |

**Out of scope for 9.5 plan:** rewriting Express server to `Bun.serve` (track as `docs/superpowers/plans/future-bun-serve-migration.md`). Express remains until quality gates are stable.

- [ ] **Step 1: Sweep `console.log` in `apps/worker` and `apps/web/hooks/useWebSocket.ts`**

Replace with `logger.debug` or remove.

- [ ] **Step 2: Add CONTRIBUTING “Bun practices” subsection**

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: enforce Bun logging/password/crypto practices"
```

---

### Task 3.2: Typed queue payloads — remove `any` at boundaries

**Files:**

- Modify: `packages/backend-common/src/types/`
- Modify: `apps/worker/src/processor/index.ts`
- Modify: `packages/common/src/types/workflow.ts` — reduce `z.any()` where practical for `config` via per-node schemas (already partially done for telegram)

- [ ] **Step 1: Introduce `EnqueueExecutionPayload` zod schema**

```typescript
export const enqueueExecutionPayloadSchema = z.object({
  executionId: z.string().min(1),
  workflowId: z.string().min(1),
  data: z.union([webhookTriggerDataSchema, manualTriggerDataSchema]),
})
```

Parse on worker consume; DLQ on failure.

- [ ] **Step 2: Commit**

```bash
git commit -m "feat(types): zod-validate execution queue payloads"
```

---

## Phase 4 — Tests & coverage → 9.5

### Task 4.1: Coverage targets

| Package / area          | Minimum lines | Critical paths                 |
| ----------------------- | ------------- | ------------------------------ |
| `processor/graph.ts`    | 90%           | cycle, reachability            |
| `processor/dag.ts`      | 80%           | failFast, concurrency          |
| `crypto/credentials.ts` | 95%           | round-trip, tamper             |
| webhook router          | 85%           | secret, inactive, body forward |
| auth router             | 80%           | signup/signin/me               |

- [ ] **Step 1: Run coverage**

```bash
bun test --coverage
```

- [ ] **Step 2: Add missing tests until thresholds met**

- [ ] **Step 3: Fix currently failing webhook router tests** from audit (23 pass / 8 fail)

- [ ] **Step 4: Commit**

```bash
git commit -m "test: raise coverage on DAG, auth, webhook, crypto"
```

---

### Task 4.2: Docs script alignment

**Files:**

- Modify: `README.md`, `CONTRIBUTING.md`, `TESTING.md`, `TEST_QUICK_START.md`

Replace `bun run test:all` with working root scripts (`bun test` / `bun run test`).

- [ ] **Step 1: Update docs**

- [ ] **Step 2: Commit**

```bash
git commit -m "docs: align test commands with root package scripts"
```

---

## Phase 5 — Architecture polish → 9.5

### Task 5.1: Schema clarity

**Files:**

- Modify: `packages/store/prisma/schema.prisma`

- [ ] **Step 1: Rename or document `Workflow.status`**

Prefer adding `WorkflowRunState` enum or comment that `status` mirrors last execution. Remove redundant `@@index(email)` on User.

- [ ] **Step 2: Migration**

```bash
cd packages/store && bunx prisma migrate dev --name workflow_status_docs_and_index_cleanup
```

Only if rename is chosen; otherwise comment-only change needs no migration.

- [ ] **Step 3: Commit**

---

### Task 5.2: Fix `packages/ui` dead exports

**Files:**

- Modify: `packages/ui/package.json` — remove `./hooks/*` or add real hooks

- [ ] **Step 1: Remove dead export path**

- [ ] **Step 2: Commit**

```bash
git commit -m "chore(ui): remove dead hooks export path"
```

---

### Task 5.3: Enable `reactStrictMode` carefully

**Files:**

- Modify: `apps/web/next.config.mjs`

- [ ] **Step 1: Set `reactStrictMode: true`**

- [ ] \*\*Step 2: Fix double-mount issues in WebSocket/editor if any

- [ ] **Step 3: Commit**

```bash
git commit -m "fix(web): enable React strict mode"
```

---

## Suggested execution order (dependency graph)

```text
Phase 0 (gates)
  ├─► Phase 1 (security) ──┬─► Phase 2 (reliability/DAG)
  │                        └─► Phase 4 (tests expand)
  ├─► Phase 3 (Bun practices) ─► ongoing with 1–2
  └─► Phase 5 (architecture polish) after 2
```

Ship **Phase 0 + Phase 1 + Task 2.1–2.3** as the first PR series (security + correctness).
Ship **Task 2.4–2.5 + Phase 4** as the second series (DAG/scale + coverage).
Ship **Phase 3 + 5** as cleanup PR.

---

## Verification checklist (definition of 9.5)

Run from `/workspace` after all phases:

```bash
bun install --frozen-lockfile
bun db:generate
bun run lint
bun run check-types   # must include @buzz8n/web
bun test              # all green
bun run lint:secrets
bun run build
```

Manual smoke:

1. Sign up → sign in → cookie set → `/me` works → after JWT expiry (or short test TTL) `/me` 401s.
2. Create credential → DB row is envelope JSON, not raw token → list API has no secrets.
3. Workflow with webhook trigger → POST body `{ "hello": 1 }` → worker `$json.body.hello === 1`.
4. Start two workers → stop one → group still exists; other worker continues.
5. Invalid queue message → appears on DLQ stream; not retried forever.

---

## Out of scope (explicit)

- Full Express → `Bun.serve` migration for `apps/server`
- Replacing Prisma with `Bun.sql`
- Replacing `redis` npm client with `Bun.redis` (evaluate later; streams API parity must be verified)
- OAuth credential flows (`OAuthForm.tsx`) — separate plan
- SOC 2 / formal compliance program

---

## Self-review (plan quality)

| Spec item from audit      | Task     |
| ------------------------- | -------- |
| Credentials plaintext     | 1.1, 1.2 |
| JWT no expiry             | 1.3      |
| Credential IDOR in worker | 1.2      |
| Webhook body missing      | 2.2      |
| Broken error middleware   | 2.1      |
| Bad 404 route             | 2.1      |
| Webhook rate-limit key    | 2.3      |
| CI tests disabled         | 0.4      |
| Tests workspace broken    | 0.1      |
| Web check-types gap       | 0.2      |
| No `.env.example`         | 0.3      |
| Single-worker destroy     | 2.5      |
| DAG untested              | 2.4, 4.1 |
| False SOC2 copy           | 1.4      |
| Bun practices             | 3.1, 3.2 |

No TBD placeholders in task steps; code samples are concrete starting points for agents.
