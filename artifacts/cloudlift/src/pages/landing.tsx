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

        {/* How it works */}
        <section className="px-8 py-20 bg-card/10 border-y border-border/30 w-full">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">How it works</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
                From GitHub to live in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">three steps</span>
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
                No DevOps knowledge required. We handle the complexity so you can stay focused on your product.
              </p>
            </div>

            <div className="relative">
              {/* Connector line (desktop) */}
              <div className="hidden md:block absolute top-10 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-primary/40 via-accent/40 to-green-400/40" />

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    num: "01",
                    icon: "🔗",
                    title: "Connect your repo",
                    desc: "Paste your GitHub repo URL. CodeBridge pulls your code and runs an instant AI readiness check — framework, environment variables, build config.",
                    color: "border-primary/30 bg-primary/5",
                    dot: "bg-primary",
                  },
                  {
                    num: "02",
                    icon: "⚡",
                    title: "Get your readiness score",
                    desc: "Receive a deployment score out of 100 with specific issues flagged — missing Dockerfiles, exposed secrets, wrong port bindings, and more.",
                    color: "border-accent/30 bg-accent/5",
                    dot: "bg-accent",
                  },
                  {
                    num: "03",
                    icon: "🚀",
                    title: "Deploy or hand it off",
                    desc: "Follow the guided wizard to self-deploy, or pay once and let our engineers handle everything end-to-end within 24–48 hours.",
                    color: "border-green-400/30 bg-green-400/5",
                    dot: "bg-green-400",
                  },
                ].map((s) => (
                  <div key={s.num} className={`relative rounded-2xl border ${s.color} p-6 flex flex-col`}>
                    <div className={`absolute -top-2.5 left-6 w-5 h-5 rounded-full border-2 border-background ${s.dot} hidden md:block`} />
                    <div className="text-3xl mb-4">{s.icon}</div>
                    <div className="text-[10px] font-bold text-muted-foreground tracking-widest mb-1.5">STEP {s.num}</div>
                    <h3 className="font-semibold text-base mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 text-center">
              <Link href="/sign-up">
                <button className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                  Start your first deployment — it&apos;s free
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </Link>
            </div>
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
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
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
