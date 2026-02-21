from online_model import run_online_model
from offline_rag import run_offline_rag
from langdetect import detect, LangDetectException
import re
from typing import Dict, Tuple

# =========================
# LANGUAGE DETECTION
# =========================
def detect_language_robust(text: str) -> str:
    """
    Robust multilingual detection with multiple fallback strategies.
    
    Priority:
    1. Script detection (Devanagari)
    2. Keyword matching for Hindi vs Marathi
    3. langdetect library
    4. Default to English
    
    Returns:
        Language code: 'en', 'hi', or 'mr'
    """
    if not text or len(text.strip()) < 2:
        return "en"
    
    text_lower = text.lower().strip()
    
    # Check for Devanagari script (Unicode range)
    has_devanagari = bool(re.search(r'[\u0900-\u097F]', text))
    
    if has_devanagari:
        # Marathi-specific keywords and patterns
        marathi_keywords = [
            "आहे", "आहेत", "का", "कसा", "कसे", "कशी",
            "म्हणजे", "सांग", "सांगा", "समजाव", "समजावा",
            "मध्ये", "ला", "ना", "नाही", "होते"
        ]
        
        # Hindi-specific keywords
        hindi_keywords = [
            "है", "हैं", "क्या", "कैसा", "कैसे", "कैसी",
            "यानी", "बताओ", "बताइए", "समझाओ", "समझाइए",
            "में", "को", "नहीं", "था", "थी", "थे"
        ]
        
        marathi_count = sum(1 for word in marathi_keywords if word in text_lower)
        hindi_count = sum(1 for word in hindi_keywords if word in text_lower)
        
        # If clear indicator exists
        if marathi_count > hindi_count:
            return "mr"
        elif hindi_count > marathi_count:
            return "hi"
        else:
            # Default Devanagari to Hindi if unclear
            return "hi"
    
    # Try langdetect for non-Devanagari text
    try:
        detected = detect(text)
        
        # Map detected language to supported languages
        if detected in ["hi", "mr"]:
            return detected
        elif detected == "en":
            return "en"
        else:
            # Unsupported language, default to English
            return "en"
            
    except LangDetectException:
        # Detection failed, default to English
        return "en"


# =========================
# CONFIDENCE THRESHOLDS
# =========================
ONLINE_CONFIDENCE = 0.92
OFFLINE_CONFIDENCE_BASE = 0.75


# =========================
# MAIN ROUTER
# =========================
def tutor_router(question: str) -> Dict:
    """
    Route question to appropriate model (online or offline).
    
    Strategy:
    1. Always try online model first (better quality)
    2. Fallback to offline RAG if online fails
    3. Detect language and pass to both models
    
    Args:
        question: Student's question
    
    Returns:
        Dictionary with keys: mode, text, confidence, language
    """
    # Detect language
    language = detect_language_robust(question)
    
    print(f"🌐 Detected language: {language}")
    print(f"❓ Question: {question[:100]}...")
    
    # Try online model first
    try:
        print("🌍 Attempting online model...")
        answer = run_online_model(question, language)
        
        if answer and len(answer.strip()) > 10:
            print("✅ Online model succeeded")
            return {
                "mode": "online",
                "text": answer,
                "confidence": ONLINE_CONFIDENCE,
                "language": language
            }
        else:
            raise ValueError("Online response too short or empty")
    
    except Exception as e:
        print(f"⚠ Online model failed: {str(e)}")
        print("🔄 Falling back to offline RAG...")
    
    # Fallback to offline RAG
    try:
        answer = run_offline_rag(question, language)
        
        if not answer or len(answer.strip()) < 10:
            answer = get_fallback_response(language)
            confidence = 0.3
        else:
            confidence = OFFLINE_CONFIDENCE_BASE
        
        print("✅ Offline RAG completed")
        return {
            "mode": "offline",
            "text": answer,
            "confidence": confidence,
            "language": language
        }
    
    except Exception as e:
        print(f"❌ Offline RAG also failed: {str(e)}")
        
        # Last resort fallback
        return {
            "mode": "error",
            "text": get_error_response(language),
            "confidence": 0.0,
            "language": language
        }


# =========================
# FALLBACK RESPONSES
# =========================
def get_fallback_response(language: str) -> str:
    """Return appropriate fallback when no answer found."""
    fallbacks = {
        "en": "I don't have enough information to answer this question accurately. Please try rephrasing or ask something else.",
        "hi": "मेरे पास इस प्रश्न का सटीक उत्तर देने के लिए पर्याप्त जानकारी नहीं है। कृपया दूसरे शब्दों में पूछें या कुछ और पूछें।",
        "mr": "माझ्याकडे या प्रश्नाचे अचूक उत्तर देण्यासाठी पुरेशी माहिती नाही. कृपया दुसऱ्या शब्दात विचारा किंवा काहीतरी वेगळे विचारा."
    }
    return fallbacks.get(language, fallbacks["en"])


def get_error_response(language: str) -> str:
    """Return appropriate error response."""
    errors = {
        "en": "I'm unable to process your question right now. Please try again later.",
        "hi": "मैं अभी आपके प्रश्न को संसाधित करने में असमर्थ हूं। कृपया बाद में पुनः प्रयास करें।",
        "mr": "मी आत्ता तुमचा प्रश्न प्रक्रिया करू शकत नाही. कृपया नंतर पुन्हा प्रयत्न करा."
    }
    return errors.get(language, errors["en"])


# =========================
# TESTING
# =========================
if __name__ == "__main__":
    # Test questions
    test_questions = [
        "What is force?",
        "बल क्या है?",
        "जडत्व म्हणजे काय?",
        "Explain Newton's first law",
        "गुरुत्वाकर्षण बल समझाइए"
    ]
    
    for q in test_questions:
        print("\n" + "="*60)
        result = tutor_router(q)
        print(f"\nMode: {result['mode']}")
        print(f"Language: {result['language']}")
        print(f"Confidence: {result['confidence']}")
        print(f"Answer: {result['text'][:200]}...")