import os
import json
import pickle
import subprocess
from typing import List
from collections import Counter
import faiss
import numpy as np
import platform

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

# Detect OS for Ollama executable
if platform.system() == "Windows":
    OLLAMA_EXE = r"C:\Users\Ameya Achalla\AppData\Local\Programs\Ollama\ollama.exe"
else:
    OLLAMA_EXE = "ollama"

os.makedirs(VECTOR_DIR, exist_ok=True)

if not os.path.exists(PDF_PATH):
    raise FileNotFoundError(f"PDF not found at: {PDF_PATH}")

# =========================
# LOAD EMBEDDING MODEL
# =========================
print("🔁 Loading embedding model...")
embedder = SentenceTransformer(EMBED_MODEL)
print("✅ Embedding model loaded")

# =========================
# IMPROVED SUMMARIZATION PROMPT
# =========================
SUMMARIZATION_PROMPT = """You are preparing educational content from a science textbook for a student tutoring system.

ORIGINAL TEXT:
{text}

TABLES (if any):
{tables}

YOUR TASK:
Transform this content into a clear, searchable format that preserves:
1. Key scientific concepts and definitions
2. ALL formulas, equations, and mathematical expressions
3. Important facts and relationships
4. Units of measurement
5. Examples and applications

REQUIREMENTS:
- Maintain scientific accuracy - do NOT change or simplify formulas
- Preserve technical terminology
- Keep numerical values and units exact
- Make content clear and well-structured
- Remove redundancy but keep all unique information
- Do NOT add information not present in the source
- Format formulas clearly (use standard notation)

OUTPUT (clear, factual summary):
"""

def offline_summary(text: str, tables: List[str]) -> str:
    """
    Generate educational summary using local Ollama model.
    
    Args:
        text: Text content to summarize
        tables: List of table content (HTML or text)
    
    Returns:
        Summarized content optimized for RAG retrieval
    """
    # Format tables nicely
    tables_text = "\n\n".join(tables) if tables else "No tables in this section."
    
    prompt = SUMMARIZATION_PROMPT.format(
        text=text,
        tables=tables_text
    )
    
    try:
        result = subprocess.run(
            [OLLAMA_EXE, "run", OLLAMA_MODEL],
            input=prompt,
            text=True,
            capture_output=True,
            encoding="utf-8",
            timeout=60  # 60 second timeout per chunk
        )
        
        if result.returncode != 0:
            print(f"⚠ Ollama warning: {result.stderr}")
            # Return original text if summarization fails
            return text
        
        summary = result.stdout.strip()
        
        # If summary is too short or empty, return original
        if len(summary) < 50:
            return text
        
        return summary
        
    except subprocess.TimeoutExpired:
        print("⚠ Summarization timeout, using original text")
        return text
    except Exception as e:
        print(f"⚠ Summarization error: {e}, using original text")
        return text


# =========================
# PARTITION DOCUMENT
# =========================
def partition_document():
    """
    Extract elements from PDF using unstructured library.
    
    Returns:
        List of document elements
    """
    print(f"📄 Partitioning PDF: {PDF_PATH}")
    
    try:
        elements = partition_pdf(
        filename=PDF_PATH,
        strategy="fast",      # 🔥 No image inference
        languages=["eng"]
)
        
        print(f"✅ Extracted {len(elements)} elements")
        
        # Show element type distribution
        element_types = Counter(type(el).__name__ for el in elements)
        print("🔍 Element types found:")
        for elem_type, count in element_types.most_common():
            print(f"   - {elem_type}: {count}")
        
        if not elements:
            raise RuntimeError("No elements extracted from PDF")
        
        return elements
        
    except Exception as e:
        print(f"❌ Error partitioning document: {e}")
        raise


# =========================
# CHUNK AND ENRICH
# =========================
def build_documents(elements):
    """
    Create chunks and enrich with summaries.
    
    Args:
        elements: Raw document elements from partitioning
    
    Returns:
        List of document dictionaries with content and metadata
    """
    print("🔨 Chunking document...")
    
    chunks = chunk_by_title(
        elements,
        max_characters=3000,
        new_after_n_chars=2400,
        combine_text_under_n_chars=500
    )
    
    print(f"✅ Created {len(chunks)} chunks")
    
    documents = []
    
    for i, chunk in enumerate(chunks):
        print(f"🧠 Processing chunk {i+1}/{len(chunks)}")
        
        text = chunk.text
        tables = []
        
        # Extract tables from chunk
        if hasattr(chunk.metadata, "orig_elements"):
            for el in chunk.metadata.orig_elements:
                if isinstance(el, Table):
                    table_text = getattr(el.metadata, "text_as_html", el.text)
                    if table_text:
                        tables.append(table_text)
        
        # Decide whether to summarize
        # Only summarize if chunk has tables or is very long
        if tables or len(text) > 2000:
            content = offline_summary(text, tables)
            print(f"   ✓ Summarized (original: {len(text)} chars → summary: {len(content)} chars)")
        else:
            content = text
            print(f"   ✓ Using original text ({len(text)} chars)")
        
        documents.append({
            "content": content,
            "metadata": {
                "raw_text": text,
                "tables": tables,
                "chunk_index": i
            }
        })
    
    return documents


# =========================
# VECTOR STORE
# =========================
def save_vector_store(documents):
    """
    Create embeddings and save FAISS index.
    
    Args:
        documents: List of document dictionaries
    """
    print("📐 Creating embeddings...")
    texts = [d["content"] for d in documents]
    
    # Generate embeddings
    embeddings = embedder.encode(
        texts,
        show_progress_bar=True,
        batch_size=32
    )
    
    print(f"✅ Generated {len(embeddings)} embeddings of dimension {embeddings.shape[1]}")
    
    # Create FAISS index
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(np.array(embeddings))
    
    # Save index and documents
    index_path = f"{VECTOR_DIR}/index.faiss"
    docs_path = f"{VECTOR_DIR}/documents.pkl"
    
    faiss.write_index(index, index_path)
    
    with open(docs_path, "wb") as f:
        pickle.dump(documents, f)
    
    print(f"✅ Vector store saved:")
    print(f"   - Index: {index_path}")
    print(f"   - Documents: {docs_path}")
    print(f"   - Total documents: {len(documents)}")


# =========================
# MAIN
# =========================
if __name__ == "__main__":
    print("="*60)
    print("🚀 OFFLINE TUTORING SYSTEM - DOCUMENT INGESTION")
    print("="*60)
    
    try:
        # Step 1: Partition PDF
        elements = partition_document()
        
        # Step 2: Chunk and enrich
        documents = build_documents(elements)
        
        # Step 3: Create vector store
        save_vector_store(documents)
        
        print("="*60)
        print("🎉 INGESTION COMPLETE!")
        print("="*60)
        print(f"✅ Processed {len(documents)} document chunks")
        print(f"✅ Vector store ready at: {VECTOR_DIR}/")
        
    except Exception as e:
        print("="*60)
        print(f"❌ INGESTION FAILED: {e}")
        print("="*60)
        raise