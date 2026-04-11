"""
Deep Analysis Engine — Uses Gemini LLM for comprehensive financial document analysis.
Produces detailed, India-specific insights that go far beyond keyword matching.
"""
import os
import json
import time
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv


MAX_RETRIES = 3
RETRY_DELAYS = [15, 30, 60]  # seconds


def _call_gemini(prompt: str, context_label: str = "Gemini") -> Optional[Dict]:
    """Call Gemini with retry logic for rate limits. Returns parsed JSON or None."""
    model = _get_gemini_model()
    if not model:
        return None

    for attempt in range(MAX_RETRIES):
        try:
            response = model.generate_content(prompt)
            resp_text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(resp_text)
        except Exception as e:
            err_str = str(e).lower()
            is_rate_limit = "429" in err_str or "rate" in err_str or "quota" in err_str or "resource" in err_str
            if is_rate_limit and attempt < MAX_RETRIES - 1:
                delay = RETRY_DELAYS[attempt]
                print(f"[{context_label}] Rate limited, retrying in {delay}s (attempt {attempt + 1}/{MAX_RETRIES})")
                time.sleep(delay)
            else:
                print(f"[{context_label}] Failed after {attempt + 1} attempts: {e}")
                return None
    return None


def _get_gemini_model():
    """Initialize and return Gemini model."""
    load_dotenv(override=True)
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-2.0-flash")


def deep_analyze_document(text: str, product_name: str, category: str) -> Optional[Dict[str, Any]]:
    """
    Perform deep AI-powered analysis of a financial product document.
    Returns a comprehensive analysis covering multiple risk dimensions.
    """
    model = _get_gemini_model()
    if not model:
        return None
    
    prompt = f"""You are an expert Indian financial regulator and consumer protection analyst.
Analyze this {category} product document for "{product_name}" with extreme thoroughness.

DOCUMENT TEXT (first 30000 chars):
{text[:30000]}

Produce a comprehensive JSON analysis with these EXACT keys:

{{
    "executive_summary": "A 3-4 sentence executive summary suitable for a SEBI/IRDAI compliance officer. Be specific about findings.",
    
    "product_classification": {{
        "type": "Specific product type (e.g., ELSS, ULIP, Endowment, Large-Cap Fund, Term Plan, etc.)",
        "risk_category": "Low/Moderate/High/Very High",
        "suitable_for": ["List of investor profiles this is genuinely suitable for"],
        "NOT_suitable_for": ["List of investor profiles this should NOT be sold to"],
        "sebi_classification": "SEBI scheme category if applicable"
    }},
    
    "claims_analysis": [
        {{
            "claim": "Exact claim made in the document",
            "claim_type": "Return/Safety/Liquidity/Tax/Fee/Guarantee",
            "is_misleading": true/false,
            "misleading_reason": "Why this claim could mislead Indian retail investors",
            "regulatory_concern": "Which SEBI/IRDAI/RBI guideline this may violate",
            "evidence_quote": "Direct quote from the document",
            "risk_level": "CRITICAL/HIGH/MEDIUM/LOW"
        }}
    ],
    
    "fine_print_analysis": {{
        "hidden_conditions": ["List of conditions buried in fine print that contradict main claims"],
        "exclusions": ["Important exclusions that average investors might miss"],
        "early_exit_penalties": ["Penalties for early withdrawal/surrender"],
        "fee_layers": [
            {{
                "fee_type": "Name of fee/charge",
                "disclosed_amount": "What the document states",
                "actual_impact": "True annual impact on returns",
                "transparency_rating": "Transparent/Partially Hidden/Hidden"
            }}
        ],
        "lock_in_traps": ["Any lock-in conditions that restrict investor freedom"]
    }},
    
    "indian_market_context": {{
        "comparison_with_alternatives": "How this product compares to safer alternatives available to Indian investors (PPF, EPF, NPS, direct MF)",
        "inflation_adjusted_return": "Estimated real return after inflation (Indian CPI ~5-6%)",
        "tax_efficiency_reality": "Actual tax benefit vs what's marketed (considering Section 80C limit of ₹1.5L, new vs old regime)",
        "benchmark_performance": "How this compares to relevant benchmarks (Nifty 50, Nifty Next 50, etc.)",
        "opportunity_cost": "What the investor gives up by choosing this product"
    }},
    
    "mis_selling_indicators": {{
        "overall_risk_rating": "CRITICAL/HIGH/MEDIUM/LOW",
        "indicators": [
            {{
                "indicator": "Description of the mis-selling indicator",
                "evidence": "Evidence from the document",
                "sebi_irdai_reference": "Applicable regulation",
                "impact_on_investor": "How this harms the retail investor",
                "confidence": "HIGH/MEDIUM/LOW"
            }}
        ],
        "target_demographic_risk": "Analysis of whether the product is being marketed to unsuitable demographics",
        "complexity_score": "1-10 (how complex is this product for average Indian retail investor)",
        "transparency_score": "1-10 (how transparent are the terms)"
    }},
    
    "consumer_advisory": {{
        "should_invest": true/false,
        "key_risks_in_plain_language": ["Top 5 risks explained in simple Hindi+English consumer language"],
        "questions_to_ask_agent": ["5 questions every buyer should ask before purchasing"],
        "red_flags_for_consumer": ["Clear red flags a consumer should watch for"],
        "better_alternatives": ["Simpler, more transparent alternatives available in India"],
        "regulatory_protection": "What legal protections exist for the consumer (SEBI SCORES, IRDAI IGMS, Consumer Forum)"
    }},
    
    "sebi_compliance_checklist": [
        {{
            "requirement": "Specific SEBI/IRDAI requirement",
            "status": "COMPLIANT/NON-COMPLIANT/PARTIALLY COMPLIANT/NOT APPLICABLE",
            "evidence": "What was found or missing in the document",
            "recommendation": "What needs to change"
        }}
    ],
    
    "risk_heatmap_data": [
        {{
            "dimension": "Returns Risk/Fee Risk/Liquidity Risk/Regulatory Risk/Operational Risk/Market Risk/Credit Risk",
            "score": 0-100,
            "reasoning": "Brief explanation"
        }}
    ],
    
    "numerical_extractions": {{
        "claimed_return_min": null,
        "claimed_return_max": null,
        "expense_ratio": null,
        "exit_load_percentage": null,
        "exit_load_period_months": null,
        "lock_in_months": null,
        "minimum_investment": null,
        "aum_crore": null,
        "benchmark_name": null,
        "fund_manager": null,
        "inception_date": null
    }}
}}

IMPORTANT:
- Be BRUTALLY honest. This is for consumer protection, not marketing.
- Reference specific SEBI circulars, IRDAI guidelines, or RBI norms wherever applicable.
- Consider the Indian retail investor perspective (may not be financially literate).
- Flag anything that a SEBI/IRDAI auditor would flag.
- Return ONLY valid JSON, no markdown.
"""
    return _call_gemini(prompt, "DeepAnalysis:Document")


