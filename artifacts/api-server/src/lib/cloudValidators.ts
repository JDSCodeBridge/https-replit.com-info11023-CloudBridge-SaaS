import { createSign } from "crypto";

export type ValidationResult =
  | { ok: true; label: string }
  | { ok: false; error: string };

// ── AWS ────────────────────────────────────────────────────────────────────
export async function validateAws(creds: {
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
}): Promise<ValidationResult> {
  try {
    const { STSClient, GetCallerIdentityCommand } = await import("@aws-sdk/client-sts");
    const client = new STSClient({
      region: creds.region || "us-east-1",
      credentials: {
        accessKeyId: creds.accessKeyId,
        secretAccessKey: creds.secretAccessKey,
      },
    });
    const result = await client.send(new GetCallerIdentityCommand({}));
    return {
      ok: true,
      label: `AWS · ${result.Account} · ${result.Arn?.split("/").pop() ?? "IAM user"}`,
    };
  } catch (err: any) {
    return { ok: false, error: err.message ?? "AWS validation failed" };
  }
}

// ── DigitalOcean ──────────────────────────────────────────────────────────
export async function validateDigitalOcean(creds: {
  token: string;
}): Promise<ValidationResult> {
  try {
    const res = await fetch("https://api.digitalocean.com/v2/account", {
      headers: { Authorization: `Bearer ${creds.token}`, "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, error: (body as any).message ?? `HTTP ${res.status}` };
    }
    const body: any = await res.json();
    const acct = body.account;
    return {
      ok: true,
      label: `DigitalOcean · ${acct?.email ?? "account"} · ${acct?.status ?? "active"}`,
    };
  } catch (err: any) {
    return { ok: false, error: err.message ?? "DigitalOcean validation failed" };
  }
}

// ── Azure ─────────────────────────────────────────────────────────────────
export async function validateAzure(creds: {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  subscriptionId: string;
}): Promise<ValidationResult> {
  try {
    // Step 1: get access token via client credentials
    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${creds.tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: creds.clientId,
          client_secret: creds.clientSecret,
          scope: "https://management.azure.com/.default",
        }),
      }
    );
    if (!tokenRes.ok) {
      const body: any = await tokenRes.json().catch(() => ({}));
      return { ok: false, error: body.error_description ?? `Auth failed: HTTP ${tokenRes.status}` };
    }
    const { access_token } = await tokenRes.json() as any;

    // Step 2: verify subscription access
    const subRes = await fetch(
      `https://management.azure.com/subscriptions/${creds.subscriptionId}?api-version=2020-01-01`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    if (!subRes.ok) {
      return { ok: false, error: `Subscription not accessible: HTTP ${subRes.status}` };
    }
    const sub: any = await subRes.json();
    return {
      ok: true,
      label: `Azure · ${sub.displayName ?? creds.subscriptionId} · ${sub.state ?? "active"}`,
    };
  } catch (err: any) {
    return { ok: false, error: err.message ?? "Azure validation failed" };
  }
}

// ── Google Cloud ──────────────────────────────────────────────────────────
async function gcpSignJwt(serviceAccountJson: any, scope: string): Promise<string> {
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    iss: serviceAccountJson.client_email,
    scope,
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  })).toString("base64url");
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`);
  const sig = signer.sign(serviceAccountJson.private_key, "base64url");
  return `${header}.${payload}.${sig}`;
}

export async function validateGcp(creds: {
  projectId: string;
  serviceAccountJson: string;
}): Promise<ValidationResult> {
  try {
    let sa: any;
    try {
      sa = JSON.parse(creds.serviceAccountJson);
    } catch {
      return { ok: false, error: "Service account JSON is not valid JSON" };
    }
    if (!sa.private_key || !sa.client_email) {
      return { ok: false, error: "Service account JSON missing private_key or client_email" };
    }

    // Exchange JWT for access token
    const jwt = await gcpSignJwt(sa, "https://www.googleapis.com/auth/cloud-platform");
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });
    if (!tokenRes.ok) {
      const body: any = await tokenRes.json().catch(() => ({}));
      return { ok: false, error: body.error_description ?? `GCP auth failed: HTTP ${tokenRes.status}` };
    }
    const { access_token } = await tokenRes.json() as any;

    // Verify project access
    const projRes = await fetch(
      `https://cloudresourcemanager.googleapis.com/v1/projects/${creds.projectId}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    if (!projRes.ok) {
      return { ok: false, error: `Project not accessible: HTTP ${projRes.status}` };
    }
    const proj: any = await projRes.json();
    return {
      ok: true,
      label: `GCP · ${proj.name ?? creds.projectId} · ${sa.client_email}`,
    };
  } catch (err: any) {
    return { ok: false, error: err.message ?? "GCP validation failed" };
  }
}
