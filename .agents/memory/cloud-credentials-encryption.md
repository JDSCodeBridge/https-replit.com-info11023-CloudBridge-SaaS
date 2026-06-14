---
name: Cloud credentials encryption
description: How cloud provider credentials are stored and validated in CloudLift
---

Credentials for AWS/Azure/DigitalOcean/GCP are encrypted with AES-256-GCM before storing in `cloud_accounts` table.

**Key**: `CLOUD_CREDENTIALS_KEY` env var — 64 hex chars (32 bytes). Set in shared environment. Already configured.

**Encryption utility**: `artifacts/api-server/src/lib/encryption.ts`

**Validators**: `artifacts/api-server/src/lib/cloudValidators.ts`
- AWS: uses `@aws-sdk/client-sts` → `GetCallerIdentity`
- DigitalOcean: plain fetch → `GET /v2/account`
- Azure: client credentials OAuth → list subscriptions
- GCP: manual RS256 JWT signing with Node crypto → exchange for token → verify project

**Why:** Avoids storing plaintext credentials in DB. AES-256-GCM provides authenticated encryption. No external KMS needed for early-stage app.

**How to apply:** Any new cloud provider must go through encrypt/decrypt in `encryption.ts`. Never store raw credentials.
