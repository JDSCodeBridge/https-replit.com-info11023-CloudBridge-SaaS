import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/requireAuth";
import { db, repositoriesTable, activityTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GithubClient, GithubClientWriter } from "../lib/githubClient";
import { decrypt } from "../lib/encryption";
import { logger } from "../lib/logger";
import AdmZip from "adm-zip";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.originalname.endsWith(".zip") || file.mimetype === "application/zip" || file.mimetype === "application/x-zip-compressed") {
      cb(null, true);
    } else {
      cb(new Error("Only ZIP files are accepted"));
    }
  },
});

function isBinary(buf: Buffer): boolean {
  for (let i = 0; i < Math.min(buf.length, 512); i++) {
    if (buf[i] === 0) return true;
  }
  return false;
}

const SKIP_DIRS = new Set(["node_modules", ".git", ".cache", "__pycache__", "venv", ".venv", "dist", ".next", "build", ".turbo"]);
const MAX_FILE_BYTES = 200_000;
const MAX_FILES = 150;

function extractZip(buffer: Buffer): { files: Record<string, string>; count: number } {
  const zip = new AdmZip(buffer);
  const files: Record<string, string> = {};
  let count = 0;

  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue;

    const parts = entry.entryName.split("/");
    const name = parts.length > 1 && !parts[0].includes(".") ? parts.slice(1).join("/") : entry.entryName;
    if (!name) continue;

    const topDir = name.split("/")[0];
    if (SKIP_DIRS.has(topDir)) continue;
    if (name.startsWith(".")) continue;
    if (name.length > 200) continue;

    const data = entry.getData();
    if (isBinary(data)) continue;
    if (data.length > MAX_FILE_BYTES) continue;

    files[name] = data.toString("utf8");
    count++;
    if (count >= MAX_FILES) break;
  }

  return { files, count };
}

router.post("/zip", requireAuth, upload.single("zipFile"), async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const { repoName, description = "", isPrivate = "false", source = "zip" } = req.body;

    if (!req.file) { res.status(400).json({ error: "ZIP file is required" }); return; }
    if (!repoName) { res.status(400).json({ error: "repoName is required" }); return; }

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

    const { files, count } = extractZip(req.file.buffer);

    if (Object.keys(files).length === 0) {
      files["README.md"] = `# ${repoName}\n\nImported via CodeBridge.\n\n${description}`;
    }

    const { fullName, htmlUrl } = await writer.createRepo(
      repoName,
      description || `Imported via CodeBridge`,
      isPrivate === "true",
    );

    await writer.pushFilesToNewRepo(owner, repoName, files);

    const [repo] = await db.insert(repositoriesTable).values({
      userId: user.id,
      name: repoName,
      fullName,
      githubUrl: htmlUrl,
      isPrivate: isPrivate === "true",
      description: description || `Imported via CodeBridge`,
      deploymentStatus: "not_deployed",
    }).returning();

    const sourceLabel = source === "claude" ? "Claude Code" : "ZIP upload";
    await db.insert(activityTable).values({
      userId: user.id,
      type: "repository_connected",
      title: `Imported "${repoName}" from ${sourceLabel}`,
      description: `${count} files pushed to GitHub repo ${fullName}`,
    });

    logger.info({ userId: user.id, fullName, count, source }, "ZIP import completed");
    res.json({ repositoryId: repo.id, fullName, githubUrl: htmlUrl, filesImported: count });
  } catch (err: any) {
    logger.error({ err }, "POST /import/zip error");
    const msg = err?.message ?? "Import failed";
    if (msg.includes("name already exists")) {
      res.status(400).json({ error: "A GitHub repository with that name already exists. Choose a different name." });
      return;
    }
    res.status(500).json({ error: msg });
  }
});

export default router;
