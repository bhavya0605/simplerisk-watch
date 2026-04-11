"""
AI Insights Engine — generates human-readable explanations, recommendations,
and structured analysis from raw expectation/reality/risk data.
"""
from typing import Dict, Any, List, Optional


# ─── Severity Classification ──────────────────────────────────────────────
def _severity(gap_pct: float) -> str:
    if gap_pct >= 50:
        return "Severe"
    elif gap_pct >= 25:
        return "Moderate"
    return "Minor"


def _verdict(risk_score: int) -> str:
    if risk_score >= 66:
        return "High Risk"
    elif risk_score >= 33:
        return "Monitor"
    return "Safe"


def _verdict_color(verdict: str) -> str:
    return {"High Risk": "red", "Monitor": "amber", "Safe": "green"}.get(verdict, "gray")


# ─── Metric Insight Generator ─────────────────────────────────────────────
def generate_metric_insight(
    metric_name: str, value: float, context: Dict[str, Any]
) -> Dict[str, Any]:
    """Generate a rich insight block for a single metric."""

    if metric_name == "sentiment":
        if value < 30:
            tone = "critically negative"
            reason = "Overwhelming customer dissatisfaction detected across feedback sources."
            action = "Immediate regulatory review recommended. Escalate to compliance team."
        elif value < 50:
            tone = "negative"
            reason = "Significant negative sentiment driven by unmet promises and service gaps."
            action = "Flag for review. Investigate top complaint categories for root cause."
        elif value < 70:
            tone = "mixed"
            reason = "Moderate satisfaction levels with notable pockets of dissatisfaction."
            action = "Monitor closely. Address complaint categories exceeding 20% share."
        else:
            tone = "positive"
            reason = "Customer experience largely aligns with product expectations."
            action = "Continue monitoring. No immediate action required."

        # Build contributing factors from complaint data
        factors = []
        complaint_data = context.get("complaint_data", [])
        for item in complaint_data[:3]:
            factors.append({
                "factor": item.get("name", "Unknown"),
                "percentage": item.get("value", 0),
                "description": _complaint_description(item.get("name", ""))
            })

        return {
            "metric": "Customer Sentiment Score",
            "value": value,
            "unit": "/ 100",
            "tone": tone,
            "insight": f"Customer sentiment is {tone} at {value:.1f}/100. {reason}",
            "interpretation": _sentiment_interpretation(value, complaint_data),
            "contributing_factors": factors,
            "recommendation": action,
            "severity": _severity(100 - value),
        }

    elif metric_name == "dissatisfaction":
        if value > 50:
            insight = f"Critical: {value:.1f}% of customers express dissatisfaction — more than half the user base."
            action = "Urgent: Product should be suspended pending investigation."
        elif value > 25:
            insight = f"Warning: {value:.1f}% dissatisfaction rate indicates systemic issues with product delivery."
            action = "Flag for regulatory review. Conduct root-cause analysis."
        else:
            insight = f"Dissatisfaction at {value:.1f}% is within acceptable range but should be monitored."
            action = "Continue periodic monitoring. Track trend over time."

        return {
            "metric": "Customer Dissatisfaction Index",
            "value": value,
            "unit": "%",
            "insight": insight,
            "recommendation": action,
            "severity": _severity(value),
        }

    elif metric_name == "risk_score":
        verdict = _verdict(int(value))
        weight_breakdown = context.get("weight_breakdown", {})

        if value >= 66:
            insight = (
                f"HIGH mis-selling risk ({value}/100). Strong evidence of gap between "
                "marketed claims and actual customer experience."
            )
            action = "Recommend immediate regulatory investigation and potential product suspension."
        elif value >= 33:
            insight = (
                f"MODERATE mis-selling risk ({value}/100). Some discrepancies detected between "
                "product promises and customer outcomes."
            )
            action = "Place under active monitoring. Schedule detailed audit within 30 days."
        else:
            insight = (
                f"LOW mis-selling risk ({value}/100). Product performance broadly aligns "
                "with advertised claims."
            )
            action = "No immediate concern. Standard periodic review sufficient."

        return {
            "metric": "Mis-Selling Risk Score",
            "value": value,
            "unit": "/ 100",
            "verdict": verdict,
            "verdict_color": _verdict_color(verdict),
            "insight": insight,
            "weight_breakdown": weight_breakdown,
            "recommendation": action,
            "severity": _severity(value),
        }

    return {"metric": metric_name, "value": value, "insight": "No analysis available."}


