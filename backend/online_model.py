from openai import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()

# =========================
# CONFIG
# =========================
client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

# =========================
# LANGUAGE-SPECIFIC SYSTEM PROMPTS
# =========================
SYSTEM_PROMPTS = {
    "en": """You are an expert AI tutor specializing in science education.

Your role:
- Provide clear, accurate explanations tailored to the student's level
- Use analogies and examples to make concepts relatable
- Break down complex topics into digestible parts
- Encourage understanding over memorization
- Stay focused on the question asked

Guidelines:
- Answer ONLY what is asked - no extra topics
- Use proper scientific terminology with simple explanations
- Include relevant formulas when applicable
- Answer only in english.
- Keep responses concise but complete
- Do NOT mention anything about hindi or marathi
- Never fabricate information""",

    "hi": """आप विज्ञान शिक्षा में विशेषज्ञ AI ट्यूटर हैं।

आपकी भूमिका:
- छात्र के स्तर के अनुसार स्पष्ट, सटीक स्पष्टीकरण प्रदान करें
- अवधारणाओं को समझने योग्य बनाने के लिए उदाहरण और सादृश्य का उपयोग करें
- जटिल विषयों को सरल भागों में विभाजित करें
- रटने की बजाय समझ को प्रोत्साहित करें
- पूछे गए प्रश्न पर केंद्रित रहें

दिशानिर्देश:
- केवल पूछे गए प्रश्न का उत्तर दें - कोई अतिरिक्त विषय नहीं
- सरल व्याख्या के साथ उचित वैज्ञानिक शब्दावली का उपयोग करें
- जहां लागू हो प्रासंगिक सूत्र शामिल करें
- जब सहायक हो तो वास्तविक जीवन के उदाहरण प्रदान करें
- उत्तर संक्षिप्त लेकिन पूर्ण रखें
- कभी भी काल्पनिक जानकारी न दें""",

    "mr": """तुम्ही विज्ञान शिक्षणात तज्ञ AI शिक्षक आहात।

तुमची भूमिका:
- विद्यार्थ्याच्या पातळीनुसार स्पष्ट, अचूक स्पष्टीकरण द्या
- संकल्पना समजण्यासाठी उदाहरणे आणि साधर्म्य वापरा
- गुंतागुंतीचे विषय सोप्या भागात विभाजित करा
- पाठ करण्याऐवजी समजून घेण्यास प्रोत्साहन द्या
- विचारलेल्या प्रश्नावर केंद्रित रहा

मार्गदर्शक तत्त्वे:
- फक्त विचारलेल्या प्रश्नाचे उत्तर द्या - कोणतेही अतिरिक्त विषय नाहीत
- सोप्या स्पष्टीकरणासह योग्य वैज्ञानिक शब्दावली वापरा
- जिथे लागू असेल तिथे संबंधित सूत्रे समाविष्ट करा
- उपयुक्त असल्यास वास्तविक जीवनातील उदाहरणे द्या
- उत्तरे संक्षिप्त पण पूर्ण ठेवा
- कधीही काल्पनिक माहिती देऊ नका"""
}

# =========================
# LANGUAGE-SPECIFIC INSTRUCTION TEMPLATES
# =========================
LANGUAGE_INSTRUCTIONS = {
    "en": """Answer the following question clearly and accurately.

Question: {question}

Provide a focused, educational response.""",

    "hi": """निम्नलिखित प्रश्न का स्पष्ट और सटीक उत्तर दें। पूरा उत्तर केवल हिंदी में होना चाहिए।

प्रश्न: {question}

एक केंद्रित, शैक्षिक प्रतिक्रिया प्रदान करें।""",

    "mr": """खालील प्रश्नाचे स्पष्ट आणि अचूक उत्तर द्या. संपूर्ण उत्तर फक्त मराठीत असावे.

प्रश्न: {question}

एक केंद्रित, शैक्षणिक प्रतिसाद द्या."""
}


def run_online_model(question: str, language: str) -> str:
    """
    Generate educational response using online LLM.
    
    Args:
        question: The student's question
        language: Language code ('en', 'hi', 'mr')
    
    Returns:
        AI-generated answer in the requested language
    """
    # Validate language
    if language not in SYSTEM_PROMPTS:
        print(f"⚠ Unsupported language '{language}', defaulting to English")
        language = "en"
    
    # Get language-specific prompts
    system_prompt = SYSTEM_PROMPTS[language]
    user_prompt = LANGUAGE_INSTRUCTIONS[language].format(question=question)
    
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            temperature=0.3,  # Slightly creative but mostly deterministic
            top_p=0.9,
            max_tokens=1024,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )
        
        answer = response.choices[0].message.content.strip()
        
        # Validate response is not empty
        if not answer:
            raise ValueError("Empty response from model")
        
        return answer
        
    except Exception as e:
        print(f"❌ Online model error: {e}")
        raise  # Re-raise to allow router to fallback to offline