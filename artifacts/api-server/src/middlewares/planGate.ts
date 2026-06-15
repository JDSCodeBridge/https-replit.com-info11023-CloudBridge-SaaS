import { Request, Response, NextFunction } from "express";
import { db, repositoriesTable, subscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const FREE_REPO_LIMIT = 1;

export async function requireRepoSlot(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).dbUser;
    if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

    const sub = await db.select().from(subscriptionsTable)
      .where(eq(subscriptionsTable.userId, user.id))
      .limit(1)
      .then(r => r[0]);

    const plan = sub?.plan ?? "free";
    if (plan !== "free") { next(); return; }

    const repos = await db.select().from(repositoriesTable)
      .where(eq(repositoriesTable.userId, user.id));

    if (repos.length >= FREE_REPO_LIMIT) {
      res.status(402).json({
        error: "Repository limit reached",
        message: `Free plan allows ${FREE_REPO_LIMIT} repository. Upgrade to Pro for unlimited repositories.`,
        upgradeRequired: true,
        limit: FREE_REPO_LIMIT,
        current: repos.length,
      });
      return;
    }

    next();
  } catch (err) {
    logger.error({ err }, "planGate error");
    next();
  }
}
