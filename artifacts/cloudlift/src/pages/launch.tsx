import AppLayout from "./layout";
import { useListRepositories } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, Smartphone, Zap, CheckCircle2, ArrowRight, GitBranch, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";

const cloudProviders = [
  {
    id: "digitalocean",
    name: "DigitalOcean",
    logo: "🌊",
    difficulty: "easy" as const,
    cost: "$5–25/mo",
    time: "~3 min",
    tag: "★ Recommended",
    tagColor: "text-primary border-primary/30 bg-primary/10",
    description: "Best for most founders and AI apps. Guided wizard included.",
    hasWizard: true,
  },
  {
    id: "aws",
    name: "AWS",
    logo: "☁️",
    difficulty: "hard" as const,
    cost: "$20–100/mo",
    time: "2–4 hrs",
    tag: "Most Popular",
    tagColor: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
    description: "Largest cloud. Maximum flexibility and global reach.",
    hasWizard: false,
  },
  {
    id: "azure",
    name: "Azure",
    logo: "🔷",
    difficulty: "medium" as const,
    cost: "$20–90/mo",
    time: "1–3 hrs",
    tag: "",
    tagColor: "",
    description: "Microsoft cloud. Great for teams using Microsoft 365.",
    hasWizard: false,
  },
  {
    id: "gcp",
    name: "Google Cloud",
    logo: "🔴",
    difficulty: "medium" as const,
    cost: "$15–80/mo",
    time: "1–2 hrs",
    tag: "",
    tagColor: "",
    description: "Best AI/ML tooling. Ideal for data-heavy applications.",
    hasWizard: false,
  },
];

const mobileStores = [
  {
    id: "apple",
    name: "Apple App Store",
    logo: "🍎",
    difficulty: "hard" as const,
    cost: "$99/yr",
    time: "5–10 days",
    tag: "",
    tagColor: "",
    description: "iOS distribution. Requires Apple Developer membership.",
    hasWizard: false,
  },
  {
    id: "google-play",
    name: "Google Play Store",
    logo: "🤖",
    difficulty: "medium" as const,
    cost: "$25 one-time",
    time: "2–5 days",
    tag: "Faster Review",
    tagColor: "text-green-400 border-green-400/30 bg-green-400/10",
    description: "Android distribution. Faster review than Apple.",
    hasWizard: false,
  },
];

const difficultyStyle = {
  easy: "text-green-400 bg-green-400/10 border-green-400/20",
  medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  hard: "text-red-400 bg-red-400/10 border-red-400/20",
};

type Provider = typeof cloudProviders[0] | typeof mobileStores[0];

