import { Router } from "express";
import OpenAI from "openai";
import { logger } from "../lib/logger";
import rateLimit from "express-rate-limit";
import type { Request } from "express";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? "placeholder",
});

const chatRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req: Request) =>
  req.ip || "unknown",
  standardHeaders: true,
  legacyHeaders: false,
});

const SYSTEM_PROMPT = `You are the CodeBridge support assistant — friendly, concise, and helpful.

CodeBridge is a SaaS platform that helps non-technical founders and developers deploy their AI-built apps to the cloud. Here's what it offers:

**Core Features:**
- GitHub repository connection (PAT-based) and AI-powered analysis
- Deployment readiness scoring (0-100) with actionable recommendations
- Self-serve DigitalOcean App Platform deployments
- Concierge services where CodeBridge engineers deploy for you

**Plans:**
- Free: 1 repository, basic analysis, community support
- Pro ($X/year): Unlimited repositories, priority support, advanced analysis

**Concierge Services (one-time fees):**
- Deploy For Me: $149 — engineers handle full cloud deployment (24-48h turnaround)
- Publish For Me: $99 — custom domain, SSL, CDN setup (12-24h)
- Cloud Infrastructure Setup: $299 — VPCs, load balancers, auto-scaling (3-5 days)
- App Store Submission Help: $299 — Apple App Store & Google Play submission (5-10 days)

**Getting Started (3 steps):**
1. Connect your GitHub repository (Settings → GitHub Integration, paste a PAT token)
2. Run AI Analysis on your repo to get a readiness score and recommendations
3. Deploy yourself via Launch Center, or purchase a concierge service to have experts do it

**Supported Cloud Providers:**
- DigitalOcean (recommended for most users — easiest, $5-25/mo)
- AWS, Azure, Google Cloud (available via concierge)

**Common Questions:**
- "Do I need technical knowledge?" — No! That's exactly what CodeBridge solves. The concierge services handle everything for you.
- "What is a GitHub PAT?" — A Personal Access Token. In GitHub, go to Settings → Developer Settings → Personal Access Tokens → Generate new token. Give it "repo" scope.
- "How long does deployment take?" — Self-serve: ~3 minutes (DigitalOcean). Concierge: 12-48 hours depending on service.
- "Is my code safe?" — Yes. We only read your repository to analyze it. Your code never leaves GitHub's infrastructure.
- "What kind of apps can I deploy?" — Any web app: Node.js, Python (FastAPI/Flask/Django), React, Next.js, Go, Ruby on Rails, etc.

Keep answers short (2-4 sentences max unless asked for detail). Use plain language — avoid jargon. If you don't know something specific, or the user is frustrated or struggling, direct them to email our human support team at support@codebridge.app.`;

router.post("/", chatRateLimit, async (req, res) => {
  try {
    const { messages } = req.body as { messages: { role: string; content: string }[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array required" });
    }

    const safeMessages = messages.slice(-10).map((m) => ({
      role: (m.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
      content: String(m.content).slice(0, 2000),
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...safeMessages,
      ],
      max_tokens: 400,
      temperature: 0.5,
    });

    const reply = completion.choices[0]?.message?.content ?? "I'm not sure about that. Please email support@codebridge.app for help.";
    res.json({ reply });
  } catch (err) {
    logger.error({ err }, "POST /chat error");
    res.status(500).json({ reply: "Something went wrong. Please try again or email support@codebridge.app." });
  }
});

export default router;
