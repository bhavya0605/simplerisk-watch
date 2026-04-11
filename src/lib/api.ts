const API_BASE = "http://127.0.0.1:8000/api";

export interface Product {
  id: string;
  name: string;
  category: string;
  document_url: string | null;
  source_url: string | null;
  created_at: string;
}

export interface RadarDataPoint {
  dimension: string;
  value: number;
  fullMark: number;
}

export interface ExpectationData {
  id: string;
  product_id: string;
  risk_profile_score: number | null;
  claimed_return: number | null;
  annual_fee: number | null;
  lock_in_period: number | null;
  radar_data: RadarDataPoint[] | null;
}

export interface ComplaintCategory {
  name: string;
  value: number;
}

export interface SentimentBucket {
  range: string;
  count: number;
}

export interface RealityData {
  id: string;
  product_id: string;
  average_sentiment: number | null;
  dissatisfaction_index: number | null;
  complaint_data: ComplaintCategory[] | null;
  sentiment_distribution: SentimentBucket[] | null;
  top_topics: string[] | null;
}

export interface ComparisonMetric {
  metric: string;
  promised: number;
  actual: number;
  gap: string;
}

export interface RiskEvaluationData {
  id: string;
  product_id: string;
  comparison_data: ComparisonMetric[] | null;
  gap_analysis_summary: string | null;
  overall_risk_score: number | null;
}

// ---- Insight Types ----

export interface ContributingFactor {
  factor: string;
  percentage: number;
  description: string;
}

export interface MetricInsight {
  metric: string;
  value: number;
  unit: string;
  tone?: string;
  insight: string;
  interpretation?: string;
  contributing_factors?: ContributingFactor[];
  recommendation: string;
  severity: string;
  verdict?: string;
  verdict_color?: string;
  weight_breakdown?: Record<string, { weight: number; label: string; description: string }>;
}

export interface GapAnalysisItem {
  metric: string;
  promised: number;
  actual: number;
  gap_percentage: number;
  severity: string;
  comparison_statement: string;
  explanation: string;
}

export interface AISummary {
  product_name: string;
  category: string;
  verdict: string;
  verdict_color: string;
  risk_score: number;
  health_summary: string;
  red_flags: string[];
  hidden_risks: string[];
  weight_breakdown: Record<string, { weight: number; label: string; description: string }>;
  recommendations: string[];
  executive_summary: string;
  key_findings: string[];
}

export interface ChartAnnotation {
  title: string;
  subtitle: string;
  caption: string;
  anomalies: string[];
}

// ---- Deep Analysis Types ----

export interface ClaimAnalysis {
  claim: string;
  claim_type: string;
  is_misleading: boolean;
  misleading_reason: string;
  regulatory_concern: string;
  evidence_quote: string;
  risk_level: string;
}

export interface ComplianceViolation {
  violation_id: string;
  regulator: string;
  severity: string;
  regulation: string;
  description: string;
  penalty: string;
  consumer_impact: string;
  match_count: number;
  evidence: { matched_text: string; context: string; position: number }[];
}

export interface ComplianceScan {
  compliance_score: number | null;
  compliance_verdict: string;
  compliance_color: string;
  total_violations: number;
  total_warnings: number;
  critical_violations: number;
  high_violations: number;
  medium_warnings: number;
  violations: ComplianceViolation[];
  warnings: ComplianceViolation[];
  misleading_language: { type: string; matched: string; risk: string }[];
  scan_summary: string;
}

export interface RiskHeatmapPoint {
  dimension: string;
  score: number;
  reasoning: string;
}

export interface FeeLayer {
  fee_type: string;
  disclosed_amount: string;
  actual_impact: string;
  transparency_rating: string;
}

export interface KeyFinding {
  finding: string;
  severity: string;
  evidence: string;
  regulatory_implication: string;
  recommended_action: string;
}

export interface ConsumerImpact {
  affected_demographic: string;
  financial_impact_estimate: string;
  information_asymmetry_score: string;
  vulnerability_factors: string[];
}

export interface RegulatoryAction {
  action: string;
  urgency: string;
  authority: string;
  justification: string;
}

export interface ComplianceGap {
  gap: string;
  current_state: string;
  required_state: string;
  regulation_reference: string;
}

export interface SEBIChecklistItem {
  requirement: string;
  status: string;
  evidence: string;
  recommendation: string;
}

export interface ConsumerAdvisory {
  should_invest: boolean;
  key_risks_in_plain_language: string[];
  questions_to_ask_agent: string[];
  red_flags_for_consumer: string[];
  better_alternatives: string[];
  regulatory_protection: string;
}

export interface ReportNarrative {
  report_title: string;
  report_classification: string;
  executive_narrative: string;
  risk_assessment_narrative: string;
  key_findings_detailed: KeyFinding[];
  consumer_impact_assessment: ConsumerImpact;
  regulatory_action_recommendations: RegulatoryAction[];
  compliance_gaps: ComplianceGap[];
  trend_analysis: string;
  conclusion: string;
}

