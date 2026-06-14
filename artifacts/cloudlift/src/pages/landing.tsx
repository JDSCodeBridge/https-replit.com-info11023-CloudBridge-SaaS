import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary/30">
      <header className="flex items-center justify-between px-8 py-6 border-b border-border/50 backdrop-blur-md sticky top-0 z-50">
        <div className="bg-white rounded-xl px-3 py-1.5">
          <img src="/logo.png" alt="CodeLift" className="h-10 w-auto" />
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
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
            CloudLift AI V2 is now live
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter max-w-4xl leading-[1.1] mb-6">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">TurboTax</span> for <br/> App Deployment.
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed font-light">
            Built an AI app but don't know how to deploy it? CloudLift automatically analyzes your repo, fixes environment variables, and launches to production with surgical precision.
          </p>
          
          <div className="flex gap-4 items-center">
            <Button size="lg" asChild className="text-lg px-8 bg-foreground text-background hover:bg-foreground/90 font-semibold h-14">
              <Link href="/sign-up">Deploy Your First App</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-border/50 bg-secondary/50 backdrop-blur-sm">
              View Concierge Services
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