# ─── Gap Analysis Generator ───────────────────────────────────────────────
def generate_gap_analysis(
    comparison_data: List[Dict], expectations: Dict, reality: Dict
) -> List[Dict[str, Any]]:
    """Generate detailed gap analysis for each comparison metric."""
    gaps = []
    for item in comparison_data:
        metric = item.get("metric", "")
        promised = item.get("promised", 0)
        actual = item.get("actual", 0)
        diff = abs(promised - actual)
        gap_pct = (diff / max(promised, 0.01)) * 100 if promised else 0

        severity = _severity(gap_pct)

        if "Return" in metric:
            if gap_pct > 30:
                explanation = (
                    "Promised returns significantly exceed actual customer-perceived outcomes. "
                    "This suggests inflated marketing claims or market underperformance."
                )
            elif gap_pct > 10:
                explanation = (
                    "Moderate gap between promised and perceived returns. "
                    "May indicate overly optimistic marketing or recent market volatility."
                )
            else:
                explanation = "Returns broadly align with customer expectations."
            statement = f"Promised {promised}% return vs. {actual}% perceived by customers."

        elif "Satisfaction" in metric:
            explanation = (
                f"Customer satisfaction at {actual}% falls short of the ideal 100%. "
                "Key drivers include service quality, fee transparency, and return performance."
            )
            statement = f"Expected full satisfaction vs. {actual}% actual satisfaction."

        elif "Expense" in metric or "Fee" in metric:
            if gap_pct > 20:
                explanation = (
                    "Hidden or undisclosed fees detected through customer complaints. "
                    "Actual cost burden exceeds stated expense ratio."
                )
            else:
                explanation = "Fee structure broadly matches disclosed rates."
            statement = f"Stated {promised}% fee vs. {actual}% effective cost perceived."

        else:
            explanation = f"Gap of {diff:.1f} detected between promised and actual values."
            statement = f"Promised: {promised} vs Actual: {actual}"

        gaps.append({
            "metric": metric,
            "promised": promised,
            "actual": actual,
            "gap_percentage": round(gap_pct, 1),
            "severity": severity,
            "comparison_statement": statement,
            "explanation": explanation,
        })

    return gaps


