import pdfminer.high_level
import sys

try:
    with open("docs/science.pdf", "rb") as f:
        text = pdfminer.high_level.extract_text(f)
        print(f"Extracted {len(text)} characters.")
        print("First 500 characters:")
        print(text[:500])
except Exception as e:
    print(f"Error: {e}")
