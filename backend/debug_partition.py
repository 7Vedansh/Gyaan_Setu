from unstructured.partition.pdf import partition_pdf
import os

pdf_path = "docs/science.pdf"
print(f"Testing partition_pdf on {pdf_path}")

try:
    elements = partition_pdf(
        filename=pdf_path,
        strategy="fast"
    )
    print(f"Success! Found {len(elements)} elements.")
    for i, el in enumerate(elements[:5]):
        print(f"Element {i}: {type(el).__name__} - {str(el)[:100]}...")
except Exception as e:
    print(f"Error during partition: {e}")
