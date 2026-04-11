import { useState, useRef, useEffect } from "react";
import { GlassCard } from "@/components/WireframeLayout";
import { sendChatMessage, type NewsItem, type ChatMessage, type ChatContext } from "@/lib/api";

/* ─── Markdown-lite renderer (handles ## headings, **bold**, - bullets) ─── */
const renderMarkdown = (text: string) => {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={i} />;

    // ## Heading
    if (trimmed.startsWith("## ")) {
      return <h3 key={i} className="text-xl font-bold text-foreground mt-4 mb-2">{trimmed.slice(3)}</h3>;
    }
    // ### Sub-heading
    if (trimmed.startsWith("### ")) {
      return <h4 key={i} className="text-lg font-semibold text-foreground mt-3 mb-1">{trimmed.slice(4)}</h4>;
    }
    // Numbered item
    if (/^\d+\.\s/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s/, "");
      return (
        <div key={i} className="flex gap-3 mb-1.5 ml-1">
          <span className="text-[hsl(152,69%,55%)] font-bold shrink-0">{trimmed.match(/^\d+/)?.[0]}.</span>
          <span className="text-[hsl(var(--muted-foreground))]" dangerouslySetInnerHTML={{ __html: boldify(content) }} />
        </div>
      );
    }
    // Bullet
    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      const content = trimmed.slice(2);
      return (
        <div key={i} className="flex gap-3 mb-1.5 ml-1">
          <span className="text-[hsl(217,91%,70%)] mt-0.5">•</span>
          <span className="text-[hsl(var(--muted-foreground))]" dangerouslySetInnerHTML={{ __html: boldify(content) }} />
        </div>
      );
    }
    // Regular paragraph
    return <p key={i} className="text-[hsl(var(--muted-foreground))] leading-relaxed mb-1" dangerouslySetInnerHTML={{ __html: boldify(trimmed) }} />;
  });
};

const boldify = (s: string) =>
  s.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>');

/* ─── Phase enum ─── */
type Phase = "analyzing" | "results" | "chat";

