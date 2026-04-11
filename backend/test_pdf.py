from parser.pdf_extractor import extract_text_from_pdf
file_path = r"C:\Users\Madhav Shah\Downloads\unstructured_financial_text (1).pdf"
text = extract_text_from_pdf(file_path)
print(text[:2000])
