# offline_rag.py
import json
import re
import os
from collections import Counter

VECTOR_FOLDER = "vector_store"
TOP_K = 3

print("🔁 Loading Keyword-Based Offline RAG...")

documents = []

# ---------------------------
# LOAD ALL JSON FILES
# ---------------------------
if not os.path.exists(VECTOR_FOLDER):
    raise FileNotFoundError("❌ vector_store folder not found.")

for file in os.listdir(VECTOR_FOLDER):
    if file.endswith(".json"):
        path = os.path.join(VECTOR_FOLDER, file)
        subject_name = os.path.splitext(file)[0]

        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

            for item in data:
                documents.append({
                    "subject": subject_name,
                    "content": item["content"]
                })

print(f"✅ Loaded {len(documents)} total chunks from all subjects")


# ---------------------------
# STOPWORDS
# ---------------------------
STOPWORDS = set([
    "is", "are", "was", "were", "the", "a", "an",
    "what", "why", "how", "when", "where",
    "and", "or", "of", "to", "in", "on", "for",
    "क्या", "कैसे", "क्यों", "है", "में",
    "आहे", "का", "मध्ये"
])


def tokenize(text: str):
    text = text.lower()
    words = re.findall(r'\w+', text)
    return [w for w in words if w not in STOPWORDS and len(w) > 2]


def keyword_score(question_words, chunk_text):
    chunk_words = tokenize(chunk_text)
    counter = Counter(chunk_words)
    score = 0
    for word in question_words:
        score += counter[word]
    return score


def retrieve_context(question: str, subject: str = None):
    question_words = tokenize(question)

    if not question_words:
        return "", 0.0

    scores = []

    for doc in documents:

        # If subject filtering is enabled
        if subject and doc["subject"] != subject:
            continue

        score = keyword_score(question_words, doc["content"])
        scores.append((score, doc["content"]))

    if not scores:
        return "", 0.0

    scores.sort(reverse=True, key=lambda x: x[0])

    top_chunks = [c for s, c in scores[:TOP_K] if s > 0]

    if not top_chunks:
        return "", 0.0

    confidence = min(1.0, scores[0][0] / len(question_words))

    context = "\n\n---\n\n".join(top_chunks)

    return context, confidence


def generate_answer(context: str, question: str, language: str):
    if not context:
        return None

    # Keep simple structured answer for offline mode
    return context


def run_offline_rag(question: str, language: str, subject: str = None):

    context, confidence = retrieve_context(question, subject)

    if not context:
        return None

    answer = generate_answer(context, question, language)

    return answer