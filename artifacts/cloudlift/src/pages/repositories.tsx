import AppLayout from "./layout";
import {
  useListRepositories,
  useConnectRepository,
  useDeleteRepository,
  getListRepositoriesQueryKey,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { useToast } from "@/hooks/use-toast";
import {
  GitBranch, Plus, ArrowRight, Trash2, Zap,
  Lock, Unlock, Github, Search, RefreshCw, AlertCircle,
  CheckCircle2, Loader2, ChevronRight, Upload, FileArchive,
} from "lucide-react";
import { useState, useRef } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
function apiUrl(path: string) { return `${BASE}/api${path}`; }

const statusStyle: Record<string, string> = {
  not_deployed: "border-border/40 text-muted-foreground",
  deploying: "text-yellow-400 border-yellow-400/30",
  deployed: "text-green-400 border-green-400/30",
  failed: "text-destructive border-destructive/30",
};

type GithubRepo = {
  id: number; name: string; fullName: string; githubUrl: string;
  description: string | null; isPrivate: boolean; language: string | null;
  defaultBranch: string; pushedAt: string | null; stars: number;
};

type ReplitPreview = {
  username: string; slug: string; title: string;
  description: string; language: string | null; isPrivate: boolean;
};

type ImportStep = "idle" | "fetching" | "creating" | "pushing" | "connecting" | "done";
type Mode = "github" | "manual" | "replit" | "claude";

const IMPORT_STEPS: { key: ImportStep; label: string }[] = [
  { key: "fetching", label: "Reading project files" },
  { key: "creating", label: "Creating GitHub repository" },
  { key: "pushing", label: "Pushing code to GitHub" },
  { key: "connecting", label: "Connecting to CodeBridge" },
];

function useGithubStatus() {
  return useQuery<{ connected: boolean; username: string | null }>({
    queryKey: ["/api/github/status"],
    queryFn: () => fetch(apiUrl("/github/status")).then(r => r.json()),
  });
}

function useGithubRepos(enabled: boolean) {
  return useQuery<GithubRepo[]>({
    queryKey: ["/api/github/repos"],
    queryFn: () => fetch(apiUrl("/github/repos")).then(async r => {
      const data = await r.json();
      if (!r.ok) throw new Error((data as any).error ?? "Failed to load repos");
      return data;
    }),
    enabled,
    staleTime: 60_000,
  });
}

function ReplitIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M2 5.5A3.5 3.5 0 0 1 5.5 2H11a.5.5 0 0 1 0 1H5.5A2.5 2.5 0 0 0 3 5.5v5A2.5 2.5 0 0 0 5.5 13H11a.5.5 0 0 1 0 1H5.5A3.5 3.5 0 0 1 2 10.5v-5ZM13 12.5a.5.5 0 0 1 .5-.5h5a3.5 3.5 0 0 1 3.5 3.5v2a3.5 3.5 0 0 1-3.5 3.5h-5a.5.5 0 0 1 0-1h5a2.5 2.5 0 0 0 2.5-2.5v-2a2.5 2.5 0 0 0-2.5-2.5h-5a.5.5 0 0 1-.5-.5ZM2 15.5A3.5 3.5 0 0 1 5.5 12H11a.5.5 0 0 1 0 1H5.5A2.5 2.5 0 0 0 3 15.5v3A2.5 2.5 0 0 0 5.5 21H11a.5.5 0 0 1 0 1H5.5A3.5 3.5 0 0 1 2 18.5v-3Z" />
    </svg>
  );
}

function ClaudeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
    </svg>
  );
}

