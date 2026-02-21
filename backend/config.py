"""
Centralized configuration for AI Tutor System
Load settings from environment variables with sensible defaults
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# =========================
# PATHS
# =========================
BASE_DIR = Path(__file__).parent
DOCS_DIR = BASE_DIR / "docs"
VECTOR_DIR = BASE_DIR / "vector_store"

# Ensure directories exist
DOCS_DIR.mkdir(exist_ok=True)
VECTOR_DIR.mkdir(exist_ok=True)

# =========================
# DOCUMENT PROCESSING
# =========================
PDF_PATH = os.getenv("PDF_PATH", str(DOCS_DIR / "science.pdf"))

# Chunking parameters
CHUNK_MAX_CHARS = int(os.getenv("CHUNK_MAX_CHARS", "3000"))
CHUNK_NEW_AFTER = int(os.getenv("CHUNK_NEW_AFTER", "2400"))
CHUNK_COMBINE_UNDER = int(os.getenv("CHUNK_COMBINE_UNDER", "500"))

# =========================
# EMBEDDING MODELS
# =========================
EMBED_MODEL = os.getenv("EMBED_MODEL", "all-MiniLM-L6-v2")

# Alternative embedding models:
# - "all-MiniLM-L6-v2" (default, fast, 384 dimensions)
# - "all-mpnet-base-v2" (better quality, slower, 768 dimensions)
# - "paraphrase-multilingual-MiniLM-L12-v2" (multilingual)

# =========================
# ONLINE MODEL (Groq)
# =========================
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_BASE_URL = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
ONLINE_MODEL = os.getenv("ONLINE_MODEL", "llama-3.1-8b-instant")

# Available Groq models:
# - "llama-3.1-8b-instant" (default, fast)
# - "llama-3.1-70b-versatile" (more powerful)
# - "mixtral-8x7b-32768" (good alternative)

ONLINE_TEMPERATURE = float(os.getenv("ONLINE_TEMPERATURE", "0.3"))
ONLINE_TOP_P = float(os.getenv("ONLINE_TOP_P", "0.9"))
ONLINE_MAX_TOKENS = int(os.getenv("ONLINE_MAX_TOKENS", "1024"))

# =========================
# OFFLINE MODEL (Ollama)
# =========================
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "phi3")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")

# Detect OS for Ollama executable path
import platform
if platform.system() == "Windows":
    OLLAMA_EXE = os.getenv(
        "OLLAMA_EXE",
        r"C:\Users\Ameya Achalla\AppData\Local\Programs\Ollama\ollama.exe"
    )
else:
    OLLAMA_EXE = os.getenv("OLLAMA_EXE", "ollama")

# Available Ollama models (must be pulled first):
# - "phi3" (default, 3.8GB, good for tutoring)
# - "llama2" (7B, 3.8GB)
# - "mistral" (7B, 4.1GB)
# - "llama3" (8B, 4.7GB)

OLLAMA_TIMEOUT = int(os.getenv("OLLAMA_TIMEOUT", "60"))

# =========================
# RAG CONFIGURATION
# =========================
TOP_K = int(os.getenv("TOP_K", "3"))  # Number of chunks to retrieve

# Confidence thresholds
ONLINE_CONFIDENCE = float(os.getenv("ONLINE_CONFIDENCE", "0.92"))
OFFLINE_CONFIDENCE_BASE = float(os.getenv("OFFLINE_CONFIDENCE_BASE", "0.75"))

# =========================
# API SERVER
# =========================
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
API_RELOAD = os.getenv("API_RELOAD", "false").lower() == "true"

# CORS settings
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# =========================
# LANGUAGE SUPPORT
# =========================
SUPPORTED_LANGUAGES = ["en", "hi", "mr"]
DEFAULT_LANGUAGE = "en"

# Language names for display
LANGUAGE_NAMES = {
    "en": "English",
    "hi": "हिंदी (Hindi)",
    "mr": "मराठी (Marathi)"
}

# =========================
# LOGGING
# =========================
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# =========================
# VALIDATION
# =========================
def validate_config():
    """Validate critical configuration."""
    errors = []
    
    # Check PDF exists
    if not os.path.exists(PDF_PATH):
        errors.append(f"PDF not found at: {PDF_PATH}")
    
    # Check Groq API key (optional, needed for online mode)
    if not GROQ_API_KEY:
        print("⚠ Warning: GROQ_API_KEY not set. Online mode will not work.")
    
    # Check vector store exists (needed for offline mode)
    index_path = VECTOR_DIR / "index.faiss"
    docs_path = VECTOR_DIR / "documents.pkl"
    
    if not index_path.exists() or not docs_path.exists():
        errors.append(
            f"Vector store not found. Run 'python ingest.py' first.\n"
            f"  Expected: {index_path} and {docs_path}"
        )
    
    if errors:
        print("\n❌ Configuration Errors:")
        for error in errors:
            print(f"  - {error}")
        return False
    
    return True


def print_config():
    """Print current configuration."""
    print("\n" + "="*60)
    print("AI TUTOR CONFIGURATION")
    print("="*60)
    
    print("\n📄 Documents:")
    print(f"  PDF Path: {PDF_PATH}")
    print(f"  Vector Store: {VECTOR_DIR}")
    
    print("\n🧠 Models:")
    print(f"  Embedding: {EMBED_MODEL}")
    print(f"  Online: {ONLINE_MODEL}")
    print(f"  Offline: {OLLAMA_MODEL}")
    
    print("\n🔍 RAG:")
    print(f"  Top K: {TOP_K}")
    print(f"  Chunk Size: {CHUNK_MAX_CHARS}")
    
    print("\n🌐 API:")
    print(f"  Host: {API_HOST}")
    print(f"  Port: {API_PORT}")
    
    print("\n🗣️ Languages:")
    print(f"  Supported: {', '.join(SUPPORTED_LANGUAGES)}")
    
    print("="*60 + "\n")


if __name__ == "__main__":
    print_config()
    
    if validate_config():
        print("✅ Configuration is valid!\n")
    else:
        print("\n❌ Please fix configuration errors before running.\n")