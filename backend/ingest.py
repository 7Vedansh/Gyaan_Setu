# ingest.py
# Multi-PDF â†’ High Quality JSON for Offline RAG

import os
import json
import re
try:
    from unstructured.partition.pdf import partition_pdf
    from unstructured.chunking.title import chunk_by_title
except ImportError as exc:
    if "open_filename" in str(exc):
        raise ImportError(
            "Incompatible PDF parser setup: uninstall `pdfminer` and install "
            "`pdfminer.six==20221105`. Run: pip uninstall -y pdfminer && "
            "pip install pdfminer.six==20221105"
        ) from exc
    raise

DOCS_FOLDER = "docs"
OUTPUT_FOLDER = "vector_store"

os.makedirs(OUTPUT_FOLDER, exist_ok=True)


# -----------------------------
# CLEANING FUNCTIONS
# -----------------------------

def clean_text(text: str) -> str:
    text = re.sub(r"Fig\.\s*\d+(\.\d+)*:.*", "", text)
    text = re.sub(r"^[A-Za-z0-9\s=\-\+\(\)\.\^]+$", "", text, flags=re.MULTILINE)
    text = re.sub(r"\bSCIENCE\b", "", text)
    text = text.replace("\n", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def is_valid_chunk(text: str) -> bool:
    if len(text) < 150:
        return False
    if text.count(".") < 2:
        return False
    return True


# -----------------------------
# SINGLE PDF PROCESSOR
# -----------------------------

def process_pdf(pdf_path):

    print(f"\nðŸ“„ Processing: {pdf_path}")

    elements = partition_pdf(
        filename=pdf_path,
        strategy="fast",
        languages=["eng"]
    )

    chunks = chunk_by_title(
        elements,
        max_characters=1500,
        new_after_n_chars=1200,
        combine_text_under_n_chars=300
    )

    documents = []
    index = 0

    for chunk in chunks:
        text = clean_text(chunk.text)

        if is_valid_chunk(text):
            documents.append({
                "id": index,
                "content": text
            })
            index += 1

    # Output filename = same name as PDF
    pdf_name = os.path.splitext(os.path.basename(pdf_path))[0]
    output_path = os.path.join(OUTPUT_FOLDER, f"{pdf_name}.json")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(documents, f, ensure_ascii=False, indent=2)

    print(f"âœ… Saved {len(documents)} chunks â†’ {output_path}")


# -----------------------------
# MAIN INGEST
# -----------------------------

def ingest():

    print("ðŸš€ MULTI-PDF INGEST STARTED")

    pdf_files = [
        os.path.join(DOCS_FOLDER, file)
        for file in os.listdir(DOCS_FOLDER)
        if file.lower().endswith(".pdf")
    ]

    if not pdf_files:
        print("âŒ No PDFs found in docs folder.")
        return

    for pdf_path in pdf_files:
        process_pdf(pdf_path)

    print("\nðŸŽ‰ All PDFs processed successfully!")


if __name__ == "__main__":
    ingest()
