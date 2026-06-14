import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with your first AI-built app.",
    cta: "Start Free",
    ctaHref: "/sign-up",
    highlighted: false,
    features: ["1 repository", "Basic AI analysis", "Deployment recommendations", "Community support"],
  },
  {
    name: "Pro",
    price: "$49.99",
    period: "per year",
    description: "For builders shipping multiple projects.",
    cta: "Start Pro",
    ctaHref: "/sign-up",
    highlighted: true,
    features: ["Unlimited repositories", "Advanced AI analysis", "Priority recommendations", "Deployment readiness scores", "Email support"],
  },
  {
    name: "Launch Package",
    price: "$149",
    period: "one-time",
    description: "We handle your entire cloud deployment.",
    cta: "Get Started",
    ctaHref: "/services",
    highlighted: false,
    features: ["Everything in Pro", "Expert deployment by our engineers", "24–48 hour turnaround", "AWS, GCP, or DigitalOcean", "Post-launch support"],
  },
  {
    name: "Apple Publishing",
    price: "$299",
    period: "one-time",
    description: "End-to-end App Store submission handled for you.",
    cta: "Get Started",
    ctaHref: "/services",
    highlighted: false,
    features: ["Full App Store submission", "Metadata & screenshots", "Apple compliance review", "Google Play optional add-on", "Revision support"],
  },
];

export default function Pricing() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="flex items-center justify-between px-8 py-5 border-b border-border/40 sticky top-0 bg-background/80 backdrop-blur z-10">
        <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-background" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-bold text-sm tracking-tight">CloudLift</span>
          </Link>
        <div className="flex gap-4">
          <Link href="/sign-in"><a className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</a></Link>
          <Button asChild size="sm" className="bg-primary text-primary-foreground">
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
            Simple, transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">pricing</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From your first deploy to full concierge service — we meet you where you are.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 flex flex-col relative transition-all ${
                plan.highlighted
                  ? "border-primary/40 bg-primary/5 shadow-[0_0_40px_rgba(0,240,255,0.08)]"
                  : "border-border/40 bg-card/20"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  Most Popular
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

              <Button
                asChild
                variant={plan.highlighted ? "default" : "outline"}
                className={`w-full ${plan.highlighted ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border-border/40"}`}
              >
                <Link href={plan.ctaHref} className="flex items-center justify-center gap-2">
                  {plan.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
