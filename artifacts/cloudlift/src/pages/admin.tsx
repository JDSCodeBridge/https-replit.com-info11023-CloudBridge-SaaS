import { useState } from "react";
import AppLayout from "./layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useGetAdminStats,
} from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users, GitBranch, Rocket, Zap, AlertCircle, Shield,
  CreditCard, Activity, Server, CheckCircle, XCircle,
  RefreshCw, Search, ChevronUp, ChevronDown,
} from "lucide-react";

// ─── Custom hooks for admin endpoints ───────────────────────────────────────

function useAdminUsers() {
  return useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    queryFn: () => fetch("/api/admin/users").then(r => r.json()),
  });
}

function useAdminSubscriptions() {
  return useQuery<any[]>({
    queryKey: ["/api/admin/subscriptions"],
    queryFn: () => fetch("/api/admin/subscriptions").then(r => r.json()),
  });
}

function useAdminDeployments() {
  return useQuery<any[]>({
    queryKey: ["/api/admin/deployments"],
    queryFn: () => fetch("/api/admin/deployments").then(r => r.json()),
  });
}

function useAdminServiceRequests() {
  return useQuery<any[]>({
    queryKey: ["/api/admin/services"],
    queryFn: () => fetch("/api/admin/services").then(r => r.json()),
  });
}

function useAdminSystem() {
  return useQuery<any>({
    queryKey: ["/api/admin/system"],
    queryFn: () => fetch("/api/admin/system").then(r => r.json()),
    refetchInterval: 30_000,
  });
}

function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      fetch(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/users"] }),
  });
}

function useUpdateServiceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, adminNotes }: { id: number; status: string; adminNotes?: string }) =>
      fetch(`/api/admin/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes }),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/services"] }),
  });
}

function useUpdateDeployment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      fetch(`/api/admin/deployments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/deployments"] }),
  });
}

// ─── Shared UI helpers ───────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string | number; icon: any; color: string; sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/20 p-5">
      <Icon className={`w-5 h-5 mb-3 ${color}`} />
      <div className="text-2xl font-bold tabular-nums mb-0.5">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {sub && <div className="text-xs text-muted-foreground/60 mt-0.5">{sub}</div>}
    </div>
  );
}

const planStyle: Record<string, string> = {
  free: "bg-muted/30 text-muted-foreground border-border/30",
  pro: "bg-primary/10 text-primary border-primary/30",
  launch: "bg-blue-500/10 text-blue-400 border-blue-400/30",
  apple: "bg-violet-500/10 text-violet-400 border-violet-400/30",
};

const statusStyle: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-400/30",
  in_review: "bg-blue-500/10 text-blue-400 border-blue-400/30",
  in_progress: "bg-primary/10 text-primary border-primary/30",
  completed: "bg-green-500/10 text-green-400 border-green-400/30",
  cancelled: "bg-muted/30 text-muted-foreground border-border/30",
  active: "bg-green-500/10 text-green-400 border-green-400/30",
  inactive: "bg-muted/30 text-muted-foreground border-border/30",
  success: "bg-green-500/10 text-green-400 border-green-400/30",
  failed: "bg-red-500/10 text-red-400 border-red-400/30",
  running: "bg-primary/10 text-primary border-primary/30",
  none: "bg-muted/30 text-muted-foreground border-border/30",
};

function StatusBadge({ value }: { value: string }) {
  const cls = statusStyle[value] ?? "bg-muted/30 text-muted-foreground border-border/30";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-medium ${cls}`}>
      {value.replace(/_/g, " ")}
    </span>
  );
}

function PlanBadge({ value }: { value: string }) {
  const cls = planStyle[value] ?? "bg-muted/30 text-muted-foreground border-border/30";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-medium ${cls}`}>
      {value}
    </span>
  );
}

