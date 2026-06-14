import { Router } from "express";
import { db, subscriptionsTable } from "@workspace/db";
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
      stripeCustomerId: null,
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
    res.json({
      url: "https://stripe.com",
      sessionId: "placeholder_session",
    });
  } catch (err) {
    logger.error({ err }, "POST /subscriptions/checkout error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/portal", requireAuth, async (req, res) => {
  try {
    res.json({ url: "https://stripe.com" });
  } catch (err) {
    logger.error({ err }, "POST /subscriptions/portal error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
