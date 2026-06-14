---
name: Stripe connector credential fields
description: The Replit Stripe connector API returns different field names than you might expect — this causes silent auth failures if wrong.
---

The `settings` object returned by `https://${REPLIT_CONNECTORS_HOSTNAME}/api/v2/connection?include_secrets=true&connector_names=stripe` has these keys:
- `secret` — the Stripe secret key (NOT `secret_key`)
- `publishable` — the Stripe publishable key (NOT `publishable_key`)
- `account_id`, `mcp`, `claim_url` — other fields

The HTTP header must be `"X-Replit-Token"` (hyphenated), NOT `"X_REPLIT_TOKEN"` (underscored).

**Why:** Discovered by directly testing the API — the connector schema uses short names `secret`/`publishable`, not the Stripe SDK conventions. Wrong header causes 401, wrong field name causes "missing secret key" error.

**How to apply:** Any time you write a Stripe credentials-fetching function for Replit, use `settings.secret` and `"X-Replit-Token"` header.
