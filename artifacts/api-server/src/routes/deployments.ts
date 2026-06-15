import { Router } from "express";
import { db, deploymentsTable, repositoriesTable, activityTable, cloudAccountsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";
import { Email } from "../lib/email";
import { generateDockerfile, generateGitHubActions, getGitHubSecretsRequired } from "../lib/configGenerator";
import { decrypt } from "../lib/encryption";
import { createDOApp, getDOAppStatus, getDODeployLogs } from "../lib/doDeployment";

const router = Router();

function formatDeployment(d: any) {
  return {
    id: d.id,
    userId: d.userId,
    repositoryId: d.repositoryId,
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
    const user = (req as any).dbUser;
    const id = parseInt(req.params.id);
    const deployment = await db.select().from(deploymentsTable)
      .where(and(eq(deploymentsTable.id, id), eq(deploymentsTable.userId, user.id)))
      .limit(1).then(r => r[0]);
    if (!deployment) { res.status(404).json({ error: "Not found" }); return; }
    res.json(formatDeployment(deployment));
  } catch (err) {
    logger.error({ err }, "GET /deployments/:id error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Phase 3: Execute a real DigitalOcean App Platform deployment
router.post("/:id/execute", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const id = parseInt(req.params.id);

    const deployment = await db.select().from(deploymentsTable)
      .where(and(eq(deploymentsTable.id, id), eq(deploymentsTable.userId, user.id)))
      .limit(1).then(r => r[0]);
    if (!deployment) { res.status(404).json({ error: "Deployment not found" }); return; }

    if (deployment.provider !== "digitalocean") {
      const repo = await db.select().from(repositoriesTable)
        .where(eq(repositoriesTable.id, deployment.repositoryId))
        .limit(1).then(r => r[0]);
      if (!repo) { res.status(404).json({ error: "Repository not found" }); return; }

      const provider = deployment.provider as "aws" | "gcp" | "azure";
      const dockerfile = generateDockerfile(repo.language, repo.framework);
      const workflowYaml = generateGitHubActions(provider, repo.name);
      const secrets = getGitHubSecretsRequired(provider);

      await db.update(deploymentsTable)
        .set({ status: "deploying", notes: `Guided ${provider.toUpperCase()} deployment — config generated`, updatedAt: new Date() })
        .where(eq(deploymentsTable.id, id));

      await db.insert(activityTable).values({
        userId: user.id,
        type: "deployment_created",
        title: `${provider.toUpperCase()} deployment configured`,
        description: `GitHub Actions + Dockerfile generated for ${repo.name}`,
      });

      logger.info({ deploymentId: id, provider }, "Guided deployment config generated");
      res.json({
        ...formatDeployment({ ...deployment, status: "deploying" }),
        guidedDeploy: {
          dockerfile,
          workflowYaml,
          workflowPath: `.github/workflows/deploy-${provider}.yml`,
          secrets,
          steps: [
            `Add the generated Dockerfile to the root of your repository`,
            `Create ${`.github/workflows/deploy-${provider}.yml`} with the generated workflow`,
            `Add the required GitHub Secrets in your repo → Settings → Secrets and variables → Actions`,
            `Push to main — GitHub Actions will build and deploy automatically`,
          ],
        },
      });
      return;
    }

    const doAccount = await db.select().from(cloudAccountsTable)
      .where(and(eq(cloudAccountsTable.userId, user.id), eq(cloudAccountsTable.provider, "digitalocean")))
      .limit(1).then(r => r[0]);

    if (!doAccount || doAccount.status !== "connected") {
      res.status(400).json({
        error: "No connected DigitalOcean account found. Add your DO API token in Cloud Accounts first.",
        requiresCloudAccount: true,
      });
      return;
    }

    const repo = await db.select().from(repositoriesTable)
      .where(eq(repositoriesTable.id, deployment.repositoryId))
      .limit(1).then(r => r[0]);
    if (!repo) { res.status(404).json({ error: "Repository not found" }); return; }

    let creds: any;
    try { creds = JSON.parse(decrypt(doAccount.credentialsEncrypted)); }
    catch { res.status(500).json({ error: "Failed to decrypt DigitalOcean credentials" }); return; }

    // Mark as deploying
    await db.update(deploymentsTable)
      .set({ status: "deploying", updatedAt: new Date() })
      .where(eq(deploymentsTable.id, id));

    const result = await createDOApp(creds.token, {
      name: repo.name,
      repoFullName: repo.fullName,
      language: repo.language ?? null,
      framework: repo.framework ?? null,
    });

    if (!result.ok) {
      await db.update(deploymentsTable)
        .set({ status: "failed", notes: result.error, updatedAt: new Date() })
        .where(eq(deploymentsTable.id, id));
      Email.sendDeploymentUpdate(user.email, repo.name, "failed");
      res.status(422).json({ error: result.error, errorCode: result.errorCode ?? "generic" });
      return;
    }

    const [updated] = await db.update(deploymentsTable)
      .set({
        status: result.liveUrl ? "deployed" : "deploying",
        doAppId: result.appId ?? null,
        doDeployId: result.deployId ?? null,
        deployedUrl: result.liveUrl ?? null,
        updatedAt: new Date(),
      })
      .where(eq(deploymentsTable.id, id))
      .returning();

    await db.update(repositoriesTable)
      .set({ deploymentStatus: result.liveUrl ? "deployed" : "deploying", updatedAt: new Date() })
      .where(eq(repositoriesTable.id, repo.id));

    await db.insert(activityTable).values({
      userId: user.id,
      type: "deployment_created",
      title: "Deployment launched on DigitalOcean",
      description: `${repo.fullName} — App ID: ${result.appId}`,
    });

    if (result.liveUrl) {
      Email.sendDeploymentUpdate(user.email, repo.name, "success", result.liveUrl);
    }

    logger.info({ deploymentId: id, doAppId: result.appId, liveUrl: result.liveUrl }, "DO deployment executed");
    res.json(formatDeployment(updated));
  } catch (err) {
    logger.error({ err }, "POST /deployments/:id/execute error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Phase 3: Sync deployment status from DigitalOcean
router.post("/:id/sync", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const id = parseInt(req.params.id);

    const deployment = await db.select().from(deploymentsTable)
      .where(and(eq(deploymentsTable.id, id), eq(deploymentsTable.userId, user.id)))
      .limit(1).then(r => r[0]);
    if (!deployment) { res.status(404).json({ error: "Not found" }); return; }
    if (!deployment.doAppId) { res.status(400).json({ error: "No DO app ID — has this been executed?" }); return; }

    const doAccount = await db.select().from(cloudAccountsTable)
      .where(and(eq(cloudAccountsTable.userId, user.id), eq(cloudAccountsTable.provider, "digitalocean")))
      .limit(1).then(r => r[0]);
    if (!doAccount) { res.status(400).json({ error: "No DigitalOcean account found" }); return; }

    let creds: any;
    try { creds = JSON.parse(decrypt(doAccount.credentialsEncrypted)); }
    catch { res.status(500).json({ error: "Failed to decrypt credentials" }); return; }

    const status = await getDOAppStatus(creds.token, deployment.doAppId);
    if (!status.ok) { res.status(500).json({ error: status.error }); return; }

    const phase = status.phase ?? "UNKNOWN";
    const newStatus = phase === "ACTIVE" ? "deployed" : (phase === "ERROR" || phase === "FAILED") ? "failed" : "deploying";

    const [updated] = await db.update(deploymentsTable)
      .set({ status: newStatus, deployedUrl: status.liveUrl ?? deployment.deployedUrl, updatedAt: new Date() })
      .where(eq(deploymentsTable.id, id))
      .returning();

    if (newStatus === "deployed" || newStatus === "failed") {
      const wasAlreadyFinal = deployment.status === "deployed" || deployment.status === "failed";
      if (!wasAlreadyFinal) {
        const repo = await db.select().from(repositoriesTable)
          .where(eq(repositoriesTable.id, deployment.repositoryId))
          .limit(1).then(r => r[0]);
        if (repo) {
          Email.sendDeploymentUpdate(user.email, repo.name, newStatus === "deployed" ? "success" : "failed", updated.deployedUrl ?? null);
        }
      }
    }

    if (newStatus === "deployed") {
      await db.update(repositoriesTable)
        .set({ deploymentStatus: "deployed", updatedAt: new Date() })
        .where(eq(repositoriesTable.id, deployment.repositoryId));
    }

    res.json({ ...formatDeployment(updated), doPhase: phase });
  } catch (err) {
    logger.error({ err }, "POST /deployments/:id/sync error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Real-time deployment status via SSE
router.get("/:id/stream", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const id = parseInt(req.params.id);

    const fetchRow = () =>
      db.select().from(deploymentsTable)
        .where(and(eq(deploymentsTable.id, id), eq(deploymentsTable.userId, user.id)))
        .limit(1).then(r => r[0]);

    const initial = await fetchRow();
    if (!initial) { res.status(404).json({ error: "Not found" }); return; }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const send = (d: any) => res.write(`data: ${JSON.stringify(formatDeployment(d))}\n\n`);
    const isTerminal = (s: string) => s === "deployed" || s === "failed" || s === "cancelled";

    send(initial);
    if (isTerminal(initial.status)) { res.end(); return; }

    const timer = setInterval(async () => {
      try {
        const row = await fetchRow();
        if (!row) { clearInterval(timer); res.end(); return; }
        send(row);
        if (isTerminal(row.status)) { clearInterval(timer); res.end(); }
      } catch { clearInterval(timer); res.end(); }
    }, 5000);

    req.on("close", () => clearInterval(timer));
  } catch (err) {
    logger.error({ err }, "GET /deployments/:id/stream error");
    if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
  }
});

// Phase 3: Fetch real build logs from DigitalOcean
router.get("/:id/logs", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const id = parseInt(req.params.id);

    const deployment = await db.select().from(deploymentsTable)
      .where(and(eq(deploymentsTable.id, id), eq(deploymentsTable.userId, user.id)))
      .limit(1).then(r => r[0]);
    if (!deployment) { res.status(404).json({ error: "Not found" }); return; }

    if (!deployment.doAppId || !deployment.doDeployId) {
      res.json({ logs: "No deployment has been executed yet.", source: "none" });
      return;
    }

    const doAccount = await db.select().from(cloudAccountsTable)
      .where(and(eq(cloudAccountsTable.userId, user.id), eq(cloudAccountsTable.provider, "digitalocean")))
      .limit(1).then(r => r[0]);
    if (!doAccount) { res.json({ logs: "No DigitalOcean account found.", source: "error" }); return; }

    let creds: any;
    try { creds = JSON.parse(decrypt(doAccount.credentialsEncrypted)); }
    catch { res.json({ logs: "Failed to decrypt credentials.", source: "error" }); return; }

    const logs = await getDODeployLogs(creds.token, deployment.doAppId, deployment.doDeployId);
    res.json({ logs, source: "digitalocean" });
  } catch (err) {
    logger.error({ err }, "GET /deployments/:id/logs error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
