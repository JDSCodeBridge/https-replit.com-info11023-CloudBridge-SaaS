export default function VariantA() {
  return (
    <div className="min-h-screen flex flex-col bg-[hsl(230,40%,6%)] text-[hsl(210,40%,98%)]" style={{ fontFamily: "'Outfit', sans-serif" }}>

      {/* Nav */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/5 backdrop-blur-md sticky top-0 z-50 bg-[hsl(230,40%,6%)]/80">
        <div className="bg-white rounded-lg px-2.5 py-1.5 flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[hsl(190,90%,50%)] flex items-center justify-center">
            <span className="text-[hsl(230,40%,6%)] text-[10px] font-black">CL</span>
          </div>
          <span className="text-[hsl(230,40%,10%)] text-sm font-bold tracking-tight">CloudLift</span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-[hsl(215,20%,55%)]">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
          <a href="#" className="hover:text-white transition-colors">Services</a>
        </nav>
        <div className="flex gap-3 items-center">
          <a href="#" className="text-sm font-medium text-[hsl(215,20%,55%)] hover:text-white transition-colors">Sign In</a>
          <a href="#" className="inline-flex items-center h-9 px-5 rounded-lg bg-[hsl(190,90%,50%)] text-[hsl(230,40%,6%)] text-sm font-semibold shadow-[0_0_20px_hsla(190,90%,50%,0.35)] hover:shadow-[0_0_28px_hsla(190,90%,50%,0.5)] transition-all">
            Start Launching
          </a>
        </div>
      </header>

      <main className="flex-1 flex flex-col">

        {/* Hero */}
        <section className="relative flex flex-col items-center text-center px-6 pt-20 pb-24 overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[hsl(190,90%,50%)] opacity-[0.07] blur-[100px] rounded-full" />
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[hsl(270,70%,60%)] opacity-[0.05] blur-[80px] rounded-full" />
            {/* Dot grid */}
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage: 'radial-gradient(circle, hsl(210,40%,80%) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(230,40%,10%)] border border-[hsl(190,90%,50%)]/20 text-xs font-medium text-[hsl(190,90%,65%)] mb-10 shadow-[0_0_12px_hsla(190,90%,50%,0.1)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(190,90%,50%)] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[hsl(190,90%,50%)]" />
            </span>
            CloudLift AI V2 is now live · 500+ apps deployed
          </div>

          {/* Headline */}
          <h1 className="text-[68px] font-black tracking-[-0.03em] leading-[1.05] max-w-3xl mb-6">
            The{" "}
            <span style={{
              backgroundImage: 'linear-gradient(135deg, hsl(190,90%,55%) 0%, hsl(270,70%,65%) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>TurboTax</span>
            {" "}for{" "}
            <br />App Deployment.
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-[hsl(215,20%,60%)] max-w-xl mb-3 leading-relaxed font-light">
            Built an AI app but don't know how to deploy it? CloudLift analyzes your repo,
            fixes your env variables, and ships to production — no DevOps needed.
          </p>

          {/* Social proof line */}
          <p className="text-xs text-[hsl(215,20%,40%)] mb-10">
            Trusted by 500+ founders shipping on AWS, GCP, Azure & DigitalOcean
          </p>

          {/* CTAs */}
          <div className="flex gap-3 items-center">
            <a href="#" className="inline-flex items-center h-13 px-8 rounded-xl bg-white text-[hsl(230,40%,8%)] text-base font-semibold hover:bg-white/90 transition-all shadow-lg">
              Deploy Your First App
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
            </a>
            <a href="#" className="inline-flex items-center h-13 px-8 rounded-xl bg-white/5 border border-white/10 text-base font-medium text-[hsl(215,20%,70%)] hover:bg-white/8 hover:border-white/15 transition-all backdrop-blur-sm">
              View Concierge Services
            </a>
          </div>
        </section>

        {/* Features */}
        <section className="px-8 py-20 max-w-5xl mx-auto w-full">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest text-[hsl(190,90%,50%)] uppercase mb-3">How it works</p>
            <h2 className="text-[38px] font-bold tracking-tight mb-4">
              From repo to production in{" "}
              <span style={{
                backgroundImage: 'linear-gradient(135deg, hsl(190,90%,55%) 0%, hsl(270,70%,65%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>minutes</span>
            </h2>
            <p className="text-[hsl(215,20%,55%)] max-w-md mx-auto text-sm">No DevOps degree required. CloudLift handles the complexity so you can focus on building.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: "🔍",
                color: "hsl(190,90%,50%)",
                colorBg: "hsla(190,90%,50%,0.08)",
                border: "hsla(190,90%,50%,0.15)",
                title: "AI Repo Analysis",
                desc: "Connect your GitHub repo and get an instant deployment readiness score with specific, actionable recommendations.",
                num: "01",
              },
              {
                icon: "🚀",
                color: "hsl(270,70%,65%)",
                colorBg: "hsla(270,70%,65%,0.08)",
                border: "hsla(270,70%,65%,0.15)",
                title: "One-Click Deploy",
                desc: "Follow our step-by-step wizard to deploy to AWS, GCP, Azure, or DigitalOcean — no cloud expertise needed.",
                num: "02",
              },
              {
                icon: "🛡️",
                color: "hsl(142,70%,50%)",
                colorBg: "hsla(142,70%,50%,0.08)",
                border: "hsla(142,70%,50%,0.15)",
                title: "Concierge Service",
                desc: "Hand it off to our engineers for 24–48 hour fully-managed deployment with post-launch support included.",
                num: "03",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-6 relative overflow-hidden group cursor-default hover:scale-[1.01] transition-transform"
                style={{
                  background: `linear-gradient(135deg, hsl(230,40%,9%) 0%, hsl(230,40%,8%) 100%)`,
                  border: `1px solid ${f.border}`,
                }}
              >
                <div className="absolute top-4 right-4 text-4xl font-black opacity-[0.06]" style={{ color: f.color }}>{f.num}</div>
                <div
                  className="inline-flex w-11 h-11 rounded-xl items-center justify-center text-xl mb-5"
                  style={{ background: f.colorBg, border: `1px solid ${f.border}` }}
                >
                  {f.icon}
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-[hsl(215,20%,52%)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-7 bg-[hsl(230,40%,5%)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-md px-2 py-1 flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-[hsl(190,90%,50%)] flex items-center justify-center">
                <span className="text-[hsl(230,40%,6%)] text-[8px] font-black">CL</span>
              </div>
              <span className="text-[hsl(230,40%,10%)] text-xs font-bold">CloudLift</span>
            </div>
            <span className="text-xs text-[hsl(215,20%,35%)]">© 2026 CloudLift. All rights reserved.</span>
          </div>
          <nav className="flex gap-6 text-xs text-[hsl(215,20%,40%)]">
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">Services</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
