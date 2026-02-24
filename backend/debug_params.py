from unstructured.partition.pdf import partition_pdf
import os

pdf_path = "docs/science.pdf"
print(f"Testing partition_pdf with different params on {pdf_path}")

params = [
    {"strategy": "fast"},
    {"strategy": "fast", "languages": ["eng"]},
    {"strategy": "fast", "languages": ["eng", "mar"]},
    {"strategy": "auto"},
]

for p in params:
    print(f"\nTrying with params: {p}")
    try:
        elements = partition_pdf(filename=pdf_path, **p)
        print(f"Result: Found {len(elements)} elements.")
    except Exception as e:
        print(f"Error: {e}")
