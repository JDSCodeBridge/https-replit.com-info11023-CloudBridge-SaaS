import { Link } from "wouter";

export default function Privacy() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="flex items-center justify-between px-8 py-5 border-b border-border/40 sticky top-0 bg-background/80 backdrop-blur z-10">
        <Link href="/">
          <div className="bg-white rounded-lg px-2 py-1">
            <img src="/logo.png" alt="CodeLift" className="h-9 w-auto" />
          </div>
        </Link>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-foreground transition-colors">← Back to Home</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tighter mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-12">Last updated: June 14, 2026</p>

        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p className="mb-2">We collect information you provide directly to us, including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-foreground">Account information:</strong> Name, email address, and password when you create an account</li>
              <li><strong className="text-foreground">GitHub data:</strong> Repository names, descriptions, languages, and file structure metadata when you connect a repository</li>
              <li><strong className="text-foreground">Payment information:</strong> Processed and stored securely by Stripe; we do not store full card numbers</li>
              <li><strong className="text-foreground">Usage data:</strong> How you interact with the Service, deployment history, and analysis results</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <p className="mb-2">We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide, maintain, and improve the Service</li>
              <li>Analyze your repositories using AI to generate deployment recommendations</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze usage trends to improve the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. AI Analysis and Your Code</h2>
            <p>When you connect a repository for analysis, CloudLift uses AI (powered by OpenAI) to analyze repository metadata, file structure, and select code patterns. <strong className="text-foreground">We do not permanently store your source code.</strong> Analysis results (scores, recommendations) are stored in our database associated with your account. We do not use your code to train AI models.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Information Sharing</h2>
            <p className="mb-2">We do not sell, trade, or rent your personal information. We may share information with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-foreground">Service providers:</strong> Stripe (payments), Clerk (authentication), OpenAI (AI analysis), and cloud hosting providers</li>
              <li><strong className="text-foreground">Legal compliance:</strong> When required by law or to protect our rights</li>
              <li><strong className="text-foreground">Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Security</h2>
            <p>We implement industry-standard security measures including TLS encryption for data in transit and encryption at rest for sensitive data. However, no method of transmission over the Internet is 100% secure. We encourage you to use a strong, unique password for your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Data Retention</h2>
            <p>We retain your account information and analysis history for as long as your account is active or as needed to provide the Service. You may request deletion of your account and associated data at any time by contacting us. We will delete your data within 30 days of such request, except where retention is required by law.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies to maintain your session, remember your preferences, and analyze Service usage. You can control cookies through your browser settings. Disabling cookies may affect certain features of the Service. We use Clerk for authentication, which sets session cookies necessary for the Service to function.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Your Rights</h2>
            <p className="mb-2">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to or restrict our processing of your information</li>
              <li>Data portability — receive your data in a machine-readable format</li>
            </ul>
            <p className="mt-2">To exercise these rights, contact us at <a href="mailto:privacy@cloudlift.app" className="text-primary hover:underline">privacy@cloudlift.app</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Children's Privacy</h2>
            <p>The Service is not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will delete it.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. For significant changes, we will send an email notification to registered users.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">11. Contact Us</h2>
            <p>If you have questions or concerns about this Privacy Policy, please contact us at:<br />
              <a href="mailto:privacy@cloudlift.app" className="text-primary hover:underline">privacy@cloudlift.app</a>
            </p>
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
