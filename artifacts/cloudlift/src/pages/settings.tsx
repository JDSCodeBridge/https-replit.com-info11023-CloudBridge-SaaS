import AppLayout from "./layout";
import { useGetMyProfile, useGetMySubscription, useUpdateMyProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CreditCard, User, ArrowUpRight, Github, Unlink, Eye, EyeOff } from "lucide-react";

const planLabels: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  launch_package: "Launch Package",
  apple_package: "Apple Publishing",
};

function useGithubStatus() {
  return useQuery<{ connected: boolean; username: string | null }>({
    queryKey: ["/api/github/status"],
    queryFn: () => fetch("/api/github/status").then(r => r.json()),
  });
}

function useConnectGithub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) =>
      fetch("/api/github/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }).then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "Failed to connect");
        return data;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/github/status"] });
      qc.invalidateQueries({ queryKey: ["/api/users/me"] });
    },
  });
}

function useDisconnectGithub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetch("/api/github/disconnect", { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/github/status"] });
      qc.invalidateQueries({ queryKey: ["/api/users/me"] });
    },
  });
}

export default function Settings() {
  const { user: clerkUser } = useUser();
  const { data: profile } = useGetMyProfile();
  const { data: subscription } = useGetMySubscription();
  const updateProfile = useUpdateMyProfile();
  const { data: githubStatus } = useGithubStatus();
  const connectGithub = useConnectGithub();
  const disconnectGithub = useDisconnectGithub();

  const [saved, setSaved] = useState(false);
  const [pat, setPat] = useState("");
  const [showPat, setShowPat] = useState(false);
  const [patError, setPatError] = useState<string | null>(null);
  const [patSuccess, setPatSuccess] = useState(false);

  const handleSave = () => {
    updateProfile.mutate({ data: { name: clerkUser?.fullName ?? undefined } }, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      },
    });
  };

  const handleConnectGithub = async () => {
    setPatError(null);
    setPatSuccess(false);
    if (!pat.trim()) { setPatError("Please enter a GitHub Personal Access Token."); return; }
    try {
      await connectGithub.mutateAsync(pat.trim());
      setPat("");
      setPatSuccess(true);
      setTimeout(() => setPatSuccess(false), 3000);
    } catch (err: any) {
      setPatError(err.message ?? "Failed to connect GitHub.");
    }
  };

  const isConnected = githubStatus?.connected ?? profile?.githubConnected ?? false;
  const githubUsername = githubStatus?.username ?? null;

  return (
    <AppLayout>
      <div className="p-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your account and subscription.</p>
        </div>

        <div className="space-y-5">
          <Card className="border-border/40 bg-card/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm flex items-center gap-2 font-medium">
                <User className="w-4 h-4" /> Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <img src={clerkUser?.imageUrl} className="w-12 h-12 rounded-full border border-border" alt="Avatar" />
                <div>
                  <div className="font-semibold">{clerkUser?.fullName ?? "—"}</div>
                  <div className="text-sm text-muted-foreground">{clerkUser?.primaryEmailAddress?.emailAddress}</div>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-border/40" onClick={handleSave} disabled={updateProfile.isPending}>
                {saved ? <><CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />Saved</> : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* GitHub Connection Card */}
          <Card className="border-border/40 bg-card/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm flex items-center gap-2 font-medium">
                <Github className="w-4 h-4" /> GitHub Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isConnected ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-green-400">Connected</div>
                      {githubUsername && (
                        <div className="text-xs text-muted-foreground">@{githubUsername}</div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your real repositories are now available when connecting repos. AI analysis will read your actual source files.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-2"
                    onClick={() => disconnectGithub.mutate()}
                    disabled={disconnectGithub.isPending}
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    {disconnectGithub.isPending ? "Disconnecting..." : "Disconnect GitHub"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Connect GitHub to see your real repositories and enable AI analysis of actual source files.
                    Create a{" "}
                    <a
                      href="https://github.com/settings/tokens/new?scopes=repo,read:user&description=CloudLift"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      Personal Access Token
                    </a>{" "}
                    with <code className="bg-secondary/50 px-1 rounded text-[11px]">repo</code> and{" "}
                    <code className="bg-secondary/50 px-1 rounded text-[11px]">read:user</code> scopes.
                  </p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showPat ? "text" : "password"}
                        className="w-full text-sm bg-secondary/30 border border-border/40 rounded-md px-3 py-2 pr-10 outline-none focus:border-primary/50 transition-colors font-mono"
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        value={pat}
                        onChange={e => { setPat(e.target.value); setPatError(null); }}
                        onKeyDown={e => e.key === "Enter" && handleConnectGithub()}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPat(v => !v)}
                      >
                        {showPat ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shrink-0"
                      onClick={handleConnectGithub}
                      disabled={connectGithub.isPending || !pat.trim()}
                    >
                      <Github className="w-3.5 h-3.5" />
                      {connectGithub.isPending ? "Connecting..." : "Connect"}
                    </Button>
                  </div>
                  {patError && <p className="text-xs text-destructive">{patError}</p>}
                  {patSuccess && <p className="text-xs text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> GitHub connected successfully!</p>}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm flex items-center gap-2 font-medium">
                <CreditCard className="w-4 h-4" /> Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{planLabels[subscription?.plan ?? "free"] ?? "Free"} Plan</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {subscription?.plan === "free" ? "1 repository included" : "Unlimited repositories"}
                    {subscription?.currentPeriodEnd && ` · Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
                  </div>
                </div>
                <Badge variant="outline" className={
                  subscription?.plan !== "free" ? "text-primary border-primary/30" : "border-border/40"
                }>
                  {subscription?.status ?? "active"}
                </Badge>
              </div>
              <div className="flex gap-3">
                {subscription?.plan === "free" && (
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                    <a href="/pricing" className="flex items-center gap-1.5">Upgrade <ArrowUpRight className="w-3.5 h-3.5" /></a>
                  </Button>
                )}
                <Button size="sm" variant="outline" className="border-border/40">Manage Billing</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
