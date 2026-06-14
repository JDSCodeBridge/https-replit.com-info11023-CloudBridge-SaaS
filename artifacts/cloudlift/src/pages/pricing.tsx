import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { useUser } from "@clerk/react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const PRICE_IDS = {
  pro: "price_1TiMayK3nLlhDYF4Puom3HuR",
  launch: "price_1TiMayK3nLlhDYF4raZ1Pux3",
  apple: "price_1TiMazK3nLlhDYF4eqMeBeWM",
} as const;

type PriceKey = keyof typeof PRICE_IDS;

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with your first AI-built app.",
    cta: "Start Free",
    action: "signup" as const,
    highlighted: false,
    badge: null,
    features: [
      "1 repository",
      "Basic AI analysis",
      "Deployment recommendations",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$49.99",
    period: "per year",
    description: "For builders shipping multiple projects.",
    cta: "Start Pro",
    action: "checkout" as const,
    priceKey: "pro" as PriceKey,
    highlighted: true,
    badge: "Most Popular",
    features: [
      "Unlimited repositories",
      "Advanced AI analysis",
      "Priority recommendations",
      "Deployment readiness scores",
      "Email support",
    ],
  },
  {
    name: "Deploy My App",
    price: "$149",
    period: "one-time",
    description: "We handle your entire cloud deployment end-to-end.",
    cta: "Get Started",
    action: "checkout" as const,
    priceKey: "launch" as PriceKey,
    highlighted: false,
    badge: null,
    features: [
      "Everything in Pro",
      "Expert deployment by our engineers",
      "24–48 hour turnaround",
      "AWS, GCP, or DigitalOcean",
      "Post-launch support",
    ],
  },
  {
    name: "Apple Publishing",
    price: "$299",
    period: "one-time",
    description: "End-to-end App Store submission handled for you.",
    cta: "Get Started",
    action: "checkout" as const,
    priceKey: "apple" as PriceKey,
    highlighted: false,
    badge: null,
    features: [
      "Full App Store submission",
      "Metadata & screenshots",
      "Apple compliance review",
      "Google Play optional add-on",
      "Revision support",
    ],
  },
];

export default function Pricing() {
  const { isSignedIn, isLoaded } = useUser();
  const [, navigate] = useLocation();
  const [loadingKey, setLoadingKey] = useState<PriceKey | null>(null);
  const { toast } = useToast();

  async function handleCheckout(priceKey: PriceKey) {
    if (!isSignedIn) {
      navigate("/sign-up");
      return;
    }

    setLoadingKey(priceKey);
    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          priceId: PRICE_IDS[priceKey],
          successUrl: `${window.location.origin}/dashboard?checkout=success`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      toast({
        title: "Checkout failed",
        description: err.message ?? "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setLoadingKey(null);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-border/40 sticky top-0 bg-background/80 backdrop-blur z-10">
        <Link href="/">
          <div className="bg-white rounded-lg px-2 py-1 cursor-pointer">
            <img src="/logo.png" alt="CloudLift" className="h-9 w-auto" />
          </div>
        </Link>
        <div className="flex gap-4 items-center">
          {isLoaded && isSignedIn ? (
            <Button asChild size="sm" className="bg-primary text-primary-foreground">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Link href="/sign-in" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Button asChild size="sm" className="bg-primary text-primary-foreground">
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto px-4 py-20 w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
            Simple, transparent{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              pricing
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From your first deploy to full concierge service — we meet you where you are.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => {
            const isLoading = "priceKey" in plan && loadingKey === plan.priceKey;

            return (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 flex flex-col relative transition-all ${
                  plan.highlighted
                    ? "border-primary/40 bg-primary/5 shadow-[0_0_40px_rgba(0,240,255,0.08)]"
                    : "border-border/40 bg-card/20"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-6">
                  <div className="text-sm font-medium text-muted-foreground mb-1">{plan.name}</div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-xs text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                {plan.action === "signup" ? (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-border/40"
                  >
                    <Link href="/sign-up" className="flex items-center justify-center gap-2">
                      {plan.cta} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant={plan.highlighted ? "default" : "outline"}
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border-border/40"
                    }`}
                    disabled={isLoading || !isLoaded}
                    onClick={() => handleCheckout(plan.priceKey)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Redirecting…
                      </>
                    ) : (
                      <>
                        {isLoaded && !isSignedIn ? "Sign up to " : ""}
                        {plan.cta}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-10">
          Payments secured by{" "}
          <span className="text-foreground font-medium">Stripe</span>. Cancel anytime for Pro subscriptions.
        </p>
      </div>

      <footer className="border-t border-border/40 px-8 py-6">
        <div className="max-w-6xl mx-auto flex justify-center gap-6 text-xs text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
