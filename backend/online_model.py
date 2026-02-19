from openai import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()

# =========================
# CONFIG
# =========================
client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),  # 🔒 Use environment variable
    base_url="https://api.groq.com/openai/v1"
)

SYSTEM_PROMPT = """
You are an intelligent AI tutor.

- Answer only what the user asks.
- Do not add unrelated commentary.
- Do not reference previous conversations.
- Keep explanations clear and structured.
- Do not fabricate facts or formulas.
"""

def run_online_model(question: str, language: str) -> str:

    # 🔒 Strict language forcing
    if language == "hi":
        prefix = "उत्तर हिंदी में दें:"
    elif language == "mr":
        prefix = "मराठीत उत्तर द्या:"
    else:
        prefix = "Answer in English:"

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        temperature=0.0,   # deterministic
        top_p=1,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"""{prefix}

Answer strictly and directly.
Do not add unrelated commentary.

Question:
{question}
"""
            }
        ]
    )

    return response.choices[0].message.content.strip()
