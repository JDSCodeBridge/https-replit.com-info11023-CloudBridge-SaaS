import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { db, usersTable, repositoriesTable, activityTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GithubClient, GithubClientWriter } from "../lib/githubClient";
import { decrypt } from "../lib/encryption";
import { logger } from "../lib/logger";
import AdmZip from "adm-zip";

const router = Router();

function parseReplitUrl(raw: string): { username: string; slug: string } | null {
  try {
    const url = new URL(raw.trim());
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length >= 2 && parts[0].startsWith("@")) {
      return { username: parts[0].slice(1), slug: parts[1].split("?")[0] };
    }
  } catch {}
  return null;
}

function isBinary(buf: Buffer): boolean {
  for (let i = 0; i < Math.min(buf.length, 512); i++) {
    if (buf[i] === 0) return true;
  }
  return false;
}

function stripTopDir(entryName: string): string {
  const parts = entryName.split("/");
  return parts.length > 1 ? parts.slice(1).join("/") : entryName;
}

const SKIP_DIRS = new Set([".git", "node_modules", ".cache", "__pycache__", ".replit", "venv", ".venv"]);
const MAX_FILE_SIZE = 200_000;
const MAX_FILES = 150;

router.post("/preview", requireAuth, async (req, res) => {
  try {
    const { replitUrl } = req.body;
    if (!replitUrl) { res.status(400).json({ error: "replitUrl is required" }); return; }

    const parsed = parseReplitUrl(replitUrl);
    if (!parsed) {
      res.status(400).json({ error: "Invalid Replit URL. Expected format: https://replit.com/@username/project-name" });
      return;
    }

    const { username, slug } = parsed;

    try {
      const gqlRes = await fetch("https://replit.com/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent": "Mozilla/5.0",
        },
        body: JSON.stringify({
          query: `query ReplInfo($url: String!) {
            repl(url: $url) {
              id slug title description language isPrivate
              user { username }
            }
          }`,
          variables: { url: `/@${username}/${slug}` },
        }),
      });

      if (gqlRes.ok) {
        const gql = await gqlRes.json() as any;
        const repl = gql?.data?.repl;
        if (repl) {
          res.json({
            username: repl.user?.username ?? username,
            slug: repl.slug ?? slug,
            title: repl.title ?? slug,
            description: repl.description ?? "",
            language: repl.language ?? null,
            isPrivate: repl.isPrivate ?? false,
          });
          return;
        }
      }
    } catch (err) {
      logger.warn({ err }, "Replit GraphQL unavailable — falling back to URL parse");
    }

    res.json({ username, slug, title: slug, description: "", language: null, isPrivate: false });
  } catch (err) {
    logger.error({ err }, "POST /replit/preview error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/import", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const { username, slug, title, description, language, repoName, isPrivate = false } = req.body;

    if (!username || !slug || !repoName) {
      res.status(400).json({ error: "username, slug, and repoName are required" });
      return;
    }

    if (!user.githubConnected || !user.githubAccessToken) {
      res.status(400).json({ error: "GitHub not connected. Add a Personal Access Token in Settings first." });
      return;
    }

    let token: string;
    try {
      token = decrypt(user.githubAccessToken);
    } catch {
      res.status(500).json({ error: "Failed to decrypt GitHub token. Please reconnect GitHub in Settings." });
      return;
    }

    const reader = new GithubClient(token);
    const writer = new GithubClientWriter(token);
    const ghUser = await reader.getUser();
    const owner = ghUser.login;

    res.setHeader("Content-Type", "application/json");

    let files: Record<string, string> = {};
    let downloadedCount = 0;

    try {
      const zipUrl = `https://replit.com/@${username}/${slug}.zip`;
      logger.info({ zipUrl }, "Downloading Replit archive");
      const zipRes = await fetch(zipUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
        redirect: "follow",
      });

      if (zipRes.ok) {
        const buffer = Buffer.from(await zipRes.arrayBuffer());
        const zip = new AdmZip(buffer);

        for (const entry of zip.getEntries()) {
          if (entry.isDirectory) continue;

          const rawName = entry.entryName;
          const name = stripTopDir(rawName);
          if (!name) continue;

          const topDir = name.split("/")[0];
          if (SKIP_DIRS.has(topDir)) continue;
          if (name.startsWith(".")) continue;
          if (name.length > 200) continue;

          const data = entry.getData();
          if (isBinary(data)) continue;
          if (data.length > MAX_FILE_SIZE) continue;

          files[name] = data.toString("utf8");
          downloadedCount++;
          if (downloadedCount >= MAX_FILES) break;
        }

        logger.info({ downloadedCount }, "Replit archive extracted");
      } else {
        logger.warn({ status: zipRes.status }, "Replit zip download failed");
      }
    } catch (err) {
      logger.warn({ err }, "Replit zip download error — proceeding with README only");
    }

    if (Object.keys(files).length === 0) {
      files["README.md"] = [
        `# ${title ?? repoName}`,
        ``,
        `Imported from Replit: https://replit.com/@${username}/${slug}`,
        ``,
        description ? `${description}` : "",
        language ? `**Language:** ${language}` : "",
        ``,
        `## Getting Started`,
        ``,
        `Push your Replit project files here and CloudLift will analyze them for deployment.`,
      ].filter(l => l !== undefined).join("\n");
    }

    const { fullName, htmlUrl } = await writer.createRepo(
      repoName,
      description ?? `Imported from Replit: ${slug}`,
      isPrivate as boolean,
    );

    await writer.pushFilesToNewRepo(owner, repoName, files);

    const [repo] = await db.insert(repositoriesTable).values({
      userId: user.id,
      name: repoName,
      fullName,
      githubUrl: htmlUrl,
      isPrivate: isPrivate as boolean,
      description: description ?? `Imported from Replit: ${slug}`,
      deploymentStatus: "not_deployed",
    }).returning();

    await db.insert(activityTable).values({
      userId: user.id,
      type: "repository_connected",
      title: `Imported "${title ?? slug}" from Replit`,
      description: `${downloadedCount} files → GitHub repo ${fullName}`,
    });

    logger.info({ userId: user.id, fullName, downloadedCount }, "Replit import completed");

    res.json({
      repositoryId: repo.id,
      fullName,
      githubUrl: htmlUrl,
      filesImported: downloadedCount,
    });
  } catch (err: any) {
    logger.error({ err }, "POST /replit/import error");
    const msg = err?.message ?? "Import failed";
    if (msg.includes("name already exists")) {
      res.status(400).json({ error: "A GitHub repository with that name already exists. Choose a different name." });
      return;
    }
    res.status(500).json({ error: msg });
  }
});

export default router;
