import { Router } from "express";
import { db, serviceRequestsTable, activityTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";
import { Email } from "../lib/email";

const router = Router();

function formatServiceRequest(s: any) {
  return {
    id: s.id,
    userId: s.userId,
    repositoryId: s.repositoryId,
    serviceType: s.serviceType,
    status: s.status,
    description: s.description,
    adminNotes: s.adminNotes,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const requests = await db.select().from(serviceRequestsTable).where(eq(serviceRequestsTable.userId, user.id));
    res.json(requests.map(formatServiceRequest));
  } catch (err) {
    logger.error({ err }, "GET /services error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const { repositoryId, serviceType, description } = req.body;
    const [request] = await db.insert(serviceRequestsTable).values({
      userId: user.id,
      repositoryId: repositoryId ?? null,
      serviceType,
      description: description ?? null,
      status: "pending",
    }).returning();

    await db.insert(activityTable).values({
      userId: user.id,
      type: "service_requested",
      title: "Service requested",
      description: `Requested ${serviceType.replace(/_/g, " ")} service`,
    });

    const turnaroundMap: Record<string, string> = {
      deploy_for_me: "24–48 hours",
      publish_for_me: "12–24 hours",
      cloud_infrastructure: "3–5 days",
      app_store_submission: "5–10 days",
    };
    Email.sendServiceRequestConfirmation(user.email, user.name ?? "", serviceType, turnaroundMap[serviceType] ?? "2–5 days");
    Email.sendServiceRequestAdminAlert(serviceType, user.name ?? "", user.email, description ?? null);

    res.status(201).json(formatServiceRequest(request));
  } catch (err) {
    logger.error({ err }, "POST /services error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const request = await db.select().from(serviceRequestsTable).where(eq(serviceRequestsTable.id, id)).limit(1).then(r => r[0]);
    if (!request) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatServiceRequest(request));
  } catch (err) {
    logger.error({ err }, "GET /services/:id error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
