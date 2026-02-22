import json
import re

INPUT_PATH = "vector_store/science_marathi.json"
OUTPUT_PATH = "vector_store/science_marathi_clean.json"


def clean_text(text: str) -> str:

    # Fix common OCR errors
    replacements = {
        "सृष्ी": "सृष्टी",
        "वन्पती": "वनस्पती",
        "प्रोलट्टा": "प्रोटिस्टा",
        "कवके": "कवके",
        "लवषाणू": "विषाणू",
        "लवभार्णी": "विभागणी",
        "लललहताना": "लिहिताना",
        "सव्व": "सर्व",
        "द्वहटाकर": "व्हिटेकर",
        "आलदकेंद्रकी": "आदिकेंद्रकी",
        "दृश्केंद्रकी": "दृश्यकेंद्रकी",
    }

    for wrong, correct in replacements.items():
        text = text.replace(wrong, correct)

    # Remove extra symbols
    text = re.sub(r"[•]", "", text)
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def clean_json():
    with open(INPUT_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    cleaned = []

    for item in data:
        cleaned.append({
            "id": item["id"],
            "content": clean_text(item["content"])
        })

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(cleaned, f, ensure_ascii=False, indent=2)

    print("✅ Cleaned Marathi JSON saved.")


if __name__ == "__main__":
    clean_json()