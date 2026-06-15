import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Rocket, GitBranch, Zap, X, ChevronRight, Users, CheckCircle } from "lucide-react";

const STORAGE_KEY = "cloudlift_onboarding_v1";

function isComplete() {
  try { return localStorage.getItem(STORAGE_KEY) === "done"; } catch { return true; }
}
function markComplete() {
  try { localStorage.setItem(STORAGE_KEY, "done"); } catch { /* noop */ }
}

interface StepProps { onNext: () => void; onSkip: () => void; }

function Step1Welcome({ onNext, onSkip }: StepProps) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-5 border border-primary/20">
        <Rocket className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2 tracking-tight">Welcome to CloudLift</h2>
      <p className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto leading-relaxed">
        You&apos;re set up. Let&apos;s walk you through how to get your first app live in three simple steps.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-8 text-left">
        {[
          { icon: GitBranch, color: "text-primary bg-primary/10 border-primary/20", step: "01", label: "Connect GitHub", desc: "Link your repo with a PAT token" },
          { icon: Zap, color: "text-accent bg-accent/10 border-accent/20", step: "02", label: "AI Analysis", desc: "Get a readiness score instantly" },
          { icon: Rocket, color: "text-green-400 bg-green-400/10 border-green-400/20", step: "03", label: "Deploy or delegate", desc: "Self-serve or concierge" },
        ].map(({ icon: Icon, color, step, label, desc }) => (
          <div key={step} className={`rounded-xl border p-4 ${color}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-[10px] font-semibold text-muted-foreground mb-0.5">STEP {step}</div>
            <div className="text-sm font-semibold text-foreground">{label}</div>
            <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Button onClick={onNext} className="w-full">
          Get Started <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        <button onClick={onSkip} className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
          Skip — I&apos;ll explore on my own
        </button>
      </div>
    </div>
  );
}

function Step2GitHub({ onNext, onSkip }: StepProps) {
  const [, navigate] = useLocation();

  const goToSettings = () => {
    markComplete();
    navigate("/settings");
  };

  return (
    <div>
      <div className="w-14 h-14 rounded-2xl bg-secondary/40 flex items-center justify-center mb-5 border border-border/40">
        <GitBranch className="w-7 h-7 text-foreground" />
      </div>
      <h2 className="text-xl font-bold mb-1 tracking-tight">Connect your GitHub</h2>
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
        CloudLift needs a GitHub Personal Access Token to read your repositories and run AI analysis.
      </p>

      <div className="rounded-xl border border-border/40 bg-secondary/10 divide-y divide-border/30 mb-6">
        {[
          { step: "1", text: "Go to GitHub → Settings → Developer settings" },
          { step: "2", text: "Click Personal access tokens → Tokens (classic)" },
          { step: "3", text: 'Click "Generate new token" and check the repo scope' },
          { step: "4", text: 'Copy the token (starts with ghp_) and paste it in CloudLift Settings' },
        ].map(({ step, text }) => (
          <div key={step} className="flex items-start gap-3 px-4 py-3">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{step}</span>
            <span className="text-sm text-muted-foreground leading-relaxed">{text}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Button onClick={goToSettings} className="w-full">
          Go to Settings to connect <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        <Button variant="outline" onClick={onNext} className="w-full border-border/40">
          I already connected it — next
        </Button>
        <button onClick={onSkip} className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
          Skip this step
        </button>
      </div>
    </div>
  );
}

function Step3Path({ onDone }: { onDone: () => void }) {
  const [, navigate] = useLocation();

  return (
    <div>
      <div className="w-14 h-14 rounded-2xl bg-green-400/10 flex items-center justify-center mb-5 border border-green-400/20">
        <CheckCircle className="w-7 h-7 text-green-400" />
      </div>
      <h2 className="text-xl font-bold mb-1 tracking-tight">Choose your path</h2>
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
        Once your repo is analyzed, how do you want to deploy?
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => { onDone(); navigate("/launch"); }}
          className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-left hover:bg-primary/10 hover:border-primary/50 transition-all group"
        >
          <Rocket className="w-6 h-6 text-primary mb-3" />
          <div className="font-semibold text-sm mb-1 text-foreground">Do it myself</div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            Use the Launch Center to deploy to DigitalOcean in ~3 minutes
          </div>
          <div className="text-[10px] text-primary font-medium mt-2 group-hover:underline">Open Launch Center →</div>
        </button>

        <button
          onClick={() => { onDone(); navigate("/services"); }}
          className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-left hover:bg-accent/10 hover:border-accent/50 transition-all group"
        >
          <Users className="w-6 h-6 text-accent mb-3" />
          <div className="font-semibold text-sm mb-1 text-foreground">Let experts do it</div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            Our engineers handle your full deployment for $149+
          </div>
          <div className="text-[10px] text-accent font-medium mt-2 group-hover:underline">Browse services →</div>
        </button>
      </div>

      <Button onClick={onDone} className="w-full">
        All done — take me to my dashboard ✓
      </Button>
    </div>
  );
}

export default function OnboardingWizard() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isComplete()) setShow(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const close = () => { setShow(false); markComplete(); };

  if (!show) return null;

  const totalSteps = 3;
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-lg bg-[#0f1117] border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
        <div className="h-1 bg-secondary/30">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? "w-6 bg-primary" : i < step ? "w-3 bg-primary/40" : "w-3 bg-secondary/40"
                  }`}
                />
              ))}
            </div>
            <button onClick={close} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {step === 0 && <Step1Welcome onNext={() => setStep(1)} onSkip={close} />}
          {step === 1 && <Step2GitHub onNext={() => setStep(2)} onSkip={() => setStep(2)} />}
          {step === 2 && <Step3Path onDone={close} />}
        </div>
      </div>
    </div>
  );
}
