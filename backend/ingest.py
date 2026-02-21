# ingest.py
# Clean PDF → High Quality JSON for Offline RAG

import os
import json
import re
from unstructured.partition.pdf import partition_pdf
from unstructured.chunking.title import chunk_by_title

PDF_PATH = "docs/science.pdf"
OUTPUT_PATH = "vector_store/documents.json"

os.makedirs("vector_store", exist_ok=True)


# -----------------------------
# CLEANING FUNCTIONS
# -----------------------------

def clean_text(text: str) -> str:
    # Remove figure captions
    text = re.sub(r"Fig\.\s*\d+(\.\d+)*:.*", "", text)

    # Remove equation-only lines like F = ma (8.4)
    text = re.sub(r"^[A-Za-z0-9\s=\-\+\(\)\.\^]+$", "", text, flags=re.MULTILINE)

    # Remove page headers like SCIENCE
    text = re.sub(r"\bSCIENCE\b", "", text)

    # Fix broken lines
    text = text.replace("\n", " ")
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def is_valid_chunk(text: str) -> bool:
    # Minimum length
    if len(text) < 150:
        return False

    # Must contain multiple sentences
    if text.count(".") < 2:
        return False

    return True


# -----------------------------
# INGEST FUNCTION
# -----------------------------

def ingest():

    print("📄 Extracting PDF...")

    elements = partition_pdf(
        filename=PDF_PATH,
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

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(documents, f, ensure_ascii=False, indent=2)

    print(f"✅ Clean JSON saved with {len(documents)} chunks")


if __name__ == "__main__":
    ingest()