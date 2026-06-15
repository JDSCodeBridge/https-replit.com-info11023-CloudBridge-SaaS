import AppLayout from "./layout";
import {
  useGetDashboardSummary,
  useGetDashboardActivity,
  useListRepositories,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Rocket, Zap, ArrowRight, Clock, Activity, Plus } from "lucide-react";

const activityIconMap: Record<string, React.ReactNode> = {
  repository_connected: <GitBranch className="w-4 h-4 text-primary" />,
  analysis_completed: <Zap className="w-4 h-4 text-accent" />,
  deployment_created: <Rocket className="w-4 h-4 text-blue-400" />,
  service_requested: <Activity className="w-4 h-4 text-yellow-400" />,
  deployment_succeeded: <Rocket className="w-4 h-4 text-green-400" />,
};

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: repos, isLoading: loadingRepos } = useListRepositories();
  const { data: activity } = useGetDashboardActivity();

  const statCards = [
    {
      label: "Repositories",
      value: loadingSummary ? "—" : summary?.totalRepositories ?? 0,
      sub: "Connected",
      icon: GitBranch,
      color: "text-primary",
    },
    {
      label: "Deployed",
      value: loadingSummary ? "—" : summary?.deployedRepositories ?? 0,
      sub: "In production",
      icon: Rocket,
      color: "text-green-400",
    },
    {
      label: "Readiness",
      value: loadingSummary ? "—" : summary?.averageReadinessScore != null ? `${summary.averageReadinessScore}%` : "N/A",
      sub: "Avg score",
      icon: Zap,
      color: "text-accent",
    },
    {
      label: "Services",
      value: loadingSummary ? "—" : summary?.activeServiceRequests ?? 0,
      sub: "Active requests",
      icon: Activity,
      color: "text-yellow-400",
    },
  ];

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">Dashboard</h1>
            <div className="text-muted-foreground text-sm flex items-center gap-1">
              Plan:{" "}
              <Badge variant="outline" className="text-primary border-primary/30 text-[10px] ml-1">
                {summary?.plan?.toUpperCase() ?? "FREE"}
              </Badge>
            </div>
          </div>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Link href="/repositories">
              <Plus className="w-4 h-4" />
              Add Repository
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, sub, icon: Icon, color }) => (
            <Card key={label} className="border-border/40 bg-card/20">
              <CardContent className="p-5">
                <Icon className={`w-5 h-5 mb-3 ${color}`} />
                <div className="text-2xl font-bold tabular-nums mb-0.5">{value}</div>
                <div className="text-xs text-muted-foreground">{sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-border/40 bg-card/20">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium">Repositories</CardTitle>
                <Link href="/repositories" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </CardHeader>
              <CardContent>
                {loadingRepos ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-14 rounded-lg bg-secondary/30 animate-pulse" />
                    ))}
                  </div>
                ) : repos?.length === 0 ? (
                  <div className="py-8 text-center">
                    <GitBranch className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">No repositories connected yet.</p>
                    <Button asChild size="sm" variant="outline" className="border-border/40">
                      <Link href="/repositories">Connect Repository</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {repos?.slice(0, 5).map((repo) => (
                      <Link
                        key={repo.id}
                        href={`/repositories/${repo.id}`}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-secondary/10 hover:border-border/50 hover:bg-secondary/20 transition-all group"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{repo.fullName}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {repo.framework && <span className="text-[10px] text-muted-foreground">{repo.framework}</span>}
                            {repo.readinessScore != null && (
                              <span className={`text-[10px] font-semibold ${repo.readinessScore >= 80 ? "text-primary" : repo.readinessScore >= 60 ? "text-yellow-400" : "text-destructive"}`}>
                                {repo.readinessScore}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${repo.deploymentStatus === "deployed" ? "text-green-400 border-green-400/30" : "border-border/40"}`}
                          >
                            {repo.deploymentStatus.replace("_", " ")}
                          </Badge>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-border/40 bg-card/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {!activity || activity.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    No activity yet. Connect a repository to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activity.slice(0, 8).map((item) => (
                      <div key={item.id} className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          {activityIconMap[item.type] ?? <Activity className="w-4 h-4 text-muted-foreground" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium leading-tight">{item.title}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
