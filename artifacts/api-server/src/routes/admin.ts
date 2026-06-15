import { Router } from "express";
import { db, usersTable, repositoriesTable, serviceRequestsTable, deploymentsTable, subscriptionsTable, cloudAccountsTable, auditLogsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
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
        subscriptionStatus: sub?.status ?? null,
        repositoryCount: repoCount,
        githubConnected: u.githubConnected,
        githubUsername: u.githubUsername ?? null,
        stripeCustomerId: u.stripeCustomerId ?? null,
        createdAt: u.createdAt.toISOString(),
      };
    }));
    res.json(withStats);
  } catch (err) {
    logger.error({ err }, "GET /admin/users error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/users/:id/role", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      res.status(400).json({ error: "Invalid role. Must be 'user' or 'admin'." });
      return;
    }
    const [updated] = await db.update(usersTable)
      .set({ role, updatedAt: new Date() })
      .where(eq(usersTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "User not found" }); return; }
    res.json({ id: updated.id, email: updated.email, role: updated.role });
  } catch (err) {
    logger.error({ err }, "PATCH /admin/users/:id/role error");
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

router.get("/subscriptions", requireAdmin, async (req, res) => {
  try {
    const subs = await db.select().from(subscriptionsTable).orderBy(sql`${subscriptionsTable.createdAt} DESC`);
    const withUser = await Promise.all(subs.map(async (s) => {
      const user = await db.select().from(usersTable).where(eq(usersTable.id, s.userId)).limit(1).then(r => r[0]);
      return {
        id: s.id,
        userId: s.userId,
        userEmail: user?.email ?? "—",
        userName: user?.name ?? null,
        plan: s.plan,
        status: s.status,
        stripeSubscriptionId: s.stripeSubscriptionId ?? null,
        stripePriceId: s.stripePriceId ?? null,
        currentPeriodEnd: s.currentPeriodEnd?.toISOString() ?? null,
        createdAt: s.createdAt.toISOString(),
      };
    }));
    res.json(withUser);
  } catch (err) {
    logger.error({ err }, "GET /admin/subscriptions error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/deployments", requireAdmin, async (req, res) => {
  try {
    const deployments = await db.select().from(deploymentsTable).orderBy(sql`${deploymentsTable.createdAt} DESC`);
    const withMeta = await Promise.all(deployments.map(async (d) => {
      const user = await db.select().from(usersTable).where(eq(usersTable.id, d.userId)).limit(1).then(r => r[0]);
      const repo = d.repositoryId
        ? await db.select().from(repositoriesTable).where(eq(repositoriesTable.id, d.repositoryId)).limit(1).then(r => r[0])
        : null;
      return {
        id: d.id,
        userId: d.userId,
        userEmail: user?.email ?? "—",
        repositoryId: d.repositoryId,
        repositoryName: repo?.fullName ?? repo?.name ?? null,
        provider: d.provider,
        status: d.status,
        environment: d.environment,
        deployedUrl: d.deployedUrl ?? null,
        notes: d.notes ?? null,
        doAppId: d.doAppId ?? null,
        doDeployId: d.doDeployId ?? null,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      };
    }));
    res.json(withMeta);
  } catch (err) {
    logger.error({ err }, "GET /admin/deployments error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/deployments/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, deployedUrl, notes } = req.body;
    const [updated] = await db.update(deploymentsTable)
      .set({ ...(status && { status }), ...(deployedUrl !== undefined && { deployedUrl }), ...(notes !== undefined && { notes }), updatedAt: new Date() })
      .where(eq(deploymentsTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Deployment not found" }); return; }
    res.json({ id: updated.id, status: updated.status, deployedUrl: updated.deployedUrl });
  } catch (err) {
    logger.error({ err }, "PATCH /admin/deployments/:id error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/services", requireAdmin, async (req, res) => {
  try {
    const requests = await db.select().from(serviceRequestsTable).orderBy(sql`${serviceRequestsTable.createdAt} DESC`);
    const withUser = await Promise.all(requests.map(async (s) => {
      const user = await db.select().from(usersTable).where(eq(usersTable.id, s.userId)).limit(1).then(r => r[0]);
      return {
        id: s.id,
        userId: s.userId,
        userEmail: user?.email ?? "—",
        repositoryId: s.repositoryId,
        serviceType: s.serviceType,
        status: s.status,
        description: s.description,
        adminNotes: s.adminNotes,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      };
    }));
    res.json(withUser);
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
    res.json({ id: updated.id, status: updated.status, adminNotes: updated.adminNotes });
  } catch (err) {
    logger.error({ err }, "PATCH /admin/services/:id error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Phase 6: Cloud accounts visibility for admin
router.get("/cloud-accounts", requireAdmin, async (req, res) => {
  try {
    const accounts = await db.select().from(cloudAccountsTable).orderBy(sql`${cloudAccountsTable.createdAt} DESC`);
    const withUser = await Promise.all(accounts.map(async (a) => {
      const user = await db.select().from(usersTable).where(eq(usersTable.id, a.userId)).limit(1).then(r => r[0]);
      return {
        id: a.id,
        userId: a.userId,
        userEmail: user?.email ?? "—",
        provider: a.provider,
        status: a.status,
        accountLabel: a.accountLabel,
        lastValidatedAt: a.lastValidatedAt?.toISOString() ?? null,
        validationError: a.validationError,
        createdAt: a.createdAt.toISOString(),
      };
    }));
    res.json(withUser);
  } catch (err) {
    logger.error({ err }, "GET /admin/cloud-accounts error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Phase 5: Audit log view for admin
router.get("/audit-logs", requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string || "100"), 500);
    const logs = await db.select().from(auditLogsTable)
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(limit);
    const withUser = await Promise.all(logs.map(async (l) => {
      const user = l.userId ? await db.select().from(usersTable).where(eq(usersTable.id, l.userId)).limit(1).then(r => r[0]) : null;
      return {
        id: l.id,
        userId: l.userId,
        userEmail: user?.email ?? null,
        action: l.action,
        resourceType: l.resourceType,
        resourceId: l.resourceId,
        ipAddress: l.ipAddress,
        createdAt: l.createdAt.toISOString(),
      };
    }));
    res.json(withUser);
  } catch (err) {
    logger.error({ err }, "GET /admin/audit-logs error");
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
    const totalSubscriptions = await db.select({ count: sql<number>`count(*)` }).from(subscriptionsTable).then(r => Number(r[0]?.count ?? 0));
    const activeSubscriptions = await db.select({ count: sql<number>`count(*)` }).from(subscriptionsTable).where(eq(subscriptionsTable.status, "active")).then(r => Number(r[0]?.count ?? 0));
    const adminUsers = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.role, "admin")).then(r => Number(r[0]?.count ?? 0));
    const githubConnected = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.githubConnected, true)).then(r => Number(r[0]?.count ?? 0));
    const cloudAccounts = await db.select({ count: sql<number>`count(*)` }).from(cloudAccountsTable).where(eq(cloudAccountsTable.status, "connected")).then(r => Number(r[0]?.count ?? 0));

    res.json({
      totalUsers, totalRepositories, totalDeployments, totalServiceRequests,
      pendingServiceRequests, proUsers, totalSubscriptions, activeSubscriptions,
      adminUsers, githubConnected, cloudAccounts,
    });
  } catch (err) {
    logger.error({ err }, "GET /admin/stats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/system", requireAdmin, async (req, res) => {
  try {
    const dbOk = await db.select({ one: sql<number>`1` }).from(usersTable).limit(1).then(() => true).catch(() => false);
    const envKeys = ["DATABASE_URL", "CLERK_SECRET_KEY", "CLOUD_CREDENTIALS_KEY", "STRIPE_PRICE_PRO_YEARLY", "STRIPE_PRICE_LAUNCH", "STRIPE_PRICE_APPLE", "REPLIT_DOMAINS", "AI_INTEGRATIONS_OPENAI_API_KEY", "RESEND_API_KEY"];
    const envStatus = envKeys.map(k => ({ key: k, present: !!process.env[k] }));
    res.json({
      api: { status: "ok", uptime: Math.floor(process.uptime()) },
      database: { status: dbOk ? "ok" : "error" },
      environment: envStatus,
      node: { version: process.version },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "GET /admin/system error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