const AnalyzePage = ({ newsItem, onBack }: { newsItem: NewsItem; onBack: () => void }) => {
  const [phase, setPhase] = useState<Phase>("analyzing");
  const [analysis, setAnalysis] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const context: ChatContext = {
    product_name: newsItem.headline,
    category: newsItem.category,
    headline: newsItem.headline,
    summary: newsItem.summary,
  };

  // Auto-analyze on mount
  useEffect(() => {
    runAnalysis();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const runAnalysis = async () => {
    setPhase("analyzing");
    try {
      const analysisPrompt: ChatMessage = {
        role: "user",
        content: `Analyze this financial news for potential mis-selling risks, consumer impact, and what regular investors should know:\n\nHeadline: ${newsItem.headline}\nCategory: ${newsItem.category}\nSummary: ${newsItem.summary}`,
      };
      const res = await sendChatMessage([analysisPrompt], context);
      setAnalysis(res.response);
      setPhase("results");
    } catch {
      setAnalysis("Analysis could not be completed. Please try again.");
      setPhase("results");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setSending(true);

    // If first chat message, transition to chat phase
    if (phase === "results") {
      setPhase("chat");
    }

    try {
      // Include the original analysis as context
      const fullHistory: ChatMessage[] = [
        { role: "user", content: `Context: ${newsItem.headline}\n${newsItem.summary}` },
        { role: "assistant", content: analysis },
        ...newMessages,
      ];
      const res = await sendChatMessage(fullHistory, context);
      setMessages([...newMessages, { role: "assistant", content: res.response }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const suggestedQuestions = [
    "What are the hidden risks here?",
    "Is this a case of mis-selling?",
    "What should investors do?",
    "Explain this in simpler terms",
    "How does this affect my investments?",
  ];

  return (
    <div className="space-y-5 fade-in">
      {/* Back button + header */}
      <div className="flex items-start gap-4">
        <button
          onClick={onBack}
          className="shrink-0 mt-1 w-10 h-10 rounded-xl bg-[hsl(var(--secondary))] flex items-center justify-center text-lg hover:bg-[hsl(var(--muted))] transition-all"
        >
          ←
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-semibold text-[hsl(217,91%,70%)] bg-[hsl(217,91%,60%,0.1)] px-3 py-1 rounded-full">
              {newsItem.source}
            </span>
            <span className="badge badge-minor">{newsItem.category}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground leading-snug">{newsItem.headline}</h1>
          <p className="text-base text-[hsl(var(--muted-foreground))] mt-2 leading-relaxed">{newsItem.summary}</p>
        </div>
      </div>

      {/* ── PHASE: Analyzing ── */}
      {phase === "analyzing" && (
        <GlassCard className="text-center py-16">
          <div className="inline-flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-3xl animate-pulse">
              🧠
            </div>
            <div className="text-xl font-bold text-foreground">Analyzing...</div>
            <p className="text-base text-[hsl(var(--muted-foreground))] max-w-md">
              Running NLP analysis on this financial news. Checking for mis-selling patterns, 
              risk indicators, and consumer impact.
            </p>
            <div className="flex gap-1 mt-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-3 h-3 rounded-full bg-[hsl(217,91%,60%)]" style={{ animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite` }} />
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* ── PHASE: Results ── */}
      {(phase === "results" || phase === "chat") && (
        <>
          {/* Analysis results block */}
          <div className={`transition-all duration-500 ${phase === "chat" ? "max-h-[300px] overflow-y-auto" : ""}`}>
            <GlassCard className="metric-card blue">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-lg">🧠</div>
                <div>
                  <div className="text-lg font-bold text-foreground">AI Analysis</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">
                    Powered by {analysis.length > 500 ? "Gemini AI" : "SimpleRisk NLP Engine"}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                {renderMarkdown(analysis)}
              </div>
            </GlassCard>
          </div>

          {/* Transition prompt — only in results phase */}
          {phase === "results" && (
            <div className="text-center space-y-4 py-4 fade-in">
              <div className="text-lg font-semibold text-foreground">Want to know more?</div>
              <p className="text-base text-[hsl(var(--muted-foreground))]">
                Ask follow-up questions about this product, its risks, or what you should do.
              </p>
              
              {/* Suggested questions */}
              <div className="flex flex-wrap justify-center gap-2">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q);
                      setTimeout(() => {
                        setPhase("chat");
                        setTimeout(() => inputRef.current?.focus(), 200);
                      }, 50);
                    }}
                    className="px-4 py-2 rounded-xl bg-[hsl(var(--secondary))] text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(217,91%,60%,0.15)] hover:text-[hsl(217,91%,70%)] transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 justify-center text-xs text-[hsl(var(--muted-foreground))]">
                <div className="h-px bg-[hsl(var(--border))] w-20" />
                or type your own question below
                <div className="h-px bg-[hsl(var(--border))] w-20" />
              </div>
            </div>
          )}

          {/* ── Chat messages ── */}
          {phase === "chat" && messages.length > 0 && (
            <div className="space-y-4 transition-all duration-500">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} fade-in`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-5 ${
                      msg.role === "user"
                        ? "gradient-primary text-white rounded-br-md"
                        : "glass-card rounded-bl-md"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="text-base leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="space-y-1">{renderMarkdown(msg.content)}</div>
                    )}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start fade-in">
                  <div className="glass-card rounded-2xl rounded-bl-md p-5">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2.5 h-2.5 rounded-full bg-[hsl(217,91%,60%)]" style={{ animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}

          {/* ── Chat Input ── */}
          <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-[hsl(var(--background))] to-transparent">
            <div className="glass-card p-2 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={phase === "results" ? "Ask a question about this financial product..." : "Ask a follow-up question..."}
                className="flex-1 px-4 py-3 bg-transparent text-foreground text-base outline-none placeholder:text-[hsl(var(--muted-foreground))]"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="px-6 py-3 rounded-xl gradient-primary text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-40"
              >
                {sending ? "..." : "Send →"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyzePage;