def generate_llm_report_narrative(
    product_name: str,
    category: str,
    deep_analysis: Dict,
    expectations: Dict,
    reality: Dict,
    risk: Dict,
    compliance: Dict,
) -> Optional[Dict[str, Any]]:
    """
    Generate a comprehensive, narrative report using LLM that ties together
    all analysis dimensions into a cohesive regulatory-grade report.
    """
    context = json.dumps({
        "product_name": product_name,
        "category": category,
        "deep_analysis_summary": deep_analysis.get("executive_summary", "N/A") if deep_analysis else "N/A",
        "mis_selling_indicators": deep_analysis.get("mis_selling_indicators", {}) if deep_analysis else {},
        "claims_count": len(deep_analysis.get("claims_analysis", [])) if deep_analysis else 0,
        "misleading_claims": [c for c in (deep_analysis.get("claims_analysis", []) if deep_analysis else []) if c.get("is_misleading")],
        "compliance_score": compliance.get("compliance_score"),
            "violations": compliance.get("total_violations", 0),
        "risk_score": risk.get("overall_risk_score", 0),
        "sentiment": reality.get("average_sentiment"),
        "dissatisfaction": reality.get("dissatisfaction_index"),
        "top_complaints": reality.get("top_topics", []),
        "claimed_return": expectations.get("claimed_return"),
    }, indent=2, default=str)
    
    prompt = f"""You are writing a professional financial mis-selling detection report for Indian regulators.

ANALYSIS DATA:
{context}

Generate a JSON report with these keys:

{{
    "report_title": "Professional report title",
    "report_classification": "CONFIDENTIAL - REGULATORY USE",
    "executive_narrative": "A detailed 5-7 sentence executive summary that a SEBI/IRDAI officer would find actionable. Include specific numbers and findings.",
    
    "risk_assessment_narrative": "A 4-5 sentence assessment of the overall risk, referencing the risk score, compliance score, and customer feedback. Be specific.",
    
    "key_findings_detailed": [
        {{
            "finding": "Clear, specific finding",
            "severity": "CRITICAL/HIGH/MEDIUM/LOW",
            "evidence": "Supporting evidence",
            "regulatory_implication": "Which regulation is implicated",
            "recommended_action": "Specific action to take"
        }}
    ],
    
    "consumer_impact_assessment": {{
        "affected_demographic": "Who is most likely to be harmed",
        "financial_impact_estimate": "Estimated financial impact on a typical ₹1 lakh investment over 5 years",
        "information_asymmetry_score": "1-10 (how much does the seller know that the buyer doesn't)",
        "vulnerability_factors": ["Factors that make Indian consumers vulnerable to this product"]
    }},
    
    "regulatory_action_recommendations": [
        {{
            "action": "Specific recommended regulatory action",
            "urgency": "IMMEDIATE/WITHIN 30 DAYS/ROUTINE",
            "authority": "SEBI/IRDAI/RBI/Consumer Forum",
            "justification": "Why this action is needed"
        }}
    ],
    
    "compliance_gaps": [
        {{
            "gap": "Description of compliance gap",
            "current_state": "What the product currently does",
            "required_state": "What regulations require",
            "regulation_reference": "Specific regulation"
        }}
    ],
    
    "trend_analysis": "How this product's risk profile compares to industry trends in India",
    
    "conclusion": "2-3 sentence final conclusion with clear verdict"
}}

Return ONLY valid JSON.
"""
    return _call_gemini(prompt, "DeepAnalysis:Narrative")


