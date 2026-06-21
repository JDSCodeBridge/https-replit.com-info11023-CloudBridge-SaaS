import { useState } from "react";
import AppLayout from "./layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle, XCircle, Clock, Trash2, RefreshCw,
  ChevronDown, ChevronUp, Cloud, AlertCircle, DollarSign,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

type CloudAccount = {
  id: number;
  provider: string;
  status: "pending" | "connected" | "invalid" | "expired";
  accountLabel: string | null;
  lastValidatedAt: string | null;
  validationError: string | null;
  createdAt: string;
  updatedAt: string;
};

// ── API hooks ──────────────────────────────────────────────────────────────

function useCloudAccounts() {
  return useQuery<CloudAccount[]>({
    queryKey: ["/api/cloud-accounts"],
    queryFn: () => fetch("/api/cloud-accounts").then(r => r.json()),
  });
}

function useConnectAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { provider: string; credentials: Record<string, string> }) =>
      fetch("/api/cloud-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/cloud-accounts"] }),
  });
}

function useValidateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/cloud-accounts/${id}/validate`, { method: "POST" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/cloud-accounts"] }),
  });
}

function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/cloud-accounts/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/cloud-accounts"] }),
  });
}

// ── Provider config ────────────────────────────────────────────────────────

type FieldDef = { key: string; label: string; placeholder: string; type?: "textarea" | "text" | "password" };

type PricingTier = {
  label: string;
  price: string;
  note: string;
};

type ProviderDef = {
  id: string;
  name: string;
  logo: string;
  color: string;
  description: string;
  docsUrl: string;
  fields: FieldDef[];
  guide: string[];
  pricing: {
    badge?: string;
    badgeColor?: string;
    starting: string;
    tiers: PricingTier[];
    freeTier?: string;
    pricingUrl: string;
  };
};

const PROVIDERS: ProviderDef[] = [
  {
    id: "digitalocean",
    name: "DigitalOcean",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/ff/DigitalOcean_logo.svg",
    color: "text-blue-400",
    description: "Deploy to App Platform, Droplets, or Kubernetes",
    docsUrl: "https://docs.digitalocean.com/reference/api/create-personal-access-token/",
    fields: [
      { key: "token", label: "Personal Access Token", placeholder: "dop_v1_...", type: "password" },
    ],
    guide: [
      "Go to DigitalOcean Console → API → Tokens",
      "Click 'Generate New Token'",
      "Give it a name (e.g. 'CodeBridge') and enable Read + Write scope",
      "Copy the token — it's only shown once",
    ],
    pricing: {
      badge: "Best Value",
      badgeColor: "bg-green-500/15 text-green-400 border-green-500/30",
      starting: "from $5/mo",
      freeTier: "$200 free credit for 60 days",
      pricingUrl: "https://www.digitalocean.com/pricing",
      tiers: [
        { label: "Static site", price: "Free", note: "HTML/CSS/JS, no backend" },
        { label: "App Platform Basic", price: "$5/mo", note: "1 container, 512MB RAM" },
        { label: "App Platform Pro", price: "$12/mo", note: "1 vCPU, 1GB RAM — most AI apps" },
        { label: "Managed Database", price: "+$15/mo", note: "PostgreSQL, MySQL, Redis" },
      ],
    },
  },
  {
    id: "aws",
    name: "Amazon Web Services",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
    color: "text-orange-400",
    description: "Deploy to EC2, App Runner, or Elastic Beanstalk",
    docsUrl: "https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html",
    fields: [
      { key: "accessKeyId", label: "Access Key ID", placeholder: "AKIAIOSFODNN7EXAMPLE" },
      { key: "secretAccessKey", label: "Secret Access Key", placeholder: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY", type: "password" },
      { key: "region", label: "Default Region", placeholder: "us-east-1" },
    ],
    guide: [
      "Go to AWS Console → IAM → Users",
      "Create a new IAM user with programmatic access",
      "Attach the policy: AmazonEC2FullAccess (or a custom deployment policy)",
      "Copy the Access Key ID and Secret Access Key",
    ],
    pricing: {
      badge: "Most Powerful",
      badgeColor: "bg-orange-500/15 text-orange-400 border-orange-500/30",
      starting: "from $8/mo",
      freeTier: "12 months free tier (t2.micro EC2)",
      pricingUrl: "https://aws.amazon.com/pricing/",
      tiers: [
        { label: "EC2 t3.micro", price: "~$8/mo", note: "1 vCPU, 1GB RAM, free tier eligible" },
        { label: "App Runner", price: "~$15–40/mo", note: "Fully managed, scales to zero" },
        { label: "Elastic Beanstalk", price: "~$20–50/mo", note: "Auto-scaling web apps" },
        { label: "RDS (PostgreSQL)", price: "+$25/mo", note: "Managed relational database" },
      ],
    },
  },
  {
    id: "gcp",
    name: "Google Cloud",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg",
    color: "text-red-400",
    description: "Deploy to Cloud Run, GKE, or App Engine",
    docsUrl: "https://cloud.google.com/iam/docs/creating-managing-service-accounts",
    fields: [
      { key: "projectId", label: "Project ID", placeholder: "my-gcp-project-123456" },
      { key: "serviceAccountJson", label: "Service Account JSON Key", placeholder: '{\n  "type": "service_account",\n  "project_id": "...",\n  ...\n}', type: "textarea" },
    ],
    guide: [
      "Go to GCP Console → IAM & Admin → Service Accounts",
      "Create a new service account named 'codebridge-deployer'",
      "Grant the role: Editor (or Cloud Run Admin + Storage Admin for minimal access)",
      "Click '⋮' → Manage Keys → Add Key → JSON",
      "Paste the downloaded JSON file content into the field below",
    ],
    pricing: {
      badge: "Best for AI/ML",
      badgeColor: "bg-red-500/15 text-red-400 border-red-500/30",
      starting: "from $0/mo",
      freeTier: "$300 free credit for 90 days",
      pricingUrl: "https://cloud.google.com/pricing",
      tiers: [
        { label: "Cloud Run", price: "$0–10/mo", note: "Pay per request, scales to zero" },
        { label: "App Engine Standard", price: "~$5–20/mo", note: "Managed runtime, auto-scales" },
        { label: "GKE Autopilot", price: "~$15–40/mo", note: "Managed Kubernetes" },
        { label: "Cloud SQL", price: "+$20/mo", note: "Managed PostgreSQL/MySQL" },
      ],
    },
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg",
    color: "text-sky-400",
    description: "Deploy to App Service, Container Apps, or AKS",
    docsUrl: "https://learn.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal",
    fields: [
      { key: "tenantId", label: "Tenant ID", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
      { key: "clientId", label: "Client ID (App ID)", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
      { key: "clientSecret", label: "Client Secret", placeholder: "your-client-secret-value", type: "password" },
      { key: "subscriptionId", label: "Subscription ID", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
    ],
    guide: [
      "Go to Azure Portal → Azure Active Directory → App registrations",
      "Click 'New registration', name it 'CodeBridge'",
      "Under 'Certificates & secrets', create a new client secret",
      "Go to Subscriptions → your subscription → Access control (IAM)",
      "Add the app as 'Contributor' on your subscription",
      "Copy Tenant ID, Client ID, Client Secret, and Subscription ID",
    ],
    pricing: {
      badge: "Best for Teams",
      badgeColor: "bg-sky-500/15 text-sky-400 border-sky-500/30",
      starting: "from $13/mo",
      freeTier: "$200 free credit for 30 days",
      pricingUrl: "https://azure.microsoft.com/en-us/pricing/",
      tiers: [
        { label: "App Service B1", price: "~$13/mo", note: "1 vCPU, 1.75GB RAM" },
        { label: "Container Apps", price: "$0–15/mo", note: "Consumption-based, scales to zero" },
        { label: "App Service P1v3", price: "~$55/mo", note: "2 vCPU, 8GB RAM, production" },
        { label: "Azure SQL", price: "+$25/mo", note: "Managed SQL database" },
      ],
    },
  },
];

// ── Subcomponents ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CloudAccount["status"] | "pending" }) {
  if (status === "connected") return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-400">
      <CheckCircle className="w-3.5 h-3.5" /> Connected
    </span>
  );
  if (status === "invalid") return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400">
      <XCircle className="w-3.5 h-3.5" /> Invalid
    </span>
  );
  if (status === "expired") return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-yellow-400">
      <AlertCircle className="w-3.5 h-3.5" /> Expired
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <Clock className="w-3.5 h-3.5" /> Not connected
    </span>
  );
}

function ProviderCard({
  provider,
  account,
}: {
  provider: ProviderDef;
  account: CloudAccount | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const connect = useConnectAccount();
  const validate = useValidateAccount();
  const remove = useDeleteAccount();

  const setField = (key: string, val: string) =>
    setFields(prev => ({ ...prev, [key]: val }));

  const handleConnect = async () => {
    const missing = provider.fields.filter(f => !fields[f.key]?.trim());
    if (missing.length) {
      toast({ title: "Missing fields", description: missing.map(f => f.label).join(", "), variant: "destructive" });
      return;
    }
    const result = await connect.mutateAsync({ provider: provider.id, credentials: fields });
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
      return;
    }
    // Auto-validate immediately after saving
    const val = await validate.mutateAsync(result.id);
    if (val.validationResult?.ok) {
      toast({ title: "Connected!", description: val.accountLabel ?? "Credentials validated successfully." });
      setOpen(false);
      setFields({});
    } else {
      toast({ title: "Credentials saved but validation failed", description: val.validationResult?.error ?? "Check your credentials.", variant: "destructive" });
    }
  };

  const handleRevalidate = async () => {
    if (!account) return;
    const val = await validate.mutateAsync(account.id);
    if (val.validationResult?.ok) {
      toast({ title: "Still valid!", description: val.accountLabel ?? "Credentials are working." });
    } else {
      toast({ title: "Validation failed", description: val.validationResult?.error, variant: "destructive" });
    }
  };

  const handleRemove = async () => {
    if (!account) return;
    if (!confirm(`Remove ${provider.name} connection? You can reconnect at any time.`)) return;
    await remove.mutateAsync(account.id);
    toast({ title: "Removed", description: `${provider.name} disconnected.` });
  };

  const isBusy = connect.isPending || validate.isPending || remove.isPending;
  const isConnected = account?.status === "connected";

  const [showPricing, setShowPricing] = useState(false);

  return (
    <div className="rounded-xl border border-border/40 bg-card/20 overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-background border border-border/40 flex items-center justify-center p-2 shrink-0">
            <img src={provider.logo} alt={provider.name} className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{provider.name}</span>
              {provider.pricing.badge && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${provider.pricing.badgeColor}`}>
                  {provider.pricing.badge}
                </span>
              )}
              <StatusBadge status={account?.status ?? "pending"} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{provider.description}</p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-400">
                <DollarSign className="w-3 h-3" />{provider.pricing.starting}
              </span>
              {provider.pricing.freeTier && (
                <span className="text-[11px] text-primary/80 bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full">
                  🎁 {provider.pricing.freeTier}
                </span>
              )}
              <button
                onClick={() => setShowPricing(p => !p)}
                className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              >
                {showPricing ? "Hide pricing" : "See pricing breakdown"}
              </button>
            </div>
            {account?.accountLabel && (
              <p className="text-xs text-primary mt-0.5">{account.accountLabel}</p>
            )}
            {account?.status === "invalid" && account.validationError && (
              <p className="text-xs text-red-400 mt-0.5 max-w-sm truncate">{account.validationError}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {account && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                onClick={handleRevalidate}
                disabled={isBusy}
              >
                <RefreshCw className={`w-3 h-3 ${validate.isPending ? "animate-spin" : ""}`} />
                Re-check
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1.5"
                onClick={handleRemove}
                disabled={isBusy}
              >
                <Trash2 className="w-3 h-3" />
                Remove
              </Button>
            </>
          )}
          <Button
            variant={isConnected ? "outline" : "default"}
            size="sm"
            className="h-7 text-xs px-3"
            onClick={() => setOpen(o => !o)}
          >
            {isConnected ? "Update" : "Connect"}
            {open ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
          </Button>
        </div>
      </div>

      {/* Pricing breakdown */}
      {showPricing && (
        <div className="border-t border-border/30 px-5 py-4 bg-card/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-foreground">Pricing Breakdown</span>
            <a
              href={provider.pricing.pricingUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-primary hover:underline"
            >
              Official pricing ↗
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {provider.pricing.tiers.map((tier) => (
              <div key={tier.label} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-background/40 border border-border/30">
                <div>
                  <div className="text-xs font-medium">{tier.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{tier.note}</div>
                </div>
                <span className="text-xs font-bold text-green-400 shrink-0 whitespace-nowrap">{tier.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expandable form */}
      {open && (
        <div className="border-t border-border/30 px-5 py-4 space-y-4 bg-card/10">
          {/* Step guide */}
          <div>
            <button
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mb-2"
              onClick={() => setShowGuide(g => !g)}
            >
              {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              How to get credentials
              <a
                href={provider.docsUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-2 text-primary hover:underline"
                onClick={e => e.stopPropagation()}
              >
                Official docs ↗
              </a>
            </button>
            {showGuide && (
              <ol className="space-y-1 pl-1">
                {provider.guide.map((step, i) => (
                  <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                    <span className="text-primary font-semibold shrink-0">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Credential fields */}
          <div className="space-y-3">
            {provider.fields.map(f => (
              <div key={f.key}>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{f.label}</label>
                {f.type === "textarea" ? (
                  <Textarea
                    value={fields[f.key] ?? ""}
                    onChange={e => setField(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    rows={6}
                    className="text-xs font-mono bg-secondary/20 resize-y"
                  />
                ) : (
                  <Input
                    type={f.type === "password" ? "password" : "text"}
                    value={fields[f.key] ?? ""}
                    onChange={e => setField(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="text-xs font-mono bg-secondary/20 h-8"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button
              size="sm"
              className="h-8 text-xs px-4"
              onClick={handleConnect}
              disabled={isBusy}
            >
              {isBusy ? (
                <><RefreshCw className="w-3 h-3 mr-1.5 animate-spin" /> Saving & validating…</>
              ) : (
                "Save & Validate"
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => { setOpen(false); setFields({}); }}
            >
              Cancel
            </Button>
            <p className="text-[11px] text-muted-foreground ml-auto">
              Credentials are encrypted with AES-256-GCM
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function CloudAccounts() {
  const { data: accounts, isLoading } = useCloudAccounts();

  const connected = (Array.isArray(accounts) ? accounts : []).filter(a => a.status === "connected").length;

  const accountByProvider = (providerId: string) =>
    (Array.isArray(accounts) ? accounts : []).find(a => a.provider === providerId);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Cloud className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Cloud Accounts</h1>
            {!isLoading && (
              <span className="text-xs font-medium bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                {connected} / {PROVIDERS.length} connected
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Connect your cloud provider accounts. Credentials are encrypted at rest and used only for deployment automation.
          </p>
        </div>

        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 mb-6 flex gap-3">
          <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-300/80 leading-relaxed">
            <span className="font-semibold text-yellow-300">CloudLift is in early access.</span>{" "}
            For Launch ($149) and Apple ($299) packages, your deployment is handled manually by the CloudLift team — you don't need to connect a cloud account unless you're on the Pro self-serve plan.
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 rounded-xl border border-border/40 bg-card/20 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {PROVIDERS.map(p => (
              <ProviderCard
                key={p.id}
                provider={p}
                account={accountByProvider(p.id)}
              />
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Don't want to manage cloud accounts yourself?{" "}
            <a href="/services" className="text-primary hover:underline">
              Request concierge deployment →
            </a>
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
