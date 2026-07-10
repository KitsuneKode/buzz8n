# Database Seeding

`prisma/seed.ts` seeds **local UI/dev data** for an existing test user.

## Prerequisites

1. Create a user via the app signup flow with email `testuser@me.com`, **or**
2. Uncomment the user-creation block in `seed.ts` and set a password hash.

The script **does not clear** existing data and **exits early** if `testuser@me.com` is missing.

## What it generates (approximate)

When the test user exists:

- **50–100 credentials** across Telegram, Email, OpenAI, Gemini, Anthropic
- Multiple workflows with sample nodes/edges
- Webhooks for some active workflows
- A large batch of executions for infinite-scroll / dashboard testing

Password for manually created accounts is whatever you set at signup (docs that claimed a shared `Test123!@#` for 50 users are outdated).

## Run

```bash
bun run db:seed
# or from packages/store
bunx prisma db seed
```

## Notes

- Credential `data` written by seed is **plaintext JSON** for local convenience. Production creates go through AES-256-GCM encryption; the worker still accepts legacy plaintext rows.
- Prefer regenerating only when you need fresh list/pagination data.
