import { useState } from "react";

function LandingVisual() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(135deg, #0a0e1a 0%, #0d1530 100%)" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ background: "white", borderRadius: 8, padding: "4px 10px" }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#1a2040" }}>CloudLift</span>
        </div>
        <div style={{ display: "flex", gap: 24, marginLeft: 40 }}>
          {["Features", "Pricing", "Services"].map(n => (
            <span key={n} style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{n}</span>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Sign In</span>
          <div style={{ background: "#00f0ff", borderRadius: 6, padding: "5px 14px" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0a0e1a" }}>Start Launching</span>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 32px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", marginBottom: 20 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00f0ff" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>CloudLift AI V2 is now live</span>
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 800, letterSpacing: -2, lineHeight: 1.1, marginBottom: 16, color: "white" }}>
          Build with{" "}
          <span style={{ background: "linear-gradient(90deg,#00f0ff,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI.</span>
          <br />Launch Anywhere.
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", maxWidth: 480, lineHeight: 1.6, marginBottom: 28 }}>
          Your AI-built app deserves a real production home. CloudLift analyzes your repo, fixes your config, and ships without the DevOps headache.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ background: "white", color: "#0a0e1a", padding: "10px 24px", borderRadius: 8, fontWeight: 700, fontSize: 14 }}>Deploy Your First App</div>
          <div style={{ border: "1px solid rgba(255,255,255,0.15)", padding: "10px 24px", borderRadius: 8, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>View Concierge Services</div>
        </div>
      </div>
    </div>
  );
}

function SignUpVisual() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0a0e1a 0%, #0d1530 100%)" }}>
      <div style={{ width: 380, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 32 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ background: "white", borderRadius: 8, padding: "4px 10px", display: "inline-block", marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#1a2040" }}>CloudLift</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 4 }}>Create your account</h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Free forever · No credit card required</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {["Full name", "Email address", "Password"].map(placeholder => (
            <div key={placeholder} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
              {placeholder}
            </div>
          ))}
          <div style={{ background: "linear-gradient(90deg,#00f0ff,#a78bfa)", borderRadius: 8, padding: "11px 14px", textAlign: "center", fontWeight: 700, fontSize: 14, color: "#0a0e1a", marginTop: 4 }}>
            Continue
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          </div>
          <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "9px 14px", fontSize: 13, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fill="currentColor" />
            </svg>
            Sign up with GitHub
          </div>
        </div>
      </div>
    </div>
  );
}

function ConnectRepoVisual() {
  const sideItems = [
    { icon: "⊞", label: "Dashboard", active: false },
    { icon: "⌥", label: "Repositories", active: true },
    { icon: "◈", label: "Services", active: false },
    { icon: "◎", label: "Settings", active: false },
  ];
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0a0e1a" }}>
      <div style={{ flex: 1, display: "flex" }}>
        <div style={{ width: 200, borderRight: "1px solid rgba(255,255,255,0.06)", padding: "16px 0", background: "rgba(255,255,255,0.02)" }}>
          {sideItems.map(item => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 20px",
              background: item.active ? "rgba(0,240,255,0.08)" : "transparent",
              borderLeft: item.active ? "2px solid #00f0ff" : "2px solid transparent",
            }}>
              <span style={{ fontSize: 14, color: item.active ? "#00f0ff" : "rgba(255,255,255,0.3)" }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: item.active ? "white" : "rgba(255,255,255,0.4)", fontWeight: item.active ? 600 : 400 }}>{item.label}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ color: "white", fontSize: 18, fontWeight: 700 }}>Repositories</h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 }}>Connect a GitHub repo to analyze</p>
            </div>
            <div style={{ background: "#00f0ff", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, color: "#0a0e1a" }}>
              + Connect Repository
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "2px dashed rgba(0,240,255,0.25)", borderRadius: 12, padding: 28, textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🔗</div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Connect your first repository</p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginBottom: 16 }}>Paste a GitHub URL or search your repos</p>
            <div style={{ display: "flex", gap: 8, maxWidth: 380, margin: "0 auto" }}>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 14px", fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "left" }}>
                https://github.com/username/my-ai-app
              </div>
              <div style={{ background: "#00f0ff", borderRadius: 8, padding: "9px 16px", fontWeight: 700, fontSize: 12, color: "#0a0e1a" }}>Analyze</div>
            </div>
          </div>
          <div style={{ marginTop: 16, fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
            Supports Next.js · Flask · FastAPI · Express · Streamlit · Django · and more
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisVisual() {
  const sideItems = [
    { icon: "⊞", label: "Dashboard", active: false },
    { icon: "⌥", label: "Repositories", active: false },
    { icon: "◎", label: "Analysis", active: true },
  ];
  const findings = [
    { label: "Missing .env variables", severity: "high", icon: "⚠", count: 3 },
    { label: "No Dockerfile found", severity: "medium", icon: "◑", count: 1 },
    { label: "Exposed API key in config", severity: "high", icon: "⚠", count: 1 },
    { label: "Missing health check endpoint", severity: "low", icon: "◎", count: 1 },
    { label: "Dependencies up to date", severity: "ok", icon: "✓", count: 0 },
  ];
  const r = 32;
  const pct = 0.73;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0a0e1a" }}>
      <div style={{ flex: 1, display: "flex" }}>
        <div style={{ width: 200, borderRight: "1px solid rgba(255,255,255,0.06)", padding: "16px 0", background: "rgba(255,255,255,0.02)" }}>
          {sideItems.map(item => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 20px",
              background: item.active ? "rgba(0,240,255,0.08)" : "transparent",
              borderLeft: item.active ? "2px solid #00f0ff" : "2px solid transparent",
            }}>
              <span style={{ fontSize: 14, color: item.active ? "#00f0ff" : "rgba(255,255,255,0.3)" }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: item.active ? "white" : "rgba(255,255,255,0.4)", fontWeight: item.active ? 600 : 400 }}>{item.label}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: 24, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>user/my-ai-chatbot</span>
            <div style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 99, padding: "2px 10px", fontSize: 11, color: "#34d399" }}>Analysis complete</div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flexShrink: 0, width: 140, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Readiness</div>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle cx="40" cy="40" r={r} fill="none" stroke="#00f0ff" strokeWidth="8"
                  strokeDasharray={`${circ * pct} ${circ}`}
                  strokeDashoffset={circ * 0.25}
                  strokeLinecap="round" transform="rotate(-90 40 40)" />
                <text x="40" y="45" textAnchor="middle" fill="white" fontSize="20" fontWeight="700">73</text>
              </svg>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>out of 100</div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {findings.map(item => (
                <div key={item.label} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8,
                }}>
                  <span style={{ fontSize: 13, color: item.severity === "high" ? "#f87171" : item.severity === "medium" ? "#fbbf24" : item.severity === "ok" ? "#34d399" : "#94a3b8" }}>{item.icon}</span>
                  <span style={{ fontSize: 12, color: item.severity === "ok" ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.75)", flex: 1 }}>{item.label}</span>
                  {item.count > 0 && (
                    <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 99,
                      background: item.severity === "high" ? "rgba(248,113,113,0.15)" : "rgba(251,191,36,0.15)",
                      color: item.severity === "high" ? "#f87171" : "#fbbf24" }}>{item.count} issue{item.count > 1 ? "s" : ""}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
            <div style={{ background: "#00f0ff", borderRadius: 8, padding: "9px 20px", fontWeight: 700, fontSize: 13, color: "#0a0e1a" }}>Fix &amp; Deploy →</div>
            <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "9px 20px", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Request Concierge</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeployVisual() {
  const sideItems = ["⊞ Dashboard", "⌥ Repositories", "◈ Services", "◎ Settings"];
  const envVars = [
    { key: "DATABASE_URL", value: "postgresql://...", status: "auto" },
    { key: "OPENAI_API_KEY", value: "sk-••••••••••••", status: "set" },
    { key: "PORT", value: "8080", status: "auto" },
    { key: "NODE_ENV", value: "production", status: "auto" },
  ];
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0a0e1a" }}>
      <div style={{ flex: 1, display: "flex" }}>
        <div style={{ width: 200, borderRight: "1px solid rgba(255,255,255,0.06)", padding: "16px 0", background: "rgba(255,255,255,0.02)" }}>
          {sideItems.map((item, i) => (
            <div key={item} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 20px",
              borderLeft: i === 2 ? "2px solid #00f0ff" : "2px solid transparent",
              background: i === 2 ? "rgba(0,240,255,0.08)" : "transparent",
            }}>
              <span style={{ fontSize: 13, color: i === 2 ? "white" : "rgba(255,255,255,0.4)", fontWeight: i === 2 ? 600 : 400 }}>{item}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ color: "white", fontSize: 18, fontWeight: 700 }}>Launch Wizard</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 }}>my-ai-chatbot → production</p>
          </div>
          <div style={{ display: "flex", gap: 0, marginBottom: 20 }}>
            {["Platform", "Config", "Deploy"].map((step, i) => (
              <div key={step} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 6,
                  background: i === 1 ? "rgba(0,240,255,0.1)" : "transparent",
                  border: i === 1 ? "1px solid rgba(0,240,255,0.3)" : "1px solid transparent" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%",
                    background: i <= 1 ? "#00f0ff" : "rgba(255,255,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: i <= 1 ? "#0a0e1a" : "rgba(255,255,255,0.3)" }}>{i + 1}</div>
                  <span style={{ fontSize: 12, color: i <= 1 ? "white" : "rgba(255,255,255,0.3)" }}>{step}</span>
                </div>
                {i < 2 && <div style={{ width: 20, height: 1, background: "rgba(255,255,255,0.15)" }} />}
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 14, fontWeight: 600 }}>Environment Variables</p>
            {envVars.map(env => (
              <div key={env.key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, padding: "7px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 6 }}>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "#00f0ff", width: 120, flexShrink: 0 }}>{env.key}</span>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.4)", flex: 1 }}>{env.value}</span>
                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 99,
                  background: env.status === "auto" ? "rgba(0,240,255,0.1)" : "rgba(52,211,153,0.1)",
                  color: env.status === "auto" ? "#00f0ff" : "#34d399" }}>{env.status}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
            <div style={{ background: "linear-gradient(90deg,#00f0ff,#a78bfa)", borderRadius: 8, padding: "10px 24px", fontWeight: 700, fontSize: 13, color: "#0a0e1a" }}>🚀 Deploy to AWS</div>
            <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 18px", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>← Back</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuccessVisual() {
  const stats = [
    { label: "Response time", value: "142ms", icon: "⚡" },
    { label: "Uptime", value: "100%", icon: "◉" },
    { label: "Requests today", value: "2,847", icon: "↑" },
    { label: "Cost / month", value: "$12.40", icon: "◈" },
  ];
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at center, rgba(0,240,255,0.08) 0%, #0a0e1a 70%)" }}>
      <div style={{ textAlign: "center", maxWidth: 500 }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🚀</div>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: "white", letterSpacing: -1, marginBottom: 8 }}>Your App is Live!</h2>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, marginBottom: 28 }}>my-ai-chatbot is deployed and serving traffic</p>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,240,255,0.2)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399" }} />
            <span style={{ fontSize: 12, color: "#34d399", fontWeight: 600 }}>Healthy · 0ms latency</span>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 14, color: "#00f0ff", padding: "8px 16px", background: "rgba(0,240,255,0.06)", borderRadius: 8, marginBottom: 8 }}>
            https://my-ai-chatbot.cloudlift.app
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Custom domain · SSL · CDN · Auto-scaling</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
          {stats.map(stat => (
            <div key={stat.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 2 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{stat.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <div style={{ background: "#00f0ff", borderRadius: 8, padding: "10px 24px", fontWeight: 700, fontSize: 13, color: "#0a0e1a" }}>Open Dashboard</div>
          <div style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 18px", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Share URL</div>
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  {
    id: 1,
    label: "Discover",
    title: "Build with AI. Launch Anywhere.",
    subtitle: "Your AI-built app deserves a real production home.",
    description: "CloudLift analyzes your repo, fixes your config, and ships to AWS, Azure, GCP, or DigitalOcean — without the DevOps headache.",
    visual: <LandingVisual />,
    accent: "#00f0ff",
    url: "",
  },
  {
    id: 2,
    label: "Sign Up",
    title: "Create Your Free Account",
    subtitle: "Start in 30 seconds — no credit card required",
    description: "Sign up with your email or GitHub. Your first repository analysis is completely free, forever.",
    visual: <SignUpVisual />,
    accent: "#a78bfa",
    url: "/sign-up",
  },
  {
    id: 3,
    label: "Connect Repo",
    title: "Connect Your GitHub Repository",
    subtitle: "Point CloudLift at your AI-built app",
    description: "Paste your GitHub URL or search your repositories. CloudLift works with any framework — Next.js, Flask, FastAPI, Express, Streamlit, and more.",
    visual: <ConnectRepoVisual />,
    accent: "#34d399",
    url: "/repositories",
  },
  {
    id: 4,
    label: "AI Analysis",
    title: "Instant Deployment Readiness Score",
    subtitle: "Our AI scans your entire codebase in seconds",
    description: "Get a detailed readiness score with specific, actionable fixes. CloudLift identifies missing environment variables, exposed secrets, missing Dockerfiles, and dependency issues.",
    visual: <AnalysisVisual />,
    accent: "#f59e0b",
    url: "/repositories/analysis",
  },
  {
    id: 5,
    label: "Deploy",
    title: "Launch to the Cloud",
    subtitle: "AWS, Google Cloud, Azure, or DigitalOcean",
    description: "Follow our step-by-step deployment wizard. CloudLift auto-configures your environment, sets up CI/CD, and gets your app live — or hand it to our engineers for fully managed deployment.",
    visual: <DeployVisual />,
    accent: "#f97316",
    url: "/launch",
  },
  {
    id: 6,
    label: "Live! 🚀",
    title: "Your App is Live",
    subtitle: "From repo to production in under an hour",
    description: "Your app is live, monitored, and scalable. Get your public URL, set up a custom domain, and receive post-launch health checks — all from one dashboard.",
    visual: <SuccessVisual />,
    accent: "#00f0ff",
    url: "/dashboard",
  },
];

export default function CustomerDemo() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [dir, setDir] = useState(1);

  function go(nextIdx: number) {
    if (animating || nextIdx === current) return;
    setDir(nextIdx > current ? 1 : -1);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(nextIdx);
      setAnimating(false);
    }, 280);
  }

  const step = STEPS[current];

  return (
    <div style={{
      position: "relative", width: "100vw", height: "100vh", overflow: "hidden",
      background: "#060912", fontFamily: "'Outfit', 'Inter', sans-serif", userSelect: "none",
    }}>
      {/* Top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 56, zIndex: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px",
        background: "rgba(6,9,18,0.9)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "white", borderRadius: 8, padding: "3px 9px" }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: "#1a2040" }}>CloudLift</span>
          </div>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginLeft: 4 }}>Customer Journey</span>
        </div>
        {/* Step dots */}
        <div style={{ display: "flex", gap: 6 }}>
          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              style={{
                width: i === current ? 28 : 8, height: 8, borderRadius: 99,
                background: i === current ? step.accent : i < current ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.12)",
                border: "none", cursor: "pointer", padding: 0,
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontVariantNumeric: "tabular-nums" }}>
          {current + 1} / {STEPS.length}
        </div>
      </div>

      {/* Main layout */}
      <div style={{
        position: "absolute", inset: 0, top: 56, bottom: 72,
        display: "flex", alignItems: "stretch",
      }}>
        {/* Left panel */}
        <div style={{
          width: 320, flexShrink: 0,
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "32px 36px",
          borderRight: "1px solid rgba(255,255,255,0.04)",
          background: "rgba(255,255,255,0.01)",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20,
            padding: "5px 12px", borderRadius: 99,
            border: `1px solid ${step.accent}40`,
            background: `${step.accent}12`,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: step.accent }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: step.accent, letterSpacing: 1, textTransform: "uppercase" }}>
              Step {current + 1} of {STEPS.length}
            </span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "white", lineHeight: 1.25, letterSpacing: -0.5, marginBottom: 10 }}>
            {step.title}
          </h2>
          <p style={{ fontSize: 13, fontWeight: 600, color: step.accent, marginBottom: 12 }}>
            {step.subtitle}
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>
            {step.description}
          </p>

          {/* Step list */}
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 4 }}>
            {STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "7px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: i === current ? "rgba(255,255,255,0.06)" : "transparent",
                  textAlign: "left", transition: "background 0.2s",
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700,
                  background: i < current ? "#34d399" : i === current ? step.accent : "rgba(255,255,255,0.08)",
                  color: i <= current ? "#0a0e1a" : "rgba(255,255,255,0.4)",
                  transition: "all 0.2s",
                }}>
                  {i < current ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: 12, color: i === current ? "white" : i < current ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)", fontWeight: i === current ? 600 : 400 }}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: browser preview */}
        <div style={{
          flex: 1, position: "relative", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24,
        }}>
          {/* Glow */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `radial-gradient(ellipse at 60% 50%, ${step.accent}0a 0%, transparent 65%)`,
            transition: "background 0.5s",
          }} />

          {/* Browser mockup */}
          <div style={{
            width: "100%", maxWidth: 760, borderRadius: 12,
            boxShadow: "0 0 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
            overflow: "hidden",
            transform: `translateX(${animating ? dir * 40 : 0}px)`,
            opacity: animating ? 0 : 1,
            transition: "all 0.28s cubic-bezier(0.4,0,0.2,1)",
          }}>
            {/* Browser chrome */}
            <div style={{
              background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)",
              padding: "10px 14px", display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{ display: "flex", gap: 5 }}>
                {["#f87171", "#fbbf24", "#34d399"].map(c => (
                  <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                ))}
              </div>
              <div style={{
                flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 6,
                padding: "5px 12px", fontSize: 11, color: "rgba(255,255,255,0.3)",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span>🔒</span>
                <span>cloudlift.app{step.url}</span>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>●●●</div>
            </div>
            {/* Screen content */}
            <div style={{ height: 420, overflow: "hidden" }}>
              {step.visual}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 72, zIndex: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px",
        background: "rgba(6,9,18,0.9)", backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <button
          onClick={() => go(current - 1)}
          disabled={current === 0}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 20px", borderRadius: 8,
            background: current === 0 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: current === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)",
            fontSize: 13, cursor: current === 0 ? "not-allowed" : "pointer",
          }}
        >
          ← Previous
        </button>

        {/* Progress bar */}
        <div style={{ flex: 1, margin: "0 24px", height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 99,
            width: `${((current + 1) / STEPS.length) * 100}%`,
            background: `linear-gradient(90deg, #00f0ff, ${step.accent})`,
            transition: "all 0.4s ease",
          }} />
        </div>

        {current < STEPS.length - 1 ? (
          <button
            onClick={() => go(current + 1)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 24px", borderRadius: 8,
              background: step.accent, border: "none",
              color: "#0a0e1a", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={() => go(0)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 24px", borderRadius: 8,
              background: "linear-gradient(90deg, #00f0ff, #a78bfa)", border: "none",
              color: "#0a0e1a", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >
            ↺ Restart Demo
          </button>
        )}
      </div>
    </div>
  );
}
