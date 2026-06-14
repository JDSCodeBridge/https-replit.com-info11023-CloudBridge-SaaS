import AppLayout from "./layout";
import { useGetMyProfile, useGetMySubscription, useUpdateMyProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/react";
import { useState } from "react";
import { CheckCircle2, CreditCard, User, ArrowUpRight } from "lucide-react";

const planLabels: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  launch_package: "Launch Package",
  apple_package: "Apple Publishing",
};

export default function Settings() {
  const { user: clerkUser } = useUser();
  const { data: profile } = useGetMyProfile();
  const { data: subscription } = useGetMySubscription();
  const updateProfile = useUpdateMyProfile();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile.mutate({ data: { name: clerkUser?.fullName ?? undefined } }, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      },
    });
  };

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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                GitHub:
                <Badge variant="outline" className={profile?.githubConnected ? "text-green-400 border-green-400/30" : "border-border/40"}>
                  {profile?.githubConnected ? "Connected" : "Not connected"}
                </Badge>
              </div>
              <Button size="sm" variant="outline" className="border-border/40" onClick={handleSave} disabled={updateProfile.isPending}>
                {saved ? <><CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />Saved</> : "Save Changes"}
              </Button>
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