function TableHeader({ cols }: { cols: string[] }) {
  return (
    <thead>
      <tr className="border-b border-border/30">
        {cols.map(c => (
          <th key={c} className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function EmptyRow({ cols, message = "No data yet" }: { cols: number; message?: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-3 py-8 text-center text-sm text-muted-foreground">{message}</td>
    </tr>
  );
}

function LoadingRows({ cols, n = 4 }: { cols: number; n?: number }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-3 py-3">
              <div className="h-4 rounded bg-secondary/30 animate-pulse" style={{ width: j === 0 ? "60%" : "80%" }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Tab: Overview ───────────────────────────────────────────────────────────

function OverviewTab() {
  const { data: stats } = useGetAdminStats();
  const { data: users } = useAdminUsers();
  const { data: services } = useAdminServiceRequests();

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? "—", icon: Users, color: "text-primary", sub: `${stats?.adminUsers ?? 0} admin` },
    { label: "Repositories", value: stats?.totalRepositories ?? "—", icon: GitBranch, color: "text-blue-400" },
    { label: "Deployments", value: stats?.totalDeployments ?? "—", icon: Rocket, color: "text-violet-400" },
    { label: "Pro Subscribers", value: stats?.proUsers ?? "—", icon: CreditCard, color: "text-green-400", sub: `${stats?.activeSubscriptions ?? 0} active` },
    { label: "Service Requests", value: stats?.totalServiceRequests ?? "—", icon: Zap, color: "text-orange-400", sub: `${stats?.pendingServiceRequests ?? 0} pending` },
    { label: "Pending Action", value: stats?.pendingServiceRequests ?? "—", icon: AlertCircle, color: "text-yellow-400", sub: "needs review" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border/40 bg-card/20 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Recent Users</span>
          </div>
          <div className="divide-y divide-border/20">
            {(Array.isArray(users) ? users : []).slice(0, 6).map(u => (
              <div key={u.id} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/10">
                <div>
                  <div className="text-sm font-medium">{u.email}</div>
                  <div className="text-xs text-muted-foreground">{u.repositoryCount} repos · {fmt(u.createdAt)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <PlanBadge value={u.plan} />
                  {u.role === "admin" && <Badge variant="outline" className="text-primary border-primary/30 text-[10px]">admin</Badge>}
                </div>
              </div>
            ))}
            {!(Array.isArray(users) ? users : []).length && <div className="px-4 py-6 text-center text-sm text-muted-foreground">No users yet</div>}
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/20 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium">Pending Service Requests</span>
          </div>
          <div className="divide-y divide-border/20">
            {(Array.isArray(services) ? services : []).filter(s => s.status === "pending").slice(0, 6).map(s => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/10">
                <div>
                  <div className="text-sm font-medium">{s.serviceType.replace(/_/g, " ")}</div>
                  <div className="text-xs text-muted-foreground">{s.userEmail} · {fmt(s.createdAt)}</div>
                </div>
                <StatusBadge value={s.status} />
              </div>
            ))}
            {!(Array.isArray(services) ? services : []).filter(s => s.status === "pending").length && (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">No pending requests 🎉</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Users ──────────────────────────────────────────────────────────────

function UsersTab() {
  const { data: users, isLoading } = useAdminUsers();
  const updateRole = useUpdateUserRole();
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = (users ?? [])
    .filter(u => !search || u.email.toLowerCase().includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const d = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortDir === "asc" ? d : -d;
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by email or name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm bg-secondary/20"
          />
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="rounded-xl border border-border/40 overflow-hidden">
        <table className="w-full text-sm">
          <TableHeader cols={["Email / Name", "Plan", "Repos", "Joined", "Role"]} />
          <tbody className="divide-y divide-border/20">
            {isLoading && <LoadingRows cols={5} />}
            {!isLoading && filtered.length === 0 && <EmptyRow cols={5} message="No users found" />}
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-secondary/10 transition-colors">
                <td className="px-3 py-3">
                  <div className="font-medium">{u.email}</div>
                  {u.name && <div className="text-xs text-muted-foreground">{u.name}</div>}
                </td>
                <td className="px-3 py-3"><PlanBadge value={u.plan} /></td>
                <td className="px-3 py-3 tabular-nums">{u.repositoryCount}</td>
                <td className="px-3 py-3 text-muted-foreground text-xs">{fmt(u.createdAt)}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${u.role === "admin" ? "text-primary" : "text-muted-foreground"}`}>
                      {u.role}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[11px]"
                      disabled={updateRole.isPending}
                      onClick={() => updateRole.mutate({ id: u.id, role: u.role === "admin" ? "user" : "admin" })}
                    >
                      {u.role === "admin" ? "Demote" : "Make Admin"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab: Subscriptions ──────────────────────────────────────────────────────

function SubscriptionsTab() {
  const { data: subs, isLoading } = useAdminSubscriptions();
  const [search, setSearch] = useState("");

  const filtered = (subs ?? []).filter(s =>
    !search || s.userEmail.toLowerCase().includes(search.toLowerCase())
  );
  const activeCount = (subs ?? []).filter(s => s.status === "active").length;
  const proCount = (subs ?? []).filter(s => s.plan === "pro").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Subscriptions" value={subs?.length ?? "—"} icon={CreditCard} color="text-primary" />
        <StatCard label="Active" value={activeCount} icon={CheckCircle} color="text-green-400" />
        <StatCard label="Pro Plan" value={proCount} icon={Shield} color="text-violet-400" />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm bg-secondary/20"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/40 overflow-hidden">
        <table className="w-full text-sm">
          <TableHeader cols={["User", "Plan", "Status", "Stripe ID", "Renews / Expires", "Since"]} />
          <tbody className="divide-y divide-border/20">
            {isLoading && <LoadingRows cols={6} />}
            {!isLoading && filtered.length === 0 && <EmptyRow cols={6} message="No subscriptions yet" />}
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-secondary/10 transition-colors">
                <td className="px-3 py-3">
                  <div className="font-medium">{s.userEmail}</div>
                  {s.userName && <div className="text-xs text-muted-foreground">{s.userName}</div>}
                </td>
                <td className="px-3 py-3"><PlanBadge value={s.plan} /></td>
                <td className="px-3 py-3"><StatusBadge value={s.status ?? "none"} /></td>
                <td className="px-3 py-3 text-xs text-muted-foreground font-mono">
                  {s.stripeSubscriptionId ? s.stripeSubscriptionId.slice(0, 20) + "…" : "—"}
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground">
                  {s.currentPeriodEnd ? fmt(s.currentPeriodEnd) : "—"}
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground">{fmt(s.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab: Deployments ────────────────────────────────────────────────────────

const deploymentStatusOptions = ["pending", "running", "success", "failed", "cancelled"] as const;

function DeploymentsTab() {
  const { data: deps, isLoading } = useAdminDeployments();
  const updateDeployment = useUpdateDeployment();
  const [search, setSearch] = useState("");

  const filtered = (deps ?? []).filter(d =>
    !search ||
    d.userEmail.toLowerCase().includes(search.toLowerCase()) ||
    d.repositoryName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {["pending", "running", "success", "failed"].map(s => (
          <StatCard
            key={s}
            label={s.charAt(0).toUpperCase() + s.slice(1)}
            value={(deps ?? []).filter(d => d.status === s).length}
            icon={s === "success" ? CheckCircle : s === "failed" ? XCircle : Rocket}
            color={s === "success" ? "text-green-400" : s === "failed" ? "text-red-400" : s === "running" ? "text-primary" : "text-yellow-400"}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by user or repo…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm bg-secondary/20"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/40 overflow-hidden">
        <table className="w-full text-sm">
          <TableHeader cols={["User", "Repository", "Provider", "Environment", "Status", "Date"]} />
          <tbody className="divide-y divide-border/20">
            {isLoading && <LoadingRows cols={6} />}
            {!isLoading && filtered.length === 0 && <EmptyRow cols={6} message="No deployments yet" />}
            {filtered.map(d => (
              <tr key={d.id} className="hover:bg-secondary/10 transition-colors">
                <td className="px-3 py-3 text-xs">{d.userEmail}</td>
                <td className="px-3 py-3">
                  <div className="font-medium text-xs">{d.repositoryName ?? "—"}</div>
                </td>
                <td className="px-3 py-3">
                  <span className="text-xs bg-secondary/30 px-2 py-0.5 rounded">{d.provider}</span>
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground">{d.environment}</td>
                <td className="px-3 py-3">
                  <select
                    value={d.status}
                    onChange={e => updateDeployment.mutate({ id: d.id, status: e.target.value })}
                    className="text-xs border border-border/40 rounded px-2 py-1 bg-background cursor-pointer"
                  >
                    {deploymentStatusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground">{fmt(d.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab: Service Requests ────────────────────────────────────────────────────

const serviceStatusOptions = ["pending", "in_review", "in_progress", "completed", "cancelled"] as const;

function ServiceRequestsTab() {
  const { data: requests, isLoading } = useAdminServiceRequests();
  const updateRequest = useUpdateServiceRequest();
  const [search, setSearch] = useState("");
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [notesValue, setNotesValue] = useState("");

  const filtered = (requests ?? []).filter(r =>
    !search ||
    r.userEmail.toLowerCase().includes(search.toLowerCase()) ||
    r.serviceType.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = (requests ?? []).filter(r => r.status === "pending").length;
  const inProgressCount = (requests ?? []).filter(r => r.status === "in_progress").length;
  const completedCount = (requests ?? []).filter(r => r.status === "completed").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Pending" value={pendingCount} icon={AlertCircle} color="text-yellow-400" />
        <StatCard label="In Progress" value={inProgressCount} icon={Activity} color="text-primary" />
        <StatCard label="Completed" value={completedCount} icon={CheckCircle} color="text-green-400" />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by user or type…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm bg-secondary/20"
          />
        </div>
      </div>

      <div className="space-y-2">
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-lg bg-secondary/20 animate-pulse" />)}
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-10 text-sm text-muted-foreground">No service requests found</div>
        )}
        {filtered.map(r => (
          <div key={r.id} className="rounded-lg border border-border/40 bg-card/10 p-4 space-y-3 hover:bg-card/20 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{r.serviceType.replace(/_/g, " ")}</span>
                  <span className="text-xs text-muted-foreground">#{r.id}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{r.userEmail} · {fmt(r.createdAt)}</div>
                {r.description && (
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{r.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={r.status}
                  onChange={e => updateRequest.mutate({ id: r.id, status: e.target.value })}
                  className={`text-xs border rounded px-2 py-1 bg-background cursor-pointer ${statusStyle[r.status] ?? ""}`}
                >
                  {serviceStatusOptions.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </select>
              </div>
            </div>

            {editingNotes === r.id ? (
              <div className="space-y-2">
                <textarea
                  value={notesValue}
                  onChange={e => setNotesValue(e.target.value)}
                  placeholder="Add internal notes…"
                  rows={2}
                  className="w-full text-xs bg-secondary/20 border border-border/40 rounded px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-6 text-[11px] px-3"
                    onClick={() => {
                      updateRequest.mutate({ id: r.id, status: r.status, adminNotes: notesValue });
                      setEditingNotes(null);
                    }}
                  >Save</Button>
                  <Button variant="ghost" size="sm" className="h-6 text-[11px] px-3" onClick={() => setEditingNotes(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div
                className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => { setEditingNotes(r.id); setNotesValue(r.adminNotes ?? ""); }}
              >
                {r.adminNotes
                  ? <span className="italic">"{r.adminNotes}"</span>
                  : <span className="opacity-50">+ Add internal note…</span>
                }
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: System Health ──────────────────────────────────────────────────────

function SystemHealthTab() {
  const { data: sys, isLoading, refetch, isFetching } = useAdminSystem();

  const uptime = sys?.api?.uptime;
  const uptimeStr = uptime != null
    ? uptime < 60 ? `${uptime}s`
    : uptime < 3600 ? `${Math.floor(uptime / 60)}m ${uptime % 60}s`
    : `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`
    : "—";

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-2 h-8 text-xs" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl border border-border/40 bg-card/20 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Services</span>
          </div>
          <div className="divide-y divide-border/20">
            {[
              { label: "API Server", status: sys?.api?.status ?? (isLoading ? "checking" : "—"), detail: `Uptime: ${uptimeStr}` },
              { label: "Database", status: sys?.database?.status ?? (isLoading ? "checking" : "—"), detail: "PostgreSQL" },
              { label: "Node.js", status: "ok", detail: sys?.node?.version ?? "—" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.detail}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.status === "ok" ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : item.status === "error" ? (
                    <XCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin" />
                  )}
                  <span className={`text-xs font-medium ${item.status === "ok" ? "text-green-400" : item.status === "error" ? "text-red-400" : "text-muted-foreground"}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/20 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Environment Variables</span>
          </div>
          <div className="divide-y divide-border/20">
            {(sys?.environment ?? [
              { key: "DATABASE_URL", present: false },
              { key: "CLERK_SECRET_KEY", present: false },
              { key: "STRIPE_PRICE_PRO_YEARLY", present: false },
              { key: "STRIPE_PRICE_LAUNCH", present: false },
              { key: "STRIPE_PRICE_APPLE", present: false },
              { key: "REPLIT_DOMAINS", present: false },
            ]).map((env: { key: string; present: boolean }) => (
              <div key={env.key} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-xs font-mono text-muted-foreground">{env.key}</span>
                {isLoading ? (
                  <div className="w-16 h-3 rounded bg-secondary/30 animate-pulse" />
                ) : env.present ? (
                  <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="text-xs">set</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-400">
                    <XCircle className="w-3.5 h-3.5" />
                    <span className="text-xs">missing</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {sys?.timestamp && (
        <div className="text-xs text-muted-foreground text-right">
          Last checked: {new Date(sys.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────

export default function Admin() {
  const { data: stats } = useGetAdminStats();
  const pendingCount = stats?.pendingServiceRequests ?? 0;

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <Badge variant="outline" className="text-primary border-primary/30 text-xs">Admin</Badge>
          </div>
          <p className="text-muted-foreground text-sm">Manage users, subscriptions, deployments, and service requests.</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-5">
          <TabsList className="bg-secondary/20 border border-border/30 h-auto p-1 flex flex-wrap gap-0.5">
            <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Users
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="deployments" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Deployments
            </TabsTrigger>
            <TabsTrigger value="services" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <span className="flex items-center gap-1.5">
                Service Requests
                {pendingCount > 0 && (
                  <span className="bg-yellow-500/20 text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </span>
            </TabsTrigger>
            <TabsTrigger value="system" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
              System Health
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="subscriptions"><SubscriptionsTab /></TabsContent>
          <TabsContent value="deployments"><DeploymentsTab /></TabsContent>
          <TabsContent value="services"><ServiceRequestsTab /></TabsContent>
          <TabsContent value="system"><SystemHealthTab /></TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
