import { Link } from "wouter";
import Logo from "@/components/Logo";

export default function Terms() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="flex items-center justify-between px-8 py-5 border-b border-border/40 sticky top-0 bg-background/80 backdrop-blur z-10">
        <Link href="/">
          <Logo size="md" />
        </Link>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-foreground transition-colors">← Back to Home</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tighter mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-12">Last updated: June 14, 2026</p>

        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using CloudLift ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. These terms apply to all visitors, users, and others who access or use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p>CloudLift provides AI-powered repository analysis, deployment readiness scoring, and concierge deployment services for developers and non-technical founders. We analyze GitHub repositories and provide recommendations for deploying applications to cloud platforms including AWS, Google Cloud, Azure, and DigitalOcean.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. User Accounts</h2>
            <p className="mb-2">You must create an account to use most features of the Service. You are responsible for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activity that occurs under your account</li>
              <li>Providing accurate and complete information during registration</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Subscription Plans and Payments</h2>
            <p className="mb-2">CloudLift offers the following plans:</p>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li><strong className="text-foreground">Free Plan:</strong> Limited to 1 repository with basic AI analysis</li>
              <li><strong className="text-foreground">Pro Plan ($49.99/year):</strong> Unlimited repositories with advanced AI analysis</li>
              <li><strong className="text-foreground">Launch Package ($149 one-time):</strong> Concierge cloud deployment service</li>
              <li><strong className="text-foreground">Apple Publishing ($299 one-time):</strong> End-to-end App Store submission service</li>
            </ul>
            <p>All payments are processed securely through Stripe. Subscription fees are billed annually. One-time service fees are non-refundable once work has begun. We reserve the right to modify pricing with 30 days' notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Acceptable Use</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the Service for any unlawful purpose or in violation of any regulations</li>
              <li>Upload or connect repositories containing malicious code or content</li>
              <li>Attempt to reverse engineer, decompile, or otherwise access the Service's source code</li>
              <li>Resell or sublicense access to the Service without our written consent</li>
              <li>Use automated tools to abuse or overload our infrastructure</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Intellectual Property</h2>
            <p>The Service and its original content, features, and functionality are owned by CloudLift and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. Your repositories and code remain your property. You grant CloudLift a limited license to analyze your repositories solely to provide the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Disclaimer of Warranties</h2>
            <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. CLOUDLIFT DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE. AI ANALYSIS RESULTS ARE RECOMMENDATIONS ONLY AND DO NOT GUARANTEE SUCCESSFUL DEPLOYMENT.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
            <p>TO THE FULLEST EXTENT PERMITTED BY LAW, CLOUDLIFT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Termination</h2>
            <p>We may suspend or terminate your account at any time for violation of these Terms. You may cancel your subscription at any time through your account settings. Upon termination, your right to use the Service will cease immediately. We may retain your data as required by law or for legitimate business purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. We will notify you of significant changes via email or a prominent notice within the Service. Continued use of the Service after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">11. Contact</h2>
            <p>For questions about these Terms, please contact us at <a href="mailto:legal@cloudlift.app" className="text-primary hover:underline">legal@cloudlift.app</a>.</p>
          </section>
        </div>
      </div>

      <footer className="border-t border-border/40 px-8 py-6 text-center text-xs text-muted-foreground">
        <div className="flex justify-center gap-6">
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        </div>
        <p className="mt-2">© 2026 CloudLift. All rights reserved.</p>
      </footer>
    </div>
  );
}
