// offlineRag.ts
// Optimized Offline RAG with TF-IDF + Sentence-Level Extraction

import documents from "../assets/documents.json";

// -----------------------------
// STOPWORDS
// -----------------------------
const STOPWORDS = new Set([
  "is","are","was","were","the","a","an",
  "what","why","how","when","where",
  "and","or","of","to","in","on","for",
  "with","from","that","this",

  // Hindi
  "क्या","कैसे","क्यों","है","में","और","का","की","के",

  // Marathi
  "आहे","का","मध्ये","आणि","की","चे","चा"
]);

// -----------------------------
// TOKENIZER
// -----------------------------
function tokenize(text: string): string[] {
  const words = text.toLowerCase().match(/\w+/g);
  if (!words) return [];
  return words.filter(w => !STOPWORDS.has(w) && w.length > 2);
}

// -----------------------------
// SENTENCE SPLITTER
// -----------------------------
function splitSentences(text: string): string[] {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 40);
}

// -----------------------------
// TF-IDF MODEL
// -----------------------------

interface DocumentVector {
  content: string;
  tfidf: Map<string, number>;
  norm: number;
}

let docVectors: DocumentVector[] = [];
let idfMap: Map<string, number> = new Map();

function buildTfIdf() {
  const N = documents.length;
  const dfCount: Map<string, number> = new Map();
  const termCounts: Map<string, number>[] = [];

  documents.forEach((doc: any) => {
    const tokens = tokenize(doc.content);
    const termCount: Map<string, number> = new Map();

    tokens.forEach(term => {
      termCount.set(term, (termCount.get(term) || 0) + 1);
    });

    termCounts.push(termCount);

    const unique = new Set(tokens);
    unique.forEach(term => {
      dfCount.set(term, (dfCount.get(term) || 0) + 1);
    });
  });

  dfCount.forEach((df, term) => {
    idfMap.set(term, Math.log(N / (1 + df)));
  });

  docVectors = termCounts.map((termCount, index) => {
    const tfidf = new Map<string, number>();
    let norm = 0;

    termCount.forEach((tf, term) => {
      const idf = idfMap.get(term) || 0;
      const weight = tf * idf;
      tfidf.set(term, weight);
      norm += weight * weight;
    });

    return {
      content: documents[index].content,
      tfidf,
      norm: Math.sqrt(norm)
    };
  });

  console.log("✅ TF-IDF model ready");
}

buildTfIdf();

// -----------------------------
// COSINE SIMILARITY
// -----------------------------
function cosineSimilarity(
  queryVector: Map<string, number>,
  queryNorm: number,
  tfidf: Map<string, number>,
  docNorm: number
): number {
  let dot = 0;

  queryVector.forEach((value, term) => {
    if (tfidf.has(term)) {
      dot += value * (tfidf.get(term) || 0);
    }
  });

  if (queryNorm === 0 || docNorm === 0) return 0;

  return dot / (queryNorm * docNorm);
}

// -----------------------------
// MAIN FUNCTION
// -----------------------------
export function runOfflineRag(question: string) {

  const start = Date.now();
  const tokens = tokenize(question);

  if (tokens.length === 0) {
    return {
      text: "No meaningful keywords found.",
      confidence: 0,
      processingTime: 0
    };
  }

  // Build query vector
  const queryCount = new Map<string, number>();
  tokens.forEach(term => {
    queryCount.set(term, (queryCount.get(term) || 0) + 1);
  });

  const queryVector = new Map<string, number>();
  let queryNorm = 0;

  queryCount.forEach((tf, term) => {
    const idf = idfMap.get(term) || 0;
    const weight = tf * idf;
    queryVector.set(term, weight);
    queryNorm += weight * weight;
  });

  queryNorm = Math.sqrt(queryNorm);

  // Rank top 3 chunks
  const rankedChunks = docVectors
    .map(doc => ({
      content: doc.content,
      score: cosineSimilarity(queryVector, queryNorm, doc.tfidf, doc.norm)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Extract sentences from top chunks
  const allSentences: { sentence: string; score: number }[] = [];

  rankedChunks.forEach(chunk => {
    const sentences = splitSentences(chunk.content);

    sentences.forEach(sentence => {
      const sentenceTokens = tokenize(sentence);

      let sentenceScore = 0;
      sentenceTokens.forEach(term => {
        if (queryVector.has(term)) {
          sentenceScore += queryVector.get(term) || 0;
        }
      });

      if (sentenceScore > 0) {
        allSentences.push({
          sentence,
          score: sentenceScore
        });
      }
    });
  });

  if (allSentences.length === 0) {
    return {
      text: "I don't have information about this in my materials.",
      confidence: 0.2,
      processingTime: Date.now() - start
    };
  }

  // Sort sentences
  allSentences.sort((a, b) => b.score - a.score);

  // Pick top 4 sentences
  const bestSentences = allSentences
    .slice(0, 4)
    .map(s => s.sentence);

  const finalAnswer = bestSentences.join(" ");

  const confidence = Math.min(1, rankedChunks[0].score);

  return {
    text: finalAnswer,
    confidence,
    processingTime: Date.now() - start
  };
}