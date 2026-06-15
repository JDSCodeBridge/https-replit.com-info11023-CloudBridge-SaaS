import { logger } from "./logger";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM ?? "CloudLift <noreply@cloudlift.io>";
const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL ?? "team@cloudlift.io";

async function send({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!RESEND_API_KEY) {
    logger.info({ to, subject }, "[EMAIL] No RESEND_API_KEY — email logged only");
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      logger.error({ body }, "[EMAIL] Send failed");
    }
  } catch (err) {
    logger.error({ err }, "[EMAIL] Network error");
  }
}

function base(content: string) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0c12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e2e8f0;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
<table width="560" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:12px;overflow:hidden;border:1px solid #1f2937;">
<tr><td style="background:linear-gradient(135deg,#0ea5e9,#7c3aed);padding:28px 32px;">
<span style="font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.5px;">☁️ CloudLift</span>
</td></tr>
<tr><td style="padding:32px;">${content}</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #1f2937;font-size:11px;color:#6b7280;">
CloudLift · Build with AI, Launch Anywhere · <a href="mailto:support@cloudlift.io" style="color:#6b7280;">support@cloudlift.io</a>
</td></tr>
</table></td></tr></table></body></html>`;
}

function btn(href: string, text: string) {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">${text} →</a>`;
}

function h1(text: string) {
  return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f1f5f9;">${text}</h1>`;
}

function p(text: string) {
  return `<p style="margin:12px 0;font-size:15px;line-height:1.6;color:#94a3b8;">${text}</p>`;
}

function highlight(label: string, value: string) {
  return `<div style="margin:16px 0;padding:14px 16px;background:#1e293b;border-radius:8px;border-left:3px solid #0ea5e9;">
<span style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;">${label}</span>
<div style="font-size:15px;font-weight:600;color:#e2e8f0;margin-top:4px;">${value}</div>
</div>`;
}

const BASE_URL = process.env.APP_URL ?? "https://cloudlift.io";

export const Email = {
  sendWelcome(to: string, name: string) {
    const displayName = name || "there";
    send({
      to,
      subject: "Welcome to CloudLift — let's deploy your app 🚀",
      html: base(`
        ${h1(`Hey ${displayName}, welcome to CloudLift! 🎉`)}
        ${p("You're one step closer to getting your AI-built app live in the cloud.")}
        ${p("Here's how to get started in 3 easy steps:")}
        <ol style="margin:16px 0;padding-left:20px;color:#94a3b8;font-size:14px;line-height:2;">
          <li><strong style="color:#e2e8f0;">Connect GitHub</strong> — Go to Settings and paste your Personal Access Token</li>
          <li><strong style="color:#e2e8f0;">Run AI Analysis</strong> — CloudLift reads your repo and gives you a readiness score</li>
          <li><strong style="color:#e2e8f0;">Deploy or delegate</strong> — Ship it yourself or let our engineers handle it</li>
        </ol>
        ${btn(`${BASE_URL}/dashboard`, "Open your dashboard")}
      `),
    }).catch(() => {});
  },

  sendServiceRequestConfirmation(to: string, name: string, serviceType: string, turnaround: string) {
    const friendly = serviceType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    send({
      to,
      subject: `Your CloudLift service request is confirmed — ${friendly}`,
      html: base(`
        ${h1("We've got your request! ✅")}
        ${p("Our team has received your concierge service request and will begin shortly.")}
        ${highlight("Service", friendly)}
        ${highlight("Expected turnaround", turnaround)}
        ${p("You'll receive an update when your request moves to <strong style='color:#e2e8f0;'>In Progress</strong>. In the meantime, reply to this email with any extra details.")}
        ${btn(`${BASE_URL}/services`, "View your request")}
      `),
    }).catch(() => {});
  },

  sendServiceRequestAdminAlert(serviceType: string, userName: string, userEmail: string, description: string | null) {
    const friendly = serviceType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    send({
      to: ADMIN_EMAIL,
      subject: `🔔 New service request: ${friendly} from ${userName || userEmail}`,
      html: base(`
        ${h1("New concierge service request")}
        ${highlight("Service", friendly)}
        ${highlight("Customer", `${userName || "—"} &lt;${userEmail}&gt;`)}
        ${description ? highlight("Notes", description) : ""}
        ${p("Log in to the admin dashboard to review and assign this request.")}
        ${btn(`${BASE_URL}/admin`, "Open admin dashboard")}
      `),
    }).catch(() => {});
  },

  sendDeploymentUpdate(to: string, repoName: string, status: "success" | "failed", liveUrl?: string | null) {
    const isSuccess = status === "success";
    send({
      to,
      subject: isSuccess
        ? `🚀 ${repoName} is live on CloudLift!`
        : `⚠️ Deployment failed for ${repoName}`,
      html: base(`
        ${h1(isSuccess ? "Your app is live! 🎉" : "Deployment failed")}
        ${highlight("Repository", repoName)}
        ${highlight("Status", isSuccess ? "✅ Live" : "❌ Failed")}
        ${isSuccess && liveUrl ? highlight("Live URL", `<a href="${liveUrl}" style="color:#0ea5e9;">${liveUrl}</a>`) : ""}
        ${isSuccess
          ? p("Congratulations! Your app is now running in production. You can monitor it from your deployments dashboard.")
          : p("Something went wrong during deployment. Check the deployment logs for details or contact support if you need help.")}
        ${btn(`${BASE_URL}/deployments`, "View deployments")}
      `),
    }).catch(() => {});
  },
};
