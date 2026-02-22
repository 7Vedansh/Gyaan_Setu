// offlineRag.ts
// Stable Multilingual Offline RAG (Expo Safe Version)

import science_marathi from "../assets/science_marathi_clean.json";
import science from "../assets/science.json";

/* =====================================================
   1️⃣ LANGUAGE DETECTOR
===================================================== */

function detectLanguageFromScript(text: string): "english" | "marathi" {
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  return hasDevanagari ? "marathi" : "english";
}

/* =====================================================
   2️⃣ STOPWORDS
===================================================== */

const STOPWORDS = new Set([
  // English
  "is",
  "are",
  "was",
  "were",
  "the",
  "a",
  "an",
  "what",
  "why",
  "how",
  "when",
  "where",
  "and",
  "or",
  "of",
  "to",
  "in",
  "on",
  "for",
  "with",
  "from",
  "that",
  "this",

  // Hindi
  "क्या",
  "कैसे",
  "क्यों",
  "है",
  "में",
  "और",
  "का",
  "की",
  "के",

  // Marathi
  "आहे",
  "का",
  "मध्ये",
  "आणि",
  "की",
  "चे",
  "चा",
]);

/* =====================================================
   3️⃣ TOKENIZER (React Native SAFE)
===================================================== */
/*
  This tokenizer works safely in Expo/Hermes.
  It explicitly supports:
  - English letters
  - Numbers
  - Devanagari characters
*/

function tokenize(text: string): string[] {
  const words = text.toLowerCase().match(/[\u0900-\u097Fa-z0-9]+/g);

  if (!words) return [];

  return words.filter((w) => !STOPWORDS.has(w) && w.length > 2);
}

/* =====================================================
   4️⃣ SENTENCE SPLITTER
===================================================== */

function splitSentences(text: string): string[] {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40);
}

/* =====================================================
   5️⃣ TF-IDF MODEL BUILDER
===================================================== */

interface DocumentVector {
  content: string;
  tfidf: Map<string, number>;
  norm: number;
}

interface TfIdfModel {
  docVectors: DocumentVector[];
  idfMap: Map<string, number>;
}

function buildTfIdfModel(docs: any[]): TfIdfModel {
  const N = docs.length;

  const dfCount: Map<string, number> = new Map();
  const termCounts: Map<string, number>[] = [];

  docs.forEach((doc) => {
    const tokens = tokenize(doc.content);
    const termCount: Map<string, number> = new Map();

    tokens.forEach((term) => {
      termCount.set(term, (termCount.get(term) || 0) + 1);
    });

    termCounts.push(termCount);

    const uniqueTerms = new Set(tokens);
    uniqueTerms.forEach((term) => {
      dfCount.set(term, (dfCount.get(term) || 0) + 1);
    });
  });

  const idfMap: Map<string, number> = new Map();
  dfCount.forEach((df, term) => {
    idfMap.set(term, Math.log(N / (1 + df)));
  });

  const docVectors: DocumentVector[] = termCounts.map((termCount, index) => {
    const tfidf = new Map<string, number>();
    let norm = 0;

    termCount.forEach((tf, term) => {
      const idf = idfMap.get(term) || 0;
      const weight = tf * idf;
      tfidf.set(term, weight);
      norm += weight * weight;
    });

    return {
      content: docs[index].content,
      tfidf,
      norm: Math.sqrt(norm),
    };
  });

  return { docVectors, idfMap };
}

/* =====================================================
   6️⃣ BUILD SEPARATE LANGUAGE MODELS
===================================================== */

const englishModel = buildTfIdfModel(science);
const marathiModel = buildTfIdfModel(science_marathi);

console.log("English docs:", englishModel.docVectors.length);
console.log("Marathi docs:", marathiModel.docVectors.length);

/* =====================================================
   7️⃣ COSINE SIMILARITY
===================================================== */

function cosineSimilarity(
  queryVector: Map<string, number>,
  queryNorm: number,
  docVector: Map<string, number>,
  docNorm: number
): number {
  let dot = 0;

  queryVector.forEach((value, term) => {
    if (docVector.has(term)) {
      dot += value * (docVector.get(term) || 0);
    }
  });

  if (queryNorm === 0 || docNorm === 0) return 0;

  return dot / (queryNorm * docNorm);
}

/* =====================================================
   8️⃣ MAIN FUNCTION
===================================================== */

export function runOfflineRag(question: string) {
  const start = Date.now();
  const detectedLanguage = detectLanguageFromScript(question);

  const model = detectedLanguage === "marathi" ? marathiModel : englishModel;

  const tokens = tokenize(question);

  if (tokens.length === 0) {
    return {
      text:
        detectedLanguage === "marathi"
          ? "कृपया अर्थपूर्ण प्रश्न विचारा."
          : "Please ask a meaningful question.",
      confidence: 0,
      processingTime: 0,
    };
  }

  // Build query vector
  const queryCount = new Map<string, number>();
  tokens.forEach((term) => {
    queryCount.set(term, (queryCount.get(term) || 0) + 1);
  });

  const queryVector = new Map<string, number>();
  let queryNorm = 0;

  queryCount.forEach((tf, term) => {
    const idf = model.idfMap.get(term) || 0;
    const weight = tf * idf;
    queryVector.set(term, weight);
    queryNorm += weight * weight;
  });

  queryNorm = Math.sqrt(queryNorm);

  const rankedChunks = model.docVectors
    .map((doc) => ({
      content: doc.content,
      score: cosineSimilarity(queryVector, queryNorm, doc.tfidf, doc.norm),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (rankedChunks.length === 0 || rankedChunks[0].score === 0) {
    return {
      text:
        detectedLanguage === "marathi"
          ? "माझ्या सामग्रीमध्ये या प्रश्नाचे उत्तर उपलब्ध नाही."
          : "I don't have information about this in my materials.",
      confidence: 0.2,
      processingTime: Date.now() - start,
    };
  }

  const allSentences: { sentence: string; score: number }[] = [];

  rankedChunks.forEach((chunk) => {
    const sentences = splitSentences(chunk.content);

    sentences.forEach((sentence) => {
      const sentenceTokens = tokenize(sentence);

      let score = 0;

      sentenceTokens.forEach((term) => {
        if (queryVector.has(term)) {
          score += queryVector.get(term) || 0;
        }
      });

      if (score > 0) {
        allSentences.push({ sentence, score });
      }
    });
  });

  allSentences.sort((a, b) => b.score - a.score);

  const bestSentences = allSentences.slice(0, 4).map((s) => s.sentence);

  const finalAnswer = bestSentences.join(" ");

  return {
    text: finalAnswer,
    confidence: Math.min(1, rankedChunks[0].score),
    processingTime: Date.now() - start,
  };
}
