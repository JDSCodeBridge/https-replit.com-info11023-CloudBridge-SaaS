import { Router } from "express";
import { db, cloudAccountsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";
import { encrypt, decrypt } from "../lib/encryption";
import {
  validateAws,
  validateDigitalOcean,
  validateAzure,
  validateGcp,
} from "../lib/cloudValidators";

const router = Router();

function safeFormat(acct: any) {
  return {
    id: acct.id,
    provider: acct.provider,
    status: acct.status,
    accountLabel: acct.accountLabel,
    lastValidatedAt: acct.lastValidatedAt?.toISOString() ?? null,
    validationError: acct.validationError,
    createdAt: acct.createdAt.toISOString(),
    updatedAt: acct.updatedAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const accounts = await db
      .select()
      .from(cloudAccountsTable)
      .where(eq(cloudAccountsTable.userId, user.id));
    res.json(accounts.map(safeFormat));
  } catch (err) {
    logger.error({ err }, "GET /cloud-accounts error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const { provider, credentials } = req.body;

    if (!provider || !credentials) {
      res.status(400).json({ error: "provider and credentials are required" });
      return;
    }

    const encrypted = encrypt(JSON.stringify(credentials));

    const existing = await db
      .select()
      .from(cloudAccountsTable)
      .where(and(eq(cloudAccountsTable.userId, user.id), eq(cloudAccountsTable.provider, provider)))
      .limit(1);

    let account;
    if (existing.length > 0) {
      [account] = await db
        .update(cloudAccountsTable)
        .set({
          credentialsEncrypted: encrypted,
          status: "pending",
          validationError: null,
          accountLabel: null,
          updatedAt: new Date(),
        })
        .where(eq(cloudAccountsTable.id, existing[0].id))
        .returning();
    } else {
      [account] = await db
        .insert(cloudAccountsTable)
        .values({
          userId: user.id,
          provider,
          credentialsEncrypted: encrypted,
          status: "pending",
        })
        .returning();
    }

    res.status(201).json(safeFormat(account));
  } catch (err) {
    logger.error({ err }, "POST /cloud-accounts error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Lightweight token-only validation used by the deploy wizard (no DB save required)
router.post("/validate-token", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const { provider, token } = req.body;
    if (!provider || !token) {
      res.status(400).json({ ok: false, error: "provider and token are required" });
      return;
    }

    let result;
    switch (provider) {
      case "digitalocean":
        result = await validateDigitalOcean({ token });
        break;
      case "aws":
        result = await validateAws({ accessKeyId: req.body.accessKeyId, secretAccessKey: req.body.secretAccessKey });
        break;
      default:
        res.status(400).json({ ok: false, error: `Unsupported provider: ${provider}` });
        return;
    }

    if (!result.ok) {
      res.json({ ok: false, error: result.error });
      return;
    }

    // Save/update cloud account so it's available later
    const encrypted = encrypt(JSON.stringify(provider === "digitalocean" ? { token } : req.body));
    const existing = await db
      .select()
      .from(cloudAccountsTable)
      .where(and(eq(cloudAccountsTable.userId, user.id), eq(cloudAccountsTable.provider, provider)))
      .limit(1);

    let accountId: number;
    if (existing.length > 0) {
      const [updated] = await db
        .update(cloudAccountsTable)
        .set({ credentialsEncrypted: encrypted, status: "connected", accountLabel: result.label, validationError: null, lastValidatedAt: new Date(), updatedAt: new Date() })
        .where(eq(cloudAccountsTable.id, existing[0].id))
        .returning();
      accountId = updated.id;
    } else {
      const [created] = await db
        .insert(cloudAccountsTable)
        .values({ userId: user.id, provider, credentialsEncrypted: encrypted, status: "connected", accountLabel: result.label, lastValidatedAt: new Date() })
        .returning();
      accountId = created.id;
    }

    const emailMatch = result.label.match(/· ([^ ]+@[^ ]+)/);
    res.json({ ok: true, label: result.label, accountId, email: emailMatch?.[1] ?? "" });
  } catch (err) {
    logger.error({ err }, "POST /cloud-accounts/validate-token error");
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

router.post("/:id/validate", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const id = parseInt(req.params.id);

    const [acct] = await db
      .select()
      .from(cloudAccountsTable)
      .where(and(eq(cloudAccountsTable.id, id), eq(cloudAccountsTable.userId, user.id)))
      .limit(1);

    if (!acct) {
      res.status(404).json({ error: "Cloud account not found" });
      return;
    }

    let creds: any;
    try {
      creds = JSON.parse(decrypt(acct.credentialsEncrypted));
    } catch {
      res.status(500).json({ error: "Failed to decrypt credentials" });
      return;
    }

    let result;
    switch (acct.provider) {
      case "aws":
        result = await validateAws(creds);
        break;
      case "digitalocean":
        result = await validateDigitalOcean(creds);
        break;
      case "azure":
        result = await validateAzure(creds);
        break;
      case "gcp":
        result = await validateGcp(creds);
        break;
      default:
        res.status(400).json({ error: `Unknown provider: ${acct.provider}` });
        return;
    }

    const [updated] = await db
      .update(cloudAccountsTable)
      .set({
        status: result.ok ? "connected" : "invalid",
        accountLabel: result.ok ? result.label : acct.accountLabel,
        validationError: result.ok ? null : result.error,
        lastValidatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(cloudAccountsTable.id, id))
      .returning();

    res.json({ ...safeFormat(updated), validationResult: result });
  } catch (err) {
    logger.error({ err }, "POST /cloud-accounts/:id/validate error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const user = (req as any).dbUser;
    const id = parseInt(req.params.id);

    const deleted = await db
      .delete(cloudAccountsTable)
      .where(and(eq(cloudAccountsTable.id, id), eq(cloudAccountsTable.userId, user.id)))
      .returning();

    if (!deleted.length) {
      res.status(404).json({ error: "Cloud account not found" });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "DELETE /cloud-accounts/:id error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
