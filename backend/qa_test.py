import requests
import time

BASE = "http://127.0.0.1:8000/api"

# Register user
r = requests.post(f"{BASE}/auth/register", json={"email": "qa@test.com", "password": "Test1234!"})
print(f"Register: {r.status_code}")

# Upload risky product
print("\n--- Uploading RISKY product (SBI Bluechip Fund) ---")
files = {"file": ("test_product.pdf", open("test_product.pdf", "rb"), "application/pdf")}
data = {"name": "SBI Bluechip Fund", "category": "Mutual Fund"}
r = requests.post(f"{BASE}/products/upload", files=files, data=data)
risky = r.json()
print(f"Upload: {r.status_code}, ID: {risky['id']}")

# Upload safe product
print("\n--- Uploading SAFE product (HDFC Top 100 Fund) ---")
files2 = {"file": ("test_safe_product.pdf", open("test_safe_product.pdf", "rb"), "application/pdf")}
data2 = {"name": "HDFC Top 100 Fund", "category": "Mutual Fund"}
r2 = requests.post(f"{BASE}/products/upload", files=files2, data=data2)
safe = r2.json()
print(f"Upload: {r2.status_code}, ID: {safe['id']}")

# Wait for pipeline to complete
print("\nWaiting 60s for analysis pipeline...")
time.sleep(60)

# Check results
print("\n=== RISKY PRODUCT RESULTS ===")
for endpoint in ["expectation", "comparison", "deep-analysis"]:
    r = requests.get(f"{BASE}/products/{risky['id']}/{endpoint}")
    if r.status_code == 200:
        d = r.json()
        if endpoint == "expectation":
            print(f"  Risk Profile Score: {d.get('risk_profile_score')}/100")
            print(f"  Claimed Return: {d.get('claimed_return')}%")
        elif endpoint == "comparison":
            print(f"  Overall Risk Score: {d.get('overall_risk_score')}/100")
        elif endpoint == "deep-analysis":
            print(f"  Compliance Score: {d.get('compliance_score')}/100")
            cs = d.get("compliance_scan", {})
            print(f"  Violations: {cs.get('total_violations', 0)} ({cs.get('critical_violations', 0)} critical)")
            print(f"  Verdict: {cs.get('compliance_verdict', 'N/A')}")
            print(f"  Document Analysis: {'YES' if d.get('document_analysis') else 'NO'}")
            print(f"  Report Narrative: {'YES' if d.get('report_narrative') else 'NO'}")
    else:
        print(f"  {endpoint}: NOT READY ({r.status_code})")

print("\n=== SAFE PRODUCT RESULTS ===")
for endpoint in ["expectation", "comparison", "deep-analysis"]:
    r = requests.get(f"{BASE}/products/{safe['id']}/{endpoint}")
    if r.status_code == 200:
        d = r.json()
        if endpoint == "expectation":
            print(f"  Risk Profile Score: {d.get('risk_profile_score')}/100")
            print(f"  Claimed Return: {d.get('claimed_return')}%")
        elif endpoint == "comparison":
            print(f"  Overall Risk Score: {d.get('overall_risk_score')}/100")
        elif endpoint == "deep-analysis":
            print(f"  Compliance Score: {d.get('compliance_score')}/100")
            cs = d.get("compliance_scan", {})
            print(f"  Violations: {cs.get('total_violations', 0)} ({cs.get('critical_violations', 0)} critical)")
            print(f"  Verdict: {cs.get('compliance_verdict', 'N/A')}")
            print(f"  Document Analysis: {'YES' if d.get('document_analysis') else 'NO'}")
            print(f"  Report Narrative: {'YES' if d.get('report_narrative') else 'NO'}")
    else:
        print(f"  {endpoint}: NOT READY ({r.status_code})")