# ─── AI Summary Generator ─────────────────────────────────────────────────
def generate_ai_summary(
    product_name: str,
    category: str,
    expectations: Dict[str, Any],
    reality: Dict[str, Any],
    risk: Dict[str, Any],
) -> Dict[str, Any]:
    """Generate the comprehensive AI analysis summary panel."""

    risk_score = risk.get("overall_risk_score", 0) or 0
    avg_sentiment = reality.get("average_sentiment", 50) or 50
    dissatisfaction = reality.get("dissatisfaction_index", 0) or 0
    complaint_data = reality.get("complaint_data", [])
    top_topics = reality.get("top_topics", [])
    claimed_return = expectations.get("claimed_return", 0) or 0
    risk_profile = expectations.get("risk_profile_score", 50) or 50

    verdict = _verdict(risk_score)

    # ── Health Summary ──
    if risk_score >= 66:
        health = (
            f"{product_name} exhibits significant indicators of potential mis-selling. "
            f"Customer sentiment is critically low at {avg_sentiment:.0f}/100, with "
            f"{dissatisfaction:.0f}% of users expressing dissatisfaction. The gap between "
            "marketed promises and actual customer experience warrants immediate attention."
        )
    elif risk_score >= 33:
        health = (
            f"{product_name} shows moderate risk indicators. While not critically concerning, "
            f"a sentiment score of {avg_sentiment:.0f}/100 and dissatisfaction rate of "
            f"{dissatisfaction:.0f}% suggest room for improvement. Monitoring recommended."
        )
    else:
        health = (
            f"{product_name} appears to operate within acceptable norms. "
            f"Customer sentiment at {avg_sentiment:.0f}/100 and low dissatisfaction of "
            f"{dissatisfaction:.0f}% indicate reasonable alignment between product claims "
            "and customer experience."
        )

    # ── Red Flags ──
    red_flags = []
    if dissatisfaction > 40:
        red_flags.append("High customer dissatisfaction rate (>{:.0f}%) — significantly above industry threshold.".format(dissatisfaction))
    if avg_sentiment < 40:
        red_flags.append("Critically low sentiment score indicates widespread negative experience.")
    if "Hidden Fees" in top_topics:
        red_flags.append("Hidden fee complaints detected — potential non-disclosure of actual costs.")
    if "Mis-selling" in top_topics:
        red_flags.append("Direct mis-selling allegations found in customer feedback.")
    if "Liquidity Issues" in top_topics:
        red_flags.append("Liquidity concerns raised — customers reporting difficulty accessing funds.")
    if claimed_return and claimed_return > 15:
        red_flags.append(f"Unusually high claimed return ({claimed_return}%) may indicate unrealistic promises.")
    if risk_profile >= 70 and any("safe" in str(t).lower() or "guaranteed" in str(t).lower() for t in top_topics):
        red_flags.append("High risk product marketed with safety/guarantee language — potential mis-representation.")

    if not red_flags:
        red_flags.append("No critical red flags detected in current analysis.")

    # ── Hidden Risks ──
    hidden_risks = []
    if complaint_data:
        minor_complaints = [c for c in complaint_data if c.get("value", 0) < 15 and c.get("name") != "Other"]
        for c in minor_complaints:
            hidden_risks.append(
                f"Low-volume but emerging '{c['name']}' complaints ({c['value']}%) may indicate a developing trend."
            )
    if not hidden_risks:
        hidden_risks.append("No hidden risks identified at this time. Continue periodic monitoring.")

    # ── Risk Weight Breakdown ──
    weight_breakdown = _compute_risk_weights(expectations, reality)

    # ── Recommendations ──
    recommendations = []
    if risk_score >= 66:
        recommendations.append("Initiate formal investigation by compliance team.")
        recommendations.append("Consider temporary suspension of product marketing.")
        recommendations.append("Notify relevant regulatory body (SEBI/IRDAI).")
    elif risk_score >= 33:
        recommendations.append("Schedule detailed product audit within 30 days.")
        recommendations.append("Investigate top customer complaint categories.")
        recommendations.append("Review marketing materials for accuracy.")
    else:
        recommendations.append("Continue standard periodic monitoring.")
        recommendations.append("Track sentiment trends for early warning signals.")

    # ── Executive Summary (for reports) ──
    exec_summary = (
        f"Analysis of {product_name} ({category}) reveals a mis-selling risk score of "
        f"{risk_score}/100 ({verdict}). Customer sentiment stands at {avg_sentiment:.0f}/100 "
        f"with a {dissatisfaction:.0f}% dissatisfaction rate. "
        f"{'Multiple red flags were identified requiring attention. ' if len(red_flags) > 1 and red_flags[0] != 'No critical red flags detected in current analysis.' else ''}"
        f"The analysis is based on document keyword extraction and aggregated customer feedback "
        f"from multiple online sources."
    )

    return {
        "product_name": product_name,
        "category": category,
        "verdict": verdict,
        "verdict_color": _verdict_color(verdict),
        "risk_score": risk_score,
        "health_summary": health,
        "red_flags": red_flags,
        "hidden_risks": hidden_risks,
        "weight_breakdown": weight_breakdown,
        "recommendations": recommendations,
        "executive_summary": exec_summary,
        "key_findings": _generate_key_findings(expectations, reality, risk),
    }


