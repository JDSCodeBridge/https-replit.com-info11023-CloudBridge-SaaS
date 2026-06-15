import AppLayout from "./layout";
import { useListDeployments } from "@workspace/api-client-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Rocket,
  ExternalLink,
  GitBranch,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  pending: {
    label: "Pending",
    icon: <Clock className="w-3.5 h-3.5" />,
    className: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  },
  deploying: {
    label: "Deploying",
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    className: "bg-primary/10 text-primary border-primary/20",
  },
  running: {
    label: "Running",
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    className: "bg-primary/10 text-primary border-primary/20",
  },
  deployed: {
    label: "Live",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    className: "bg-green-400/10 text-green-400 border-green-400/20",
  },
  success: {
    label: "Live",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    className: "bg-green-400/10 text-green-400 border-green-400/20",
  },
  failed: {
    label: "Failed",
    icon: <XCircle className="w-3.5 h-3.5" />,
    className: "bg-red-400/10 text-red-400 border-red-400/20",
  },
  cancelled: {
    label: "Cancelled",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    className: "bg-muted/30 text-muted-foreground border-muted/20",
  },
};

function fmt(date: string | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Deployments() {
  const [polling, setPolling] = useState<number | false>(5000);
  const { data: deployments, isLoading } = useListDeployments({ query: { refetchInterval: polling } } as any);
  const safe = Array.isArray(deployments) ? deployments : [];

  useEffect(() => {
    const hasActive = safe.some((d: any) => d.status === "deploying" || d.status === "running");
    setPolling(hasActive ? 5000 : false);
  }, [safe.map((d: any) => d.status).join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">Deployments</h1>
            <p className="text-muted-foreground text-sm">Track your cloud deployment history.</p>
          </div>
          <Button asChild>
            <Link href="/launch">
              <Rocket className="w-4 h-4 mr-2" />
              New Deployment
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-secondary/30 animate-pulse" />
            ))}
          </div>
        ) : safe.length === 0 ? (
          <div className="rounded-xl border border-border/40 bg-card/10 p-16 text-center">
            <Rocket className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold text-base mb-1">No deployments yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Start a deployment from the Launch Center or from a repository.
            </p>
            <Button asChild>
              <Link href="/launch">Go to Launch Center</Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-border/40 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 bg-secondary/10">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Repository</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Provider</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Environment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Live URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {safe.map((d) => {
                  const cfg = statusConfig[d.status] ?? statusConfig.pending;
                  return (
                    <tr key={d.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="font-medium text-xs">{(d as any).repositoryName ?? `Repo #${(d as any).repositoryId ?? d.id}`}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-secondary/30 px-2 py-0.5 rounded capitalize">{d.provider}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{d.environment}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-xs flex items-center gap-1 w-fit ${cfg.className}`}>
                          {cfg.icon}
                          {cfg.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{fmt(d.createdAt)}</td>
                      <td className="px-4 py-3">
                        {d.liveUrl ? (
                          <a
                            href={d.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