export interface DocumentAnalysis {
  executive_summary: string;
  product_classification: {
    type: string;
    risk_category: string;
    suitable_for: string[];
    NOT_suitable_for: string[];
    sebi_classification: string;
  };
  claims_analysis: ClaimAnalysis[];
  fine_print_analysis: {
    hidden_conditions: string[];
    exclusions: string[];
    early_exit_penalties: string[];
    fee_layers: FeeLayer[];
    lock_in_traps: string[];
  };
  indian_market_context: {
    comparison_with_alternatives: string;
    inflation_adjusted_return: string;
    tax_efficiency_reality: string;
    benchmark_performance: string;
    opportunity_cost: string;
  };
  mis_selling_indicators: {
    overall_risk_rating: string;
    indicators: {
      indicator: string;
      evidence: string;
      sebi_irdai_reference: string;
      impact_on_investor: string;
      confidence: string;
    }[];
    target_demographic_risk: string;
    complexity_score: string;
    transparency_score: string;
  };
  consumer_advisory: ConsumerAdvisory;
  sebi_compliance_checklist: SEBIChecklistItem[];
  risk_heatmap_data: RiskHeatmapPoint[];
}

export interface DeepAnalysisData {
  compliance_score: number | null;
  compliance_scan: ComplianceScan | null;
  report_narrative: ReportNarrative | null;
  document_analysis: DocumentAnalysis | null;
  risk_heatmap: RiskHeatmapPoint[] | null;
  claims_analysis: ClaimAnalysis[] | null;
  consumer_advisory: ConsumerAdvisory | null;
  sebi_checklist: SEBIChecklistItem[] | null;
}

export interface MisSellEvidence {
  evidence_type: string;
  customer_quote: string;
  confidence: string;
  pattern: string;
}

export interface CustomerPainPoint {
  pain_point: string;
  frequency: string;
  impact: string;
}

export interface DeepFeedbackCategory {
  category: string;
  percentage: number;
  severity: string;
  representative_quotes: string[];
  root_cause: string;
}

export interface DeepFeedbackAnalysis {
  overall_sentiment_score: number;
  dissatisfaction_percentage: number;
  sentiment_summary: string;
  complaint_categories: DeepFeedbackCategory[];
  mis_selling_evidence: MisSellEvidence[];
  positive_aspects: string[];
  negative_aspects: string[];
  customer_pain_points: CustomerPainPoint[];
  agent_behavior_flags: string[];
  sentiment_trend: string;
  india_specific_issues: string[];
}

export interface InsightsData {
  product_id: string;
  product_name: string;
  category: string;
  sentiment_insight: MetricInsight;
  dissatisfaction_insight: MetricInsight;
  risk_insight: MetricInsight;
  gap_analysis: GapAnalysisItem[];
  ai_summary: AISummary;
  chart_annotations: {
    complaint_pie: ChartAnnotation;
    sentiment_histogram: ChartAnnotation;
    comparison_bar: ChartAnnotation;
    radar: ChartAnnotation;
  };
  deep_analysis?: DeepAnalysisData;
}

// ---- Product APIs ----

export async function uploadProduct(
  file: File,
  name: string,
  category: string
): Promise<Product> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);
  formData.append("category", category);

  const res = await fetch(`${API_BASE}/products/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  return res.json();
}

export async function listProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products/`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}

// ---- Analysis APIs ----

export async function getExpectation(productId: string): Promise<ExpectationData> {
  const res = await fetch(`${API_BASE}/products/${productId}/expectation`);
  if (!res.ok) throw new Error("Expectation analysis not ready");
  return res.json();
}

export async function getReality(productId: string): Promise<RealityData> {
  const res = await fetch(`${API_BASE}/products/${productId}/reality`);
  if (!res.ok) throw new Error("Reality analysis not ready");
  return res.json();
}

export async function getComparison(productId: string): Promise<RiskEvaluationData> {
  const res = await fetch(`${API_BASE}/products/${productId}/comparison`);
  if (!res.ok) throw new Error("Risk evaluation not ready");
  return res.json();
}

export async function getInsights(productId: string): Promise<InsightsData> {
  const res = await fetch(`${API_BASE}/products/${productId}/insights`);
  if (!res.ok) throw new Error("Insights not ready");
  return res.json();
}

export async function getDeepAnalysis(productId: string): Promise<{
  product_id: string;
  product_name: string;
  category: string;
  document_analysis: DocumentAnalysis | null;
  compliance_scan: ComplianceScan | null;
  report_narrative: ReportNarrative | null;
  compliance_score: number | null;
  risk_heatmap: RiskHeatmapPoint[] | null;
  claims_analysis: ClaimAnalysis[] | null;
  consumer_advisory: ConsumerAdvisory | null;
  sebi_checklist: SEBIChecklistItem[] | null;
  deep_feedback: DeepFeedbackAnalysis | null;
}> {
  const res = await fetch(`${API_BASE}/products/${productId}/deep-analysis`);
  if (!res.ok) throw new Error("Deep analysis not ready");
  return res.json();
}

// ---- Scrape API ----

export async function triggerScrape(category: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/scrape/?category=${encodeURIComponent(category)}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Scrape trigger failed");
  return res.json();
}

// ---- News Feed ----

export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  category: string;
  tags: string[];
  published_at: string;
  url: string;
  sentiment: string; // "positive" | "negative" | "caution" | "warning"
  relevance_score: number;
}

export async function fetchNewsFeed(category?: string): Promise<NewsItem[]> {
  const params = category && category !== "All" ? `?category=${encodeURIComponent(category)}` : "";
  const res = await fetch(`${API_BASE}/news/feed${params}`);
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}

// ---- Chat ----

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatContext {
  product_name?: string;
  category?: string;
  headline?: string;
  summary?: string;
  risk_score?: number;
  sentiment_score?: number;
}

export async function sendChatMessage(
  messages: ChatMessage[],
  context: ChatContext
): Promise<{ response: string; source: string }> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, context }),
  });
  if (!res.ok) throw new Error("Chat failed");
  return res.json();
}
