function AnalysisCard() {
  return (
    <div
      className="relative mx-auto max-w-xl rounded-2xl overflow-hidden"
      style={{
        background: 'hsl(230,40%,9%)',
        border: '1px solid hsla(190,90%,50%,0.2)',
        boxShadow: '0 0 60px hsla(190,90%,50%,0.08), 0 24px 48px rgba(0,0,0,0.4)',
      }}
    >
      {/* Terminal-style top bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[hsl(230,40%,7%)]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-[11px] text-[hsl(215,20%,40%)] font-mono">cloudlift analyze</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3.5">
        {/* Repo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[hsl(230,40%,13%)] flex items-center justify-center border border-white/5">
            <svg className="w-4 h-4 text-[hsl(215,20%,55%)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium">user-dashboard-v2</div>
            <div className="text-xs text-[hsl(215,20%,45%)]">main · 48 files · React + Node.js</div>
          </div>
          <div className="ml-auto text-[10px] text-[hsl(190,90%,60%)] font-medium bg-[hsl(190,90%,50%)]/10 px-2 py-0.5 rounded-full border border-[hsl(190,90%,50%)]/20">
            Analyzing…
          </div>
        </div>

        {/* Score */}
        <div className="rounded-xl bg-[hsl(230,40%,7%)] border border-white/5 p-4">
          <div className="flex items-end justify-between mb-2">
            <span className="text-xs text-[hsl(215,20%,45%)] font-medium">Deployment Readiness</span>
            <span className="text-2xl font-black text-[hsl(190,90%,55%)]">87<span className="text-sm text-[hsl(215,20%,45%)] font-normal">/100</span></span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-[hsl(230,40%,13%)] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: '87%',
                background: 'linear-gradient(90deg, hsl(190,90%,50%), hsl(142,70%,50%))',
              }}
            />
          </div>
        </div>

        {/* Issues */}
        <div className="space-y-2">
          {[
            { type: "warn", msg: "Missing DATABASE_URL in production env" },
            { type: "warn", msg: "No Dockerfile detected — will auto-generate" },
            { type: "ok",   msg: "Build command detected: npm run build" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.type === "ok" ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                {item.type === "ok"
                  ? <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                  : <span className="text-[9px] font-bold">!</span>
                }
              </div>
              <span className={item.type === "ok" ? "text-[hsl(215,20%,60%)]" : "text-[hsl(215,20%,60%)]"}>{item.msg}</span>
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div className="pt-1">
          <button
            className="w-full h-10 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, hsl(190,90%,50%) 0%, hsl(270,70%,65%) 100%)',
              color: 'hsl(230,40%,6%)',
              boxShadow: '0 0 20px hsla(190,90%,50%,0.3)',
            }}
          >
            Fix Issues & Deploy →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VariantB() {
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
        <section className="relative px-6 pt-16 pb-0 overflow-hidden">
          {/* Glow */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[hsl(190,90%,50%)] opacity-[0.06] blur-[120px] rounded-full" />
          </div>

          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(230,40%,10%)] border border-[hsl(190,90%,50%)]/20 text-xs font-medium text-[hsl(190,90%,65%)] mb-9">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(190,90%,50%)] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[hsl(190,90%,50%)]" />
              </span>
              CloudLift AI V2 is now live
            </div>

            <h1 className="text-[68px] font-black tracking-[-0.03em] leading-[1.05] max-w-3xl mx-auto mb-6">
              The{" "}
              <span style={{
                backgroundImage: 'linear-gradient(135deg, hsl(190,90%,55%) 0%, hsl(270,70%,65%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>TurboTax</span>
              {" "}for <br/>App Deployment.
            </h1>

            <p className="text-lg text-[hsl(215,20%,60%)] max-w-lg mx-auto mb-8 leading-relaxed font-light">
              Built an AI app but don't know how to deploy it? CloudLift analyzes your repo, fixes your config, and ships to production — without the DevOps headache.
            </p>

            <div className="flex gap-3 items-center justify-center mb-12">
              <a href="#" className="inline-flex items-center h-12 px-8 rounded-xl bg-white text-[hsl(230,40%,8%)] text-sm font-semibold hover:bg-white/90 transition-all shadow-lg">
                Deploy Your First App
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
              </a>
              <a href="#" className="inline-flex items-center h-12 px-8 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-[hsl(215,20%,70%)] hover:bg-white/8 transition-all">
                View Concierge Services
              </a>
            </div>

            {/* Provider trust bar */}
            <div className="flex items-center justify-center gap-2 mb-12">
              <span className="text-xs text-[hsl(215,20%,35%)]">Deploys to</span>
              {["AWS", "Google Cloud", "Azure", "DigitalOcean"].map((p) => (
                <span key={p} className="inline-flex items-center h-6 px-2.5 rounded-md bg-white/5 border border-white/8 text-[11px] text-[hsl(215,20%,45%)] font-medium">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Analysis card visual */}
          <div className="relative max-w-lg mx-auto">
            {/* Fade bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[hsl(230,40%,6%)] to-transparent z-10" />
            <AnalysisCard />
          </div>
        </section>

        {/* Features as steps */}
        <section className="px-8 pt-20 pb-20 max-w-5xl mx-auto w-full">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest text-[hsl(190,90%,50%)] uppercase mb-3">How it works</p>
            <h2 className="text-[36px] font-bold tracking-tight">
              From repo to production in{" "}
              <span style={{
                backgroundImage: 'linear-gradient(135deg, hsl(190,90%,55%) 0%, hsl(270,70%,65%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>3 steps</span>
            </h2>
          </div>

          <div className="relative grid md:grid-cols-3 gap-0">
            {/* Connector line */}
            <div className="hidden md:block absolute top-9 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-[hsl(190,90%,50%)]/30 via-[hsl(270,70%,65%)]/30 to-[hsl(142,70%,50%)]/30" />

            {[
              { num: "1", color: "hsl(190,90%,50%)", bg: "hsla(190,90%,50%,0.1)", border: "hsla(190,90%,50%,0.2)", title: "Connect GitHub", desc: "Link your repo in 30 seconds. CloudLift reads your code and identifies your stack automatically." },
              { num: "2", color: "hsl(270,70%,65%)", bg: "hsla(270,70%,65%,0.1)", border: "hsla(270,70%,65%,0.2)", title: "Get AI Analysis", desc: "Receive a deployment readiness score with specific fixes for env vars, build config, and infrastructure needs." },
              { num: "3", color: "hsl(142,70%,50%)", bg: "hsla(142,70%,50%,0.1)", border: "hsla(142,70%,50%,0.2)", title: "Deploy or Delegate", desc: "Self-deploy with our wizard, or hand off to our engineers for a done-for-you 24–48hr managed launch." },
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center px-6">
                <div
                  className="w-[54px] h-[54px] rounded-2xl flex items-center justify-center text-xl font-black mb-5 relative z-10"
                  style={{ background: step.bg, border: `1px solid ${step.border}`, color: step.color }}
                >
                  {step.num}
                </div>
                <h3 className="font-semibold text-base mb-2">{step.title}</h3>
                <p className="text-sm text-[hsl(215,20%,50%)] leading-relaxed">{step.desc}</p>
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
