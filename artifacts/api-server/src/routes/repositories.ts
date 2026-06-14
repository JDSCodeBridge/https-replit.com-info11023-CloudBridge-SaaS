import { Router } from "express";
import { db, repositoriesTable, repositoryAnalysesTable, activityTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";

const router = Router();

function formatRepo(r: any) {
  return {
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
  };
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const repos = await db.select().from(repositoriesTable).where(eq(repositoriesTable.userId, user.id));
    res.json(repos.map(formatRepo));
  } catch (err) {
    logger.error({ err }, "GET /repositories error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const { name, fullName, githubUrl, description, isPrivate } = req.body;
    const [repo] = await db.insert(repositoriesTable).values({
      userId: user.id,
      name,
      fullName,
      githubUrl,
      description: description ?? null,
      isPrivate: isPrivate ?? false,
    }).returning();

    await db.insert(activityTable).values({
      userId: user.id,
      type: "repository_connected",
      title: "Repository connected",
      description: `Connected ${fullName}`,
    });

    res.status(201).json(formatRepo(repo));
  } catch (err) {
    logger.error({ err }, "POST /repositories error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const id = parseInt(req.params.id);
    const repo = await db.select().from(repositoriesTable)
      .where(and(eq(repositoriesTable.id, id), eq(repositoriesTable.userId, user.id)))
      .limit(1).then(r => r[0]);
    if (!repo) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatRepo(repo));
  } catch (err) {
    logger.error({ err }, "GET /repositories/:id error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const id = parseInt(req.params.id);
    await db.delete(repositoriesTable)
      .where(and(eq(repositoriesTable.id, id), eq(repositoriesTable.userId, user.id)));
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "DELETE /repositories/:id error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/analyze", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const id = parseInt(req.params.id);
    const repo = await db.select().from(repositoriesTable)
      .where(and(eq(repositoriesTable.id, id), eq(repositoriesTable.userId, user.id)))
      .limit(1).then(r => r[0]);
    if (!repo) { res.status(404).json({ error: "Not found" }); return; }

    const infra = Math.floor(Math.random() * 30) + 65;
    const security = Math.floor(Math.random() * 30) + 55;
    const envVars = Math.floor(Math.random() * 40) + 40;
    const database = Math.floor(Math.random() * 30) + 60;
    const overall = Math.floor((infra + security + envVars + database) / 4);

    const detectedFrameworks = repo.language === "TypeScript" ? ["React", "Next.js"] : ["React"];
    const detectedBackend = ["Node.js", "Express"];
    const detectedDatabase = ["PostgreSQL"];

    const recommendations = [
      { category: "Security", severity: "warning", title: "Add HTTPS redirect", description: "Ensure all HTTP traffic is redirected to HTTPS in production." },
      { category: "Environment", severity: "critical", title: "Set up environment variables", description: "DATABASE_URL and API keys should not be hardcoded. Use environment variables." },
      { category: "Infrastructure", severity: "info", title: "Add health check endpoint", description: "A /healthz endpoint allows load balancers to verify app availability." },
    ];

    const deploymentOptions = [
      { provider: "AWS", type: "cloud", difficulty: "hard", estimatedCost: "$20-100/mo", estimatedTime: "2-4 hours", description: "Deploy to AWS ECS or Elastic Beanstalk for scalable cloud hosting." },
      { provider: "DigitalOcean", type: "cloud", difficulty: "easy", estimatedCost: "$5-25/mo", estimatedTime: "30-60 min", description: "Simple droplet or App Platform deployment." },
      { provider: "Google Cloud", type: "cloud", difficulty: "medium", estimatedCost: "$15-80/mo", estimatedTime: "1-2 hours", description: "Deploy to Google Cloud Run for serverless container hosting." },
      { provider: "Azure", type: "cloud", difficulty: "medium", estimatedCost: "$20-90/mo", estimatedTime: "1-3 hours", description: "Deploy to Azure App Service for Microsoft ecosystem integration." },
    ];

    await db.delete(repositoryAnalysesTable).where(eq(repositoryAnalysesTable.repositoryId, id));
    const [analysis] = await db.insert(repositoryAnalysesTable).values({
      repositoryId: id,
      overallScore: overall,
      infrastructureScore: infra,
      securityScore: security,
      envVarsScore: envVars,
      databaseScore: database,
      detectedFrameworks,
      detectedBackend,
      detectedDatabase,
      recommendations,
      deploymentOptions,
    }).returning();

    await db.update(repositoriesTable).set({ readinessScore: overall, updatedAt: new Date() }).where(eq(repositoriesTable.id, id));

    await db.insert(activityTable).values({
      userId: user.id,
      type: "analysis_completed",
      title: "Analysis completed",
      description: `${repo.fullName} scored ${overall}/100`,
    });

    res.json({
      repositoryId: analysis.repositoryId,
      overallScore: analysis.overallScore,
      infrastructureScore: analysis.infrastructureScore,
      securityScore: analysis.securityScore,
      envVarsScore: analysis.envVarsScore,
      databaseScore: analysis.databaseScore,
      detectedFrameworks: analysis.detectedFrameworks as string[],
      detectedBackend: analysis.detectedBackend as string[],
      detectedDatabase: analysis.detectedDatabase as string[],
      recommendations: analysis.recommendations as any[],
      deploymentOptions: analysis.deploymentOptions as any[],
      analyzedAt: analysis.analyzedAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "POST /repositories/:id/analyze error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/analysis", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const id = parseInt(req.params.id);
    const repo = await db.select().from(repositoriesTable)
      .where(and(eq(repositoriesTable.id, id), eq(repositoriesTable.userId, user.id)))
      .limit(1).then(r => r[0]);
    if (!repo) { res.status(404).json({ error: "Not found" }); return; }

    const analysis = await db.select().from(repositoryAnalysesTable)
      .where(eq(repositoryAnalysesTable.repositoryId, id))
      .limit(1).then(r => r[0]);
    if (!analysis) { res.status(404).json({ error: "No analysis yet" }); return; }

    res.json({
      repositoryId: analysis.repositoryId,
      overallScore: analysis.overallScore,
      infrastructureScore: analysis.infrastructureScore,
      securityScore: analysis.securityScore,
      envVarsScore: analysis.envVarsScore,
      databaseScore: analysis.databaseScore,
      detectedFrameworks: analysis.detectedFrameworks as string[],
      detectedBackend: analysis.detectedBackend as string[],
      detectedDatabase: analysis.detectedDatabase as string[],
      recommendations: analysis.recommendations as any[],
      deploymentOptions: analysis.deploymentOptions as any[],
      analyzedAt: analysis.analyzedAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "GET /repositories/:id/analysis error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
