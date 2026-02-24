import os
import json
import re
import pypdf
from unstructured.documents.elements import Text

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
    # 1. Remove figure/table captions
    text = re.sub(r"(Fig\.|Table)\s*\d+(\.\d+)*:.*", "", text, flags=re.IGNORECASE)
    
    # 2. Specific noise removal
    text = re.sub(r"\bSCIENCE\b", "", text, flags=re.IGNORECASE)
    
    # 3. Standardize whitespace
    text = text.replace("\n", " ")
    text = re.sub(r"\s+", " ", text)
    
    return text.strip()


def is_valid_chunk(text: str) -> bool:
    # Relaxed minimum length to ensure we don't skip valid short content
    if len(text) < 100:
        return False
    # At least one period or common sentence ending (English or Marathi)
    if not re.search(r"[\.\?!।]", text):
        return False
    return True


# -----------------------------
# SINGLE PDF PROCESSOR
# -----------------------------

def process_pdf(pdf_path):

    print(f"\n📄 Processing: {pdf_path}")
    elements = []

    # Using 'hi_res' and 'mar' (Marathi) + 'eng' as requested previously
    try:
        elements = partition_pdf(
            filename=pdf_path,
            strategy="hi_res",
            languages=["eng", "mar"]
        )
    except Exception as e:
        error_msg = str(e).lower()
        if "poppler" in error_msg or "page count" in error_msg:
            print(f"⚠️ Missing Poppler (required for Hi-Res). Hint: Add Poppler to your PATH.")
        else:
            print(f"⚠️ Hi-Res partition failed: {e}")
        
        print("💡 Attempting 'fast' strategy...")
        try:
            elements = partition_pdf(
                filename=pdf_path,
                strategy="fast",
                languages=["eng", "mar"]
            )
        except Exception as e2:
            print(f"⚠️ 'fast' strategy also failed: {e2}")

    # FINAL FALLBACK: If still 0 elements, use pypdf directly
    if not elements:
        print("🔍 Unstructured failed to extract elements. Falling back to basic pypdf extraction...")
        try:
            reader = pypdf.PdfReader(pdf_path)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text and page_text.strip():
                    elements.append(Text(text=page_text))
        except Exception as e3:
            print(f"❌ pypdf fallback failed: {e3}")

    if not elements:
        print(f"❌ Critical: Could not extract any text from {pdf_path}. Skipping.")
        return

    print(f"🔍 Found {len(elements)} elements. Chunking...")

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
        else:
            if len(text.strip()) > 0:
                # Debug skipped chunks
                pass 

    # Output filename = same name as PDF
    pdf_name = os.path.splitext(os.path.basename(pdf_path))[0]
    output_path = os.path.join(OUTPUT_FOLDER, f"{pdf_name}.json")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(documents, f, ensure_ascii=False, indent=2)

    print(f"✅ Saved {len(documents)} chunks → {output_path}")


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
