import { Router } from "express";
import { db, repositoriesTable, serviceRequestsTable, activityTable, subscriptionsTable } from "@workspace/db";
import { eq, and, not, inArray, avg } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/summary", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const repos = await db.select().from(repositoriesTable).where(eq(repositoriesTable.userId, user.id));
    const deployedRepos = repos.filter(r => r.deploymentStatus === "deployed").length;
    const scores = repos.filter(r => r.readinessScore !== null).map(r => r.readinessScore as number);
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

    const activeServices = await db.select().from(serviceRequestsTable)
      .where(and(
        eq(serviceRequestsTable.userId, user.id),
        not(inArray(serviceRequestsTable.status, ["completed", "cancelled"]))
      ));

    const sub = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, user.id)).limit(1).then(r => r[0]);

    res.json({
      totalRepositories: repos.length,
      deployedRepositories: deployedRepos,
      averageReadinessScore: averageScore,
      activeServiceRequests: activeServices.length,
      plan: sub?.plan ?? "free",
    });
  } catch (err) {
    logger.error({ err }, "GET /dashboard/summary error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/activity", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const activities = await db.select().from(activityTable)
      .where(eq(activityTable.userId, user.id))
      .orderBy(sql`${activityTable.createdAt} DESC`)
      .limit(20);

    res.json(activities.map(a => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.description,
      createdAt: a.createdAt.toISOString(),
    })));
  } catch (err) {
    logger.error({ err }, "GET /dashboard/activity error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
