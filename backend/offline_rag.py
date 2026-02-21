import pickle
import subprocess
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
import platform

# =========================
# CONFIG
# =========================
VECTOR_DIR = "vector_store"
EMBED_MODEL = "all-MiniLM-L6-v2"
OLLAMA_MODEL = "phi3"

# Detect OS and set Ollama executable
if platform.system() == "Windows":
    OLLAMA_EXE = r"C:\Users\Ameya Achalla\AppData\Local\Programs\Ollama\ollama.exe"
else:
    OLLAMA_EXE = "ollama"  # Unix/Linux/Mac

TOP_K = 3  # Number of chunks to retrieve

# =========================
# LOAD MODELS & DATA
# =========================
print("🔁 Loading Offline RAG...")

embedder = SentenceTransformer(EMBED_MODEL)
index = faiss.read_index(f"{VECTOR_DIR}/index.faiss")

with open(f"{VECTOR_DIR}/documents.pkl", "rb") as f:
    documents = pickle.load(f)

print(f"✅ Offline RAG ready with {len(documents)} documents")

# =========================
# LANGUAGE-SPECIFIC PROMPTS
# =========================
RAG_PROMPTS = {
    "en": """You are an offline AI tutor helping students understand science concepts.

CONTEXT FROM TEXTBOOK:
{context}

STUDENT'S QUESTION:
{question}

INSTRUCTIONS:
- Answer ONLY based on the provided context
- Provide a clear, single explanation - no multiple interpretations
- Use proper scientific terminology from the context
- Include relevant formulas if present in the context
- If the answer is NOT in the context, say: "I don't have information about this in my current materials."
- Do NOT repeat statements
- Do NOT add commentary about correctness
- Keep response focused and educational

ANSWER:""",

    "hi": """आप एक ऑफलाइन AI ट्यूटर हैं जो छात्रों को विज्ञान की अवधारणाओं को समझने में मदद करते हैं।

पाठ्यपुस्तक से संदर्भ:
{context}

छात्र का प्रश्न:
{question}

निर्देश:
- केवल दिए गए संदर्भ के आधार पर उत्तर दें
- एक स्पष्ट, एकल व्याख्या प्रदान करें - कई व्याख्याएं नहीं
- संदर्भ से उचित वैज्ञानिक शब्दावली का उपयोग करें
- यदि संदर्भ में मौजूद हो तो प्रासंगिक सूत्र शामिल करें
- यदि उत्तर संदर्भ में नहीं है, तो कहें: "मेरे पास इस बारे में वर्तमान सामग्री में जानकारी नहीं है।"
- कथनों को दोहराएं नहीं
- सही होने के बारे में टिप्पणी न जोड़ें
- प्रतिक्रिया केंद्रित और शैक्षिक रखें

उत्तर (हिंदी में):""",

    "mr": """तुम्ही एक ऑफलाइन AI शिक्षक आहात जे विद्यार्थ्यांना विज्ञान संकल्पना समजण्यात मदत करतात.

पाठ्यपुस्तकातील संदर्भ:
{context}

विद्यार्थ्याचा प्रश्न:
{question}

सूचना:
- फक्त दिलेल्या संदर्भाच्या आधारे उत्तर द्या
- एक स्पष्ट, एकल स्पष्टीकरण द्या - अनेक व्याख्या नाहीत
- संदर्भातून योग्य वैज्ञानिक शब्दावली वापरा
- संदर्भात असल्यास संबंधित सूत्रे समाविष्ट करा
- जर उत्तर संदर्भात नसेल, तर म्हणा: "माझ्याकडे सध्याच्या साहित्यात याबद्दल माहिती नाही."
- विधाने पुनरावृत्ती करू नका
- योग्यतेबद्दल भाष्य जोडू नका
- प्रतिसाद केंद्रित आणि शैक्षणिक ठेवा

उत्तर (मराठीत):"""
}

# =========================
# RETRIEVE CONTEXT
# =========================
def retrieve_context(question: str, k: int = TOP_K) -> tuple[str, float]:
    """
    Retrieve relevant context from vector store.
    
    Returns:
        (context_text, confidence_score)
    """
    query_embedding = embedder.encode([question])
    distances, indices = index.search(np.array(query_embedding), k)
    
    # Calculate confidence based on similarity
    # Lower L2 distance = higher similarity
    avg_distance = float(np.mean(distances[0]))
    confidence = max(0.0, min(1.0, 1.0 / (1.0 + avg_distance)))
    
    retrieved_chunks = []
    for idx in indices[0]:
        if idx < len(documents):  # Safety check
            retrieved_chunks.append(documents[idx]["content"])
    
    context = "\n\n---\n\n".join(retrieved_chunks)
    return context, confidence


# =========================
# CLEAN OUTPUT
# =========================
def clean_output(text: str) -> str:
    """
    Remove duplicate lines and excessive whitespace.
    """
    lines = text.split("\n")
    unique_lines = []
    seen = set()
    
    for line in lines:
        stripped = line.strip()
        # Keep line if non-empty and not seen before
        if stripped and stripped not in seen:
            unique_lines.append(line)
            seen.add(stripped)
    
    return "\n".join(unique_lines).strip()


# =========================
# MAIN FUNCTION
# =========================
def run_offline_rag(question: str, language: str) -> str:
    """
    Generate answer using offline RAG.
    
    Args:
        question: Student's question
        language: Language code ('en', 'hi', 'mr')
    
    Returns:
        Answer based on retrieved context
    """
    # Validate language
    if language not in RAG_PROMPTS:
        print(f"⚠ Unsupported language '{language}', defaulting to English")
        language = "en"
    
    # Retrieve context
    context, confidence = retrieve_context(question)
    
    if not context:
        return "I don't have any relevant information in my materials."
    
    # Build prompt
    prompt = RAG_PROMPTS[language].format(
        context=context,
        question=question
    )
    
    try:
        # Run Ollama
        process = subprocess.Popen(
            [OLLAMA_EXE, "run", OLLAMA_MODEL],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        stdout, stderr = process.communicate(prompt.encode("utf-8"), timeout=30)
        
        if process.returncode != 0:
            print(f"❌ Ollama error: {stderr.decode('utf-8', errors='ignore')}")
            return "Unable to generate response from offline model."
        
        raw_answer = stdout.decode("utf-8", errors="ignore").strip()
        
        # Clean output
        final_answer = clean_output(raw_answer)
        
        return final_answer if final_answer else "Unable to generate a proper response."
        
    except subprocess.TimeoutExpired:
        print("❌ Ollama timeout")
        process.kill()
        return "Response generation timed out."
    except Exception as e:
        print(f"❌ Offline RAG error: {e}")
        return f"Error generating offline response: {str(e)}"