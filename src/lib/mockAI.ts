/**
 * AI Tutor API Integration
 * Now supports TRUE offline keyword RAG fallback
 */

import { runOfflineRag } from "./offlineRag";

// =========================
// TYPES
// =========================

export interface AIResponse {
  text: string;
  isLocal: boolean;
  confidence: number;
  language: "en" | "hi" | "mr";
  processingTime?: number;
}

export interface SpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export interface RecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

// =========================
// CONFIGURATION
// =========================

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://10.33.122.128:8000/predict";

const DEFAULT_TIMEOUT = 15000;

const LANGUAGE_CODES = {
  en: "en-US",
  hi: "hi-IN",
  mr: "mr-IN",
} as const;

// =========================
// MAIN AI FUNCTION
// =========================

export async function getAIResponse(query: string): Promise<AIResponse> {
  if (!query || query.trim().length === 0) {
    throw new Error("Query cannot be empty");
  }

  const language = detectLanguage(query);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: query.trim() }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error("Server unavailable");
    }

    const data = await response.json();

    return {
      text: data.text || "No response generated",
      isLocal: data.mode === "offline",
      confidence: data.confidence || 0,
      language: data.language || language,
      processingTime: data.processing_time,
    };

  } catch (error) {
    console.log("🌐 Online failed → Switching to Offline RAG");

    // 🔥 OFFLINE FALLBACK
    const offlineResult = runOfflineRag(query);

    return {
      text: offlineResult.text,
      isLocal: true,
      confidence: offlineResult.confidence,
      language,
      processingTime: offlineResult.processingTime
    };
  }
}

// =========================
// SPEECH SYNTHESIS
// =========================

export function speakText(text: string, options: SpeechOptions = {}): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options.onError?.("Speech synthesis not supported");
    return false;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang || "en-US";
  utterance.rate = options.rate ?? 0.9;
  utterance.pitch = options.pitch ?? 1.0;

  utterance.onstart = () => options.onStart?.();
  utterance.onend = () => options.onEnd?.();
  utterance.onerror = () => options.onError?.("Speech failed");

  window.speechSynthesis.speak(utterance);
  return true;
}

export function speakResponse(
  response: AIResponse,
  options: SpeechOptions = {}
): boolean {
  const langCode = LANGUAGE_CODES[response.language] || LANGUAGE_CODES.en;
  return speakText(response.text, { ...options, lang: langCode });
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// =========================
// LANGUAGE DETECTION
// =========================

export function detectLanguage(text: string): "en" | "hi" | "mr" {
  if (/[\u0900-\u097F]/.test(text)) {
    const marathiKeywords = ["आहे", "का", "मध्ये", "सांग"];
    return marathiKeywords.some(word => text.includes(word)) ? "mr" : "hi";
  }
  return "en";
}

// =========================
// UTILITIES
// =========================

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

export function getModeDisplay(isLocal: boolean): string {
  return isLocal ? "Offline" : "Online";
}

export default {
  getAIResponse,
  speakText,
  speakResponse,
  stopSpeaking,
  isSpeechSupported,
  detectLanguage,
  formatConfidence,
  getModeDisplay,
  LANGUAGE_CODES,
};