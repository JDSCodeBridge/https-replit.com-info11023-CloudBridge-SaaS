import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bot, ChevronDown, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const SUPPORT_EMAIL = "support@codebridge.app";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How do I get started?",
  "What is a GitHub PAT?",
  "How long does deployment take?",
  "What plans are available?",
];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function sendChat(messages: Message[]): Promise<string> {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) throw new Error("Chat request failed");
  const data = await res.json() as { reply: string };
  return data.reply;
}

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm the CodeBridge assistant. How can I help you get started today? If you need to reach our team directly, you can email support@codebridge.app.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setShowBadge(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const submit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendChat(next);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(input);
    }
  };

  const showSuggestions = messages.length === 1;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[340px] rounded-2xl border border-border/50 bg-[#0f1117] shadow-2xl flex flex-col overflow-hidden"
          style={{ height: "480px" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-gradient-to-r from-primary/10 to-transparent shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold leading-none">CodeBridge Support</div>
                <div className="text-[10px] text-green-400 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  Online
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary/30"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-secondary/40 text-foreground rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-secondary/40 rounded-2xl rounded-tl-sm px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}

            {showSuggestions && !loading && (
              <div className="space-y-1.5 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="w-full text-left text-xs px-3 py-2 rounded-xl border border-border/30 bg-secondary/20 hover:bg-secondary/40 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="px-3 py-3 border-t border-border/30 shrink-0">
            <div className="flex items-center gap-2 bg-secondary/20 rounded-xl px-3 py-2 border border-border/30 focus-within:border-primary/40 transition-colors">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask anything..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 text-foreground"
                maxLength={500}
              />
              <button
                onClick={() => submit(input)}
                disabled={!input.trim() || loading}
                className="text-primary hover:text-primary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-[10px] text-muted-foreground/40">Powered by CodeBridge AI</p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="inline-flex items-center gap-1 text-[10px] text-primary/60 hover:text-primary transition-colors"
                title="Email human support"
              >
                <Mail className="w-2.5 h-2.5" />
                Email us
              </a>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative w-13 h-13 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          open
            ? "bg-secondary border border-border/50 text-foreground"
            : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
        }`}
        style={{ width: 52, height: 52 }}
        aria-label="Support chat"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        {showBadge && !open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 flex items-center justify-center">
            <span className="text-[9px] font-bold text-black">1</span>
          </span>
        )}
      </button>
    </div>
  );
}
