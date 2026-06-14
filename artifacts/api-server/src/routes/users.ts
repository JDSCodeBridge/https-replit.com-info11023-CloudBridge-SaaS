import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    res.json({
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      githubConnected: user.githubConnected,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "GET /users/me error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/me", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const { name, avatarUrl } = req.body;
    const [updated] = await db.update(usersTable)
      .set({ name, avatarUrl, updatedAt: new Date() })
      .where(eq(usersTable.id, user.id))
      .returning();
    res.json({
      id: updated.id,
      clerkId: updated.clerkId,
      email: updated.email,
      name: updated.name,
      avatarUrl: updated.avatarUrl,
      role: updated.role,
      githubConnected: updated.githubConnected,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "PATCH /users/me error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
