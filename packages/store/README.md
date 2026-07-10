# @buzz8n/store

Prisma schema and client for PostgreSQL.

## Commands

```bash
bun run db:generate
bun run db:migrate
bun run db:seed
bun run db:studio
```

## Seed

`prisma/seed.ts` is **idempotent for a single test user** (`testuser@me.com`).

- It does **not** wipe the database.
- It only seeds when that user already exists (create the user via signup first, or uncomment user creation in the seed script).
- Volume is tuned for local UI testing (dozens of credentials / workflows), not the historical “50 users / 25k executions” numbers in older docs.

See `SEED.md` for details.
