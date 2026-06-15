---
name: CloudLift phases completion
description: Durable lessons from building all 8 CloudLift phases — rate limiter quirks, array safety, encryption pattern
---

## express-rate-limit v8 in Replit
- Must set `app.set("trust proxy", 1)` or the library throws ERR_ERL_UNEXPECTED_X_FORWARDED_FOR on every request
- Custom `keyGenerator` that falls back to IP must use `ipKeyGenerator(req)` helper (imported from express-rate-limit), not `req.ip` directly, to avoid ERR_ERL_KEY_GEN_IPV6

**Why:** Replit proxies all traffic through an nginx layer that sets X-Forwarded-For; Express defaults trust proxy to false.

**How to apply:** Always add `app.set("trust proxy", 1)` before rate limit middleware in any Replit Express app.

## Admin/user-facing API array safety
- Any API endpoint that requires admin role returns a 403 error object `{error: "..."}` instead of an array when the caller is not admin
- Frontend code that does `data?.slice(...)` or `(data ?? []).filter(...)` will crash because the non-null error object passes `??` and objects have no `.filter`
- **Fix:** always guard with `Array.isArray(data) ? data : []` before calling array methods on API responses

**Why:** The pattern shows up on admin.tsx and cloud-accounts.tsx; the ?? guard is insufficient.

## GitHub PAT encryption pattern
- PAT stored in `users.github_access_token` as AES-256-GCM ciphertext via `encrypt()`/`decrypt()` from `lib/encryption.ts`
- Key is `CLOUD_CREDENTIALS_KEY` env var (already set in shared environment)
- Validate PAT via `GET /user` on GitHub API before storing

## DO deployment language inference
- `inferEnvironmentSlug()` in doDeployment.ts maps language/framework strings to DO environment slugs
- Default slug is `node-js` when language is unknown
- App name sanitized: lowercase, hyphens only, max 32 chars
