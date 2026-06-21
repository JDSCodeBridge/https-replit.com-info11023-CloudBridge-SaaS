import { Router } from "express";
import { db, subscriptionsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";

// Direct Stripe API helper — bypasses SDK v22 which defaults to the dahlia API
// that dropped support for line_items[0][price] in checkout sessions.
async function stripePost(secretKey: string, path: string, params: Record<string, string>) {
  const resp = await fetch(`https://api.stripe.com${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Stripe-Version": "2024-06-20",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });
  const data = await resp.json() as any;
  if (!resp.ok) throw Object.assign(new Error(data?.error?.message ?? `Stripe ${resp.status}`), { stripeError: data?.error });
  return data;
}

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const sub = await db.select().from(subscriptionsTable)
      .where(eq(subscriptionsTable.userId, user.id))
      .limit(1).then(r => r[0]);

    if (!sub) {
      res.json({ plan: "free", status: "none", stripeCustomerId: null, currentPeriodEnd: null, repositoryLimit: 1 });
      return;
    }

    res.json({
      plan: sub.plan,
      status: sub.status,
      stripeCustomerId: user.stripeCustomerId ?? null,
      currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
      repositoryLimit: sub.plan === "free" ? 1 : null,
    });
  } catch (err) {
    logger.error({ err }, "GET /subscriptions/me error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/checkout", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const { priceId } = req.body;

    if (!priceId) {
      res.status(400).json({ error: "priceId is required" });
      return;
    }

    const { getUncachableStripeClient, getStripeCredentials } = await import("../stripeClient");
    const stripe = await getUncachableStripeClient();
    const { secretKey } = await getStripeCredentials();

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId as string | null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId: String(user.id) },
      });
      await db.update(usersTable)
        .set({ stripeCustomerId: customer.id })
        .where(eq(usersTable.id, user.id));
      customerId = customer.id;
    }

    const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
    const baseUrl = domain ? `https://${domain}` : "http://localhost";

    // Price catalog — use inline price_data so we never depend on pre-existing Stripe
    // price IDs being active. Keyed by the env-var price ID for identity/webhook mapping.
    const CATALOG: Record<string, {
      name: string; amount: number; mode: "subscription" | "payment"; interval?: "year" | "month";
    }> = {
      [process.env.STRIPE_PRICE_PRO_YEARLY ?? ""]:   { name: "CodeBridge Pro",        amount: 4999,  mode: "subscription", interval: "year" },
      [process.env.STRIPE_PRICE_LAUNCH ?? ""]:        { name: "Deploy My App",          amount: 14900, mode: "payment" },
      [process.env.STRIPE_PRICE_APPLE ?? ""]:         { name: "Apple App Publishing",   amount: 29900, mode: "payment" },
    };

    const plan = CATALOG[priceId];
    if (!plan) {
      res.status(400).json({ error: "Invalid price ID" });
      return;
    }

    const sessionParams: Record<string, string> = {
      customer: customerId,
      "payment_method_types[0]": "card",
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][product_data][name]": plan.name,
      "line_items[0][price_data][unit_amount]": String(plan.amount),
      "line_items[0][quantity]": "1",
      mode: plan.mode,
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url: `${baseUrl}/pricing`,
      allow_promotion_codes: "true",
    };

    if (plan.mode === "subscription" && plan.interval) {
      sessionParams["line_items[0][price_data][recurring][interval]"] = plan.interval;
    }

    const session = await stripePost(secretKey, "/v1/checkout/sessions", sessionParams);

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    logger.error({ err }, "POST /subscriptions/checkout error");
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.post("/portal", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;

    if (!user.stripeCustomerId) {
      res.status(400).json({ error: "No Stripe customer found. Subscribe first." });
      return;
    }

    const { getUncachableStripeClient } = await import("../stripeClient");
    const stripe = await getUncachableStripeClient();

    const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
    const baseUrl = domain ? `https://${domain}` : "http://localhost";

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/settings`,
    });

    res.json({ url: session.url });
  } catch (err) {
    logger.error({ err }, "POST /subscriptions/portal error");
    res.status(500).json({ error: "Failed to create portal session" });
  }
});

export default router;
