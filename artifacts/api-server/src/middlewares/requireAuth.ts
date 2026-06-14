import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    let user = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId)).limit(1).then(r => r[0]);
    if (!user) {
      const clerkUser = (req as any).clerkUser;
      user = await db.insert(usersTable).values({
        clerkId: userId,
        email: clerkUser?.emailAddresses?.[0]?.emailAddress ?? userId + "@unknown.com",
        name: clerkUser ? `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null : null,
        avatarUrl: clerkUser?.imageUrl ?? null,
        role: "user",
      }).returning().then(r => r[0]);
    }
    (req as any).dbUser = user;
    next();
  } catch (err) {
    logger.error({ err }, "requireAuth error");
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  await requireAuth(req, res, async () => {
    const user = (req as any).dbUser;
    if (user?.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  });
}
