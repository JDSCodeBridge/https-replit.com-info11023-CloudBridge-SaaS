import { logger } from "./logger";

const DO_API = "https://api.digitalocean.com/v2";

export interface DOAppSpec {
  name: string;
  region?: string;
  repoFullName: string;
  branch?: string;
  language: string | null;
  framework: string | null;
}

export interface DODeployResult {
  ok: boolean;
  appId?: string;
  deployId?: string;
  liveUrl?: string;
  error?: string;
}

function inferEnvironmentSlug(language: string | null, framework: string | null): string {
  const lang = (language ?? "").toLowerCase();
  const fw = (framework ?? "").toLowerCase();
  if (fw.includes("next") || fw.includes("react") || lang === "typescript" || lang === "javascript") return "node-js";
  if (lang === "python" || fw.includes("django") || fw.includes("flask") || fw.includes("fastapi")) return "python";
  if (lang === "go") return "go";
  if (lang === "php") return "php";
  if (lang === "ruby") return "ruby";
  return "node-js";
}

function sanitizeAppName(name: string): string {
  return (name.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 32)) || "cloudlift-app";
}

export async function createDOApp(token: string, spec: DOAppSpec): Promise<DODeployResult> {
  try {
    const envSlug = inferEnvironmentSlug(spec.language, spec.framework);
    const appName = sanitizeAppName(spec.name);

    const body = {
      spec: {
        name: appName,
        region: spec.region ?? "nyc",
        services: [{
          name: "web",
          github: { repo: spec.repoFullName, branch: spec.branch ?? "main", deploy_on_push: true },
          environment_slug: envSlug,
          instance_size_slug: "basic-xxs",
          instance_count: 1,
          http_port: 8080,
          routes: [{ path: "/" }],
          envs: [
            { key: "NODE_ENV", value: "production", scope: "RUN_AND_BUILD_TIME" },
            { key: "PORT", value: "8080", scope: "RUN_AND_BUILD_TIME" },
          ],
        }],
      },
    };

    const res = await fetch(`${DO_API}/apps`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json() as any;
    if (!res.ok) {
      const msg = data?.message ?? data?.error ?? `DigitalOcean API error: HTTP ${res.status}`;
      logger.warn({ status: res.status, msg }, "DO App creation failed");
      return { ok: false, error: msg };
    }

    const app = data.app;
    const appId = app.id as string;
    const deployId = app.active_deployment?.id ?? app.pending_deployment?.id ?? undefined;
    const liveUrl = app.live_url ?? undefined;
    logger.info({ appId, deployId, liveUrl }, "DO App created");
    return { ok: true, appId, deployId, liveUrl };
  } catch (err: any) {
    logger.error({ err }, "DO createApp error");
    return { ok: false, error: err.message ?? "Unexpected error creating DigitalOcean app" };
  }
}

export async function getDOAppStatus(token: string, appId: string): Promise<{ ok: boolean; phase?: string; liveUrl?: string; error?: string }> {
  try {
    const res = await fetch(`${DO_API}/apps/${appId}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const data = await res.json() as any;
    const app = data.app;
    return {
      ok: true,
      phase: app.pending_deployment?.phase ?? app.active_deployment?.phase ?? "UNKNOWN",
      liveUrl: app.live_url ?? undefined,
    };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function getDODeployLogs(token: string, appId: string, deployId: string): Promise<string> {
  try {
    const res = await fetch(`${DO_API}/apps/${appId}/deployments/${deployId}/logs?type=BUILD`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return `Could not fetch logs: HTTP ${res.status}`;
    const data = await res.json() as any;
    if (data.historic_urls?.length) {
      const logRes = await fetch(data.historic_urls[0]);
      if (logRes.ok) return logRes.text();
    }
    if (data.live_url) return `Live log stream: ${data.live_url}`;
    return "No logs available yet — deployment may still be queued.";
  } catch (err: any) {
    return `Error fetching logs: ${err.message}`;
  }
}
