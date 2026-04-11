import { useState, useEffect } from "react";
import { GlassCard } from "@/components/WireframeLayout";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { useProduct } from "@/hooks/useProduct";
import { getExpectation, getInsights, type ExpectationData, type InsightsData } from "@/lib/api";
import { InsightPanel, ChartCaption, SeverityBadge } from "@/components/InsightComponents";

const ExpectationAnalysis = () => {
  const { selectedProduct } = useProduct();
  const [data, setData] = useState<ExpectationData | null>(null);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedProduct) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getExpectation(selectedProduct.id).catch(() => null),
      getInsights(selectedProduct.id).catch(() => null),
    ]).then(([exp, ins]) => {
      setData(exp);
      setInsights(ins);
    }).catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedProduct]);

  if (!selectedProduct) {
    return (
      <div className="space-y-6 fade-in">
        <div><h1 className="text-2xl font-bold">Expectation Analysis</h1></div>
        <GlassCard className="text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <div className="text-foreground font-semibold">No Product Selected</div>
          <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Upload a product first to see expectation analysis.</div>
        </GlassCard>
      </div>
    );
  }

  const radarData = data?.radar_data || [];
  const radarAnnotation = insights?.chart_annotations?.radar;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Expectation Analysis</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          What the product <span className="text-[hsl(217,91%,70%)] font-medium">{selectedProduct.name}</span> promises in its documentation
        </p>
      </div>

      {loading && <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">Loading...</div>}
      {error && <InsightPanel type="warning" title="Analysis Pending">{error}. Analysis may still be running.</InsightPanel>}

      {data && (
        <>
          {/* What This Section Shows */}
          <InsightPanel type="info" title="What This Section Shows">
            This analysis extracts claims and promises from the product documentation. 
            It identifies the risk profile, promised returns, fee structure, and how strongly 
            the product markets itself across key dimensions. These expectations are later 
            compared against real customer feedback.
          </InsightPanel>

          {/* Metric Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard accent="blue">
              <div className="section-label">Risk Profile</div>
              <div className="text-3xl font-bold text-foreground mt-2">{data.risk_profile_score ?? "--"}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">/ 100</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                {(data.risk_profile_score ?? 0) >= 70 ? "Marketed as a high-risk investment" :
                 (data.risk_profile_score ?? 0) >= 40 ? "Marketed as moderate risk" :
                 "Marketed as low risk / safe"}
              </div>
            </GlassCard>

            <GlassCard accent="green">
              <div className="section-label">Claimed Return</div>
              <div className="text-3xl font-bold text-foreground mt-2">
                {data.claimed_return != null ? `${data.claimed_return}%` : "--"}
              </div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">per annum</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                {data.claimed_return && data.claimed_return > 15
                  ? "⚠️ Unusually high — verify against market benchmarks"
                  : data.claimed_return
                  ? "Within range for this product category"
                  : "Not explicitly stated in documentation"}
              </div>
            </GlassCard>

            <GlassCard accent="amber">
              <div className="section-label">Annual Fee / TER</div>
              <div className="text-3xl font-bold text-foreground mt-2">
                {data.annual_fee != null ? `${data.annual_fee}%` : "--"}
              </div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">expense ratio</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                {data.annual_fee && data.annual_fee > 2.0
                  ? "⚠️ High expense ratio — may erode returns"
                  : data.annual_fee
                  ? "Standard for this category"
                  : "Fee details not found in document"}
              </div>
            </GlassCard>

            <GlassCard accent="purple">
              <div className="section-label">Lock-in Period</div>
              <div className="text-3xl font-bold text-foreground mt-2">
                {data.lock_in_period != null ? `${data.lock_in_period}m` : "--"}
              </div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">months</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                {data.lock_in_period && data.lock_in_period > 36
                  ? "⚠️ Long lock-in — limited liquidity"
                  : data.lock_in_period
                  ? "Standard lock-in for this category"
                  : "Not specified in documentation"}
              </div>
            </GlassCard>
          </div>

          {/* Radar Chart */}
          <GlassCard>
            <div className="text-base font-semibold text-foreground mb-1">
              {radarAnnotation?.title || "Product Claim Strength Radar"}
            </div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
              {radarAnnotation?.subtitle || "How strongly each dimension is marketed in the product documentation"}
            </div>

            {radarData.length > 0 ? (
              <>
                <ChartContainer config={{ value: { label: "Score", color: "hsl(217,91%,60%)" } }} className="h-[320px] w-full">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="hsl(222,25%,20%)" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fill: "hsl(215,15%,55%)", fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "hsl(215,15%,45%)", fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Radar dataKey="value" stroke="hsl(217,91%,60%)" fill="hsl(217,91%,60%)" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ChartContainer>
                {radarAnnotation && <ChartCaption annotation={radarAnnotation} />}
              </>
            ) : (
              <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">No radar data</div>
            )}
          </GlassCard>

          {/* Why This Matters */}
          <InsightPanel type="info" title="Why This Matters">
            The expectation profile establishes the baseline against which customer reality is measured.
            Strong claims in marketing documentation (high radar scores) that don't match customer 
            experience indicate potential mis-selling. The next step is to compare these expectations 
            against actual customer feedback in the Reality Analysis.
          </InsightPanel>
        </>
      )}
    </div>
  );
};

export default ExpectationAnalysis;