# ─── Chart Annotation Generator ───────────────────────────────────────────
def generate_chart_annotations(
    chart_type: str, data: List[Dict], context: Dict = None
) -> Dict[str, Any]:
    """Generate titles, captions, and anomaly highlights for charts."""

    if chart_type == "complaint_pie":
        dominant = max(data, key=lambda x: x.get("value", 0)) if data else {}
        total_categories = len(data)
        return {
            "title": "Customer Complaint Distribution",
            "subtitle": "Breakdown of complaint categories from aggregated feedback",
            "caption": (
                f"'{dominant.get('name', 'N/A')}' dominates at {dominant.get('value', 0)}% of complaints. "
                f"{total_categories} distinct complaint categories identified across feedback sources."
            ),
            "anomalies": _detect_pie_anomalies(data),
        }

    elif chart_type == "sentiment_histogram":
        low_end = sum(d.get("count", 0) for d in data if d.get("range", "") in ["0-20", "21-40"])
        high_end = sum(d.get("count", 0) for d in data if d.get("range", "") in ["81-100"])
        total = sum(d.get("count", 0) for d in data)

        if total == 0:
            caption = "No sentiment data available."
        elif low_end > high_end * 1.5:
            caption = (
                f"Sentiment skews negative: {low_end} feedback entries in the low range vs "
                f"{high_end} in the positive range. Indicates systemic dissatisfaction."
            )
        elif high_end > low_end * 1.5:
            caption = (
                f"Sentiment skews positive: {high_end} entries in the high range. "
                "Majority of customers report satisfactory experience."
            )
        else:
            caption = "Sentiment is evenly distributed, suggesting mixed customer experience."

        return {
            "title": "Sentiment Score Distribution",
            "subtitle": "How customer feedback scores are distributed across sentiment ranges",
            "caption": caption,
            "anomalies": _detect_histogram_anomalies(data),
        }

    elif chart_type == "comparison_bar":
        max_gap_item = max(data, key=lambda x: abs(x.get("promised", 0) - x.get("actual", 0))) if data else {}
        return {
            "title": "Expectation vs. Reality Gap Analysis",
            "subtitle": "Comparing marketed promises against actual customer experience",
            "caption": (
                f"Largest gap detected in '{max_gap_item.get('metric', 'N/A')}': "
                f"promised {max_gap_item.get('promised', 0)} vs actual {max_gap_item.get('actual', 0)}."
            ),
            "anomalies": [],
        }

    elif chart_type == "radar":
        if not data:
            return {"title": "Product Dimension Analysis", "subtitle": "", "caption": "No data.", "anomalies": []}
        highest = max(data, key=lambda x: x.get("value", 0))
        lowest = min(data, key=lambda x: x.get("value", 0))
        return {
            "title": "Product Claim Strength Radar",
            "subtitle": "How strongly the product markets each dimension in its documentation",
            "caption": (
                f"Strongest claim: '{highest.get('dimension', '')}' ({highest.get('value', 0)}/100). "
                f"Weakest area: '{lowest.get('dimension', '')}' ({lowest.get('value', 0)}/100)."
            ),
            "anomalies": [],
        }

    return {"title": chart_type, "subtitle": "", "caption": "", "anomalies": []}


# ─── Internal Helpers ──────────────────────────────────────────────────────
def _complaint_description(name: str) -> str:
    descriptions = {
        "Mis-selling": "Customers allege deceptive sales practices or misrepresentation of product features.",
        "Hidden Fees": "Undisclosed charges discovered after purchase, contradicting fee transparency claims.",
        "Low Returns": "Actual returns fell significantly short of advertised or expected performance.",
        "Poor Service": "Customer support rated inadequate — slow responses, unhelpful agents.",
        "Liquidity Issues": "Difficulty withdrawing or redeeming invested funds when needed.",
        "Other": "General complaints not fitting specific categories — may warrant further investigation.",
    }
    return descriptions.get(name, "Complaint category requiring further analysis.")


