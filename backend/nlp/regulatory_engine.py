"""
Regulatory Compliance Engine — India-specific financial regulation checks.
Maps product claims against SEBI, IRDAI, RBI circulars and detects violations.
"""
import re
from typing import Dict, Any, List, Optional


# ─── SEBI Mis-Selling Red Flag Patterns ───────────────────────────────────
SEBI_VIOLATION_PATTERNS = {
    "guaranteed_returns": {
        "patterns": [
            r"guaranteed\s+return", r"assured\s+return", r"fixed\s+return",
            r"promise[ds]?\s+return", r"100%\s+safe", r"zero\s+risk",
            r"no\s+loss", r"risk[\s-]*free", r"capital\s+guarantee",
            r"money[-\s]back\s+guarantee", r"guaranteed\s+profit",
            r"double\s+your\s+money", r"triple\s+your\s+money",
        ],
        "regulation": "SEBI Circular SEBI/HO/IMD/IMD-I DOC1/P/CIR/2021/621",
        "severity": "CRITICAL",
        "description": "Mutual funds and market-linked instruments cannot guarantee returns per SEBI regulations. Any claim of guaranteed returns in mutual fund marketing is a direct violation.",
        "penalty": "SEBI can impose penalties up to ₹25 crore under SEBI Act Section 15HA",
        "consumer_impact": "Investors may be misled into believing there is no risk, leading to uninformed investment decisions",
    },
    "misleading_comparison": {
        "patterns": [
            r"better\s+than\s+fd", r"beats?\s+fixed\s+deposit",
            r"higher\s+than\s+bank", r"superior\s+to\s+savings",
            r"outperform[s]?\s+(fd|fixed|bank|savings)",
            r"replace\s+your\s+(fd|fixed\s+deposit)",
        ],
        "regulation": "SEBI (Mutual Funds) Regulations, 1996 — Regulation 77",
        "severity": "HIGH",
        "description": "Comparing mutual fund returns with fixed deposits without proper risk disclaimers violates SEBI advertising guidelines.",
        "penalty": "Warning, suspension of distribution license, monetary penalty",
        "consumer_impact": "Creates false equivalence between market-linked and guaranteed instruments",
    },
    "past_performance_misuse": {
        "patterns": [
            r"consistently\s+(deliver|gave|return)",
            r"always\s+(profit|positive|gain)",
            r"never\s+(lost|negative|loss)",
            r"track\s+record\s+of\s+\d+%",
            r"(we|fund|scheme)\s+delivered\s+\d+%",
        ],
        "regulation": "SEBI Circular CIR/IMD/DF/21/2012",
        "severity": "HIGH",
        "description": "Past performance cannot be presented as indicator of future results without prominent disclaimers. Cherry-picking favorable periods is a violation.",
        "penalty": "Suspension of approval for advertisements, monetary penalty",
        "consumer_impact": "Investors wrongly extrapolate past returns to future expectations",
    },
    "hidden_fee_indicators": {
        "patterns": [
            r"no\s+(charge|fee|cost|commission)", r"free\s+of\s+(charge|cost)",
            r"zero\s+(charge|fee|brokerage|commission)",
            r"no\s+exit\s+load", r"no\s+hidden\s+(charge|fee|cost)",
        ],
        "regulation": "SEBI (Mutual Funds) Regulations — TER Disclosure Requirements",
        "severity": "MEDIUM",
        "description": "Claims of 'zero charges' must be verified against actual TER, exit loads, transaction charges, and stamp duty. Omission of any applicable fee constitutes misleading practice.",
        "penalty": "Regulatory warning, fine, investor compensation order",
        "consumer_impact": "Investors discover unexpected deductions from their investments",
    },
    "urgency_tactics": {
        "patterns": [
            r"limited\s+(time|period|offer)", r"hurry", r"act\s+now",
            r"last\s+(chance|day|opportunity)", r"don'?t\s+miss",
            r"offer\s+(closes|ends|expir)", r"only\s+\d+\s+(days?|hours?|seats?)\s+left",
            r"exclusive\s+offer", r"first\s+come",
        ],
        "regulation": "SEBI (Advertisement) Guidelines — Fair Practice",
        "severity": "HIGH",
        "description": "Urgency-based marketing tactics in financial product sales constitute pressure selling, which is explicitly prohibited by SEBI.",
        "penalty": "Distribution license suspension, monetary penalty",
        "consumer_impact": "Investors make hasty decisions without proper due diligence",
    },
    "unsuitable_risk_marketing": {
        "patterns": [
            r"suitable\s+for\s+(all|every|anyone)",
            r"(everyone|anybody|all)\s+should\s+invest",
            r"(retiree|senior|pensioner).*high\s+return",
            r"safe.*high\s+return", r"low\s+risk.*high\s+return",
        ],
        "regulation": "SEBI (Investment Advisers) Regulations, 2013",
        "severity": "CRITICAL",
        "description": "Marketing a product as suitable for all investor profiles without KYC-based suitability assessment is a mis-selling practice.",
        "penalty": "License revocation, penalty up to ₹1 crore per instance",
        "consumer_impact": "Risk-averse investors may be sold high-risk products",
    },
}

