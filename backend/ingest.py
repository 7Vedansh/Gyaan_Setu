import os
import json
import pickle
import subprocess
from typing import List
from collections import Counter
import faiss
import numpy as np

from sentence_transformers import SentenceTransformer
from unstructured.partition.pdf import partition_pdf
from unstructured.chunking.title import chunk_by_title
from unstructured.documents.elements import Table

# =========================
# CONFIG
# =========================
PDF_PATH = os.path.abspath("docs/science.pdf")
VECTOR_DIR = "vector_store"
EMBED_MODEL = "all-MiniLM-L6-v2"
OLLAMA_MODEL = "phi3"

os.makedirs(VECTOR_DIR, exist_ok=True)

if not os.path.exists(PDF_PATH):
    raise FileNotFoundError(f"PDF not found at: {PDF_PATH}")

# =========================
# LOAD EMBEDDING MODEL
# =========================
print("🔁 Loading embedding model...")
embedder = SentenceTransformer(EMBED_MODEL)

# =========================
# OFFLINE AI SUMMARY (TEXT ONLY)
# =========================
def offline_summary(text: str, tables: List[str]) -> str:
    prompt = f"""
You are preparing content for an offline science tutor.

TEXT:
{text}

TABLES:
{tables}

TASK:
- Extract key concepts and definitions
- Preserve formulas and equations
- Make it searchable and factual
- Do NOT hallucinate

SUMMARY:
"""
    result = subprocess.run(
        ["ollama", "run", OLLAMA_MODEL],
        input=prompt,
        text=True,
        capture_output=True
    )
    return result.stdout.strip()

# =========================
# PARTITION DOCUMENT (TEXT-ONLY)
# =========================
def partition_document():
    print(f"📄 Partitioning {PDF_PATH}")

    elements = partition_pdf(
        filename=PDF_PATH,
        strategy="hi_res",
        languages=["eng"],
        infer_table_structure=False,
        extract_image_block_types=None,
        extract_image_block_to_payload=False
    )

    print(f"✅ Extracted {len(elements)} elements")
    print("🔍 Element types found:")
    print(Counter(type(el).__name__ for el in elements))

    if not elements:
        raise RuntimeError("No elements extracted from PDF")

    return elements

# =========================
# CHUNK + ENRICH
# =========================
def build_documents(elements):
    chunks = chunk_by_title(
        elements,
        max_characters=3000,
        new_after_n_chars=2400,
        combine_text_under_n_chars=500
    )

    print(f"🔨 Created {len(chunks)} chunks")

    documents = []

    for i, chunk in enumerate(chunks):
        print(f"🧠 Processing chunk {i+1}/{len(chunks)}")

        text = chunk.text
        tables = []

        if hasattr(chunk.metadata, "orig_elements"):
            for el in chunk.metadata.orig_elements:
                if isinstance(el, Table):
                    tables.append(getattr(el.metadata, "text_as_html", el.text))

        content = (
            offline_summary(text, tables)
            if tables
            else text
        )

        documents.append({
            "content": content,
            "metadata": {
                "raw_text": text,
                "tables": tables
            }
        })

    return documents

# =========================
# VECTOR STORE
# =========================
def save_vector_store(documents):
    print("📐 Creating embeddings...")
    texts = [d["content"] for d in documents]

    embeddings = embedder.encode(texts, show_progress_bar=True)

    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(np.array(embeddings))

    faiss.write_index(index, f"{VECTOR_DIR}/index.faiss")

    with open(f"{VECTOR_DIR}/documents.pkl", "wb") as f:
        pickle.dump(documents, f)

    print("✅ Vector store saved")

# =========================
# MAIN
# =========================
if __name__ == "__main__":
    print("🚀 TEXT-ONLY OFFLINE INGESTION STARTED")

    elements = partition_document()
    documents = build_documents(elements)
    save_vector_store(documents)

    print("🎉 INGESTION COMPLETE")
