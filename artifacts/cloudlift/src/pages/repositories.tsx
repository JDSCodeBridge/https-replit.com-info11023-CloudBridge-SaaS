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
import { useQueryClient } from "@tanstack/react-query";
import {
  GitBranch,
  Plus,
  ArrowRight,
  Trash2,
  Zap,
  Lock,
  Unlock,
} from "lucide-react";
import { useState } from "react";

const statusStyle: Record<string, string> = {
  not_deployed: "border-border/40 text-muted-foreground",
  deploying: "text-yellow-400 border-yellow-400/30",
  deployed: "text-green-400 border-green-400/30",
  failed: "text-destructive border-destructive/30",
};

const sampleRepos = [
  { name: "my-ai-app", fullName: "user/my-ai-app", githubUrl: "https://github.com/user/my-ai-app", isPrivate: false, description: "My first AI-powered web app" },
  { name: "portfolio-site", fullName: "user/portfolio-site", githubUrl: "https://github.com/user/portfolio-site", isPrivate: false, description: "Personal portfolio" },
];

export default function Repositories() {
  const { data: repos, isLoading } = useListRepositories();
  const connectMutation = useConnectRepository();
  const deleteMutation = useDeleteRepository();
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", fullName: "", githubUrl: "", isPrivate: false, description: "" });

  const handleConnect = () => {
    if (!form.fullName) return;
    connectMutation.mutate(
      { data: form },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListRepositoriesQueryKey() });
          setAdding(false);
          setForm({ name: "", fullName: "", githubUrl: "", isPrivate: false, description: "" });
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => qc.invalidateQueries({ queryKey: getListRepositoriesQueryKey() }),
    });
  };

  const handleQuickAdd = (repo: typeof sampleRepos[0]) => {
    connectMutation.mutate(
      { data: { ...repo } },
      { onSuccess: () => qc.invalidateQueries({ queryKey: getListRepositoriesQueryKey() }) }
    );
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
            onClick={() => setAdding(!adding)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <Plus className="w-4 h-4" />
            Connect Repo
          </Button>
        </div>

        {adding && (
          <Card className="border-primary/20 bg-primary/5 p-5 mb-6">
            <h3 className="text-sm font-semibold mb-4">Add Repository</h3>
            <div className="space-y-3 mb-4">
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
            </div>

            <div className="text-xs text-muted-foreground mb-3">Or add a sample:</div>
            <div className="flex flex-wrap gap-2 mb-4">
              {sampleRepos.map(r => (
                <Button key={r.name} size="sm" variant="outline" className="border-border/40 text-xs"
                  onClick={() => handleQuickAdd(r)} disabled={connectMutation.isPending}>
                  {r.fullName}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="bg-primary text-primary-foreground" onClick={handleConnect} disabled={connectMutation.isPending || !form.fullName}>
                {connectMutation.isPending ? "Connecting..." : "Connect"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
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