# ─── IRDAI Insurance Mis-Selling Patterns ────────────────────────────────
IRDAI_VIOLATION_PATTERNS = {
    "insurance_as_investment": {
        "patterns": [
            r"(best|great|good)\s+investment", r"wealth\s+creation",
            r"market[\s-]*linked.*guaranteed", r"double\s+benefit",
            r"investment\s+cum\s+insurance", r"(save|invest)\s+and\s+protect",
            r"money\s+back\s+policy.*investment",
        ],
        "regulation": "IRDAI (Protection of Policyholders' Interests) Regulations, 2017",
        "severity": "HIGH",
        "description": "Selling insurance primarily as an investment vehicle while downplaying the insurance component is a common mis-selling tactic in India.",
        "penalty": "License cancellation, penalty up to ₹1 crore, policyholder compensation",
        "consumer_impact": "Policyholders discover inadequate insurance cover and poor investment returns",
    },
    "premium_misrepresentation": {
        "patterns": [
            r"(just|only|mere|small)\s+₹?\d+\s*(per|a)\s*(day|month)",
            r"affordable\s+premium", r"pocket[\s-]friendly",
            r"cost\s+of\s+a\s+(coffee|chai|cigarette)",
            r"less\s+than\s+₹?\d+\s*per\s*day",
        ],
        "regulation": "IRDAI Advertisement Guidelines — Transparency Requirements",
        "severity": "MEDIUM",
        "description": "Expressing premium as small daily amounts without total annual/policy-term disclosure misrepresents the true cost commitment.",
        "penalty": "Regulatory warning, advertisement withdrawal order",
        "consumer_impact": "Policyholders underestimate total premium outflow over policy term",
    },
    "benefit_exaggeration": {
        "patterns": [
            r"(guaranteed|assured)\s+(maturity|bonus|benefit)",
            r"tax[\s-]free.*guaranteed", r"life\s+cover\s+free",
            r"accident\s+cover\s+free", r"no\s+medical.*full\s+cover",
        ],
        "regulation": "IRDAI Product Filing Guidelines",
        "severity": "HIGH",
        "description": "Exaggerating benefits, especially guaranteed maturity benefits without mentioning conditions and exclusions, violates IRDAI advertising norms.",
        "penalty": "Product withdrawal, monetary penalty, license suspension",
        "consumer_impact": "Policyholders discover exclusions and conditions only at claim time",
    },
    "claim_settlement_omission": {
        "patterns": [
            r"(100|full)%?\s+claim",
            r"(instant|immediate|quick|fast)\s+claim",
            r"hassle[\s-]free\s+claim",
            r"no\s+(question|query|investigation).*claim",
        ],
        "regulation": "IRDAI Circular on Claim Settlement Practices",
        "severity": "MEDIUM",
        "description": "Claims of 100% claim settlement or instant claims without mentioning investigation period, exclusions, and waiting periods is misleading.",
        "penalty": "Advertisement withdrawal, policyholder grievance redressal order",
        "consumer_impact": "Policyholders face claim rejection despite believing they have full cover",
    },
}

