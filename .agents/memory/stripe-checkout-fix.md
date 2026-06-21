---
name: Stripe checkout fix
description: How to make Stripe checkout sessions work with SDK v22 in this project
---

## The problem
Stripe SDK v22 defaults to API version `2026-05-27.dahlia` which dropped support for `line_items[0][price]` in checkout sessions. Pinning `apiVersion: '2024-06-20'` on the Stripe constructor does not reliably take effect (the prop is not always propagated through `_getPropsFromConfig`).

Additionally, the pre-created price IDs in env vars (`STRIPE_PRICE_PRO_YEARLY`, `STRIPE_PRICE_LAUNCH`, `STRIPE_PRICE_APPLE`) were inactive in the connected Stripe account.

## The fix (in subscriptions.ts)
Use a direct `fetch()` call to `https://api.stripe.com/v1/checkout/sessions` with:
- `Authorization: Bearer <secretKey>`
- `Stripe-Version: 2024-06-20`
- `Content-Type: application/x-www-form-urlencoded`
- Inline `price_data` (not a reference to a pre-existing price ID) to avoid dependency on price activation status

**Why:** Both `line_items[0][price]` SDK rejection and inactive price IDs are bypassed. The SDK is still used for `customers.create` (which works fine).

**How to apply:** Any future checkout session creation should use the `stripePost()` helper in `subscriptions.ts` with `price_data` fields, not a `price` reference.

## Secret key access
`getStripeCredentials()` is exported from `stripeClient.ts` and returns `{ secretKey, webhookSecret? }`.
