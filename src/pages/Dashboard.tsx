import { useState, useEffect } from "react";
import { GlassCard } from "@/components/WireframeLayout";
import { fetchNewsFeed, type NewsItem } from "@/lib/api";

const CATEGORY_TABS = ["All", "Mutual Fund", "Insurance", "FD"];

const sentimentConfig: Record<string, { dot: string; label: string; cls: string }> = {
  negative: { dot: "bg-red-500", label: "⚠ Alert", cls: "text-red-400" },
  warning: { dot: "bg-amber-500", label: "⚡ Warning", cls: "text-amber-400" },
  caution: { dot: "bg-yellow-500", label: "👁 Caution", cls: "text-yellow-400" },
  positive: { dot: "bg-emerald-500", label: "✅ Positive", cls: "text-emerald-400" },
};

const Dashboard = ({ onAnalyze }: { onAnalyze?: (news: NewsItem) => void }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    setLoading(true);
    fetchNewsFeed(activeTab === "All" ? undefined : activeTab)
      .then(setNews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTab]);

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return "Just now";
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Hero Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Financial Market Watch</h1>
        <p className="text-base text-[hsl(var(--muted-foreground))] mt-2">
          Live coverage of mutual funds, insurance, and financial product news. 
          <span className="text-[hsl(217,91%,70%)]"> Click "Analyze" on any story</span> to run AI-powered mis-selling detection.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab
                ? "gradient-primary text-white shadow-lg shadow-blue-500/20"
                : "bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Ticker Bar */}
      <div className="glass-card p-3 flex items-center gap-3 overflow-hidden">
        <div className="shrink-0 px-3 py-1 rounded-lg gradient-primary text-white text-xs font-bold">LIVE</div>
        <div className="flex gap-6 text-sm text-[hsl(var(--muted-foreground))] animate-marquee whitespace-nowrap">
          {news.slice(0, 5).map((n) => (
            <span key={n.id} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${sentimentConfig[n.sentiment]?.dot || 'bg-gray-500'}`} />
              <span className="truncate max-w-[300px]">{n.headline}</span>
            </span>
          ))}
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">Loading market intelligence...</div>
      )}

      {/* News Cards */}
      <div className="space-y-4">
        {news.map((item) => {
          const sent = sentimentConfig[item.sentiment] || sentimentConfig.positive;

          return (
            <div key={item.id} className="glass-card p-6 group hover:border-[hsl(217,91%,60%,0.3)] transition-all">
              {/* Top row: source, time, sentiment */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-[hsl(217,91%,70%)] bg-[hsl(217,91%,60%,0.1)] px-3 py-1 rounded-full">
                  {item.source}
                </span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">{timeAgo(item.published_at)}</span>
                <span className={`text-xs font-semibold ${sent.cls}`}>{sent.label}</span>
                <span className="badge badge-minor ml-auto">{item.category}</span>
              </div>

              {/* Headline */}
              <h2 className="text-xl font-bold text-foreground leading-snug mb-3 group-hover:text-[hsl(217,91%,70%)] transition-colors">
                {item.headline}
              </h2>

              {/* Summary */}
              <p className="text-base text-[hsl(var(--muted-foreground))] leading-relaxed mb-4">
                {item.summary}
              </p>

              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap mb-4">
                {item.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Relevance + Analyze CTA */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">
                    Relevance: <span className="font-bold text-foreground">{item.relevance_score}%</span>
                  </div>
                  <div className="w-24 h-1.5 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.relevance_score}%`,
                        background: item.relevance_score > 85 ? 'hsl(0,72%,51%)' : item.relevance_score > 70 ? 'hsl(38,92%,50%)' : 'hsl(152,69%,45%)',
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => onAnalyze?.(item)}
                  className="px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2"
                >
                  🔍 Analyze This
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Context menu hint */}
      <div className="text-center text-sm text-[hsl(var(--muted-foreground))] opacity-60">
        💡 Tip: You can also right-click any news card for quick actions
      </div>
    </div>
  );
};

export default Dashboard;
