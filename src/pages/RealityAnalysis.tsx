import { useState, useEffect } from "react";
import { GlassCard } from "@/components/WireframeLayout";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";
import { useProduct } from "@/hooks/useProduct";
import { getReality, getInsights, type RealityData, type InsightsData } from "@/lib/api";
import { InsightBlock, InsightPanel, ChartCaption, SeverityBadge } from "@/components/InsightComponents";

const PIE_COLORS = ["hsl(217,91%,60%)", "hsl(262,83%,58%)", "hsl(199,89%,48%)", "hsl(38,92%,50%)", "hsl(152,69%,45%)"];

const RealityAnalysis = () => {
  const { selectedProduct } = useProduct();
  const [data, setData] = useState<RealityData | null>(null);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedProduct) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getReality(selectedProduct.id).catch(() => null),
      getInsights(selectedProduct.id).catch(() => null),
    ]).then(([r, ins]) => {
      setData(r);
      setInsights(ins);
    }).catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedProduct]);

  if (!selectedProduct) {
    return (
      <div className="space-y-6 fade-in">
        <div><h1 className="text-2xl font-bold">Reality Analysis</h1></div>
        <GlassCard className="text-center py-12">
          <div className="text-4xl mb-3">📈</div>
          <div className="text-foreground font-semibold">No Product Selected</div>
          <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Upload a product first to see reality analysis.</div>
        </GlassCard>
      </div>
    );
  }

  const complaintData = data?.complaint_data || [];
  const histogramData = data?.sentiment_distribution || [];
  const si = insights?.sentiment_insight;
  const di = insights?.dissatisfaction_insight;
  const pieAnnotation = insights?.chart_annotations?.complaint_pie;
  const histAnnotation = insights?.chart_annotations?.sentiment_histogram;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reality Analysis</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          What customers <em>actually</em> experience with <span className="text-[hsl(217,91%,70%)] font-medium">{selectedProduct.name}</span>
        </p>
      </div>

      {loading && <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">Loading...</div>}
      {error && <InsightPanel type="warning" title="Analysis Pending">{error}</InsightPanel>}

      {data && (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassCard accent={data.average_sentiment && data.average_sentiment < 40 ? "red" : data.average_sentiment && data.average_sentiment < 60 ? "amber" : "green"}>
              <div className="section-label">Average Sentiment</div>
              <div className="text-4xl font-bold text-foreground mt-2">
                {data.average_sentiment != null ? data.average_sentiment.toFixed(1) : "--"}
              </div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">/ 100 (higher = more positive)</div>
              {si && <SeverityBadge severity={si.severity} />}
            </GlassCard>

            <GlassCard accent={data.dissatisfaction_index && data.dissatisfaction_index > 30 ? "red" : "amber"}>
              <div className="section-label">Dissatisfaction Index</div>
              <div className="text-4xl font-bold text-foreground mt-2">
                {data.dissatisfaction_index != null ? `${data.dissatisfaction_index.toFixed(1)}%` : "--"}
              </div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">of customers report negative experience</div>
              {di && <SeverityBadge severity={di.severity} />}
            </GlassCard>
          </div>

          {/* Sentiment Insight Block */}
          {si && <InsightBlock insight={si} />}

          {/* Complaint Pie Chart */}
          <GlassCard>
            <div className="text-base font-semibold text-foreground mb-1">
              {pieAnnotation?.title || "Complaint Categories"}
            </div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
              {pieAnnotation?.subtitle || "Breakdown of customer complaint types"}
            </div>

            {complaintData.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
                <ChartContainer config={{ value: { label: "Share", color: "hsl(217,91%,60%)" } }} className="h-[260px]">
                  <PieChart>
                    <Pie data={complaintData} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`} labelLine={{ stroke: "hsl(215,15%,45%)" }}>
                      {complaintData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>

                <div className="space-y-2">
                  {complaintData.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">{item.name}</div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">{item.value}% of complaints</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">No complaint data</div>}
            {pieAnnotation && <ChartCaption annotation={pieAnnotation} />}
          </GlassCard>

          {/* Sentiment Histogram */}
          <GlassCard>
            <div className="text-base font-semibold text-foreground mb-1">
              {histAnnotation?.title || "Sentiment Distribution"}
            </div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
              {histAnnotation?.subtitle || "Distribution of sentiment scores across feedback"}
            </div>

            {histogramData.length > 0 ? (
              <>
                <ChartContainer config={{ count: { label: "Count", color: "hsl(262,83%,58%)" } }} className="h-[220px] w-full">
                  <BarChart data={histogramData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,25%,18%)" />
                    <XAxis dataKey="range" stroke="hsl(215,15%,55%)" fontSize={11}
                      label={{ value: "Score Range", position: "insideBottom", offset: -5, fill: "hsl(215,15%,55%)" }} />
                    <YAxis stroke="hsl(215,15%,55%)" fontSize={11}
                      label={{ value: "Count", angle: -90, position: "insideLeft", fill: "hsl(215,15%,55%)" }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(262,83%,58%)" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="count" position="top" fill="hsl(210,20%,85%)" fontSize={11} />
                    </Bar>
                  </BarChart>
                </ChartContainer>
                {histAnnotation && <ChartCaption annotation={histAnnotation} />}
              </>
            ) : <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">No histogram data</div>}
          </GlassCard>

          {/* Top Complaint Topics */}
          <GlassCard label="Top Complaint Topics">
            {data.top_topics && data.top_topics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.top_topics.map((topic, i) => (
                  <span key={i} className="badge badge-moderate">{topic}</span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-[hsl(var(--muted-foreground))] text-center py-4">No complaints loaded</div>
            )}
          </GlassCard>

          {/* Dissatisfaction Insight */}
          {di && (
            <InsightPanel
              type={di.severity === "Severe" ? "danger" : di.severity === "Moderate" ? "warning" : "success"}
              title="Dissatisfaction Assessment"
            >
              {di.insight}
            </InsightPanel>
          )}
        </>
      )}
    </div>
  );
};

export default RealityAnalysis;
