import requests
import json

url = "http://localhost:8000/api/products/upload"
file_path = r"C:\Users\Madhav Shah\Downloads\unstructured_financial_text (1).pdf"

with open(file_path, "rb") as f:
    files = {"file": f}
    data = {
        "name": "SmartYield Plan",
        "category": "Mutual Fund"
    }
    print("Uploading file to backend...")
    response = requests.post(url, files=files, data=data)
    
print("Status Code:", response.status_code)
product = response.json()
print("Product Data:", json.dumps(product, indent=2))

if response.status_code == 200:
    # Now get the expectation analysis
    product_id = product["id"]
    print(f"\nFetching Expectation Analysis for {product_id}...")
    exp_response = requests.get(f"http://localhost:8000/api/products/{product_id}/expectation")
    if exp_response.status_code == 200:
        print("\nEXPECTATION DATA (EXTRACTED BY LLM):")
        print(json.dumps(exp_response.json(), indent=2))
    else:
        print("Expectation Error:", exp_response.text)
