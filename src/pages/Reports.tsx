import { useState, useEffect } from "react";
import { GlassCard } from "@/components/WireframeLayout";
import { useProduct } from "@/hooks/useProduct";
import {
  getInsights, getExpectation, getReality, getComparison, getDeepAnalysis,
  type InsightsData, type ExpectationData, type RealityData, type RiskEvaluationData,
  type DeepAnalysisData, type ClaimAnalysis, type ComplianceScan, type RiskHeatmapPoint,
  type SEBIChecklistItem, type ConsumerAdvisory, type ReportNarrative, type KeyFinding,
  type RegulatoryAction, type ComplianceGap, type DocumentAnalysis,
  type DeepFeedbackAnalysis, type MisSellEvidence, type CustomerPainPoint,
} from "@/lib/api";
import { VerdictBadge, SeverityBadge } from "@/components/InsightComponents";

/* ─── Severity color helper ─── */
const sevColor = (s: string) =>
  s === "CRITICAL" ? "hsl(0,72%,55%)" : s === "HIGH" ? "hsl(25,95%,55%)" :
  s === "MEDIUM" ? "hsl(38,92%,50%)" : "hsl(152,69%,45%)";
const sevBg = (s: string) =>
  s === "CRITICAL" ? "bg-red-500/10 text-red-400 border-red-500/20" :
  s === "HIGH" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
  s === "MEDIUM" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
const checkColor = (s: string) =>
  s === "COMPLIANT" ? "text-emerald-400" : s === "NON-COMPLIANT" ? "text-red-400" :
  s === "PARTIALLY COMPLIANT" ? "text-amber-400" : "text-gray-400";
const checkIcon = (s: string) =>
  s === "COMPLIANT" ? "✅" : s === "NON-COMPLIANT" ? "❌" : s === "PARTIALLY COMPLIANT" ? "⚠️" : "➖";

/* ─── Section wrapper ─── */
const Section = ({ id, icon, title, children }: { id: string; icon: string; title: string; children: React.ReactNode }) => (
  <div id={id} className="scroll-mt-20">
    <div className="flex items-center gap-3 mb-4">
      <span className="text-2xl">{icon}</span>
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
    </div>
    {children}
  </div>
);

