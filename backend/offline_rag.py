import pickle
import subprocess
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

# =========================
# CONFIG
# =========================
VECTOR_DIR = "vector_store"
EMBED_MODEL = "all-MiniLM-L6-v2"
OLLAMA_MODEL = "phi3"

OLLAMA_EXE = r"C:\Users\Ameya Achalla\AppData\Local\Programs\Ollama\ollama.exe"

TOP_K = 2  # 🔥 Reduced to avoid noisy multi-chunk dumping

# =========================
# LOAD MODELS & DATA
# =========================
print("🔁 Loading Offline RAG...")

embedder = SentenceTransformer(EMBED_MODEL)
index = faiss.read_index(f"{VECTOR_DIR}/index.faiss")

with open(f"{VECTOR_DIR}/documents.pkl", "rb") as f:
    documents = pickle.load(f)

print("✅ Offline RAG ready")

# =========================
# RETRIEVE CONTEXT
# =========================
def retrieve_context(question: str, k: int = TOP_K) -> str:
    query_embedding = embedder.encode([question])
    _, indices = index.search(np.array(query_embedding), k)

    retrieved_chunks = []
    for idx in indices[0]:
        retrieved_chunks.append(documents[idx]["content"])

    return "\n\n---\n\n".join(retrieved_chunks)


# =========================
# CLEAN OUTPUT (Anti-Repetition Filter)
# =========================
def clean_output(text: str) -> str:
    lines = text.split("\n")
    unique_lines = []
    seen = set()

    for line in lines:
        stripped = line.strip()
        if stripped and stripped not in seen:
            unique_lines.append(line)
            seen.add(stripped)

    return "\n".join(unique_lines).strip()


# =========================
# MAIN FUNCTION
# =========================
def run_offline_rag(question: str, language: str) -> str:
    context = retrieve_context(question)

    # 🔒 Strict language control
    if language == "hi":
        language_instruction = "उत्तर हिंदी में दें।"
    elif language == "mr":
        language_instruction = "मराठीत उत्तर द्या."
    else:
        language_instruction = "Answer in English."

    prompt = f"""
You are an offline AI tutor.

{language_instruction}

Using ONLY the provided context:

- Generate ONE clear and complete explanation.
- Do NOT list multiple interpretations.
- Do NOT repeat similar statements.
- Do NOT evaluate correctness.
- Do NOT include corrections or MCQ-style commentary.
- Provide a single structured explanation.

If the answer is not present in the context, say:
"I don’t know based on the provided material."

CONTEXT:
{context}

QUESTION:
{question}

FINAL ANSWER:
"""

    process = subprocess.Popen(
        [OLLAMA_EXE, "run", OLLAMA_MODEL],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    stdout, stderr = process.communicate(prompt.encode("utf-8"))

    raw_answer = stdout.decode("utf-8", errors="ignore").strip()

    # 🔥 Remove duplicate reasoning blocks
    final_answer = clean_output(raw_answer)

    return final_answer
