from typing import Dict, Any, List, Optional


def compute_risk_score(
    expectations: Dict[str, Any],
    reality: Dict[str, Any],
    compliance: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Compute a final mis-selling risk score (0-100) by combining:
    1. Return gap (promised vs implied actual)
    2. Customer dissatisfaction
    3. Fee transparency gap
    4. Regulatory compliance violations  ← NEW

    Higher score = higher mis-selling risk.
    """
    comparison_data: List[Dict] = []

    # --- Return Gap ---
    promised_return = expectations.get("claimed_return") or 0.0
    avg_sentiment = reality.get("average_sentiment") or 50.0
    actual_return = round(promised_return * (avg_sentiment / 100), 2)
    return_gap_pct = 0.0
    if promised_return > 0:
        return_gap_pct = round(((promised_return - actual_return) / promised_return) * 100, 1)

    comparison_data.append({
        "metric": "Annual Return (%)",
        "promised": promised_return,
        "actual": actual_return,
        "gap": f"{return_gap_pct:+.1f}%",
    })

    # --- Dissatisfaction Gap ---
    dissatisfaction = reality.get("dissatisfaction_index") or 0.0
    comparison_data.append({
        "metric": "Customer Satisfaction (%)",
        "promised": 100.0,
        "actual": round(100 - dissatisfaction, 1),
        "gap": f"{-dissatisfaction:+.1f}%",
    })

    # --- Fee Transparency ---
    annual_fee = expectations.get("annual_fee") or 0.0
    top_topics = reality.get("top_topics") or []
    fee_perception = annual_fee * 1.3 if "Hidden Fees" in top_topics else annual_fee
    fee_gap_pct = round(((fee_perception - annual_fee) / max(annual_fee, 0.01)) * 100, 1)
    comparison_data.append({
        "metric": "Expense Ratio (%)",
        "promised": annual_fee,
        "actual": round(fee_perception, 2),
        "gap": f"{fee_gap_pct:+.1f}%",
    })

    # --- Regulatory Compliance (NEW) ---
    violation_score = 0.0
    compliance_score_val = None
    if compliance:
        critical = compliance.get("critical_violations", 0)
        high = compliance.get("high_violations", 0)
        medium = compliance.get("medium_warnings", 0)
        total_violations = compliance.get("total_violations", 0)
        total_warnings = compliance.get("total_warnings", 0)
        compliance_score_val = compliance.get("compliance_score")

        # Each critical violation adds 25 points, high adds 15, medium adds 5
        violation_score = min(100, critical * 25 + high * 15 + medium * 5)

        comparison_data.append({
            "metric": "Regulatory Compliance",
            "promised": 100.0,
            "actual": float(compliance_score_val) if compliance_score_val is not None else 0.0,
            "gap": f"{total_violations} violations, {total_warnings} warnings",
        })

    # --- Overall Risk Score ---
    # Updated weights to include compliance:
    #   25% return gap + 20% dissatisfaction + 15% fee gap + 40% compliance violations
    # If no compliance data, fall back to original weights
    norm_return_gap = min(return_gap_pct, 100)
    norm_fee_gap = min(fee_gap_pct, 100)

    if compliance:
        overall_risk_score = round(
            0.25 * norm_return_gap
            + 0.20 * dissatisfaction
            + 0.15 * norm_fee_gap
            + 0.40 * violation_score
        )
    else:
        overall_risk_score = round(
            0.40 * norm_return_gap
            + 0.30 * dissatisfaction
            + 0.30 * norm_fee_gap
        )

    overall_risk_score = max(0, min(100, overall_risk_score))

    # --- Gap Analysis Summary ---
    violation_context = ""
    if compliance and compliance.get("total_violations", 0) > 0:
        violation_context = (
            f" The regulatory compliance scan detected {compliance['total_violations']} violation(s) "
            f"(including {compliance.get('critical_violations', 0)} critical) against SEBI/IRDAI/RBI norms, "
            f"resulting in a compliance score of {compliance_score_val}/100."
        )

    if overall_risk_score >= 66:
        risk_level = "HIGH"
        summary = (
            f"⛔ This product shows a HIGH mis-selling risk score of {overall_risk_score}/100. "
            f"There is a significant gap between its promised returns ({promised_return}% p.a.) and "
            f"the effective return implied by customer sentiment ({actual_return}% p.a.). "
            f"Customer dissatisfaction stands at {dissatisfaction}%.{violation_context}"
        )
    elif overall_risk_score >= 33:
        risk_level = "MEDIUM"
        summary = (
            f"⚠️ This product has a MEDIUM mis-selling risk score of {overall_risk_score}/100. "
            f"Some gap exists between claimed ({promised_return}%) and implied actual returns ({actual_return}%). "
            f"Dissatisfaction is at {dissatisfaction}%, which warrants monitoring.{violation_context}"
        )
    else:
        risk_level = "LOW"
        summary = (
            f"✅ This product shows a LOW mis-selling risk score of {overall_risk_score}/100. "
            f"Customer feedback aligns reasonably with the product's promises. "
            f"Dissatisfaction is low at {dissatisfaction}%.{violation_context}"
        )

    return {
        "comparison_data": comparison_data,
        "gap_analysis_summary": summary,
        "overall_risk_score": overall_risk_score,
    }
