from parser.pdf_extractor import extract_text_from_pdf
from nlp.expectation import extract_expectations
import json

file_path = r"C:\Users\Madhav Shah\Downloads\unstructured_financial_text (1).pdf"
print("Extracting text from PDF...")
text = extract_text_from_pdf(file_path)

print("Running LLM extraction...")
expectations = extract_expectations(text, "Mutual Fund")

print("\n--- RESULTS ---")
print(json.dumps(expectations, indent=2))
