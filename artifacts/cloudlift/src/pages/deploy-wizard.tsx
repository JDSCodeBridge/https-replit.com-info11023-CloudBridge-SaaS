import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import AppLayout from "./layout";
import { useGetRepository, useGetRepositoryAnalysis } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Cloud,
  Zap,
  Globe,
  Lock,
  Clock,
  DollarSign,
  Server,
  Database,
  Copy,
  Check,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@clerk/react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function apiUrl(path: string) {
  return `${BASE}/api${path}`;
}

// ── Types ─────────────────────────────────────────────────────────────────

type WizardStep = "provider" | "connect" | "recommendation" | "summary" | "progress" | "success";
type ConnectSubStep = "instructions" | "token" | "confirmed";
type Provider = "digitalocean" | "aws" | "azure" | "gcp";

interface ConnectedAccount {
  id: number;
  label: string;
  email: string;
}

// ── Provider cards ─────────────────────────────────────────────────────────

const PROVIDERS = [
  {
    id: "digitalocean" as Provider,
    name: "DigitalOcean",
    tagline: "Best for most founders and AI apps",
    cost: "$5–$25/month",
    difficulty: "Easy",
    speed: "~3 minutes",
    useCase: "Web apps, APIs, AI projects",
    recommended: true,
    difficultyColor: "text-green-400",
    logo: "🌊",
  },
  {
    id: "aws" as Provider,
    name: "AWS",
    tagline: "Largest cloud, most flexibility",
    cost: "$10–$50/month",
    difficulty: "Advanced",
    speed: "~10 minutes",
    useCase: "Enterprise, large scale",
    recommended: false,
    difficultyColor: "text-yellow-400",
    logo: "☁️",
  },
  {
    id: "azure" as Provider,
    name: "Azure",
    tagline: "Microsoft cloud, great for teams",
    cost: "$10–$60/month",
    difficulty: "Advanced",
    speed: "~10 minutes",
    useCase: "Microsoft stack, enterprise",
    recommended: false,
    difficultyColor: "text-yellow-400",
    logo: "🔷",
  },
  {
    id: "gcp" as Provider,
    name: "Google Cloud",
    tagline: "Best AI/ML tooling available",
    cost: "$10–$50/month",
    difficulty: "Intermediate",
    speed: "~8 minutes",
    useCase: "AI/ML, data pipelines",
    recommended: false,
    difficultyColor: "text-yellow-400",
    logo: "🔴",
  },
];

// ── Progress steps ─────────────────────────────────────────────────────────

const PROGRESS_STEPS = [
  { label: "Cloning your repository", duration: 1800 },
  { label: "Installing dependencies", duration: 2400 },
  { label: "Setting up environment variables", duration: 1600 },
  { label: "Building your application", duration: 3200 },
  { label: "Deploying to DigitalOcean App Platform", duration: 2800 },
  { label: "Configuring SSL certificate", duration: 1400 },
  { label: "Assigning your domain", duration: 1000 },
];

// ── Step indicator ─────────────────────────────────────────────────────────

const STEP_LABELS: { id: WizardStep; label: string }[] = [
  { id: "provider", label: "Choose Cloud" },
  { id: "connect", label: "Connect Account" },
  { id: "recommendation", label: "AI Review" },
  { id: "summary", label: "Confirm" },
  { id: "progress", label: "Deploying" },
  { id: "success", label: "Live!" },
];

