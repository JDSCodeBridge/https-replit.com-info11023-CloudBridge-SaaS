import { Router } from "express";
import { db, usersTable, repositoriesTable, serviceRequestsTable, deploymentsTable, subscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";

const router = Router();

router.get("/users", requireAdmin, async (req, res) => {
  try {
    const users = await db.select().from(usersTable).orderBy(sql`${usersTable.createdAt} DESC`);
    const withStats = await Promise.all(users.map(async (u) => {
      const repoCount = await db.select({ count: sql<number>`count(*)` }).from(repositoriesTable).where(eq(repositoriesTable.userId, u.id)).then(r => Number(r[0]?.count ?? 0));
      const sub = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, u.id)).limit(1).then(r => r[0]);
      return {
        id: u.id,
        clerkId: u.clerkId,
        email: u.email,
        name: u.name,
        role: u.role,
        plan: sub?.plan ?? "free",
        repositoryCount: repoCount,
        createdAt: u.createdAt.toISOString(),
      };
    }));
    res.json(withStats);
  } catch (err) {
    logger.error({ err }, "GET /admin/users error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/repositories", requireAdmin, async (req, res) => {
  try {
    const repos = await db.select().from(repositoriesTable).orderBy(sql`${repositoriesTable.createdAt} DESC`);
    res.json(repos.map(r => ({
      id: r.id,
      userId: r.userId,
      name: r.name,
      fullName: r.fullName,
      githubUrl: r.githubUrl,
      description: r.description,
      framework: r.framework,
      language: r.language,
      lastCommitAt: r.lastCommitAt?.toISOString() ?? null,
      deploymentStatus: r.deploymentStatus,
      readinessScore: r.readinessScore,
      isPrivate: r.isPrivate,
      createdAt: r.createdAt.toISOString(),
    })));
  } catch (err) {
    logger.error({ err }, "GET /admin/repositories error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/services", requireAdmin, async (req, res) => {
  try {
    const requests = await db.select().from(serviceRequestsTable).orderBy(sql`${serviceRequestsTable.createdAt} DESC`);
    res.json(requests.map(s => ({
      id: s.id,
      userId: s.userId,
      repositoryId: s.repositoryId,
      serviceType: s.serviceType,
      status: s.status,
      description: s.description,
      adminNotes: s.adminNotes,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })));
  } catch (err) {
    logger.error({ err }, "GET /admin/services error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/services/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, adminNotes } = req.body;
    const [updated] = await db.update(serviceRequestsTable)
      .set({ status, adminNotes, updatedAt: new Date() })
      .where(eq(serviceRequestsTable.id, id))
      .returning();
    res.json({
      id: updated.id,
      userId: updated.userId,
      repositoryId: updated.repositoryId,
      serviceType: updated.serviceType,
      status: updated.status,
      description: updated.description,
      adminNotes: updated.adminNotes,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "PATCH /admin/services/:id error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(usersTable).then(r => Number(r[0]?.count ?? 0));
    const totalRepositories = await db.select({ count: sql<number>`count(*)` }).from(repositoriesTable).then(r => Number(r[0]?.count ?? 0));
    const totalDeployments = await db.select({ count: sql<number>`count(*)` }).from(deploymentsTable).then(r => Number(r[0]?.count ?? 0));
    const totalServiceRequests = await db.select({ count: sql<number>`count(*)` }).from(serviceRequestsTable).then(r => Number(r[0]?.count ?? 0));
    const pendingServiceRequests = await db.select({ count: sql<number>`count(*)` }).from(serviceRequestsTable).where(eq(serviceRequestsTable.status, "pending")).then(r => Number(r[0]?.count ?? 0));
    const proUsers = await db.select({ count: sql<number>`count(*)` }).from(subscriptionsTable).where(eq(subscriptionsTable.plan, "pro")).then(r => Number(r[0]?.count ?? 0));

    res.json({ totalUsers, totalRepositories, totalDeployments, totalServiceRequests, pendingServiceRequests, proUsers });
  } catch (err) {
    logger.error({ err }, "GET /admin/stats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