def generate_feedback_deep_analysis(
    feedback_texts: List[str],
    product_name: str,
    category: str,
) -> Optional[Dict[str, Any]]:
    """
    Use LLM to deeply analyze customer feedback instead of simple keyword matching.
    """
    if not feedback_texts:
        return None
    # Send representative sample
    sample = feedback_texts[:50]
    feedback_block = "\n---\n".join(sample)

    prompt = f"""You are analyzing customer feedback for the Indian financial product "{product_name}" ({category}).

CUSTOMER FEEDBACK ({len(sample)} samples):
{feedback_block[:20000]}

Analyze this feedback deeply and return JSON:

{{
    "overall_sentiment_score": 0-100 (0=extremely negative, 100=extremely positive),
    "dissatisfaction_percentage": 0-100,
    "sentiment_summary": "3-4 sentence summary of overall customer sentiment",
    
    "complaint_categories": [
        {{
            "category": "Category name",
            "percentage": 0-100,
            "severity": "CRITICAL/HIGH/MEDIUM/LOW",
            "representative_quotes": ["1-2 representative customer quotes"],
            "root_cause": "Likely root cause of this complaint"
        }}
    ],
    
    "mis_selling_evidence": [
        {{
            "evidence_type": "Type of mis-selling evidence found",
            "customer_quote": "Direct quote suggesting mis-selling",
            "confidence": "HIGH/MEDIUM/LOW",
            "pattern": "What mis-selling pattern this suggests"
        }}
    ],
    
    "positive_aspects": ["What customers genuinely appreciate"],
    "negative_aspects": ["What customers consistently complain about"],
    
    "customer_pain_points": [
        {{
            "pain_point": "Description",
            "frequency": "How often this appears",
            "impact": "How severely this affects customers"
        }}
    ],
    
    "agent_behavior_flags": ["Any mentions of agent/advisor mis-behavior"],
    
    "sentiment_trend": "IMPROVING/STABLE/DECLINING based on feedback patterns",
    
    "india_specific_issues": ["Issues specific to Indian market context (e.g., agent pressure, family pressure, festival selling)"]
}}

Return ONLY valid JSON.
"""
    return _call_gemini(prompt, "DeepAnalysis:Feedback")

