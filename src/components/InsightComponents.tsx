import type { MetricInsight, ContributingFactor, ChartAnnotation, GapAnalysisItem, AISummary } from "@/lib/api";

// ─── Severity Badge ─────────────────────────────────────────
export const SeverityBadge = ({ severity }: { severity: string }) => {
  const cls =
    severity === "Severe" ? "badge-severe" :
    severity === "Moderate" ? "badge-moderate" :
    severity === "Minor" ? "badge-minor" :
    severity === "High Risk" ? "badge-high-risk" :
    severity === "Monitor" ? "badge-monitor" :
    "badge-safe";
  return <span className={`badge ${cls}`}>● {severity}</span>;
};

// ─── Verdict Badge ──────────────────────────────────────────
export const VerdictBadge = ({ verdict }: { verdict: string }) => {
  const cls =
    verdict === "High Risk" ? "badge-high-risk" :
    verdict === "Monitor" ? "badge-monitor" :
    "badge-safe";
  return <span className={`badge ${cls} text-sm`}>● {verdict}</span>;
};

// ─── Insight Panel ──────────────────────────────────────────
export const InsightPanel = ({
  type = "info",
  title,
  children,
}: {
  type?: "info" | "warning" | "danger" | "success";
  title?: string;
  children: React.ReactNode;
}) => {
  const cls =
    type === "danger" ? "danger" :
    type === "warning" ? "warning" :
    type === "success" ? "success" : "";
  const icon =
    type === "danger" ? "🚨" :
    type === "warning" ? "⚠️" :
    type === "success" ? "✅" : "💡";

  return (
    <div className={`insight-panel ${cls}`}>
      {title && (
        <div className="flex items-center gap-2 mb-2">
          <span>{icon}</span>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
      )}
      <div className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{children}</div>
    </div>
  );
};

// ─── What / Why / Action Block ──────────────────────────────
export const InsightBlock = ({
  insight,
}: {
  insight: MetricInsight;
}) => {
  const panelType = insight.severity === "Severe" ? "danger"
    : insight.severity === "Moderate" ? "warning"
    : "success";

  return (
    <div className="space-y-3 fade-in">
      {/* What this means */}
      <InsightPanel type={panelType} title="What This Means">
        {insight.insight}
      </InsightPanel>

      {/* Why this is happening */}
      {insight.interpretation && (
        <InsightPanel type="info" title="Why This Is Happening">
          {insight.interpretation}
        </InsightPanel>
      )}

      {/* Contributing factors */}
      {insight.contributing_factors && insight.contributing_factors.length > 0 && (
        <div className="glass-card p-4 space-y-3">
          <div className="section-label">Top Contributing Factors</div>
          {insight.contributing_factors.map((f, i) => (
            <FactorBar key={i} factor={f} index={i} />
          ))}
        </div>
      )}

      {/* Recommended action */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <span>🎯</span>
          <span className="section-label">Recommended Action</span>
        </div>
        <div className="text-sm font-medium text-foreground">{insight.recommendation}</div>
      </div>
    </div>
  );
};

// ─── Factor Progress Bar ────────────────────────────────────
const FACTOR_COLORS = ["hsl(217,91%,60%)", "hsl(262,83%,58%)", "hsl(199,89%,48%)"];

export const FactorBar = ({
  factor,
  index = 0,
}: {
  factor: ContributingFactor;
  index?: number;
}) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-foreground font-medium">{factor.factor}</span>
      <span className="text-[hsl(var(--muted-foreground))]">{factor.percentage}%</span>
    </div>
    <div className="weight-bar">
      <div
        className="weight-bar-fill"
        style={{
          width: `${factor.percentage}%`,
          background: FACTOR_COLORS[index % FACTOR_COLORS.length],
        }}
      />
    </div>
    <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{factor.description}</div>
  </div>
);

// ─── Weight Breakdown ───────────────────────────────────────
export const WeightBreakdown = ({
  weights,
}: {
  weights: Record<string, { weight: number; label: string; description: string }>;
}) => {
  const COLORS = ["hsl(217,91%,60%)", "hsl(38,92%,50%)", "hsl(262,83%,58%)"];
  const entries = Object.values(weights);

  return (
    <div className="space-y-3">
      <div className="section-label">Risk Score Weight Breakdown</div>
      {entries.map((w, i) => (
        <div key={w.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-foreground font-medium">{w.label}</span>
            <span className="text-[hsl(var(--muted-foreground))]">{w.weight}%</span>
          </div>
          <div className="weight-bar">
            <div
              className="weight-bar-fill"
              style={{ width: `${w.weight}%`, background: COLORS[i % COLORS.length] }}
            />
          </div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{w.description}</div>
        </div>
      ))}
    </div>
  );
};

// ─── Chart Caption ──────────────────────────────────────────
export const ChartCaption = ({ annotation }: { annotation: ChartAnnotation }) => (
  <div className="mt-3 space-y-1">
    <div className="text-xs text-[hsl(var(--muted-foreground))] italic leading-relaxed">
      💡 {annotation.caption}
    </div>
    {annotation.anomalies.map((a, i) => (
      <div key={i} className="text-xs text-[hsl(38,92%,60%)] font-medium">
        ⚠️ {a}
      </div>
    ))}
  </div>
);

// ─── Gap Analysis Card ──────────────────────────────────────
export const GapCard = ({ gap }: { gap: GapAnalysisItem }) => (
  <div className="glass-card p-4 space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-foreground">{gap.metric}</span>
      <SeverityBadge severity={gap.severity} />
    </div>
    <div className="text-sm text-[hsl(217,91%,70%)] font-medium">
      {gap.comparison_statement}
    </div>
    <div className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
      {gap.explanation}
    </div>
    <div className="flex items-center gap-2 text-xs">
      <span className="text-[hsl(var(--muted-foreground))]">Gap:</span>
      <span className="font-bold text-foreground">{gap.gap_percentage}%</span>
    </div>
  </div>
);

// ─── AI Summary Panel ───────────────────────────────────────
export const AISummaryPanel = ({ summary }: { summary: AISummary }) => (
  <div className="space-y-4 fade-in">
    {/* Header */}
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-lg">🧠</div>
          <div>
            <div className="text-base font-bold text-foreground">AI Analysis Summary</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{summary.product_name} • {summary.category}</div>
          </div>
        </div>
        <VerdictBadge verdict={summary.verdict} />
      </div>
      <div className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
        {summary.health_summary}
      </div>
    </div>

    {/* Red Flags */}
    <div className="glass-card p-5">
      <div className="section-label mb-3">🚩 Red Flags Detected</div>
      <ul className="space-y-2">
        {summary.red_flags.map((flag, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <span className="text-[hsl(0,72%,65%)] mt-0.5">•</span>
            <span className="text-[hsl(var(--muted-foreground))]">{flag}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* Hidden Risks */}
    <div className="glass-card p-5">
      <div className="section-label mb-3">🔎 Hidden Risks</div>
      <ul className="space-y-2">
        {summary.hidden_risks.map((risk, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <span className="text-[hsl(38,92%,60%)] mt-0.5">•</span>
            <span className="text-[hsl(var(--muted-foreground))]">{risk}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* Recommendations */}
    <div className="glass-card p-5">
      <div className="section-label mb-3">🎯 Recommendations</div>
      <ul className="space-y-2">
        {summary.recommendations.map((rec, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <span className="text-[hsl(152,69%,55%)] mt-0.5 font-bold">{i + 1}.</span>
            <span className="text-foreground font-medium">{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);
