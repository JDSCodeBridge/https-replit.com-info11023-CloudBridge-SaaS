import { Request, Response, NextFunction } from "express";
import { db, auditLogsTable } from "@workspace/db";
import { logger } from "../lib/logger";

const AUDITED_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const SKIP_PATHS = ["/stripe/webhook", "/healthz"];

function inferResource(method: string, urlPath: string) {
  const parts = urlPath.split("?")[0].split("/").filter(Boolean);
  const lastSegment = parts[parts.length - 1];
  const isId = /^\d+$/.test(lastSegment);
  const resourceType = isId ? parts[parts.length - 2] : lastSegment;
  const resourceId = isId ? lastSegment : null;
  return {
    action: `${method.toLowerCase()}:${urlPath.split("?")[0]}`,
    resourceType: resourceType ?? null,
    resourceId,
  };
}

export function auditLogger(req: Request, res: Response, next: NextFunction) {
  if (!AUDITED_METHODS.has(req.method)) { next(); return; }
  if (SKIP_PATHS.some(p => req.path.includes(p))) { next(); return; }

  res.on("finish", () => {
    if (res.statusCode >= 500) return;
    const user = (req as any).dbUser;
    const { action, resourceType, resourceId } = inferResource(req.method, req.path);
    db.insert(auditLogsTable).values({
      userId: user?.id ?? null,
      action,
      resourceType,
      resourceId,
      ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ?? req.socket?.remoteAddress ?? null,
      userAgent: req.headers["user-agent"]?.slice(0, 200) ?? null,
      metadata: null,
    }).catch(err => logger.warn({ err }, "auditLog insert failed"));
  });

  next();
}
