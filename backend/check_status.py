import requests, json

r = requests.get("http://127.0.0.1:8000/api/products/")
products = r.json()

for p in products:
    pid = p["id"]
    name = p["name"]
    print(f"Product: {name} | ID: {pid}")
    
    # Check deep analysis
    da = requests.get(f"http://127.0.0.1:8000/api/products/{pid}/deep-analysis")
    if da.status_code == 200:
        d = da.json()
        score = d.get("compliance_score")
        has_doc = d.get("document_analysis") is not None
        has_nar = d.get("report_narrative") is not None
        has_fb = d.get("deep_feedback") is not None
        print(f"  Compliance Score: {score}/100")
        print(f"  Document Analysis: {'YES' if has_doc else 'NO'}")
        print(f"  Report Narrative: {'YES' if has_nar else 'NO'}")
        print(f"  Deep Feedback: {'YES' if has_fb else 'NO'}")
        
        if d.get("compliance_scan"):
            cs = d["compliance_scan"]
            print(f"  Violations: {cs.get('total_violations', 0)}, Warnings: {cs.get('total_warnings', 0)}")
            print(f"  Verdict: {cs.get('compliance_verdict', 'N/A')}")
        
        if has_doc:
            da_data = d["document_analysis"]
            claims = da_data.get("claims_analysis", [])
            misleading = [c for c in claims if c.get("is_misleading")]
            print(f"  Total Claims: {len(claims)}, Misleading: {len(misleading)}")
    else:
        print(f"  Deep Analysis: NOT READY ({da.status_code})")
    
    print()
