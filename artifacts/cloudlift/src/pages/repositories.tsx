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
import { useQueryClient, useQuery } from "@tanstack/react-query";
import {
  GitBranch, Plus, ArrowRight, Trash2, Zap,
  Lock, Unlock, Github, Search, RefreshCw, AlertCircle,
} from "lucide-react";
import { useState } from "react";

const statusStyle: Record<string, string> = {
  not_deployed: "border-border/40 text-muted-foreground",
  deploying: "text-yellow-400 border-yellow-400/30",
  deployed: "text-green-400 border-green-400/30",
  failed: "text-destructive border-destructive/30",
};

type GithubRepo = {
  id: number;
  name: string;
  fullName: string;
  githubUrl: string;
  description: string | null;
  isPrivate: boolean;
  language: string | null;
  defaultBranch: string;
  pushedAt: string | null;
  stars: number;
};

function useGithubStatus() {
  return useQuery<{ connected: boolean; username: string | null }>({
    queryKey: ["/api/github/status"],
    queryFn: () => fetch("/api/github/status").then(r => r.json()),
  });
}

function useGithubRepos(enabled: boolean) {
  return useQuery<GithubRepo[]>({
    queryKey: ["/api/github/repos"],
    queryFn: () => fetch("/api/github/repos").then(async r => {
      const data = await r.json();
      if (!r.ok) throw new Error((data as any).error ?? "Failed to load repos");
      return data;
    }),
    enabled,
    staleTime: 60_000,
  });
}

export default function Repositories() {
  const { data: repos, isLoading } = useListRepositories();
  const connectMutation = useConnectRepository();
  const deleteMutation = useDeleteRepository();
  const qc = useQueryClient();

  const { data: githubStatus } = useGithubStatus();
  const isGithubConnected = githubStatus?.connected ?? false;

  const [adding, setAdding] = useState(false);
  const [mode, setMode] = useState<"github" | "manual">("github");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", fullName: "", githubUrl: "", isPrivate: false, description: "" });
  const [limitError, setLimitError] = useState<string | null>(null);

  const { data: githubRepos, isLoading: loadingGithub, error: githubError, refetch: refetchGithub } = useGithubRepos(adding && isGithubConnected && mode === "github");

  const filteredGithubRepos = (Array.isArray(githubRepos) ? githubRepos : []).filter(r =>
    !search || r.fullName.toLowerCase().includes(search.toLowerCase()) || (r.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const connectedFullNames = new Set((repos ?? []).map(r => r.fullName));

  const handleConnectFromGithub = (repo: GithubRepo) => {
    setLimitError(null);
    connectMutation.mutate(
      {
        data: {
          name: repo.name,
          fullName: repo.fullName,
          githubUrl: repo.githubUrl,
          isPrivate: repo.isPrivate,
          description: repo.description ?? "",
        },
      },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListRepositoriesQueryKey() });
          setAdding(false);
          setSearch("");
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message ?? err?.message ?? "Failed to connect";
          if (msg.includes("limit") || msg.includes("upgrade")) {
            setLimitError(msg);
          }
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
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListRepositoriesQueryKey() });
          setAdding(false);
          setForm({ name: "", fullName: "", githubUrl: "", isPrivate: false, description: "" });
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message ?? err?.message ?? "Failed to connect";
          if (msg.includes("limit") || msg.includes("upgrade")) setLimitError(msg);
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => qc.invalidateQueries({ queryKey: getListRepositoriesQueryKey() }),
    });
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
            onClick={() => { setAdding(!adding); setLimitError(null); }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <Plus className="w-4 h-4" />
            Connect Repo
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
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-sm font-semibold">Add Repository</h3>
              <div className="flex rounded-md border border-border/40 overflow-hidden text-xs">
                <button
                  className={`px-3 py-1 transition-colors ${mode === "github" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setMode("github")}
                >
                  <Github className="w-3 h-3 inline mr-1" />From GitHub
                </button>
                <button
                  className={`px-3 py-1 transition-colors ${mode === "manual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setMode("manual")}
                >
                  Manual
                </button>
              </div>
            </div>

            {mode === "github" ? (
              isGithubConnected ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      className="w-full text-sm bg-secondary/30 border border-border/40 rounded-md pl-9 pr-3 py-2 outline-none focus:border-primary/50 transition-colors"
                      placeholder="Search repositories..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => refetchGithub()}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {loadingGithub ? (
                    <div className="space-y-2">
                      {[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-secondary/20 animate-pulse" />)}
                    </div>
                  ) : githubError ? (
                    <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-lg">
                      {(githubError as Error).message}
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
                      {filteredGithubRepos.length === 0 && (
                        <div className="text-center text-sm text-muted-foreground py-6">
                          {search ? "No repos match your search." : "No repositories found on GitHub."}
                        </div>
                      )}
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
                              {alreadyConnected ? (
                                <Badge variant="outline" className="text-[10px] text-primary border-primary/30">Connected</Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  className="h-7 text-xs px-3 bg-primary text-primary-foreground hover:bg-primary/90"
                                  onClick={() => handleConnectFromGithub(r)}
                                  disabled={connectMutation.isPending}
                                >
                                  Connect
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <Github className="w-10 h-10 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-sm font-medium">GitHub not connected</p>
                    <p className="text-xs text-muted-foreground mt-1">Go to Settings to add your GitHub Personal Access Token.</p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" variant="outline" className="border-border/40 text-xs" asChild>
                      <Link href="/settings">Go to Settings</Link>
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => setMode("manual")}>
                      Add manually instead
                    </Button>
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Repository Name</label>
                    <input
                      className="w-full text-sm bg-secondary/30 border border-border/40 rounded-md px-3 py-2 outline-none focus:border-primary/50 transition-colors"
                      placeholder="my-app"
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value, fullName: f.fullName || `user/${e.target.value}` }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Full Name (owner/repo)</label>
                    <input
                      className="w-full text-sm bg-secondary/30 border border-border/40 rounded-md px-3 py-2 outline-none focus:border-primary/50 transition-colors"
                      placeholder="username/my-app"
                      value={form.fullName}
                      onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">GitHub URL</label>
                  <input
                    className="w-full text-sm bg-secondary/30 border border-border/40 rounded-md px-3 py-2 outline-none focus:border-primary/50 transition-colors"
                    placeholder="https://github.com/username/my-app"
                    value={form.githubUrl}
                    onChange={(e) => setForm(f => ({ ...f, githubUrl: e.target.value }))}
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

            {mode === "github" && (
              <div className="mt-3 pt-3 border-t border-border/20 flex justify-end">
                <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="text-xs">Cancel</Button>
              </div>
            )}
          </Card>
        )}

        <Card className="border-border/40 bg-card/20">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-secondary/30 animate-pulse" />)}
            </div>
          ) : repos?.length === 0 ? (
            <div className="p-12 text-center">
              <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No repositories yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                Connect your first GitHub repository to start getting AI-powered deployment recommendations.
              </p>
              <Button onClick={() => setAdding(true)} className="bg-primary text-primary-foreground gap-2">
                <Plus className="w-4 h-4" />
                Connect First Repository
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {repos?.map((repo) => (
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
                        <Badge variant="outline" className={`text-[10px] ${statusStyle[repo.deploymentStatus] ?? ""}`}>
                          {repo.deploymentStatus.replace("_", " ")}
                        </Badge>
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
                      <Link href={`/repositories/${repo.id}`}>
                        <Zap className="w-3.5 h-3.5" /> Analyze
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="text-xs gap-1.5">
                      <Link href={`/repositories/${repo.id}`}>
                        Details <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(repo.id)}
                    >
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