# ─── RBI Banking Product Patterns ────────────────────────────────────────
RBI_VIOLATION_PATTERNS = {
    "deposit_guarantee_misuse": {
        "patterns": [
            r"(100|full)%?\s*(safe|secure|guaranteed)\s+deposit",
            r"rbi\s+guaranteed",
            r"government\s+guaranteed.*deposit",
            r"sovereign\s+guarantee.*fd",
        ],
        "regulation": "DICGC Act — Deposit Insurance Coverage of ₹5 lakh per depositor per bank",
        "severity": "MEDIUM",
        "description": "Implying full government/RBI guarantee on deposits beyond DICGC coverage of ₹5 lakh is misleading.",
        "penalty": "RBI regulatory action, monetary penalty",
        "consumer_impact": "Depositors may over-concentrate funds believing full government protection",
    },
    "lending_rate_opacity": {
        "patterns": [
            r"(lowest|cheapest|best)\s+interest\s+rate",
            r"(zero|no|0%)?\s+interest.*loan",
            r"interest[\s-]free\s+(loan|emi|credit)",
            r"(no|zero|0)\s+processing\s+fee",
        ],
        "regulation": "RBI Master Direction on Interest Rate on Advance",
        "severity": "MEDIUM",
        "description": "Claims of zero interest or processing fees without disclosing embedded costs, GST, and effective annual rate violate RBI fair lending practices.",
        "penalty": "RBI directions, monetary penalty",
        "consumer_impact": "Borrowers end up paying more than expected due to hidden charges",
    },
}

# ─── India-Specific Misleading Language Patterns ─────────────────────────
INDIA_MISLEADING_LANGUAGE = {
    "hindi_english_deceptive": [
        "paisa double", "guaranteed munafa", "risk nahi hai",
        "100% safe hai", "paise doob nahi sakte",
        "sahi hai", "best scheme", "govt approved scheme",
    ],
    "cultural_exploitation": [
        r"(diwali|holi|eid|navratri|ganesh|durga|christmas)\s*(offer|special|scheme|bonus)",
        r"(wedding|shaadi|marriage)\s*(fund|plan|scheme)",
        r"(retire|pension)\s*(tension|worry)[\s-]free",
    ],
    "authority_misuse": [
        r"(rbi|sebi|irdai|government|modi|pm|niti\s*aayog)\s*(approved|recommended|backed|endorsed)",
        r"(certified|approved)\s+by\s+(rbi|sebi|irdai|government)",
    ],
}


def scan_for_violations(text: str, category: str) -> Dict[str, Any]:
    """
    Scan document text for regulatory violations based on product category.
    Returns comprehensive violation report.
    """
    if not text:
        return _empty_report()

    text_lower = text.lower()
    violations = []
    warnings = []
    
    # Select applicable regulation set based on category
    pattern_sets = [("SEBI", SEBI_VIOLATION_PATTERNS)]
    cat_lower = category.lower()
    if "insurance" in cat_lower:
        pattern_sets.append(("IRDAI", IRDAI_VIOLATION_PATTERNS))
    if "fd" in cat_lower or "deposit" in cat_lower or "bank" in cat_lower:
        pattern_sets.append(("RBI", RBI_VIOLATION_PATTERNS))
    
    for regulator, patterns in pattern_sets:
        for violation_id, violation_info in patterns.items():
            matches = []
            for pattern in violation_info["patterns"]:
                found = re.finditer(pattern, text_lower)
                for match in found:
                    # Get surrounding context (±60 chars)
                    start = max(0, match.start() - 60)
                    end = min(len(text), match.end() + 60)
                    context = text[start:end].strip()
                    matches.append({
                        "matched_text": match.group(),
                        "context": f"...{context}...",
                        "position": match.start(),
                    })
            
            if matches:
                entry = {
                    "violation_id": violation_id,
                    "regulator": regulator,
                    "severity": violation_info["severity"],
                    "regulation": violation_info["regulation"],
                    "description": violation_info["description"],
                    "penalty": violation_info["penalty"],
                    "consumer_impact": violation_info["consumer_impact"],
                    "match_count": len(matches),
                    "evidence": matches[:5],  # Top 5 matches
                }
                if violation_info["severity"] in ["CRITICAL", "HIGH"]:
                    violations.append(entry)
                else:
                    warnings.append(entry)
    
    # Check misleading language
    misleading_flags = _check_misleading_language(text_lower)
    
    # Calculate compliance score
    critical_count = sum(1 for v in violations if v["severity"] == "CRITICAL")
    high_count = sum(1 for v in violations if v["severity"] == "HIGH")
    medium_count = len(warnings)
    
    compliance_score = max(0, 100 - (critical_count * 30) - (high_count * 15) - (medium_count * 5))
    
    # Determine compliance verdict
    if compliance_score >= 80:
        compliance_verdict = "COMPLIANT"
        compliance_color = "green"
    elif compliance_score >= 50:
        compliance_verdict = "NEEDS REVIEW"
        compliance_color = "amber"
    else:
        compliance_verdict = "NON-COMPLIANT"
        compliance_color = "red"
    
    return {
        "compliance_score": compliance_score,
        "compliance_verdict": compliance_verdict,
        "compliance_color": compliance_color,
        "total_violations": len(violations),
        "total_warnings": len(warnings),
        "critical_violations": critical_count,
        "high_violations": high_count,
        "medium_warnings": medium_count,
        "violations": violations,
        "warnings": warnings,
        "misleading_language": misleading_flags,
        "applicable_regulations": [ps[0] for ps in pattern_sets],
        "scan_summary": _generate_scan_summary(violations, warnings, compliance_score, category),
    }


