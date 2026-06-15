import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";
import { encrypt, decrypt } from "../lib/encryption";
import { GithubClient, validateGithubToken } from "../lib/githubClient";

const router = Router();

router.get("/status", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    res.json({
      connected: user.githubConnected ?? false,
      username: user.githubUsername ?? null,
    });
  } catch (err) {
    logger.error({ err }, "GET /github/status error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/connect", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const { token } = req.body;
    if (!token || typeof token !== "string" || token.trim().length < 10) {
      res.status(400).json({ error: "A valid GitHub Personal Access Token is required." });
      return;
    }

    const validation = await validateGithubToken(token.trim());
    if (!validation.ok) {
      res.status(400).json({ error: validation.error ?? "Invalid GitHub token" });
      return;
    }

    const encrypted = encrypt(token.trim());
    await db.update(usersTable)
      .set({
        githubConnected: true,
        githubUsername: validation.username ?? null,
        githubAccessToken: encrypted,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, user.id));

    logger.info({ userId: user.id, username: validation.username }, "GitHub connected");
    res.json({ ok: true, username: validation.username, name: validation.name });
  } catch (err) {
    logger.error({ err }, "POST /github/connect error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/disconnect", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    await db.update(usersTable)
      .set({ githubConnected: false, githubUsername: null, githubAccessToken: null, updatedAt: new Date() })
      .where(eq(usersTable.id, user.id));

    logger.info({ userId: user.id }, "GitHub disconnected");
    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "DELETE /github/disconnect error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/repos", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;

    if (!user.githubConnected || !user.githubAccessToken) {
      res.status(400).json({ error: "GitHub is not connected. Add a Personal Access Token in Settings." });
      return;
    }

    let token: string;
    try {
      token = decrypt(user.githubAccessToken);
    } catch {
      res.status(500).json({ error: "Failed to decrypt GitHub token. Please reconnect in Settings." });
      return;
    }

    const client = new GithubClient(token);
    const repos = await client.listRepos();

    res.json(repos.map(r => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      githubUrl: r.html_url,
      description: r.description,
      isPrivate: r.private,
      language: r.language,
      defaultBranch: r.default_branch,
      pushedAt: r.pushed_at,
      stars: r.stargazers_count,
    })));
  } catch (err: any) {
    logger.error({ err }, "GET /github/repos error");
    if (err.message?.includes("Bad credentials") || err.message?.includes("401")) {
      res.status(401).json({ error: "GitHub token is invalid or expired. Please reconnect in Settings." });
      return;
    }
    res.status(500).json({ error: "Failed to fetch repositories from GitHub." });
  }
});

export default router;
