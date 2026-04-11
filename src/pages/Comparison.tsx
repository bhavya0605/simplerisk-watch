import { useState, useEffect } from "react";
import { GlassCard } from "@/components/WireframeLayout";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, PieChart, Pie, Cell } from "recharts";
import { useProduct } from "@/hooks/useProduct";
import { getComparison, getInsights, type RiskEvaluationData, type InsightsData } from "@/lib/api";
import { InsightPanel, VerdictBadge, WeightBreakdown, GapCard, AISummaryPanel, ChartCaption } from "@/components/InsightComponents";

const Comparison = () => {
  const { selectedProduct } = useProduct();
  const [data, setData] = useState<RiskEvaluationData | null>(null);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedProduct) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getComparison(selectedProduct.id).catch(() => null),
      getInsights(selectedProduct.id).catch(() => null),
    ]).then(([comp, ins]) => {
      setData(comp);
      setInsights(ins);
    }).catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedProduct]);

  if (!selectedProduct) {
    return (
      <div className="space-y-6 fade-in">
        <div><h1 className="text-2xl font-bold">Comparison & Risk Evaluation</h1></div>
        <GlassCard className="text-center py-12">
          <div className="text-4xl mb-3">⚖️</div>
          <div className="text-foreground font-semibold">No Product Selected</div>
          <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Upload a product first to see comparison results.</div>
        </GlassCard>
      </div>
    );
  }

  const comparisonData = data?.comparison_data || [];
  const riskScore = data?.overall_risk_score;
  const ri = insights?.risk_insight;
  const gapAnalysis = insights?.gap_analysis || [];
  const aiSummary = insights?.ai_summary;
  const barAnnotation = insights?.chart_annotations?.comparison_bar;

  const gaugeData = riskScore != null
    ? [{ name: "Risk", value: riskScore }, { name: "Rem", value: 100 - riskScore }]
    : [];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Comparison & Risk Evaluation</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Expectation vs Reality for <span className="text-[hsl(217,91%,70%)] font-medium">{selectedProduct.name}</span>
          </p>
        </div>
        {aiSummary && <VerdictBadge verdict={aiSummary.verdict} />}
      </div>

      {loading && <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">Loading...</div>}
      {error && <InsightPanel type="warning" title="Analysis Pending">{error}</InsightPanel>}

      {data && (
        <>
          {/* Risk Score Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GlassCard accent={riskScore && riskScore > 66 ? "red" : riskScore && riskScore > 33 ? "amber" : "green"}>
              <div className="section-label mb-2">Overall Risk Score</div>
              <div className="flex flex-col items-center">
                <div className="h-[130px] w-[240px]">
                  <ChartContainer config={{ score: { label: "Risk", color: "#ef4444" } }} className="h-full w-full">
                    <PieChart>
                      <Pie data={gaugeData} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={65} outerRadius={95} dataKey="value" stroke="none">
                        <Cell fill={riskScore! > 66 ? "#ef4444" : riskScore! > 33 ? "#eab308" : "#22c55e"} />
                        <Cell fill="hsl(222,30%,14%)" />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </div>
                <div className="text-4xl font-bold -mt-3 text-foreground">{riskScore}/100</div>
                {aiSummary && <VerdictBadge verdict={aiSummary.verdict} />}
              </div>
            </GlassCard>

            {/* Why this risk score */}
            {ri?.weight_breakdown && (
              <GlassCard label="Why This Risk Score Was Assigned">
                <WeightBreakdown weights={ri.weight_breakdown} />
              </GlassCard>
            )}
          </div>

          {/* Risk Insight */}
          {ri && (
            <InsightPanel
              type={ri.severity === "Severe" ? "danger" : ri.severity === "Moderate" ? "warning" : "success"}
              title="What This Means"
            >
              {ri.insight}
            </InsightPanel>
          )}

          {/* Expectation vs Reality Bar Chart */}
          <GlassCard>
            <div className="text-base font-semibold text-foreground mb-1">
              {barAnnotation?.title || "Expectation vs Reality"}
            </div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
              {barAnnotation?.subtitle || "Comparing marketed promises against actual customer experience"}
            </div>

            {comparisonData.length > 0 ? (
              <>
                <ChartContainer
                  config={{
                    promised: { label: "Promised", color: "hsl(217,91%,60%)" },
                    actual: { label: "Actual", color: "hsl(262,83%,58%)" },
                  }}
                  className="h-[240px] w-full"
                >
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,25%,18%)" />
                    <XAxis dataKey="metric" stroke="hsl(215,15%,55%)" fontSize={11} />
                    <YAxis stroke="hsl(215,15%,55%)" fontSize={11} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="promised" fill="hsl(217,91%,60%)" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="promised" position="top" fill="hsl(210,20%,85%)" fontSize={11} />
                    </Bar>
                    <Bar dataKey="actual" fill="hsl(262,83%,58%)" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="actual" position="top" fill="hsl(210,20%,85%)" fontSize={11} />
                    </Bar>
                  </BarChart>
                </ChartContainer>
                {barAnnotation && <ChartCaption annotation={barAnnotation} />}
              </>
            ) : <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">No comparison data</div>}
          </GlassCard>

          {/* Gap Analysis Cards */}
          {gapAnalysis.length > 0 && (
            <>
              <div className="section-label">Detailed Gap Analysis</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gapAnalysis.map((gap, i) => (
                  <GapCard key={i} gap={gap} />
                ))}
              </div>
            </>
          )}

          {/* Gap Analysis Summary */}
          {data.gap_analysis_summary && (
            <InsightPanel type="info" title="Gap Analysis Summary">
              {data.gap_analysis_summary}
            </InsightPanel>
          )}

          {/* AI Summary Panel */}
          {aiSummary && (
            <>
              <div className="section-label">🧠 AI Analysis</div>
              <AISummaryPanel summary={aiSummary} />
            </>
          )}

          {/* Recommended Action */}
          {ri && (
            <GlassCard accent="blue">
              <div className="flex items-center gap-2 mb-2">
                <span>🎯</span>
                <div className="text-base font-semibold text-foreground">Recommended Action</div>
              </div>
              <div className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                {ri.recommendation}
              </div>
            </GlassCard>
          )}
        </>
      )}
    </div>
  );
};

export default Comparison;