export default function Repositories() {
  const { data: repos, isLoading } = useListRepositories();
  const connectMutation = useConnectRepository();
  const deleteMutation = useDeleteRepository();
  const qc = useQueryClient();
  const { getToken } = useAuth();
  const { toast } = useToast();

  const { data: githubStatus } = useGithubStatus();
  const isGithubConnected = githubStatus?.connected ?? false;

  const [adding, setAdding] = useState(false);
  const [mode, setMode] = useState<Mode>("github");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", fullName: "", githubUrl: "", isPrivate: false, description: "" });
  const [limitError, setLimitError] = useState<string | null>(null);

  const [replitUrl, setReplitUrl] = useState("");
  const [replitPreview, setReplitPreview] = useState<ReplitPreview | null>(null);
  const [replitRepoName, setReplitRepoName] = useState("");

  const [zipFile, setZipFile] = useState<File | null>(null);
  const [claudeRepoName, setClaudeRepoName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importStep, setImportStep] = useState<ImportStep>("idle");
  const [importResult, setImportResult] = useState<{ repositoryId: number; fullName: string; filesImported: number } | null>(null);

  const { data: githubRepos, isLoading: loadingGithub, error: githubError, refetch: refetchGithub } = useGithubRepos(adding && isGithubConnected && mode === "github");
  const filteredGithubRepos = (Array.isArray(githubRepos) ? githubRepos : []).filter(r =>
    !search || r.fullName.toLowerCase().includes(search.toLowerCase()) || (r.description ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const connectedFullNames = new Set((repos ?? []).map(r => r.fullName));

  const resetImport = () => {
    setReplitUrl(""); setReplitPreview(null); setReplitRepoName("");
    setZipFile(null); setClaudeRepoName(""); setIsDragOver(false);
    setImportStep("idle"); setImportResult(null);
  };

  const handleConnectFromGithub = (repo: GithubRepo) => {
    setLimitError(null);
    connectMutation.mutate(
      { data: { name: repo.name, fullName: repo.fullName, githubUrl: repo.githubUrl, isPrivate: repo.isPrivate, description: repo.description ?? "" } },
      {
        onSuccess: () => { qc.invalidateQueries({ queryKey: getListRepositoriesQueryKey() }); setAdding(false); setSearch(""); },
        onError: (err: any) => {
          const msg = err?.response?.data?.message ?? err?.message ?? "Failed to connect";
          if (msg.includes("limit") || msg.includes("upgrade")) setLimitError(msg);
        },
      }
    );
  };

  const handleConnectManual = () => {
    if (!form.fullName) return;
    setLimitError(null);
    connectMutation.mutate(
      { data: form },
      {
        onSuccess: () => { qc.invalidateQueries({ queryKey: getListRepositoriesQueryKey() }); setAdding(false); setForm({ name: "", fullName: "", githubUrl: "", isPrivate: false, description: "" }); },
        onError: (err: any) => {
          const msg = err?.response?.data?.message ?? err?.message ?? "Failed to connect";
          if (msg.includes("limit") || msg.includes("upgrade")) setLimitError(msg);
        },
      }
    );
  };

  const previewMutation = useMutation({
    mutationFn: async (url: string) => {
      const token = await getToken();
      const res = await fetch(apiUrl("/replit/preview"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ replitUrl: url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Preview failed");
      return data as ReplitPreview;
    },
    onSuccess: (data) => {
      setReplitPreview(data);
      setReplitRepoName(data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
    },
    onError: (err: any) => { toast({ title: err.message ?? "Could not fetch Replit project", variant: "destructive" }); },
  });

  const replitImportMutation = useMutation({
    mutationFn: async () => {
      if (!replitPreview) throw new Error("No preview data");
      const token = await getToken();
      setImportStep("fetching");
      await new Promise(r => setTimeout(r, 500));
      setImportStep("creating");
      const res = await fetch(apiUrl("/replit/import"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ username: replitPreview.username, slug: replitPreview.slug, title: replitPreview.title, description: replitPreview.description, language: replitPreview.language, repoName: replitRepoName, isPrivate: false }),
      });
      setImportStep("pushing");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setImportStep("connecting");
      await new Promise(r => setTimeout(r, 400));
      setImportStep("done");
      return data as { repositoryId: number; fullName: string; filesImported: number };
    },
    onSuccess: (data) => { setImportResult(data); qc.invalidateQueries({ queryKey: getListRepositoriesQueryKey() }); },
    onError: (err: any) => { setImportStep("idle"); toast({ title: err.message ?? "Import failed", variant: "destructive" }); },
  });

  const claudeImportMutation = useMutation({
    mutationFn: async () => {
      if (!zipFile) throw new Error("No ZIP file selected");
      const token = await getToken();
      setImportStep("fetching");
      await new Promise(r => setTimeout(r, 300));
      setImportStep("creating");
      const formData = new FormData();
      formData.append("zipFile", zipFile);
      formData.append("repoName", claudeRepoName);
      formData.append("description", "Imported from Claude Code via CodeBridge");
      formData.append("source", "claude");
      const res = await fetch(apiUrl("/import/zip"), {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      setImportStep("pushing");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setImportStep("connecting");
      await new Promise(r => setTimeout(r, 400));
      setImportStep("done");
      return data as { repositoryId: number; fullName: string; filesImported: number };
    },
    onSuccess: (data) => { setImportResult(data); qc.invalidateQueries({ queryKey: getListRepositoriesQueryKey() }); },
    onError: (err: any) => { setImportStep("idle"); toast({ title: err.message ?? "Import failed", variant: "destructive" }); },
  });

  const handleZipFile = (file: File) => {
    if (!file.name.endsWith(".zip")) {
      toast({ title: "Please select a ZIP file", variant: "destructive" }); return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "File too large (max 50 MB)", variant: "destructive" }); return;
    }
    setZipFile(file);
    setClaudeRepoName(file.name.replace(/\.zip$/i, "").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""));
  };

  const stepIndex = IMPORT_STEPS.findIndex(s => s.key === importStep);
  const isImporting = importStep !== "idle" && importStep !== "done";

  const ImportProgress = ({ onAnalyze }: { onAnalyze: () => void }) => (
    importStep === "done" && importResult ? (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          <div>
            <div className="text-sm font-medium text-green-400">Import successful!</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {importResult.filesImported > 0 ? `${importResult.filesImported} files pushed to ` : "Repository created at "}
              <a href={`https://github.com/${importResult.fullName}`} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
                {importResult.fullName}
              </a>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" className="bg-primary text-primary-foreground gap-1.5">
            <Link href={`/repositories/${importResult.repositoryId}`}><Zap className="w-3.5 h-3.5" /> Run AI Analysis</Link>
          </Button>
          <Button size="sm" variant="outline" className="border-border/40" onClick={() => { resetImport(); setAdding(false); }}>Done</Button>
        </div>
      </div>
    ) : isImporting ? (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">Importing your project…</p>
        <div className="space-y-2">
          {IMPORT_STEPS.map((step, i) => {
            const current = i === stepIndex;
            const done = i < stepIndex;
            return (
              <div key={step.key} className={`flex items-center gap-3 text-sm transition-colors ${done ? "text-green-400" : current ? "text-foreground" : "text-muted-foreground/40"}`}>
                {done ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                  : current ? <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                  : <div className="w-4 h-4 shrink-0 rounded-full border border-border/40" />}
                {step.label}
              </div>
            );
          })}
        </div>
      </div>
    ) : null
  );

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListRepositoriesQueryKey() }) });
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">Repositories</h1>
            <p className="text-muted-foreground text-sm">Connect your GitHub repositories for AI-powered deployment analysis.</p>
          </div>
          <Button
            onClick={() => { setAdding(!adding); setLimitError(null); if (adding) resetImport(); }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <Plus className="w-4 h-4" /> Connect Repo
          </Button>
        </div>

        {limitError && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
            <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-300">
              {limitError}{" "}
              <a href="/pricing" className="underline underline-offset-2 text-primary">Upgrade to Pro</a>
            </div>
          </div>
        )}

        {adding && (
          <Card className="border-primary/20 bg-primary/5 p-5 mb-6">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <h3 className="text-sm font-semibold mr-1">Add Repository</h3>
              <div className="flex rounded-md border border-border/40 overflow-hidden text-xs">
                {([
                  { key: "github" as Mode, icon: <Github className="w-3 h-3" />, label: "GitHub" },
                  { key: "replit" as Mode, icon: <ReplitIcon className="w-3 h-3" />, label: "Replit", badge: "NEW" },
                  { key: "claude" as Mode, icon: <ClaudeIcon className="w-3 h-3" />, label: "Claude Code", badge: "NEW" },
                  { key: "manual" as Mode, label: "Manual" },
                ]).map(tab => (
                  <button
                    key={tab.key}
                    className={`px-3 py-1.5 transition-colors flex items-center gap-1 whitespace-nowrap ${mode === tab.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => { setMode(tab.key); resetImport(); }}
                  >
                    {tab.icon}
                    {tab.label}
                    {tab.badge && <span className="ml-0.5 text-[9px] bg-accent/20 text-accent px-1 py-0.5 rounded font-semibold">{tab.badge}</span>}
                  </button>
                ))}
              </div>
            </div>

            {mode === "claude" && (
              <div className="space-y-4">
                {(importStep !== "idle") ? (
                  <ImportProgress onAnalyze={() => {}} />
                ) : (
                  <>
                    <div className="text-xs text-muted-foreground mb-2">
                      Zip your Claude Code project folder and upload it. CodeBridge creates a GitHub repo and pushes the files automatically.
                    </div>

                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-border/40 hover:border-border/60"}`}
                      onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={e => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleZipFile(f); }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".zip"
                        className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleZipFile(f); }}
                      />
                      {zipFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileArchive className="w-5 h-5 text-primary" />
                          <div className="text-left">
                            <div className="text-sm font-medium">{zipFile.name}</div>
                            <div className="text-xs text-muted-foreground">{(zipFile.size / 1024 / 1024).toFixed(1)} MB</div>
                          </div>
                          <button
                            className="ml-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={e => { e.stopPropagation(); setZipFile(null); setClaudeRepoName(""); }}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Drop your Claude Code project ZIP here</p>
                          <p className="text-xs text-muted-foreground mt-1">or click to browse · max 50 MB</p>
                        </>
                      )}
                    </div>

                    {zipFile && (
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">GitHub repository name</label>
                        <input
                          className="w-full text-sm bg-secondary/30 border border-border/40 rounded-md px-3 py-2 outline-none focus:border-primary/50 transition-colors"
                          value={claudeRepoName}
                          onChange={e => setClaudeRepoName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                          placeholder="my-claude-project"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Will be created at github.com/{githubStatus?.username ?? "you"}/{claudeRepoName || "…"}
                        </p>
                      </div>
                    )}

                    {!isGithubConnected && (
                      <div className="flex items-start gap-2 p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-xs text-yellow-300">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        GitHub not connected. <Link href="/settings" className="underline ml-1">Add your PAT in Settings</Link>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground gap-1.5"
                        onClick={() => claudeImportMutation.mutate()}
                        disabled={!zipFile || !claudeRepoName || !isGithubConnected || claudeImportMutation.isPending}
                      >
                        <ChevronRight className="w-3.5 h-3.5" /> Import to CodeBridge
                      </Button>
                      <Button size="sm" variant="ghost" className="text-xs" onClick={() => setAdding(false)}>Cancel</Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {mode === "replit" && (
              <div className="space-y-4">
                {(importStep !== "idle") ? (
                  <ImportProgress onAnalyze={() => {}} />
                ) : replitPreview ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg border border-border/30 bg-secondary/10">
                      <ReplitIcon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{replitPreview.title}</div>
                        {replitPreview.description && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{replitPreview.description}</div>}
                        <div className="flex items-center gap-2 mt-1">
                          {replitPreview.language && <Badge variant="secondary" className="text-[10px]">{replitPreview.language}</Badge>}
                          <span className="text-[10px] text-muted-foreground">by {replitPreview.username}</span>
                          {replitPreview.isPrivate && <Lock className="w-3 h-3 text-muted-foreground" />}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">GitHub repository name</label>
                      <input
                        className="w-full text-sm bg-secondary/30 border border-border/40 rounded-md px-3 py-2 outline-none focus:border-primary/50 transition-colors"
                        value={replitRepoName}
                        onChange={e => setReplitRepoName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                        placeholder="my-project"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Will be created at github.com/{githubStatus?.username ?? "you"}/{replitRepoName || "…"}
                      </p>
                    </div>
                    {!isGithubConnected && (
                      <div className="flex items-start gap-2 p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-xs text-yellow-300">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        GitHub not connected. <Link href="/settings" className="underline ml-1">Add your PAT in Settings</Link>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-primary text-primary-foreground gap-1.5" onClick={() => replitImportMutation.mutate()} disabled={!replitRepoName || !isGithubConnected || replitImportMutation.isPending}>
                        <ChevronRight className="w-3.5 h-3.5" /> Import to CodeBridge
                      </Button>
                      <Button size="sm" variant="ghost" className="text-xs" onClick={resetImport}>Back</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Replit project URL</label>
                      <input
                        className="w-full text-sm bg-secondary/30 border border-border/40 rounded-md px-3 py-2 outline-none focus:border-primary/50 transition-colors"
                        placeholder="https://replit.com/@username/project-name"
                        value={replitUrl}
                        onChange={e => setReplitUrl(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && replitUrl) previewMutation.mutate(replitUrl); }}
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">Must be a public Replit project for automatic file import.</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-primary text-primary-foreground gap-1.5" onClick={() => previewMutation.mutate(replitUrl)} disabled={!replitUrl || previewMutation.isPending}>
                        {previewMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        {previewMutation.isPending ? "Fetching…" : "Preview Project"}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-xs" onClick={() => setAdding(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {mode === "github" && (
              isGithubConnected ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      className="w-full text-sm bg-secondary/30 border border-border/40 rounded-md pl-9 pr-8 py-2 outline-none focus:border-primary/50 transition-colors"
                      placeholder="Search repositories..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => refetchGithub()}>
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {loadingGithub ? (
                    <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-secondary/20 animate-pulse" />)}</div>
                  ) : githubError ? (
                    <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-lg">{(githubError as Error).message}</div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
                      {filteredGithubRepos.length === 0 && <div className="text-center text-sm text-muted-foreground py-6">{search ? "No repos match your search." : "No repositories found on GitHub."}</div>}
                      {filteredGithubRepos.map(r => {
                        const alreadyConnected = connectedFullNames.has(r.fullName);
                        return (
                          <div key={r.id} className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${alreadyConnected ? "border-primary/20 bg-primary/5" : "border-border/30 bg-secondary/10 hover:border-primary/30 hover:bg-secondary/20"} transition-colors`}>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                {r.isPrivate ? <Lock className="w-3 h-3 text-muted-foreground shrink-0" /> : <Unlock className="w-3 h-3 text-muted-foreground shrink-0" />}
                                <span className="text-sm font-medium truncate">{r.fullName}</span>
                                {r.language && <span className="text-[10px] text-muted-foreground shrink-0">{r.language}</span>}
                              </div>
                              {r.description && <p className="text-xs text-muted-foreground truncate mt-0.5 pl-5">{r.description}</p>}
                            </div>
                            <div className="ml-3 shrink-0">
                              {alreadyConnected ? <Badge variant="outline" className="text-[10px] text-primary border-primary/30">Connected</Badge>
                                : <Button size="sm" className="h-7 text-xs px-3 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => handleConnectFromGithub(r)} disabled={connectMutation.isPending}>Connect</Button>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="pt-2 border-t border-border/20 flex justify-end">
                    <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="text-xs">Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <Github className="w-10 h-10 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-sm font-medium">GitHub not connected</p>
                    <p className="text-xs text-muted-foreground mt-1">Go to Settings to add your GitHub Personal Access Token.</p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" variant="outline" className="border-border/40 text-xs" asChild><Link href="/settings">Go to Settings</Link></Button>
                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => setMode("manual")}>Add manually instead</Button>
                  </div>
                </div>
              )
            )}

            {mode === "manual" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Repository Name</label>
                    <input
                      className="w-full text-sm bg-secondary/30 border border-border/40 rounded-md px-3 py-2 outline-none focus:border-primary/50"
                      placeholder="my-app"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value, fullName: f.fullName || `user/${e.target.value}` }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Full Name (owner/repo)</label>
                    <input
                      className="w-full text-sm bg-secondary/30 border border-border/40 rounded-md px-3 py-2 outline-none focus:border-primary/50"
                      placeholder="username/my-app"
                      value={form.fullName}
                      onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">GitHub URL</label>
                  <input
                    className="w-full text-sm bg-secondary/30 border border-border/40 rounded-md px-3 py-2 outline-none focus:border-primary/50"
                    placeholder="https://github.com/username/my-app"
                    value={form.githubUrl}
                    onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-primary text-primary-foreground" onClick={handleConnectManual} disabled={connectMutation.isPending || !form.fullName}>
                    {connectMutation.isPending ? "Connecting..." : "Connect"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </Card>
        )}

        <Card className="border-border/40 bg-card/20">
          {isLoading ? (
            <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-secondary/30 animate-pulse" />)}</div>
          ) : (Array.isArray(repos) ? repos : []).length === 0 ? (
            <div className="p-12 text-center">
              <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No repositories yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">Connect a GitHub repo or import directly from Replit or Claude Code.</p>
              <div className="flex gap-2 justify-center flex-wrap">
                <Button onClick={() => { setAdding(true); setMode("github"); }} className="bg-primary text-primary-foreground gap-2"><Github className="w-4 h-4" /> From GitHub</Button>
                <Button onClick={() => { setAdding(true); setMode("replit"); }} variant="outline" className="border-border/40 gap-2"><ReplitIcon className="w-4 h-4" /> From Replit</Button>
                <Button onClick={() => { setAdding(true); setMode("claude"); }} variant="outline" className="border-border/40 gap-2"><ClaudeIcon className="w-4 h-4" /> Claude Code</Button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {(Array.isArray(repos) ? repos : []).map((repo) => (
                <div key={repo.id} className="flex items-center justify-between p-4 hover:bg-secondary/10 transition-colors group">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {repo.isPrivate ? <Lock className="w-4 h-4 text-muted-foreground" /> : <Unlock className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-medium text-sm">{repo.fullName}</span>
                        {repo.framework && <Badge variant="secondary" className="text-[10px]">{repo.framework}</Badge>}
                      </div>
                      {repo.description && <p className="text-xs text-muted-foreground truncate max-w-sm">{repo.description}</p>}
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="outline" className={`text-[10px] ${statusStyle[repo.deploymentStatus] ?? ""}`}>{repo.deploymentStatus.replace("_", " ")}</Badge>
                        {repo.readinessScore != null && (
                          <span className={`text-[10px] font-semibold tabular-nums ${repo.readinessScore >= 80 ? "text-primary" : repo.readinessScore >= 60 ? "text-yellow-400" : "text-destructive"}`}>
                            Score: {repo.readinessScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <Button variant="ghost" size="sm" asChild className="text-xs gap-1.5 text-muted-foreground hover:text-primary">
                      <Link href={`/repositories/${repo.id}`}><Zap className="w-3.5 h-3.5" /> Analyze</Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="text-xs gap-1.5">
                      <Link href={`/repositories/${repo.id}`}>Details <ArrowRight className="w-3.5 h-3.5" /></Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(repo.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
