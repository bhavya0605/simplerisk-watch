import re
from typing import Dict, Any, List


# Keywords to identify claim dimensions in text
DIMENSION_KEYWORDS = {
    "Returns": ["return", "yield", "profit", "gain", "growth"],
    "Safety": ["safe", "secure", "guaranteed", "low risk", "capital protection"],
    "Liquidity": ["liquid", "withdraw", "redemption", "anytime", "flexible"],
    "Tax Benefit": ["tax", "80c", "deduction", "exempt", "elss"],
    "Transparency": ["transparent", "disclosed", "sebi", "regulated", "audited"],
}

RISK_LABELS = {
    "low": 25,
    "moderate": 50,
    "moderately high": 70,
    "high": 85,
    "very high": 95,
}


def _score_dimension(text: str, keywords: List[str]) -> int:
    """Score a dimension 0-100 based on keyword frequency."""
    text_lower = text.lower()
    hits = sum(1 for kw in keywords if kw in text_lower)
    return min(100, hits * 20)


def _extract_percentage(text: str, hint_words: List[str]) -> float:
    """Extract a percentage value near hint words."""
    text_lower = text.lower()
    for hint in hint_words:
        idx = text_lower.find(hint)
        if idx == -1:
            continue
        snippet = text_lower[max(0, idx - 40): idx + 80]
        match = re.search(r"(\d+(?:\.\d+)?)\s*%", snippet)
        if match:
            return float(match.group(1))
    return None


def _extract_months(text: str) -> int:
    """Extract lock-in period in months from text."""
    text_lower = text.lower()
    # Look for "X year(s)" or "X month(s)"
    year_match = re.search(r"(\d+)\s*year", text_lower)
    month_match = re.search(r"(\d+)\s*month", text_lower)
    if year_match:
        return int(year_match.group(1)) * 12
    if month_match:
        return int(month_match.group(1))
    return None


import os
import json
from dotenv import load_dotenv

def _extract_via_llm(text: str, category: str) -> Dict[str, Any]:
    """Use Gemini to intelligently extract financial metrics from the document text."""
    try:
        load_dotenv(override=True)
        import google.generativeai as genai
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.0-flash")
        
        prompt = f"""You are a financial analyst extracting facts from a {category} document.
Extract the following information exactly. If a value is not found, return null.

Return ONLY a valid JSON object with these exact keys:
{{
    "risk_profile_score": Number (0-100, 0=Safest, 100=Highest risk. Default to 50 if unknown),
    "claimed_return": Number (the expected/claimed ANNUAL return percentage, e.g. 12.5),
    "annual_fee": Number (the total expense ratio or combined annual fee percentage, e.g. 1.5),
    "lock_in_period": Number (lock-in period or minimum holding period in MONTHS, e.g. 36 for 3 years),
    "radar_data": [
        {{"dimension": "Returns", "value": Number (0-100 based on how strongly returns are emphasized in marketing text), "fullMark": 100}},
        {{"dimension": "Safety", "value": Number (0-100), "fullMark": 100}},
        {{"dimension": "Liquidity", "value": Number (0-100), "fullMark": 100}},
        {{"dimension": "Tax Benefit", "value": Number (0-100), "fullMark": 100}},
        {{"dimension": "Transparency", "value": Number (0-100), "fullMark": 100}}
    ]
}}

DOCUMENT TEXT (first 25000 chars):
{text[:25000]}
"""
        response = model.generate_content(prompt)
        # Strip markdown codeblocks
        resp_text = response.text.replace('```json', '').replace('```', '').strip()
        data = json.loads(resp_text)
        
        # Base extraction
        extracted = {
            "risk_profile_score": data.get("risk_profile_score", 50),
            "claimed_return": data.get("claimed_return"),
            "annual_fee": data.get("annual_fee"),
            "lock_in_period": data.get("lock_in_period"),
            "radar_data": data.get("radar_data", [
                {"dimension": dim, "value": 50, "fullMark": 100} 
                for dim in ["Returns", "Safety", "Liquidity", "Tax Benefit", "Transparency"]
            ])
        }

        # IMPROVEMENT: If the document completely fails to mention fees, returns, or lock-in periods,
        # that is a major red flag for transparency. Increase the risk profile score automatically.
        missing_penalties = 0
        if extracted["claimed_return"] is None:
            missing_penalties += 10
        if extracted["annual_fee"] is None:
            missing_penalties += 15  # Hiding fees is a bigger red flag
            
        if missing_penalties > 0:
            original_score = extracted["risk_profile_score"]
            extracted["risk_profile_score"] = min(100, original_score + missing_penalties)
            print(f"[Expectation API] Applied +{missing_penalties} risk penalty for hidden/missing data.")

        return extracted
    except Exception as e:
        print(f"[Expectation API] LLM extraction failed: {e}")
        return None

def extract_expectations(text: str, category: str) -> Dict[str, Any]:
    """
    Extract product expectation metrics from raw text (PDF or scraped ad).
    Returns a dict matching the Expectation model fields.
    """
    if not text or not text.strip():
        return {}
        
    # Try LLM first for accurate extraction
    llm_result = _extract_via_llm(text, category)
    if llm_result:
        return llm_result

    # Fallback to Regex
    text_lower = text.lower()

    risk_profile_score = 50  # default moderate
    for label, score in RISK_LABELS.items():
        if label in text_lower:
            risk_profile_score = score
            break

    claimed_return = _extract_percentage(
        text, ["expected return", "annualized return", "cagr", "yield", "return of", "returns of"]
    )

    annual_fee = _extract_percentage(
        text, ["expense ratio", "annual fee", "management fee", "tер", "ter"]
    )

    lock_in_period = None
    if any(kw in text_lower for kw in ["lock-in", "lock in", "maturity", "lockin"]):
        lock_in_period = _extract_months(text)

    radar_data = [
        {"dimension": dim, "value": _score_dimension(text, kws), "fullMark": 100}
        for dim, kws in DIMENSION_KEYWORDS.items()
    ]

    return {
        "risk_profile_score": risk_profile_score,
        "claimed_return": claimed_return,
        "annual_fee": annual_fee,
        "lock_in_period": lock_in_period,
        "radar_data": radar_data,
    }
