import { useState, useEffect } from "react";
import { useParams, useSearch, useLocation } from "wouter";
import AppLayout from "./layout";
import { useAuth } from "@clerk/react";
import { useGetRepository } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Terminal,
  Github,
  Key,
  Rocket,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
function apiUrl(path: string) {
  return `${BASE}/api${path}`;
}

const PROVIDER_INFO: Record<string, { name: string; logo: string; color: string; docsUrl: string }> = {
  aws: {
    name: "Amazon Web Services",
    logo: "☁️",
    color: "text-orange-400",
    docsUrl: "https://docs.aws.amazon.com/elasticbeanstalk",
  },
  gcp: {
    name: "Google Cloud Run",
    logo: "🔴",
    color: "text-red-400",
    docsUrl: "https://cloud.google.com/run/docs",
  },
  azure: {
    name: "Microsoft Azure",
    logo: "🔷",
    color: "text-sky-400",
    docsUrl: "https://learn.microsoft.com/azure/container-apps",
  },
};

type GuidedDeployResult = {
  deploymentId: number;
  dockerfile: string;
  workflowYaml: string;
  workflowPath: string;
  secrets: { name: string; description: string }[];
  steps: string[];
};

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-secondary/40"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : label}
    </button>
  );
}

function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div className="rounded-xl border border-border/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-secondary/20 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">{label}</span>
        </div>
        <CopyButton text={code} label="Copy" />
      </div>
      <pre className="p-4 overflow-x-auto text-xs leading-relaxed font-mono text-foreground/90 bg-[#0a0c12]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function GuidedDeploy() {
  const params = useParams<{ id: string }>();
  const repoId = parseInt(params.id ?? "0");
  const search = useSearch();
  const rawProvider = new URLSearchParams(search).get("provider") ?? "aws";
  const provider = (["aws", "gcp", "azure"].includes(rawProvider) ? rawProvider : "aws") as "aws" | "gcp" | "azure";
  const [, navigate] = useLocation();
  const { getToken } = useAuth();

  const { data: repo } = useGetRepository(repoId, { query: { enabled: !!repoId } });
  const info = PROVIDER_INFO[provider];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GuidedDeployResult | null>(null);
  const [activeTab, setActiveTab] = useState<"dockerfile" | "workflow" | "secrets">("dockerfile");

  useEffect(() => {
    if (!repoId) return;
    async function run() {
      try {
        const token = await getToken();
        const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

        const dep = await fetch(apiUrl("/deployments"), {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify({ repositoryId: repoId, provider, environment: "production" }),
        }).then(r => r.json());

        if (!dep.id) throw new Error(dep.error ?? "Failed to create deployment");

        const exec = await fetch(apiUrl(`/deployments/${dep.id}/execute`), {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader },
        }).then(r => r.json());

        if (!exec.guidedDeploy) throw new Error(exec.error ?? "Failed to generate deployment config");

        setResult({
          deploymentId: dep.id,
          ...exec.guidedDeploy,
        });
      } catch (err: any) {
        setError(err.message ?? "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [repoId, provider]);

  const tabs = [
    { id: "dockerfile" as const, label: "Dockerfile", icon: Terminal },
    { id: "workflow" as const, label: "GitHub Actions", icon: Github },
    { id: "secrets" as const, label: "GitHub Secrets", icon: Key },
  ];

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/repositories/${repoId}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
          >
            <ArrowLeft className="w-4 h-4" />
            {repo?.name ?? "Repository"}
          </Link>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/30 border border-border/40 flex items-center justify-center text-2xl shrink-0">
              {info.logo}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-1">Deploy to {info.name}</h1>
              <p className="text-muted-foreground text-sm">
                CodeBridge generates your Dockerfile and GitHub Actions pipeline — copy them into your repo and you&apos;re live.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Generating your deployment config…</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-red-400 text-sm mb-1">Generation failed</div>
              <div className="text-sm text-muted-foreground">{error}</div>
              <Button variant="outline" size="sm" className="mt-3 border-border/40" onClick={() => navigate("/launch")}>
                Back to Launch Center
              </Button>
            </div>
          </div>
        ) : result ? (
          <div className="space-y-6">
            {/* Step tracker */}
            <div className="rounded-xl border border-border/40 bg-card/20 divide-y divide-border/30">
              {(result.steps ?? []).map((step, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-4">
                  <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span className="text-sm text-muted-foreground leading-relaxed">{step}</span>
                </div>
              ))}
            </div>

            {/* Tab selector */}
            <div className="flex gap-1 p-1 rounded-lg bg-secondary/20 border border-border/30">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    activeTab === id
                      ? "bg-background text-foreground shadow-sm border border-border/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {activeTab === "dockerfile" && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Add this file as <code className="text-xs bg-secondary/40 px-1.5 py-0.5 rounded font-mono">Dockerfile</code> in the root of your repository.
                </p>
                <CodeBlock code={result.dockerfile} label="Dockerfile" />
              </div>
            )}

            {activeTab === "workflow" && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Create <code className="text-xs bg-secondary/40 px-1.5 py-0.5 rounded font-mono">{result.workflowPath}</code> in your repository. This will auto-deploy every time you push to <code className="text-xs bg-secondary/40 px-1.5 py-0.5 rounded font-mono">main</code>.
                </p>
                <CodeBlock code={result.workflowYaml} label={result.workflowPath} />
              </div>
            )}

            {activeTab === "secrets" && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Add these secrets in your GitHub repo under <strong className="text-foreground">Settings → Secrets and variables → Actions</strong>.
                </p>
                <div className="rounded-xl border border-border/40 overflow-hidden divide-y divide-border/30">
                  {result.secrets.map((s) => (
                    <div key={s.name} className="flex items-start justify-between gap-4 px-5 py-4">
                      <div className="min-w-0">
                        <div className="font-mono text-xs font-semibold text-foreground mb-1">{s.name}</div>
                        <div className="text-xs text-muted-foreground leading-relaxed">{s.description}</div>
                      </div>
                      <CopyButton text={s.name} label="Copy name" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2 border-t border-border/40">
              <Button
                className="gap-2"
                onClick={() => window.open(`https://github.com/${repo?.fullName ?? ""}/settings/secrets/actions`, "_blank")}
              >
                <Github className="w-4 h-4" />
                Open GitHub Secrets
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" className="border-border/40 gap-2" onClick={() => navigate("/deployments")}>
                <Rocket className="w-4 h-4" />
                View Deployments
              </Button>
              <a
                href={info.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                {info.name} docs <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
