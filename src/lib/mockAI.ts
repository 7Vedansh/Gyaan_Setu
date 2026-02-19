export interface AIResponse {
  text: string;
  isLocal: boolean;
  confidence: number;
}

const API_URL = "http://localhost:8000/predict";
// If using physical phone replace localhost with your PC IP
// Example: http://192.168.1.5:8000/predict

export async function getAIResponse(
  query: string
): Promise<AIResponse> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error("Server error");
    }

    const data = await response.json();

    return {
      text: data.text,
      isLocal: data.mode === "offline",
      confidence: data.confidence,
    };
  } catch (error) {
    console.error("Backend connection failed:", error);

    return {
      text: "⚠ Unable to connect to AI server.",
      isLocal: true,
      confidence: 0,
    };
  }
}

export function speakText(
  text: string,
  options?: {
    lang?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  }
): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options?.onError?.("Speech synthesis is not supported in this environment.");
    return false;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options?.lang ?? "en-US";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.onstart = () => options?.onStart?.();
  utterance.onend = () => options?.onEnd?.();
  utterance.onerror = () =>
    options?.onError?.("Speech synthesis failed to play.");

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }
  window.speechSynthesis.cancel();
}

export function startListening(
  onResult: (text: string) => void,
  onError: (error: string) => void,
  lang: string = "en-US"
): (() => void) | null {
  if (typeof window === "undefined") {
    onError("Speech recognition is not available in this environment.");
    return null;
  }

  const SpeechRecognition =
    // @ts-expect-error - SpeechRecognition is not in the default DOM typings
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError("Speech recognition is not supported in this browser.");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = lang;

  recognition.onresult = (event: any) => {
    const transcript = Array.from(event.results)
      .map((result: any) => result[0].transcript)
      .join("");
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    onError(event.error ?? "Speech recognition error.");
  };

  recognition.start();

  return () => {
    recognition.stop();
  };
}