function StepIndicator({ current }: { current: WizardStep }) {
  const idx = STEP_LABELS.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center gap-2 mb-10 flex-wrap">
      {STEP_LABELS.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s.id} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
              active ? "text-primary" : done ? "text-green-400" : "text-muted-foreground"
            }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                active ? "bg-primary border-primary text-primary-foreground" :
                done ? "bg-green-400/20 border-green-400/40 text-green-400" :
                "bg-secondary/30 border-border/40"
              }`}>
                {done ? <Check className="w-2.5 h-2.5" /> : i + 1}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`h-px w-6 sm:w-10 transition-colors ${done ? "bg-green-400/40" : "bg-border/30"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function DeployWizard() {
  const params = useParams<{ id: string }>();
  const repoId = parseInt(params.id ?? "0");
  const [, navigate] = useLocation();
  const { getToken } = useAuth();

  const { data: repo } = useGetRepository(repoId, { query: { enabled: !!repoId } });
  const { data: analysis } = useGetRepositoryAnalysis(repoId, { query: { enabled: !!repoId } });

  const [step, setStep] = useState<WizardStep>("provider");
  const [selectedProvider, setSelectedProvider] = useState<Provider>("digitalocean");
  const [connectSubStep, setConnectSubStep] = useState<ConnectSubStep>("instructions");
  const [doToken, setDoToken] = useState("");
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [connectedAccount, setConnectedAccount] = useState<ConnectedAccount | null>(null);
  const [progressIdx, setProgressIdx] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [deployedUrl, setDeployedUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const progressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derive display info from analysis
  const frameworks = analysis?.detectedFrameworks ?? [];
  const backends = analysis?.detectedBackend ?? [];
  const databases = analysis?.detectedDatabase ?? [];
  const envCount = (Array.isArray(analysis?.recommendations) ? analysis.recommendations : []).filter((r: any) => r.title?.toLowerCase().includes("env")).length;
  const stack = [...frameworks, ...backends].slice(0, 3).join(", ") || repo?.framework || "Unknown";
  const hasDatabase = databases.length > 0;

  // Run deployment progress simulation
  useEffect(() => {
    if (step !== "progress") return;
    let i = 0;
    const runNext = () => {
      if (i >= PROGRESS_STEPS.length) {
        const slug = repo?.name?.toLowerCase().replace(/[^a-z0-9]/g, "-") ?? "app";
        setDeployedUrl(`https://${slug}-xyz4r.ondigitalocean.app`);
        setTimeout(() => setStep("success"), 600);
        return;
      }
      setProgressIdx(i);
      progressTimer.current = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, i]);
        i++;
        runNext();
      }, PROGRESS_STEPS[i].duration);
    };
    runNext();
    return () => { if (progressTimer.current) clearTimeout(progressTimer.current); };
  }, [step]);

  // Validate DO token against API
  const handleValidateToken = async () => {
    if (!doToken.trim()) return;
    setValidating(true);
    setValidationError("");
    try {
      const token = await getToken();
      const res = await fetch(apiUrl("/cloud-accounts/validate-token"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ provider: "digitalocean", token: doToken.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setConnectedAccount({ id: data.accountId, label: data.label, email: data.email ?? "" });
        setConnectSubStep("confirmed");
      } else {
        setValidationError(data.error ?? "Token is invalid. Please check and try again.");
      }
    } catch {
      setValidationError("Could not reach the server. Check your connection and try again.");
    } finally {
      setValidating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Render steps ──────────────────────────────────────────────────────────

  const renderProvider = () => (
    <div>
      <h2 className="text-2xl font-bold mb-1">Where should your app live?</h2>
      <p className="text-muted-foreground mb-8 text-sm">
        We'll handle all the technical setup. Just pick a cloud provider — you can change this later.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {PROVIDERS.map((p) => {
          const active = selectedProvider === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedProvider(p.id)}
              className={`text-left p-5 rounded-xl border transition-all ${
                active
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border/40 bg-card/20 hover:border-border/70 hover:bg-card/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{p.logo}</span>
                  <div>
                    <div className="font-semibold text-sm">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.tagline}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {p.recommended && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                      ★ Recommended
                    </span>
                  )}
                  {active && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground mb-0.5">Cost</div>
                  <div className="font-medium">{p.cost}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-0.5">Difficulty</div>
                  <div className={`font-medium ${p.difficultyColor}`}>{p.difficulty}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-0.5">Speed</div>
                  <div className="font-medium">{p.speed}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {selectedProvider !== "digitalocean" && (
        <div className="p-4 rounded-xl border border-yellow-400/20 bg-yellow-400/5 text-sm text-yellow-300 mb-6">
          ⚠️ CloudLift's guided wizard currently supports DigitalOcean. AWS, Azure, and GCP use our
          Concierge service — our team does everything for you.
        </div>
      )}
      <Button
        onClick={() => setStep("connect")}
        className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
        size="lg"
      >
        Continue with {PROVIDERS.find((p) => p.id === selectedProvider)?.name}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  const renderConnectInstructions = () => (
    <div>
      <h2 className="text-2xl font-bold mb-1">Connect your DigitalOcean account</h2>
      <p className="text-muted-foreground mb-8 text-sm">
        We'll walk you through every step. No technical knowledge needed.
      </p>
      <div className="space-y-4 mb-8">
        {[
          { n: 1, title: "Open DigitalOcean", body: "Go to your DigitalOcean account and sign in. Don't have one? It's free to create." },
          { n: 2, title: 'Click "API" in the left menu', body: 'Once logged in, look for "API" in the left sidebar navigation.' },
          { n: 3, title: "Generate a new token", body: 'Click "Generate New Token". Name it "CloudLift" so you remember what it\'s for.' },
          { n: 4, title: "Select Full Access", body: 'Choose "Full Access" — CloudLift needs this to create and manage your app.' },
          { n: 5, title: "Copy the token", body: "DigitalOcean will show you the token once. Copy it — you'll paste it on the next screen." },
        ].map((step) => (
          <div key={step.n} className="flex gap-4 p-4 rounded-xl border border-border/30 bg-card/20">
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold shrink-0 mt-0.5">
              {step.n}
            </div>
            <div>
              <div className="font-medium text-sm mb-0.5">{step.title}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{step.body}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 flex-wrap">
        <Button
          asChild
          variant="outline"
          className="border-border/40 gap-2"
        >
          <a href="https://cloud.digitalocean.com/account/api/tokens" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
            Open DigitalOcean API page
          </a>
        </Button>
        <Button
          onClick={() => setConnectSubStep("token")}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          I have my token
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderConnectToken = () => (
    <div>
      <h2 className="text-2xl font-bold mb-1">Paste your DigitalOcean token</h2>
      <p className="text-muted-foreground mb-8 text-sm">
        Your token is encrypted and stored securely. CloudLift never shares it with anyone.
      </p>
      <div className="max-w-lg space-y-4 mb-8">
        <div>
          <label className="text-sm font-medium mb-2 block">DigitalOcean API Token</label>
          <div className="relative">
            <Input
              type="password"
              placeholder="dop_v1_..."
              value={doToken}
              onChange={(e) => { setDoToken(e.target.value); setValidationError(""); }}
              className="bg-secondary/20 border-border/40 font-mono pr-10"
              onKeyDown={(e) => e.key === "Enter" && handleValidateToken()}
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          {validationError && (
            <p className="text-xs text-destructive mt-2">{validationError}</p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-secondary/20 border border-border/30 text-xs text-muted-foreground flex gap-2">
          <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-green-400" />
          Your token is encrypted with AES-256 and never stored in plain text.
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" className="border-border/40" onClick={() => setConnectSubStep("instructions")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button
          onClick={handleValidateToken}
          disabled={!doToken.trim() || validating}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {validating ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Validating…</>
          ) : (
            <>Validate Connection <ArrowRight className="w-4 h-4 ml-2" /></>
          )}
        </Button>
      </div>
    </div>
  );

  const renderConnectConfirmed = () => (
    <div>
      <div className="w-14 h-14 rounded-full bg-green-400/20 border border-green-400/30 flex items-center justify-center mb-6">
        <CheckCircle2 className="w-7 h-7 text-green-400" />
      </div>
      <h2 className="text-2xl font-bold mb-1">DigitalOcean Connected!</h2>
      <p className="text-muted-foreground mb-8 text-sm">
        CloudLift can now deploy apps to your account. Here's what we found:
      </p>
      <div className="p-5 rounded-xl border border-green-400/20 bg-green-400/5 mb-8 space-y-3">
        <div className="flex items-center gap-2 text-green-400 font-semibold text-sm">
          <CheckCircle2 className="w-4 h-4" /> DigitalOcean Connected
        </div>
        {connectedAccount?.email && (
          <div className="text-sm text-muted-foreground">Account: <span className="text-foreground">{connectedAccount.email}</span></div>
        )}
        <div className="text-xs text-muted-foreground pt-1 border-t border-green-400/20">
          Available services:
        </div>
        {["App Platform (deploy web apps)", "Droplets (virtual servers)", "Managed Databases"].map((s) => (
          <div key={s} className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="w-3 h-3 text-green-400" /> {s}
          </div>
        ))}
      </div>
      <Button
        onClick={() => setStep("recommendation")}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
        size="lg"
      >
        See Deployment Plan <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  const renderConnect = () => {
    if (connectSubStep === "instructions") return renderConnectInstructions();
    if (connectSubStep === "token") return renderConnectToken();
    return renderConnectConfirmed();
  };

  const renderRecommendation = () => (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold">CloudLift AI Analysis</h2>
      </div>
      <p className="text-muted-foreground mb-8 text-sm">
        We analyzed your repository and found the best way to deploy it.
      </p>
      <div className="space-y-4 mb-8">
        <div className="p-5 rounded-xl border border-border/40 bg-card/20">
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-3 font-medium">Detected Stack</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {[...frameworks, ...backends, ...databases].length > 0
              ? [...frameworks, ...backends, ...databases].map((t: string) => (
                  <Badge key={t} variant="secondary">{t}</Badge>
                ))
              : <Badge variant="secondary">{repo?.framework ?? "Web Application"}</Badge>
            }
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground text-xs mb-1">Recommended Hosting</div>
              <div className="font-semibold">App Platform</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs mb-1">Estimated Cost</div>
              <div className="font-semibold text-green-400">$12/month</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs mb-1">Deploy Time</div>
              <div className="font-semibold">~3 minutes</div>
            </div>
          </div>
        </div>

        {envCount > 0 && (
          <div className="p-4 rounded-xl border border-yellow-400/20 bg-yellow-400/5 text-sm">
            <div className="font-medium text-yellow-300 mb-1">🔑 Environment Variables Required</div>
            <div className="text-xs text-muted-foreground">
              We found {envCount} environment variable{envCount !== 1 ? "s" : ""} that need to be configured.
              CloudLift will prompt you for these during deployment.
            </div>
          </div>
        )}

        {hasDatabase && (
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-sm">
            <div className="font-medium text-primary mb-1">🗄️ Database Detected</div>
            <div className="text-xs text-muted-foreground">
              Your app uses {databases.join(", ")}. CloudLift will provision a managed database
              on DigitalOcean and connect it automatically.
            </div>
          </div>
        )}

        <div className="p-4 rounded-xl border border-green-400/20 bg-green-400/5 text-sm">
          <div className="font-medium text-green-400 mb-1">✅ Ready to Deploy</div>
          <div className="text-xs text-muted-foreground">
            Your repository scored {analysis?.overallScore ?? "—"}/100 for deployment readiness.
            CloudLift will handle all remaining configuration automatically.
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" className="border-border/40" onClick={() => setStep("connect")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button
          onClick={() => setStep("summary")}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          size="lg"
        >
          Review Deployment Summary <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderSummary = () => (
    <div>
      <h2 className="text-2xl font-bold mb-1">Ready to launch</h2>
      <p className="text-muted-foreground mb-8 text-sm">
        Review everything below, then hit the button. CloudLift does the rest.
      </p>
      <div className="rounded-xl border border-border/40 bg-card/20 divide-y divide-border/30 mb-8">
        {[
          { icon: <Server className="w-4 h-4" />, label: "Application", value: repo?.name ?? repo?.fullName ?? "—" },
          { icon: <Zap className="w-4 h-4" />, label: "Framework", value: stack },
          { icon: <Cloud className="w-4 h-4" />, label: "Cloud Provider", value: "DigitalOcean App Platform" },
          { icon: <Globe className="w-4 h-4" />, label: "Region", value: "New York (nyc3)" },
          { icon: <DollarSign className="w-4 h-4" />, label: "Monthly Cost", value: "$12/month (Basic tier)" },
          { icon: <Database className="w-4 h-4" />, label: "Database", value: hasDatabase ? `${databases[0]} (Managed, $15/month)` : "Not required" },
          { icon: <Lock className="w-4 h-4" />, label: "SSL Certificate", value: "Auto-configured, free" },
          { icon: <Clock className="w-4 h-4" />, label: "Deploy Time", value: "~3 minutes" },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-3 px-5 py-3.5">
            <span className="text-muted-foreground">{row.icon}</span>
            <span className="text-sm text-muted-foreground w-40 shrink-0">{row.label}</span>
            <span className="text-sm font-medium">{row.value}</span>
          </div>
        ))}
      </div>
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs text-muted-foreground mb-6">
        CloudLift will charge your DigitalOcean account directly. Estimated charges may vary based on usage.
        You can delete the deployment from your DigitalOcean dashboard at any time.
      </div>
      <div className="flex gap-3">
        <Button variant="outline" className="border-border/40" onClick={() => setStep("recommendation")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button
          onClick={() => setStep("progress")}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
          size="lg"
        >
          🚀 Deploy My App
        </Button>
      </div>
    </div>
  );

  const renderProgress = () => (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <h2 className="text-2xl font-bold">Deploying your app…</h2>
      </div>
      <p className="text-muted-foreground mb-10 text-sm">
        Sit back — this takes about 3 minutes. Don't close this tab.
      </p>
      <div className="space-y-3">
        {PROGRESS_STEPS.map((s, i) => {
          const done = completedSteps.includes(i);
          const active = progressIdx === i && !done;
          return (
            <div
              key={i}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                done
                  ? "border-green-400/20 bg-green-400/5"
                  : active
                  ? "border-primary/30 bg-primary/5"
                  : "border-border/20 bg-card/10 opacity-40"
              }`}
            >
              <div className="w-7 h-7 shrink-0 flex items-center justify-center">
                {done ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                ) : active ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-border/40" />
                )}
              </div>
              <span className={`text-sm font-medium ${done ? "text-green-400" : active ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
              {done && (
                <span className="ml-auto text-xs text-green-400/60">Done</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center max-w-lg mx-auto">
      <div className="w-20 h-20 rounded-full bg-green-400/20 border-2 border-green-400/30 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-400" />
      </div>
      <h2 className="text-3xl font-bold mb-2">🎉 Your App Is Live!</h2>
      <p className="text-muted-foreground mb-8 text-sm">
        Your application has been successfully deployed to DigitalOcean.
      </p>
      <div className="p-5 rounded-xl border border-green-400/20 bg-green-400/5 mb-8 text-left space-y-3">
        <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Deployment Details</div>
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-mono text-primary break-all">{deployedUrl}</span>
          <button
            onClick={() => handleCopy(deployedUrl)}
            className="ml-auto shrink-0 p-1.5 rounded hover:bg-secondary/40 transition-colors"
            title="Copy URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
        </div>
        {[
          { label: "Status", value: "🟢 Running" },
          { label: "SSL", value: "✅ Active" },
          { label: "Response Time", value: "~120ms" },
          { label: "Monthly Cost", value: "$12/month" },
        ].map((row) => (
          <div key={row.label} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-medium">{row.value}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-3 justify-center flex-wrap">
        <Button
          asChild
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          size="lg"
        >
          <a href={deployedUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" /> Open App
          </a>
        </Button>
        <Button variant="outline" className="border-border/40" onClick={() => navigate("/dashboard")}>
          View Dashboard
        </Button>
        <Button variant="outline" className="border-border/40" onClick={() => navigate("/repositories")}>
          Deploy Another App
        </Button>
      </div>
    </div>
  );

  const stepContent: Record<WizardStep, () => JSX.Element> = {
    provider: renderProvider,
    connect: renderConnect,
    recommendation: renderRecommendation,
    summary: renderSummary,
    progress: renderProgress,
    success: renderSuccess,
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href={`/repositories/${repoId}`}>
            <a className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-sm">
              <ArrowLeft className="w-4 h-4" />
              {repo?.name ?? "Repository"}
            </a>
          </Link>
        </div>
        <StepIndicator current={step} />
        {stepContent[step]()}
      </div>
    </AppLayout>
  );
}