function RepoSelector({ repos, selectedId, onSelect }: {
  repos: any[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = repos.find((r) => r.id === selectedId);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
          selected
            ? "border-primary/40 bg-primary/5"
            : "border-border/40 bg-card/20 hover:border-border/60"
        }`}
      >
        <GitBranch className={`w-4 h-4 shrink-0 ${selected ? "text-primary" : "text-muted-foreground"}`} />
        <div className="flex-1 min-w-0">
          {selected ? (
            <>
              <div className="text-sm font-medium truncate">{selected.fullName}</div>
              {selected.framework && (
                <div className="text-xs text-muted-foreground">{selected.framework}</div>
              )}
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Select a repository to deploy…</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-border/40 bg-background shadow-xl z-20 overflow-hidden">
          {repos.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">No repositories connected yet.</div>
          ) : (
            repos.map((r) => (
              <button
                key={r.id}
                onClick={() => { onSelect(r.id); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/30 transition-colors border-b border-border/20 last:border-0 ${
                  r.id === selectedId ? "bg-primary/5" : ""
                }`}
              >
                <GitBranch className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.fullName}</div>
                  {r.framework && <div className="text-xs text-muted-foreground">{r.framework}</div>}
                </div>
                {r.id === selectedId && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ProviderCard({
  provider,
  selected,
  onSelect,
}: {
  provider: Provider;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`text-left p-4 rounded-xl border transition-all w-full ${
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
          : "border-border/40 bg-card/20 hover:border-border/70 hover:bg-card/30"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">{provider.logo}</span>
          <div>
            <div className="font-semibold text-sm">{provider.name}</div>
            {"tag" in provider && provider.tag && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${provider.tagColor}`}>
                {provider.tag}
              </span>
            )}
          </div>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
          selected ? "border-primary bg-primary" : "border-border/40"
        }`}>
          {selected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{provider.description}</p>
      <div className="flex gap-3 text-xs">
        <div>
          <span className="text-muted-foreground">Difficulty </span>
          <Badge variant="outline" className={`text-[10px] ml-0.5 ${difficultyStyle[provider.difficulty]}`}>
            {provider.difficulty}
          </Badge>
        </div>
        <div className="text-muted-foreground">
          Cost: <strong className="text-foreground">{provider.cost}</strong>
        </div>
        <div className="text-muted-foreground">
          Time: <strong className="text-foreground">{provider.time}</strong>
        </div>
      </div>
    </button>
  );
}

export default function Launch() {
  const { data: repos } = useListRepositories();
  const [, navigate] = useLocation();
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // Auto-select first repo
  useEffect(() => {
    if (repos && repos.length > 0 && !selectedRepoId) {
      setSelectedRepoId(repos[0].id);
    }
  }, [repos]);

  const allProviders = [...cloudProviders, ...mobileStores];
  const chosenProvider = allProviders.find((p) => p.id === selectedProvider);
  const canLaunch = selectedRepoId && selectedProvider;

  const handleLaunch = () => {
    if (!selectedRepoId || !selectedProvider) return;
    if (selectedProvider === "digitalocean") {
      navigate(`/repositories/${selectedRepoId}/deploy`);
    } else {
      navigate(`/repositories/${selectedRepoId}/guided-deploy?provider=${selectedProvider}`);
    }
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Launch Center</h1>
          <p className="text-muted-foreground text-sm">
            Pick a repository and a deployment target — CloudLift handles the rest.
          </p>
        </div>

        {/* Step 1: Repository */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold">
              1
            </div>
            <h2 className="font-semibold text-sm">Which app do you want to deploy?</h2>
          </div>
          {(Array.isArray(repos) ? repos : []).length === 0 ? (
            <div className="p-4 rounded-xl border border-yellow-400/20 bg-yellow-400/5 text-sm text-yellow-300 flex items-center gap-2">
              <Zap className="w-4 h-4 shrink-0" />
              Connect a GitHub repository first before launching.
            </div>
          ) : (
            <RepoSelector
              repos={Array.isArray(repos) ? repos : []}
              selectedId={selectedRepoId}
              onSelect={setSelectedRepoId}
            />
          )}
        </div>

        {/* Step 2: Cloud provider */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold transition-colors ${
              selectedRepoId
                ? "bg-primary/20 border-primary/30 text-primary"
                : "bg-secondary/20 border-border/30 text-muted-foreground"
            }`}>
              2
            </div>
            <h2 className={`font-semibold text-sm transition-colors ${selectedRepoId ? "" : "text-muted-foreground"}`}>
              Where should it live?
            </h2>
          </div>

          <Card className="border-border/40 bg-card/20 mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <Cloud className="w-4 h-4" />
                Cloud Servers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cloudProviders.map((p) => (
                  <ProviderCard
                    key={p.id}
                    provider={p}
                    selected={selectedProvider === p.id}
                    onSelect={() => setSelectedProvider(p.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <Smartphone className="w-4 h-4" />
                Mobile App Stores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mobileStores.map((p) => (
                  <ProviderCard
                    key={p.id}
                    provider={p}
                    selected={selectedProvider === p.id}
                    onSelect={() => setSelectedProvider(p.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Launch CTA */}
        <div className={`sticky bottom-6 transition-all duration-300 ${canLaunch ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
          <div className="p-4 rounded-2xl border border-primary/30 bg-background/95 backdrop-blur shadow-2xl flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">
                Ready to launch
                {chosenProvider && <span className="text-primary"> on {chosenProvider.name}</span>}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {(Array.isArray(repos) ? repos : []).find((r) => r.id === selectedRepoId)?.fullName ?? ""}
                {chosenProvider && ` · ${chosenProvider.cost} · ${chosenProvider.time}`}
              </div>
            </div>
            <Button
              onClick={handleLaunch}
              disabled={!canLaunch}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 gap-2"
              size="lg"
            >
              Launch
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
