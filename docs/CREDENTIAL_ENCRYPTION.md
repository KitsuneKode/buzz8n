# Credential encryption (canonical)

This branch (`cursor/quality-upgrade-plan-3e47` / PR #24) is the **canonical**
credential encryption implementation for buzz8n.

## Format

Stored credential `data` JSON:

```json
{
  "v": 1,
  "alg": "AES-GCM",
  "iv": "<base64 12-byte IV>",
  "ciphertext": "<base64 AES-GCM ciphertext including auth tag>"
}
```

Implementation: Bun Web Crypto (`crypto.subtle`) in
`packages/backend-common/src/crypto/credentials.ts`.

## Key material (`CREDENTIALS_ENCRYPTION_KEY`)

Accepted forms (resolved by `resolveCredentialKeyBytes`):

1. **64-char hex** (32 bytes) — preferred for production
2. **base64** that decodes to exactly 32 bytes
3. **any other string** — SHA-256 hashed to 32 bytes (dev-friendly)

## Conflict with PR #23

PR #23 (`cursor/incremental-hardening-920a`) introduced a different envelope
(`{ __enc: true, v, iv, tag, ciphertext }`) using Node `createCipheriv`.

**Do not merge both formats.** Prefer this PR's Web Crypto envelope. If PR #23
features (OpenAPI, metrics, deploy, Playwright) are still needed, cherry-pick
those commits onto this branch after merge — do not bring over
`credentials-crypto.ts`.

## Migration

```bash
CREDENTIALS_ENCRYPTION_KEY=... bun run packages/store/prisma/scripts/encrypt-credentials.ts
```

Plaintext rows are rejected at runtime unless `ALLOW_PLAINTEXT_CREDENTIALS=true`.
