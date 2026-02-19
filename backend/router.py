from online_model import run_online_model
from offline_rag import run_offline_rag
from langdetect import detect
import re

def detect_language_robust(text: str) -> str:
    """
    Robust multilingual detection:
    - Prioritize script detection (Devanagari)
    - Handle mixed language safely
    - Fallback to langdetect
    """

    if not text or len(text.strip()) < 3:
        return "en"

    # 🔹 If Devanagari characters exist → could be Hindi or Marathi
    if re.search(r'[\u0900-\u097F]', text):
        # Basic Marathi keyword detection
        marathi_keywords = ["आहे", "का", "मध्ये", "म्हणजे", "सांग", "समजाव"]
        if any(word in text for word in marathi_keywords):
            return "mr"
        return "hi"

    # 🔹 If purely Latin script → likely English
    try:
        detected = detect(text)
    except:
        return "en"

    if detected not in ["en", "hi", "mr"]:
        return "en"

    return detected


def tutor_router(question: str) -> dict:
    language = detect_language_robust(question)

    try:
        answer = run_online_model(question, language)

        return {
            "mode": "online",
            "text": answer,
            "confidence": 0.95
        }

    except Exception as e:
        print("⚠ Online model failed. Switching to offline RAG.")
        print("Error:", str(e))

        answer = run_offline_rag(question, language)

        return {
            "mode": "offline",
            "text": answer,
            "confidence": 0.80
        }
