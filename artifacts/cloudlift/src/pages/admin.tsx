import AppLayout from "./layout";
import {
  useGetAdminStats,
  useAdminListUsers,
  useAdminListServiceRequests,
  useAdminUpdateServiceRequest,
  getAdminListServiceRequestsQueryKey,
  ServiceRequestUpdateStatus,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { Users, GitBranch, Rocket, Zap, AlertCircle } from "lucide-react";

const statusOptions = ["pending", "in_review", "in_progress", "completed", "cancelled"] as const;

const statusStyle: Record<string, string> = {
  pending: "text-yellow-400 border-yellow-400/30",
  in_review: "text-blue-400 border-blue-400/30",
  in_progress: "text-primary border-primary/30",
  completed: "text-green-400 border-green-400/30",
  cancelled: "text-muted-foreground border-muted/30",
};

export default function Admin() {
  const { data: stats } = useGetAdminStats();
  const { data: users, isLoading: loadingUsers } = useAdminListUsers();
  const { data: serviceRequests } = useAdminListServiceRequests();
  const updateService = useAdminUpdateServiceRequest();
  const qc = useQueryClient();

  const handleStatusUpdate = (id: number, status: string) => {
    updateService.mutate({ id, data: { status: status as ServiceRequestUpdateStatus } }, {
      onSuccess: () => qc.invalidateQueries({ queryKey: getAdminListServiceRequestsQueryKey() }),
    });
  };

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? "—", icon: Users, color: "text-primary" },
    { label: "Repositories", value: stats?.totalRepositories ?? "—", icon: GitBranch, color: "text-accent" },
    { label: "Deployments", value: stats?.totalDeployments ?? "—", icon: Rocket, color: "text-blue-400" },
    { label: "Pending Requests", value: stats?.pendingServiceRequests ?? "—", icon: AlertCircle, color: "text-yellow-400" },
  ];

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <Badge variant="outline" className="text-primary border-primary/30 text-xs">Admin</Badge>
          </div>
          <p className="text-muted-foreground text-sm">Platform overview and service management.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border-border/40 bg-card/20">
              <CardContent className="p-5">
                <Icon className={`w-5 h-5 mb-3 ${color}`} />
                <div className="text-2xl font-bold tabular-nums mb-0.5">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border/40 bg-card/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Service Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {serviceRequests?.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">No requests yet.</div>
              ) : (
                <div className="space-y-3">
                  {serviceRequests?.slice(0, 10).map((req) => (
                    <div key={req.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/30 bg-secondary/10">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{req.serviceType.replace(/_/g, " ")}</div>
                        <div className="text-xs text-muted-foreground">User #{req.userId} · {new Date(req.createdAt).toLocaleDateString()}</div>
                      </div>
                      <select
                        value={req.status}
                        onChange={(e) => handleStatusUpdate(req.id, e.target.value)}
                        className={`text-xs border rounded px-2 py-1 bg-background cursor-pointer ${statusStyle[req.status] ?? ""}`}
                      >
                        {statusOptions.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Recent Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-12 rounded bg-secondary/30 animate-pulse" />)}
                </div>
              ) : users?.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">No users yet.</div>
              ) : (
                <div className="space-y-2">
                  {users?.slice(0, 8).map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-secondary/10">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{u.email}</div>
                        <div className="text-xs text-muted-foreground">{u.repositoryCount} repos · {u.plan}</div>
                      </div>
                      {u.role === "admin" && (
                        <Badge variant="outline" className="text-primary border-primary/30 text-[10px] shrink-0">admin</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