def _check_misleading_language(text_lower: str) -> List[Dict]:
    """Check for India-specific misleading language patterns."""
    flags = []
    
    for lang_type, patterns in INDIA_MISLEADING_LANGUAGE.items():
        for pattern in patterns:
            if isinstance(pattern, str) and not any(c in pattern for c in r'[]()+*?'):
                # Plain string match
                if pattern in text_lower:
                    flags.append({
                        "type": lang_type,
                        "matched": pattern,
                        "risk": "Potentially misleading language targeting Indian consumers",
                    })
            else:
                # Regex match
                if re.search(pattern, text_lower):
                    match = re.search(pattern, text_lower)
                    flags.append({
                        "type": lang_type,
                        "matched": match.group() if match else pattern,
                        "risk": "Exploitation of cultural context or authority claims",
                    })
    
    return flags


def _generate_scan_summary(violations: List, warnings: List, score: int, category: str) -> str:
    """Generate a human-readable regulatory scan summary."""
    if not violations and not warnings:
        return (
            f"No regulatory violations detected in this {category} document. "
            "The product marketing materials appear to comply with applicable Indian financial regulations. "
            "However, this is an automated scan and a human compliance review is recommended before distribution."
        )
    
    parts = []
    if violations:
        critical = [v for v in violations if v["severity"] == "CRITICAL"]
        high = [v for v in violations if v["severity"] == "HIGH"]
        
        if critical:
            parts.append(
                f"⛔ {len(critical)} CRITICAL violation(s) detected that directly contravene "
                f"{', '.join(set(v['regulator'] for v in critical))} regulations. "
                "Immediate corrective action required before this document can be distributed."
            )
        if high:
            parts.append(
                f"🔴 {len(high)} HIGH-severity violation(s) found involving "
                f"{', '.join(set(v['regulator'] for v in high))} guidelines. "
                "These issues pose significant regulatory and consumer protection risks."
            )
    
    if warnings:
        parts.append(
            f"⚠️ {len(warnings)} medium-severity warnings identified. "
            "While not immediate violations, these patterns may trigger regulatory scrutiny."
        )
    
    parts.append(f"Overall compliance score: {score}/100.")
    return " ".join(parts)


def _empty_report() -> Dict[str, Any]:
    return {
        "compliance_score": None,
        "compliance_verdict": "NO DATA",
        "compliance_color": "gray",
        "total_violations": 0,
        "total_warnings": 0,
        "critical_violations": 0,
        "high_violations": 0,
        "medium_warnings": 0,
        "violations": [],
        "warnings": [],
        "misleading_language": [],
        "applicable_regulations": [],
        "scan_summary": "No document text available for regulatory scan.",
    }
