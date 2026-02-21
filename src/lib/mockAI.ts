/**
 * AI Tutor API Integration
 * Supports multilingual AI responses with offline fallback
 *
 * Note: Requires speech-api.d.ts for Web Speech API types
 */

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

// Update with your server IP for physical device testing
// Find your IP: ipconfig (Windows) or ifconfig (Mac/Linux)
const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/predict";

const DEFAULT_TIMEOUT = 30000; // 30 seconds

// Language codes for speech synthesis
const LANGUAGE_CODES = {
  en: "en-US",
  hi: "hi-IN",
  mr: "mr-IN",
} as const;

// =========================
// API FUNCTIONS
// =========================

/**
 * Send question to AI tutor and get response
 * Automatically detects language and routes to appropriate model
 */
export async function getAIResponse(query: string): Promise<AIResponse> {
  if (!query || query.trim().length === 0) {
    throw new Error("Query cannot be empty");
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: query.trim() }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 422) {
        throw new Error("Invalid query format");
      } else if (response.status === 500) {
        throw new Error("Server error - try again");
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    }

    const data = await response.json();

    return {
      text: data.text || "No response generated",
      isLocal: data.mode === "offline",
      confidence: data.confidence || 0,
      language: data.language || "en",
      processingTime: data.processing_time,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout - server took too long");
      } else if (error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to AI server. Please check your connection."
        );
      }
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
}

/**
 * Test API connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const baseUrl = API_URL.replace("/predict", "");
    const response = await fetch(`${baseUrl}/`, {
      method: "GET",
    });
    return response.ok;
  } catch {
    return false;
  }
}

// =========================
// SPEECH SYNTHESIS
// =========================

/**
 * Convert text to speech
 * Supports multiple languages
 */
export function speakText(text: string, options: SpeechOptions = {}): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options.onError?.("Speech synthesis not supported in this environment");
    return false;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // Set language (default to English)
  utterance.lang = options.lang || "en-US";

  // Set speech parameters
  utterance.rate = options.rate ?? 0.9;
  utterance.pitch = options.pitch ?? 1.0;
  utterance.volume = 1.0;

  // Event handlers
  utterance.onstart = () => options.onStart?.();
  utterance.onend = () => options.onEnd?.();
  utterance.onerror = (event) => {
    console.error("Speech synthesis error:", event);
    options.onError?.("Failed to speak text");
  };

  window.speechSynthesis.speak(utterance);
  return true;
}

/**
 * Speak AI response with automatic language detection
 */
export function speakResponse(
  response: AIResponse,
  options: SpeechOptions = {}
): boolean {
  const langCode = LANGUAGE_CODES[response.language] || LANGUAGE_CODES.en;

  return speakText(response.text, {
    ...options,
    lang: langCode,
  });
}

/**
 * Stop any ongoing speech
 */
export function stopSpeaking(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }
  window.speechSynthesis.cancel();
}

/**
 * Check if speech synthesis is supported
 */
export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// =========================
// SPEECH RECOGNITION
// =========================

/**
 * Start listening for speech input
 * Returns a cleanup function to stop listening
 */
export function startListening(
  onResult: (text: string) => void,
  onError: (error: string) => void,
  options: RecognitionOptions = {}
): (() => void) | null {
  if (typeof window === "undefined") {
    onError("Speech recognition not available in this environment");
    return null;
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError("Speech recognition not supported in this browser");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = options.continuous ?? false;
  recognition.interimResults = options.interimResults ?? true;
  recognition.lang = options.lang || "en-US";

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join("");

    onResult(transcript);
  };

  recognition.onerror = (event) => {
    const errorMessage = event.error || "Speech recognition error";
    onError(errorMessage);
  };

  recognition.onend = () => {
    // Recognition stopped
  };

  try {
    recognition.start();
  } catch (error) {
    onError("Failed to start speech recognition");
    return null;
  }

  // Return cleanup function
  return () => {
    try {
      recognition.stop();
    } catch (error) {
      // Already stopped
    }
  };
}

/**
 * Start listening with language-specific recognition
 */
export function startListeningWithLanguage(
  language: "en" | "hi" | "mr",
  onResult: (text: string) => void,
  onError: (error: string) => void
): (() => void) | null {
  const langCode = LANGUAGE_CODES[language];

  return startListening(onResult, onError, {
    lang: langCode,
    continuous: false,
    interimResults: true,
  });
}

/**
 * Check if speech recognition is supported
 */
export function isRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;

  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

// =========================
// UTILITY FUNCTIONS
// =========================

/**
 * Get language display name
 */
export function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    en: "English",
    hi: "हिंदी (Hindi)",
    mr: "मराठी (Marathi)",
  };
  return names[code] || code;
}

/**
 * Format confidence as percentage
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

/**
 * Get mode display text
 */
export function getModeDisplay(isLocal: boolean): string {
  return isLocal ? "Offline" : "Online";
}

/**
 * Detect language from text (basic client-side detection)
 */
export function detectLanguage(text: string): "en" | "hi" | "mr" {
  // Devanagari script detection
  if (/[\u0900-\u097F]/.test(text)) {
    // Basic Marathi keyword detection
    const marathiKeywords = ["आहे", "का", "म्हणजे", "सांग", "मध्ये"];
    const hasMarathi = marathiKeywords.some((word) => text.includes(word));
    return hasMarathi ? "mr" : "hi";
  }
  return "en";
}

// =========================
// EXPORTS
// =========================

export default {
  // API
  getAIResponse,
  testConnection,

  // Speech Synthesis
  speakText,
  speakResponse,
  stopSpeaking,
  isSpeechSupported,

  // Speech Recognition
  startListening,
  startListeningWithLanguage,
  isRecognitionSupported,

  // Utilities
  getLanguageName,
  formatConfidence,
  getModeDisplay,
  detectLanguage,

  // Constants
  API_URL,
  LANGUAGE_CODES,
};
