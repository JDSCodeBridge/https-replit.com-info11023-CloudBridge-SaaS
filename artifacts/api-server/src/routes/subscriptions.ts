import { Router } from "express";
import { db, subscriptionsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";

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

    const { getUncachableStripeClient } = await import("../stripeClient");
    const stripe = await getUncachableStripeClient();

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

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url: `${baseUrl}/pricing`,
      allow_promotion_codes: true,
    });

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
