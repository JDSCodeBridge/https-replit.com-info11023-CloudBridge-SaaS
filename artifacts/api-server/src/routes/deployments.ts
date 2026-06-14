import { Router } from "express";
import { db, deploymentsTable, activityTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";

const router = Router();

function formatDeployment(d: any) {
  return {
    id: d.id,
    userId: d.userId,
    repositoryId: d.repositoryId,
    provider: d.provider,
    status: d.status,
    environment: d.environment,
    deployedUrl: d.deployedUrl,
    notes: d.notes,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const deployments = await db.select().from(deploymentsTable).where(eq(deploymentsTable.userId, user.id));
    res.json(deployments.map(formatDeployment));
  } catch (err) {
    logger.error({ err }, "GET /deployments error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const { repositoryId, provider, environment, notes } = req.body;
    const [deployment] = await db.insert(deploymentsTable).values({
      userId: user.id,
      repositoryId,
      provider,
      environment: environment ?? "production",
      notes: notes ?? null,
      status: "pending",
    }).returning();

    await db.insert(activityTable).values({
      userId: user.id,
      type: "deployment_created",
      title: "Deployment initiated",
      description: `Deploying to ${provider}`,
    });

    res.status(201).json(formatDeployment(deployment));
  } catch (err) {
    logger.error({ err }, "POST /deployments error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deployment = await db.select().from(deploymentsTable).where(eq(deploymentsTable.id, id)).limit(1).then(r => r[0]);
    if (!deployment) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatDeployment(deployment));
  } catch (err) {
    logger.error({ err }, "GET /deployments/:id error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
