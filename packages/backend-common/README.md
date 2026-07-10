# @buzz8n/backend-common

Shared backend utilities: Redis Streams client, Winston loggers, config, credential crypto.

## Exports

- `@buzz8n/backend-common/redis` — streams, pub/sub, rate-limit helpers, DLQ / XAUTOCLAIM
- `@buzz8n/backend-common/logger` — server / worker / ws loggers
- `@buzz8n/backend-common/config` — env loaders
- `@buzz8n/backend-common/credentials-crypto` — AES-256-GCM encrypt/decrypt for credential payloads
- `@buzz8n/backend-common/types` — queue payload types

## Scripts

```bash
bun run redis:migrate   # create consumer group (idempotent)
bun run redis:flush     # flush Redis DB (dev only)
```