def _sentiment_interpretation(score: float, complaints: List[Dict]) -> str:
    top_complaint = complaints[0].get("name", "general issues") if complaints else "general issues"
    if score < 40:
        return (
            f"This critically low sentiment score indicates severe disconnect between "
            f"product promises and customer experience. Primary driver: {top_complaint}. "
            "This pattern is consistent with potential mis-selling behavior."
        )
    elif score < 60:
        return (
            f"Mixed sentiment suggests the product partially meets expectations but has "
            f"notable gaps. '{top_complaint}' is the dominant complaint, indicating "
            "specific areas where the product falls short of its marketing claims."
        )
    else:
        return (
            f"Generally positive sentiment indicates reasonable customer satisfaction. "
            f"Minor concerns around '{top_complaint}' should be monitored but do not "
            "indicate systemic issues at this time."
        )


def _compute_risk_weights(expectations: Dict, reality: Dict) -> Dict[str, Any]:
    """Compute the contribution of each factor to the overall risk score."""
    claimed_return = expectations.get("claimed_return", 0) or 0
    avg_sentiment = reality.get("average_sentiment", 50) or 50
    dissatisfaction = reality.get("dissatisfaction_index", 0) or 0
    top_topics = reality.get("top_topics", [])

    # Weights match risk_score.py formula (25/20/15/40 when compliance present)
    return {
        "sentiment_impact": {
            "weight": 25,
            "label": "Return Gap (Sentiment-based)",
            "description": f"Sentiment at {avg_sentiment:.0f}/100 indicates {'poor' if avg_sentiment < 50 else 'moderate' if avg_sentiment < 70 else 'good'} perceived returns.",
        },
        "complaint_frequency": {
            "weight": 20,
            "label": "Dissatisfaction Rate",
            "description": f"{dissatisfaction:.0f}% of customers express active dissatisfaction.",
        },
        "promise_mismatch": {
            "weight": 15,
            "label": "Fee/Promise Mismatch",
            "description": "Hidden Fees complaints detected." if "Hidden Fees" in top_topics else "No significant fee mismatch detected.",
        },
        "compliance_violations": {
            "weight": 40,
            "label": "Regulatory Violations",
            "description": "SEBI/IRDAI/RBI compliance violations detected in product documentation. Each critical violation adds 25 points to risk.",
        },
    }


def _generate_key_findings(expectations: Dict, reality: Dict, risk: Dict) -> List[str]:
    findings = []
    risk_score = risk.get("overall_risk_score", 0) or 0
    avg_sentiment = reality.get("average_sentiment", 50) or 50
    dissatisfaction = reality.get("dissatisfaction_index", 0) or 0
    claimed_return = expectations.get("claimed_return") or 0
    top_topics = reality.get("top_topics", [])

    findings.append(f"Overall risk score: {risk_score}/100 ({_verdict(risk_score)}).")
    findings.append(f"Customer sentiment averages {avg_sentiment:.0f}/100 across feedback sources.")
    findings.append(f"Dissatisfaction rate stands at {dissatisfaction:.0f}% of surveyed feedback.")

    if claimed_return:
        findings.append(f"Product advertises {claimed_return}% annual returns.")
    if "Hidden Fees" in top_topics:
        findings.append("Hidden fee complaints identified — fee transparency may be inadequate.")
    if "Mis-selling" in top_topics:
        findings.append("Direct allegations of mis-selling detected in customer feedback.")

    return findings


def _detect_pie_anomalies(data: List[Dict]) -> List[str]:
    anomalies = []
    for item in data:
        if item.get("value", 0) > 60:
            anomalies.append(
                f"'{item['name']}' at {item['value']}% is disproportionately high — investigate root cause."
            )
    return anomalies


def _detect_histogram_anomalies(data: List[Dict]) -> List[str]:
    anomalies = []
    counts = {d.get("range", ""): d.get("count", 0) for d in data}
    if counts.get("0-20", 0) > counts.get("81-100", 0):
        anomalies.append("More extremely negative reviews than positive — potential customer crisis.")
    return anomalies
