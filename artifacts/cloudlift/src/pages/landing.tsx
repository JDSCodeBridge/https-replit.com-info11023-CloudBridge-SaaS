import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

export default function Landing() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary/30">
      <header className="flex items-center justify-between px-8 py-5 border-b border-border/50 backdrop-blur-md sticky top-0 z-50">
        <Link href="/">
          <Logo size="lg" />
        </Link>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors cursor-pointer">Features</a>
          <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/services" className="hover:text-foreground transition-colors">Services</Link>
        </nav>
        <div className="flex gap-4">
          <Link href="/sign-in" className="text-sm font-medium hover:text-primary transition-colors flex items-center">
            Sign In
          </Link>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-[0_0_20px_rgba(0,240,255,0.3)]">
            <Link href="/sign-up">Start Launching</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero */}
        <section className="relative flex flex-col items-center text-center px-4 pt-32 pb-40 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-muted-foreground mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            CodeBridge AI V2 is now live
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter max-w-4xl leading-[1.1] mb-6">
            Build with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">AI.</span>
            <br />Launch Anywhere.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed font-light">
            Your AI-built app deserves a real production home. CodeBridge analyzes your repo, fixes your config, and ships to AWS, Azure, GCP, or DigitalOcean — without the DevOps headache.
          </p>

          <div className="flex gap-4 items-center">
            <Button size="lg" asChild className="text-lg px-8 bg-foreground text-background hover:bg-foreground/90 font-semibold h-14">
              <Link href="/sign-up">Deploy Your First App</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 h-14 border-border/50 bg-secondary/50 backdrop-blur-sm">
              <Link href="/services">View Concierge Services</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-8 py-24 max-w-6xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
              From repo to production in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">minutes</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">No DevOps degree required. CodeBridge handles the complexity so you can focus on building.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "🔍", title: "AI Repo Analysis", desc: "Connect your GitHub repo and get an instant deployment readiness score with specific, actionable recommendations." },
              { icon: "🚀", title: "One-Click Deploy", desc: "Follow our step-by-step wizard to deploy to AWS, GCP, Azure, or DigitalOcean — no cloud expertise needed." },
              { icon: "🛡️", title: "Concierge Service", desc: "Hand it off to our engineers for 24–48 hour fully-managed deployment with post-launch support included." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-border/40 bg-card/20 p-6">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 px-8 py-8 bg-card/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-xs text-muted-foreground">© 2026 CodeBridge. All rights reserved.</span>
          </div>
          <nav className="flex gap-6 text-xs text-muted-foreground">
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/services" className="hover:text-foreground transition-colors">Services</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
