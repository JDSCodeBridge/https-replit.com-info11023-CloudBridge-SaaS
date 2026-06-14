import { Router } from "express";
import { db, repositoriesTable, repositoryAnalysesTable, activityTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? "placeholder",
});

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

    logger.info({ repoId: id, fullName: repo.fullName }, "Starting AI analysis");

    const prompt = `You are a cloud deployment readiness expert. Analyze this GitHub repository and provide a realistic deployment readiness assessment.

Repository: ${repo.fullName}
Description: ${repo.description || "No description provided"}
Primary Language: ${repo.language || "Unknown"}
GitHub URL: ${repo.githubUrl}

Assess based on typical patterns for this type of project. Be realistic — most projects score 50-80, not 100.

Respond with ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "overallScore": <integer 0-100>,
  "infrastructureScore": <integer 0-100>,
  "securityScore": <integer 0-100>,
  "envVarsScore": <integer 0-100>,
  "databaseScore": <integer 0-100>,
  "detectedFrameworks": ["framework names based on language/description"],
  "detectedBackend": ["backend technologies"],
  "detectedDatabase": ["likely databases"],
  "recommendations": [
    {
      "category": "Security",
      "severity": "critical",
      "title": "Set environment variables securely",
      "description": "Ensure API keys and secrets are stored in environment variables, not hardcoded in source code."
    },
    {
      "category": "Infrastructure",
      "severity": "warning",
      "title": "Add a health check endpoint",
      "description": "A /health or /healthz endpoint allows load balancers and orchestrators to verify availability."
    },
    {
      "category": "Environment",
      "severity": "info",
      "title": "Add a .env.example file",
      "description": "Document required environment variables so deployers know what to configure."
    }
  ],
  "deploymentOptions": [
    {
      "provider": "DigitalOcean",
      "type": "cloud",
      "difficulty": "easy",
      "estimatedCost": "$5-25/mo",
      "estimatedTime": "30-60 min",
      "description": "Deploy to DigitalOcean App Platform for the simplest managed hosting experience."
    },
    {
      "provider": "AWS",
      "type": "cloud",
      "difficulty": "hard",
      "estimatedCost": "$20-100/mo",
      "estimatedTime": "2-4 hours",
      "description": "Deploy to AWS ECS or Elastic Beanstalk for enterprise-grade scalable cloud hosting."
    },
    {
      "provider": "Google Cloud",
      "type": "cloud",
      "difficulty": "medium",
      "estimatedCost": "$15-80/mo",
      "estimatedTime": "1-2 hours",
      "description": "Deploy to Google Cloud Run for serverless container hosting with automatic scaling."
    },
    {
      "provider": "Azure",
      "type": "cloud",
      "difficulty": "medium",
      "estimatedCost": "$20-90/mo",
      "estimatedTime": "1-3 hours",
      "description": "Deploy to Azure App Service for seamless Microsoft ecosystem integration."
    }
  ]
}`;

    let analysisData: any;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5-mini",
        max_completion_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      });

      const content = response.choices[0]?.message?.content ?? "";
      // Strip any accidental markdown code fences
      const jsonText = content.replace(/```(?:json)?\n?/g, "").replace(/```/g, "").trim();
      analysisData = JSON.parse(jsonText);
      logger.info({ repoId: id }, "AI analysis completed successfully");
    } catch (aiErr) {
      logger.warn({ aiErr }, "AI analysis failed, using rule-based fallback");
      // Deterministic fallback based on repo metadata
      const langScores: Record<string, number> = {
        TypeScript: 72, JavaScript: 68, Python: 65, Go: 80, Rust: 82, Java: 70,
      };
      const base = langScores[repo.language ?? ""] ?? 60;
      analysisData = {
        overallScore: base,
        infrastructureScore: base + 5,
        securityScore: base - 5,
        envVarsScore: base - 10,
        databaseScore: base,
        detectedFrameworks: repo.language === "TypeScript" ? ["React", "Node.js"] : repo.language === "Python" ? ["FastAPI"] : ["Unknown"],
        detectedBackend: repo.language === "TypeScript" ? ["Express", "Node.js"] : repo.language === "Python" ? ["Python"] : ["Unknown"],
        detectedDatabase: ["PostgreSQL"],
        recommendations: [
          { category: "Security", severity: "critical", title: "Set environment variables securely", description: "Ensure API keys and secrets are stored in environment variables, not hardcoded." },
          { category: "Infrastructure", severity: "warning", title: "Add a health check endpoint", description: "A /health endpoint allows load balancers to verify availability." },
          { category: "Environment", severity: "info", title: "Add a .env.example file", description: "Document required environment variables for deployers." },
        ],
        deploymentOptions: [
          { provider: "DigitalOcean", type: "cloud", difficulty: "easy", estimatedCost: "$5-25/mo", estimatedTime: "30-60 min", description: "Deploy to DigitalOcean App Platform for simple managed hosting." },
          { provider: "AWS", type: "cloud", difficulty: "hard", estimatedCost: "$20-100/mo", estimatedTime: "2-4 hours", description: "Deploy to AWS ECS for enterprise-grade scalable hosting." },
          { provider: "Google Cloud", type: "cloud", difficulty: "medium", estimatedCost: "$15-80/mo", estimatedTime: "1-2 hours", description: "Deploy to Google Cloud Run for serverless container hosting." },
          { provider: "Azure", type: "cloud", difficulty: "medium", estimatedCost: "$20-90/mo", estimatedTime: "1-3 hours", description: "Deploy to Azure App Service for Microsoft ecosystem integration." },
        ],
      };
    }

    await db.delete(repositoryAnalysesTable).where(eq(repositoryAnalysesTable.repositoryId, id));
    const [analysis] = await db.insert(repositoryAnalysesTable).values({
      repositoryId: id,
      overallScore: analysisData.overallScore,
      infrastructureScore: analysisData.infrastructureScore,
      securityScore: analysisData.securityScore,
      envVarsScore: analysisData.envVarsScore,
      databaseScore: analysisData.databaseScore,
      detectedFrameworks: analysisData.detectedFrameworks,
      detectedBackend: analysisData.detectedBackend,
      detectedDatabase: analysisData.detectedDatabase,
      recommendations: analysisData.recommendations,
      deploymentOptions: analysisData.deploymentOptions,
    }).returning();

    await db.update(repositoriesTable)
      .set({ readinessScore: analysisData.overallScore, updatedAt: new Date() })
      .where(eq(repositoriesTable.id, id));

    await db.insert(activityTable).values({
      userId: user.id,
      type: "analysis_completed",
      title: "Analysis completed",
      description: `${repo.fullName} scored ${analysisData.overallScore}/100`,
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
