import requests, json

BASE = "http://127.0.0.1:8000/api"

# Get all products
r = requests.get(f"{BASE}/products/")
products = r.json()

for p in products:
    pid = p["id"]
    name = p["name"]
    print(f"\n{'='*60}")
    print(f"PRODUCT: {name} (ID: {pid})")
    print(f"{'='*60}")
    
    # Expectation
    r = requests.get(f"{BASE}/products/{pid}/expectation")
    if r.status_code == 200:
        d = r.json()
        print(f"  Risk Profile Score: {d.get('risk_profile_score')}/100")
        print(f"  Claimed Return: {d.get('claimed_return')}%")
    
    # Comparison
    r = requests.get(f"{BASE}/products/{pid}/comparison")
    if r.status_code == 200:
        d = r.json()
        print(f"  Overall Risk Score: {d.get('overall_risk_score')}/100")
        print(f"  Gap Summary: {d.get('gap_analysis_summary', '')[:100]}")
        for item in d.get("comparison_data", []):
            print(f"    {item['metric']}: promised={item['promised']}, actual={item['actual']}, gap={item['gap']}")
    
    # Deep analysis
    r = requests.get(f"{BASE}/products/{pid}/deep-analysis")
    if r.status_code == 200:
        d = r.json()
        cs = d.get("compliance_scan", {})
        print(f"  Compliance Score: {cs.get('compliance_score')}/100")
        print(f"  Compliance Verdict: {cs.get('compliance_verdict')}")
        print(f"  Total Violations: {cs.get('total_violations')}")
        print(f"    Critical: {cs.get('critical_violations')}")
        print(f"    High: {cs.get('high_violations')}")
        print(f"    Medium: {cs.get('medium_warnings')}")
        for v in cs.get("violations", []):
            print(f"    - {v['violation_type']} [{v['severity']}]")
        print(f"  Document Analysis: {'YES' if d.get('document_analysis') else 'NO'}")
        print(f"  Report Narrative: {'YES' if d.get('report_narrative') else 'NO'}")
    else:
        print(f"  Deep analysis: NOT READY ({r.status_code})")
