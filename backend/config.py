"""
Centralized configuration for AI Tutor System
Keyword-Based Offline RAG + Optional Online Model
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# =========================
# LOAD ENV VARIABLES
# =========================
load_dotenv()

# =========================
# PATHS
# =========================
BASE_DIR = Path(__file__).parent
DOCS_DIR = BASE_DIR / "docs"
VECTOR_DIR = BASE_DIR / "vector_store"

DOCS_DIR.mkdir(exist_ok=True)
VECTOR_DIR.mkdir(exist_ok=True)

# =========================
# DOCUMENT PROCESSING
# =========================
PDF_PATH = os.getenv("PDF_PATH", str(DOCS_DIR / "science.pdf"))
DOCUMENTS_JSON = VECTOR_DIR / "documents.json"

CHUNK_MAX_CHARS = int(os.getenv("CHUNK_MAX_CHARS", "2000"))
CHUNK_NEW_AFTER = int(os.getenv("CHUNK_NEW_AFTER", "1500"))
CHUNK_COMBINE_UNDER = int(os.getenv("CHUNK_COMBINE_UNDER", "500"))

# =========================
# ONLINE MODEL (Groq)
# =========================
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_BASE_URL = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
ONLINE_MODEL = os.getenv("ONLINE_MODEL", "llama-3.1-8b-instant")

ONLINE_TEMPERATURE = float(os.getenv("ONLINE_TEMPERATURE", "0.3"))
ONLINE_TOP_P = float(os.getenv("ONLINE_TOP_P", "0.9"))
ONLINE_MAX_TOKENS = int(os.getenv("ONLINE_MAX_TOKENS", "1024"))

# =========================
# RAG CONFIGURATION
# =========================
TOP_K = int(os.getenv("TOP_K", "3"))

ONLINE_CONFIDENCE = float(os.getenv("ONLINE_CONFIDENCE", "0.92"))
OFFLINE_CONFIDENCE_BASE = float(os.getenv("OFFLINE_CONFIDENCE_BASE", "0.75"))

# =========================
# API SERVER
# =========================
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
API_RELOAD = os.getenv("API_RELOAD", "false").lower() == "true"

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# =========================
# LANGUAGE SUPPORT
# =========================
SUPPORTED_LANGUAGES = ["en", "hi", "mr"]
DEFAULT_LANGUAGE = "en"

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

    # Online mode warning only
    if not GROQ_API_KEY:
        print("⚠ Warning: GROQ_API_KEY not set. Online mode will not work.")

    # Offline keyword RAG requires documents.json
    if not DOCUMENTS_JSON.exists():
        errors.append(
            f"Keyword RAG data not found.\n"
            f"Run: python ingest.py\n"
            f"Expected file: {DOCUMENTS_JSON}"
        )

    if errors:
        print("\n❌ Configuration Errors:")
        for error in errors:
            print(f"  - {error}")
        return False

    return True


def print_config():
    """Print current configuration."""
    print("\n" + "=" * 60)
    print("AI TUTOR CONFIGURATION (Keyword Offline RAG)")
    print("=" * 60)

    print("\n📄 Documents:")
    print(f"  PDF Path: {PDF_PATH}")
    print(f"  Documents JSON: {DOCUMENTS_JSON}")

    print("\n🌍 Online Model:")
    print(f"  Model: {ONLINE_MODEL}")
    print(f"  API Key Set: {'Yes' if GROQ_API_KEY else 'No'}")

    print("\n🔍 RAG:")
    print(f"  Top K: {TOP_K}")
    print(f"  Chunk Size: {CHUNK_MAX_CHARS}")

    print("\n🌐 API:")
    print(f"  Host: {API_HOST}")
    print(f"  Port: {API_PORT}")

    print("\n🗣️ Languages:")
    print(f"  Supported: {', '.join(SUPPORTED_LANGUAGES)}")

    print("=" * 60 + "\n")


if __name__ == "__main__":
    print_config()

    if validate_config():
        print("✅ Configuration is valid!\n")
    else:
        print("\n❌ Please fix configuration errors before running.\n")