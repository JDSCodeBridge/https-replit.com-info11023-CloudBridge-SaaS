import AppLayout from "./layout";
import { useListRepositories, useCreateDeployment, getListDeploymentsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { Cloud, Smartphone, Zap, Loader2 } from "lucide-react";
import { useState } from "react";

const cloudProviders = [
  { name: "AWS", difficulty: "hard", cost: "$20–100/mo", time: "2–4 hours", tag: "Most Popular", tagColor: "text-primary border-primary/30" },
  { name: "DigitalOcean", difficulty: "easy", cost: "$5–25/mo", time: "30 min", tag: "Easiest", tagColor: "text-green-400 border-green-400/30" },
  { name: "Google Cloud", difficulty: "medium", cost: "$15–80/mo", time: "1–2 hours", tag: "", tagColor: "" },
  { name: "Azure", difficulty: "medium", cost: "$20–90/mo", time: "1–3 hours", tag: "", tagColor: "" },
];

const mobileStores = [
  { name: "Apple App Store", difficulty: "hard", cost: "$99/yr dev account", time: "5–10 days", tag: "", tagColor: "" },
  { name: "Google Play Store", difficulty: "medium", cost: "$25 one-time", time: "2–5 days", tag: "Faster Review", tagColor: "text-green-400 border-green-400/30" },
];

const difficultyStyle = {
  easy: "text-green-400 bg-green-400/10 border-green-400/20",
  medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  hard: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function Launch() {
  const { data: repos } = useListRepositories();
  const createDeployment = useCreateDeployment();
  const qc = useQueryClient();
  const [deploying, setDeploying] = useState<string | null>(null);
  const [deployed, setDeployed] = useState<string | null>(null);

  const selectedRepo = repos?.[0];

  const handleDeploy = (provider: string) => {
    if (!selectedRepo) return;
    setDeploying(provider);
    createDeployment.mutate(
      { data: { repositoryId: selectedRepo.id, provider, environment: "production" } },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListDeploymentsQueryKey() });
          setDeployed(provider);
          setDeploying(null);
          setTimeout(() => setDeployed(null), 3000);
        },
        onError: () => setDeploying(null),
      }
    );
  };

  const ProviderCard = ({ name, difficulty, cost, time, tag, tagColor }: typeof cloudProviders[0]) => (
    <div className="p-4 rounded-xl border border-border/40 bg-card/20 flex flex-col gap-3 hover:border-border/60 transition-colors">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{name}</span>
        <div className="flex items-center gap-2">
          {tag && <Badge variant="outline" className={`text-[10px] ${tagColor}`}>{tag}</Badge>}
          <Badge variant="outline" className={`text-[10px] ${difficultyStyle[difficulty as keyof typeof difficultyStyle]}`}>
            {difficulty}
          </Badge>
        </div>
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>Cost: <strong className="text-foreground">{cost}</strong></span>
        <span>Time: <strong className="text-foreground">{time}</strong></span>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="border-border/40 hover:bg-secondary/40"
        disabled={!selectedRepo || deploying === name}
        onClick={() => handleDeploy(name)}
      >
        {deploying === name ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Initiating...</> :
         deployed === name ? "Initiated!" :
         "Deploy Here"}
      </Button>
    </div>
  );

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Launch Center</h1>
          <p className="text-muted-foreground text-sm">Choose your deployment target and initiate launch.</p>
        </div>

        {repos?.length === 0 && (
          <div className="mb-6 p-4 rounded-xl border border-yellow-400/20 bg-yellow-400/5 text-sm text-yellow-300 flex items-center gap-2">
            <Zap className="w-4 h-4 shrink-0" />
            Connect a repository first to initiate deployments.
          </div>
        )}

        {selectedRepo && (
          <div className="mb-6 p-4 rounded-xl border border-border/40 bg-card/20 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <div className="text-sm">
              Deploying: <strong>{selectedRepo.fullName}</strong>
            </div>
          </div>
        )}

        <div className="space-y-8">
          <Card className="border-border/40 bg-card/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Cloud className="w-4 h-4 text-primary" />
                Cloud Providers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cloudProviders.map(p => <ProviderCard key={p.name} {...p} />)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Smartphone className="w-4 h-4 text-accent" />
                Mobile App Stores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mobileStores.map(p => <ProviderCard key={p.name} {...p} />)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
