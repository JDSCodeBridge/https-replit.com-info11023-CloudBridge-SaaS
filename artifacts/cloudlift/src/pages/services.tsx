import AppLayout from "./layout";
import {
  useListServiceRequests,
  useCreateServiceRequest,
  useListRepositories,
  getListServiceRequestsQueryKey,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/react";
import { Rocket, Globe, Server, Apple, Clock, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { useState } from "react";

const services = [
  {
    key: "deploy_for_me" as const,
    icon: Rocket,
    title: "Deploy For Me",
    description: "Our engineers take your repository and handle the entire cloud deployment. AWS, DigitalOcean, or Google Cloud — you pick, we execute.",
    price: "Starting at $149",
    turnaround: "24–48 hours",
    color: "from-primary/20 to-primary/5 border-primary/20",
  },
  {
    key: "publish_for_me" as const,
    icon: Globe,
    title: "Publish For Me",
    description: "Get your web app live with a custom domain, SSL, and CDN. We handle DNS, certificates, and infrastructure setup.",
    price: "Starting at $99",
    turnaround: "12–24 hours",
    color: "from-accent/20 to-accent/5 border-accent/20",
  },
  {
    key: "cloud_infrastructure" as const,
    icon: Server,
    title: "Cloud Infrastructure Setup",
    description: "Full cloud infrastructure design and setup. VPCs, load balancers, auto-scaling, monitoring, and security hardening.",
    price: "Starting at $299",
    turnaround: "3–5 days",
    color: "from-blue-500/20 to-blue-500/5 border-blue-500/20",
  },
  {
    key: "app_store_submission" as const,
    icon: Apple,
    title: "App Store Submission Help",
    description: "End-to-end Apple App Store and Google Play submission. We handle metadata, screenshots, compliance, and submission.",
    price: "$299 one-time",
    turnaround: "5–10 days",
    color: "from-purple-500/20 to-purple-500/5 border-purple-500/20",
  },
];

const statusConfig = {
  pending: { label: "Pending", className: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20" },
  in_review: { label: "In Review", className: "bg-blue-400/10 text-blue-400 border-blue-400/20" },
  in_progress: { label: "In Progress", className: "bg-primary/10 text-primary border-primary/20" },
  completed: { label: "Completed", className: "bg-green-400/10 text-green-400 border-green-400/20" },
  cancelled: { label: "Cancelled", className: "bg-muted/30 text-muted-foreground border-muted/20" },
};

function AuthenticatedServices() {
  const { data: requests, isLoading } = useListServiceRequests();
  const { data: repos } = useListRepositories();
  const createMutation = useCreateServiceRequest();
  const qc = useQueryClient();
  const [requested, setRequested] = useState<string | null>(null);

  const handleRequest = (serviceType: typeof services[0]["key"]) => {
    const firstRepo = repos?.[0];
    createMutation.mutate(
      { data: { serviceType, repositoryId: firstRepo?.id, description: `Request for ${serviceType}` } },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListServiceRequestsQueryKey() });
          setRequested(serviceType);
          setTimeout(() => setRequested(null), 3000);
        },
      }
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
        {services.map(({ key, icon: Icon, title, description, price, turnaround, color }) => (
          <Card key={key} className={`border bg-gradient-to-br ${color} bg-card/20 flex flex-col`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <Icon className="w-5 h-5 text-primary shrink-0" />
                    <CardTitle className="text-base">{title}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
              <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {turnaround}</span>
                <span className="font-semibold text-foreground">{price}</span>
              </div>
              <Button
                className="w-full"
                variant={requested === key ? "outline" : "default"}
                disabled={createMutation.isPending && createMutation.variables?.data?.serviceType === key}
                onClick={() => handleRequest(key)}
              >
                {requested === key ? (
                  <><CheckCircle2 className="w-4 h-4 mr-2 text-green-400" /> Request Submitted</>
                ) : createMutation.isPending && createMutation.variables?.data?.serviceType === key ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                ) : (
                  `Request ${title}`
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Your Requests</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-secondary/30 animate-pulse" />)}
          </div>
        ) : !Array.isArray(requests) || requests.length === 0 ? (
          <div className="border border-border/40 rounded-xl p-8 text-center text-sm text-muted-foreground">
            No service requests yet. Submit one above to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {(Array.isArray(requests) ? requests : []).map((req) => {
              const cfg = statusConfig[req.status as keyof typeof statusConfig] ?? statusConfig.pending;
              const svc = services.find(s => s.key === req.serviceType);
              return (
                <div key={req.id} className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card/20">
                  <div>
                    <div className="font-medium text-sm">{svc?.title ?? req.serviceType}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-xs ${cfg.className}`}>{cfg.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function GuestServices() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
        {services.map(({ key, icon: Icon, title, description, price, turnaround, color }) => (
          <Card key={key} className={`border bg-gradient-to-br ${color} bg-card/20 flex flex-col`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <Icon className="w-5 h-5 text-primary shrink-0" />
                    <CardTitle className="text-base">{title}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
              <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {turnaround}</span>
                <span className="font-semibold text-foreground">{price}</span>
              </div>
              <Button className="w-full" asChild>
                <Link href="/sign-up">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
        <h3 className="font-semibold text-lg mb-2">Ready to launch your app?</h3>
        <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
          Create a free account to submit a service request and track your deployment progress.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/sign-up">Create Free Account</Link>
          </Button>
          <Button asChild variant="outline" className="border-border/40">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    </>
  );
}

export default function Services() {
  const { isSignedIn } = useUser();

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Concierge Services</h1>
          <p className="text-muted-foreground text-sm">Expert engineers handle your deployment so you don&apos;t have to.</p>
        </div>

        {isSignedIn ? <AuthenticatedServices /> : <GuestServices />}
      </div>
    </AppLayout>
  );
}