/* ─── Mini stat card ─── */
const StatCard = ({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) => (
  <div className={`glass-card p-4 text-center border-t-2`} style={{ borderTopColor: accent || "hsl(217,91%,60%)" }}>
    <div className="text-3xl font-black text-foreground">{value}</div>
    <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{label}</div>
    {sub && <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5 opacity-70">{sub}</div>}
  </div>
);

const Reports = () => {
  const { selectedProduct } = useProduct();
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [expectation, setExpectation] = useState<ExpectationData | null>(null);
  const [reality, setReality] = useState<RealityData | null>(null);
  const [risk, setRisk] = useState<RiskEvaluationData | null>(null);
  const [deep, setDeep] = useState<DeepAnalysisData | null>(null);
  const [docAnalysis, setDocAnalysis] = useState<DocumentAnalysis | null>(null);
  const [narrative, setNarrative] = useState<ReportNarrative | null>(null);
  const [compliance, setCompliance] = useState<ComplianceScan | null>(null);
  const [feedback, setFeedback] = useState<DeepFeedbackAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    if (!selectedProduct) return;
    let cancelled = false;
    let poll: NodeJS.Timeout | null = null;

    const load = async () => {
      setLoading(true);
      try {
        const [ins, exp, rea, comp] = await Promise.all([
          getInsights(selectedProduct.id).catch(() => null),
          getExpectation(selectedProduct.id).catch(() => null),
          getReality(selectedProduct.id).catch(() => null),
          getComparison(selectedProduct.id).catch(() => null),
        ]);
        if (cancelled) return false;
        if (!ins || !exp || !rea || !comp) return false;

        setInsights(ins);
        setExpectation(exp);
        setReality(rea);
        setRisk(comp);

        // Deep analysis (may not be ready yet)
        if (ins.deep_analysis) {
          setDeep(ins.deep_analysis);
          setDocAnalysis(ins.deep_analysis.document_analysis || null);
          setNarrative(ins.deep_analysis.report_narrative || null);
          setCompliance(ins.deep_analysis.compliance_scan || null);
        }
        // Try dedicated deep-analysis endpoint
        try {
          const da = await getDeepAnalysis(selectedProduct.id);
          if (da) {
            setDocAnalysis(da.document_analysis || null);
            setNarrative(da.report_narrative || null);
            setCompliance(da.compliance_scan || null);
            setFeedback(da.deep_feedback || null);
            setDeep({
              compliance_score: da.compliance_score,
              compliance_scan: da.compliance_scan,
              report_narrative: da.report_narrative,
              document_analysis: da.document_analysis,
              risk_heatmap: da.risk_heatmap,
              claims_analysis: da.claims_analysis,
              consumer_advisory: da.consumer_advisory,
              sebi_checklist: da.sebi_checklist,
            });
          }
        } catch {}

        setLoading(false);
        return true;
      } catch { return false; }
    };

    (async () => {
      const ok = await load();
      if (!ok && !cancelled) {
        poll = setInterval(async () => {
          const s = await load();
          if (s && poll) clearInterval(poll);
        }, 3000);
      }
    })();

    return () => { cancelled = true; if (poll) clearInterval(poll); };
  }, [selectedProduct]);

  if (!selectedProduct) return (
    <div className="space-y-6 fade-in">
      <h1 className="text-2xl font-bold">Reports</h1>
      <GlassCard className="text-center py-12">
        <div className="text-4xl mb-3">📋</div>
        <div className="text-foreground font-semibold">No Product Selected</div>
        <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Upload and analyze a product first.</div>
      </GlassCard>
    </div>
  );

  const summary = insights?.ai_summary;
  const ri = insights?.risk_insight;
  const gaps = insights?.gap_analysis || [];
  const now = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  const claims = deep?.claims_analysis || docAnalysis?.claims_analysis || [];
  const misleadingClaims = claims.filter((c: ClaimAnalysis) => c.is_misleading);
  const heatmap = deep?.risk_heatmap || docAnalysis?.risk_heatmap_data || [];
  const checklist = deep?.sebi_checklist || docAnalysis?.sebi_compliance_checklist || [];
  const advisory = deep?.consumer_advisory || docAnalysis?.consumer_advisory || null;
  const finePrint = docAnalysis?.fine_print_analysis || null;
  const marketCtx = docAnalysis?.indian_market_context || null;
  const misIndicators = docAnalysis?.mis_selling_indicators || null;

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "compliance", label: "Compliance" },
    { id: "claims", label: "Claims" },
    { id: "risk-heatmap", label: "Risk Map" },
    { id: "fine-print", label: "Fine Print" },
    { id: "feedback", label: "Feedback" },
    { id: "advisory", label: "Advisory" },
    { id: "checklist", label: "SEBI Check" },
    { id: "actions", label: "Actions" },
  ];

  return (
    <div className="space-y-8 fade-in pb-12">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Regulatory Analysis Report</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Comprehensive mis-selling detection for <span className="text-[hsl(217,91%,70%)] font-medium">{selectedProduct.name}</span>
          </p>
        </div>
        <button onClick={() => window.print()} className="px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity">
          🖨️ Print Report
        </button>
      </div>

      {loading && <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">Generating comprehensive report...</div>}

      {summary && (
        <>
          {/* ─── Nav Bar ─── */}
          <div className="sticky top-0 z-20 glass-card p-2 flex gap-1 overflow-x-auto no-scrollbar">
            {sections.map(s => (
              <button key={s.id} onClick={() => { setActiveSection(s.id); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" }); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeSection === s.id ? "gradient-primary text-white" : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]"}`}>
                {s.label}
              </button>
            ))}
          </div>

          {/* ─── Report Banner ─── */}
          <GlassCard className="border border-[hsl(var(--border))]">
            <div className="text-center space-y-3">
              <div className="text-[10px] tracking-[0.2em] uppercase text-[hsl(var(--muted-foreground))] font-semibold">
                Decentralized AI System for Detecting Financial Mis-Selling Risks
              </div>
              <div className="text-xl font-bold gradient-text">{selectedProduct.name}</div>
              <div className="flex items-center justify-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                <span>Category: {selectedProduct.category}</span><span>•</span>
                <span>Date: {now}</span><span>•</span>
                <VerdictBadge verdict={summary.verdict} />
              </div>
              {narrative?.report_classification && (
                <div className="text-[10px] font-bold text-red-400 tracking-wider">{narrative.report_classification}</div>
              )}
            </div>
          </GlassCard>

          {/* ─── SECTION: Overview ─── */}
          <Section id="overview" icon="📊" title="Executive Overview">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <StatCard label="Risk Score" value={`${summary.risk_score}/100`} accent={summary.risk_score > 66 ? "hsl(0,72%,55%)" : summary.risk_score > 33 ? "hsl(38,92%,50%)" : "hsl(152,69%,45%)"} />
              <StatCard label="Sentiment" value={reality?.average_sentiment?.toFixed(0) ?? "--"} sub="/100" accent="hsl(217,91%,60%)" />
              <StatCard label="Dissatisfaction" value={`${reality?.dissatisfaction_index?.toFixed(0) ?? "--"}%`} accent="hsl(262,83%,58%)" />
              <StatCard label="Compliance" value={compliance?.compliance_score != null ? `${compliance.compliance_score}/100` : deep?.compliance_score != null ? `${deep.compliance_score}/100` : "--"} accent={compliance?.compliance_color === "red" ? "hsl(0,72%,55%)" : compliance?.compliance_color === "amber" ? "hsl(38,92%,50%)" : "hsl(152,69%,45%)"} />
              <StatCard label="Violations" value={compliance?.total_violations ?? 0} sub={`${compliance?.total_warnings ?? 0} warnings`} accent="hsl(0,72%,55%)" />
            </div>

            {/* Executive Summary */}
            <GlassCard>
              <div className="text-base font-semibold text-foreground mb-3">📄 Executive Summary</div>
              <div className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                {narrative?.executive_narrative || summary.executive_summary}
              </div>
              {narrative?.risk_assessment_narrative && (
                <div className="mt-4 p-3 rounded-lg bg-[hsl(var(--secondary))] text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  <span className="font-semibold text-foreground">Risk Assessment: </span>
                  {narrative.risk_assessment_narrative}
                </div>
              )}
            </GlassCard>

            {/* Key Findings */}
            {narrative?.key_findings_detailed && narrative.key_findings_detailed.length > 0 ? (
              <GlassCard className="mt-4">
                <div className="text-base font-semibold text-foreground mb-3">🔍 Key Findings</div>
                <div className="space-y-3">
                  {narrative.key_findings_detailed.map((f: KeyFinding, i: number) => (
                    <div key={i} className="glass-card p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">{f.finding}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sevBg(f.severity)}`}>{f.severity}</span>
                      </div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]"><b>Evidence:</b> {f.evidence}</div>
                      <div className="text-xs text-[hsl(217,91%,70%)]"><b>Regulation:</b> {f.regulatory_implication}</div>
                      <div className="text-xs text-[hsl(152,69%,55%)]"><b>Action:</b> {f.recommended_action}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="mt-4">
                <div className="text-base font-semibold text-foreground mb-3">🔍 Key Findings</div>
                <ul className="space-y-2">
                  {summary.key_findings.map((f, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="text-[hsl(217,91%,70%)] font-bold shrink-0">•</span>
                      <span className="text-[hsl(var(--muted-foreground))]">{f}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}
          </Section>

          {/* ─── SECTION: Compliance ─── */}
          <Section id="compliance" icon="🛡️" title="Regulatory Compliance Scan">
            {compliance ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <GlassCard accent={compliance.compliance_color === "red" ? "red" : compliance.compliance_color === "amber" ? "amber" : "green"}>
                    <div className="text-center">
                      <div className="text-4xl font-black text-foreground">{compliance.compliance_score ?? "--"}</div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">Compliance Score /100</div>
                      <div className={`text-sm font-bold mt-2 ${compliance.compliance_verdict === "COMPLIANT" ? "text-emerald-400" : compliance.compliance_verdict === "NON-COMPLIANT" ? "text-red-400" : "text-amber-400"}`}>
                        {compliance.compliance_verdict}
                      </div>
                    </div>
                  </GlassCard>
                  <GlassCard>
                    <div className="text-center">
                      <div className="text-4xl font-black text-red-400">{compliance.critical_violations}</div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">Critical Violations</div>
                    </div>
                  </GlassCard>
                  <GlassCard>
                    <div className="text-center">
                      <div className="text-4xl font-black text-amber-400">{compliance.total_warnings}</div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">Warnings</div>
                    </div>
                  </GlassCard>
                </div>

                <GlassCard>
                  <div className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{compliance.scan_summary}</div>
                </GlassCard>

                {compliance.violations.length > 0 && (
                  <div className="space-y-3">
                    <div className="section-label text-red-400">⛔ Violations Found</div>
                    {compliance.violations.map((v, i) => (
                      <GlassCard key={i} className="border-l-4" style={{ borderLeftColor: sevColor(v.severity) }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-foreground">{v.violation_id.replace(/_/g, " ").toUpperCase()}</span>
                          <div className="flex gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sevBg(v.severity)}`}>{v.severity}</span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]">{v.regulator}</span>
                          </div>
                        </div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))] mb-2">{v.description}</div>
                        <div className="text-xs text-[hsl(217,91%,70%)] mb-1"><b>Regulation:</b> {v.regulation}</div>
                        <div className="text-xs text-red-400 mb-1"><b>Penalty:</b> {v.penalty}</div>
                        <div className="text-xs text-amber-400"><b>Consumer Impact:</b> {v.consumer_impact}</div>
                        {v.evidence.length > 0 && (
                          <div className="mt-2 p-2 rounded bg-[hsl(var(--secondary))] text-[10px] text-[hsl(var(--muted-foreground))] font-mono">
                            {v.evidence.slice(0, 2).map((e, j) => <div key={j}>"{e.context}"</div>)}
                          </div>
                        )}
                      </GlassCard>
                    ))}
                  </div>
                )}

                {compliance.misleading_language.length > 0 && (
                  <GlassCard>
                    <div className="section-label mb-3">🗣️ Misleading Language Detected</div>
                    <div className="space-y-2">
                      {compliance.misleading_language.map((m, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                          <span className="text-amber-400">⚠</span>
                          <div>
                            <span className="font-medium text-foreground">"{m.matched}"</span>
                            <span className="text-[hsl(var(--muted-foreground))]"> — {m.risk}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}
              </div>
            ) : (
              <GlassCard className="text-center py-6 text-[hsl(var(--muted-foreground))]">⏳ Compliance scan data not yet available. The AI analysis may still be processing — try refreshing the page.</GlassCard>
            )}
          </Section>

          {/* ─── SECTION: Claims Analysis ─── */}
          <Section id="claims" icon="📝" title="Claims & Promises Analysis">
            {claims.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="Total Claims" value={claims.length} accent="hsl(217,91%,60%)" />
                  <StatCard label="Misleading" value={misleadingClaims.length} accent="hsl(0,72%,55%)" />
                  <StatCard label="Compliant" value={claims.length - misleadingClaims.length} accent="hsl(152,69%,45%)" />
                </div>
                <div className="space-y-3">
                  {claims.map((c: ClaimAnalysis, i: number) => (
                    <GlassCard key={i} className={`border-l-4 ${c.is_misleading ? "border-l-red-500" : "border-l-emerald-500"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-foreground">{c.claim_type}</span>
                        <div className="flex gap-2">
                          {c.is_misleading && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sevBg(c.risk_level)}`}>{c.risk_level}</span>}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.is_misleading ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                            {c.is_misleading ? "MISLEADING" : "OK"}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-foreground mb-1">"{c.claim}"</div>
                      {c.is_misleading && (
                        <>
                          <div className="text-xs text-red-400 mb-1">{c.misleading_reason}</div>
                          <div className="text-xs text-[hsl(217,91%,70%)]">{c.regulatory_concern}</div>
                        </>
                      )}
                      {c.evidence_quote && (
                        <div className="mt-2 p-2 rounded bg-[hsl(var(--secondary))] text-[10px] text-[hsl(var(--muted-foreground))] italic">
                          📎 "{c.evidence_quote}"
                        </div>
                      )}
                    </GlassCard>
                  ))}
                </div>
              </div>
            ) : (
              <GlassCard className="text-center py-6 text-[hsl(var(--muted-foreground))]">⏳ Claims analysis not yet available. This requires AI processing which may take a moment.</GlassCard>
            )}
          </Section>

          {/* ─── SECTION: Risk Heatmap ─── */}
          <Section id="risk-heatmap" icon="🔥" title="Risk Dimension Heatmap">
            {heatmap.length > 0 ? (
              <GlassCard>
                <div className="space-y-3">
                  {heatmap.map((h: RiskHeatmapPoint, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground font-medium">{h.dimension}</span>
                        <span style={{ color: h.score > 66 ? "hsl(0,72%,55%)" : h.score > 33 ? "hsl(38,92%,50%)" : "hsl(152,69%,45%)" }} className="font-bold">{h.score}/100</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{
                          width: `${h.score}%`,
                          background: h.score > 66 ? "linear-gradient(90deg, hsl(25,95%,55%), hsl(0,72%,55%))" : h.score > 33 ? "linear-gradient(90deg, hsl(50,92%,50%), hsl(38,92%,50%))" : "linear-gradient(90deg, hsl(152,69%,55%), hsl(152,69%,45%))",
                        }} />
                      </div>
                      <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">{h.reasoning}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="text-center py-6 text-[hsl(var(--muted-foreground))]">⏳ Risk heatmap not yet available. The AI-powered dimensional analysis may still be processing.</GlassCard>
            )}
          </Section>

          {/* ─── SECTION: Fine Print ─── */}
          <Section id="fine-print" icon="🔎" title="Fine Print & Hidden Terms">
            {finePrint ? (
              <div className="space-y-4">
                {finePrint.hidden_conditions?.length > 0 && (
                  <GlassCard>
                    <div className="section-label mb-3">🚨 Hidden Conditions</div>
                    {finePrint.hidden_conditions.map((c, i) => (
                      <div key={i} className="flex gap-3 text-sm mb-2"><span className="text-red-400 shrink-0">•</span><span className="text-[hsl(var(--muted-foreground))]">{c}</span></div>
                    ))}
                  </GlassCard>
                )}
                {finePrint.fee_layers?.length > 0 && (
                  <GlassCard>
                    <div className="section-label mb-3">💸 Fee Layer Analysis</div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead><tr className="border-b border-[hsl(var(--border))]">
                          <th className="text-left py-2 text-[hsl(var(--muted-foreground))]">Fee Type</th>
                          <th className="text-left py-2 text-[hsl(var(--muted-foreground))]">Disclosed</th>
                          <th className="text-left py-2 text-[hsl(var(--muted-foreground))]">Actual Impact</th>
                          <th className="text-left py-2 text-[hsl(var(--muted-foreground))]">Transparency</th>
                        </tr></thead>
                        <tbody>
                          {finePrint.fee_layers.map((f, i) => (
                            <tr key={i} className="border-b border-[hsl(var(--border))]/30">
                              <td className="py-2 text-foreground font-medium">{f.fee_type}</td>
                              <td className="py-2 text-[hsl(var(--muted-foreground))]">{f.disclosed_amount}</td>
                              <td className="py-2 text-[hsl(var(--muted-foreground))]">{f.actual_impact}</td>
                              <td className={`py-2 font-semibold ${f.transparency_rating === "Hidden" ? "text-red-400" : f.transparency_rating === "Partially Hidden" ? "text-amber-400" : "text-emerald-400"}`}>{f.transparency_rating}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </GlassCard>
                )}
                {finePrint.early_exit_penalties?.length > 0 && (
                  <GlassCard>
                    <div className="section-label mb-3">🔒 Exit Penalties</div>
                    {finePrint.early_exit_penalties.map((p, i) => (
                      <div key={i} className="flex gap-3 text-sm mb-2"><span className="text-amber-400 shrink-0">⚠</span><span className="text-[hsl(var(--muted-foreground))]">{p}</span></div>
                    ))}
                  </GlassCard>
                )}
                {marketCtx && (
                  <GlassCard>
                    <div className="section-label mb-3">🇮🇳 Indian Market Context</div>
                    <div className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
                      <div><b className="text-foreground">vs Alternatives:</b> {marketCtx.comparison_with_alternatives}</div>
                      <div><b className="text-foreground">Real Return (inflation-adjusted):</b> {marketCtx.inflation_adjusted_return}</div>
                      <div><b className="text-foreground">Tax Efficiency:</b> {marketCtx.tax_efficiency_reality}</div>
                      <div><b className="text-foreground">Benchmark:</b> {marketCtx.benchmark_performance}</div>
                      <div><b className="text-foreground">Opportunity Cost:</b> {marketCtx.opportunity_cost}</div>
                    </div>
                  </GlassCard>
                )}
              </div>
            ) : (
              <GlassCard className="text-center py-6 text-[hsl(var(--muted-foreground))]">⏳ Fine print analysis not yet available. The document deep-scan may still be running.</GlassCard>
            )}
          </Section>

          {/* ─── SECTION: Deep Feedback ─── */}
          <Section id="feedback" icon="💬" title="Customer Feedback Intelligence">
            {feedback ? (
              <div className="space-y-4">
                <GlassCard>
                  <div className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{feedback.sentiment_summary}</div>
                  <div className="mt-3 flex gap-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${feedback.sentiment_trend === "DECLINING" ? "bg-red-500/10 text-red-400" : feedback.sentiment_trend === "IMPROVING" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                      Trend: {feedback.sentiment_trend}
                    </span>
                  </div>
                </GlassCard>

                {feedback.mis_selling_evidence?.length > 0 && (
                  <GlassCard>
                    <div className="section-label text-red-400 mb-3">🚨 Mis-Selling Evidence from Customers</div>
                    {feedback.mis_selling_evidence.map((e: MisSellEvidence, i: number) => (
                      <div key={i} className="glass-card p-3 mb-2">
                        <div className="text-sm font-medium text-foreground">{e.evidence_type}</div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))] italic mt-1">"{e.customer_quote}"</div>
                        <div className="text-[10px] text-amber-400 mt-1">Pattern: {e.pattern} • Confidence: {e.confidence}</div>
                      </div>
                    ))}
                  </GlassCard>
                )}

                {feedback.customer_pain_points?.length > 0 && (
                  <GlassCard>
                    <div className="section-label mb-3">😤 Customer Pain Points</div>
                    {feedback.customer_pain_points.map((p: CustomerPainPoint, i: number) => (
                      <div key={i} className="flex justify-between text-sm mb-2 py-1 border-b border-[hsl(var(--border))]/30">
                        <span className="text-[hsl(var(--muted-foreground))]">{p.pain_point}</span>
                        <span className="text-xs text-amber-400">{p.frequency} • {p.impact}</span>
                      </div>
                    ))}
                  </GlassCard>
                )}

                {feedback.agent_behavior_flags?.length > 0 && (
                  <GlassCard>
                    <div className="section-label text-red-400 mb-3">🕵️ Agent/Advisor Behavior Flags</div>
                    {feedback.agent_behavior_flags.map((f, i) => (
                      <div key={i} className="flex gap-2 text-sm mb-2"><span className="text-red-400">⚠</span><span className="text-[hsl(var(--muted-foreground))]">{f}</span></div>
                    ))}
                  </GlassCard>
                )}
              </div>
            ) : (
              /* Fallback to basic red flags/findings */
              <div className="space-y-4">
                <GlassCard>
                  <div className="section-label mb-3">🚩 Red Flags</div>
                  {summary.red_flags.map((f, i) => (
                    <div key={i} className="flex gap-3 text-sm mb-2"><span className="text-red-400">⚠</span><span className="text-[hsl(var(--muted-foreground))]">{f}</span></div>
                  ))}
                </GlassCard>
                <GlassCard>
                  <div className="section-label mb-3">🔎 Hidden Risks</div>
                  {summary.hidden_risks.map((r, i) => (
                    <div key={i} className="flex gap-3 text-sm mb-2"><span className="text-amber-400">•</span><span className="text-[hsl(var(--muted-foreground))]">{r}</span></div>
                  ))}
                </GlassCard>
              </div>
            )}
          </Section>

          {/* ─── SECTION: Consumer Advisory ─── */}
          <Section id="advisory" icon="🎯" title="Consumer Advisory">
            {advisory ? (
              <div className="space-y-4">
                <GlassCard className={`border-l-4 ${advisory.should_invest ? "border-l-emerald-500" : "border-l-red-500"}`}>
                  <div className="text-lg font-bold text-foreground mb-2">
                    {advisory.should_invest ? "✅ Generally Suitable for Investment" : "❌ Investment NOT Recommended"}
                  </div>
                  <div className="text-sm text-[hsl(var(--muted-foreground))]">{advisory.regulatory_protection}</div>
                </GlassCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassCard>
                    <div className="section-label mb-3">⚠️ Key Risks (Plain Language)</div>
                    {advisory.key_risks_in_plain_language?.map((r, i) => (
                      <div key={i} className="flex gap-3 text-sm mb-2"><span className="text-red-400 shrink-0">{i + 1}.</span><span className="text-[hsl(var(--muted-foreground))]">{r}</span></div>
                    ))}
                  </GlassCard>
                  <GlassCard>
                    <div className="section-label mb-3">❓ Questions to Ask Before Buying</div>
                    {advisory.questions_to_ask_agent?.map((q, i) => (
                      <div key={i} className="flex gap-3 text-sm mb-2"><span className="text-[hsl(217,91%,70%)] shrink-0">{i + 1}.</span><span className="text-[hsl(var(--muted-foreground))]">{q}</span></div>
                    ))}
                  </GlassCard>
                </div>

                {advisory.better_alternatives?.length > 0 && (
                  <GlassCard accent="green">
                    <div className="section-label mb-3">💡 Better Alternatives in India</div>
                    {advisory.better_alternatives.map((a, i) => (
                      <div key={i} className="flex gap-3 text-sm mb-2"><span className="text-emerald-400 shrink-0">→</span><span className="text-foreground font-medium">{a}</span></div>
                    ))}
                  </GlassCard>
                )}
              </div>
            ) : (
              <GlassCard accent="blue">
                <div className="text-base font-semibold text-foreground mb-3">🎯 Recommendations</div>
                {summary.recommendations.map((r, i) => (
                  <div key={i} className="flex gap-3 text-sm mb-2"><span className="text-emerald-400 font-bold shrink-0">{i + 1}.</span><span className="text-foreground font-medium">{r}</span></div>
                ))}
              </GlassCard>
            )}
          </Section>

          {/* ─── SECTION: SEBI Checklist ─── */}
          <Section id="checklist" icon="✅" title="SEBI/IRDAI Compliance Checklist">
            {checklist.length > 0 ? (
              <GlassCard>
                <div className="space-y-3">
                  {checklist.map((item: SEBIChecklistItem, i: number) => (
                    <div key={i} className="flex gap-3 py-2 border-b border-[hsl(var(--border))]/30 last:border-0">
                      <span className="text-lg shrink-0">{checkIcon(item.status)}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">{item.requirement}</div>
                        <div className={`text-xs font-bold mt-0.5 ${checkColor(item.status)}`}>{item.status}</div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{item.evidence}</div>
                        {item.status !== "COMPLIANT" && item.status !== "NOT APPLICABLE" && (
                          <div className="text-xs text-[hsl(152,69%,55%)] mt-1">→ {item.recommendation}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="text-center py-6 text-[hsl(var(--muted-foreground))]">⏳ SEBI/IRDAI compliance checklist not yet available. The regulatory scan may still be processing.</GlassCard>
            )}
          </Section>

          {/* ─── SECTION: Regulatory Actions ─── */}
          <Section id="actions" icon="⚖️" title="Recommended Regulatory Actions">
            {narrative?.regulatory_action_recommendations && narrative.regulatory_action_recommendations.length > 0 ? (
              <div className="space-y-3">
                {narrative.regulatory_action_recommendations.map((a: RegulatoryAction, i: number) => (
                  <GlassCard key={i} className={`border-l-4 ${a.urgency === "IMMEDIATE" ? "border-l-red-500" : a.urgency === "WITHIN 30 DAYS" ? "border-l-amber-500" : "border-l-blue-500"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-foreground">{a.action}</span>
                      <div className="flex gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.urgency === "IMMEDIATE" ? "bg-red-500/10 text-red-400" : a.urgency === "WITHIN 30 DAYS" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"}`}>{a.urgency}</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]">{a.authority}</span>
                      </div>
                    </div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{a.justification}</div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard accent="blue">
                <div className="text-base font-semibold text-foreground mb-3">🎯 Recommended Actions</div>
                {summary.recommendations.map((r, i) => (
                  <div key={i} className="flex gap-3 text-sm mb-2"><span className="text-emerald-400 font-bold">{i + 1}.</span><span className="text-foreground">{r}</span></div>
                ))}
              </GlassCard>
            )}

            {/* Conclusion */}
            {narrative?.conclusion && (
              <GlassCard className="mt-4 border border-[hsl(var(--border))]">
                <div className="text-base font-semibold text-foreground mb-2">📋 Conclusion</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{narrative.conclusion}</div>
              </GlassCard>
            )}

            {narrative?.trend_analysis && (
              <GlassCard className="mt-4">
                <div className="text-base font-semibold text-foreground mb-2">📈 Industry Trend Analysis</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{narrative.trend_analysis}</div>
              </GlassCard>
            )}
          </Section>

          {/* ─── Disclaimer ─── */}
          <div className="text-xs text-center text-[hsl(var(--muted-foreground))] py-4 opacity-60 border-t border-[hsl(var(--border))]/30 mt-8">
            This report is generated by an AI-powered decentralized system analyzing product documents against SEBI, IRDAI, and RBI regulations.
            It is intended as a screening tool and does not constitute legal or regulatory judgment. All findings should be verified by qualified compliance officers.
            <br />Generated by SimpleRisk Watch • Mis-Selling Detection AI • {now}
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
